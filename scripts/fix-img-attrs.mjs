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

let imgFixed = 0, fileFixed = 0;

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  const re = /<img\s+src="\/images\/([\w\-.]+)"[^>]*?>/g;
  let m, changed = false, newC = c;
  while ((m = re.exec(c))) {
    const name = m[1];
    if (!(name in dims)) continue;
    const [w, h] = dims[name].split('x');
    let tag = m[0];
    const hasW = /\swidth=/.test(tag);
    const hasLazy = /\sloading=/.test(tag);
    if (!hasW) {
      tag = tag.replace(/>$/, ' width="' + w + '" height="' + h + '">');
    }
    if (!hasLazy && !/\sfetchpriority=/.test(tag)) {
      tag = tag.replace(/>$/, ' loading="lazy">');
    }
    if (tag !== m[0]) { newC = newC.replace(m[0], tag); changed = true; imgFixed++; }
  }
  if (changed) { fs.writeFileSync(file, newC); fileFixed++; }
}
console.log('files changed:', fileFixed, 'imgs fixed:', imgFixed);
