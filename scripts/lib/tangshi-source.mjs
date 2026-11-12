/**
 * 《诗笺》底本归一（唯一来源）。
 * gen-index.mjs 与 gen-poems.mjs 共用：保证篇目表 id 与正文逐篇对齐，不重复映射表。
 *
 * 输入：data/src/source-300.json（底本：xuchunyang/300，源自 shiku.org）
 * 输出：按六体卷次排序、带三位 id 的规范化条目数组：
 *   [{ id, title, author, genre, yuefu, contents }]
 */
import fs from 'node:fs';
import path from 'node:path';

/* ---- 作者修正 ---- */
const AUTHOR_FIX = {
  邱为: '丘为',
  刘常卿: '刘长卿',
  刘脊虚: '刘昚虚',
  沈全期: '沈佺期',
  僧皎然: '皎然',
};

/* ---- 题目修正（底本题 → 展示题） ---- */
const TITLE_FIX = {
  '感遇四首之一': '感遇·其一',
  '感遇四首之二': '感遇·其二',
  '感遇四首之三': '感遇·其三',
  '感遇四首之四': '感遇·其四',
  '月下独酌': '月下独酌·其一',
  '梦李白二首之一': '梦李白·其一',
  '梦李白二首之二': '梦李白·其二',
  '与高适薛据登慈恩寺浮图': '与高适薛据同登慈恩寺浮图',
  '贼退示官吏并序': '贼退示官吏',
  '子夜四时歌：春歌': '子夜吴歌·春歌',
  '子夜四时歌：夏歌': '子夜吴歌·夏歌',
  '子夜四时歌：秋歌': '子夜吴歌·秋歌',
  '子夜四时歌：冬歌': '子夜吴歌·冬歌',
  '燕歌行并序': '燕歌行',
  '石鱼湖上醉歌并序': '石鱼湖上醉歌',
  '琵琶行并序': '琵琶行',
  '观公孙大娘弟子舞剑器行并序': '观公孙大娘弟子舞剑器行',
  '长相思二首之一': '长相思·其一',
  '长相思二首之二': '长相思·其二',
  '行路难三首之一': '行路难·其一',
  '行路难三首之二': '行路难·其二',
  '行路难三首之三': '行路难·其三',
  '听安万善吹筚篥歌': '听安万善吹觱篥歌',
  '在狱咏蝉并序': '在狱咏蝉',
  '和晋陵路丞早春游望': '和晋陵陆丞早春游望',
  '听蜀僧浚弹琴': '听蜀僧濬弹琴',
  '清明日宴梅道士房': '宴梅道士山房',
  '留别王侍御维': '留别王维',
  '李端公': '送李端',
  '巴山道中除夜有怀': '除夜有怀',
  '咏怀古迹五首之一': '咏怀古迹·其一',
  '咏怀古迹五首之二': '咏怀古迹·其二',
  '咏怀古迹五首之三': '咏怀古迹·其三',
  '咏怀古迹五首之四': '咏怀古迹·其四',
  '咏怀古迹五首之五': '咏怀古迹·其五',
  '遣悲怀三首之一': '遣悲怀·其一',
  '遣悲怀三首之二': '遣悲怀·其二',
  '遣悲怀三首之三': '遣悲怀·其三',
  '古意呈补阙乔知之': '独不见',
  '利洲南渡': '利州南渡',
  '自夏口至鹦洲夕望岳阳寄源中丞': '自夏口至鹦鹉洲夕望岳阳寄源中丞',
  '登柳州城楼寄漳汀封连四州刺史': '登柳州城楼寄漳汀封连四州',
  '夜思': '静夜思',
  '终南望馀雪': '终南望余雪',
  '弹琴': '听弹琴',
  '新嫁娘': '新嫁娘词',
  '秋夜寄邱员外': '秋夜寄丘员外',
  '长干行二首之一': '长干行·其一',
  '长干行二首之二': '长干行·其二',
  '塞下曲四首之一': '塞下曲·其一',
  '塞下曲四首之二': '塞下曲·其二',
  '塞下曲四首之三': '塞下曲·其三',
  '塞下曲四首之四': '塞下曲·其四',
  '下江陵': '早发白帝城',
  '送孟浩然之广陵': '黄鹤楼送孟浩然之广陵',
  '集灵台二首之一': '集灵台·其一',
  '集灵台二首之二': '集灵台·其二',
  '清平调三首之一': '清平调·其一',
  '清平调三首之二': '清平调·其二',
  '清平调三首之三': '清平调·其三',
  '赠别二首之一': '赠别·其一',
  '赠别二首之二': '赠别·其二',
  '金陵图': '台城',
  '将赴吴兴登乐游原': '将赴吴兴登乐游原一绝',
  '至德二载甫自京金光门出，问道归凤翔。乾元初从左拾遗移华州掾。与亲故别，因出此门。有悲往事。': '至德二载甫自京金光门出',
};

