/**
 * All HiAnime-specific types — mirrors what the scraper returns.
 */

// ── Episode counts ───────────────────────────────────────────────────────────

export interface EpisodeCounts {
    sub: number | null;
    dub: number | null;
}

// ── Anime card (minimal info used in lists) ──────────────────────────────────

export interface AnimeCard {
    id: string;
    name: string;
    jname?: string;
    poster: string;
    duration?: string;
    type?: string;
    rating?: string;
    episodes: EpisodeCounts;
}

export interface TrendingAnime {
    id: string;
    name: string;
    poster: string;
    rank: number;
}

export interface Top10Anime {
    id: string;
    name: string;
    poster: string;
    rank: number;
    episodes: EpisodeCounts;
}

export interface SpotlightAnime {
    id: string;
    name: string;
    jname: string;
    poster: string;
    description: string;
    rank: number;
    otherInfo: string[];
    episodes: EpisodeCounts;
}

// ── Home page ────────────────────────────────────────────────────────────────

export interface HomePage {
    genres: string[];
    latestEpisodeAnimes: AnimeCard[];
    spotlightAnimes: SpotlightAnime[];
    trendingAnimes: TrendingAnime[];
    top10Animes: {
        today: Top10Anime[];
        week: Top10Anime[];
        month: Top10Anime[];
    };
    topAiringAnimes: AnimeCard[];
    topUpcomingAnimes: AnimeCard[];
    mostPopularAnimes: AnimeCard[];
    mostFavoriteAnimes: AnimeCard[];
    latestCompletedAnimes: AnimeCard[];
}

// ── A-Z list ─────────────────────────────────────────────────────────────────

export type AZListSortOption =
    | "all"
    | "other"
    | "0-9"
    | "a"
    | "b"
    | "c"
    | "d"
    | "e"
    | "f"
    | "g"
    | "h"
    | "i"
    | "j"
    | "k"
    | "l"
    | "m"
    | "n"
    | "o"
    | "p"
    | "q"
    | "r"
    | "s"
    | "t"
    | "u"
    | "v"
    | "w"
    | "x"
    | "y"
    | "z";

export interface AZListResult {
    sortOption: AZListSortOption;
    animes: AnimeCard[];
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
}

// ── Qtip info ────────────────────────────────────────────────────────────────

export interface QtipInfo {
    id: string;
    name: string;
    malscore: string;
    quality: string;
    episodes: EpisodeCounts;
    type: string;
    description: string;
    jname: string;
    synonyms: string;
    aired: string;
    status: string;
    genres: string[];
}

// ── About info ───────────────────────────────────────────────────────────────

export interface CharacterVoiceActor {
    character: {
        id: string;
        poster: string;
        name: string;
        cast: string;
    };
    voiceActor: {
        id: string;
        poster: string;
        name: string;
        cast: string;
    };
}

export interface PromotionalVideo {
    title?: string;
    source?: string;
    thumbnail?: string;
}

export interface AnimeStats {
    rating: string;
    quality: string;
    episodes: EpisodeCounts;
    type: string;
    duration: string;
}

export interface AnimeInfo {
    id: string;
    name: string;
    poster: string;
    description: string;
    stats: AnimeStats;
    promotionalVideos: PromotionalVideo[];
    characterVoiceActor: CharacterVoiceActor[];
}

export interface AnimeMoreInfo {
    aired?: string;
    genres?: string[];
    status?: string;
    studios?: string;
    duration?: string;
    [key: string]: string | string[] | undefined;
}

export interface AnimeSeason {
    id: string;
    name: string;
    title: string;
    poster: string;
    isCurrent: boolean;
}

export interface AnimeAboutInfo {
    anime: {
        info: AnimeInfo;
        moreInfo: AnimeMoreInfo;
    };
    mostPopularAnimes: AnimeCard[];
    recommendedAnimes: AnimeCard[];
    relatedAnimes: AnimeCard[];
    seasons: AnimeSeason[];
}

