/**
 * 生成 data/src/poems.json（正文）。
 *
 * 输入：scripts/lib/tangshi-source.mjs 归一后的底本（含 contents）
 * 输出：[{ id, paragraphs: [...], prelude? }]
 *
 * 处理：
 * - 5 首带序篇目拆分小序（prelude），正文只留诗句
 * - 底本换行错位修复：正文合并后按标点重切，逐句独立成行
 * - 校勘：已知讹字按篇替换（如琵琶行「浔言」→「浔阳」）
 *
 * 用法：node scripts/gen-poems.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNormalized } from './lib/tangshi-source.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(repoRoot, 'data/src/poems.json');

/* 序诗：小序所占底本行数（序文在前、诗句在后） */
const XU_LINES = {
  贼退示官吏: 1,
  琵琶行: 5,
  燕歌行: 2,
  在狱咏蝉: 9,
  石鱼湖上醉歌: 5,
};

/* 校勘：底本讹字/编者注记 → 正字（按篇，正则替换） */
const TEXT_FIX = {
  琵琶行: [[/浔言江头/, '浔阳江头']],
  石鼓歌: [[/徒□（[^）]*）婀/, '徒媕婀']],
  积雨辋川庄作: [[/东□（[^）]*）/, '东菑']],
  长干行: [[/滟预堆/, '滟滪堆']],
  游子吟: [[/三春辉/, '三春晖']],
  '行路难·其二': [[/无嫌猜剧辛/, '无嫌猜。剧辛']],
};

/* 兜底：清除任何残留的编者注记「□（…）」 */
const EDITOR_NOTE = /□（[^）]*）/g;

const entries = loadNormalized(repoRoot);
const out = [];
const problems = [];

for (const e of entries) {
  let lines = String(e.contents).split('\n').map((s) => s.trim()).filter(Boolean);
  if (!lines.length) { problems.push(`${e.id} ${e.title}: 底本为空`); continue; }

  let prelude;
  const n = XU_LINES[e.title];
  if (n) {
    prelude = lines.slice(0, n).join('');
    lines = lines.slice(n);
  }

  let body = lines.join('');
  for (const [from, to] of TEXT_FIX[e.title] || []) body = body.replace(from, to);
  body = body.replace(EDITOR_NOTE, '');

  const paragraphs = (body.match(/[^，。！？；]+[，。！？；]/g) || []).map((s) => s.trim()).filter(Boolean);
  if (paragraphs.length < 2) { problems.push(`${e.id} ${e.title}: 断句异常(${paragraphs.length})`); continue; }

  const entry = { id: e.id, paragraphs };
  if (prelude) entry.prelude = prelude;
  out.push(entry);
}

if (problems.length) {
  console.error(`生成受阻，${problems.length} 篇有问题：`);
  problems.forEach((p) => console.error('  -', p));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 0) + '\n', 'utf8');
console.log(`poems.json 已生成：${out.length} 篇，其中带小序 ${out.filter((p) => p.prelude).length} 篇`);
