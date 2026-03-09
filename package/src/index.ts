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

import { HiAnime } from "./providers/hianime/index.js";

/**
 * Anime providers — usage: `new ANIME.HiAnime()`
 *
 * Currently available providers:
 * - `ANIME.HiAnime` — scrapes hianimez.to
 */
export const ANIME = {
    HiAnime,
} as const;

// ── Named provider exports (for direct import) ───────────────────────────────

export { HiAnime };

// ── Base classes (for extending/building your own provider) ──────────────────

export { BaseProvider } from "./base/BaseProvider.js";
export { HttpClient } from "./base/HttpClient.js";

// ── Error class ──────────────────────────────────────────────────────────────

export { ExtensionsError } from "./base/ExtensionsError.js";

// ── TypeScript types ─────────────────────────────────────────────────────────

export type * from "./types/index.js";
