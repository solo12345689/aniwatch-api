/**
 * Basic usage example for @genga-movie/aniwatch
 *
 * Run with: npm run example
 */

import { ANIME, ExtensionsError } from "../src/index.js";

const hianime = new ANIME.HiAnime();

console.log("📡 Provider info:", hianime.getMetadata());
console.log("\n");

// ── Example 1: Home Page ─────────────────────────────────────────────────────
async function demoHomePage() {
    console.log("🏠 Fetching home page...");
    const home = await hianime.getHomePage();
    console.log(`✅ Spotlight animes: ${home.spotlightAnimes.length}`);
    console.log(`✅ Trending animes: ${home.trendingAnimes.length}`);
    console.log(`✅ Genres: ${home.genres.slice(0, 5).join(", ")}...`);
    console.log(`✅ Top 10 today: ${home.top10Animes.today.length} entries\n`);
}

// ── Example 2: Search ────────────────────────────────────────────────────────
let firstResultId = "steinsgate-3";

async function demoSearch() {
    console.log('🔍 Searching for "steins gate"...');
    const results = await hianime.search("steins gate");
    console.log(`✅ Found ${results.animes.length} results`);
    if (results.animes[0]) {
        firstResultId = results.animes[0].id;
        console.log(`   First result: ${results.animes[0].name} (${firstResultId})\n`);
    }
}

// ── Example 3: Anime Details ─────────────────────────────────────────────────
async function demoAnimeInfo() {
    console.log(`📖 Fetching info for "${firstResultId}"...`);
    const info = await hianime.getInfo(firstResultId);
    console.log(`✅ Name: ${info.anime.info.name}`);
    console.log(`✅ Seasons: ${info.seasons.length}`);
    console.log(`✅ Recommended: ${info.recommendedAnimes.length} animes\n`);
}

// ── Example 4: Episodes ──────────────────────────────────────────────────────
async function demoEpisodes() {
    console.log(`📺 Fetching episodes for "${firstResultId}"...`);
    const eps = await hianime.getEpisodes(firstResultId);
    console.log(`✅ Total episodes: ${eps.totalEpisodes}`);
    console.log(
        `   Episode 1: "${eps.episodes[0]?.title}" (${eps.episodes[0]?.episodeId})\n`
    );
}

// ── Example 5: Error handling ────────────────────────────────────────────────
async function demoErrorHandling() {
    console.log("⚠️  Testing error handling with invalid anime ID...");
    try {
        await hianime.getInfo("this-does-not-exist-99999");
    } catch (err) {
        if (err instanceof ExtensionsError) {
            console.log(`✅ Caught ExtensionsError: [${err.status}] ${err.message} (provider: ${err.provider})\n`);
        } else {
            console.log("❌ Unexpected error type:", err);
        }
    }
}

// ── Run all demos ────────────────────────────────────────────────────────────
(async () => {
    try {
        await demoHomePage();
        await demoSearch();
        await demoEpisodes();
        await demoAnimeInfo();
        await demoErrorHandling();
        console.log("🎉 All demos completed!");
    } catch (err) {
        console.error("Fatal error:", err);
        process.exit(1);
    }
})();
