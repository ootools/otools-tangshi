/* 视图：诗集（六体分类浏览 + 诗人筛选） */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  var GENRES = ['五言古诗', '七言古诗', '五言律诗', '七言律诗', '五言绝句', '七言绝句'];

  function listItem(p) {
    var star = TangStore.favHas(p.id);
    return TangUtil.h('a', { class: 'poem-row', href: '#/read/' + p.id }, [
      star ? TangUtil.h('span', { class: 'row-star', html: TangIcons.starFill }) : null,
      TangUtil.h('span', { class: 'row-title' }, [p.title]),
      TangUtil.h('span', { class: 'row-author' }, [p.author]),
      TangUtil.h('span', { class: 'row-first' }, [(p.paragraphs[0] || '').replace(/[，。！？]$/, '')]),
      p.yuefu ? TangUtil.h('span', { class: 'chip row-yuefu' }, ['乐府']) : null,
    ]);
  }

  function render(el, params) {
    var active = params.genre || GENRES[0];
    var state = { poet: null };

    /* 体裁 tabs */
    var tabs = TangUtil.h('div', { class: 'genre-tabs' });
    GENRES.forEach(function (g) {
      tabs.appendChild(TangUtil.h('button', {
        class: 'genre-tab' + (g === active ? ' active' : ''),
        onclick: function () { TangApp.go('#/poems/' + encodeURIComponent(g)); },
      }, [g + ' ' + TangModel.byGenre(g).length]));
    });
    el.appendChild(tabs);

    var layout = TangUtil.h('div', { class: 'poems-layout' });

    /* 诗人侧栏（当前体裁内） */
    var aside = TangUtil.h('aside', { class: 'poet-filter' });
    aside.appendChild(TangUtil.h('div', { class: 'section-title' }, ['诗人']));
    var listWrap = TangUtil.h('div', { class: 'poem-list' });

    function refresh() {
      var poems = TangModel.byGenre(active);
      if (state.poet) poems = poems.filter(function (p) { return p.author === state.poet; });
      listWrap.innerHTML = '';
      if (!poems.length) listWrap.appendChild(TangUtil.h('div', { class: 'page-empty' }, ['此体裁下暂无']));
      poems.forEach(function (p) { listWrap.appendChild(listItem(p)); });
    }

    var counts = {};
    TangModel.byGenre(active).forEach(function (p) { counts[p.author] = (counts[p.author] || 0) + 1; });
    var names = TangModel.byGenre(active).reduce(function (acc, p) { if (acc.indexOf(p.author) === -1) acc.push(p.author); return acc; }, []);
    aside.appendChild(TangUtil.h('button', {
      class: 'poet-chip active',
      onclick: function (e) { state.poet = null; mark(e); refresh(); },
    }, ['全部 ' + TangModel.byGenre(active).length]));
    names.forEach(function (n) {
      aside.appendChild(TangUtil.h('button', {
        class: 'poet-chip',
        onclick: function (e) { state.poet = n; mark(e); refresh(); },
      }, [n + ' ' + counts[n]]));
    });
    function mark(e) {
      aside.querySelectorAll('.poet-chip').forEach(function (b) { b.classList.remove('active'); });
      if (e && e.currentTarget) e.currentTarget.classList.add('active');
    }

    layout.appendChild(aside);
    layout.appendChild(listWrap);
    el.appendChild(layout);
    refresh();
  }

  TangViews.poems = {
    title: function (params) { return params.genre || TangI18n.t('poems.title'); },
    sub: function () { return TangI18n.t('poems.sub'); },
    render: render,
  };
})();
