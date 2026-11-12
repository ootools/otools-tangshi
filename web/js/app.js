/* 应用入口：hash 路由 + 导航 + 主题/语言初始化。 */
(function () {
  'use strict';

  var APP_VERSION = '1.0.0';

  /* ---- 路由表 ---- */
  var ROUTES = [
    { re: /^#\/today$/, view: 'today', nav: 'today' },
    { re: /^#\/poems$/, view: 'poems', nav: 'poems', params: function () { return {}; } },
    { re: /^#\/poems\/([^/]+)$/, view: 'poems', nav: 'poems', params: function (m) { return { genre: decodeURIComponent(m[1]) }; } },
    { re: /^#\/poet\/([^/]+)$/, view: 'poet', nav: 'poems', params: function (m) { return { name: decodeURIComponent(m[1]) }; } },
    { re: /^#\/read\/([^/]+)$/, view: 'reader', nav: 'poems', params: function (m) { return { id: decodeURIComponent(m[1]) }; } },
    { re: /^#\/search$/, view: 'search', nav: 'search' },
    { re: /^#\/favorites$/, view: 'favorites', nav: 'favorites' },
    { re: /^#\/settings$/, view: 'settings', nav: 'settings' },
    { re: /^#\/about$/, view: 'about', nav: 'about' },
  ];

  var NAV_ITEMS = [
    { key: 'today', hash: '#/today', icon: 'today' },
    { key: 'poems', hash: '#/poems', icon: 'poems' },
    { key: 'search', hash: '#/search', icon: 'search' },
    { key: 'favorites', hash: '#/favorites', icon: 'favorites' },
    { key: 'settings', hash: '#/settings', icon: 'settings' },
    { key: 'about', hash: '#/about', icon: 'about' },
  ];

  function parseHash(hash) {
    var h = hash || '#/today';
    for (var i = 0; i < ROUTES.length; i += 1) {
      var m = h.match(ROUTES[i].re);
      if (m) {
        return {
          view: ROUTES[i].view,
          nav: ROUTES[i].nav,
          params: ROUTES[i].params ? ROUTES[i].params(m) : {},
        };
      }
    }
    return { view: 'today', nav: 'today', params: {} };
  }

  function renderNav(activeKey) {
    var nav = TangUtil.$('#nav');
    if (!nav) return;
    nav.innerHTML = '';
    NAV_ITEMS.forEach(function (item) {
      var icon = TangIcons[item.icon] || '';
      nav.appendChild(TangUtil.h('button', {
        class: 'nav-item' + (item.key === activeKey ? ' active' : ''),
        onclick: function () { TangApp.go(item.hash); },
        html: icon + '<span>' + TangUtil.esc(TangI18n.t('nav.' + item.key)) + '</span>',
      }));
    });
  }

  function route() {
    var loc = parseHash(location.hash);
    var v = TangViews[loc.view];
    var el = TangUtil.$('#view');
    var titleEl = TangUtil.$('#page-title');
    var subEl = TangUtil.$('#page-sub');
    if (!v || !el) return;
    el.innerHTML = '';
    renderNav(loc.nav);
    if (titleEl) titleEl.textContent = v.title(loc.params);
    if (subEl) subEl.textContent = v.sub(loc.params);
    v.render(el, loc.params);
    el.scrollTop = 0;
  }

  window.TangApp = {
    version: APP_VERSION,
    route: route,
    go: function (hash) {
      if (location.hash === hash) route();
      else location.hash = hash;
    },
    /* 主题应用：mode 'auto' 跟随宿主注入；'light'/'dark' 锁定。Task 15 的设置页复用。 */
    applyTheme: function (mode) {
      var hostTheme = TangBridge.theme();
      var effective = mode === 'auto' ? (hostTheme || 'light') : mode;
      document.documentElement.setAttribute('data-theme', effective);
      return effective;
    },
  };

  function init() {
    /* 语言初始化：宿主 locale → html lang → navigator */
    TangI18n.setLocale(TangBridge.language());
    TangI18n.apply();

    /* 数据初始化 */
    if (window.OTANGSHI_DATA) TangModel.init(window.OTANGSHI_DATA);

    /* 恢复已保存的设置 */
    var settings = TangStore.getSettings();
    document.documentElement.setAttribute('data-locked-theme', settings.theme === 'auto' ? '0' : '1');
    TangApp.applyTheme(settings.theme);
    if (TangViews.settings) {
      TangViews.settings.applyAccent(settings.accent);
      TangViews.settings.applyFont(settings.fontScale);
    }

    TangBridge.onLocaleChange(function (loc) {
      TangI18n.setLocale(loc);
      TangI18n.apply();
      route();
    });

    TangBridge.onThemeChange(function () {
      /* 仅 auto 模式响应宿主切换；锁定态（light/dark）忽略 —— Review Focus 5 */
      if (document.documentElement.getAttribute('data-locked-theme') !== '1') {
        TangApp.applyTheme('auto');
      }
    });

    var ver = TangUtil.$('#side-version');
    if (ver) ver.textContent = 'v' + APP_VERSION + ' · 三百首';

    window.addEventListener('hashchange', route);
    if (!location.hash) location.hash = '#/today';
    route();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
