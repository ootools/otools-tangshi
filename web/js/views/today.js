/* 视图：今日（每日一诗）—— Task 2 占位，Task 12 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.today = {
    title: function () { return TangI18n.t('today.title'); },
    sub: function () { return TangI18n.t('today.sub'); },
    render: function (el) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('today.sub')]));
    },
  };
})();
