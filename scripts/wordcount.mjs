import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile() && e.name === 'index.html') out.push(p);
  }
  return out;
}

function textWords(t) {
  t = t.replace(/<script[\s\S]*?<\/script>/g, ' ');
  t = t.replace(/<style[\s\S]*?<\/style>/g, ' ');
  t = t.replace(/<svg[\s\S]*?<\/svg>/g, ' ');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
  t = t.replace(/\s+/g, ' ').trim();
  return t.split(' ').filter(Boolean).length;
}

const pages = walk(dist);
const rows = [];
for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const mainWords = mainMatch ? textWords(mainMatch[1]) : 0;
  const allWords = textWords(html);
  const rel = path.relative(dist, p).replace(/\\/g, '/').replace(/\/index\.html$/, '/');
  rows.push({ main: mainWords, all: allWords, rel });
}
rows.sort((a, b) => a.main - b.main);
console.log('main(all)  rel');
for (const r of rows) console.log(String(r.main).padStart(4), '(' + String(r.all).padStart(4) + ')', r.rel);
