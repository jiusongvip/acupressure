/**
 * fix-sitemap-lastmod.mjs
 * Replace sitemap lastmod values (currently the build timestamp) with the
 * real content-modified date from each page's Article JSON-LD, so sitemaps
 * carry truthful change hints. URLs without a dateModified keep no lastmod.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const sitemapPath = join(distDir, "sitemap-0.xml");

if (!existsSync(sitemapPath)) {
  console.log("fix-sitemap-lastmod: sitemap-0.xml not found, skipping");
  process.exit(0);
}

const sitemap = readFileSync(sitemapPath, "utf8");

const urlToLocalFile = (loc) => {
  const path = new URL(loc).pathname; // e.g. /points/li4-hegu/ or /
  const rel = path === "/" ? "index.html" : join(path, "index.html");
  return normalize(join(distDir, rel));
};

const replaceLastmod = (match, urlBlock) => {
  const locMatch = /<loc>([^<]+)<\/loc>/.exec(urlBlock);
  if (!locMatch) return match;
  const loc = locMatch[1];
  const file = urlToLocalFile(loc);
  if (!existsSync(file)) return match;

  const html = readFileSync(file, "utf8");
  const dm = /"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/.exec(html);
  if (!dm) {
    // No truthful date on the page: drop the build-timestamp lastmod.
    return match.replace(/\s*<lastmod>[^<]+<\/lastmod>/, "");
  }
  return match.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${dm[1]}</lastmod>`);
};

const updated = sitemap.replace(
  /<url>([\s\S]*?)<\/url>/g,
  (match, urlBlock) => replaceLastmod(match, urlBlock)
);

writeFileSync(sitemapPath, updated, "utf8");

const lastmods = [...updated.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
const distinct = [...new Set(lastmods)];
console.log(
  `fix-sitemap-lastmod: ${lastmods.length}/${[...updated.matchAll(/<url>/g)].length} urls keep a lastmod; distinct dates: ${distinct.sort().join(", ")}`
);
