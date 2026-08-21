import fs from 'node:fs';

const files = [
  'src/pages/conditions/acupressure-for-anxiety.astro',
  'src/pages/conditions/acupressure-for-headache.astro',
  'src/pages/conditions/acupressure-for-sleep.astro',
  'src/pages/conditions/acupressure-for-nausea.astro',
  'src/pages/conditions/acupressure-for-migraine.astro',
  'src/pages/conditions/acupressure-for-back-pain.astro',
  'src/pages/conditions/acupressure-for-neck-pain.astro',
  'src/pages/conditions/acupressure-for-constipation.astro',
  'src/pages/safety/acupressure-pregnancy.astro',
  'src/pages/safety/who-should-avoid-acupressure.astro',
  'src/pages/research/does-acupressure-work.astro',
  'src/pages/basics/how-does-acupressure-work.astro',
  'src/pages/basics/what-is-acupressure.astro',
  'src/pages/basics/benefits-of-acupressure.astro',
  'src/pages/basics/acupressure-vs-acupuncture.astro',
  'src/pages/basics/acupressure-vs-massage.astro',
  'src/pages/techniques/how-to-do-acupressure.astro',
  'src/pages/history.astro',
  'src/pages/about.astro',
  'src/pages/index.astro',
];

const re = /\s\?(?=[a-z])/g;
let total = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const matches = [...t.matchAll(re)];
  if (matches.length) {
    console.log(`\n${f}: ${matches.length} corruption(s)`);
    for (const m of matches.slice(0, 8)) {
      console.log('  ...' + t.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\n/g, ' ') + '...');
    }
    total += matches.length;
  }
}
console.log(`\nTotal: ${total}`);