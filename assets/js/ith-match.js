/* Inspire Talent Hub — Match-up game.
 * ITHMatch.start(pairs, opts): match terms to meanings against a timer.
 * pairs: [{ f: term, b: meaning }]. Session only — nothing is stored.
 * opts: { root, title, onExit }
 */
(function () {
  'use strict';
  function ce(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function reduceMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

  var MAX_PAIRS = 6;

  var HTML =
    '<div class="mt" data-mt-game>' +
      '<div class="mt__top"><span class="mt__prog" data-mt-prog></span>' +
        '<span class="mt__timer"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-clock"></use></svg><span data-mt-time>0:00</span></span></div>' +
      '<p class="mt__hint">Tap a term, then its matching meaning.</p>' +
      '<div class="mt__grid"><div class="mt__col" data-mt-left></div><div class="mt__col" data-mt-right></div></div>' +
      '<button type="button" class="fc__exit" data-mt-exit>Exit game</button>' +
    '</div>' +
    '<div class="fc-summary" data-mt-summary hidden>' +
      '<div class="fc-summary__ring" data-mt-ring style="--fc-pct:100"><span>Done</span></div>' +
      '<h2 class="fc-summary__title">Matched them all!</h2>' +
      '<p class="fc-summary__meta" data-mt-smeta></p>' +
      '<div class="fc-summary__actions"><button type="button" class="btn btn-gold hover-target" data-mt-again><span>Play again</span></button>' +
        '<button type="button" class="btn btn-outline text-gold hover-target" data-mt-done><span>Back</span></button></div>' +
    '</div>';

  function start(pairs, opts) {
    opts = opts || {};
    var root = opts.root; if (!root || !pairs || pairs.length < 2) return;
    root.innerHTML = HTML;
    var q = function (s) { return root.querySelector(s); };
    var gameEl = q('[data-mt-game]'), sumEl = q('[data-mt-summary]');
    var leftCol = q('[data-mt-left]'), rightCol = q('[data-mt-right]');
    var progEl = q('[data-mt-prog]'), timeEl = q('[data-mt-time]'), smeta = q('[data-mt-smeta]');

    var chosen, total, matched, moves, selLeft, selRight, secs, timer, lock;

    function run() {
      var set = shuffle(pairs).slice(0, Math.min(MAX_PAIRS, pairs.length));
      chosen = set; total = set.length; matched = 0; moves = 0; selLeft = null; selRight = null; secs = 0; lock = false;
      sumEl.hidden = true; gameEl.hidden = false;
      progEl.textContent = '0 of ' + total + ' matched';
      timeEl.textContent = '0:00';
      leftCol.innerHTML = ''; rightCol.innerHTML = '';
      shuffle(set).forEach(function (p, i) { leftCol.appendChild(tile(p.f, idOf(set, p), 'left')); });
      shuffle(set).forEach(function (p, i) { rightCol.appendChild(tile(p.b, idOf(set, p), 'right')); });
      clearInterval(timer);
      timer = setInterval(function () { secs++; timeEl.textContent = fmt(secs); }, 1000);
    }
    function idOf(set, p) { return set.indexOf(p); }

    function tile(text, id, side) {
      var b = ce('button', 'mt-tile', '<span>' + esc(text) + '</span>');
      b.type = 'button'; b.setAttribute('data-id', id); b.setAttribute('data-side', side);
      b.addEventListener('click', function () { onPick(b, side, id); });
      return b;
    }

    function onPick(btn, side, id) {
      if (lock || btn.classList.contains('is-done')) return;
      if (side === 'left') { if (selLeft) selLeft.classList.remove('is-sel'); selLeft = btn; btn.classList.add('is-sel'); }
      else { if (selRight) selRight.classList.remove('is-sel'); selRight = btn; btn.classList.add('is-sel'); }
      if (selLeft && selRight) evaluate();
    }

    function evaluate() {
      moves++;
      var a = selLeft, b = selRight;
      if (a.getAttribute('data-id') === b.getAttribute('data-id')) {
        a.classList.add('is-done'); b.classList.add('is-done');
        a.classList.remove('is-sel'); b.classList.remove('is-sel');
        selLeft = null; selRight = null; matched++;
        progEl.textContent = matched + ' of ' + total + ' matched';
        if (matched === total) finish();
      } else {
        lock = true;
        a.classList.add('is-wrong'); b.classList.add('is-wrong');
        setTimeout(function () {
          a.classList.remove('is-wrong', 'is-sel'); b.classList.remove('is-wrong', 'is-sel');
          selLeft = null; selRight = null; lock = false;
        }, reduceMotion() ? 250 : 550);
      }
    }

    function finish() {
      clearInterval(timer);
      gameEl.hidden = true; sumEl.hidden = false;
      smeta.textContent = 'Finished in ' + fmt(secs) + ' with ' + moves + ' tries' + (moves === total ? ' — flawless!' : '');
      if (window.ITHFx && window.ITHFx.confetti && !reduceMotion()) { try { window.ITHFx.confetti(sumEl, { count: 80 }); } catch (e) {} }
    }

    q('[data-mt-exit]').addEventListener('click', function () { clearInterval(timer); if (opts.onExit) opts.onExit(); });
    q('[data-mt-done]').addEventListener('click', function () { if (opts.onExit) opts.onExit(); });
    q('[data-mt-again]').addEventListener('click', run);

    run();
  }

  window.ITHMatch = { start: start };
})();
