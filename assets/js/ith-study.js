/* Inspire Talent Hub — Study Hub.
 * Grade -> Subject -> Chapter -> chapter hub (Notes / Flashcards / Match / Test /
 * Worksheet), over window.ITH_SYLLABUS + window.ITH_STUDY_Q + window.ITH_STUDY_CONTENT.
 */
(function () {
  'use strict';
  var SYL = window.ITH_SYLLABUS, QB = window.ITH_STUDY_Q || {}, CT = window.ITH_STUDY_CONTENT || {};
  var QBK = window.ITH_QBANK || {};   // premium authored question bank (educator-grade)
  if (!SYL) return;

  function el(id) { return document.getElementById(id); }
  function ce(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function icon(name, size) { size = size || 24; return '<svg width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-' + name + '"></use></svg>'; }
  function reduceMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var BOARD = 'cbse';
  var state = { grade: null, subjectId: null, chapter: null };

  function activeBoards() {
    return (SYL.boards || []).filter(function (b) { return b.active && SYL.tree[b.id]; });
  }

  function subjects(grade) { return (SYL.tree[BOARD] && SYL.tree[BOARD][grade]) || []; }
  function subject(grade, sid) { return subjects(grade).filter(function (s) { return s.id === sid; })[0]; }
  function key(grade, sid, chapter) { return BOARD + '|' + grade + '|' + sid + '|' + slug(chapter); }
  function chapterQs(grade, sid, chapter) { return QB[key(grade, sid, chapter)] || []; }
  // Premium authored bank for this chapter (or null). When present, the exam
  // engine draws its subjective sections from real, educator-written questions
  // and model answers instead of generic chapter-name prompts.
  function bank(grade, sid, chapter) { return QBK[key(grade, sid, chapter)] || null; }
  // Authored content (CT) is always preferred. When a chapter has questions but no
  // hand-written flashcards / notes, we derive them from the question bank so every
  // open chapter offers Revision Notes and Flashcards, not just a test.
  function derive(grade, sid, chapter) {
    var qs = chapterQs(grade, sid, chapter);
    if (!qs.length) return { cards: [], notes: [] };
    var cards = qs.map(function (q) { return { f: q.q, b: q.o[q.a] + (q.e ? ' — ' + q.e : '') }; });
    var seen = {}, notes = [];
    qs.forEach(function (q) {
      var t = q.e || (q.q + ' ' + q.o[q.a]);
      if (t && !seen[t]) { seen[t] = 1; notes.push(t); }
    });
    return { cards: cards, notes: notes };
  }
  function content(grade, sid, chapter) {
    var authored = CT[key(grade, sid, chapter)] || {};
    var base = derive(grade, sid, chapter);
    var authoredCards = authored.cards && authored.cards.length;
    var authoredNotes = authored.notes && authored.notes.length;
    return {
      cards: authoredCards ? authored.cards : base.cards,
      notes: authoredNotes ? authored.notes : base.notes,
      formulas: authored.formulas || [],
      // Match-up needs short term/meaning pairs; only authored card sets qualify.
      authoredCards: !!authoredCards
    };
  }
  function hasCards(g, s, c) { var x = content(g, s, c).cards; return x && x.length; }
  function hasNotes(g, s, c) { var x = content(g, s, c); return (x.notes && x.notes.length) || (x.formulas && x.formulas.length); }
  function isOpen(g, s, c) { return chapterQs(g, s, c).length > 0 || hasCards(g, s, c) || hasNotes(g, s, c); }
  function readyCount(grade, sid) {
    var s = subject(grade, sid); if (!s) return 0;
    return s.chapters.filter(function (c) { return isOpen(grade, sid, c); }).length;
  }

  var STEPS = ['shGrade', 'shSubject', 'shChapter', 'shHub', 'shTool'];
  function goTo(step) {
    STEPS.forEach(function (id) { var n = el(id); if (n) n.hidden = (id !== step); });
    updatePath();
    var t = el('shTop'); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function updatePath() {
    var p = el('shPath'); if (!p) return;
    var parts = [{ label: 'Class', on: renderGrades }];
    if (state.grade) parts.push({ label: 'Class ' + state.grade, on: renderSubjects });
    if (state.grade && state.subjectId) { var s = subject(state.grade, state.subjectId); parts.push({ label: s ? s.name : '', on: renderChapters }); }
    if (state.chapter) parts.push({ label: state.chapter, on: renderHub });
    p.innerHTML = '';
    parts.forEach(function (part, i) {
      if (i > 0) p.appendChild(ce('span', 'sh-path__sep', icon('chevron', 14)));
      var a = ce('button', 'sh-path__crumb' + (i === parts.length - 1 ? ' is-current' : ''), esc(part.label));
      a.type = 'button';
      if (i < parts.length - 1) a.addEventListener('click', part.on); else a.disabled = true;
      p.appendChild(a);
    });
  }

  // ---- Board switcher ----
  function renderBoards() {
    var host = el('shBoards'); if (!host) return;
    var boards = activeBoards();
    host.innerHTML = '';
    // Only show the switcher when more than one board is available.
    if (boards.length < 2) { host.hidden = true; return; }
    host.hidden = false;
    boards.forEach(function (bd) {
      var b = ce('button', 'sh-board' + (bd.id === BOARD ? ' is-active' : ''), esc(bd.name));
      b.type = 'button';
      b.setAttribute('aria-pressed', bd.id === BOARD ? 'true' : 'false');
      b.addEventListener('click', function () {
        if (BOARD === bd.id) return;
        BOARD = bd.id; renderGrades();
      });
      host.appendChild(b);
    });
  }

  // ---- Grade ----
  function renderGrades() {
    state.grade = null; state.subjectId = null; state.chapter = null;
    // If the current board has no tree (e.g. a default that is inactive), fall back.
    if (!SYL.tree[BOARD]) { var ab = activeBoards()[0]; if (ab) BOARD = ab.id; }
    renderBoards();
    var g = el('shGradeGrid'); g.innerHTML = '';
    SYL.grades.forEach(function (grade) {
      var b = ce('button', 'sh-grade', '<span class="sh-grade__n">' + grade + '</span><span class="sh-grade__l">Class ' + grade + '</span><span class="sh-grade__s">' + subjects(grade).length + ' subjects</span>');
      b.type = 'button';
      b.addEventListener('click', function () { state.grade = grade; state.subjectId = null; state.chapter = null; renderSubjects(); });
      g.appendChild(b);
    });
    goTo('shGrade');
  }

  // ---- Subject ----
  function renderSubjects() {
    state.chapter = null;
    var wrap = el('shSubjectGrid'); wrap.innerHTML = '';
    el('shSubjectTitle').textContent = 'Class ' + state.grade + ' — choose a subject';
    subjects(state.grade).forEach(function (s) {
      var total = s.chapters.length, ready = readyCount(state.grade, s.id);
      var badge = ready > 0 ? '<span class="sh-sub__ready">' + ready + ' of ' + total + ' chapters ready</span>'
                            : '<span class="sh-sub__soon">' + total + ' chapters · content coming soon</span>';
      var b = ce('button', 'sh-sub', '<span class="sh-sub__ic">' + icon(s.icon || 'book', 26) + '</span><span class="sh-sub__body"><span class="sh-sub__name">' + esc(s.name) + '</span>' + badge + '</span><span class="sh-sub__arrow">' + icon('chevron', 20) + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () { state.subjectId = s.id; renderChapters(); });
      wrap.appendChild(b);
    });
    goTo('shSubject');
  }

  // ---- Chapter list ----
  function renderChapters() {
    state.chapter = null;
    var s = subject(state.grade, state.subjectId); if (!s) return;
    el('shChapterTitle').textContent = 'Class ' + state.grade + ' · ' + s.name;
    var ready = readyCount(state.grade, state.subjectId);
    el('shChapterSub').textContent = ready > 0 ? 'Open a chapter to study with notes, flashcards, a match game and tests.'
      : 'Learning content for this subject is being added. Explore the chapters below.';
    var list = el('shChapterList'); list.innerHTML = '';
    s.chapters.forEach(function (chapter, i) {
      var open = isOpen(state.grade, state.subjectId, chapter);
      var card = ce('button', 'sh-chap' + (open ? '' : ' is-soon'),
        '<span class="sh-chap__no">' + (i + 1) + '</span><span class="sh-chap__name">' + esc(chapter) + '</span>' +
        (open ? '<span class="sh-chap__badge">Study</span><span class="sh-chap__go">' + icon('chevron', 18) + '</span>' : '<span class="sh-chap__soon">Coming soon</span>'));
      card.type = 'button';
      if (open) card.addEventListener('click', function () { state.chapter = chapter; renderHub(); });
      else card.disabled = true;
      list.appendChild(card);
    });
    goTo('shChapter');
  }

  // ---- Chapter hub (tool tiles) ----
  function renderHub() {
    var g = state.grade, sid = state.subjectId, ch = state.chapter, s = subject(g, sid);
    el('shHubTitle').textContent = ch;
    el('shHubSub').textContent = 'Class ' + g + ' · ' + (s ? s.name : '') + ' — choose how to study.';
    var tools = el('shHubTools'); tools.innerHTML = '';
    var qn = chapterQs(g, sid, ch).length, ct = content(g, sid, ch);
    var cards = ct.cards || [], notes = ct.notes || [], formulas = ct.formulas || [];

    if (notes.length || formulas.length) tools.appendChild(tile('book', 'Revision Notes', notes.length + (formulas.length ? ' points · ' + formulas.length + ' formulas' : ' key points'), showNotes));
    if (cards.length) tools.appendChild(tile('feather', 'Important Definitions', cards.length + ' key terms explained', showDefinitions));
    if (formulas.length) tools.appendChild(tile('chart', 'Formula Sheet', formulas.length + ' formulas to remember', showFormulas));
    if (cards.length) tools.appendChild(tile('star', 'Flashcards', cards.length + ' cards to flip & learn', launchFlash));
    if (ct.authoredCards && cards.length >= 3) tools.appendChild(tile('grad', 'Match-up Game', 'Match terms to meanings, beat the clock', launchMatch));
    if (qn) tools.appendChild(tile('chart', 'Practice Test', qn + ' questions with instant feedback', launchTest));
    if (notes.length) tools.appendChild(tile('check', 'True or False', 'Quick concept check with instant feedback', launchTrueFalse));
    if (cards.length >= 4) tools.appendChild(tile('pen', 'Fill in the Blanks', 'Recall key terms and definitions', launchFillBlank));
    if (qn) tools.appendChild(tile('medal', 'Exam Paper (80 marks)', 'Full CBSE annual-exam paper · print / PDF', printWorksheet));
    if (notes.length || cards.length) tools.appendChild(tile('shield', 'Exam Tips & Common Mistakes', 'Score better — what to focus on', showExamTips));

    goTo('shHub');
  }
  function tile(ic, name, sub, fn) {
    var b = ce('button', 'sh-tool', '<span class="sh-tool__ic">' + icon(ic, 26) + '</span><span class="sh-tool__name">' + esc(name) + '</span><span class="sh-tool__sub">' + esc(sub) + '</span>');
    b.type = 'button'; b.addEventListener('click', fn); return b;
  }

  function metaLabel() { var s = subject(state.grade, state.subjectId); return 'Class ' + state.grade + ' · ' + (s ? s.name : '') + ' · ' + state.chapter; }
  function toolRoot() { el('shToolBack').onclick = renderHub; goTo('shTool'); return el('shToolRoot'); }

  // ---- Interactive test: setup screen + device-local history ----
  function lsGet(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function attemptKey() { return BOARD + '|' + state.grade + '|' + state.subjectId + '|' + slug(state.chapter); }

  // Rich, varied MCQ pool for the interactive test (authored + generated, with difficulty).
  function testPool() {
    return objectivePool(state.grade, state.subjectId, state.chapter).map(function (o) {
      return o.ar
        ? { q: 'Assertion (A): ' + o.A + '  Reason (R): ' + o.R, o: AR_OPTS.slice(), a: o.a, e: 'Evaluate the truth of A and R separately, then choose.', meta: state.chapter, diff: 3 }
        : { q: o.q, o: o.o.slice(), a: o.a, e: o.e, meta: state.chapter, diff: o.diff || 2 };
    });
  }

  function launchTest() {
    var pool = testPool();
    if (!pool.length) return;
    var root = toolRoot();
    var attempts = (lsGet('ith_attempts', {})[attemptKey()] || []);
    var wrong = (lsGet('ith_wrong', {})[attemptKey()] || []);
    function seg(v, label, on) { return '<button type="button" class="ts__opt' + (on ? ' is-on' : '') + '" data-v="' + v + '">' + esc(label) + '</button>'; }
    var counts = ['5', '10', '20', 'All'];
    root.innerHTML = '<div class="ts">' +
      '<div class="ts__head"><span class="notes__tag">Practice Test</span><h2 class="ts__title">' + esc(state.chapter) + '</h2><p class="ts__meta">' + esc(metaLabel()) + ' · ' + pool.length + ' questions available</p></div>' +
      '<div class="ts__grp"><span class="ts__lbl">Difficulty</span><div class="ts__seg" data-ts-diff>' + seg('mixed', 'Mixed', true) + seg('1', 'Easy') + seg('2', 'Medium') + seg('3', 'Hard') + '</div></div>' +
      '<div class="ts__grp"><span class="ts__lbl">Questions</span><div class="ts__seg" data-ts-count>' + counts.map(function (c, i) { return seg(c, c, i === 1); }).join('') + '</div></div>' +
      '<div class="ts__grp"><span class="ts__lbl">Mode</span><div class="ts__seg" data-ts-mode>' + seg('practice', 'Practice · instant feedback', true) + seg('exam', 'Exam · results at end') + '</div></div>' +
      '<div class="ts__actions"><button type="button" class="btn btn-gold hover-target" data-ts-start><span>Start Test</span></button>' +
      (wrong.length ? '<button type="button" class="btn btn-outline text-gold hover-target" data-ts-retry><span>Retry my ' + wrong.length + ' incorrect</span></button>' : '') + '</div>' +
      (attempts.length ? '<div class="ts__hist"><h3 class="notes__h3">Your recent attempts <span class="ts__note">— saved on this device only</span></h3><ul class="ts__list">' +
        attempts.slice(-5).reverse().map(function (a) { return '<li><span>' + esc(a.date) + '</span><b>' + a.correct + '/' + a.total + ' · ' + a.pct + '%</b></li>'; }).join('') + '</ul>' +
        (attempts[attempts.length - 1].pct < 60 ? '<p class="ts__weak">' + icon('shield', 18) + ' Focus area — revise the Notes and Definitions, then try again.</p>' : '') + '</div>' : '') +
      '</div>';
    root.querySelectorAll('.ts__seg').forEach(function (sg) {
      sg.addEventListener('click', function (e) { var b = e.target.closest('.ts__opt'); if (!b) return; sg.querySelectorAll('.ts__opt').forEach(function (x) { x.classList.remove('is-on'); }); b.classList.add('is-on'); });
    });
    function val(name) { var on = root.querySelector('[data-ts-' + name + '] .ts__opt.is-on'); return on ? on.getAttribute('data-v') : null; }
    root.querySelector('[data-ts-start]').addEventListener('click', function () { startFiltered(pool, val('diff'), val('count'), val('mode')); });
    var rt = root.querySelector('[data-ts-retry]'); if (rt) rt.addEventListener('click', function () { startQuiz(shuffle(wrong.slice()), val('mode') || 'practice'); });
  }

  function startFiltered(pool, diff, count, mode) {
    var list = pool.slice();
    if (diff && diff !== 'mixed') { var f = list.filter(function (q) { return String(q.diff) === diff; }); if (f.length >= 3) list = f; }
    list = shuffle(list);
    var n = count === 'All' ? list.length : Math.min(parseInt(count, 10) || 10, list.length);
    startQuiz(list.slice(0, n), mode);
  }

  function startQuiz(list, mode) {
    if (!list.length) return;
    window.ITHQuiz.start(list, {
      root: toolRoot(), metaLabel: metaLabel(), instant: mode !== 'exam',
      onExit: launchTest, onRetry: function () { return null; },
      onFinish: function (res) { saveAttempt(res); }
    });
  }

  function saveAttempt(res) {
    var all = lsGet('ith_attempts', {}), k = attemptKey(), arr = all[k] || [];
    arr.push({ date: new Date().toLocaleDateString(), correct: res.correct, total: res.total, pct: res.pct });
    all[k] = arr.slice(-10); lsSet('ith_attempts', all);
    var w = lsGet('ith_wrong', {}); w[k] = (res.wrong || []).slice(0, 20); lsSet('ith_wrong', w);
  }
  function launchFlash() {
    var cards = (content(state.grade, state.subjectId, state.chapter).cards || []).map(function (c) { return { f: c.f, b: c.b }; });
    if (!cards.length) return;
    window.ITHFlash.start(cards, { root: toolRoot(), title: metaLabel(), onExit: renderHub });
  }
  function launchMatch() {
    var cards = (content(state.grade, state.subjectId, state.chapter).cards || []).map(function (c) { return { f: c.f, b: c.b }; });
    if (cards.length < 3) return;
    window.ITHMatch.start(cards, { root: toolRoot(), title: metaLabel(), onExit: renderHub });
  }

  // ---- Notes view ----
  function showNotes() {
    var ct = content(state.grade, state.subjectId, state.chapter);
    var notes = ct.notes || [], formulas = ct.formulas || [];
    var html = '<article class="notes">' +
      '<div class="notes__head"><span class="notes__tag">Revision Notes</span><h2 class="notes__title">' + esc(state.chapter) + '</h2><p class="notes__meta">' + esc(metaLabel()) + '</p></div>';
    if (notes.length) {
      html += '<h3 class="notes__h3">Key Points</h3><ul class="notes__list">';
      notes.forEach(function (n) { html += '<li>' + esc(n) + '</li>'; });
      html += '</ul>';
    }
    if (formulas.length) {
      html += '<h3 class="notes__h3">Formulas to Remember</h3><div class="notes__formulas">';
      formulas.forEach(function (f) { html += '<div class="notes__formula"><span class="notes__fname">' + esc(f.n) + '</span><span class="notes__fexpr">' + esc(f.x) + '</span></div>'; });
      html += '</div>';
    }
    html += '<div class="notes__cta">';
    if (hasCards(state.grade, state.subjectId, state.chapter)) html += '<button type="button" class="btn btn-gold hover-target" data-n-flash><span>Practise with Flashcards</span></button>';
    if (chapterQs(state.grade, state.subjectId, state.chapter).length) html += '<button type="button" class="btn btn-outline text-gold hover-target" data-n-test><span>Take the Test</span></button>';
    html += '</div></article>';
    var root = toolRoot(); root.innerHTML = html;
    var f = root.querySelector('[data-n-flash]'); if (f) f.addEventListener('click', launchFlash);
    var t = root.querySelector('[data-n-test]'); if (t) t.addEventListener('click', launchTest);
  }

  // ---- Important Definitions ----
  function showDefinitions() {
    var cards = dedupeCards(content(state.grade, state.subjectId, state.chapter).cards);
    var rows = cards.map(function (c) {
      return '<div class="defs__row"><dt class="defs__term">' + esc(cleanTerm(c.f)) + '</dt><dd class="defs__def">' + esc(c.b) + '</dd></div>';
    }).join('');
    var root = toolRoot();
    root.innerHTML = '<article class="notes"><div class="notes__head"><span class="notes__tag">Important Definitions</span>' +
      '<h2 class="notes__title">' + esc(state.chapter) + '</h2><p class="notes__meta">' + esc(metaLabel()) + '</p></div>' +
      '<dl class="defs">' + rows + '</dl>' +
      '<p class="result-note" style="margin-top:var(--spacing-6)">Learn these key terms first — they are the backbone of your answers and MCQs.</p></article>';
  }

  // ---- Formula Sheet ----
  function showFormulas() {
    var formulas = content(state.grade, state.subjectId, state.chapter).formulas || [];
    var rows = formulas.map(function (f) {
      return '<div class="notes__formula"><span class="notes__fname">' + esc(f.n) + '</span><span class="notes__fexpr">' + esc(f.x) + '</span></div>';
    }).join('');
    var root = toolRoot();
    root.innerHTML = '<article class="notes"><div class="notes__head"><span class="notes__tag">Formula Sheet</span>' +
      '<h2 class="notes__title">' + esc(state.chapter) + '</h2><p class="notes__meta">' + esc(metaLabel()) + '</p></div>' +
      '<div class="notes__formulas">' + rows + '</div>' +
      '<p class="result-note" style="margin-top:var(--spacing-6)">Revise every formula before the exam and practise substituting values.</p></article>';
  }

  // ---- True / False (interactive) ----
  function launchTrueFalse() {
    var ct = content(state.grade, state.subjectId, state.chapter);
    var notes = ct.notes || [], cards = dedupeCards(ct.cards), items = [];
    shuffle(notes.slice()).slice(0, 6).forEach(function (n) {
      items.push({ q: n, o: ['True', 'False'], a: 0, e: 'Correct — this is a true statement.' });
    });
    if (cards.length >= 2) {
      var cs = shuffle(cards.slice());
      for (var i = 0; i < Math.min(6, cs.length); i++) {
        var c1 = cs[i], c2 = cs[(i + 1) % cs.length]; if (c1 === c2) continue;
        items.push({ q: cap(cleanTerm(c1.f)) + ' is ' + lc(stripDot(c2.b)) + '.', o: ['True', 'False'], a: 1,
          e: 'False — ' + cap(cleanTerm(c1.f)) + ' is ' + lc(stripDot(c1.b)) + '.' });
      }
    }
    items = shuffle(items).slice(0, 10);
    if (!items.length) return;
    window.ITHQuiz.start(items, { root: toolRoot(), metaLabel: metaLabel() + ' · True or False', onExit: renderHub, onRetry: function () { return shuffle(items); } });
  }

  // ---- Fill in the Blanks (interactive) ----
  function launchFillBlank() {
    var cards = dedupeCards(content(state.grade, state.subjectId, state.chapter).cards);
    var terms = cards.map(function (c) { return cleanTerm(c.f); }), items = [];
    cards.forEach(function (c, i) {
      if (/\?$/.test(c.f)) return;
      var term = cleanTerm(c.f), ot = terms.filter(function (t, j) { return j !== i && t !== term; });
      if (ot.length < 3) return;
      var opts = shuffle([term].concat(shuffle(ot).slice(0, 3)));
      items.push({ q: 'Fill in the blank: “______” is ' + lc(stripDot(c.b)) + '.', o: opts, a: opts.indexOf(term), e: 'Answer: ' + term });
    });
    items = shuffle(items);
    if (!items.length) return;
    window.ITHQuiz.start(items, { root: toolRoot(), metaLabel: metaLabel() + ' · Fill in the Blanks', onExit: renderHub, onRetry: function () { return shuffle(items); } });
  }

  // ---- Exam Tips & Common Mistakes ----
  function showExamTips() {
    var ct = content(state.grade, state.subjectId, state.chapter);
    var cards = dedupeCards(ct.cards), s = subject(state.grade, state.subjectId);
    var keyTerms = cards.slice(0, 8).map(function (c) { return cleanTerm(c.f); });
    // "Don't confuse" pairs from adjacent terms.
    var confusions = [];
    for (var i = 0; i + 1 < Math.min(6, cards.length); i += 2) {
      confusions.push('Don’t confuse <strong>' + esc(cleanTerm(cards[i].f)) + '</strong> with <strong>' + esc(cleanTerm(cards[i + 1].f)) + '</strong> — re-read both definitions.');
    }
    var tips = [
      'Read every question twice and underline command words (define, explain, analyse, justify).',
      'For 1-mark MCQs, eliminate the clearly wrong options first, then choose.',
      'In assertion-reason questions, check the truth of A and R separately before deciding the relation.',
      'Write answers to the point — for a 3-mark question give about three clear points.',
      'For case-based questions, always refer back to the passage in your answer.',
      'Show every step in numerical answers; you earn marks for method, not just the final value.',
      'Keep the last 10 minutes to revise and check that no question is left blank.'
    ];
    var mistakes = [
      'Leaving competency / application questions for the end and then running out of time.',
      'Writing everything you know instead of answering exactly what is asked.',
      'Mixing up similar key terms — learn the exact definitions.',
      'Forgetting units and labels in Science and Maths answers.'
    ].concat(confusions);
    var root = toolRoot();
    root.innerHTML = '<article class="notes"><div class="notes__head"><span class="notes__tag">Exam Tips &amp; Common Mistakes</span>' +
      '<h2 class="notes__title">' + esc(state.chapter) + '</h2><p class="notes__meta">' + esc(metaLabel()) + '</p></div>' +
      (keyTerms.length ? '<h3 class="notes__h3">Focus on these key terms</h3><p class="tips__terms">' + keyTerms.map(function (t) { return '<span class="tips__chip">' + esc(t) + '</span>'; }).join('') + '</p>' : '') +
      '<h3 class="notes__h3">Exam tips</h3><ul class="notes__list">' + tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<h3 class="notes__h3">Common mistakes to avoid</h3><ul class="notes__list tips__mistakes">' + mistakes.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul></article>';
  }

  // ===== CBSE 80-mark question-paper engine =====
  // Sections A (objective 1m incl. assertion-reason & competency) · B VSA (2m) · C SA (3m)
  // · D Medium (4m) · E Long (5m, flex) · F three Case/Source-based studies (5m each).
  // Total is always exactly 80; Section E absorbs any shortfall in Section A.
  var LET = ['A', 'B', 'C', 'D', 'E', 'F'];
  var AR_OPTS = [
    'Both A and R are true and R is the correct explanation of A',
    'Both A and R are true but R is not the correct explanation of A',
    'A is true but R is false',
    'A is false but R is true'
  ];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function ansLines(n) { return '<div class="ws__lines ws__lines--' + n + '" aria-hidden="true"></div>'; }
  function cleanTerm(f) { return String(f).replace(/[:?.\s]+$/, '').trim(); }
  function lc(s) { s = String(s).trim(); return s.charAt(0).toLowerCase() + s.slice(1); }
  function cap(s) { s = String(s).trim(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function stripDot(s) { return String(s).replace(/[.\s]+$/, ''); }
  function normKey(s) { return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }
  function shuffleOpts(item) {
    var correct = item.o[item.a], o = shuffle(item.o.slice());
    return { q: item.q, o: o, a: o.indexOf(correct), e: item.e, comp: item.comp, diff: item.diff };
  }
  // Build four DISTINCT options (correct + 3 unique distractors) or null if not possible.
  function fourOpts(correct, distractorPool) {
    var seen = {}; seen[normKey(correct)] = 1; var d = [];
    shuffle(distractorPool.slice()).forEach(function (x) { var k = normKey(x); if (seen[k]) return; seen[k] = 1; d.push(x); });
    if (d.length < 3) return null;
    return shuffle([correct].concat(d.slice(0, 3)));
  }
  // Split a marks total into long-answer chunks, each between 3 and 5 marks.
  function splitMarks(total) {
    var out = [];
    while (total > 0) {
      if (total >= 8) { out.push(5); total -= 5; }
      else if (total === 7) { out.push(4, 3); total = 0; }
      else if (total === 6) { out.push(3, 3); total = 0; }
      else { out.push(total); total = 0; }
    }
    return out;
  }

  // Drop flashcards whose term repeats, so no question is generated twice.
  function dedupeCards(cards) {
    var seen = {}, out = [];
    (cards || []).forEach(function (c) { var k = normKey(cleanTerm(c.f)); if (seen[k]) return; seen[k] = 1; out.push(c); });
    return out;
  }
  // Build a large, de-duplicated objective (MCQ + assertion-reason) pool for a chapter.
  function objectivePool(g, sid, ch) {
    var ct = content(g, sid, ch), cards = dedupeCards(ct.cards);
    var backs = cards.map(function (c) { return c.b; });
    var terms = cards.map(function (c) { return cleanTerm(c.f); });
    // How often each definition appears — reverse MCQs are only safe when the
    // definition maps to exactly one term (otherwise two options would be correct).
    var backFreq = {};
    cards.forEach(function (c) { var k = normKey(stripDot(c.b)); backFreq[k] = (backFreq[k] || 0) + 1; });
    var pool = [], seen = {};
    function add(it, k) { k = normKey(k); if (seen[k]) return; seen[k] = 1; pool.push(it); }

    // 0) Premium authored bank MCQs + assertion-reason (highest quality first).
    var bk = bank(g, sid, ch);
    if (bk) {
      (bk.mcq || []).forEach(function (q) {
        add(shuffleOpts({ q: q.q, o: q.o.slice(), a: q.a, e: q.e || '', comp: !!q.comp, diff: q.d || 2 }), q.q);
      });
      (bk.ar || []).forEach(function (r, i) {
        add({ ar: true, A: r.A, R: r.R, a: r.a, comp: true, diff: 3 }, 'bank-ar-' + i);
      });
    }
    // 1) Authored MCQs (options randomised; keep their authored difficulty).
    chapterQs(g, sid, ch).forEach(function (q) {
      add(shuffleOpts({ q: q.q, o: q.o.slice(), a: q.a, e: q.e, comp: false, diff: q.d || 2 }), q.q);
    });
    // 2) Card-forward MCQs: describe the term (recall). Options guaranteed distinct.
    cards.forEach(function (c, i) {
      var term = cleanTerm(c.f), od = backs.filter(function (b, j) { return j !== i && b !== c.b; });
      var opts = fourOpts(c.b, od); if (!opts) return;
      add({ q: /\?$/.test(c.f) ? c.f : 'Which of the following correctly describes “' + term + '”?',
        o: opts, a: opts.indexOf(c.b), e: term + ' — ' + c.b, comp: false, diff: 1 }, 'fwd-' + term);
    });
    // 3) Card-reverse MCQs: identify the term from its description (application).
    //    Only when the definition is unique and specific (single correct answer).
    cards.forEach(function (c, i) {
      if (/\?$/.test(c.f)) return;
      var defKey = normKey(stripDot(c.b));
      if (backFreq[defKey] !== 1) return;                          // ambiguous → skip
      if (stripDot(c.b).replace(/[^a-z0-9]/gi, '').length < 8) return; // too generic → skip
      var term = cleanTerm(c.f), ot = terms.filter(function (t, j) { return j !== i && t !== term; });
      var opts = fourOpts(term, ot); if (!opts) return;
      add({ q: 'Identify the correct term: “' + stripDot(c.b) + '.”',
        o: opts, a: opts.indexOf(term), e: c.b + ' → ' + term, comp: true, diff: 2 }, 'rev-' + defKey);
    });
    // 4) Assertion-Reason (competency). Uses true/false definition statements so the
    //    answer is always determinable as (c) A true R false, or (d) A false R true.
    function desc(card, back) { return cap(cleanTerm(card.f)) + ' is correctly described as “' + lc(stripDot(back)) + '”.'; }
    if (cards.length >= 2) {
      var idx = shuffle(cards.map(function (_, i) { return i; }));
      for (var n = 0; n < Math.min(4, cards.length); n++) {
        var i1 = idx[n], i2 = idx[(n + 1) % idx.length];
        if (i1 === i2) continue;
        var c1 = cards[i1], c2 = cards[i2];
        if (n % 2 === 0) { // A true, R false -> (c)
          add({ ar: true, A: desc(c1, c1.b), R: desc(c2, c1.b), a: 2, comp: true, diff: 3 }, 'ar-c-' + i1 + '-' + i2);
        } else {           // A false, R true -> (d)
          add({ ar: true, A: desc(c1, c2.b), R: desc(c2, c2.b), a: 3, comp: true, diff: 3 }, 'ar-d-' + i1 + '-' + i2);
        }
      }
    }
    return pool;
  }

  function buildPaper(setNo) {
    var g = state.grade, sid = state.subjectId, ch = state.chapter, s = subject(g, sid);
    var ct = content(g, sid, ch);
    var cards = shuffle(dedupeCards(ct.cards));
    var notes = shuffle((ct.notes || []).slice());
    var noteAt = 0;
    function nextNotes(k) { var out = []; for (var i = 0; i < k; i++) { out.push(notes[noteAt % notes.length] || notes[0] || ch); noteAt++; } return out; }

    var objAll = shuffle(objectivePool(g, sid, ch));
    // Easy recall first, application/assertion-reason later (logical difficulty progression).
    objAll.sort(function (a, b) { return (a.diff || 1) - (b.diff || 1); });
    var secA = objAll.slice(0, 20);   // Section A: up to 20 objective, 1 mark each

    var bk = bank(g, sid, ch);

    // ---- Section B: Very Short Answer (2m). Prefer authored VSA. ----
    var vsaItems;
    if (bk && bk.vsa && bk.vsa.length >= 3) {
      vsaItems = shuffle(bk.vsa.slice()).slice(0, 3).map(function (v) { return { q: v.q, a: v.a, k: v.k, cm: v.cm }; });
    } else {
      vsaItems = cards.slice(0, 3).map(function (c) {
        var isQ = /\?$/.test(c.f);
        var qv = isQ ? ('Answer in brief: ' + c.f) : (pick(['Define the term ', 'State the meaning of ', 'What is meant by ']) + cleanTerm(c.f) + '?');
        return { q: qv, a: c.b };
      });
    }

    // ---- Section C: Short Answer (3m). Prefer authored SA. ----
    var saItems;
    if (bk && bk.sa && bk.sa.length >= 4) {
      saItems = shuffle(bk.sa.slice()).slice(0, 4).map(function (v) { return { q: v.q, a: v.a, k: v.k, cm: v.cm }; });
    } else {
      saItems = cards.slice(3, 6).map(function (c) {
        return { q: pick(['Explain, with a suitable example, ', 'Give reasons to support the statement about ', 'Briefly describe ']) + cleanTerm(c.f) + '.', a: c.b };
      });
      while (saItems.length < 4) { var nn = nextNotes(1)[0]; saItems.push({ q: 'Give reasons: ' + lc(stripDot(nn)) + ' Explain why.', a: nn }); }
      saItems = saItems.slice(0, 4);
    }

    // ---- Section D: Medium Answer (4m, competency). Prefer authored MA. ----
    var medItems;
    if (bk && bk.ma && bk.ma.length >= 3) {
      medItems = shuffle(bk.ma.slice()).slice(0, 3).map(function (v) { return { q: v.q, a: v.a, k: v.k, cm: v.cm, comp: true }; });
    } else {
      var medPool = shuffle([
        { q: 'Apply the concepts of “' + ch + '” to a real-life situation and explain your reasoning.' },
        { q: 'Analyse how the key ideas of “' + ch + '” are connected, using suitable examples.' },
        { q: 'A student observes something related to “' + ch + '”. Explain what happens and why.' },
        { q: 'Justify, with examples, why the concepts of “' + ch + '” are important in everyday life.' },
        { q: 'Compare and contrast two important ideas from “' + ch + '”, giving reasons.' }
      ]);
      medItems = medPool.slice(0, 3).map(function (m) { return { q: m.q, a: nextNotes(2).join(' '), comp: true }; });
    }

    // ---- Section E: Long Answer (5m HOTS, flex count). Prefer authored LA. ----
    var laItems = (bk && bk.la && bk.la.length) ? shuffle(bk.la.slice()) : null;
    var longPool = shuffle([
      'Explain in detail, with suitable examples, the important principles of “' + ch + '”.',
      'Discuss comprehensively the main concepts of “' + ch + '” and their significance.',
      'Evaluate the importance of “' + ch + '” and describe how it applies in practice.',
      'Describe, step by step, how the key ideas of “' + ch + '” work together.',
      'With reference to real situations, critically explain the concepts of “' + ch + '”.',
      'Summarise the essential ideas of “' + ch + '” and explain their practical uses with examples.',
      'Explain the cause-and-effect relationships involved in “' + ch + '”, using examples.'
    ]);

    // ---- Section F: Case/Source-based (5m each). Prefer authored case studies. ----
    // Normalised shape: { p: passage, q: [ {q, a, m}, ... ] } summing to 5 marks each.
    var caseStudies;
    if (bk && bk.cs && bk.cs.length >= 3) {
      caseStudies = shuffle(bk.cs.slice()).slice(0, 3).map(function (c) { return { p: c.p, q: c.q.slice() }; });
    } else {
      var caseQ2Pool = shuffle([
        'explain one real-life application of the idea described.',
        'analyse why this idea is important, giving an example.',
        'explain how this concept can be applied to solve a problem.',
        'justify the main conclusion using evidence from the passage.'
      ]);
      caseStudies = [];
      for (var ci = 0; ci < 3; ci++) {
        var passage = nextNotes(2).join(' ');
        caseStudies.push({ p: passage, q: [
          { q: 'With reference to Passage ' + (ci + 1) + ', state the main idea it presents.', a: passage, m: 2 },
          { q: 'From Passage ' + (ci + 1) + ', ' + caseQ2Pool[ci % caseQ2Pool.length], a: passage, m: 3 }
        ] });
      }
    }

    var key = [], qn = 0, html = '', compMarks = 0;
    function addKey(ans, extra) { qn++; key.push({ label: 'Q' + qn, ans: ans, k: extra && extra.k, cm: extra && extra.cm }); return qn; }
    function count(m, comp) { if (comp) compMarks += m; }

    // ---- Section A: objective (1 mark each) ----
    html += '<h2 class="ws__sec">Section A &middot; Objective <span class="ws__sec-note">(' + secA.length + ' questions &times; 1 mark; includes assertion-reason &amp; competency items)</span></h2>';
    html += '<p class="ws__secinstr">Choose the correct option. For assertion-reason questions, mark the option using the code: (a) both A and R true, R explains A; (b) both true, R does not explain A; (c) A true, R false; (d) A false, R true.</p><ol class="ws__list">';
    secA.forEach(function (o) {
      count(1, o.comp);
      if (o.ar) {
        addKey('(' + LET[o.a].toLowerCase() + ') ' + AR_OPTS[o.a]);
        html += '<li><div class="ws__qrow"><p class="ws__q">Assertion (A): ' + esc(o.A) + '<br>Reason (R): ' + esc(o.R) + '</p><span class="ws__marks">[1]</span></div><div class="ws__opts ws__opts--ar">';
        AR_OPTS.forEach(function (t, i) { html += '<span class="ws__opt">(' + LET[i].toLowerCase() + ') ' + esc(t) + '</span>'; });
        html += '</div></li>';
      } else {
        addKey('(' + LET[o.a].toLowerCase() + ') ' + o.o[o.a]);
        html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(o.q) + '</p><span class="ws__marks">[1]</span></div><div class="ws__opts">';
        o.o.forEach(function (opt, i) { html += '<span class="ws__opt">(' + LET[i].toLowerCase() + ') ' + esc(opt) + '</span>'; });
        html += '</div></li>';
      }
    });
    html += '</ol>';

    // ---- Section B: Very Short Answer (2 marks each) ----
    html += '<h2 class="ws__sec">Section B &middot; Very Short Answer <span class="ws__sec-note">(2 marks each)</span></h2><ol class="ws__list">';
    vsaItems.forEach(function (it) {
      addKey(it.a, it);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[2]</span></div>' + ansLines(2) + '</li>';
    });
    html += '</ol>';

    // ---- Section C: Short Answer (3 marks each) ----
    html += '<h2 class="ws__sec">Section C &middot; Short Answer <span class="ws__sec-note">(3 marks each)</span></h2><ol class="ws__list">';
    saItems.forEach(function (it) { addKey(it.a, it);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[3]</span></div>' + ansLines(3) + '</li>'; });
    html += '</ol>';

    // ---- Section D: Medium Answer (4 marks each, competency) ----
    html += '<h2 class="ws__sec">Section D &middot; Medium Answer <span class="ws__sec-note">(competency-based, 4 marks each)</span></h2><ol class="ws__list">';
    medItems.forEach(function (it) { count(4, true); addKey(it.a, it);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[4]</span></div>' + ansLines(5) + '</li>'; });
    html += '</ol>';

    // ---- Section F marks (computed from actual sub-question marks) ----
    var caseMarks = caseStudies.reduce(function (t, cs) { return t + cs.q.reduce(function (u, x) { return u + (x.m || 0); }, 0); }, 0);

    // ---- Section E: Long Answer (flex so the paper always totals exactly 80) ----
    var eTotal = 80 - (secA.length + vsaItems.length * 2 + saItems.length * 3 + medItems.length * 4 + caseMarks);
    var eChunks = splitMarks(eTotal);
    html += '<h2 class="ws__sec">Section E &middot; Long Answer <span class="ws__sec-note">(HOTS / analysis, ' + eTotal + ' marks)</span></h2><ol class="ws__list">';
    eChunks.forEach(function (m, i) {
      var qtext, ans, extra;
      if (laItems && i < laItems.length) { qtext = laItems[i].q; ans = laItems[i].a; extra = laItems[i]; }
      else { qtext = longPool[i % longPool.length]; ans = nextNotes(3).join(' '); extra = null; }
      // Section E is Higher-Order-Thinking/analysis — it always counts as competency,
      // which (with Sections D and F) guarantees every paper is >= 50% competency.
      count(m, true);
      addKey(ans, extra);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(qtext) + '</p><span class="ws__marks">[' + m + ']</span></div>' + ansLines(m >= 5 ? 8 : 6) + '</li>';
    });
    html += '</ol>';

    // ---- Section F: Case-Based / Source-Based studies (5 marks each) ----
    html += '<h2 class="ws__sec">Section F &middot; Case-Based Study <span class="ws__sec-note">(source-based competency, 5 marks each)</span></h2>';
    html += '<p class="ws__secinstr">Read each passage carefully and answer the questions that follow.</p>';
    caseStudies.forEach(function (cs, i) {
      var csMarks = cs.q.reduce(function (u, x) { return u + (x.m || 0); }, 0);
      count(csMarks, true);
      html += '<div class="ws__case"><p class="ws__case-lead">Passage ' + (i + 1) + '</p><p class="ws__case-body">' + esc(cs.p) + '</p></div><ol class="ws__list ws__list--case">';
      cs.q.forEach(function (sq) {
        addKey(sq.a, sq);
        html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(sq.q) + '</p><span class="ws__marks">[' + sq.m + ']</span></div>' + ansLines(sq.m >= 3 ? 3 : 2) + '</li>';
      });
      html += '</ol>';
    });

    // ---- Header, marking scheme, answer key ----
    var totalMarks = secA.length + vsaItems.length * 2 + saItems.length * 3 + medItems.length * 4 + eTotal + caseMarks;
    var compPct = Math.round(compMarks / totalMarks * 100);
    var scheme = [['A', 'Objective', secA.length], ['B', 'Very Short', vsaItems.length * 2], ['C', 'Short', saItems.length * 3], ['D', 'Medium', medItems.length * 4], ['E', 'Long', eTotal], ['F', 'Case-Based', caseMarks]]
      .map(function (r) { return '<span class="ws__scheme-cell"><b>' + r[0] + '</b> ' + esc(r[1]) + ' &middot; ' + r[2] + 'm</span>'; }).join('');

    var head = '<div class="ws__head">' +
        '<img class="ws__logo" src="assets/cert/logo.png" alt="Inspire Talent Hub" width="120" height="120">' +
        '<div class="ws__headtext"><div class="ws__brand">Inspire Talent Hub &middot; Study Hub</div>' +
          '<h1 class="ws__title">' + esc(ch) + '</h1>' +
          '<p class="ws__meta">Class ' + g + ' &middot; ' + esc(s ? s.name : '') + ' &middot; Sample Question Paper &mdash; Set ' + setNo + '</p></div>' +
        '<div class="ws__stamp"><span>Time: 3 hours</span><span>Max Marks: ' + totalMarks + '</span></div>' +
      '</div>' +
      '<p class="ws__namebar">Name: __________________________   Class/Sec: _________   Roll No.: ______   Date: __________</p>' +
      '<div class="ws__instr"><strong>General Instructions:</strong> (i) All questions are compulsory. (ii) The question paper has six sections, A to F. ' +
        '(iii) Section A has ' + secA.length + ' objective questions of 1 mark each (with assertion-reason). (iv) Section B has very short answer questions (2 marks), Section C short answer (3 marks), Section D medium answer (4 marks), Section E long answer (5 marks) and Section F case/source-based questions (5 marks each). ' +
        '(v) Marks are indicated against each question. (vi) About ' + compPct + '% of the paper is competency-based (application, analysis, reasoning and case study). (vii) Write neatly in the space provided; there is no overall choice.</div>' +
      '<div class="ws__scheme"><span class="ws__scheme-title">Marking scheme:</span>' + scheme + '<span class="ws__scheme-cell ws__scheme-cell--tot"><b>Total</b> ' + totalMarks + 'm</span></div><hr class="ws__rule">';

    var keyHtml = '<div class="ws__keypage"><div class="ws__head ws__head--key">' +
        '<img class="ws__logo" src="assets/cert/logo.png" alt="" width="70" height="70">' +
        '<div class="ws__headtext"><div class="ws__brand">Inspire Talent Hub &middot; Marking Scheme / Answer Key</div>' +
        '<h2 class="ws__title ws__title--sm">' + esc(ch) + ' &mdash; Set ' + setNo + '</h2></div></div>' +
        '<ol class="ws__keylist">' +
        key.map(function (k) {
          var s = '<li><span class="ws__keyq">' + esc(k.label) + '.</span> ' + esc(k.ans);
          if (k.k && k.k.length) s += '<br><span class="ws__keyhint"><b>Expected key terms:</b> ' + esc(k.k.join(', ')) + '</span>';
          if (k.cm) s += '<br><span class="ws__keyhint"><b>Common error to avoid:</b> ' + esc(k.cm) + '</span>';
          return s + '</li>';
        }).join('') +
        '</ol><p class="ws__keynote">For subjective and case-based questions the key gives the expected points; award full marks for any correct equivalent explanation with valid examples. Deduct for missing key terms or the common errors noted above.</p></div>';

    return '<section class="ws-paper"><img class="ws__wm" src="assets/cert/seal.png" alt="" aria-hidden="true"><div class="ws__inner">' +
      head + html + '</div></section>' +
      '<section class="ws-paper ws-paper--key"><img class="ws__wm" src="assets/cert/seal.png" alt="" aria-hidden="true"><div class="ws__inner">' +
      keyHtml + '</div></section>';
  }

  function renderWorksheet(root, count) {
    var papers = '';
    for (var i = 1; i <= count; i++) papers += buildPaper(i);
    root.querySelector('#wsSheet').innerHTML = papers;
  }

  // Test hook: generate a paper for an arbitrary chapter (used by the offline audit).
  window.__ithPaper = function (board, grade, sid, chapter, setNo) {
    var pb = BOARD, pg = state.grade, ps = state.subjectId, pc = state.chapter;
    BOARD = board; state.grade = grade; state.subjectId = sid; state.chapter = chapter;
    var out;
    try { out = buildPaper(setNo || 1); } finally { BOARD = pb; state.grade = pg; state.subjectId = ps; state.chapter = pc; }
    return out;
  };

  function printWorksheet() {
    var qs = chapterQs(state.grade, state.subjectId, state.chapter);
    if (!qs.length) return;
    var root = toolRoot();
    root.innerHTML = '<div class="ws-preview"><div class="ws-preview__bar">' +
      '<div class="ws-preview__opts">' +
        '<label class="ws-preview__lbl">Papers at once' +
          '<select data-ws-count class="ws-preview__sel"><option value="1">1 set</option><option value="3">3 sets</option><option value="5">5 sets</option></select></label>' +
        '<button type="button" class="btn btn-outline text-gold hover-target" data-ws-regen><span>Regenerate</span></button>' +
      '</div>' +
      '<button type="button" class="btn btn-gold hover-target" data-ws-print><span>Print / Save as PDF</span></button></div>' +
      '<div class="ws-sheet" id="wsSheet"></div></div>';
    renderWorksheet(root, 1);
    var sel = root.querySelector('[data-ws-count]');
    root.querySelector('[data-ws-print]').addEventListener('click', function () { window.print(); });
    root.querySelector('[data-ws-regen]').addEventListener('click', function () { renderWorksheet(root, parseInt(sel.value, 10) || 1); });
    sel.addEventListener('change', function () { renderWorksheet(root, parseInt(sel.value, 10) || 1); });
    document.body.classList.add('ws-printing');
    // Clean up the print flag if the user navigates away.
    el('shToolBack').onclick = function () { document.body.classList.remove('ws-printing'); renderHub(); };
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('shGrade')) return;
    if (el('shChapterBack')) el('shChapterBack').addEventListener('click', renderSubjects);
    if (el('shSubjectBack')) el('shSubjectBack').addEventListener('click', renderGrades);
    if (el('shHubBack')) el('shHubBack').addEventListener('click', renderChapters);
    renderGrades();
  });
})();
