/* Inspire Talent Hub — shared quiz runner.
 * ITHQuiz.start(questions, opts) builds a quiz + result UI inside opts.root and
 * runs it. Reused by the Practice Arena and the Study Hub for one consistent UX.
 *
 * questions: [{ q, o:[options], a: correctIndex, e: explanation, meta?: "tag" }]
 * opts: {
 *   root:      container element (required)
 *   timed:     boolean — 30s per question
 *   metaLabel: string shown on the result screen (e.g. "Class 10 · Science · Motion")
 *   onExit:    () => void  — user quit or chose to go back
 *   onRetry:   () => questions | null — return a fresh question list for "try again"
 *              (if omitted, the same questions are reshuffled)
 *   celebrate: boolean (default true) — confetti at >=70%
 * }
 */
(function () {
  'use strict';
  function ce(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function reduceMotion() {
    return (window.ITHFx && window.ITHFx.reduceMotion && window.ITHFx.reduceMotion()) ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  var PER_SECONDS = 30;

  var QUIZ_HTML =
    '<div class="pa-quiz" data-q-card>' +
      '<div class="pa-quiz__top"><span class="pa-quiz__prog" data-q-prog></span>' +
        '<span class="pa-quiz__topright">' +
          '<span class="pa-combo" data-q-combo hidden aria-live="polite"><svg width="15" height="15" fill="currentColor" aria-hidden="true"><use href="#icon-star"></use></svg><b data-q-combo-n>2</b><span>streak</span></span>' +
          '<span class="pa-quiz__timer" aria-label="Elapsed time"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-clock"></use></svg><span data-q-elapsed>0:00</span></span></span></div>' +
      '<div class="pa-progress" role="progressbar" aria-label="Quiz progress"><div class="pa-progress__bar" data-q-bar></div></div>' +
      '<div class="pa-per" data-q-perwrap hidden><div class="pa-per__track"><div class="pa-per__bar" data-q-perbar></div></div><span class="pa-per__text" data-q-pertext>30s</span></div>' +
      '<div class="pa-q"><span class="pa-q__tag" data-q-tag></span><h2 class="pa-q__text" data-q-text></h2></div>' +
      '<div class="pa-opts" data-q-opts></div>' +
      '<div class="pa-explain" data-q-explain hidden></div>' +
      '<div class="pa-quiz__actions"><button type="button" class="btn btn-outline text-gold hover-target" data-q-quit><span>Exit</span></button>' +
        '<button type="button" class="btn btn-gold hover-target" data-q-next hidden><span>Next</span></button></div>' +
    '</div>' +
    '<div class="pa-result" data-r-card hidden>' +
      '<div class="pa-result__head"><div class="pa-ring" data-r-ring data-pct="0%"><div class="pa-ring__inner"><span class="pa-ring__num" data-r-num>0</span><span class="pa-ring__den" data-r-den></span></div></div>' +
        '<div class="pa-result__headtext"><h2 class="pa-result__msg" data-r-msg></h2><p class="pa-result__meta" data-r-meta></p><div class="pa-breakdown" data-r-bd></div></div></div>' +
      '<div class="pa-result__actions"><button type="button" class="btn btn-gold hover-target" data-r-retry><span>Try Again</span><div class="btn-ripple" aria-hidden="true"></div></button>' +
        '<button type="button" class="btn btn-outline text-gold hover-target" data-r-back><span>Back</span></button></div>' +
      '<h3 class="pa-review__title">Review Every Answer</h3><div class="pa-review" data-r-review></div>' +
    '</div>';

  function start(questions, opts) {
    opts = opts || {};
    var root = opts.root;
    if (!root) return;
    root.innerHTML = QUIZ_HTML;
    var q = function (sel) { return root.querySelector(sel); };
    var els = {
      qCard: q('[data-q-card]'), rCard: q('[data-r-card]'),
      prog: q('[data-q-prog]'), elapsed: q('[data-q-elapsed]'), bar: q('[data-q-bar]'),
      perWrap: q('[data-q-perwrap]'), perBar: q('[data-q-perbar]'), perText: q('[data-q-pertext]'),
      tag: q('[data-q-tag]'), text: q('[data-q-text]'), opts: q('[data-q-opts]'),
      explain: q('[data-q-explain]'), next: q('[data-q-next]'), quit: q('[data-q-quit]'),
      ring: q('[data-r-ring]'), num: q('[data-r-num]'), den: q('[data-r-den]'),
      msg: q('[data-r-msg]'), meta: q('[data-r-meta]'), bd: q('[data-r-bd]'),
      retry: q('[data-r-retry]'), back: q('[data-r-back]'), review: q('[data-r-review]'),
      combo: q('[data-q-combo]'), comboN: q('[data-q-combo-n]')
    };
    var OK_MSG = ['Correct!', 'Nice!', 'Well done!', 'Exactly!', 'Spot on!', 'Brilliant!', 'You got it!'];
    var NO_MSG = ['Not quite.', 'Close one!', 'Good try.', 'Almost!'];
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    var items, index, startedAt, elapsed = 0, perTimer = null, elapsedTimer = null, streak = 0, bestStreak = 0;

    function build(list) {
      return list.map(function (it) {
        var o = it.o || it.opts || [];
        var order = shuffle(o.map(function (_, i) { return i; }));
        return { q: it.q, e: it.e, meta: it.meta || '', opts: order.map(function (i) { return o[i]; }), correct: order.indexOf(it.a != null ? it.a : it.correct), chosen: null };
      });
    }

    function run(list) {
      items = build(list); index = 0; elapsed = 0; startedAt = Date.now(); streak = 0; bestStreak = 0;
      if (els.combo) els.combo.hidden = true;
      els.rCard.hidden = true; els.qCard.hidden = false;
      if (!reduceMotion()) { els.qCard.classList.remove('pa-in'); void els.qCard.offsetWidth; els.qCard.classList.add('pa-in'); }
      startElapsed(); render();
    }

    function startElapsed() {
      stopElapsed();
      elapsedTimer = setInterval(function () { elapsed = Math.floor((Date.now() - startedAt) / 1000); els.elapsed.textContent = fmt(elapsed); }, 500);
    }
    function stopElapsed() { if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null; } }
    function clearPer() { if (perTimer) { clearInterval(perTimer); perTimer = null; } }

    function render() {
      clearPer();
      var it = items[index], n = items.length;
      els.prog.textContent = 'Question ' + (index + 1) + ' of ' + n;
      els.bar.style.width = (index / n * 100) + '%';
      if (it.meta) { els.tag.textContent = it.meta; els.tag.hidden = false; } else { els.tag.hidden = true; }
      els.text.innerHTML = esc(it.q);
      els.opts.innerHTML = '';
      it.opts.forEach(function (opt, idx) {
        var b = ce('button', 'pa-opt', '<span class="pa-opt__key">' + LETTERS[idx] + '</span><span class="pa-opt__txt">' + esc(opt) + '</span><span class="pa-opt__mark" aria-hidden="true"></span>');
        b.type = 'button';
        b.addEventListener('click', function () { choose(idx); });
        els.opts.appendChild(b);
      });
      els.explain.hidden = true; els.explain.innerHTML = '';
      els.next.hidden = true; els.next.innerHTML = '<span>' + (index === n - 1 ? 'See Results' : 'Next Question') + '</span>';

      if (opts.timed) {
        els.perWrap.hidden = false;
        var bar = els.perBar; bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth;
        var left = PER_SECONDS; els.perText.textContent = left + 's';
        if (!reduceMotion()) { bar.style.transition = 'width ' + PER_SECONDS + 's linear'; bar.style.width = '0%'; }
        perTimer = setInterval(function () { left--; els.perText.textContent = Math.max(0, left) + 's'; if (left <= 0) { clearPer(); if (it.chosen === null) choose(-1); } }, 1000);
      } else { els.perWrap.hidden = true; }
    }

    function choose(idx) {
      var it = items[index];
      if (it.chosen !== null) return;
      clearPer();
      it.chosen = idx;
      var btns = els.opts.querySelectorAll('.pa-opt');
      Array.prototype.forEach.call(btns, function (b, k) {
        b.disabled = true;
        if (k === it.correct) b.classList.add('is-correct');
        if (k === idx && idx !== it.correct) b.classList.add('is-wrong');
      });
      var ok = idx === it.correct;
      // Session-only streak / combo (nothing is stored).
      if (ok) { streak++; if (streak > bestStreak) bestStreak = streak; } else { streak = 0; }
      updateCombo();
      if (ok) {
        var cell = btns[it.correct];
        if (cell && !reduceMotion()) { cell.classList.remove('pa-pop'); void cell.offsetWidth; cell.classList.add('pa-pop'); }
      }
      var head = ok ? pick(OK_MSG) : (idx === -1 ? 'Time’s up.' : pick(NO_MSG));
      if (ok && streak >= 3) head = streak + ' in a row — ' + head;
      els.explain.className = 'pa-explain ' + (ok ? 'is-ok' : 'is-no');
      els.explain.innerHTML = '<strong>' + head + '</strong> ' + esc(it.e || '');
      els.explain.hidden = false;
      els.next.hidden = false; els.next.focus();
      els.bar.style.width = ((index + 1) / items.length * 100) + '%';
    }

    function updateCombo() {
      if (!els.combo) return;
      if (streak >= 2) {
        els.comboN.textContent = streak;
        els.combo.hidden = false;
        if (!reduceMotion()) { els.combo.classList.remove('pa-combo--bump'); void els.combo.offsetWidth; els.combo.classList.add('pa-combo--bump'); }
      } else {
        els.combo.hidden = true;
      }
    }

    function finish() {
      clearPer(); stopElapsed();
      var total = items.length, correct = items.filter(function (it) { return it.chosen === it.correct; }).length;
      var pct = Math.round(correct / total * 100);
      els.qCard.hidden = true; els.rCard.hidden = false;
      if (!reduceMotion()) { els.rCard.classList.remove('pa-in'); void els.rCard.offsetWidth; els.rCard.classList.add('pa-in'); }
      els.msg.textContent = pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Great work!' : pct >= 50 ? 'Good effort — keep going.' : 'A solid start — practice makes progress.';
      els.den.textContent = '/ ' + total;
      els.meta.textContent = (opts.metaLabel ? opts.metaLabel + ' · ' : '') + fmt(elapsed) + ' taken' +
        (bestStreak >= 3 ? ' · best streak ' + bestStreak : '');
      animateScore(correct, pct);

      // breakdown by meta tag
      els.bd.innerHTML = '';
      var by = {};
      items.forEach(function (it) { var k = it.meta || 'Overall'; by[k] = by[k] || { n: 0, ok: 0 }; by[k].n++; if (it.chosen === it.correct) by[k].ok++; });
      var keys = Object.keys(by);
      if (keys.length > 1 || keys[0] !== 'Overall') {
        keys.forEach(function (k) { els.bd.appendChild(ce('div', 'pa-bd', '<span>' + esc(k) + '</span><b>' + by[k].ok + '/' + by[k].n + '</b>')); });
      }

      els.review.innerHTML = '';
      items.forEach(function (it, i) {
        var ok = it.chosen === it.correct;
        var your = (it.chosen === -1 || it.chosen == null) ? '<em>No answer</em>' : esc(it.opts[it.chosen]);
        var d = ce('details', 'pa-rev ' + (ok ? 'is-ok' : 'is-no'));
        d.innerHTML = '<summary><span class="pa-rev__ic" aria-hidden="true"></span><span class="pa-rev__q">' + (i + 1) + '. ' + esc(it.q) + '</span></summary>' +
          '<div class="pa-rev__body"><p><strong>Correct answer:</strong> ' + LETTERS[it.correct] + '. ' + esc(it.opts[it.correct]) + '</p>' +
          (ok ? '' : '<p><strong>Your answer:</strong> ' + your + '</p>') + '<p class="pa-rev__exp">' + esc(it.e || '') + '</p></div>';
        els.review.appendChild(d);
      });

      if (opts.celebrate !== false && pct >= 70 && window.ITHFx && window.ITHFx.confetti && !reduceMotion()) {
        try { window.ITHFx.confetti(els.rCard, { count: 90 }); } catch (e) {}
      }
      scrollTo(els.rCard);
    }

    function animateScore(correct, pct) {
      var dur = reduceMotion() ? 0 : 900;
      if (dur === 0) { els.num.textContent = correct; els.ring.style.setProperty('--pa-pct', pct); els.ring.setAttribute('data-pct', pct + '%'); return; }
      var t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        els.num.textContent = Math.round(correct * eased);
        els.ring.style.setProperty('--pa-pct', (pct * eased).toFixed(1));
        els.ring.setAttribute('data-pct', Math.round(pct * eased) + '%');
        if (p < 1) requestAnimationFrame(step);
        else { els.num.textContent = correct; els.ring.style.setProperty('--pa-pct', pct); els.ring.setAttribute('data-pct', pct + '%'); }
      }
      requestAnimationFrame(step);
    }

    function scrollTo(node) { if (node && node.scrollIntoView) node.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); }

    els.next.addEventListener('click', function () { if (index < items.length - 1) { index++; render(); scrollTo(els.qCard); } else finish(); });
    els.quit.addEventListener('click', function () { if (confirm('Exit this test? Your progress will be lost.')) { clearPer(); stopElapsed(); if (opts.onExit) opts.onExit(); } });
    els.retry.addEventListener('click', function () { var fresh = opts.onRetry ? opts.onRetry() : null; run(fresh && fresh.length ? fresh : questions); scrollTo(els.qCard); });
    els.back.addEventListener('click', function () { if (opts.onExit) opts.onExit(); });

    run(questions);
  }

  window.ITHQuiz = { start: start };
})();
