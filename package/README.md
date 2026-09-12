# @genga-movie/aniwatch

[![npm version](https://img.shields.io/npm/v/@genga-movie/aniwatch?style=flat-square)](https://www.npmjs.com/package/@genga-movie/aniwatch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/)

A Node.js library providing high-level APIs to scrape anime information from multiple sources — inspired by [@consumet/extensions](https://github.com/consumet/consumet.ts).

> **⚠️ Disclaimer:** This is an unofficial scraper package. Content belongs to its respective owners. For personal/educational use only.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Providers](#providers)
  - [ANIME.HiAnime](#animehianime)
    - [getHomePage](#gethomepage)
    - [getAZList](#getazlist)
    - [getQtipInfo](#getqtipinfo)
    - [getInfo](#getinfo)
    - [search](#search)
    - [searchSuggestions](#searchsuggestions)
    - [getCategoryAnime](#getcategoryanime)
    - [getGenreAnime](#getgenreanime)
    - [getProducerAnimes](#getproduceranimes)
    - [getEstimatedSchedule](#getestimatedschedule)
    - [getEpisodes](#getepisodes)
    - [getNextEpisodeSchedule](#getnextepisodeschedule)
    - [getEpisodeServers](#getepisodeservers)
    - [getEpisodeSources](#getepisodesources)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Building Your Own Provider](#building-your-own-provider)
- [Development](#development)

---

## Installation

```bash
npm install @genga-movie/aniwatch
# or
yarn add @genga-movie/aniwatch
# or
pnpm add @genga-movie/aniwatch
```

**Requirements:** Node.js >= 18

---

## Quick Start

```ts
// ESM
import { ANIME, ExtensionsError } from "@genga-movie/aniwatch";

// CommonJS
const { ANIME, ExtensionsError } = require("@genga-movie/aniwatch");

const hianime = new ANIME.HiAnime();

// Search for anime
const results = await hianime.search("steins gate");
console.log(results.animes[0]);
// { id: 'steinsgate-3', name: "Steins;Gate", poster: '...', episodes: { sub: 24, dub: 24 } }

// Get streaming links
const sources = await hianime.getEpisodeSources(
  "steinsgate-3?ep=230",
  "hd-1",
  "sub"
);
console.log(sources.sources[0].url); // .m3u8 HLS stream URL
```

---

## Providers

### ANIME.HiAnime

Scrapes **[aniwatchtv.to](https://aniwatchtv.to)** — one of the most complete anime streaming sites.

```ts
import { ANIME } from "@genga-movie/aniwatch";

const hianime = new ANIME.HiAnime();
```

---

#### `getHomePage()`

Get the home page with spotlight, trending, top 10, and more.

```ts
const data = await hianime.getHomePage();
```

**Response:**
```ts
{
  genres: string[];
  spotlightAnimes: SpotlightAnime[];     // featured animes (ranked 1–10)
  trendingAnimes: TrendingAnime[];
  top10Animes: { today: Top10Anime[]; week: Top10Anime[]; month: Top10Anime[] };
  latestEpisodeAnimes: AnimeCard[];
  topUpcomingAnimes: AnimeCard[];
  topAiringAnimes: AnimeCard[];
  mostPopularAnimes: AnimeCard[];
  mostFavoriteAnimes: AnimeCard[];
  latestCompletedAnimes: AnimeCard[];
}
```

---

#### `getAZList(sortOption, page?)`

Get anime sorted alphabetically.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `sortOption` | `AZListSortOption` | `"all"` | Letter, "0-9", "all", "other" |
| `page` | `number` | `1` | Page number |

```ts
const data = await hianime.getAZList("a", 1);
// data.animes, data.totalPages, data.hasNextPage
```

---

#### `getQtipInfo(animeId)`

Get quick tooltip popup info for an anime.

```ts
const data = await hianime.getQtipInfo("one-piece-100");
// data.name, data.malscore, data.genres, data.status, data.description
```

---

#### `getInfo(animeId)`

Get full, detailed information about an anime.

```ts
const data = await hianime.getInfo("attack-on-titan-112");
// data.anime.info — name, poster, description, stats
// data.anime.moreInfo — aired, genres, status, studios
// data.seasons — list of seasons
// data.recommendedAnimes, data.relatedAnimes
```

---

#### `search(query, page?, filters?)`

Search for anime by name with optional advanced filters.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | `string` | — | Search query |
| `page` | `number` | `1` | Page number |
| `filters` | `SearchFilters` | `{}` | Advanced filters |

**Available filters:**

| Filter | Example |
|---|---|
| `type` | `"movie"`, `"tv"`, `"ova"` |
| `status` | `"finished-airing"`, `"airing"` |
| `rated` | `"pg-13"`, `"r+"` |
| `score` | `"good"`, `"very-good"` |
| `season` | `"spring"`, `"summer"`, `"fall"`, `"winter"` |
| `language` | `"sub"`, `"dub"`, `"sub-&-dub"` |
| `sort` | `"score"`, `"recently-added"` |
| `genres` | `"action,adventure"` |
| `start_date` | `"2020-4-0"` (yyyy-mm-dd, `0` = omit) |

```ts
// Basic
const data = await hianime.search("one piece");

// Advanced
const data = await hianime.search("girls", 1, {
  genres: "action,adventure",
  type: "movie",
  sort: "score",
  season: "spring",
  language: "dub",
  status: "finished-airing",
});
```

---

#### `searchSuggestions(query)`

Get search autocomplete suggestions.

```ts
const data = await hianime.searchSuggestions("monster");
// data.suggestions — [{ id, name, poster, jname, moreInfo }]
```

---

#### `getCategoryAnime(category, page?)`

Get anime by category.

**Available categories:** `"most-favorite"`, `"most-popular"`, `"subbed-anime"`, `"dubbed-anime"`, `"recently-updated"`, `"recently-added"`, `"top-upcoming"`, `"top-airing"`, `"movie"`, `"special"`, `"ova"`, `"ona"`, `"tv"`, `"completed"`

```ts
const data = await hianime.getCategoryAnime("tv", 2);
// data.animes, data.category, data.genres, data.top10Animes
```

---

#### `getGenreAnime(genreName, page?)`

Get anime by genre.

```ts
const data = await hianime.getGenreAnime("shounen", 1);
const data = await hianime.getGenreAnime("isekai", 2);
```

---

#### `getProducerAnimes(producerName, page?)`

Get anime by producer/studio.

```ts
const data = await hianime.getProducerAnimes("toei-animation", 1);
const data = await hianime.getProducerAnimes("mappa", 2);
```

---

#### `getEstimatedSchedule(date, tzOffset?)`

Get the estimated airing schedule for a date.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `string` | — | `"yyyy-mm-dd"` format |
| `tzOffset` | `number` | `-330` | Timezone offset in minutes |

```ts
const today = new Date().toISOString().split("T")[0];
const data = await hianime.getEstimatedSchedule(today);
// data.scheduledAnimes — [{ id, name, jname, time, airingTimestamp, secondsUntilAiring }]
```

---

#### `getEpisodes(animeId)`

Get the full episode list for an anime.

```ts
const data = await hianime.getEpisodes("steinsgate-3");
// data.totalEpisodes → 24
// data.episodes → [{ number, title, episodeId, isFiller }]
```

---

#### `getNextEpisodeSchedule(animeId)`

Get the next episode airing time.

```ts
const data = await hianime.getNextEpisodeSchedule("one-piece-100");
// data.airingTimestamp, data.secondsUntilAiring, data.airingISOTimestamp
```

---

#### `getEpisodeServers(episodeId)`

Get available streaming servers for an episode.

```ts
const data = await hianime.getEpisodeServers("steinsgate-0-92?ep=2055");
// data.sub  → [{ serverId, serverName }]
// data.dub  → [{ serverId, serverName }]
// data.raw  → [{ serverId, serverName }]
```

---

#### `getEpisodeSources(episodeId, server?, category?)`

Get the streaming source URLs (HLS `.m3u8`) for an episode.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `episodeId` | `string` | — | Episode ID (e.g. `"steinsgate-3?ep=230"`) |
| `server` | `AnimeServer` | `"hd-1"` | Server name |
| `category` | `EpisodeCategory` | `"sub"` | `"sub"` \| `"dub"` \| `"raw"` |

**Available servers:** `"hd-1"`, `"hd-2"`, `"megacloud"`, `"streamsb"`, `"streamtape"`, `"vidstreaming"`

```ts
const data = await hianime.getEpisodeSources(
  "steinsgate-3?ep=230",
  "hd-1",
  "sub"
);
// data.sources[0].url  → HLS .m3u8 stream URL
// data.subtitles       → [{ lang, url }]
// data.anilistID, data.malID
```

---

## Error Handling

All methods throw `ExtensionsError` on failure:

```ts
import { ANIME, ExtensionsError } from "@genga-movie/aniwatch";

const hianime = new ANIME.HiAnime();

try {
  const data = await hianime.getInfo("invalid-id-99999");
} catch (err) {
  if (err instanceof ExtensionsError) {
    console.error(err.status);   // HTTP status code (e.g. 404, 500)
    console.error(err.message);  // Human-readable message
    console.error(err.provider); // Provider ID that threw (e.g. "hianime")
  }
}
```

---

## TypeScript Support

This package ships with full TypeScript types. All types are exported from the main entry:

```ts
import type {
  AnimeCard,
  HomePage,
  SpotlightAnime,
  AnimeAboutInfo,
  AnimeEpisodes,
  EpisodeSources,
  SearchFilters,
  AnimeServer,
  EpisodeCategory,
  AZListSortOption,
  AnimeCategory,
} from "@genga-movie/aniwatch";
```

---

## Building Your Own Provider

Extend `BaseProvider` to add a new scraping source:

```ts
import {
  BaseProvider,
  HttpClient,
  ExtensionsError,
} from "@genga-movie/aniwatch";

export class MyProvider extends BaseProvider {
  readonly id = "myprovider";
  readonly name = "My Custom Provider";
  readonly baseUrl = "https://example.com";
  readonly version = "1.0.0";
  readonly isWorking = true;

  private http = new HttpClient(this.id, { baseURL: this.baseUrl });

  async search(query: string) {
    const { data: html } = await this.http.get(`/search?q=${query}`);
    // parse with cheerio...
    return { results: [] };
  }
}
```

---

## Development

```bash
# Clone and navigate to the package directory
cd package

# Install dependencies
npm install

# Build (ESM + CJS + types)
npm run build

# Watch mode (ESM only)
npm run dev

# Run tests (live integration tests)
npm test

# Run the example script
npm run example

# Type check only
npm run typecheck
```

---

## License

MIT © [solo12345689](https://github.com/solo12345689)
