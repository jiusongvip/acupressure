// 构建后处理：sitemap 首页 URL 去掉尾斜杠（首页 canonical 例外规则，trailingSlash: "always"）
// @astrojs/sitemap 的 serialize 钩子无法去掉根路径尾斜杠（new URL().toString() 会强制加回 /）
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const sitemapFiles = readdirSync(distDir).filter(
  (f) => f.startsWith("sitemap") && f.endsWith(".xml")
);

let changed = 0;
for (const file of sitemapFiles) {
  const path = join(distDir, file);
  const xml = readFileSync(path, "utf8");
  // 仅匹配根路径 <loc>https://www.example.com/</loc>，内页 URL 不受影响
  const fixed = xml.replace(/<loc>(https?:\/\/[^/]+)\/<\/loc>/g, "<loc>$1</loc>");
  if (fixed !== xml) {
    writeFileSync(path, fixed);
    changed++;
    console.log(`fix-sitemap-home: updated ${file}`);
  }
}
console.log(`fix-sitemap-home: ${changed} sitemap file(s) updated`);
