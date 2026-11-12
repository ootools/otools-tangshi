/* 复制到剪贴板：优先 clipboard API，回退 execCommand。 */
(function () {
  'use strict';

  function text(poem) {
    if (!poem) return '';
    var lines = (poem.paragraphs || []).join('\n');
    return poem.title + '\n' + poem.author + '\n\n' + lines + '\n\n——《唐诗三百首》· 诗笺';
  }

  /* 同步回退：execCommand('copy') 需在同一次用户手势内完成 */
  function legacyCopy(str) {
    try {
      var ta = document.createElement('textarea');
      ta.value = str;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  function doCopy(poem) {
    var str = typeof poem === 'string' ? poem : text(poem);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(str).then(function () { return true; }, function () { return legacyCopy(str); });
    }
    return Promise.resolve(legacyCopy(str));
  }

  window.TangCopy = { text: text, do: doCopy };
})();
