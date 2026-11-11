/* UI 抽象：toast。 */
(function () {
  'use strict';

  var toastRoot = null;

  function toast(msg, ms) {
    if (!toastRoot) toastRoot = document.getElementById('toast-root');
    if (!toastRoot) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastRoot.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, ms || 1800);
  }

  window.TangUI = { toast: toast };
})();
