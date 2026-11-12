/* 视图：诗人小传 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  function render(el, params) {
    var name = params.name;
    var poet = TangModel.poet(name);
    if (!poet) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, ['未找到诗人「' + name + '」']));
      return;
    }

    var head = TangUtil.h('div', { class: 'card poet-head' }, [
      TangUtil.h('div', { class: 'poet-name' }, [poet.name]),
      TangUtil.h('div', { class: 'poet-dates' }, [poet.dates || '']),
      TangUtil.h('div', { class: 'poet-alias' }, [poet.alias || '']),
      TangUtil.h('div', { class: 'poet-bio' }, [poet.bio || '']),
      TangUtil.h('div', { class: 'poet-stat' }, ['入选 ' + poet.poems.length + ' 首']),
    ]);
    el.appendChild(head);

    el.appendChild(TangUtil.h('div', { class: 'section-title' }, ['入选篇目']));
    var list = TangUtil.h('div', { class: 'poem-list' });
    poet.poems.forEach(function (id) {
      var p = TangModel.get(id);
      if (!p) return;
      list.appendChild(TangUtil.h('a', { class: 'poem-row', href: '#/read/' + id }, [
        TangStore.favHas(id) ? TangUtil.h('span', { class: 'row-star', html: TangIcons.starFill }) : null,
        TangUtil.h('span', { class: 'row-title' }, [p.title]),
        TangUtil.h('span', { class: 'chip row-yuefu' }, [p.genre + (p.yuefu ? '·乐府' : '')]),
      ]));
    });
    el.appendChild(list);
  }

  TangViews.poet = {
    title: function (params) { return params.name || TangI18n.t('poet.title'); },
    sub: function (params) { var p = TangModel.poet(params.name); return p ? (p.dates || '') : TangI18n.t('poet.sub'); },
    render: render,
  };
})();
