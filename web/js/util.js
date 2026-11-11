/* 工具函数：DOM / 字符串 / 日期 / 哈希。
 * 全部挂 window.TangUtil，供视图与逻辑层使用。 */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* 创建元素：h('div', {class:'x', onclick: fn}, [child, 'text']) */
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      if (t) clearTimeout(t);
      t = setTimeout(function () { t = null; fn.apply(self, args); }, ms);
    };
  }

  /* FNV-1a 32 位（每日一诗种子，无 crypto 依赖） */
  function fnv1a(str) {
    var hash = 0x811c9dc5;
    var s = String(str);
    for (var i = 0; i < s.length; i += 1) {
      hash ^= s.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }

  /* 'YYYY-MM-DD' */
  function dateStr(d) {
    var dt = d instanceof Date ? d : new Date();
    var m = dt.getMonth() + 1;
    var day = dt.getDate();
    return dt.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  function addDays(dateStrIn, n) {
    var parts = String(dateStrIn).split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + n);
    return dateStr(d);
  }

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  window.TangUtil = {
    $: $, $$: $$, h: h, esc: esc, debounce: debounce,
    fnv1a: fnv1a, dateStr: dateStr, addDays: addDays, clamp: clamp,
  };
})();
