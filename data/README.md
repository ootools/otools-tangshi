# 数据说明 · 诗笺

## 底本

- **篇目与正文底本**：`data/src/source-300.json` —— [xuchunyang/300](https://github.com/xuchunyang/300)《唐诗三百首》数据（源自 shiku.org），校验基线。
- **篇目校对**：与 [古文网 · 唐诗三百首](https://www.guwendao.net/gushi/tangshi.aspx) 全目录交叉比对，两个独立来源篇目一致（组诗全拆分：感遇×4、行路难×3、咏怀古迹×5、无题×6、清平调×3 等）。
- **通行本卷次**：以中华书局通行整理本篇目为参照，六体顺序：五言古诗 → 七言古诗 → 五言律诗 → 七言律诗 → 五言绝句 → 七言绝句；乐府并入所属体裁、置于各体之末（`yuefu: true`）。

## 统计（`node scripts/gen-index.mjs` / `gen-poems.mjs` / `gen-data.mjs` 校验，不符即报错）

| 体裁 | 篇数 |
| --- | --- |
| 五言古诗（含乐府 11） | 46 |
| 七言古诗（含乐府 15） | 43 |
| 五言律诗 | 80 |
| 七言律诗 | 53 |
| 五言绝句（含乐府 8） | 37 |
| 七言绝句（含乐府 11） | 60 |
| **合计** | **319** |

- 注疏（题解/注释/译文/赏析）**319/319 全覆盖，占位率 0%**（`smoke-annotations.mjs` 强制）。
- 诗人生卒/小传 77 位全覆盖。
- 正文讹字校勘 11 处（见 `scripts/gen-poems.mjs` TEXT_FIX），序文（5 篇）单独存 `prelude`，正文逐句成行。

## 规范化内容

- 体裁修正：哀王孙（底本误标五律）→ 七言古诗；哥舒歌（误标七律）→ 五言绝句。
- 作者修正：邱为→丘为、刘常卿→刘长卿、刘脊虚→刘昚虚、沈全期→沈佺期、僧皎然→皎然、韩□→韩翃/韩偓。
- 题名规范化：`X四首之一` → `X·其一`；异题归一（夜思→静夜思、下江陵→早发白帝城、弹琴→听弹琴、金陵图→台城 等）。
- 同名异诗消歧：王维《送别》（五古）与《山中送别》（五绝）、沈佺期《杂诗·其三》与王维《杂诗·其二》、李商隐六首《无题》按首行区分。

## 注疏

题解 / 注释 / 译文 / 赏析 / 诗人小传**全部为本插件自行撰写**，不采集任何站点的用户投稿内容。体例：题解 ≤120 字、注释 3–10 条（词条须见于诗文）、译文 ≤200 字、赏析 ≤150 字，`check-ann.mjs` / `smoke-annotations.mjs` 双重校验。

## 校验命令

```bash
node scripts/gen-index.mjs          # 篇目表指纹校验 + 生成
node scripts/gen-poems.mjs          # 正文抽取校勘 + 生成
node scripts/check-ann.mjs          # 注疏分块即时校验（进度查看）
node scripts/smoke-poems.mjs        # 正文完整性
node scripts/smoke-poets.mjs        # 诗人小传完整性
node scripts/smoke-annotations.mjs  # 注疏完整性（全覆盖 0% 占位）
node scripts/gen-data.mjs           # 四表对齐 + 生成 web/js/data.js
node scripts/smoke.mjs              # model/store 逻辑单测
node scripts/build-web.mjs          # 构建前端
```
