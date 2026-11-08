const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const path = require("node:path");

function moduleFrom(file, imports, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, require: name => { if (!(name in imports)) throw Error(`Unexpected import ${name}`); return imports[name]; }, process, URLSearchParams, ...globals }, { filename: file });
  return exports;
}

async function main() {
  let checked = 0;
  const missing = () => { throw Error("NOT_FOUND"); };
  const media = { id: 1, title: "Example", genres: [] };
  let outage = false, episodeOutage = false;
  const pages = moduleFrom("src/lib/media-page.ts", {
    react: { cache: fn => fn }, "next/navigation": { notFound: missing },
    "./api": {
      fetchMediaById: async () => { if (outage) throw Error("TEMPORARY_FAILURE"); return media; },
      fetchMovieById: async () => media, isMissing: () => false,
      fetchEpisodeIndex: async () => { if (episodeOutage) throw Error("EPISODES_UNAVAILABLE"); return { episodes: [{ number: 1, state: "listed" }, { number: 2, state: "upcoming" }] }; },
    },
  });
  assert.equal((await pages.loadWatch("1", "1")).episode, 1); checked++;
  for (const episode of ["0", "2", "999999", "1.5", "9007199254740992"]) { await assert.rejects(pages.loadWatch("1", episode), /NOT_FOUND/); checked++; }
  outage = true;
  await assert.rejects(pages.loadWatch("1", "1"), /TEMPORARY_FAILURE/); checked++;
  episodeOutage = true;
  await assert.rejects(pages.detailEpisodes(media), /EPISODES_UNAVAILABLE/); checked++;
  assert.equal(await pages.detailEpisodes({...media, catalog_stale:true}), undefined); checked++;
  episodeOutage = false;

  // Drive the actual playback effect using a deterministic media clock.
  let clock = 0, interval, refCount = 0;
  const listeners = new Map(), windowListeners = new Map(), effects = [], events = [];
  const video = { currentTime: 0, playbackRate: 1, seeking: false,
    addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  const react = { useState: value => [typeof value === "function" ? value() : value, () => {}],
    useRef: value => ({ current: refCount++ === 0 ? video : value }), useEffect: fn => effects.push(fn) };
  const player = moduleFrom("src/components/VideoPlayer.tsx", {
    react, "react/jsx-runtime": { jsx: () => ({}), jsxs: () => ({}) }, "hls.js": {}, "lucide-react": {},
    "@/lib/watch-history": {}, "@/lib/analytics": { trackEvent: event => events.push(event) },
  }, { performance: { now: () => clock }, setInterval: fn => { interval = fn; return 1; }, clearInterval: () => {},
    window: { addEventListener: (key, fn) => windowListeners.set(key, fn), removeEventListener: key => windowListeners.delete(key) } });
  player.VideoPlayer({ title: "Example", streamUrl: "/video", progressItem: media, episodeNumber: 1 });
  const effect = effects.find(fn => fn.toString().includes('"watch_progress"'));
  assert.ok(effect); const cleanup = effect();
  for (let second = 1; second <= 16; second++) { clock = second * 1000; video.currentTime = second; interval(); }
  assert.equal(events.filter(event => event.event_type === "play_anime").length, 1); checked++;
  assert.equal(events.filter(event => event.event_type === "watch_progress").reduce((sum, event) => sum + event.duration_seconds, 0), 15); checked++;
  video.seeking = true; video.currentTime = 100; listeners.get("seeking")(); video.seeking = false; listeners.get("seeked")();
  clock += 1000; video.currentTime = 101; interval(); listeners.get("pause")();
  assert.equal(events.filter(event => event.event_type === "watch_progress").reduce((sum, event) => sum + event.duration_seconds, 0), 17); checked++;
  cleanup();

  const handlers = {}, requested = [];
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../public/sw.js"), "utf8"), {
    self: { addEventListener: (name, fn) => handlers[name] = fn, location: { origin: "https://example.test" } }, URL,
    caches: {}, fetch: () => { throw Error("Private request intercepted"); },
  });
  for (const url of ["/admin", "/api/admin/status", "/api/anime/1/stream/1", "/watch/1?ep=1", "/_next/static/app.js"]) {
    handlers.fetch({ request: { method: "GET", url: `https://example.test${url}` }, respondWith: () => requested.push(url) });
    checked++;
  }
  assert.equal(requested.length, 0);
  const mediaLinks = moduleFrom("src/lib/media-links.ts", {});
  const metadata = moduleFrom("src/app/series/page.tsx", {
    "@/lib/media-links": mediaLinks,
    "@/lib/seo": { SITE_URL: "https://example.test", SITE_BRAND: "Example" },
    "@/lib/api": {}, "@/components/CatalogBrowser": {},
    "react/jsx-runtime": { jsx: () => ({}), jsxs: () => ({}) },
  });
  assert.equal(metadata.generateMetadata({ searchParams: { page: "2" } }).alternates.canonical, "/series?page=2"); checked++;
  assert.equal(metadata.generateMetadata({ searchParams: { page: "2", genre: "Action" } }).robots.index, false); checked++;
  assert.equal(metadata.generateMetadata({ searchParams: {} }).robots.index, true); checked++;
  class NextResponse { constructor(body, options = {}) { this.body = body; this.status = options.status || 200; this.headers = options.headers || {}; } }
  let inventoryFails = false;
  const sitemaps = moduleFrom("src/lib/sitemaps.ts", {
    "next/server": { NextResponse }, "./seo": { SITE_URL: "https://example.test" },
  }, { fetch: async () => ({ ok: !inventoryFails, json: async () => ({ paths: ["/watch/1?ep=170&extra=value"], pages: 2 }) }) });
  const response = await sitemaps.sitemap("episodes", { nextUrl: new URL("https://example.test/sitemap-episodes.xml?page=2") });
  assert.match(response.body, /ep=170&amp;extra=value/); checked++;
  assert.doesNotMatch(response.body, /lastmod/); checked++;
  const index = await sitemaps.sitemapIndex();
  assert.match(index.body, /sitemap-episodes.xml\?page=2/); checked++;
  assert.equal((await sitemaps.sitemap("episodes", { nextUrl: new URL("https://example.test/?page=3") })).status, 404); checked++;
  inventoryFails = true;
  assert.equal((await sitemaps.sitemapIndex()).status, 503); checked++;
  const hero = moduleFrom("src/lib/hero-slides.ts", {}, { URL });
  const known = (id, extra = {}) => ({ id, title: `Anime ${id}`, poster_url: `https://images.example/${id}.jpg`, ...extra });
  const slides = hero.selectHeroSlides([known(2), known(3), known(4, { status: "NOT_YET_RELEASED" })], [known(2), known(1)]);
  assert.deepEqual(Array.from(slides, item => item.id), [2, 3, 1]); checked++;
  assert.equal(hero.matchingBanner(known(2, { banner_url: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/3-image.jpg" })), undefined); checked++;
  assert.ok(hero.matchingBanner(known(2, { banner_url: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/2-image.jpg" }))); checked++;
  assert.ok(hero.matchingBanner(known(1535, { banner_url: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg" }))); checked++;
  // Exercise the real carousel's timer, then check artwork and copy advance together.
  const state = [], carouselEffects = [];
  let slot = 0, advance;
  const carouselReact = { useState: initial => {
    const index = slot++;
    if (!(index in state)) state[index] = initial;
    return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
  }, useEffect: fn => carouselEffects.push(fn), useId: () => "carousel-test" };
  const jsx = (type, props) => ({ type, props });
  const names = moduleFrom("src/lib/media-names.ts", {});
  const carousel = moduleFrom("src/components/HeroBanner.tsx", {
    react: carouselReact, "react/jsx-runtime": { jsx, jsxs: jsx }, "next/link": {}, "lucide-react": {},
    "@/lib/schedule": { genreArabic: {} }, "./HeroImage": { HeroImage: "ARTWORK", loadHeroImage: async () => ({ image_url: "" }) },
    "./FavoriteButton": { FavoriteButton: "FAVORITE" },
    "@/lib/media-links": mediaLinks,
    "./BilingualTitle": { BilingualTitle: "BILINGUAL" }, "@/lib/media-names": names,
  }, { setTimeout: fn => { advance = fn; return 1; }, clearTimeout: () => {},
    window: { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) },
    document: { visibilityState: "visible", addEventListener() {}, removeEventListener() {} } });
  const entries = [known(10, { genres: [] }), known(20, { genres: [] })];
  function renderCarousel() { slot = 0; carouselEffects.length = 0; return carousel.HeroBanner({ items: entries }); }
  renderCarousel(); carouselEffects.find(fn => fn.toString().includes("matchMedia"))();
  renderCarousel(); carouselEffects.find(fn => fn.toString().includes("setTimeout"))(); advance();
  const advanced = renderCarousel();
  const stage = advanced.props.children;
  const screen = stage.find(child => child?.props?.className === "hero-screen");
  assert.equal(screen.props.children[0].props.children.props.item.id, 20); checked++;
  const copy = stage.find(child => child?.props?.className === "discovery-hero-copy");
  assert.equal(copy.props.children.find(child => child?.props?.className === "hero-title").props.title, "Anime 20"); checked++;
  assert.equal(copy.props.children.find(child => child?.props?.className === "discovery-hero-actions").props.children[0].props.href, "/series/20"); checked++;
  console.log(`Passed ${checked} frontend regression checks (episode validation, playback timing, private-cache exclusions).`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
