/* Inspire Talent Hub — Study Hub.
 * Grade -> Subject -> Chapter -> chapter hub (Notes / Flashcards / Match / Test /
 * Worksheet), over window.ITH_SYLLABUS + window.ITH_STUDY_Q + window.ITH_STUDY_CONTENT.
 */
(function () {
  'use strict';
  var SYL = window.ITH_SYLLABUS, QB = window.ITH_STUDY_Q || {}, CT = window.ITH_STUDY_CONTENT || {};
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
    if (qn) tools.appendChild(tile('medal', 'Exam Paper (50 marks)', 'Full CBSE-pattern paper · print / PDF', printWorksheet));
    if (notes.length || cards.length) tools.appendChild(tile('shield', 'Exam Tips & Common Mistakes', 'Score better — what to focus on', showExamTips));

    goTo('shHub');
  }
  function tile(ic, name, sub, fn) {
    var b = ce('button', 'sh-tool', '<span class="sh-tool__ic">' + icon(ic, 26) + '</span><span class="sh-tool__name">' + esc(name) + '</span><span class="sh-tool__sub">' + esc(sub) + '</span>');
    b.type = 'button'; b.addEventListener('click', fn); return b;
  }

  function metaLabel() { var s = subject(state.grade, state.subjectId); return 'Class ' + state.grade + ' · ' + (s ? s.name : '') + ' · ' + state.chapter; }
  function toolRoot() { el('shToolBack').onclick = renderHub; goTo('shTool'); return el('shToolRoot'); }

  function launchTest() {
    var pool = chapterQs(state.grade, state.subjectId, state.chapter).map(function (q) { return { q: q.q, o: q.o, a: q.a, e: q.e, meta: state.chapter }; });
    if (!pool.length) return;
    window.ITHQuiz.start(shuffle(pool), { root: toolRoot(), metaLabel: metaLabel(), onExit: renderHub, onRetry: function () { return shuffle(pool); } });
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

  // ===== CBSE 50-mark question-paper engine =====
  // Sections A (20 MCQ incl. assertion-reason & competency) · B VSA (2m) · C SA (3m)
  // · D Medium (4m) · E Long (5m) · F Case/Source-based (5m). Total = exactly 50.
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
    return { q: item.q, o: o, a: o.indexOf(correct), e: item.e, comp: item.comp };
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

    // 1) Authored MCQs (options randomised).
    chapterQs(g, sid, ch).forEach(function (q) {
      add(shuffleOpts({ q: q.q, o: q.o.slice(), a: q.a, e: q.e, comp: false, diff: 1 }), q.q);
    });
    // 2) Card-forward MCQs: describe the term (recall).
    cards.forEach(function (c, i) {
      var term = cleanTerm(c.f), od = backs.filter(function (b, j) { return j !== i && b !== c.b; });
      if (od.length < 3) return;
      var opts = shuffle([c.b].concat(shuffle(od).slice(0, 3)));
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
      if (ot.length < 3) return;
      var opts = shuffle([term].concat(shuffle(ot).slice(0, 3)));
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

  // ---- Subjective question builders (question + model-answer + competency flag) ----
  function qVSA(card) {
    var t = cleanTerm(card.f), isQ = /\?$/.test(card.f);
    return { q: isQ ? ('Answer in brief: ' + card.f) : pick(['Define the term ', 'State the meaning of ', 'What is meant by ']) + t + '?',
      a: card.b, comp: false };
  }
  function qSA(card) {
    var t = cleanTerm(card.f);
    return { q: pick(['Explain, with a suitable example, ', 'Give reasons: why is it important to understand ',
      'Distinguish clearly and explain ']) + t + '.', a: card.b, comp: true };
  }
  function qLONG(notes, ch) {
    return { q: pick([
      'Explain in detail, with suitable examples, the important principles of “' + ch + '”.',
      'Discuss comprehensively the main concepts of “' + ch + '” and their significance.'
    ]), a: notes.slice(0, 3).join(' '), comp: true };
  }

  function buildPaper(setNo) {
    var g = state.grade, sid = state.subjectId, ch = state.chapter, s = subject(g, sid);
    var ct = content(g, sid, ch);
    var cards = shuffle(dedupeCards(ct.cards));
    var notes = shuffle((ct.notes || []).slice());
    var objAll = shuffle(objectivePool(g, sid, ch));
    // Easy recall first, application/assertion-reason later (logical difficulty progression).
    objAll.sort(function (a, b) { return (a.diff || 1) - (b.diff || 1); });
    // Reserve two objective items for the case study so they never repeat in Section A.
    var caseMcq = objAll.filter(function (o) { return !o.ar; }).slice(-2);
    var caseSet = {}; caseMcq.forEach(function (o) { caseSet[normKey(o.q)] = 1; });
    var secA = objAll.filter(function (o) { return o.ar || !caseSet[normKey(o.q)]; }).slice(0, 20);

    // Distinct source pools for subjective sections (avoid overlap → no duplicates).
    var vsaCards = cards.slice(0, 3);
    var saCards = cards.slice(3, 5);
    var saItems = saCards.map(qSA);
    if (!saItems.length) saItems = [{ q: 'Explain, with an example, one important idea from “' + ch + '”.', a: notes.slice(0, 1).join(' '), comp: true }];
    var medPrompts = shuffle([
      'Apply your understanding of “' + ch + '” to a real-life situation and explain your reasoning.',
      'Analyse the key ideas of “' + ch + '” and explain how they are connected, with examples.',
      'A student is investigating “' + ch + '”. Explain what they should observe and why.',
      'Using suitable examples, explain how the concepts of “' + ch + '” are useful in everyday life.'
    ]);
    var medQ = { q: medPrompts[0], a: notes.slice(0, 2).join(' '), comp: true };
    var med2 = { q: medPrompts[1], a: shuffle(notes.slice()).slice(0, 2).join(' '), comp: true };
    var longQn = qLONG(notes, ch);
    var caseNotes = notes.slice(0, Math.min(4, notes.length));
    var caseShort = { q: 'Based on the passage above, ' + lc(pick(['explain the underlying concept in your own words.', 'give one real-life application of the idea described.', 'justify why this idea is important, with an example.'])), a: caseNotes.slice(0, 2).join(' '), comp: true };

    var key = [], qn = 0, html = '', totalMarks = 0, compMarks = 0;
    function addKey(ans) { qn++; key.push({ label: 'Q' + qn, ans: ans }); return qn; }
    function count(m, comp) { totalMarks += m; if (comp) compMarks += m; }

    // ---- Section A: 20 objective (1 mark each) ----
    html += '<h2 class="ws__sec">Section A &middot; Objective <span class="ws__sec-note">(' + secA.length + ' questions &times; 1 mark; includes assertion-reason &amp; competency items)</span></h2>';
    html += '<p class="ws__secinstr">Choose the correct option. For assertion-reason items, use the code given with the question.</p><ol class="ws__list">';
    secA.forEach(function (o) {
      count(1, o.comp);
      if (o.ar) {
        var num = addKey('(' + LET[o.a].toLowerCase() + ') ' + AR_OPTS[o.a]);
        html += '<li><div class="ws__qrow"><p class="ws__q">Assertion (A): ' + esc(o.A) + '<br>Reason (R): ' + esc(o.R) + '</p><span class="ws__marks">[1]</span></div><div class="ws__opts ws__opts--ar">';
        AR_OPTS.forEach(function (t, i) { html += '<span class="ws__opt">(' + LET[i].toLowerCase() + ') ' + esc(t) + '</span>'; });
        html += '</div></li>';
      } else {
        var num2 = addKey('(' + LET[o.a].toLowerCase() + ') ' + o.o[o.a]);
        html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(o.q) + '</p><span class="ws__marks">[1]</span></div><div class="ws__opts">';
        o.o.forEach(function (opt, i) { html += '<span class="ws__opt">(' + LET[i].toLowerCase() + ') ' + esc(opt) + '</span>'; });
        html += '</div></li>';
      }
    });
    html += '</ol>';

    // ---- Section B: Very Short Answer (2 marks each) ----
    html += '<h2 class="ws__sec">Section B &middot; Very Short Answer <span class="ws__sec-note">(2 marks each)</span></h2><ol class="ws__list">';
    vsaCards.forEach(function (c) { var it = qVSA(c); count(2, it.comp); addKey(it.a);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[2]</span></div>' + ansLines(2) + '</li>'; });
    html += '</ol>';

    // ---- Section C: Short Answer (3 marks each) ----
    html += '<h2 class="ws__sec">Section C &middot; Short Answer <span class="ws__sec-note">(competency-based, 3 marks each)</span></h2><ol class="ws__list">';
    saItems.forEach(function (it) { count(3, it.comp); addKey(it.a);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[3]</span></div>' + ansLines(3) + '</li>'; });
    html += '</ol>';

    // ---- Section D: Medium Answer (4 marks each) ----
    html += '<h2 class="ws__sec">Section D &middot; Medium Answer <span class="ws__sec-note">(competency-based, 4 marks each)</span></h2><ol class="ws__list">';
    [medQ, med2].forEach(function (it) { count(4, it.comp); addKey(it.a);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[4]</span></div>' + ansLines(5) + '</li>'; });
    html += '</ol>';

    // ---- Section E: Long Answer (absorbs any shortfall so the total is always exactly 50) ----
    var longMarks = 50 - (secA.length + vsaCards.length * 2 + saItems.length * 3 + 8 + (caseMcq.length + 3));
    html += '<h2 class="ws__sec">Section E &middot; Long Answer <span class="ws__sec-note">(competency / HOTS, ' + longMarks + ' marks)</span></h2><ol class="ws__list">';
    count(longMarks, true); addKey(longQn.a);
    html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(longQn.q) + '</p><span class="ws__marks">[' + longMarks + ']</span></div>' + ansLines(longMarks >= 6 ? 8 : 5) + '</li></ol>';

    // ---- Section F: Case-Based / Source-Based (5 marks) ----
    html += '<h2 class="ws__sec">Section F &middot; Case-Based Study <span class="ws__sec-note">(source-based competency, 5 marks)</span></h2>';
    html += '<div class="ws__case"><p class="ws__case-lead">Read the passage and answer the questions that follow.</p>' +
      '<p class="ws__case-body">' + esc(caseNotes.join(' ')) + '</p></div><ol class="ws__list ws__list--case">';
    caseMcq.forEach(function (o) { count(1, true); addKey('(' + LET[o.a].toLowerCase() + ') ' + o.o[o.a]);
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(o.q) + '</p><span class="ws__marks">[1]</span></div><div class="ws__opts">';
      o.o.forEach(function (opt, i) { html += '<span class="ws__opt">(' + LET[i].toLowerCase() + ') ' + esc(opt) + '</span>'; });
      html += '</div></li>'; });
    count(3, true); addKey(caseShort.a);
    html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(caseShort.q) + '</p><span class="ws__marks">[3]</span></div>' + ansLines(3) + '</li></ol>';

    // ---- Header, marking scheme, answer key ----
    var compPct = Math.round(compMarks / totalMarks * 100);
    var scheme = [['A', 'Objective', secA.length], ['B', 'Very Short', vsaCards.length * 2], ['C', 'Short', saItems.length * 3], ['D', 'Medium', 8], ['E', 'Long', longMarks], ['F', 'Case-Based', caseMcq.length + 3]]
      .map(function (r) { return '<span class="ws__scheme-cell"><b>' + r[0] + '</b> ' + esc(r[1]) + ' &middot; ' + r[2] + 'm</span>'; }).join('');

    var head = '<div class="ws__head">' +
        '<img class="ws__logo" src="assets/cert/logo.png" alt="Inspire Talent Hub" width="120" height="120">' +
        '<div class="ws__headtext"><div class="ws__brand">Inspire Talent Hub &middot; Study Hub</div>' +
          '<h1 class="ws__title">' + esc(ch) + '</h1>' +
          '<p class="ws__meta">Class ' + g + ' &middot; ' + esc(s ? s.name : '') + ' &middot; Sample Question Paper &mdash; Set ' + setNo + '</p></div>' +
        '<div class="ws__stamp"><span>Time: 2 hours</span><span>Max Marks: ' + totalMarks + '</span></div>' +
      '</div>' +
      '<p class="ws__namebar">Name: __________________________   Class/Sec: _________   Roll No.: ______   Date: __________</p>' +
      '<div class="ws__instr"><strong>General Instructions:</strong> (i) All questions are compulsory. (ii) The paper has six sections A&ndash;F. ' +
        '(iii) Section A carries objective questions of 1 mark each (including assertion-reason). (iv) Sections B&ndash;F carry very short, short, medium, long and case-based questions respectively. ' +
        '(v) Marks are shown against each question. (vi) Approximately ' + compPct + '% of the paper is competency-based. (vii) Write neatly in the space provided; internal choice is not given.</div>' +
      '<div class="ws__scheme"><span class="ws__scheme-title">Marking scheme:</span>' + scheme + '<span class="ws__scheme-cell ws__scheme-cell--tot"><b>Total</b> ' + totalMarks + 'm</span></div><hr class="ws__rule">';

    var keyHtml = '<div class="ws__keypage"><div class="ws__head ws__head--key">' +
        '<img class="ws__logo" src="assets/cert/logo.png" alt="" width="70" height="70">' +
        '<div class="ws__headtext"><div class="ws__brand">Inspire Talent Hub &middot; Marking Scheme / Answer Key</div>' +
        '<h2 class="ws__title ws__title--sm">' + esc(ch) + ' &mdash; Set ' + setNo + '</h2></div></div>' +
        '<ol class="ws__keylist">' +
        key.map(function (k) { return '<li><span class="ws__keyq">' + esc(k.label) + '.</span> ' + esc(k.ans) + '</li>'; }).join('') +
        '</ol><p class="ws__keynote">For subjective and case-based questions the key gives the expected points; award full marks for any correct equivalent explanation with valid examples.</p></div>';

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
