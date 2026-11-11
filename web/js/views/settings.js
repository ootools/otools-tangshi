/* 视图：设置 —— Task 2 占位，Task 15 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.settings = {
    title: function () { return TangI18n.t('settings.title'); },
    sub: function () { return TangI18n.t('settings.sub'); },
    render: function (el) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('settings.sub')]));
    },
  };
})();
