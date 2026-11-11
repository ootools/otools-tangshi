/* 视图：诗集（分类浏览）—— Task 2 占位，Task 13 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.poems = {
    title: function () { return TangI18n.t('poems.title'); },
    sub: function () { return TangI18n.t('poems.sub'); },
    render: function (el, params) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [params && params.genre ? params.genre : TangI18n.t('poems.sub')]));
    },
  };
})();
