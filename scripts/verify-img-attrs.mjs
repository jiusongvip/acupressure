import fs from 'fs';
import path from 'path';

const dims = JSON.parse(fs.readFileSync('scripts/image-dims.json', 'utf8'));
const files = [];

(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.astro')) files.push(p);
  }
})('src');

let total = 0, noW = 0, noLazy = 0;
for (const file of files) {
  const c = fs.readFileSync(file, 'utf8');
  const re = /<img\s+src="\/images\/([\w\-.]+)"[^>]*?>/g;
  let m;
  while ((m = re.exec(c))) {
    if (!(m[1] in dims)) continue;
    total++;
    if (!/\swidth=/.test(m[0])) noW++;
    if (!/\sloading=/.test(m[0]) && !/\sfetchpriority=/.test(m[0])) noLazy++;
  }
}
console.log('total static imgs:', total, '| missing width/height:', noW, '| missing lazy:', noLazy);
