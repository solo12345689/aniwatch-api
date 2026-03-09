import type { HiAnimeErrorData } from "../types/hianime.js";

/**
 * Custom error class for HiAnime scraper failures.
 *
 * @example
 * ```ts
 * try {
 *   const data = await hianime.getInfo("invalid-id");
 * } catch (err) {
 *   if (err instanceof ExtensionsError) {
 *     console.error(err.status, err.message, err.provider);
 *   }
 * }
 * ```
 */
export class ExtensionsError extends Error {
    public readonly status: number;
    public readonly provider: string;

    constructor(data: HiAnimeErrorData) {
        super(data.message);
        this.name = "ExtensionsError";
        this.status = data.status;
        this.provider = data.provider ?? "unknown";

        // Maintain proper stack trace in V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ExtensionsError);
        }
    }
}

/**
 * Helper to throw a standardised extensions error.
 */
export function throwExtensionsError(
    message: string,
    status = 500,
    provider = "unknown"
): never {
    throw new ExtensionsError({ message, status, provider });
}
