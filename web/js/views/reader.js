/* 视图：阅读页（核心）——诗题、正文、注疏四件套、上下篇导航 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  function annOf(id) {
    return (window.OTANGSHI_DATA && window.OTANGSHI_DATA.ann && window.OTANGSHI_DATA.ann[id]) || null;
  }

  function noteSection(key, label, body, openDefault, id) {
    var openKey = 'ann.' + id + '.' + key;
    var stored = TangStore.get(openKey, null);
    var open = stored == null ? !!openDefault : !!stored;
    var panel = TangUtil.h('div', { class: 'ann-panel' + (open ? ' open' : '') });
    var content = TangUtil.h('div', { class: 'ann-body' });
    if (typeof body === 'string') content.appendChild(TangUtil.h('p', {}, [body]));
    else content.appendChild(body);

    var head = TangUtil.h('button', {
      class: 'ann-head',
      'aria-expanded': open ? 'true' : 'false',
      onclick: function () {
        var nowOpen = !panel.classList.contains('open');
        panel.classList.toggle('open', nowOpen);
        head.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
        TangStore.set(openKey, nowOpen);
      },
    }, [
      TangUtil.h('span', { class: 'ann-caret' }, [open ? '▾' : '▸']),
      TangUtil.h('span', { class: 'ann-label' }, [label]),
    ]);

    panel.appendChild(content);
    return TangUtil.h('section', { class: 'ann-section' }, [head, panel]);
  }

  function annotations(poem) {
    var ann = annOf(poem.id);
    var wrap = TangUtil.h('div', { class: 'reader-ann' });
    var settings = TangStore.getSettings();

    if (poem.prelude) {
      wrap.appendChild(TangUtil.h('div', { class: 'prelude card' }, [
        TangUtil.h('div', { class: 'prelude-label' }, ['小序']),
        TangUtil.h('p', { class: 'prelude-text' }, [poem.prelude]),
      ]));
    }

    if (!ann) {
      wrap.appendChild(TangUtil.h('div', { class: 'page-empty' }, ['此篇注疏待补。']));
      return wrap;
    }

    wrap.appendChild(noteSection('ti', '题解', ann.ti, settings.notesOpen !== false, poem.id));

    if (ann.zhu && ann.zhu.length) {
      var list = TangUtil.h('ul', { class: 'zhu-list' });
      ann.zhu.forEach(function (z) {
        list.appendChild(TangUtil.h('li', {}, [
          TangUtil.h('span', { class: 'zhu-w' }, [z.w]),
          TangUtil.h('span', { class: 'zhu-v' }, [z.v]),
        ]));
      });
      wrap.appendChild(noteSection('zhu', '注释', list, false, poem.id));
    }

    wrap.appendChild(noteSection('yi', '译文', ann.yi, false, poem.id));
    wrap.appendChild(noteSection('shang', '赏析', ann.shang, false, poem.id));
    return wrap;
  }

  function render(el, params) {
    var poem = TangModel.get(params.id);
    if (!poem) {
      el.appendChild(TangUtil.h('div', { class: 'page-empty' }, ['未找到这首诗']));
      return;
    }
    TangStore.histPush(poem.id);

    /* 头部 */
    var head = TangUtil.h('div', { class: 'reader-head' }, [
      TangUtil.h('div', { class: 'reader-meta' }, [
        TangUtil.h('span', { class: 'chip' }, [poem.genre + (poem.yuefu ? ' · 乐府' : '')]),
        TangUtil.h('span', { class: 'chip' }, [poem.author]),
        TangUtil.h('span', { class: 'reader-index' }, ['第 ' + poem.id + ' / ' + TangModel.all().length + ' 首']),
      ]),
      TangUtil.h('div', { class: 'reader-tools' }, [
        window.TangUI.card.starBtn(poem.id),
        window.TangUI.card.copyBtn(poem),
        verticalToggle(poem),
      ]),
    ]);
    el.appendChild(head);

    /* 正文 */
    var settings = TangStore.getSettings();
    var vertical = settings.vertical;
    var scroll = TangUtil.h('div', { class: 'poem-scroll reader-scroll' }, [
      window.TangUI.card.renderBody(poem, { vertical: vertical }),
    ]);
    var bodyCard = TangUtil.h('div', { class: 'card poem-card' }, [
      TangUtil.h('h2', { class: 'poem-title' }, [poem.title]),
      TangUtil.h('div', { class: 'poem-author' }, [
        TangUtil.h('a', { href: '#/poet/' + encodeURIComponent(poem.author), class: 'author-link' }, [poem.author]),
      ]),
      scroll,
    ]);
    el.appendChild(bodyCard);

    /* 注疏 */
    el.appendChild(annotations(poem));

    /* 上下篇 */
    var prevId = TangModel.prev(poem.id);
    var nextId = TangModel.next(poem.id);
    var prevPoem = TangModel.get(prevId);
    var nextPoem = TangModel.get(nextId);
    el.appendChild(TangUtil.h('nav', { class: 'reader-nav' }, [
      TangUtil.h('a', { class: 'btn', href: '#/read/' + prevId, html: TangIcons.left + '<span>' + TangUtil.esc(prevPoem.title) + '</span>' }),
      TangUtil.h('a', { class: 'btn', href: '#/read/' + nextId, html: '<span>' + TangUtil.esc(nextPoem.title) + '</span>' + TangIcons.right }),
    ]));
  }

  function verticalToggle(poem) {
    var vertical = TangStore.getSettings().vertical;
    return TangUtil.h('button', {
      class: 'icon-btn' + (vertical ? ' on' : ''),
      title: '竖排 / 横排',
      html: TangIcons.vertical,
      onclick: function () {
        var v = !TangStore.getSettings().vertical;
        TangStore.setSetting('vertical', v);
        TangApp.route();
      },
    });
  }

  TangViews.reader = {
    title: function (params) { var p = TangModel.get(params.id); return p ? p.title : TangI18n.t('reader.title'); },
    sub: function (params) { var p = TangModel.get(params.id); return p ? p.author : TangI18n.t('reader.sub'); },
    render: render,
  };
})();
