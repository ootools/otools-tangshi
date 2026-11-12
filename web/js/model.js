/* 数据模型：索引、检索、每日一诗。
 * 挂 window.TangModel；不依赖 DOM，可在 node 中测试。 */
(function () {
  'use strict';

  var poems = [];      // 全篇目（数据顺序 = 卷次顺序）
  var byId = new Map();
  var order = new Map(); // id → index
  var poets = [];      // [{name,count}] 按篇目出场序
  var poetIndex = new Map(); // name → {name,dates,alias,bio,poems:[]}
  var haystack = new Map(); // id → {title, author, body}（小写化）

  function init(data) {
    poems = (data && data.poems) || [];
    var ann = (data && data.ann) || {};
    var poetBios = (data && data.poets) || {};
    byId = new Map();
    order = new Map();
    poetIndex = new Map();
    haystack = new Map();
    var poetSeen = new Map();

    poems.forEach(function (p, i) {
      byId.set(p.id, p);
      order.set(p.id, i);
      var body = (p.paragraphs || []).join('');
      haystack.set(p.id, {
        title: p.title.toLowerCase(),
        author: p.author.toLowerCase(),
        body: body.toLowerCase(),
      });
      if (!poetSeen.has(p.author)) {
        var bio = poetBios[p.author] || {};
        var rec = { name: p.author, dates: bio.dates || '', alias: bio.alias || '', bio: bio.bio || '', poems: [] };
        poetSeen.set(p.author, rec);
        poets.push(rec);
        poetIndex.set(p.author, rec);
      }
      poetSeen.get(p.author).poems.push(p.id);
    });
    /* 补上数据里 ann 但未在 poets 列出的兜底（防御） */
    void ann;
  }

  function all() { return poems; }
  function get(id) { return byId.get(id) || null; }
  function byGenre(genre) { return poems.filter(function (p) { return p.genre === genre; }); }
  function genres() {
    var seen = [];
    poems.forEach(function (p) { if (seen.indexOf(p.genre) === -1) seen.push(p.genre); });
    return seen;
  }
  function poetsList() { return poets.map(function (r) { return { name: r.name, count: r.poems.length }; }); }
  function poet(name) { return poetIndex.get(name) || null; }
  function indexOf(id) { var i = order.get(id); return i == null ? -1 : i; }
  function prev(id) { var i = indexOf(id); if (i < 0) return null; return poems[(i - 1 + poems.length) % poems.length].id; }
  function next(id) { var i = indexOf(id); if (i < 0) return null; return poems[(i + 1) % poems.length].id; }

  /* 检索：标题 > 作者 > 正文；最多 100 条 */
  function search(q) {
    var query = String(q == null ? '' : q).trim().toLowerCase();
    if (!query) return [];
    if (query.length > 50) query = query.slice(0, 50);
    var out = [];
    for (var i = 0; i < poems.length; i += 1) {
      var p = poems[i];
      var h = haystack.get(p.id);
      var fields = [];
      var score = 0;
      if (h.title.indexOf(query) !== -1) { fields.push('title'); score += 100 - h.title.indexOf(query); }
      if (h.author.indexOf(query) !== -1) { fields.push('author'); score += 50; }
      if (h.body.indexOf(query) !== -1) { fields.push('body'); score += 10; }
      if (fields.length) out.push({ id: p.id, fields: fields, score: score });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 100).map(function (r) { return { id: r.id, fields: r.fields }; });
  }

  /* 每日一诗：确定性「置换巡游」。
   * 先把全篇目按固定种子洗牌成置换 P，第 n 天取 P[n mod N]。
   * 好处：同日稳定；相邻两日必然不同诗（置换下相邻下标不同）；每首诗恰好每 N 天轮回一次。 */
  var permCache = null;
  function buildPerm(N) {
    if (permCache && permCache.N === N) return permCache.perm;
    var perm = [];
    for (var i = 0; i < N; i += 1) perm.push(i);
    var seed = 0x9e3779b9;
    function rnd() {
      seed ^= seed << 13; seed >>>= 0;
      seed ^= seed >>> 17;
      seed ^= seed << 5; seed >>>= 0;
      return seed / 4294967296;
    }
    for (var k = N - 1; k > 0; k -= 1) {
      var j = Math.floor(rnd() * (k + 1));
      var t = perm[k]; perm[k] = perm[j]; perm[j] = t;
    }
    permCache = { N: N, perm: perm };
    return perm;
  }

  function daysSinceEpoch(dateStr) {
    var p = String(dateStr).split('-').map(Number);
    return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000);
  }

  function daily(dateStr) {
    if (!poems.length) return null;
    var d = dateStr || new Date().toISOString().slice(0, 10);
    var N = poems.length;
    var idx = ((daysSinceEpoch(d) % N) + N) % N;
    return poems[buildPerm(N)[idx]].id;
  }

  function addDays(dateStrIn, n) {
    var parts = String(dateStrIn).split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + n);
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  /* 当日 → 往前 30 天 */
  function dailyIds(n, today) {
    var base = today || new Date().toISOString().slice(0, 10);
    var out = [];
    for (var i = 0; i < (n || 30); i += 1) out.push(daily(addDays(base, -i)));
    return out;
  }

  window.TangModel = {
    init: init, all: all, get: get, byGenre: byGenre, genres: genres,
    poetsList: poetsList, poet: poet, indexOf: indexOf, prev: prev, next: next,
    search: search, daily: daily, dailyIds: dailyIds, addDays: addDays,
  };
})();
