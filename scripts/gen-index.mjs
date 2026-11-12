/**
 * 生成规范化篇目表 data/src/tangshi-index.json。
 * 归一逻辑见 scripts/lib/tangshi-source.mjs（与 gen-poems.mjs 共用）。
 *
 * 用法：node scripts/gen-index.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNormalized, META } from './lib/tangshi-source.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(repoRoot, 'data/src/tangshi-index.json');

const entries = loadNormalized(repoRoot);
const index = entries.map(({ id, title, author, genre, yuefu }) => ({ id, title, author, genre, yuefu }));

/* 校验 */
const errors = [];
const seen = new Set();
for (const e of index) {
  const key = `${e.title}|${e.author}|${e.genre}`;
  if (seen.has(key)) errors.push(`重复条目: ${key}`);
  seen.add(key);
}
const byGenre = {};
for (const e of index) byGenre[e.genre] = (byGenre[e.genre] || 0) + 1;

/* 指纹：篇数与各体计数（改动底本或映射时即报错，防止静默漂移） */
const FINGERPRINT = { 五言古诗: 46, 七言古诗: 43, 五言律诗: 80, 七言律诗: 53, 五言绝句: 37, 七言绝句: 60 };
for (const [g, want] of Object.entries(FINGERPRINT)) {
  if (byGenre[g] !== want) errors.push(`体裁计数不符: ${g} = ${byGenre[g]}，期望 ${want}`);
}
if (index.length !== 319) errors.push(`总篇数 ${index.length} ≠ 319`);

if (errors.length) {
  console.error('篇目表校验失败：');
  errors.forEach((x) => console.error('  -', x));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(index, null, 1) + '\n', 'utf8');
console.log(`篇目表已生成: ${index.length} 首`);
console.log('  ' + META.GENRE_ORDER.map((g) => `${g} ${byGenre[g]}`).join(' · '));
console.log('  乐府 ' + index.filter((e) => e.yuefu).length + ' 首');
