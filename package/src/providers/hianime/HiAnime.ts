import { load, type Cheerio } from "cheerio";
import { BaseProvider } from "../../base/BaseProvider.js";
import { HttpClient } from "../../base/HttpClient.js";
import { ExtensionsError, throwExtensionsError } from "../../base/ExtensionsError.js";
import type {
    HomePage,
    AnimeCard,
    TrendingAnime,
    Top10Anime,
    SpotlightAnime,
    EpisodeCounts,
    AZListResult,
    AZListSortOption,
    QtipInfo,
    AnimeAboutInfo,
    AnimeCategoryResult,
    AnimeCategory,
    AnimeGenreResult,
    AnimeProducerResult,
    EstimatedSchedule,
    AnimeSearchResult,
    AnimeSearchSuggestion,
    SearchFilters,
    AnimeEpisodes,
    NextEpisodeSchedule,
    EpisodeServers,
    EpisodeSources,
    EpisodeCategory,
    AnimeServer,
} from "../../types/hianime.js";

// ── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = "https://hianime.at";
const AJAX_URL = `${BASE_URL}/ajax`;
 
export const Servers = {
    VidStreaming: "vidstreaming",
    MegaCloud: "megacloud",
    StreamSB: "streamsb",
    StreamTape: "streamtape",
    Alt: "hd-1",
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractId(href: string | undefined): string {
    if (!href) return "";
    return href.split("/").pop()?.split("?")[0] ?? "";
}

function parseEpisodeCounts($el: any): EpisodeCounts {
    const sub = parseInt($el.find(".sub").text().trim()) || null;
    const dub = parseInt($el.find(".dub").text().trim()) || null;
    return { sub, dub };
}

function parseAnimeCard(
    $: any,
    el: any
): AnimeCard {
    const $el = $(el);
    const $a = $el.find("a.film-poster-ahref, a[href*='/']").first();
    const href = $a.attr("href") ?? "";

    return {
        id: extractId(href) || ($el.attr("data-id") ?? ""),
        name:
            $el.find(".film-name a, .film-detail .film-name").first().text().trim() ||
            $el.find(".film-name").first().text().trim(),
        jname:
            $el
                .find(".film-name a[data-jname], [data-jname]")
                .first()
                .attr("data-jname") ?? undefined,
        poster:
            $el.find("img.film-poster-img, img.lazyload").first().attr("data-src") ??
            $el.find("img").first().attr("src") ??
            "",
        duration: $el.find(".fdi-duration").text().trim() || undefined,
        type:
            $el.find(".fdi-type, .tick-quality").text().trim() ||
            undefined,
        rating: $el.find(".tick-rate").text().trim() || undefined,
        episodes: {
            sub: parseInt($el.find(".tick-sub").text().trim()) || null,
            dub: parseInt($el.find(".tick-dub").text().trim()) || null,
        },
    };
}

// ── Provider ─────────────────────────────────────────────────────────────────

/**
 * HiAnime (hianime.al) scraper.
 *
 * Scrapes anime data directly from the website HTML and JSON endpoints.
 *
 * @example
 * ```ts
 * import { ANIME } from "@genga-movie/aniwatch";
 *
 * const hianime = new ANIME.HiAnime();
 *
 * // Get home page data
 * const home = await hianime.getHomePage();
 *
 * // Search for anime
 * const results = await hianime.search("attack on titan");
 *
 * // Get streaming links
 * const sources = await hianime.getEpisodeSources("steinsgate-3?ep=230", "hd-1", "sub");
 * ```
 */
export class HiAnime extends BaseProvider {
    readonly id = "hianime" as const;
    readonly name = "HiAnime (hianime.at)" as const;
    readonly baseUrl = BASE_URL;
    readonly version = "1.0.0" as const;
    readonly isWorking = true;

    private http: HttpClient;

    constructor() {
        super();
        this.http = new HttpClient(this.id, {
            baseURL: BASE_URL,
            timeout: 30_000,
            headers: {
                Referer: BASE_URL,
                Origin: BASE_URL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "max-age=0",
            },
        });
    }

    // ── Home Page ──────────────────────────────────────────────────────────────

    /**
     * Get the home page with spotlight, trending, top 10 animes, and more.
     *
     * @example
     * ```ts
     * const data = await hianime.getHomePage();
     * console.log(data.spotlightAnimes);
     * ```
     */
    async getHomePage(): Promise<HomePage> {
        try {
            const { data: html } = await this.http.get<string>("/home");
            const $ = load(html);

            // Spotlight
            const spotlightAnimes: SpotlightAnime[] = [];
            $("#slider .swiper-slide").each((_: any, el: any) => {
                const $el = $(el);
                const href = $el.find("a.btn-play, a.slideshow-buttons-link").first().attr("href") ?? "";
                spotlightAnimes.push({
                    id: extractId(href),
                    name: $el.find(".desi-head-title").text().trim(),
                    jname: $el.find(".desi-head-title").attr("data-jname") ?? "",
                    poster:
                        $el.find(".film-poster img").attr("data-src") ??
                        $el.find(".film-poster img").attr("src") ??
                        "",
                    description: $el.find(".desi-description").text().trim(),
                    rank: parseInt($el.find(".desi-sub-text").text().replace(/\D/g, "")) || 0,
                    otherInfo: $el
                        .find(".sc-detail .scd-item")
                        .map((_: any, i: any) => $(i).text().trim())
                        .get()
                        .filter(Boolean),
                    episodes: {
                        sub: parseInt($el.find(".tick-sub").text()) || null,
                        dub: parseInt($el.find(".tick-dub").text()) || null,
                    },
                });
            });

            // Trending
            const trendingAnimes: TrendingAnime[] = [];
            $("#trending-home .swiper-slide").each((_: any, el: any) => {
                const $el = $(el);
                const href = $el.find("a").attr("href") ?? "";
                trendingAnimes.push({
                    id: extractId(href),
                    name: $el.find(".film-title, .number").text().trim(),
                    poster:
                        $el.find("img").attr("data-src") ??
                        $el.find("img").attr("src") ??
                        "",
                    rank: parseInt($el.find(".number span").text()) || 0,
                });
            });

            // Anime sections
            const sections: Record<string, AnimeCard[]> = {};
            const sectionConfig: Array<{key: string, heading: string}> = [
                { key: "latestEpisodeAnimes", heading: "Latest Episode" },
                { key: "topUpcomingAnimes", heading: "Top Upcoming" },
                { key: "topAiringAnimes", heading: "Top Airing" },
                { key: "mostPopularAnimes", heading: "Most Popular" },
                { key: "mostFavoriteAnimes", heading: "Most Favorite" },
                { key: "latestCompletedAnimes", heading: "Latest Completed" },
            ];

            for (const { key, heading } of sectionConfig) {
                sections[key] = [];
                // Search for heading, then find the container
                const $heading = $(`.block_area-header h2:contains("${heading}"), .cat-heading:contains("${heading}"), .anif-block-header:contains("${heading}")`).first();
                if ($heading.length) {
                    const $block = $heading.closest(".block_area, .anif-block");
                    $block.find(".flw-item, li, .item").each((_: any, el: any) => {
                        // Avoid duplicates if multiple selectors match or nested items
                        if (($(el).find(".film-name").length || $(el).hasClass("flw-item") || $(el).find(".film-poster").length) && !($(el).parents(".flw-item, li, .item").length)) {
                            sections[key].push(parseAnimeCard($, el));
                        }
                    });
                }
            }

            // Top 10
            const top10Animes: HomePage["top10Animes"] = {
                today: [],
                week: [],
                month: [],
            };
            const periods: Array<["today" | "week" | "month", string]> = [
                ["today", "#top-viewed-day"],
                ["week", "#top-viewed-week"],
                ["month", "#top-viewed-month"],
            ];
            for (const [period, selector] of periods) {
                $(`${selector} .top-av-list .top-av-item`).each((_: any, el: any) => {
                    const $el = $(el);
                    const href = $el.find("a").attr("href") ?? "";
                    top10Animes[period].push({
                        id: extractId(href),
                        name: $el.find(".film-name a").text().trim(),
                        poster:
                            $el.find("img").attr("data-src") ??
                            $el.find("img").attr("src") ??
                            "",
                        rank: parseInt($el.find(".rank").text()) || 0,
                        episodes: {
                            sub: parseInt($el.find(".tick-sub").text()) || null,
                            dub: parseInt($el.find(".tick-dub").text()) || null,
                        },
                    });
                });
            }

            // Genres
            const genres: string[] = [];
            $(".block_area.block_area_home .cbox-list a").each((_: any, el: any) => {
                genres.push($(el).text().trim());
            });

            return {
                genres,
                spotlightAnimes,
                trendingAnimes,
                top10Animes,
                latestEpisodeAnimes: sections["latestEpisodeAnimes"] ?? [],
                topUpcomingAnimes: sections["topUpcomingAnimes"] ?? [],
                topAiringAnimes: sections["topAiringAnimes"] ?? [],
                mostPopularAnimes: sections["mostPopularAnimes"] ?? [],
                mostFavoriteAnimes: sections["mostFavoriteAnimes"] ?? [],
                latestCompletedAnimes: sections["latestCompletedAnimes"] ?? [],
            };
        } catch (err: any) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape home page: ${err.message}`,
                500,
                this.id
            );
        }
    }

    // ── A-Z List ───────────────────────────────────────────────────────────────

    /**
     * Get anime sorted alphabetically.
     *
     * @param sortOption - Letter, "0-9", "all", or "other"
     * @param page - Page number (default: 1)
     *
     * @example
     * ```ts
     * const data = await hianime.getAZList("a", 1);
     * console.log(data.animes);
     * ```
     */
    async getAZList(
        sortOption: AZListSortOption = "all",
        page = 1
    ): Promise<AZListResult> {
        try {
            const { data: html } = await this.http.get<string>(
                `/az-list/${sortOption}?page=${page}`
            );
            const $ = load(html);

            const animes: AnimeCard[] = [];
            $(".film_list-wrap .flw-item").each((_: any, el: any) => {
                animes.push(parseAnimeCard($, el));
            });

            const lastPage = parseInt(
                $(".pagination .page-item:last-child a").attr("href")?.split("page=")[1] ?? "1"
            );
            const hasNextPage =
                $(".pagination .page-item.active").next(".page-item").length > 0;

            return {
                sortOption,
                animes,
                totalPages: lastPage,
                currentPage: page,
                hasNextPage,
            };
        } catch (err: any) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape A-Z list: ${err.message}`,
                500,
                this.id
            );
        }
    }

    // ── Qtip Info ──────────────────────────────────────────────────────────────

    /**
     * Get quick tooltip info for an anime.
     *
     * @param animeId - Anime ID in kebab case (e.g. "one-piece-100")
     *
     * @example
     * ```ts
     * const data = await hianime.getQtipInfo("one-piece-100");
     * console.log(data.name);
     * ```
     */
    async getQtipInfo(animeId: string): Promise<QtipInfo> {
        try {
            const numericId = animeId.split("-").pop() ?? animeId;
            const { data } = await this.http.get<{ html: string; status: boolean }>(
                `${AJAX_URL}/anime/qtip?id=${numericId}`
            );

            const $ = load(data.html ?? "");
            const genres: string[] = [];
            $(".info-item.genres a, .genre a").each((_: any, el: any) => {
                genres.push($(el).text().trim());
            });

            return {
                id: animeId,
                name: $(".film-name, .qtip-title, h2").first().text().trim(),
                malscore: $(".info-item .mal-score, .score").text().trim(),
                quality: $(".quality").text().trim(),
                episodes: {
                    sub: parseInt($(".tick-sub").text()) || null,
                    dub: parseInt($(".tick-dub").text()) || null,
                },
                type: $(".info-item.type, .fdi-type").first().text().trim(),
                description: $(".film-description, .description").text().trim(),
                jname: $(".jname, [data-jname]").first().attr("data-jname") ?? "",
                synonyms: $(".synonyms").text().trim(),
                aired: $(".aired").text().trim(),
                status: $(".status").text().trim(),
                genres,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape qtip info for ${animeId}`,
                500,
                this.id
            );
        }
    }

    // ── About Info ─────────────────────────────────────────────────────────────

    /**
     * Get detailed information about an anime.
     *
     * @param animeId - Anime ID in kebab case (e.g. "attack-on-titan-112")
     *
     * @example
     * ```ts
     * const data = await hianime.getInfo("steinsgate-3");
     * console.log(data.anime.info.name);
     * console.log(data.seasons);
     * ```
     */
    async getInfo(animeId: string): Promise<AnimeAboutInfo> {
        try {
            const { data: html } = await this.http.get<string>(`/${animeId}`);
            const $ = load(html);

            // Main info
            const name = $(".anisc-detail .film-name").text().trim();
            const poster =
                $(".film-poster img").attr("data-src") ??
                $(".film-poster img").attr("src") ??
                "";

            const description = $(".film-description .text").text().trim();

            const stats = {
                rating: $(".tick-rate").text().trim(),
                quality: $(".tick-quality").text().trim(),
                episodes: {
                    sub: parseInt($(".tick-sub").text()) || null,
                    dub: parseInt($(".tick-dub").text()) || null,
                },
                type: $(".item:contains('Type')").next().text().trim() || $(".tick-type").text().trim(),
                duration: $(".item:contains('Duration')").next().text().trim(),
            };

            // More info (the key-value table)
            const moreInfo: AnimeAboutInfo["anime"]["moreInfo"] = {};
            $(".anisc-info .item").each((_: any, el: any) => {
                const $el = $(el);
                const key = $el
                    .find(".item-head")
                    .text()
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(":", "");
                const valueEl = $el.find(".name, a");
                if (valueEl.length > 1) {
                    moreInfo[key] = valueEl
                        .map((_: any, a: any) => $(a).text().trim())
                        .get()
                        .filter(Boolean);
                } else {
                    moreInfo[key] = $el.find(".name").text().trim();
                }
            });

            // Seasons
            const seasons: AnimeAboutInfo["seasons"] = [];
            $(".seasons-list .ssl-item").each((_: any, el: any) => {
                const $el = $(el);
                const href = $el.find("a").attr("href") ?? "";
                seasons.push({
                    id: extractId(href),
                    name: $el.find("a").text().trim(),
                    title: $el.find(".ssl-title").text().trim(),
                    poster:
                        $el.find("img").attr("data-src") ??
                        $el.find("img").attr("src") ??
                        "",
                    isCurrent: $el.hasClass("active") || $el.hasClass("ssl-item-a"),
                });
            });

            // Promotional videos
            const promotionalVideos: AnimeAboutInfo["anime"]["info"]["promotionalVideos"] = [];
            $(".block_area-promotions .pv-list .pv-item").each((_: any, el: any) => {
                const $el = $(el);
                promotionalVideos.push({
                    title: $el.find(".pv-title").text().trim() || undefined,
                    source: $el.find("a").attr("href") || undefined,
                    thumbnail:
                        $el.find("img").attr("data-src") ??
                        $el.find("img").attr("src") ??
                        undefined,
                });
            });

            // Character/VA section
            const characterVoiceActor: AnimeAboutInfo["anime"]["info"]["characterVoiceActor"] = [];
            $(".cach-list .cach-item").each((_: any, el: any) => {
                const $el = $(el);
                const $char = $el.find(".per-info.ltr");
                const $va = $el.find(".per-info.rtl");
                characterVoiceActor.push({
                    character: {
                        id: extractId($char.find("a").attr("href")),
                        poster:
                            $char.find("img").attr("data-src") ??
                            $char.find("img").attr("src") ??
                            "",
                        name: $char.find(".pi-name a").text().trim(),
                        cast: $char.find(".pi-cast").text().trim(),
                    },
                    voiceActor: {
                        id: extractId($va.find("a").attr("href")),
                        poster:
                            $va.find("img").attr("data-src") ??
                            $va.find("img").attr("src") ??
                            "",
                        name: $va.find(".pi-name a").text().trim(),
                        cast: $va.find(".pi-cast").text().trim(),
                    },
                });
            });

            // Recommended / Related / Most Popular
            const recommendedAnimes: AnimeCard[] = [];
            $(".block_area-realtime .flw-item").each((_: any, el: any) => {
                recommendedAnimes.push(parseAnimeCard($, el));
            });

            const relatedAnimes: AnimeCard[] = [];
            $(".block_area-related .flw-item").each((_: any, el: any) => {
                relatedAnimes.push(parseAnimeCard($, el));
            });

            const mostPopularAnimes: AnimeCard[] = [];
            $(".anif-block-ul .anif-item").each((_: any, el: any) => {
                mostPopularAnimes.push(parseAnimeCard($, el));
            });

            return {
                anime: {
                    info: {
                        id: animeId,
                        name,
                        poster,
                        description,
                        stats,
                        promotionalVideos,
                        characterVoiceActor,
                    },
                    moreInfo,
                },
                mostPopularAnimes,
                recommendedAnimes,
                relatedAnimes,
                seasons,
            };
        } catch (err: any) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape anime info for ${animeId}: ${err.message}`,
                500,
                this.id
            );
        }
    }

    // ── Search ─────────────────────────────────────────────────────────────────

    /**
     * Search for anime.
     *
     * @param query - Search query string
     * @param page - Page number (default: 1)
     * @param filters - Optional search filters
     *
     * @example
     * ```ts
     * // Simple search
     * const data = await hianime.search("one piece");
     *
     * // Advanced search
     * const data = await hianime.search("girls", 1, {
     *   genres: "action,adventure",
     *   type: "movie",
     *   sort: "score",
     * });
     * ```
     */
    async search(
        query: string,
        page = 1,
        filters: SearchFilters = {}
    ): Promise<AnimeSearchResult> {
        try {
            const params = new URLSearchParams({ q: query, page: String(page) });
            for (const [k, v] of Object.entries(filters)) {
                if (v !== undefined && v !== "") params.set(k, v);
            }

            const { data: html } = await this.http.get<string>(
                `/search?${params.toString()}`
            );
            const $ = load(html);

            const animes: AnimeCard[] = [];
            $(".film_list-wrap .flw-item").each((_: any, el: any) => {
                animes.push(parseAnimeCard($, el));
            });

            const mostPopularAnimes: AnimeCard[] = [];
            $(".anif-block-ul .anif-item").each((_: any, el: any) => {
                mostPopularAnimes.push(parseAnimeCard($, el));
            });

            const hasNextPage =
                $(".pagination .page-item.active").next(".page-item").length > 0;
            const totalPages =
                parseInt(
                    $(".pagination .page-item:last-child a").attr("href")?.split("page=")[1] ?? "1"
                ) || 1;

            return {
                animes,
                mostPopularAnimes,
                currentPage: page,
                totalPages,
                hasNextPage,
                searchQuery: query,
                searchFilters: filters,
            };
        } catch (err: any) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to search for "${query}": ${err.message}`,
                500,
                this.id
            );
        }
    }

    // ── Search Suggestions ─────────────────────────────────────────────────────

    /**
     * Get search autocomplete suggestions.
     *
     * @param query - Partial search query
     *
     * @example
     * ```ts
     * const data = await hianime.searchSuggestions("one pie");
     * console.log(data.suggestions);
     * ```
     */
    async searchSuggestions(query: string): Promise<AnimeSearchSuggestion> {
        try {
            const { data } = await this.http.get<{ html: string; status: boolean }>(
                `${AJAX_URL}/search/suggest?keyword=${encodeURIComponent(query)}`
            );

            const $ = load(data.html ?? "");
            const suggestions: AnimeSearchSuggestion["suggestions"] = [];

            $(".nav-item").each((_: any, el: any) => {
                const $el = $(el);
                const href = $el.find("a").attr("href") ?? "";
                const moreInfo: string[] = [];
                $el.find(".film-infor span, .film-infor a").each((_: any, s: any) => {
                    const text = $(s).text().trim();
                    if (text) moreInfo.push(text);
                });

                suggestions.push({
                    id: extractId(href),
                    name: $el.find(".film-name").text().trim(),
                    poster:
                        $el.find("img").attr("data-src") ??
                        $el.find("img").attr("src") ??
                        "",
                    jname: $el.find("[data-jname]").attr("data-jname") ?? "",
                    moreInfo,
                });
            });

            return { suggestions };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError("Failed to get search suggestions", 500, this.id);
        }
    }

    // ── Category ───────────────────────────────────────────────────────────────

    /**
     * Get anime by category.
     *
     * @param category - One of: "most-favorite", "most-popular", "subbed-anime", "dubbed-anime",
     *   "recently-updated", "recently-added", "top-upcoming", "top-airing",
     *   "movie", "special", "ova", "ona", "tv", "completed"
     * @param page - Page number (default: 1)
     *
     * @example
     * ```ts
     * const data = await hianime.getCategoryAnime("tv", 2);
     * ```
     */
    async getCategoryAnime(
        category: AnimeCategory,
        page = 1
    ): Promise<AnimeCategoryResult> {
        try {
            const { data: html } = await this.http.get<string>(
                `/${category}?page=${page}`
            );
            const $ = load(html);

            const animes: AnimeCard[] = [];
            $(".film_list-wrap .flw-item").each((_: any, el: any) => {
                animes.push(parseAnimeCard($, el));
            });

            const genres: string[] = [];
            $(".block_area.block_area_sidebar .cbox-list a").each((_: any, el: any) => {
                genres.push($(el).text().trim());
            });

            const top10: AnimeCategoryResult["top10Animes"] = {
                today: [],
                week: [],
                month: [],
            };
            const periods: Array<["today" | "week" | "month", string]> = [
                ["today", "#top-viewed-day"],
                ["week", "#top-viewed-week"],
                ["month", "#top-viewed-month"],
            ];
            for (const [period, sel] of periods) {
                $(`${sel} .top-av-list .top-av-item`).each((_: any, el: any) => {
                    const $el = $(el);
                    top10[period].push({
                        id: extractId($el.find("a").attr("href")),
                        name: $el.find(".film-name a").text().trim(),
                        poster:
                            $el.find("img").attr("data-src") ??
                            $el.find("img").attr("src") ??
                            "",
                        rank: parseInt($el.find(".rank").text()) || 0,
                        episodes: {
                            sub: parseInt($el.find(".tick-sub").text()) || null,
                            dub: parseInt($el.find(".tick-dub").text()) || null,
                        },
                    });
                });
            }

            const hasNextPage =
                $(".pagination .page-item.active").next(".page-item").length > 0;
            const totalPages =
                parseInt(
                    $(".pagination .page-item:last-child a").attr("href")?.split("page=")[1] ?? "1"
                ) || 1;

            return {
                category: $(".block_area-header h2").text().trim() || category,
                animes,
                genres,
                top10Animes: top10,
                currentPage: page,
                totalPages,
                hasNextPage,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape category "${category}"`,
                500,
                this.id
            );
        }
    }

    // ── Genre ──────────────────────────────────────────────────────────────────

    /**
     * Get anime by genre.
     *
     * @param genreName - Genre name in kebab case (e.g. "shounen", "action")
     * @param page - Page number (default: 1)
     *
     * @example
     * ```ts
     * const data = await hianime.getGenreAnime("isekai", 1);
     * ```
     */
    async getGenreAnime(genreName: string, page = 1): Promise<AnimeGenreResult> {
        try {
            const { data: html } = await this.http.get<string>(
                `/genre/${genreName}?page=${page}`
            );
            const $ = load(html);

            const animes: AnimeCard[] = [];
            $(".film_list-wrap .flw-item").each((_: any, el: any) => {
                animes.push(parseAnimeCard($, el));
            });

            const genres: string[] = [];
            $(".block_area.block_area_sidebar .cbox-list a").each((_: any, el: any) => {
                genres.push($(el).text().trim());
            });

            const topAiringAnimes: AnimeCard[] = [];
            $(".anif-block-ul .anif-item").each((_: any, el: any) => {
                topAiringAnimes.push(parseAnimeCard($, el));
            });

            const hasNextPage =
                $(".pagination .page-item.active").next(".page-item").length > 0;
            const totalPages =
                parseInt(
                    $(".pagination .page-item:last-child a").attr("href")?.split("page=")[1] ?? "1"
                ) || 1;

            return {
                genreName: $(".block_area-header h2").text().trim() || genreName,
                animes,
                genres,
                topAiringAnimes,
                currentPage: page,
                totalPages,
                hasNextPage,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape genre "${genreName}"`,
                500,
                this.id
            );
        }
    }

    // ── Producer ───────────────────────────────────────────────────────────────

    /**
     * Get anime by producer/studio.
     *
     * @param producerName - Producer name in kebab case (e.g. "toei-animation")
     * @param page - Page number (default: 1)
     *
     * @example
     * ```ts
     * const data = await hianime.getProducerAnimes("mappa", 1);
     * ```
     */
    async getProducerAnimes(
        producerName: string,
        page = 1
    ): Promise<AnimeProducerResult> {
        try {
            const { data: html } = await this.http.get<string>(
                `/producer/${producerName}?page=${page}`
            );
            const $ = load(html);

            const animes: AnimeCard[] = [];
            $(".film_list-wrap .flw-item").each((_: any, el: any) => {
                animes.push(parseAnimeCard($, el));
            });

            const top10: AnimeProducerResult["top10Animes"] = {
                today: [],
                week: [],
                month: [],
            };
            const periods: Array<["today" | "week" | "month", string]> = [
                ["today", "#top-viewed-day"],
                ["week", "#top-viewed-week"],
                ["month", "#top-viewed-month"],
            ];
            for (const [period, sel] of periods) {
                $(`${sel} .top-av-list .top-av-item`).each((_: any, el: any) => {
                    const $el = $(el);
                    top10[period].push({
                        id: extractId($el.find("a").attr("href")),
                        name: $el.find(".film-name a").text().trim(),
                        poster:
                            $el.find("img").attr("data-src") ??
                            $el.find("img").attr("src") ??
                            "",
                        rank: parseInt($el.find(".rank").text()) || 0,
                        episodes: {
                            sub: parseInt($el.find(".tick-sub").text()) || null,
                            dub: parseInt($el.find(".tick-dub").text()) || null,
                        },
                    });
                });
            }

            const topAiringAnimes: AnimeCard[] = [];
            $(".anif-block-ul .anif-item").each((_: any, el: any) => {
                topAiringAnimes.push(parseAnimeCard($, el));
            });

            const hasNextPage =
                $(".pagination .page-item.active").next(".page-item").length > 0;
            const totalPages =
                parseInt(
                    $(".pagination .page-item:last-child a").attr("href")?.split("page=")[1] ?? "1"
                ) || 1;

            return {
                producerName:
                    $(".block_area-header h2").text().trim() || producerName,
                animes,
                top10Animes: top10,
                topAiringAnimes,
                currentPage: page,
                totalPages,
                hasNextPage,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape producer "${producerName}"`,
                500,
                this.id
            );
        }
    }

    // ── Schedule ───────────────────────────────────────────────────────────────

    /**
     * Get estimated airing schedule for a specific date.
     *
     * @param date - Date string in format yyyy-mm-dd
     * @param tzOffset - Timezone offset in minutes (default: -330 = IST)
     *
     * @example
     * ```ts
     * const today = new Date().toISOString().split("T")[0];
     * const data = await hianime.getEstimatedSchedule(today);
     * ```
     */
    async getEstimatedSchedule(
        date: string,
        tzOffset = -330
    ): Promise<EstimatedSchedule> {
        try {
            const { data } = await this.http.get<{
                html: string;
                status: boolean;
            }>(`${AJAX_URL}/schedule/list?tzOffset=${tzOffset}&date=${date}`);

            const $ = load(data.html ?? "");
            const scheduledAnimes: EstimatedSchedule["scheduledAnimes"] = [];

            $(".schedule-list .sl-item").each((_: any, el: any) => {
                const $el = $(el);
                const href = $el.find("a").attr("href") ?? "";
                const timestamp = parseInt($el.attr("data-timestamp") ?? "0") || 0;
                const now = Math.floor(Date.now() / 1000);

                scheduledAnimes.push({
                    id: extractId(href),
                    time: $el.find(".time, .sl-time").text().trim(),
                    name: $el.find(".film-name, .sl-title").text().trim(),
                    jname:
                        $el.find("[data-jname]").attr("data-jname") ?? "",
                    airingTimestamp: timestamp,
                    secondsUntilAiring: Math.max(0, timestamp - now),
                });
            });

            return { scheduledAnimes };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to scrape schedule for ${date}`,
                500,
                this.id
            );
        }
    }

    // ── Episodes ───────────────────────────────────────────────────────────────

    /**
     * Get all episodes for an anime.
     *
     * @param animeId - Anime ID in kebab case (e.g. "steinsgate-3")
     *
     * @example
     * ```ts
     * const data = await hianime.getEpisodes("steinsgate-3");
     * console.log(data.totalEpisodes);
     * console.log(data.episodes[0]);
     * ```
     */
    async getEpisodes(animeId: string): Promise<AnimeEpisodes> {
        try {
            const numericId = animeId.split("-").pop() ?? animeId;
            const { data } = await this.http.get<{
                html: string;
                totalItems: number;
                status: boolean;
            }>(`/api/theme/episode/list/${numericId}`);

            const $ = load(data.html ?? "");
            const episodes: AnimeEpisodes["episodes"] = [];

            $(".detail-ep-list .ep-item, .ss-list .ep-item, .ssc-list .ep-item, a.ep-item, .ssl-item").each((_: any, el: any) => {
                const $el = $(el);
                const epIdStr = $el.attr("data-id") || $el.attr("href")?.split("?ep=")[1] || "";
                episodes.push({
                    title: $el.attr("title") || $el.text().trim() || "",
                    episodeId: `${animeId}?ep=${epIdStr}`,
                    number: parseInt($el.attr("data-number") || $el.attr("data-id") || "0"),
                    isFiller: $el.hasClass("ssl-item-filler") || $el.hasClass("filler"),
                });
            });

            return {
                totalEpisodes: data.totalItems || episodes.length,
                episodes,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to get episodes for ${animeId}`,
                500,
                this.id
            );
        }
    }

    // ── Next Episode Schedule ──────────────────────────────────────────────────

    /**
     * Get the next episode airing schedule.
     *
     * @param animeId - Anime ID in kebab case
     *
     * @example
     * ```ts
     * const data = await hianime.getNextEpisodeSchedule("one-piece-100");
     * console.log(data.airingTimestamp);
     * ```
     */
    async getNextEpisodeSchedule(animeId: string): Promise<NextEpisodeSchedule> {
        try {
            const numericId = animeId.split("-").pop() ?? animeId;
            const { data } = await this.http.get<{
                html?: string;
                data?: {
                    episode_airing_time?: string;
                    episode_airing_timestamp?: number;
                };
                status: boolean;
            }>(`${AJAX_URL}/anime/next-episode-schedule?id=${numericId}`);

            if (!data?.data) {
                return {
                    airingISOTimestamp: null,
                    airingTimestamp: null,
                    secondsUntilAiring: null,
                };
            }

            const ts = data.data.episode_airing_timestamp ?? null;
            const now = Math.floor(Date.now() / 1000);

            return {
                airingISOTimestamp: data.data.episode_airing_time ?? null,
                airingTimestamp: ts,
                secondsUntilAiring: ts ? Math.max(0, ts - now) : null,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to get next episode schedule for ${animeId}`,
                500,
                this.id
            );
        }
    }

    // ── Episode Servers ────────────────────────────────────────────────────────

    /**
     * Get available server names and IDs for an episode.
     *
     * @param episodeId - Episode ID string (e.g. "steinsgate-0-92?ep=2055")
     *
     * @example
     * ```ts
     * const data = await hianime.getEpisodeServers("steinsgate-0-92?ep=2055");
     * console.log(data.sub, data.dub);
     * ```
     */
    async getEpisodeServers(episodeId: string): Promise<EpisodeServers> {
        try {
            const epId = episodeId.split("?ep=")[1] ?? episodeId;
            const { data } = await this.http.get<{
                html: string;
                server_name?: string;
                episode_no?: number;
                status: boolean;
            }>(`/api/theme/episode/servers?episodeId=${epId}`);

            const $ = load(data.html ?? "");
            const sub: EpisodeServers["sub"] = [];
            const dub: EpisodeServers["dub"] = [];
            const raw: EpisodeServers["raw"] = [];

            $(".server-item[data-type='sub'], .servers-sub .server-item").each(
                (_: number, el: any) => {
                    const $el = $(el);
                    const hash = $el.attr("data-hash") || "";
                    sub.push({
                        serverId: parseInt($el.attr("data-server-id") || $el.attr("data-id") || (hash ? "1" : "0")),
                        serverName: ($el.attr("data-server-name") || $el.text().trim()) ?? "",
                    });
                }
            );

            $(".server-item[data-type='dub'], .servers-dub .server-item").each(
                (_: number, el: any) => {
                    const $el = $(el);
                    const hash = $el.attr("data-hash") || "";
                    dub.push({
                        serverId: parseInt($el.attr("data-server-id") || $el.attr("data-id") || (hash ? "1" : "0")),
                        serverName: ($el.attr("data-server-name") || $el.text().trim()) ?? "",
                    });
                }
            );

            $(".server-item[data-type='raw'], .servers-raw .server-item").each(
                (_: number, el: any) => {
                    const $el = $(el);
                    const hash = $el.attr("data-hash") || "";
                    raw.push({
                        serverId: parseInt($el.attr("data-server-id") || $el.attr("data-id") || (hash ? "1" : "0")),
                        serverName: ($el.attr("data-server-name") || $el.text().trim()) ?? "",
                    });
                }
            );

            return {
                episodeId,
                episodeNo: data.episode_no ?? 0,
                sub,
                dub,
                raw,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to get episode servers for ${episodeId}`,
                500,
                this.id
            );
        }
    }

    // ── Episode Sources ────────────────────────────────────────────────────────

    /**
     * Get streaming source URLs (HLS .m3u8) for an episode.
     *
     * @param episodeId - Episode ID string (e.g. "steinsgate-3?ep=230")
     * @param server - Server name (default: "hd-1")
     * @param category - "sub", "dub", or "raw" (default: "sub")
     *
     * @example
     * ```ts
     * const data = await hianime.getEpisodeSources(
     *   "steinsgate-3?ep=230",
     *   "hd-1",
     *   "sub"
     * );
     * // Play with: data.sources[0].url (HLS .m3u8 stream)
     * ```
     */
    async getEpisodeSources(
        episodeId: string,
        server: AnimeServer = "hd-1",
        category: EpisodeCategory = "sub"
    ): Promise<EpisodeSources> {
        try {
            const epId = episodeId.split("?ep=")[1] ?? episodeId;

            // Fetch server items html from theme endpoint
            const { data: serverRes } = await this.http.get<{
                html: string;
                status: boolean;
            }>(`/api/theme/episode/servers?episodeId=${epId}`);

            const $ = load(serverRes.html ?? "");
            let streamUrl = "";

            $(`.server-item[data-type='${category}']`).each((_: number, el: any) => {
                const $el = $(el);
                const sName = ($el.attr("data-server-name") || $el.text().trim()).toLowerCase();
                const targetServer = (server as string).toLowerCase();

                if (sName.includes(targetServer) || targetServer.includes(sName)) {
                    const hash = $el.attr("data-hash");
                    if (hash) {
                        try {
                            streamUrl = Buffer.from(hash, "base64").toString("utf-8");
                        } catch {
                            // ignore invalid base64
                        }
                    }
                }
            });

            // Fallback: pick first hash if server name match not exact
            if (!streamUrl) {
                const firstHash = $(`.server-item[data-type='${category}']`).first().attr("data-hash");
                if (firstHash) {
                    try {
                        streamUrl = Buffer.from(firstHash, "base64").toString("utf-8");
                    } catch {
                        // ignore
                    }
                }
            }

            if (!streamUrl) {
                throwExtensionsError(
                    `No streaming source found for episode ${episodeId} on server ${server}`,
                    404,
                    this.id
                );
            }

            return {
                headers: {
                    Referer: BASE_URL,
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                },
                sources: [
                    {
                        url: streamUrl,
                        isM3U8: streamUrl.includes(".m3u8"),
                        quality: "auto",
                    },
                ],
                subtitles: [],
                anilistID: null,
                malID: null,
            };
        } catch (err) {
            if (err instanceof ExtensionsError) throw err;
            throwExtensionsError(
                `Failed to get episode sources for ${episodeId}`,
                500,
                this.id
            );
        }
    }
}
