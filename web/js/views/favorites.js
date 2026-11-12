/* 视图：收藏与阅读足迹 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  function row(id, extra) {
    var p = TangModel.get(id);
    if (!p) return null;
    return TangUtil.h('a', { class: 'poem-row', href: '#/read/' + id }, [
      TangUtil.h('span', { class: 'row-title' }, [p.title]),
      TangUtil.h('span', { class: 'row-author' }, [p.author]),
      extra || null,
    ]);
  }

  function render(el) {
    /* 收藏 */
    var favs = TangStore.favList();
    el.appendChild(TangUtil.h('div', { class: 'section-title' }, [
      TangI18n.t('favorites.title'),
      TangUtil.h('span', { class: 'count-badge' }, [String(favs.length)]),
    ]));
    var favList = TangUtil.h('div', { class: 'poem-list' });
    if (!favs.length) favList.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('ui.empty.fav')]));
    favs.forEach(function (id) {
      var r = row(id, TangUtil.h('button', {
        class: 'icon-btn', title: TangI18n.t('ui.favRemove'), html: TangIcons.starFill,
        onclick: function (e) { e.preventDefault(); e.stopPropagation(); TangStore.favToggle(id); TangApp.route(); },
      }));
      if (r) favList.appendChild(r);
    });
    el.appendChild(favList);

    /* 足迹 */
    var hist = TangStore.histList();
    var histHead = TangUtil.h('div', { class: 'section-title' }, [
      TangI18n.t('ui.hist.title'),
      TangUtil.h('span', { class: 'count-badge' }, [String(hist.length)]),
      hist.length ? TangUtil.h('button', {
        class: 'btn btn-ghost btn-sm section-action', html: TangIcons.trash + '<span>' + TangUtil.esc(TangI18n.t('ui.hist.clear')) + '</span>',
        onclick: function () { TangStore.histClear(); TangApp.route(); },
      }) : null,
    ]);
    el.appendChild(histHead);
    var histList = TangUtil.h('div', { class: 'poem-list' });
    if (!hist.length) histList.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('ui.empty.hist')]));
    hist.forEach(function (id) { var r = row(id); if (r) histList.appendChild(r); });
    el.appendChild(histList);
  }

  TangViews.favorites = {
    title: function () { return TangI18n.t('favorites.title'); },
    sub: function () { return TangI18n.t('favorites.sub'); },
    render: render,
  };
})();
