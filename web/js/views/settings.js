/* 视图：设置 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  function group(title, nodes) {
    return TangUtil.h('section', { class: 'setting-group card' }, [
      TangUtil.h('div', { class: 'setting-title' }, [title]),
      TangUtil.h('div', { class: 'setting-body' }, nodes),
    ]);
  }

  function segmented(options, current, onPick) {
    var wrap = TangUtil.h('div', { class: 'segmented' });
    options.forEach(function (o) {
      wrap.appendChild(TangUtil.h('button', {
        class: 'seg-btn' + (o.value === current ? ' active' : ''),
        onclick: function () { onPick(o.value); },
      }, [o.label]));
    });
    return wrap;
  }

  function toggle(checked, onChange) {
    return TangUtil.h('button', {
      class: 'switch' + (checked ? ' on' : ''),
      role: 'switch',
      'aria-checked': checked ? 'true' : 'false',
      onclick: function (e) {
        var now = !e.currentTarget.classList.contains('on');
        e.currentTarget.classList.toggle('on', now);
        e.currentTarget.setAttribute('aria-checked', now ? 'true' : 'false');
        onChange(now);
      },
    }, [TangUtil.h('span', { class: 'switch-knob' })]);
  }

  function render(el) {
    var s = TangStore.getSettings();

    el.appendChild(group('外观 · 主题', [
      segmented([
        { value: 'auto', label: '跟随宿主' },
        { value: 'light', label: '宣纸' },
        { value: 'dark', label: '墨夜' },
      ], s.theme, function (v) {
        TangStore.setSetting('theme', v);
        document.documentElement.setAttribute('data-locked-theme', v === 'auto' ? '0' : '1');
        TangApp.applyTheme(v);
        TangApp.route();
      }),
    ]));

    el.appendChild(group('主题色', [
      TangUtil.h('div', { class: 'accent-row' }, ['zhusha', 'daiqing', 'tenghuang'].map(function (a) {
        return TangUtil.h('button', {
          class: 'accent-dot' + (s.accent === a ? ' active' : ''),
          'data-accent-pick': a,
          title: a,
          onclick: function () { TangStore.setSetting('accent', a); applyAccent(a); TangApp.route(); },
        });
      })),
    ]));

    el.appendChild(group('正文字号', [
      segmented([
        { value: 's', label: '小' },
        { value: 'm', label: '中' },
        { value: 'l', label: '大' },
      ], s.fontScale, function (v) { TangStore.setSetting('fontScale', v); applyFont(v); TangApp.route(); }),
    ]));

    el.appendChild(group('排版', [
      TangUtil.h('div', { class: 'setting-line' }, [
        TangUtil.h('span', {}, ['竖排正文（右起）']),
        toggle(s.vertical, function (v) { TangStore.setSetting('vertical', v); }),
      ]),
      TangUtil.h('div', { class: 'setting-line' }, [
        TangUtil.h('span', {}, ['注疏默认展开']),
        toggle(s.notesOpen !== false, function (v) { TangStore.setSetting('notesOpen', v); }),
      ]),
    ]));

    /* 已应用状态 */
    applyAccent(s.accent);
    applyFont(s.fontScale);
  }

  function applyAccent(a) {
    document.documentElement.setAttribute('data-accent', a);
  }
  function applyFont(f) {
    document.documentElement.setAttribute('data-font', f || 'm');
  }

  TangViews.settings = {
    title: function () { return TangI18n.t('settings.title'); },
    sub: function () { return TangI18n.t('settings.sub'); },
    render: render,
  };
  TangViews.settings.applyAccent = applyAccent;
  TangViews.settings.applyFont = applyFont;
})();
