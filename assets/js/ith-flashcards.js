/* Inspire Talent Hub — Flashcards.
 * ITHFlash.start(cards, opts) renders a flip-card deck into opts.root.
 * cards: [{ f: front, b: back }]. Session only — nothing is stored.
 * opts: { root, title, onExit }
 */
(function () {
  'use strict';
  function ce(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function reduceMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var HTML =
    '<div class="fc" data-fc-deck>' +
      '<div class="fc__top"><span class="fc__prog" data-fc-prog></span>' +
        '<span class="fc__known" data-fc-known></span></div>' +
      '<div class="fc__progress"><div class="fc__progress-bar" data-fc-bar></div></div>' +
      '<button type="button" class="fc__card" data-fc-card aria-label="Flip card">' +
        '<div class="fc__inner" data-fc-inner>' +
          '<div class="fc__face fc__face--front"><span class="fc__label">Term</span><div class="fc__txt" data-fc-front></div><span class="fc__hint">Tap to flip</span></div>' +
          '<div class="fc__face fc__face--back"><span class="fc__label">Meaning</span><div class="fc__txt" data-fc-back></div></div>' +
        '</div>' +
      '</button>' +
      '<div class="fc__actions"><button type="button" class="btn btn-outline text-gold hover-target fc__again" data-fc-again><span>Review again</span></button>' +
        '<button type="button" class="btn btn-gold hover-target fc__got" data-fc-got><span>Got it</span></button></div>' +
      '<button type="button" class="fc__exit" data-fc-exit>Exit flashcards</button>' +
    '</div>' +
    '<div class="fc-summary" data-fc-summary hidden>' +
      '<div class="fc-summary__ring" data-fc-ring><span data-fc-pct>0%</span></div>' +
      '<h2 class="fc-summary__title" data-fc-stitle></h2>' +
      '<p class="fc-summary__meta" data-fc-smeta></p>' +
      '<div class="fc-summary__actions"><button type="button" class="btn btn-gold hover-target" data-fc-review hidden><span>Review the tricky ones</span></button>' +
        '<button type="button" class="btn btn-outline text-gold hover-target" data-fc-restart><span>Restart deck</span></button>' +
        '<button type="button" class="btn btn-outline text-gold hover-target" data-fc-done><span>Back</span></button></div>' +
    '</div>';

  function start(cards, opts) {
    opts = opts || {};
    var root = opts.root; if (!root || !cards || !cards.length) return;
    root.innerHTML = HTML;
    var q = function (s) { return root.querySelector(s); };
    var deckEl = q('[data-fc-deck]'), sumEl = q('[data-fc-summary]');
    var els = {
      prog: q('[data-fc-prog]'), known: q('[data-fc-known]'), bar: q('[data-fc-bar]'),
      card: q('[data-fc-card]'), inner: q('[data-fc-inner]'), front: q('[data-fc-front]'), back: q('[data-fc-back]'),
      again: q('[data-fc-again]'), got: q('[data-fc-got]'), exit: q('[data-fc-exit]'),
      ring: q('[data-fc-ring]'), pct: q('[data-fc-pct]'), stitle: q('[data-fc-stitle]'), smeta: q('[data-fc-smeta]'),
      review: q('[data-fc-review]'), restart: q('[data-fc-restart]'), done: q('[data-fc-done]')
    };

    var full = cards.slice();
    var deck, index, knownCount, reviewPile, flipped;

    function run(list) {
      deck = shuffle(list); index = 0; knownCount = 0; reviewPile = [];
      sumEl.hidden = true; deckEl.hidden = false;
      render();
    }

    function render() {
      flipped = false;
      var it = deck[index], n = deck.length;
      els.prog.textContent = 'Card ' + (index + 1) + ' of ' + n;
      els.known.textContent = knownCount + ' known';
      els.bar.style.width = (index / n * 100) + '%';
      els.front.innerHTML = esc(it.f);
      els.back.innerHTML = esc(it.b);
      els.inner.classList.remove('is-flipped');
      els.card.setAttribute('aria-pressed', 'false');
    }

    function flip() {
      flipped = !flipped;
      els.inner.classList.toggle('is-flipped', flipped);
      els.card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    }

    function advance(known) {
      if (known) knownCount++; else reviewPile.push(deck[index]);
      index++;
      els.bar.style.width = (index / deck.length * 100) + '%';
      if (index >= deck.length) finish();
      else { render(); if (!reduceMotion()) { els.card.classList.remove('fc-slide'); void els.card.offsetWidth; els.card.classList.add('fc-slide'); } }
    }

    function finish() {
      deckEl.hidden = true; sumEl.hidden = false;
      var total = deck.length, pct = Math.round(knownCount / total * 100);
      els.pct.textContent = pct + '%';
      els.ring.style.setProperty('--fc-pct', pct);
      els.stitle.textContent = pct === 100 ? 'Deck mastered!' : pct >= 70 ? 'Great progress!' : 'Keep going — you’ve got this.';
      els.smeta.textContent = 'You knew ' + knownCount + ' of ' + total + ' cards' + (reviewPile.length ? ' · ' + reviewPile.length + ' to review' : '');
      els.review.hidden = reviewPile.length === 0;
    }

    els.card.addEventListener('click', flip);
    els.got.addEventListener('click', function () { advance(true); });
    els.again.addEventListener('click', function () { advance(false); });
    els.exit.addEventListener('click', function () { if (opts.onExit) opts.onExit(); });
    els.done.addEventListener('click', function () { if (opts.onExit) opts.onExit(); });
    els.restart.addEventListener('click', function () { run(full); });
    els.review.addEventListener('click', function () { run(reviewPile); });
    root.addEventListener('keydown', function (e) {
      if (sumEl.hidden === false) return;
      if (e.key === ' ' || e.key === 'Enter') { if (document.activeElement === els.card) return; e.preventDefault(); flip(); }
      else if (e.key.toLowerCase() === 'k') advance(true);
      else if (e.key.toLowerCase() === 'r') advance(false);
    });

    run(full);
  }

  window.ITHFlash = { start: start };
})();
