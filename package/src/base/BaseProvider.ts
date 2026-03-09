import type { ProviderInfo } from "../types/base.js";

/**
 * Abstract base class that every provider must extend.
 * Enforces a consistent interface across all scrapers.
 */
export abstract class BaseProvider {
    /**
     * Unique identifier for this provider (e.g. "hianime", "gogoanime")
     */
    abstract readonly id: string;

    /**
     * Human-readable name of the provider
     */
    abstract readonly name: string;

    /**
     * Base URL of the website being scraped
     */
    abstract readonly baseUrl: string;

    /**
     * Provider version (semver string)
     */
    abstract readonly version: string;

    /**
     * Whether this provider is currently functional
     */
    abstract readonly isWorking: boolean;

    /**
     * Returns metadata about this provider
     */
    getMetadata(): ProviderInfo {
        return {
            id: this.id,
            name: this.name,
            baseUrl: this.baseUrl,
            version: this.version,
            isWorking: this.isWorking,
        };
    }
}
