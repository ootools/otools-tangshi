/* 视图：关于 */
(function () {
  'use strict';
  window.TangViews = window.TangViews || {};

  function stat(label, value) {
    return TangUtil.h('div', { class: 'about-stat' }, [
      TangUtil.h('div', { class: 'about-stat-num' }, [String(value)]),
      TangUtil.h('div', { class: 'about-stat-label' }, [label]),
    ]);
  }

  function render(el) {
    var poems = TangModel.all();
    var poetCount = TangModel.poetsList().length;

    el.appendChild(TangUtil.h('div', { class: 'card about-head' }, [
      TangUtil.h('div', { class: 'about-brand' }, ['诗笺']),
      TangUtil.h('div', { class: 'about-ver' }, ['Poem Scroll · v' + TangApp.version]),
      TangUtil.h('p', { class: 'about-desc' }, ['离线唐诗三百首全编：每日一诗、六体分类、即时检索、题解注释译文赏析、收藏与复制。宣纸水墨双主题，完全离线。']),
    ]));

    el.appendChild(TangUtil.h('div', { class: 'about-stats' }, [
      stat('入选诗篇', poems.length),
      stat('入选诗人', poetCount),
      stat('体裁', TangModel.genres().length),
      stat('注疏', Object.keys((window.OTANGSHI_DATA && window.OTANGSHI_DATA.ann) || {}).length),
    ]));

    el.appendChild(TangUtil.h('section', { class: 'card about-section' }, [
      TangUtil.h('h3', {}, ['底本与体例']),
      TangUtil.h('p', {}, ['篇目以蘅塘退士《唐诗三百首》通行整理本为参照，六体分卷；乐府各归其体、附于卷末。正文以通行本为准，异文于注释中说明。']),
      TangUtil.h('p', {}, ['题解、注释、译文、赏析与诗人小传均为本插件撰写，体例统一：题解交代本事诗旨，注释只标难词典故，译文为白话意译，赏析谈艺术与位置。']),
    ]));

    el.appendChild(TangUtil.h('section', { class: 'card about-section' }, [
      TangUtil.h('h3', {}, ['数据来源']),
      TangUtil.h('p', {}, ['诗篇原文取自公有领域文献（编目参考 chinese-poetry 开源语料与多种通行本）。插件不含任何网络请求，所有数据随包分发。']),
    ]));

    el.appendChild(TangUtil.h('section', { class: 'card about-section' }, [
      TangUtil.h('h3', {}, ['隐私']),
      TangUtil.h('p', {}, ['收藏、足迹与设置仅存于本机（localStorage），不上传、不追踪、无第三方服务。']),
    ]));
  }

  TangViews.about = {
    title: function () { return TangI18n.t('about.title'); },
    sub: function () { return TangI18n.t('about.sub'); },
    render: render,
  };
})();
