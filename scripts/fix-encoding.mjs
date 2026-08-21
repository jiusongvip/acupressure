import fs from 'node:fs';

const files = [
  'src/pages/conditions/acupressure-for-anxiety.astro',
  'src/pages/conditions/acupressure-for-headache.astro',
  'src/pages/conditions/acupressure-for-sleep.astro',
  'src/pages/conditions/acupressure-for-nausea.astro',
];

const re = / \?(?=[a-z])/g;
let total = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const n = (t.match(re) || []).length;
  if (n > 0) {
    const fixed = t.replace(re, ' — ');
    fs.writeFileSync(f, fixed);
    console.log(`${f}: fixed ${n}`);
    total += n;
  }
}
console.log(`Total fixed: ${total}`);