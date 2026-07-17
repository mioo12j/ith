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
    if (cards.length) tools.appendChild(tile('star', 'Flashcards', cards.length + ' cards to flip & learn', launchFlash));
    if (ct.authoredCards && cards.length >= 3) tools.appendChild(tile('grad', 'Match-up Game', 'Match terms to meanings, beat the clock', launchMatch));
    if (qn) tools.appendChild(tile('chart', 'Practice Test', qn + ' questions with instant feedback', launchTest));
    if (qn) tools.appendChild(tile('pen', 'Printable Worksheet', 'Download / print with answer key', printWorksheet));

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

  // ---- Printable exam paper (worksheet) ----
  // Builds a full competency-style question paper per chapter with five sections:
  // A objective (MCQ), B very-short, C short, D long, E case/source-based.
  // ~80% of the marks are competency-based (application, analysis, case study).
  var LET = ['A', 'B', 'C', 'D', 'E', 'F'];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function ansLines(n) { return '<div class="ws__lines ws__lines--' + n + '" aria-hidden="true"></div>'; }
  function cleanTerm(f) { return String(f).replace(/[:?.\s]+$/, '').trim(); }

  // Turn a flashcard (term -> definition) into an open-ended question + model answer.
  function cardQ(card, kind) {
    var f = String(card.f).trim(), term = cleanTerm(f), isQ = /\?$/.test(f);
    var stem;
    if (kind === 'vsa') stem = isQ ? f : pick(['Define / state: ', 'What is meant by ', 'Name / state: ']) + term + '.';
    else stem = isQ ? f : pick(['Explain briefly: ', 'Write a short note on ', 'With an example, explain ', 'Why is the following important? ']) + term + '.';
    return { q: stem, a: card.b, marks: kind === 'vsa' ? 1 : 2, comp: !isQ };
  }
  function longQ(notes, ch) {
    var body = notes.slice(0, 3).join(' ');
    var stem = pick([
      'Explain in detail, in your own words, the key ideas of ',
      'Discuss, with suitable examples, the main points of ',
      'A student is asked to summarise the chapter for a junior. Describe the important ideas of '
    ]) + '“' + ch + '”.';
    return { q: stem, a: body, marks: 3, comp: true };
  }
  function caseQ(notes, qs, cards, ch) {
    var passage = notes.slice(0, Math.min(4, notes.length)).join(' ');
    var subs = [];
    // two objective sub-questions from the MCQ bank + one short answer from a card
    qs.slice(0, 2).forEach(function (q) { subs.push({ type: 'mcq', q: q.q, o: q.o, a: q.a }); });
    if (cards[0]) { var c = cardQ(cards[0], 'sa'); subs.push({ type: 'sa', q: c.q, a: c.a }); }
    return { passage: passage, subs: subs, ch: ch };
  }

  function buildPaper(setNo) {
    var g = state.grade, sid = state.subjectId, ch = state.chapter, s = subject(g, sid);
    var ct = content(g, sid, ch);
    var qs = shuffle(chapterQs(g, sid, ch));
    var cards = shuffle((ct.cards || []).slice());
    var notes = shuffle((ct.notes || []).slice());

    var secA = qs.slice(0, Math.min(4, qs.length));
    var caseQs = qs.slice(4);                        // reserve remaining MCQs for the case study
    var vsaCards = cards.slice(0, 3);
    var saCards = cards.slice(3, 6);
    var laNotes = notes.slice(0, 3);
    var caseNotes = notes.slice(3, 7).length >= 2 ? notes.slice(3, 7) : notes.slice(0, 4);
    var caseCards = cards.slice(6, 7).length ? cards.slice(6, 7) : cards.slice(0, 1);
    var cs = caseQ(caseNotes, caseQs.length >= 2 ? caseQs : qs.slice(0, 2), caseCards, ch);

    var marks = 0;
    var key = [];   // {label, ans}
    var qn = 0;     // running question number
    var html = '';

    // ---- Section A: Objective / competency MCQ ----
    if (secA.length) {
      html += '<h2 class="ws__sec">Section A &middot; Objective <span class="ws__sec-note">(competency-based, 1 mark each)</span></h2><ol class="ws__list">';
      secA.forEach(function (q) {
        qn++; marks += 1;
        html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(q.q) + '</p><span class="ws__marks">[1]</span></div><div class="ws__opts">';
        q.o.forEach(function (o, i) { html += '<span class="ws__opt">(' + LET[i].toLowerCase() + ') ' + esc(o) + '</span>'; });
        html += '</div></li>';
        key.push({ label: 'Q' + qn, ans: '(' + LET[q.a].toLowerCase() + ') ' + q.o[q.a] });
      });
      html += '</ol>';
    }

    // ---- Section B: Very short answer ----
    if (vsaCards.length) {
      html += '<h2 class="ws__sec">Section B &middot; Very Short Answer <span class="ws__sec-note">(1 mark each)</span></h2><ol class="ws__list">';
      vsaCards.forEach(function (c) {
        qn++; marks += 1; var it = cardQ(c, 'vsa');
        html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[1]</span></div>' + ansLines(1) + '</li>';
        key.push({ label: 'Q' + qn, ans: it.a });
      });
      html += '</ol>';
    }

    // ---- Section C: Short answer ----
    if (saCards.length) {
      html += '<h2 class="ws__sec">Section C &middot; Short Answer <span class="ws__sec-note">(competency-based, 2 marks each)</span></h2><ol class="ws__list">';
      saCards.forEach(function (c) {
        qn++; marks += 2; var it = cardQ(c, 'sa');
        html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(it.q) + '</p><span class="ws__marks">[2]</span></div>' + ansLines(2) + '</li>';
        key.push({ label: 'Q' + qn, ans: it.a });
      });
      html += '</ol>';
    }

    // ---- Section D: Long answer ----
    if (laNotes.length) {
      html += '<h2 class="ws__sec">Section D &middot; Long Answer <span class="ws__sec-note">(competency-based, 3 marks)</span></h2><ol class="ws__list">';
      var la = longQ(laNotes, ch); qn++; marks += 3;
      html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(la.q) + '</p><span class="ws__marks">[3]</span></div>' + ansLines(5) + '</li>';
      key.push({ label: 'Q' + qn, ans: la.a });
      html += '</ol>';
    }

    // ---- Section E: Case / source-based (competency) ----
    if (cs.subs.length) {
      html += '<h2 class="ws__sec">Section E &middot; Case-Based Study <span class="ws__sec-note">(competency-based)</span></h2>';
      html += '<div class="ws__case"><p class="ws__case-lead">Read the passage and answer the questions that follow.</p>' +
        '<p class="ws__case-body">' + esc(cs.passage) + '</p></div><ol class="ws__list ws__list--case">';
      cs.subs.forEach(function (sub) {
        qn++;
        if (sub.type === 'mcq') {
          marks += 1;
          html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(sub.q) + '</p><span class="ws__marks">[1]</span></div><div class="ws__opts">';
          sub.o.forEach(function (o, i) { html += '<span class="ws__opt">(' + LET[i].toLowerCase() + ') ' + esc(o) + '</span>'; });
          html += '</div></li>';
          key.push({ label: 'Q' + qn, ans: '(' + LET[sub.a].toLowerCase() + ') ' + sub.o[sub.a] });
        } else {
          marks += 2;
          html += '<li><div class="ws__qrow"><p class="ws__q">' + esc(sub.q) + '</p><span class="ws__marks">[2]</span></div>' + ansLines(2) + '</li>';
          key.push({ label: 'Q' + qn, ans: sub.a });
        }
      });
      html += '</ol>';
    }

    var head = '<div class="ws__head">' +
        '<img class="ws__logo" src="assets/cert/logo.png" alt="Inspire Talent Hub" width="120" height="120">' +
        '<div class="ws__headtext"><div class="ws__brand">Inspire Talent Hub &middot; Study Hub</div>' +
          '<h1 class="ws__title">' + esc(ch) + '</h1>' +
          '<p class="ws__meta">Class ' + g + ' &middot; ' + esc(s ? s.name : '') + ' &middot; Question Paper &mdash; Set ' + setNo + '</p></div>' +
        '<div class="ws__stamp"><span>Time: 45 min</span><span>Max Marks: ' + marks + '</span></div>' +
      '</div>' +
      '<p class="ws__namebar">Name: ____________________________   Class/Sec: __________   Roll No.: ______   Date: ____________</p>' +
      '<div class="ws__instr"><strong>General Instructions:</strong> (i) All questions are compulsory. (ii) The paper has five sections A&ndash;E. ' +
        '(iii) Marks are shown against each question. (iv) About 80% of the paper is competency-based (application, analysis and case study). ' +
        '(v) Write neatly in the space provided.</div><hr class="ws__rule">';

    var keyHtml = '<div class="ws__keypage"><div class="ws__head ws__head--key">' +
        '<img class="ws__logo" src="assets/cert/logo.png" alt="" width="70" height="70">' +
        '<div class="ws__headtext"><div class="ws__brand">Inspire Talent Hub &middot; Answer Key</div>' +
        '<h2 class="ws__title ws__title--sm">' + esc(ch) + ' &mdash; Set ' + setNo + '</h2></div></div>' +
        '<ol class="ws__keylist">' +
        key.map(function (k) { return '<li><span class="ws__keyq">' + esc(k.label) + '.</span> ' + esc(k.ans) + '</li>'; }).join('') +
        '</ol><p class="ws__keynote">For short, long and case-based questions the answer key gives the key points expected; accept any correct equivalent explanation.</p></div>';

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
