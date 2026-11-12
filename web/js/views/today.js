/* 视图：今日（每日一诗） */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function render(el) {
    if (!TangModel.all().length) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, ['数据未加载']));
      return;
    }
    var id = TangModel.daily(todayStr());
    var poem = TangModel.get(id);
    TangStore.histPush(id);

    var head = TangUtil.h('div', { class: 'today-head' }, [
      TangUtil.h('span', { class: 'chip chip-accent' }, ['今日 · ' + todayStr()]),
    ]);
    el.appendChild(head);

    el.appendChild(window.TangUI.card.card(poem));

    /* 注疏摘要（题解一行，点击进入阅读页） */
    var ann = (window.OTANGSHI_DATA && window.OTANGSHI_DATA.ann && window.OTANGSHI_DATA.ann[id]) || null;
    if (ann) {
      el.appendChild(TangUtil.h('div', { class: 'today-ti card' }, [
        TangUtil.h('div', { class: 'ti-label' }, ['题解']),
        TangUtil.h('div', { class: 'ti-text' }, [ann.ti]),
      ]));
    }
    el.appendChild(TangUtil.h('div', { class: 'today-more' }, [
      TangUtil.h('a', { class: 'btn btn-primary btn-sm', href: '#/read/' + id }, ['读注疏与赏析 →']),
    ]));

    /* 近 30 天回看 */
    var ids = TangModel.dailyIds(30, todayStr()).slice(1);
    var strip = TangUtil.h('div', { class: 'lookback' });
    strip.appendChild(TangUtil.h('div', { class: 'section-title' }, [TangI18n.t('ui.lookback')]));
    var row = TangUtil.h('div', { class: 'lookback-row' });
    ids.forEach(function (pid, i) {
      var p = TangModel.get(pid);
      if (!p) return;
      var date = TangModel.addDays(todayStr(), -(i + 1));
      row.appendChild(TangUtil.h('a', { class: 'lookback-item', href: '#/read/' + pid, title: date }, [
        TangUtil.h('span', { class: 'lb-date' }, [date.slice(5)]),
        TangUtil.h('span', { class: 'lb-title' }, [p.title]),
        TangUtil.h('span', { class: 'lb-author' }, [p.author]),
      ]));
    });
    strip.appendChild(row);
    el.appendChild(strip);
  }

  TangViews.today = {
    title: function () { return TangI18n.t('today.title'); },
    sub: function () { return TangI18n.t('today.sub'); },
    render: render,
  };
})();
