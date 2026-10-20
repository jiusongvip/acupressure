// Emits FAQPage JSON-LD from the visible accordions each page already renders.
// The <details> markup stays the single source of truth — this only mirrors it.
import fs from 'node:fs';
import path from 'node:path';

const root = 'dist';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '_astro' || e.name.startsWith('.')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html') && e.name !== '404.html') files.push(p);
  }
})(root);

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#8212': '—', '#8211': '–', '#8217': '’', '#8216': '‘', '#8220': '“', '#8221': '”' };
const decode = (s) =>
  s
    .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(parseInt(e.slice(1), e[1] === 'x' ? 16 : 10));
      return ENTITIES[e.toLowerCase()] ?? m;
    });

const text = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

let added = 0, skipped = 0;
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  if (/"@type":\s*"FAQPage"/.test(html)) { skipped++; continue; }

  // Only accordions that sit under the page's own FAQ heading count as FAQs.
  const heading = html.match(/<h2[^>]*>(?:(?!<\/h2>)[\s\S])*Frequently Asked Questions(?:(?!<\/h2>)[\s\S])*<\/h2>/i);
  if (!heading) { skipped++; continue; }
  const section = html.slice(html.indexOf(heading[0]));

  const qa = [...section.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/gi)]
    .map((m) => {
      const q = text((m[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [, ''])[1]);
      const a = text(m[1].replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, ' '));
      return q && a ? { q, a } : null;
    })
    .filter(Boolean);

  if (qa.length < 2) { skipped++; continue; }

  const json = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
  }).replace(/</g, '\\u003c');

  const tag = `<script type="application/ld+json">${json}</script>`;
  if (!/<\/head>/i.test(html)) { skipped++; continue; }
  html = html.replace(/<\/head>/i, `  ${tag}\n</head>`);
  fs.writeFileSync(f, html);
  added++;
}
console.log(`faq-schema: injected on ${added} page(s), skipped ${skipped}`);
