/* 共用诗卡：诗题 / 作者 / 正文（居中或竖排）/ 操作条。
 * 供今日页与收藏页复用；阅读页复用 renderBody。
 * 挂 window.TangUI.card。 */
(function () {
  'use strict';

  /* 正文（横排或竖排） */
  function renderBody(poem, opts) {
    var o = opts || {};
    var el = TangUtil.h('div', { class: 'poem-body' + (o.vertical ? ' vertical' : '') });
    (poem.paragraphs || []).forEach(function (line) {
      el.appendChild(TangUtil.h('div', { class: 'poem-line' }, [line]));
    });
    return el;
  }

  /* 收藏星标按钮（点击切换并回调刷新） */
  function starBtn(id, onChange) {
    var on = TangStore.favHas(id);
    var b = TangUtil.h('button', {
      class: 'icon-btn star-btn' + (on ? ' on' : ''),
      title: on ? TangI18n.t('ui.favRemove') : TangI18n.t('ui.favAdd'),
      'aria-pressed': on ? 'true' : 'false',
      html: on ? TangIcons.starFill : TangIcons.star,
      onclick: function () {
        var nowOn = TangStore.favToggle(id);
        b.classList.toggle('on', nowOn);
        b.setAttribute('aria-pressed', nowOn ? 'true' : 'false');
        b.innerHTML = nowOn ? TangIcons.starFill : TangIcons.star;
        b.title = nowOn ? TangI18n.t('ui.favRemove') : TangI18n.t('ui.favAdd');
        TangUI.toast(nowOn ? TangI18n.t('ui.faved') : TangI18n.t('ui.unfaved'));
        if (onChange) onChange(nowOn);
      },
    });
    return b;
  }

  function copyBtn(poem) {
    return TangUtil.h('button', {
      class: 'btn btn-sm',
      html: TangIcons.copy + '<span>' + TangUtil.esc(TangI18n.t('ui.copy')) + '</span>',
      onclick: function () {
        TangCopy.do(poem).then(function (ok) {
          TangUI.toast(ok ? TangI18n.t('ui.copied') : TangI18n.t('ui.copyFail'));
        });
      },
    });
  }

  /* 完整诗卡 */
  function card(poem, opts) {
    var o = opts || {};
    var settings = TangStore.getSettings();
    var vertical = o.vertical != null ? o.vertical : settings.vertical;

    var wrap = TangUtil.h('div', { class: 'card poem-card' });
    wrap.appendChild(TangUtil.h('h2', { class: 'poem-title' }, [poem.title]));
    wrap.appendChild(TangUtil.h('div', { class: 'poem-author' }, [
      TangUtil.h('a', { href: '#/poet/' + encodeURIComponent(poem.author), class: 'author-link' }, [poem.author]),
      ' · ' + poem.genre + (poem.yuefu ? ' · 乐府' : ''),
    ]));

    var scroll = TangUtil.h('div', { class: 'poem-scroll' }, [renderBody(poem, { vertical: vertical })]);
    wrap.appendChild(scroll);

    var actions = TangUtil.h('div', { class: 'poem-actions' }, [
      starBtn(poem.id, o.onStar),
      copyBtn(poem),
      o.tail || null,
    ]);
    wrap.appendChild(actions);
    return wrap;
  }

  window.TangUI = window.TangUI || {};
  window.TangUI.card = { card: card, renderBody: renderBody, starBtn: starBtn, copyBtn: copyBtn };
})();
