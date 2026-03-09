/**
 * Unified base types shared across all providers.
 */

export interface AnimeResult {
    id: string;
    title: string;
    url?: string;
    image?: string;
    cover?: string;
    description?: string;
    rating?: string | number;
    releaseDate?: string;
    type?: string;
}

export interface EpisodeResult {
    id: string;
    number: number;
    title?: string;
    isFiller?: boolean;
    isSubbed?: boolean;
    isDubbed?: boolean;
    url?: string;
}

export interface VideoSource {
    url: string;
    quality?: string;
    isM3U8?: boolean;
}

export interface Subtitle {
    url: string;
    lang: string;
    default?: boolean;
}

export interface SearchResult<T> {
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
    results: T[];
}

export interface ProviderInfo {
    id: string;
    name: string;
    baseUrl: string;
    version: string;
    isWorking: boolean;
}
