/**
 * Task 11 冒烟测试：model.js + store.js 的行为（node 环境，stub window）。
 * 断言的是用户会看到的行为：每日一诗稳定、检索边界不崩、收藏幂等、足迹去重、设置齐全。
 *
 * 用法：node scripts/smoke.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failed = 0;
const check = (name, cond, detail) => {
  if (cond) console.log(`  ok  ${name}`);
  else { failed += 1; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

/* ---- 构造受控运行环境：window + localStorage ---- */
function makeSandbox({ storageThrows = false } = {}) {
  const store = new Map();
  const localStorage = storageThrows
    ? { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } }
    : {
        getItem(k) { return store.has(k) ? store.get(k) : null; },
        setItem(k, v) { store.set(k, String(v)); },
        removeItem(k) { store.delete(k); },
        get _map() { return store; },
      };
  const win = { localStorage };
  win.window = win;
  const sandbox = vm.createContext(win);
  const load = (rel) => vm.runInContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), sandbox, { filename: rel });
  return { win, load, store };
}

/* ---- 测试数据：3 首，覆盖不同体裁与作者，哺乳 search/daily/genre ---- */
const DATA = {
  poems: [
    { id: '001', title: '春晓', author: '孟浩然', genre: '五言绝句', yuefu: false, paragraphs: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'] },
    { id: '002', title: '静夜思', author: '李白', genre: '五言绝句', yuefu: false, paragraphs: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'] },
    { id: '003', title: '春望', author: '杜甫', genre: '五言律诗', yuefu: false, paragraphs: ['国破山河在，', '城春草木深。'] },
  ],
  ann: { '001': { ti: 'x', zhu: [], yi: 'y', shang: 'z' } },
  poets: { 孟浩然: { dates: '689—740', alias: '襄州襄阳人', bio: '山水田园诗人' }, 李白: { dates: '701—762', alias: '字太白', bio: '诗仙' }, 杜甫: { dates: '712—770', alias: '字子美', bio: '诗圣' } },
  genres: ['五言古诗', '五言律诗', '五言绝句'],
};

function boot(opts) {
  const env = makeSandbox(opts);
  env.win.OTANGSHI_DATA = DATA;
  env.load('web/js/util.js');
  env.load('web/js/model.js');
  env.load('web/js/store.js');
  env.win.TangModel.init(env.win.OTANGSHI_DATA);
  return env;
}

console.log('model.js + store.js');

/* ---- model ---- */
{
  const { win } = boot();
  const M = win.TangModel;
  check('all() 返回全部篇目', M.all().length === 3);
  check('get() 按 id 取诗', M.get('002').title === '静夜思');
  check('byGenre() 过滤体裁', M.byGenre('五言绝句').length === 2);
  check('indexOf() 返回序号', M.indexOf('002') === 1);
  check('prev() 越界回绕到末篇', M.prev('001') === '003', String(M.prev('001')));
  check('next() 越界回绕到首篇', M.next('003') === '001', String(M.next('003')));

  const poets = M.poetsList();
  check('poetsList() 按篇目出场序', poets.map((p) => p.name).join(',') === '孟浩然,李白,杜甫', poets.map((p) => p.name).join(','));
  check('poetsList() 带入选数', poets.find((p) => p.name === '李白').count === 1);

  const poet = M.poet('李白');
  check('poet() 合并小传与作品', poet && poet.bio === '诗仙' && poet.poems.length === 1);

  /* search 边界 */
  check('search 空串返回 []', M.search('').length === 0);
  check('search 空白返回 []', M.search('   ').length === 0);
  check('search 超长 query 不抛错', Array.isArray(M.search('甲'.repeat(60))));
  check('search 命中作者', M.search('李白').some((r) => r.id === '002'));
  check('search 命中标题优先', M.search('春')[0].fields.includes('title'));
  check('search 命中正文', M.search('明月').some((r) => r.id === '002'));

  /* daily 稳定性 */
  const d1 = M.daily('2026-11-12');
  const d2 = M.daily('2026-11-12');
  check('daily 同日稳定', d1 === d2, `${d1} vs ${d2}`);
  const ids = M.dailyIds(30);
  check('dailyIds 返回 30 个', ids.length === 30);
  check('dailyIds 首项即当日', ids[0] === d1);
  check('dailyIds 无相邻重复', ids.every((v, i) => i === 0 || v !== ids[i - 1]));
}

/* ---- store：正常路径 ---- */
{
  const { win } = boot();
  const S = win.TangStore;
  check('设置默认值齐全', ['theme', 'accent', 'fontScale', 'vertical', 'notesOpen'].every((k) => k in S.getSettings()));

  S.favToggle('001');
  check('收藏后 favHas 为真', S.favHas('001') === true);
  S.favToggle('001');
  check('再切换即取消', S.favHas('001') === false);

  S.favToggle('002'); S.favToggle('003');
  check('favList 倒序（最新在前）', S.favList()[0] === '003', S.favList().join(','));

  S.histPush('001'); S.histPush('002'); S.histPush('001');
  check('足迹去重且最新置顶', S.histList()[0] === '001' && S.histList().filter((x) => x === '001').length === 1, S.histList().join(','));
  for (let i = 0; i < 50; i += 1) S.histPush(String(i).padStart(3, '0'));
  check('足迹上限 50', S.histList().length === 50, String(S.histList().length));
  S.histClear();
  check('清空足迹', S.histList().length === 0);

  S.setSetting('accent', 'daiqing');
  check('设置写入并读回', S.getSettings().accent === 'daiqing');
}

/* ---- store：localStorage 不可用（回退内存） ---- */
{
  const { win } = boot({ storageThrows: true });
  const S = win.TangStore;
  let threw = false;
  try { S.favToggle('001'); S.setSetting('theme', 'dark'); } catch (e) { threw = true; }
  check('存储不可用时不抛错', !threw);
  check('存储不可用时收藏仍生效（内存）', S.favHas('001') === true);
  check('存储不可用时设置仍生效', S.getSettings().theme === 'dark');
}

if (failed) { console.error(`\n${failed} 项失败`); process.exit(1); }
console.log('\n全部通过');
