# 诗笺 · 唐诗三百首（otools-tangshi）

> 离线唐诗三百首全编：每日一诗、六体分类、即时检索、题解注释译文赏析、收藏与复制，宣纸水墨双主题。

OTools 独立插件 · 默认以 panel（980×700）模式打开。

## 特性

- **今日**：按日期确定性轮换的每日一诗，30 天回看；同日稳定、相邻不重复、每 319 天一轮。
- **诗集**：六体分类（五古/七古/五律/七律/五绝/七绝，乐府随体标注），体裁内按诗人筛选；诗人页附生卒、字号、定评与入选篇目。
- **阅读页**：正文横竖排可切换（竖排右起）、注疏四件套（题解/注释/译文/赏析）独立折叠记忆、上下篇顺卷次导航。
- **检索**：标题/作者/正文即时搜索，命中字段徽标与高亮，标题>作者>正文排序，上限 100 条。
- **收藏与足迹**：收藏夹、最近浏览 50 条，localStorage 持久化；存储不可用时自动回退内存。
- **复制**：一键复制全诗（含出处），clipboard API 优先、execCommand 回退。
- **主题**：宣纸/墨夜双主题（可锁定，默认跟随宿主），朱砂/黛青/藤黄三色主题色，字号三档。
- **完全离线**：零运行时网络请求、零 npm 依赖，`data.js` 431 KB 随包分发。

## 数据

- 篇目 319 首（组诗全拆分），六体卷次以中华书局通行整理本为参照，与 guwendao 全目录交叉比对。
- 正文经逐篇校勘（11 处讹字修正），5 篇序文单独呈现。
- 注疏四件套 + 77 位诗人小传全部为本插件撰写，319/319 全覆盖（校验强制 0% 占位）。

详见 [data/README.md](data/README.md)。

## 快速开始

```bash
node scripts/gen-data.mjs      # 从 data/src 生成 web/js/data.js（校验四表对齐）
node scripts/build-web.mjs     # 构建 dist/
node scripts/serve-dist.mjs    # 本地预览（浏览器直开，宿主桥降级可用）
```

（可选）同步到 OTools 主仓库本地试跑——本插件默认**独立仓库交付**，不预设进宿主；也可直接安装 `dist-pack/*.oplg`：

```bash
pwsh -File scripts/deploy-to-otools.ps1 -OtoolsRoot /path/to/OTools
```

> 「浏览器直开」指以 http 方式打开 dist（serve-dist）；双击 `file://` 打开不受支持（多文件脚本受 Chromium 限制）。

## 打包与发布

```bash
node scripts/pack-plugin.mjs --out dist-pack --version 1.0.0
node scripts/verify-plugin.mjs dist-pack
```

CI：push/PR 构建 `dist/`；push tag `v*`（须与 `plugin.json` 的 `version` 一致）触发打包上架。一次性配置（仓库 secrets/market 变量）见模板 README。

## 目录结构

```
otools-tangshi/
├── plugin.json          # 插件清单（openMode: panel, 980×700）
├── logo.svg
├── scripts/             # 构建/校验/打包（模板同款）+ 数据管线
│   └── lib/tangshi-source.mjs   # 底本归一（gen-index/gen-poems 共用）
├── data/
│   ├── src/             # 底本 + 篇目表 + 正文 + 诗人 + 注疏分块
│   └── README.md        # 数据说明与校验命令
└── web/                 # 纯前端（原生 JS，零依赖）
    ├── index.html  css/app.css
    └── js/              # util/bridge/i18n/icons/ui/data/model/store/copy/card + views
```
