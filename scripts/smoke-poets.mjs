/**
 * Task 5 校验：data/src/poets.json 诗人小传完整性。
 * 断言的是用户会看到的东西：每位作者都有一张卡、生卒与定评俱全、篇幅合规。
 *
 * 用法：node scripts/smoke-poets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ART = path.join(repoRoot, 'data/src/poets.json');
const INDEX = path.join(repoRoot, 'data/src/tangshi-index.json');

let failed = 0;
const check = (name, cond, detail) => {
  if (cond) console.log(`  ok  ${name}`);
  else { failed += 1; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

if (!fs.existsSync(ART)) {
  console.error('poets.json 不存在：先撰写 data/src/poets.json');
  process.exit(1);
}

const poets = JSON.parse(fs.readFileSync(ART, 'utf8'));
const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
const authors = [...new Set(index.map((e) => e.author))];

console.log(`poets.json：${Object.keys(poets).length} 位，篇目表作者 ${authors.length} 位`);

const missing = authors.filter((a) => !poets[a]);
check('每位入选作者都有小传', missing.length === 0, missing.join('、'));

const extra = Object.keys(poets).filter((a) => !authors.includes(a));
check('无多余条目', extra.length === 0, extra.join('、'));

const noDates = [];
const longBio = [];
const noBio = [];
for (const a of authors) {
  const p = poets[a];
  if (!p) continue;
  if (!p.dates || !String(p.dates).trim()) noDates.push(a);
  if (!p.bio || String(p.bio).trim().length < 8) noBio.push(a);
  if (p.bio && String(p.bio).length > 80) longBio.push(`${a}(${String(p.bio).length})`);
}
check('生卒/年代非空', noDates.length === 0, noDates.join('、'));
check('定评非空且 ≥8 字', noBio.length === 0, noBio.join('、'));
check('定评 ≤80 字', longBio.length === 0, longBio.join('、'));

const noAlias = authors.filter((a) => poets[a] && !(poets[a].alias || '').trim());
check('字号/籍贯信息非空', noAlias.length === 0, noAlias.join('、'));

check('「无名氏」单列且说明归属', !!(poets['无名氏'] && /选本|无名|佚名/.test(poets['无名氏'].bio)));

if (failed) { console.error(`\n${failed} 项失败`); process.exit(1); }
console.log('\n全部通过');
