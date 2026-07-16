/* Inspire Talent Hub — Study Hub.
 * Grade -> Subject -> Chapter navigation over window.ITH_SYLLABUS, generating
 * chapter-wise tests from window.ITH_STUDY_Q via the shared ITHQuiz runner.
 */
(function () {
  'use strict';
  var SYL = window.ITH_SYLLABUS, QB = window.ITH_STUDY_Q || {};
  if (!SYL) return;

  function el(id) { return document.getElementById(id); }
  function ce(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function icon(name, size) { size = size || 24; return '<svg width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-' + name + '"></use></svg>'; }

  var BOARD = 'cbse';
  var state = { grade: null, subjectId: null };

  function subjects(grade) { return (SYL.tree[BOARD] && SYL.tree[BOARD][grade]) || []; }
  function subject(grade, sid) { return subjects(grade).filter(function (s) { return s.id === sid; })[0]; }
  function key(grade, sid, chapter) { return BOARD + '|' + grade + '|' + sid + '|' + slug(chapter); }
  function chapterQs(grade, sid, chapter) { return QB[key(grade, sid, chapter)] || []; }
  function readyCount(grade, sid) {
    var s = subject(grade, sid); if (!s) return 0;
    return s.chapters.filter(function (c) { return chapterQs(grade, sid, c).length > 0; }).length;
  }

  function goTo(step) {
    ['shGrade', 'shSubject', 'shChapter', 'shQuiz'].forEach(function (id) { var n = el(id); if (n) n.hidden = (id !== step); });
    updatePath(step);
    var scroller = el('shTop'); if (scroller && scroller.scrollIntoView) scroller.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }
  function reduceMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  function updatePath(step) {
    var p = el('shPath'); if (!p) return;
    var parts = [{ label: 'Class', on: function () { goTo('shGrade'); } }];
    if (state.grade) parts.push({ label: 'Class ' + state.grade, on: function () { renderSubjects(); } });
    if (state.grade && state.subjectId) { var s = subject(state.grade, state.subjectId); parts.push({ label: s ? s.name : '', on: function () { renderChapters(); } }); }
    p.innerHTML = '';
    parts.forEach(function (part, i) {
      if (i > 0) p.appendChild(ce('span', 'sh-path__sep', icon('chevron', 14)));
      var a = ce('button', 'sh-path__crumb' + (i === parts.length - 1 ? ' is-current' : ''), esc(part.label));
      a.type = 'button';
      if (i < parts.length - 1) a.addEventListener('click', part.on); else a.disabled = true;
      p.appendChild(a);
    });
  }

  // ---- Grade ----
  function renderGrades() {
    var g = el('shGradeGrid'); g.innerHTML = '';
    SYL.grades.forEach(function (grade) {
      var subs = subjects(grade).length;
      var b = ce('button', 'sh-grade', '<span class="sh-grade__n">' + grade + '</span><span class="sh-grade__l">Class ' + grade + '</span><span class="sh-grade__s">' + subs + ' subjects</span>');
      b.type = 'button';
      b.addEventListener('click', function () { state.grade = grade; state.subjectId = null; renderSubjects(); });
      g.appendChild(b);
    });
    goTo('shGrade');
  }

  // ---- Subject ----
  function renderSubjects() {
    var wrap = el('shSubjectGrid'); wrap.innerHTML = '';
    el('shSubjectTitle').textContent = 'Class ' + state.grade + ' — choose a subject';
    subjects(state.grade).forEach(function (s) {
      var total = s.chapters.length, ready = readyCount(state.grade, s.id);
      var badge = ready > 0 ? '<span class="sh-sub__ready">' + ready + ' of ' + total + ' chapters ready</span>'
                            : '<span class="sh-sub__soon">' + total + ' chapters · tests coming soon</span>';
      var b = ce('button', 'sh-sub', '<span class="sh-sub__ic">' + icon(s.icon || 'book', 26) + '</span><span class="sh-sub__body"><span class="sh-sub__name">' + esc(s.name) + '</span>' + badge + '</span><span class="sh-sub__arrow">' + icon('chevron', 20) + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () { state.subjectId = s.id; renderChapters(); });
      wrap.appendChild(b);
    });
    goTo('shSubject');
  }

  // ---- Chapter ----
  function renderChapters() {
    var s = subject(state.grade, state.subjectId); if (!s) return;
    el('shChapterTitle').textContent = 'Class ' + state.grade + ' · ' + s.name;
    var ready = readyCount(state.grade, state.subjectId), total = s.chapters.length;
    el('shChapterSub').textContent = ready > 0
      ? 'Pick a chapter to generate a test, or take a mixed test across all ready chapters.'
      : 'Chapter tests for this subject are being added. Explore the chapters below.';

    var mixBtn = el('shMixed');
    if (ready > 1) {
      mixBtn.hidden = false;
      mixBtn.querySelector('span').textContent = 'Mixed Test · ' + s.name;
    } else { mixBtn.hidden = true; }

    var list = el('shChapterList'); list.innerHTML = '';
    s.chapters.forEach(function (chapter, i) {
      var qs = chapterQs(state.grade, state.subjectId, chapter);
      var has = qs.length > 0;
      var card = ce('button', 'sh-chap' + (has ? '' : ' is-soon'),
        '<span class="sh-chap__no">' + (i + 1) + '</span>' +
        '<span class="sh-chap__name">' + esc(chapter) + '</span>' +
        (has ? '<span class="sh-chap__badge">' + qs.length + ' Qs</span><span class="sh-chap__go">' + icon('chevron', 18) + '</span>'
             : '<span class="sh-chap__soon">Coming soon</span>'));
      card.type = 'button';
      if (has) card.addEventListener('click', function () { startChapter(chapter); });
      else card.disabled = true;
      list.appendChild(card);
    });
    goTo('shChapter');
  }

  function opts() {
    var count = el('shCount') ? el('shCount').value : 'auto';
    var diff = el('shDiff') ? el('shDiff').value : 'any';
    var timed = el('shTimed') ? el('shTimed').checked : false;
    return { count: count, diff: diff, timed: timed };
  }
  function pickQuestions(pool) {
    var o = opts();
    var list = pool.filter(function (q) { return o.diff === 'any' || String(q.d) === o.diff; });
    list = shuffle(list);
    if (o.count !== 'auto' && o.count !== 'all') list = list.slice(0, Math.min(parseInt(o.count, 10), list.length));
    return list;
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function startChapter(chapter) {
    var s = subject(state.grade, state.subjectId);
    var pool = chapterQs(state.grade, state.subjectId, chapter).map(function (q) { return { q: q.q, o: q.o, a: q.a, e: q.e, d: q.d, meta: chapter }; });
    launch(pool, 'Class ' + state.grade + ' · ' + s.name + ' · ' + chapter, function () { return pickQuestions(pool); });
  }
  function startMixed() {
    var s = subject(state.grade, state.subjectId);
    var pool = [];
    s.chapters.forEach(function (chapter) {
      chapterQs(state.grade, state.subjectId, chapter).forEach(function (q) { pool.push({ q: q.q, o: q.o, a: q.a, e: q.e, d: q.d, meta: chapter }); });
    });
    launch(pool, 'Class ' + state.grade + ' · ' + s.name + ' · Mixed', function () { return pickQuestions(pool); });
  }

  function launch(pool, label, regen) {
    var picked = pickQuestions(pool);
    if (!picked.length) return;
    goTo('shQuiz');
    window.ITHQuiz.start(picked, {
      root: el('shQuizRoot'),
      timed: opts().timed,
      metaLabel: label,
      onExit: function () { renderChapters(); },
      onRetry: regen
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('shGrade')) return;
    if (el('shMixed')) el('shMixed').addEventListener('click', startMixed);
    if (el('shChapterBack')) el('shChapterBack').addEventListener('click', renderSubjects);
    if (el('shSubjectBack')) el('shSubjectBack').addEventListener('click', renderGrades);
    renderGrades();
  });
})();