/* 同名异诗：按「底本题|体裁」消歧 */
const GENRE_TITLE_FIX = {
  '送别|五言绝句': '山中送别',
  '杂诗|五言律诗': '杂诗·其三',
  '杂诗|五言绝句': '杂诗·其二',
};

/* 无题六首按首行消歧 */
const WUTI_BY_PREFIX = {
  昨夜星辰昨夜风: '无题·其一',
  来是空言去绝踪: '无题·其二',
  飒飒东风细雨来: '无题·其三',
  相见时难别亦难: '无题·其四',
  凤尾香罗薄几重: '无题·其五',
  重帷深下莫愁堂: '无题·其六',
};

const AUTHOR_BY_TITLE = { 寒食: '韩翃', 已凉: '韩偓' };

/* 类型修正 */
const GENRE_FIX = { 哀王孙: '七言乐府', 哥舒歌: '五言绝句' };

const TYPE_TO_GENRE = {
  五言古诗: ['五言古诗', false],
  五言乐府: ['五言古诗', true],
  七言古诗: ['七言古诗', false],
  七言乐府: ['七言古诗', true],
  五言律诗: ['五言律诗', false],
  七言律诗: ['七言律诗', false],
  五言绝句: ['五言绝句', false],
  七言绝句: ['七言绝句', false],
};

const YUEFU_EXTRA = [
  ['凉州词', '王翰'], ['出塞', '王昌龄'], ['出塞', '王之涣'], ['长信怨', '王昌龄'],
  ['渭城曲', '王维'], ['秋夜曲', '王维'], ['清平调·其一', '李白'], ['清平调·其二', '李白'],
  ['清平调·其三', '李白'], ['金缕衣', '杜秋娘'], ['玉阶怨', '李白'], ['江南曲', '李益'],
  ['长干行·其一', '崔颢'], ['长干行·其二', '崔颢'], ['塞下曲·其一', '卢纶'], ['塞下曲·其二', '卢纶'],
  ['塞下曲·其三', '卢纶'], ['塞下曲·其四', '卢纶'],
];

const GENRE_ORDER = ['五言古诗', '七言古诗', '五言律诗', '七言律诗', '五言绝句', '七言绝句'];

function firstLine6(contents) {
  return String(contents).replace(/\s+/g, '').slice(0, 6);
}

/** 读取并归一底本，返回按卷次排序、带 id 的条目（含 contents）。 */
export function loadNormalized(repoRoot) {
  const src = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/src/source-300.json'), 'utf8'));
  const yuefuExtraSet = new Set(YUEFU_EXTRA.map(([t, a]) => t + '|' + a));

  const entries = [];
  for (const p of src) {
    let title = TITLE_FIX[p.title] ?? p.title;
    let author = AUTHOR_FIX[p.author] ?? p.author;
    if (AUTHOR_BY_TITLE[p.title]) author = AUTHOR_BY_TITLE[p.title];

    const type = GENRE_FIX[p.title] ?? p.type;
    const mapping = TYPE_TO_GENRE[type];
    if (!mapping) throw new Error(`未知类型: ${p.title} → ${type}`);
    let [genre, yuefu] = mapping;

    const genreTitle = GENRE_TITLE_FIX[p.title + '|' + p.type];
    if (genreTitle) title = genreTitle;

    if (title.startsWith('无题')) {
      const key = firstLine6(p.contents);
      const hit = Object.keys(WUTI_BY_PREFIX).find((k) => key.indexOf(k) === 0 || k.indexOf(key) === 0);
      if (!hit) throw new Error(`无题首行未匹配: ${p.title} || ${key}`);
      title = WUTI_BY_PREFIX[hit];
    }

    if (yuefuExtraSet.has(title + '|' + author)) yuefu = true;

    entries.push({ title, author, genre, yuefu, contents: p.contents });
  }

  const genreRank = new Map(GENRE_ORDER.map((g, i) => [g, i]));
  entries.sort((a, b) => {
    const ga = genreRank.get(a.genre) - genreRank.get(b.genre);
    if (ga !== 0) return ga;
    const ya = (a.yuefu ? 1 : 0) - (b.yuefu ? 1 : 0);
    if (ya !== 0) return ya;
    return 0;
  });

  return entries.map((e, i) => ({ id: String(i + 1).padStart(3, '0'), ...e }));
}

export const META = { GENRE_ORDER, GENRE_TITLE_FIX, TITLE_FIX, TYPE_TO_GENRE };
