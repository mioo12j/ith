/* Study Hub — scroll-triggered cascade reveal (native, dependency-free).
 * The hub engine renders card grids via innerHTML as the user moves through
 * steps. This watches the shell, and as each new set of cards enters the
 * viewport it fades + slides them up in a staggered cascade.
 *
 * Progressive enhancement: if IntersectionObserver / MutationObserver are
 * unavailable, or the user prefers reduced motion, nothing is hidden and the
 * content renders exactly as the engine produced it.
 */
(function () {
  'use strict';

  var shell = document.querySelector('.sh-shell');
  if (!shell) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window) || !('MutationObserver' in window)) return;

  var CARD_SEL = '.sh-grade, .sh-sub, .sh-chap, .sh-tool';
  var STAGGER_MS = 55;   // delay between siblings
  var MAX_DELAY = 440;   // cap so long lists don't lag
  var SAFETY_MS = 1200;  // force-reveal fallback if IO never fires

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('is-in');
        io.unobserve(entries[i].target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

  function visible(node) {
    return !!(node.offsetParent !== null || node.getClientRects().length);
  }

  function process() {
    var cards = shell.querySelectorAll(CARD_SEL);
    var counts = []; // [container, index] pairs — small lists, linear scan is fine

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.getAttribute('data-sh-anim') === '1') continue;
      if (!visible(card)) continue; // only animate cards inside the active step

      card.setAttribute('data-sh-anim', '1');

      // per-container stagger index
      var parent = card.parentNode, idx = 0, found = false;
      for (var c = 0; c < counts.length; c++) {
        if (counts[c][0] === parent) { idx = ++counts[c][1]; found = true; break; }
      }
      if (!found) counts.push([parent, 0]);

      var delay = Math.min(idx * STAGGER_MS, MAX_DELAY);
      card.style.setProperty('--sh-delay', delay + 'ms');
      card.classList.add('sh-anim');
      io.observe(card);

      (function (el) {
        setTimeout(function () { el.classList.add('is-in'); }, SAFETY_MS);
      })(card);
    }
  }

  var scheduled = false;
  var mo = new MutationObserver(function () {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; process(); });
  });
  mo.observe(shell, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden']
  });

  process();
})();
