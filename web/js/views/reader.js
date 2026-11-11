/* 视图：阅读页 —— Task 2 占位，Task 14 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.reader = {
    title: function () { return TangI18n.t('reader.title'); },
    sub: function () { return TangI18n.t('reader.sub'); },
    render: function (el, params) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [(params && params.id) || TangI18n.t('reader.sub')]));
    },
  };
})();
