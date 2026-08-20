/* Inspire Talent Hub — homepage behaviour (dependency-free).
 * 1. Scroll-reveal cascade for .hm-reveal elements.
 * 2. Live countdown to the next competition season.
 * Both are progressive enhancements: without JS (or with reduced motion) the
 * content is fully visible and the countdown simply shows its static markup.
 */
(function () {
  'use strict';

  /* ---- 1. Scroll reveal ------------------------------------------------ */
  (function reveal() {
    var items = document.querySelectorAll('.hm-reveal');
    if (!items.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var show = function (el) { el.classList.add('is-in'); };

    if (reduce || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) show(items[i]);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          show(entries[i].target);
          io.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    for (var j = 0; j < items.length; j++) {
      io.observe(items[j]);
      // Safety net: never leave content stuck invisible.
      (function (el) { setTimeout(function () { show(el); }, 2500); })(items[j]);
    }
  })();

  /* ---- 2. Season countdown -------------------------------------------- */
  (function countdown() {
    var root = document.getElementById('hmCountdown');
    if (!root) return;

    var target = new Date(root.getAttribute('data-target')).getTime();
    if (!target || isNaN(target)) return;

    var cells = {
      d: root.querySelector('[data-cd="days"]'),
      h: root.querySelector('[data-cd="hours"]'),
      m: root.querySelector('[data-cd="minutes"]'),
      s: root.querySelector('[data-cd="seconds"]')
    };
    if (!cells.d || !cells.h || !cells.m || !cells.s) return;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function tick() {
      var diff = Math.max(0, target - Date.now());
      cells.d.textContent = pad(Math.floor(diff / 86400000));
      cells.h.textContent = pad(Math.floor((diff / 3600000) % 24));
      cells.m.textContent = pad(Math.floor((diff / 60000) % 60));
      cells.s.textContent = pad(Math.floor((diff / 1000) % 60));
    }

    tick();
    setInterval(tick, 1000);
  })();

  /* ---- 3. Cursor-reactive hero spotlight (fine pointers only) --------- */
  (function heroGlow() {
    var hero = document.querySelector('.hm-hero');
    if (!hero) return;
    var mq = window.matchMedia;
    if (mq && (mq('(pointer: coarse)').matches || mq('(prefers-reduced-motion: reduce)').matches)) return;

    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--hm-mx', ((e.clientX - r.left) / r.width * 100) + '%');
        hero.style.setProperty('--hm-my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  })();


  /* ---- 4. Floating blocks drifting behind the hero (CodePen motif) ----- */
  (function floatingBlocks() {
    var hero = document.querySelector('.hm-hero');
    if (!hero) return;
    var mq = window.matchMedia;
    if (mq && mq('(prefers-reduced-motion: reduce)').matches) return;

    var tints = ['#8ea2c8', '#4d9fff', '#9a7cff', '#34d1c1', '#e8c66a', '#ff7c6a'];
    var wrap = document.createElement('div');
    wrap.className = 'hm-blocks';
    wrap.setAttribute('aria-hidden', 'true');

    var n = window.innerWidth < 640 ? 7 : 14;
    for (var i = 0; i < n; i++) {
      var c = document.createElement('span');
      c.className = 'hm-cube';
      var st = c.style;
      st.setProperty('--s', (16 + Math.random() * 30).toFixed(0) + 'px');
      st.left = (Math.random() * 96).toFixed(1) + '%';
      st.top = (Math.random() * 92).toFixed(1) + '%';
      st.setProperty('--r', (Math.random() * 40 - 20).toFixed(0) + 'deg');
      st.setProperty('--d', (10 + Math.random() * 10).toFixed(0) + 's');
      st.setProperty('--delay', (-Math.random() * 9).toFixed(1) + 's');
      st.setProperty('--fly', (-(16 + Math.random() * 30)).toFixed(0) + 'px');
      st.setProperty('--tint', tints[i % tints.length]);
      wrap.appendChild(c);
    }
    hero.appendChild(wrap);

    /* gentle scroll parallax — the blocks drift as the page moves */
    var onScroll = function () {
      var y = window.pageYOffset || 0;
      wrap.style.transform = 'translateY(' + (y * 0.08).toFixed(1) + 'px)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

})();