// ── Search ───────────────────────────────────────────────────────────────────

export interface SearchFilters {
    type?: string;
    status?: string;
    rated?: string;
    score?: string;
    season?: string;
    language?: string;
    start_date?: string;
    end_date?: string;
    sort?: string;
    genres?: string;
    [key: string]: string | undefined;
}

export interface AnimeSearchResult {
    animes: AnimeCard[];
    mostPopularAnimes: AnimeCard[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    searchQuery: string;
    searchFilters: SearchFilters;
}

export interface SearchSuggestion {
    id: string;
    name: string;
    poster: string;
    jname: string;
    moreInfo: string[];
}

export interface AnimeSearchSuggestion {
    suggestions: SearchSuggestion[];
}

// ── Category / Genre / Producer ──────────────────────────────────────────────

export type AnimeCategory =
    | "most-favorite"
    | "most-popular"
    | "subbed-anime"
    | "dubbed-anime"
    | "recently-updated"
    | "recently-added"
    | "top-upcoming"
    | "top-airing"
    | "movie"
    | "special"
    | "ova"
    | "ona"
    | "tv"
    | "completed";

export interface AnimeCategoryResult {
    category: string;
    animes: AnimeCard[];
    genres: string[];
    top10Animes: {
        today: Top10Anime[];
        week: Top10Anime[];
        month: Top10Anime[];
    };
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface AnimeGenreResult {
    genreName: string;
    animes: AnimeCard[];
    genres: string[];
    topAiringAnimes: AnimeCard[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface AnimeProducerResult {
    producerName: string;
    animes: AnimeCard[];
    top10Animes: {
        today: Top10Anime[];
        week: Top10Anime[];
        month: Top10Anime[];
    };
    topAiringAnimes: AnimeCard[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
}

// ── Schedule ─────────────────────────────────────────────────────────────────

export interface ScheduledAnime {
    id: string;
    time: string;
    name: string;
    jname: string;
    airingTimestamp: number;
    secondsUntilAiring: number;
}

export interface EstimatedSchedule {
    scheduledAnimes: ScheduledAnime[];
}

// ── Episodes ─────────────────────────────────────────────────────────────────

export interface AnimeEpisode {
    number: number;
    title: string;
    episodeId: string;
    isFiller: boolean;
}

export interface AnimeEpisodes {
    totalEpisodes: number;
    episodes: AnimeEpisode[];
}

// ── Next episode schedule ────────────────────────────────────────────────────

export interface NextEpisodeSchedule {
    airingISOTimestamp: string | null;
    airingTimestamp: number | null;
    secondsUntilAiring: number | null;
}

// ── Episode servers ──────────────────────────────────────────────────────────

export interface EpisodeServer {
    serverId: number;
    serverName: string;
}

export interface EpisodeServers {
    episodeId: string;
    episodeNo: number;
    sub: EpisodeServer[];
    dub: EpisodeServer[];
    raw: EpisodeServer[];
}

// ── Episode sources ──────────────────────────────────────────────────────────

export type EpisodeCategory = "sub" | "dub" | "raw";

export type AnimeServer =
    | "hd-1"
    | "hd-2"
    | "megacloud"
    | "streamsb"
    | "streamtape"
    | "vidstreaming";

export interface EpisodeSource {
    url: string;
    isM3U8: boolean;
    quality?: string;
}

export interface EpisodeSubtitle {
    lang: string;
    url: string;
    default?: boolean;
}

export interface EpisodeSources {
    headers: Record<string, string>;
    sources: EpisodeSource[];
    subtitles: EpisodeSubtitle[];
    anilistID: number | null;
    malID: number | null;
}

// ── Errors ───────────────────────────────────────────────────────────────────

export interface HiAnimeErrorData {
    status: number;
    message: string;
    provider?: string;
}
