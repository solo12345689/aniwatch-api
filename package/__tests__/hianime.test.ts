import { describe, it, expect, beforeAll } from "vitest";
import { ANIME, HiAnime, ExtensionsError } from "../src/index.js";

describe("HiAnime Provider", () => {
    let hianime: InstanceType<typeof ANIME.HiAnime>;

    beforeAll(() => {
        hianime = new ANIME.HiAnime();
    });

    it("should export via ANIME namespace", () => {
        expect(ANIME.HiAnime).toBeDefined();
        expect(hianime).toBeInstanceOf(HiAnime);
    });

    it("should have correct provider metadata", () => {
        const info = hianime.getMetadata();
        expect(info.id).toBe("hianime");
        expect(info.name).toBeDefined();
        expect(info.baseUrl).toBe("https://hianime.at");
        expect(info.version).toBeDefined();
        expect(info.isWorking).toBe(true);
    });

    it("GET getHomePage() — should return non-empty lists", async () => {
        const data = await hianime.getHomePage();

        expect(data.spotlightAnimes).not.toEqual([]);
        expect(data.trendingAnimes).not.toEqual([]);
        expect(data.latestEpisodeAnimes).not.toEqual([]);
        expect(data.top10Animes.today).not.toEqual([]);
        expect(data.top10Animes.week).not.toEqual([]);
        expect(data.top10Animes.month).not.toEqual([]);
        expect(data.genres).not.toEqual([]);
    });

    it("GET search() — should find results for 'one piece'", async () => {
        const data = await hianime.search("one piece");

        expect(data.animes.length).toBeGreaterThan(0);
        expect(data.searchQuery).toBe("one piece");
        expect(data.currentPage).toBe(1);
    });

    it("GET getAZList() — should return anime for sort 'a'", async () => {
        const data = await hianime.getAZList("a", 1);

        expect(data.sortOption).toBe("a");
        expect(data.animes.length).toBeGreaterThan(0);
        expect(data.currentPage).toBe(1);
    });

    it("GET searchSuggestions() — should return suggestions for 'naruto'", async () => {
        const data = await hianime.searchSuggestions("naruto");

        expect(data.suggestions).toBeDefined();
    });

    it("GET getCategoryAnime() — should return 'tv' category animes", async () => {
        const data = await hianime.getCategoryAnime("tv", 1);

        expect(data.animes.length).toBeGreaterThan(0);
        expect(data.currentPage).toBe(1);
    });

    it("GET getInfo() — should return about info for 'steinsgate-3'", async () => {
        const data = await hianime.getInfo("steinsgate-3");

        expect(data.anime.info.id).toBe("steinsgate-3");
        expect(data.anime.info.name).toBeDefined();
    });

    it("GET getEpisodes() — should return episodes for 'steinsgate-3'", async () => {
        const data = await hianime.getEpisodes("steinsgate-3");

        expect(data.totalEpisodes).toBeGreaterThan(0);
        expect(data.episodes.length).toBeGreaterThan(0);
    });

    it("ExtensionsError should be properly instantiated", () => {
        const err = new ExtensionsError({
            message: "Test error",
            status: 404,
            provider: "hianime",
        });
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(ExtensionsError);
        expect(err.status).toBe(404);
        expect(err.provider).toBe("hianime");
        expect(err.name).toBe("ExtensionsError");
    });
});
