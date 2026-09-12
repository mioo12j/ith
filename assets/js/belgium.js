/* ============================================================
   BELGIUM — Discover Belgium landing page
   Interactions: reveal on scroll, sticky nav, mobile menu,
   carousel, hero parallax, count-up, active links, back-to-top
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- current year ---------- */
  var yr = $('#beYear');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- reveal on scroll ---------- */
  var reveals = $$('.be-reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el, i) {
      // gentle stagger for siblings sharing a parent
      el.style.transitionDelay = (Math.min(i % 6, 5) * 70) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- sticky nav ---------- */
  var nav = $('#beNav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 30);
    var top = $('#beTop');
    if (top) top.classList.toggle('is-show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = $('#beBurger'), links = $('#beNavLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- back to top ---------- */
  var toTop = $('#beTop');
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- carousel ---------- */
  var track = $('#beCarTrack');
  if (track) {
    var step = function () {
      var card = track.querySelector('.be-xcard');
      return card ? card.getBoundingClientRect().width + 20 : 260;
    };
    var prev = $('#beCarPrev'), next = $('#beCarNext');
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
  }

  /* ---------- hero parallax (mouse + scroll) ---------- */
  var floats = $$('[data-depth]');
  if (floats.length && !reduce && window.matchMedia('(hover:hover)').matches) {
    var hero = $('#be-hero');
    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var cx = (e.clientX - r.left) / r.width - 0.5;
        var cy = (e.clientY - r.top) / r.height - 0.5;
        floats.forEach(function (f) {
          var d = parseFloat(f.getAttribute('data-depth')) || 20;
          f.style.transform = 'translate(' + (-cx * d) + 'px,' + (-cy * d) + 'px)';
        });
      });
      hero.addEventListener('mouseleave', function () {
        floats.forEach(function (f) { f.style.transform = ''; });
      });
    }
  }
  // subtle scroll parallax on the hero scene
  var scene = $('.be-hero__scene');
  if (scene && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) scene.style.transform = 'translateY(' + (y * 0.18) + 'px)';
    }, { passive: true });
  }

  /* ---------- count-up stats ---------- */
  var counters = $$('[data-count]');
  if (counters.length) {
    var animate = function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
      var start = null, dur = 1600;
      var tick = function (t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animate(e.target); co.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { co.observe(c); });
    } else {
      counters.forEach(animate);
    }
  }

  /* ---------- active section in nav ---------- */
  var navLinks = $$('#beNavLinks a[href^="#"]');
  var sections = navLinks.map(function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  }).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- smooth anchor scroll with nav offset ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
