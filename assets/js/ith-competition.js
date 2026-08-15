/*!
 * ith-competition.js — behaviour for the season page (competition.html).
 *
 * Three jobs, all progressive enhancement — the page is fully readable and
 * usable if this file never loads:
 *   1. staggered scroll-reveal for `.cm-reveal`
 *   2. the live countdown to the moment registration opens
 *   3. count-up animation for the stat tiles
 *
 * Vanilla ES5, no dependencies, no build step.
 */
(function () {
  'use strict';

  var root = document.querySelector('.cm-page');
  if (!root) return;

  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------------------------------------------------------------- reveal */
  (function reveal() {
    var items = [].slice.call(root.querySelectorAll('.cm-reveal'));
    if (!items.length) return;

    // No IntersectionObserver, or the user prefers less motion: show it all now.
    if (!('IntersectionObserver' in window) || reduceMotion()) {
      items.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // Stagger siblings so a row of cards cascades rather than popping in.
        var group = el.parentNode ? [].slice.call(el.parentNode.children).filter(function (c) {
          return c.classList && c.classList.contains('cm-reveal');
        }) : [];
        var i = group.indexOf(el);
        el.style.setProperty('--cm-delay', (i > 0 ? Math.min(i, 6) * 70 : 0) + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (n) { io.observe(n); });

    // Safety net: never let an observer bug leave content invisible.
    setTimeout(function () {
      items.forEach(function (n) { n.classList.add('is-in'); });
    }, 2500);
  })();

  /* ------------------------------------------------------------- countdown */
  (function countdown() {
    var host = document.getElementById('cmCountdown');
    if (!host) return;

    var target = Date.parse(host.getAttribute('data-target'));
    if (isNaN(target)) return;

    var cells = {
      d: document.getElementById('cmDays'),
      h: document.getElementById('cmHours'),
      m: document.getElementById('cmMins'),
      s: document.getElementById('cmSecs')
    };
    if (!cells.d || !cells.h || !cells.m || !cells.s) return;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function tick() {
      var left = target - Date.now();

      if (left <= 0) {
        // Registration moment reached — show zeros rather than negative time.
        cells.d.textContent = cells.h.textContent = '00';
        cells.m.textContent = cells.s.textContent = '00';
        var title = document.getElementById('cmCountTitle');
        if (title) title.textContent = 'Registrations are open';
        clearInterval(timer);
        return;
      }

      var secs = Math.floor(left / 1000);
      cells.d.textContent = pad(Math.floor(secs / 86400));
      cells.h.textContent = pad(Math.floor(secs / 3600) % 24);
      cells.m.textContent = pad(Math.floor(secs / 60) % 60);
      cells.s.textContent = pad(secs % 60);
    }

    tick();
    var timer = setInterval(tick, 1000);
  })();

  /* --------------------------------------------------------------- countup */
  (function countUp() {
    var nums = [].slice.call(root.querySelectorAll('[data-count]'));
    if (!nums.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion()) return; // static values already in the HTML

    function run(el) {
      var to = parseFloat(el.getAttribute('data-count'));
      if (isNaN(to)) return;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1100;
      var start = 0;

      function frame(now) {
        if (!start) start = now;
        var p = Math.min((now - start) / dur, 1);
        // easeOutCubic — fast first, settles gently on the real number.
        var v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = prefix + (to % 1 === 0 ? Math.round(v) : v.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });

    nums.forEach(function (n) { io.observe(n); });
  })();
})();
