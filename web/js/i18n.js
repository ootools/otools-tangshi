/* 多语言：zh-CN 第一语言（内容全部中文），en-US 覆盖界面骨架文案。
 * 语言来源：宿主 locale → documentElement.lang → navigator.language，默认 zh-CN。 */
(function () {
  'use strict';

  var DICT = {
    'zh-CN': {
      'nav.today': '今日',
      'nav.poems': '诗集',
      'nav.search': '检索',
      'nav.favorites': '收藏',
      'nav.settings': '设置',
      'nav.about': '关于',
      'privacy.offline': '本机存储 · 完全离线',
      'today.title': '今日',
      'today.sub': '一首诗，翻开今天',
      'poems.title': '诗集',
      'poems.sub': '三百首分体而观',
      'poet.title': '诗人',
      'poet.sub': '其人其诗',
      'reader.title': '阅读',
      'reader.sub': '诗与笺注',
      'search.title': '检索',
      'search.sub': '题中觅句，句中觅诗',
      'search.placeholder': '搜诗题、作者或诗句…',
      'favorites.title': '收藏',
      'favorites.sub': '笺上朱批，皆是心动',
      'settings.title': '设置',
      'settings.sub': '调一张趁手的书案',
      'about.title': '关于',
      'about.sub': '版本与体例',
      'ui.copy': '复制全诗',
      'ui.copied': '已复制到剪贴板',
      'ui.copyFail': '复制失败，请手动选择文本',
      'ui.favAdd': '收入收藏',
      'ui.favRemove': '移出收藏',
      'ui.faved': '已收入收藏',
      'ui.unfaved': '已移出收藏',
      'ui.prev': '上一篇',
      'ui.next': '下一篇',
      'ui.lookback': '近 30 天',
      'ui.empty.fav': '收藏夹还空着，去诗集里遇见一首诗吧',
      'ui.empty.search': '没有找到相关的诗',
      'ui.empty.hist': '暂无阅读足迹',
      'ui.hist.clear': '清空足迹',
      'ui.hist.title': '阅读足迹',
      'ui.fav.count': '{n} 首在笺',
    },
    'en-US': {
      'nav.today': 'Today',
      'nav.poems': 'Anthology',
      'nav.search': 'Search',
      'nav.favorites': 'Favorites',
      'nav.settings': 'Settings',
      'nav.about': 'About',
      'privacy.offline': 'Local storage · Fully offline',
      'today.title': 'Today',
      'today.sub': 'A poem a day',
      'poems.title': 'Anthology',
      'poems.sub': 'Three hundred Tang poems',
      'poet.title': 'Poet',
      'poet.sub': 'The poet and their poems',
      'reader.title': 'Reading',
      'reader.sub': 'Poem and annotations',
      'search.title': 'Search',
      'search.sub': 'Find a line, find a poem',
      'search.placeholder': 'Search titles, poets, verses…',
      'favorites.title': 'Favorites',
      'favorites.sub': 'Marked with cinnabar',
      'settings.title': 'Settings',
      'settings.sub': 'Set up your desk',
      'about.title': 'About',
      'about.sub': 'Version and credits',
      'ui.copy': 'Copy poem',
      'ui.copied': 'Copied to clipboard',
      'ui.copyFail': 'Copy failed, please select the text manually',
      'ui.favAdd': 'Add to favorites',
      'ui.favRemove': 'Remove from favorites',
      'ui.faved': 'Added to favorites',
      'ui.unfaved': 'Removed from favorites',
      'ui.prev': 'Previous',
      'ui.next': 'Next',
      'ui.lookback': 'Last 30 days',
      'ui.empty.fav': 'No favorites yet — go meet a poem in the anthology',
      'ui.empty.search': 'No poems found',
      'ui.empty.hist': 'No reading history',
      'ui.hist.clear': 'Clear history',
      'ui.hist.title': 'Reading history',
      'ui.fav.count': '{n} poems saved',
    },
  };

  var current = 'zh-CN';

  function normalize(loc) {
    var s = String(loc || '').toLowerCase();
    if (!s) return 'zh-CN';
    if (s.indexOf('zh') === 0) return 'zh-CN';
    if (s.indexOf('en') === 0) return 'en-US';
    return 'zh-CN';
  }

  function setLocale(loc) { current = normalize(loc); }

  function t(key, vars) {
    var d = DICT[current] || DICT['zh-CN'];
    var s = d[key] != null ? d[key] : (DICT['zh-CN'][key] != null ? DICT['zh-CN'][key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', String(vars[k])); });
    }
    return s;
  }

  function apply(root) {
    var r = root || document;
    var nodes = r.querySelectorAll ? r.querySelectorAll('[data-i18n]') : [];
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
  }

  window.TangI18n = {
    setLocale: setLocale,
    locale: function () { return current; },
    t: t,
    apply: apply,
  };
})();
