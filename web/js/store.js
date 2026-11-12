/* 本地存储：收藏、足迹、设置。
 * 挂 window.TangStore；localStorage 不可用（无痕/禁用）时回退内存 Map，应用照常。 */
(function () {
  'use strict';

  var PREFIX = 'otangshi.v1.';
  var memory = new Map();
  var usable = true;

  function ls() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  function rawGet(key) {
    var k = PREFIX + key;
    var s = ls();
    if (usable && s) {
      try { var v = s.getItem(k); if (v != null) return v; } catch (e) { usable = false; }
    }
    return memory.has(k) ? memory.get(k) : null;
  }

  function rawSet(key, val) {
    var k = PREFIX + key;
    memory.set(k, val);
    var s = ls();
    if (usable && s) {
      try { s.setItem(k, val); } catch (e) { usable = false; }
    }
  }

  function get(key, def) {
    var v = rawGet(key);
    if (v == null) return def;
    try { return JSON.parse(v); } catch (e) { return def; }
  }

  function set(key, val) { rawSet(key, JSON.stringify(val)); }

  /* ---- 收藏 ---- */
  function favList() { return get('fav', []); }
  function favHas(id) { return favList().indexOf(id) !== -1; }
  function favToggle(id) {
    var list = favList();
    var i = list.indexOf(id);
    if (i === -1) list.unshift(id); else list.splice(i, 1);
    set('fav', list);
    return i === -1;
  }

  /* ---- 足迹（去重置顶，上限 50） ---- */
  function histList() { return get('hist', []); }
  function histPush(id) {
    var list = histList().filter(function (x) { return x !== id; });
    list.unshift(id);
    set('hist', list.slice(0, 50));
  }
  function histClear() { set('hist', []); }

  /* ---- 设置 ---- */
  var DEFAULTS = { theme: 'auto', accent: 'zhusha', fontScale: 'm', vertical: false, notesOpen: true };
  function getSettings() {
    var s = get('settings', {}) || {};
    var out = {};
    Object.keys(DEFAULTS).forEach(function (k) { out[k] = (k in s) ? s[k] : DEFAULTS[k]; });
    return out;
  }
  function setSetting(k, v) {
    var s = getSettings();
    s[k] = v;
    set('settings', s);
    return s;
  }

  window.TangStore = {
    get: get, set: set,
    favList: favList, favHas: favHas, favToggle: favToggle,
    histList: histList, histPush: histPush, histClear: histClear,
    getSettings: getSettings, setSetting: setSetting,
  };
})();
