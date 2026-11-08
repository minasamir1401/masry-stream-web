const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(file, imports = {}) {
  const exports = {};
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(compiled, { exports, process, require: name => name in imports ? imports[name] : require(name) });
  return exports;
}
const names = load("src/lib/media-names.ts");
const links = load("src/lib/media-links.ts");
const content = load("src/lib/content.ts", { "./media-names":names, "./schedule":{genreArabic:{}} });
const { mediaMetadata } = load("src/lib/media-seo.ts", { "./media-names": names, "./media-links": links, "./content":content });
const { BilingualTitle } = load("src/components/BilingualTitle.tsx", { "@/lib/media-names": names });
const media = { id: 16498, title: "Attack on Titan", title_ar: "هجوم العمالقة", title_aliases: ["اتاك اون تايتن"], original_title: "進撃の巨人", media_type: "SERIES", release_year: 2013 };
let checked = 0;
for (const [kind, suffix] of [["series", "/series/16498"], ["movie", "/movie/16498"], ["watch", "/watch/16498?ep=5"]]) {
  const data = mediaMetadata({...media, media_type:kind === "movie" ? "MOVIE" : "SERIES"}, kind, 5);
  for (const text of [data.title.absolute, data.description, data.openGraph.title, data.twitter.title]) {
    assert.match(text, /Attack on Titan/); assert.match(text, /هجوم العمالقة/); assert.doesNotMatch(text, /進撃/); checked += 3;
  }
  assert.ok(data.alternates.canonical.endsWith(suffix)); checked++;
}
const html = renderToStaticMarkup(React.createElement(BilingualTitle, { media }));
assert.match(html, /lang="en" dir="ltr">Attack on Titan/); checked++;
assert.match(html, /lang="ar" dir="rtl">هجوم العمالقة/); checked++;
assert.doesNotMatch(html, /進撃/); checked++;
for (const query of ["Attack", "هُجُوم", "العمالقه", "اتاك"]) { assert.equal(names.matchesMediaName(media, query), true); checked++; }
const old = { items: [{ title: "Death Note", original_title: "デスノート", media_type: "SERIES" }] };
names.normalizeMediaPayload(old);
assert.equal(old.items[0].original_title, ""); checked++;
assert.equal(names.mediaNames({ title: "Spy x Family", original_title: "スパイファミリー" }).label, "Spy x Family"); checked++;
const published = {...media, canonical_path:"/series/16498"};
const edited = {...published, title:"Updated title", media_type:"MOVIE", poster_url:"updated.jpg"};
assert.equal(links.mediaHref(edited), links.mediaHref(published)); checked++;
assert.equal(mediaMetadata(edited,"movie").alternates.canonical, mediaMetadata(published,"series").alternates.canonical); checked++;
assert.equal(mediaMetadata(edited,"watch",5).alternates.canonical, mediaMetadata(published,"watch",5).alternates.canonical); checked++;
assert.equal(links.mediaHref({...media,canonical_path:"https://bad.test/elsewhere"}),"/series/16498"); checked++;
const plot="مع اشتداد الطغيان في مملكة كلوفر، ينطلق أستا وفرسان السحر لإنقاذ أصدقائهم ومواجهة خطر جديد.";
const englishPlot="As tyranny engulfs the Clover Kingdom, Asta and the Magic Knights launch a desperate raid.";
const localized={...media,description:englishPlot,description_original:englishPlot,description_ar:plot,description_ar_kind:"reviewed"};
names.normalizeMediaPayload(localized);
assert.equal(localized.description,plot); checked++;
assert.equal("description_original" in localized,false); checked++;
assert.doesNotMatch(JSON.stringify(localized),/As tyranny/); checked++;
assert.equal(content.arabicSummary(localized),plot); checked++;
assert.doesNotMatch(content.arabicSummary({...media,description:englishPlot}),/As tyranny/); checked++;
assert.equal(names.isArabicText("An English plot with one word مرحبا"),false); checked++;
for(const kind of ["series","movie","watch"]){assert.match(mediaMetadata(localized,kind,5).description,/مع اشتداد الطغيان/);checked++;}
const {StoryProvenance}=load("src/components/StoryProvenance.tsx");
const {WatchSynopsis}=load("src/components/WatchSynopsis.tsx",{"@/lib/content":content,"./StoryProvenance":{StoryProvenance}});
const synopsis=renderToStaticMarkup(React.createElement(WatchSynopsis,{media:localized}));
assert.match(synopsis,/lang="ar" dir="rtl"/);checked++;
assert.match(synopsis,/مملكة كلوفر/);checked++;
assert.doesNotMatch(synopsis,/As tyranny|الوصف الأصلي/);checked++;
assert.match(renderToStaticMarkup(React.createElement(StoryProvenance,{media:{...localized,description_ar_kind:"machine"}})),/ترجمة آلية/);checked++;
console.log(`Passed ${checked} bilingual checks (SSR names, search variants, title/description/social metadata, canonicals, legacy native-name exclusion).`);
