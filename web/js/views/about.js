/* 视图：关于 —— Task 2 占位，Task 15 实装 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  TangViews.about = {
    title: function () { return TangI18n.t('about.title'); },
    sub: function () { return TangI18n.t('about.sub'); },
    render: function (el) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('about.sub')]));
    },
  };
})();
