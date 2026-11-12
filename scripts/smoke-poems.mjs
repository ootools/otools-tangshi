/**
 * Task 4 校验：data/src/poems.json 的正文完整性。
 * 断言的是「用户会看到的东西」——每首选诗都有正文、断句正常、序诗有小序。
 *
 * 用法：node scripts/smoke-poems.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ART = path.join(repoRoot, 'data/src/poems.json');
const INDEX = path.join(repoRoot, 'data/src/tangshi-index.json');

let failed = 0;
function check(name, cond, detail) {
  if (cond) {
    console.log(`  ok  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`);
  }
}

if (!fs.existsSync(ART)) {
  console.error('poems.json 不存在：先运行 node scripts/gen-poems.mjs');
  process.exit(1);
}

const poems = JSON.parse(fs.readFileSync(ART, 'utf8'));
const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
const byId = new Map(poems.map((p) => [p.id, p]));

console.log(`poems.json：${poems.length} 篇`);

check('篇数与篇目表一致', poems.length === index.length, `${poems.length} vs ${index.length}`);
check('id 与篇目表一一对应', index.every((e) => byId.has(e.id)));

/* 每首必须有正文 */
const empty = index.filter((e) => {
  const p = byId.get(e.id);
  return !p || !Array.isArray(p.paragraphs) || p.paragraphs.length < 2;
});
check('每首正文至少 2 句', empty.length === 0, empty.slice(0, 5).map((e) => `${e.id} ${e.title}`).join('、'));

/* 每句以标点收尾、无超长行（断行错误会让整行变成一大段） */
const badEnd = [];
const tooLong = [];
for (const e of index) {
  const p = byId.get(e.id);
  if (!p || !p.paragraphs) continue;
  for (const line of p.paragraphs) {
    if (!/[，。！？；]$/.test(line)) badEnd.push(`${e.title}: ${line.slice(0, 20)}`);
    if (line.length > 20) tooLong.push(`${e.title}: ${line.slice(0, 24)}…(${line.length})`);
  }
}
check('每句以标点收尾', badEnd.length === 0, badEnd.slice(0, 5).join(' | '));
check('无超长行（断行正常）', tooLong.length === 0, tooLong.slice(0, 5).join(' | '));

/* 序诗：有 prelude 且从正文中剥离 */
const XU_TITLES = ['贼退示官吏', '琵琶行', '燕歌行', '在狱咏蝉', '石鱼湖上醉歌'];
for (const t of XU_TITLES) {
  const e = index.find((x) => x.title === t);
  const p = e && byId.get(e.id);
  check(`序诗《${t}》有小序`, !!(p && p.prelude && p.prelude.length > 10), p ? `prelude=${p.prelude ? p.prelude.length : 'null'}` : 'missing');
  check(`序诗《${t}》正文不含序文`, !!(p && p.paragraphs.every((L) => L.length <= 20)));
}

/* 已知底本讹字已校 */
const pipa = byId.get(index.find((x) => x.title === '琵琶行').id);
check('琵琶行「浔阳」已校（非「浔言」）', pipa.paragraphs.some((L) => L.includes('浔阳')), '未找到浔阳');
check('琵琶行正文不含「浔言」', !pipa.paragraphs.some((L) => L.includes('浔言')));

/* 序文不重复计入正文（在狱咏蝉为五律，正文 8 句） */
const zaiyu = byId.get(index.find((x) => x.title === '在狱咏蝉').id);
check('在狱咏蝉正文为 8 句', zaiyu.paragraphs.length === 8, `实际 ${zaiyu.paragraphs.length}`);

/* 底本残存的编者注记不得进入正文（如「□（…）」形注字说明） */
const notes = [];
for (const p of poems) {
  for (const line of p.paragraphs) {
    if (line.includes('□') || line.includes('改为')) notes.push(`${p.id}: ${line.slice(0, 24)}`);
  }
  if (p.prelude && (p.prelude.includes('□') || p.prelude.includes('改为'))) notes.push(`${p.id} prelude`);
}
check('正文不含编者注记', notes.length === 0, notes.slice(0, 3).join(' | '));

if (failed) {
  console.error(`\n${failed} 项失败`);
  process.exit(1);
}
console.log('\n全部通过');
