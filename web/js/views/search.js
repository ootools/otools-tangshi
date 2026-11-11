/* 视图：检索 —— Task 2 占位，Task 15 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.search = {
    title: function () { return TangI18n.t('search.title'); },
    sub: function () { return TangI18n.t('search.sub'); },
    render: function (el) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('search.sub')]));
    },
  };
})();
