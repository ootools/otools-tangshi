/* 视图：收藏与足迹 —— Task 2 占位，Task 15 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.favorites = {
    title: function () { return TangI18n.t('favorites.title'); },
    sub: function () { return TangI18n.t('favorites.sub'); },
    render: function (el) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('favorites.sub')]));
    },
  };
})();
