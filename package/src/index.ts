/**
 * @genga-movie/aniwatch
 *
 * A Node.js library providing high-level APIs to scrape anime information
 * from multiple sources.
 *
 * @example
 * ```ts
 * // ESM
 * import { ANIME, ExtensionsError } from "@genga-movie/aniwatch";
 *
 * // CommonJS
 * const { ANIME, ExtensionsError } = require("@genga-movie/aniwatch");
 *
 * // Usage
/**
 * @genga-movie/aniwatch
 *
 * A Node.js library providing high-level APIs to scrape anime information
 * from multiple sources.
 *
 * @example
 * ```ts
 * // ESM
 * import { ANIME, ExtensionsError } from "@genga-movie/aniwatch";
 *
 * // CommonJS
 * const { ANIME, ExtensionsError } = require("@genga-movie/aniwatch");
 *
 * // Usage
 * const hianime = new ANIME.HiAnime();
 * const results = await hianime.search("one piece");
 * console.log(results.animes);
 * ```
 */

// ── Providers (grouped by media type, like @consumet/extensions) ────────────
 
import { HiAnime as HiAnimeScraper, Servers as HiAnimeServers } from "./providers/hianime/index.js";
import type * as HiAnimeTypes from "./types/hianime.js";
 
/**
 * Anime providers — usage: `new ANIME.HiAnime()`
 *
 * Currently available providers:
 * - `ANIME.HiAnime` — scrapes hianime.at
 */
export const ANIME = {
    HiAnime: HiAnimeScraper,
} as const;
 
// ── Named provider exports (for direct import) ───────────────────────────────
 
// Match the root API's expectation: new HiAnime.Scraper() and HiAnime.<Type>
export namespace HiAnime {
    export const Scraper = HiAnimeScraper;
    export const Servers = HiAnimeServers;
 
    // Types compatibility mapping
    export type ScrapedHomePage = HiAnimeTypes.HomePage;
    export type AZListSortOptions = HiAnimeTypes.AZListSortOption;
    export type ScrapedAnimeAZList = HiAnimeTypes.AZListResult;
    export type ScrapedAnimeQtipInfo = HiAnimeTypes.QtipInfo;
    export type AnimeCategories = HiAnimeTypes.AnimeCategory;
    export type ScrapedAnimeCategory = HiAnimeTypes.AnimeCategoryResult;
    export type ScrapedGenreAnime = HiAnimeTypes.AnimeGenreResult;
    export type ScrapedProducerAnime = HiAnimeTypes.AnimeProducerResult;
    export type ScrapedEstimatedSchedule = HiAnimeTypes.EstimatedSchedule;
    export type ScrapedAnimeSearchResult = HiAnimeTypes.AnimeSearchResult;
    export type ScrapedAnimeSearchSuggestion = HiAnimeTypes.AnimeSearchSuggestion;
    export type ScrapedAnimeAboutInfo = HiAnimeTypes.AnimeAboutInfo;
    export type ScrapedEpisodeServers = HiAnimeTypes.EpisodeServers;
    export type AnimeServers = HiAnimeTypes.AnimeServer;
    export type ScrapedAnimeEpisodesSources = HiAnimeTypes.EpisodeSources;
    export type ScrapedAnimeEpisodes = HiAnimeTypes.AnimeEpisodes;
    export type ScrapedNextEpisodeSchedule = HiAnimeTypes.NextEpisodeSchedule;
}
 
// ── Base classes (for extending/building your own provider) ──────────────────
 
export { BaseProvider } from "./base/BaseProvider.js";
export { HttpClient } from "./base/HttpClient.js";
 
// ── Error class ──────────────────────────────────────────────────────────────
 
export { ExtensionsError as HiAnimeError } from "./base/ExtensionsError.js";
export { ExtensionsError } from "./base/ExtensionsError.js";
 
// ── TypeScript types ─────────────────────────────────────────────────────────
 
export type * from "./types/index.js";
