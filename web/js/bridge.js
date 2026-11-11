/* OTools 宿主桥（theme / language 探测）。
 * 本插件不需要文件 I/O：桥只用于跟随宿主主题与语言；
 * 普通浏览器直开时全部功能照常，只是收不到宿主的注入。 */
(function () {
  'use strict';

  function hostAvailable() {
    var a = window.otools || window.utools;
    var t = window.__TAURI_INTERNALS__;
    return !!(a || (t && typeof t.invoke === 'function'));
  }

  function theme() {
    var cl = document.documentElement && document.documentElement.classList;
    if (!cl) return '';
    if (cl.contains('dark')) return 'dark';
    if (cl.contains('light')) return 'light';
    return '';
  }

  function language() {
    try {
      return (window.__OTOOLS_LOCALE__ && window.__OTOOLS_LOCALE__.locale) ||
        (document.documentElement && document.documentElement.lang) ||
        (typeof navigator !== 'undefined' && navigator.language) || '';
    } catch (e) { return ''; }
  }

  /* 宿主切换主题：MutationObserver 监听 documentElement class（宿主注入 dark/light）。
   * 同时防御性监听宿主可能派发的自定义事件。 */
  function onThemeChange(cb) {
    var last = theme();
    if (typeof MutationObserver === 'function') {
      new MutationObserver(function () {
        var cur = theme();
        if (cur !== last) { last = cur; cb(cur); }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
    window.addEventListener('otools-theme-changed', function (e) {
      cb((e && e.detail && e.detail.theme) || theme());
    });
  }

  function onLocaleChange(cb) {
    window.addEventListener('otools-locale-changed', function (e) {
      var loc = (e && e.detail && e.detail.locale) || language();
      document.documentElement.lang = loc;
      cb(loc);
    });
    if (typeof MutationObserver === 'function') {
      var last = document.documentElement.lang;
      new MutationObserver(function () {
        var cur = document.documentElement.lang;
        if (cur && cur !== last) { last = cur; cb(cur); }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  window.TangBridge = {
    available: hostAvailable,
    theme: theme,
    language: language,
    onThemeChange: onThemeChange,
    onLocaleChange: onLocaleChange,
  };
})();
