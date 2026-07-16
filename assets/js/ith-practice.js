/* Inspire Talent Hub — Practice Arena engine.
 * Front-end only. Generates practice tests from window.ITH_PRACTICE,
 * runs a timed, interactive quiz, scores it, and shows a review.
 * Uses ITHFx (confetti / reduced-motion) when available, degrades gracefully.
 */
(function () {
  'use strict';
  var DB = window.ITH_PRACTICE;
  if (!DB) return;

  function el(id) { return document.getElementById(id); }
  function ce(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function reduceMotion() {
    return (window.ITHFx && window.ITHFx.reduceMotion && window.ITHFx.reduceMotion()) ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  var DIFF_NAME = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

  // ---- state ----
  var state = null; // { items, index, config, startedAt, elapsed }
  var perTimer = null, elapsedTimer = null;

  // ---- setup ----
  var selectedCats = {}; // id -> true

  function initSetup() {
    var chipWrap = el('paCatChips');
    DB.categories.forEach(function (c) {
      var count = DB.questions.filter(function (q) { return q.c === c.id; }).length;
      var btn = ce('button', 'pa-chip', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-' + c.icon + '"></use></svg><span>' + esc(c.name) + '</span><small>' + count + '</small>');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('data-cat', c.id);
      btn.addEventListener('click', function () {
        if (selectedCats[c.id]) { delete selectedCats[c.id]; btn.setAttribute('aria-pressed', 'false'); btn.classList.remove('is-on'); }
        else { selectedCats[c.id] = true; btn.setAttribute('aria-pressed', 'true'); btn.classList.add('is-on'); }
        updateAvail();
      });
      chipWrap.appendChild(btn);
    });
    el('paStart').addEventListener('click', startQuiz);
    ['paDiff', 'paCount'].forEach(function (id) { el(id).addEventListener('change', updateAvail); });
    updateAvail();
  }

  function activeCatIds() {
    var ids = Object.keys(selectedCats);
    return ids.length ? ids : DB.categories.map(function (c) { return c.id; });
  }
  function pool() {
    var cats = activeCatIds();
    var diff = el('paDiff').value; // 'any' or '1'/'2'/'3'
    return DB.questions.filter(function (q) {
      if (cats.indexOf(q.c) === -1) return false;
      if (diff !== 'any' && String(q.d) !== diff) return false;
      return true;
    });
  }
  function updateAvail() {
    var avail = pool().length;
    var want = parseInt(el('paCount').value, 10);
    var note = el('paAvail');
    var startable = avail > 0;
    note.textContent = avail + ' question' + (avail === 1 ? '' : 's') + ' available' +
      (avail < want ? ' — your quiz will use all ' + avail : '');
    el('paStart').disabled = !startable;
  }

  function startQuiz() {
    var p = pool();
    if (!p.length) return;
    var want = parseInt(el('paCount').value, 10);
    var timed = el('paTimed').checked;
    var picked = shuffle(p).slice(0, Math.min(want, p.length)).map(function (q) {
      var order = shuffle(q.o.map(function (_, i) { return i; }));
      return {
        q: q.q, e: q.e, c: q.c, d: q.d,
        opts: order.map(function (i) { return q.o[i]; }),
        correct: order.indexOf(q.a),
        chosen: null
      };
    });
    state = { items: picked, index: 0, config: { timed: timed }, startedAt: Date.now(), elapsed: 0 };
    showScreen('paQuiz');
    startElapsed();
    renderQuestion();
  }

  function showScreen(id) {
    ['paSetup', 'paQuiz', 'paResult'].forEach(function (s) {
      var n = el(s); if (!n) return;
      n.hidden = (s !== id);
    });
    if (!reduceMotion()) {
      var n = el(id);
      n.classList.remove('pa-in'); void n.offsetWidth; n.classList.add('pa-in');
    }
  }

  function startElapsed() {
    stopElapsed();
    elapsedTimer = setInterval(function () {
      state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      var t = el('paElapsed');
      if (t) t.textContent = fmt(state.elapsed);
    }, 500);
  }
  function stopElapsed() { if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null; } }
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

  var PER_SECONDS = 30;
  function renderQuestion() {
    clearPer();
    var it = state.items[state.index], n = state.items.length, i = state.index;
    el('paProgressText').textContent = 'Question ' + (i + 1) + ' of ' + n;
    el('paProgressBar').style.width = ((i) / n * 100) + '%';
    el('paCatTag').textContent = catName(it.c) + ' · ' + DIFF_NAME[it.d];
    el('paQuestion').innerHTML = esc(it.q);

    var wrap = el('paOptions');
    wrap.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    it.opts.forEach(function (opt, idx) {
      var b = ce('button', 'pa-opt', '<span class="pa-opt__key">' + letters[idx] + '</span><span class="pa-opt__txt">' + esc(opt) + '</span><span class="pa-opt__mark" aria-hidden="true"></span>');
      b.type = 'button';
      b.addEventListener('click', function () { choose(idx); });
      wrap.appendChild(b);
    });

    el('paExplain').hidden = true;
    el('paExplain').innerHTML = '';
    var next = el('paNext');
    next.hidden = true;
    next.innerHTML = '<span>' + ((i === n - 1) ? 'See Results' : 'Next Question') + '</span>';

    // Per-question timer bar
    var bar = el('paPerBar');
    if (state.config.timed) {
      el('paPerWrap').hidden = false;
      bar.style.transition = 'none';
      bar.style.width = '100%';
      void bar.offsetWidth;
      var secs = PER_SECONDS, left = secs;
      el('paPerText').textContent = left + 's';
      if (!reduceMotion()) {
        bar.style.transition = 'width ' + secs + 's linear';
        bar.style.width = '0%';
      }
      perTimer = setInterval(function () {
        left--;
        el('paPerText').textContent = Math.max(0, left) + 's';
        if (left <= 0) { clearPer(); if (it.chosen === null) choose(-1); }
      }, 1000);
    } else {
      el('paPerWrap').hidden = true;
    }
  }
  function clearPer() { if (perTimer) { clearInterval(perTimer); perTimer = null; } }

  function choose(idx) {
    var it = state.items[state.index];
    if (it.chosen !== null) return; // locked
    clearPer();
    it.chosen = idx; // -1 means timed-out / unanswered
    var btns = el('paOptions').querySelectorAll('.pa-opt');
    btns.forEach(function (b, k) {
      b.disabled = true;
      if (k === it.correct) b.classList.add('is-correct');
      if (k === idx && idx !== it.correct) b.classList.add('is-wrong');
    });
    var ok = idx === it.correct;
    var exp = el('paExplain');
    exp.className = 'pa-explain ' + (ok ? 'is-ok' : 'is-no');
    exp.innerHTML = '<strong>' + (ok ? 'Correct!' : (idx === -1 ? 'Time’s up.' : 'Not quite.')) + '</strong> ' + esc(it.e);
    exp.hidden = false;
    el('paNext').hidden = false;
    el('paNext').focus();
    el('paProgressBar').style.width = ((state.index + 1) / state.items.length * 100) + '%';
  }

  function catName(id) {
    var c = DB.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  }

  function bindNext() {
    el('paNext').addEventListener('click', function () {
      if (state.index < state.items.length - 1) { state.index++; renderQuestion(); scrollTop(); }
      else finish();
    });
    el('paQuit').addEventListener('click', function () {
      if (confirm('End this practice test and return to setup? Your progress will be lost.')) reset();
    });
  }
  function scrollTop() {
    var card = el('paQuizCard');
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function finish() {
    clearPer(); stopElapsed();
    var items = state.items, total = items.length;
    var correct = items.filter(function (it) { return it.chosen === it.correct; }).length;
    var pct = Math.round(correct / total * 100);
    showScreen('paResult');

    var msg = pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Great work!' : pct >= 50 ? 'Good effort — keep going.' : 'A solid start — practice makes progress.';
    el('paResultMsg').textContent = msg;
    el('paScoreDenom').textContent = '/ ' + total;
    el('paResultMeta').textContent = catLabel() + ' · ' + fmt(state.elapsed) + ' taken';

    // animated ring + number
    var ring = el('paRing');
    var num = el('paScoreNum');
    animateScore(num, correct, pct, ring);

    // breakdown by category
    var bd = el('paBreakdown');
    bd.innerHTML = '';
    var byCat = {};
    items.forEach(function (it) {
      byCat[it.c] = byCat[it.c] || { n: 0, ok: 0 };
      byCat[it.c].n++; if (it.chosen === it.correct) byCat[it.c].ok++;
    });
    Object.keys(byCat).forEach(function (cid) {
      var r = byCat[cid];
      bd.appendChild(ce('div', 'pa-bd', '<span>' + esc(catName(cid)) + '</span><b>' + r.ok + '/' + r.n + '</b>'));
    });

    // review
    var rev = el('paReview');
    rev.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    items.forEach(function (it, i) {
      var ok = it.chosen === it.correct;
      var yourTxt = it.chosen === -1 || it.chosen == null ? '<em>No answer</em>' : esc(it.opts[it.chosen]);
      var d = ce('details', 'pa-rev ' + (ok ? 'is-ok' : 'is-no'));
      d.innerHTML =
        '<summary><span class="pa-rev__ic" aria-hidden="true"></span>' +
        '<span class="pa-rev__q">' + (i + 1) + '. ' + esc(it.q) + '</span></summary>' +
        '<div class="pa-rev__body">' +
        '<p><strong>Correct answer:</strong> ' + letters[it.correct] + '. ' + esc(it.opts[it.correct]) + '</p>' +
        (ok ? '' : '<p><strong>Your answer:</strong> ' + yourTxt + '</p>') +
        '<p class="pa-rev__exp">' + esc(it.e) + '</p></div>';
      rev.appendChild(d);
    });

    if (pct >= 70 && window.ITHFx && window.ITHFx.confetti && !reduceMotion()) {
      var host = el('paResultCard');
      try { window.ITHFx.confetti(host, { count: 90 }); } catch (e) {}
    }
    scrollResult();
  }
  function scrollResult() {
    var c = el('paResultCard');
    if (c && c.scrollIntoView) c.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function catLabel() {
    var ids = activeCatIds();
    if (ids.length === DB.categories.length) return 'All categories';
    return ids.map(catName).join(', ');
  }

  function animateScore(num, correct, pct, ring) {
    var dur = reduceMotion() ? 0 : 900;
    ring.style.setProperty('--pa-pct', '0');
    if (dur === 0) {
      num.textContent = correct;
      ring.style.setProperty('--pa-pct', pct);
      ring.setAttribute('data-pct', pct + '%');
      return;
    }
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(correct * eased);
      ring.style.setProperty('--pa-pct', (pct * eased).toFixed(1));
      ring.setAttribute('data-pct', Math.round(pct * eased) + '%');
      if (p < 1) requestAnimationFrame(step);
      else { num.textContent = correct; ring.style.setProperty('--pa-pct', pct); ring.setAttribute('data-pct', pct + '%'); }
    }
    requestAnimationFrame(step);
  }

  function reset() {
    clearPer(); stopElapsed();
    state = null;
    showScreen('paSetup');
    scrollTopEl('paSetup');
  }
  function scrollTopEl(id) { var n = el(id); if (n && n.scrollIntoView) n.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); }

  function bindResult() {
    el('paRetry').addEventListener('click', function () {
      // regenerate with same config
      startQuizWith(state ? state.config : null);
    });
    el('paNewQuiz').addEventListener('click', reset);
  }
  function startQuizWith() {
    // reuse current setup selections (they are still in the DOM)
    startQuiz();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('paSetup')) return;
    initSetup();
    bindNext();
    bindResult();
    showScreen('paSetup');
  });
})();
