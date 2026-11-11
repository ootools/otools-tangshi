/* 视图：诗人小传 —— Task 2 占位，Task 13 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.poet = {
    title: function (params) { return (params && params.name) || TangI18n.t('poet.title'); },
    sub: function () { return TangI18n.t('poet.sub'); },
    render: function (el, params) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [(params && params.name) || TangI18n.t('poet.sub')]));
    },
  };
})();
