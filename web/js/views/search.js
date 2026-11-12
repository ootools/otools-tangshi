/* 视图：检索 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  function hl(text, q) {
    if (!q) return TangUtil.esc(text);
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return TangUtil.esc(text);
    return TangUtil.esc(text.slice(0, idx)) +
      '<mark class="hl">' + TangUtil.esc(text.slice(idx, idx + q.length)) + '</mark>' +
      TangUtil.esc(text.slice(idx + q.length));
  }

  function render(el) {
    var input = TangUtil.h('input', { class: 'search-input', type: 'search', placeholder: TangI18n.t('search.placeholder'), autofocus: 'autofocus' });
    var meta = TangUtil.h('div', { class: 'search-meta' });
    var results = TangUtil.h('div', { class: 'poem-list search-results' });

    el.appendChild(TangUtil.h('div', { class: 'search-bar card' }, [input]));
    el.appendChild(meta);
    el.appendChild(results);

    var run = function () {
      var q = input.value.trim();
      results.innerHTML = '';
      meta.textContent = '';
      if (!q) return;
      var hits = TangModel.search(q);
      meta.textContent = hits.length ? '找到 ' + hits.length + ' 首' : '';
      if (!hits.length) { results.appendChild(TangUtil.h('div', { class: 'page-empty' }, [TangI18n.t('ui.empty.search')])); return; }
      hits.forEach(function (r) {
        var p = TangModel.get(r.id);
        var fieldLabel = r.fields.indexOf('title') !== -1 ? '题' : (r.fields.indexOf('author') !== -1 ? '作者' : '句');
        var snippet = r.fields.indexOf('body') !== -1 ? (p.paragraphs.find(function (l) { return l.toLowerCase().indexOf(q.toLowerCase()) !== -1; }) || p.paragraphs[0]) : p.paragraphs[0];
        results.appendChild(TangUtil.h('a', { class: 'poem-row', href: '#/read/' + p.id }, [
          TangUtil.h('span', { class: 'chip' }, [fieldLabel]),
          TangUtil.h('span', { class: 'row-title', html: hl(p.title, q) }),
          TangUtil.h('span', { class: 'row-author', html: hl(p.author, q) }),
          TangUtil.h('span', { class: 'row-first', html: hl(snippet.replace(/[，。！？]$/, ''), q) }),
        ]));
      });
    };

    var debounced = TangUtil.debounce(run, 120);
    input.addEventListener('input', debounced);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { run(); } });
    setTimeout(function () { input.focus(); }, 30);
  }

  TangViews.search = {
    title: function () { return TangI18n.t('search.title'); },
    sub: function () { return TangI18n.t('search.sub'); },
    render: render,
  };
})();
