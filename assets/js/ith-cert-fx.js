/*!
 * ith-cert-fx.js — Lightweight, dependency-free motion helpers for the
 * certificate & results system: a one-shot confetti burst, number count-up,
 * and a reduced-motion check. Canvas-based, self-cleaning, and fully disabled
 * when the user prefers reduced motion. No external libraries.
 */
(function (global) {
  'use strict';

  function reduceMotion() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // One-time celebratory confetti inside `container`; removes itself when done.
  function confetti(container, opts) {
    if (!container || reduceMotion()) return;
    opts = opts || {};
    var canvas = document.createElement('canvas');
    canvas.className = 'verify-result__confetti';
    canvas.setAttribute('aria-hidden', 'true');
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var W = container.clientWidth, H = container.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var colors = opts.colors || ['#e8c66a', '#c9a84c', '#fff1b7', '#ffffff'];
    var N = Math.min(96, Math.max(42, Math.floor(W / 8)));
    var parts = [];
    for (var i = 0; i < N; i++) {
      parts.push({
        x: W * (0.18 + Math.random() * 0.64), y: H * 0.22 + Math.random() * 12,
        vx: (Math.random() - 0.5) * 3.6, vy: -(2 + Math.random() * 4.5),
        g: 0.11 + Math.random() * 0.09, s: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.32,
        c: colors[i % colors.length]
      });
    }
    var start = performance.now(), DUR = opts.duration || 1600;
    function frame(t) {
      var el = t - start;
      ctx.clearRect(0, 0, W, H);
      var alpha = el > DUR - 420 ? Math.max(0, (DUR - el) / 420) : 1;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62); ctx.restore();
      }
      if (el < DUR) requestAnimationFrame(frame); else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  // Animate an element's integer text from 0 → its value.
  function countUp(el, opts) {
    if (!el) return;
    var m = String(el.textContent).match(/^(\D*)(\d[\d,]*)(.*)$/);
    if (!m) return;
    var target = parseInt(m[2].replace(/,/g, ''), 10);
    if (!isFinite(target) || target <= 0) return;
    var pre = m[1], suf = m[3];
    el.classList.add('count-up');
    if (reduceMotion()) { el.textContent = pre + target.toLocaleString() + suf; return; }
    var start = performance.now(), DUR = (opts && opts.duration) || 900;
    function step(t) {
      var p = Math.min(1, (t - start) / DUR);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(eased * target).toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Typewriter effect. Types `text` into `el`, leaving a blinking cursor.
  function typeText(el, text, opts) {
    if (!el) return;
    opts = opts || {};
    text = String(text == null ? '' : text);
    if (reduceMotion()) { el.textContent = text; return; }
    el.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'tw-cursor'; cursor.setAttribute('aria-hidden', 'true'); cursor.textContent = '❘';
    el.appendChild(cursor);
    el.setAttribute('aria-label', text);
    var i = 0, speed = opts.speed || 55;
    setTimeout(function tick() {
      if (i < text.length) { cursor.insertAdjacentText('beforebegin', text.charAt(i)); i++; setTimeout(tick, speed); }
      else if (opts.keepCursor === false) { setTimeout(function () { cursor.remove(); }, 900); }
    }, opts.delay || 0);
  }

  // Animated, accessible modal. Returns a handle with setContent()/close()/card.
  var CLOSE_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
  function modal(opts) {
    opts = opts || {};
    var prevFocus = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'cs-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    if (opts.label) overlay.setAttribute('aria-label', opts.label);
    var wrap = document.createElement('div'); wrap.className = 'cs-modal';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button'; closeBtn.className = 'cs-modal__close';
    closeBtn.setAttribute('aria-label', 'Close'); closeBtn.innerHTML = CLOSE_SVG;
    var card = document.createElement('div'); card.className = 'cs-modal__card';
    wrap.appendChild(closeBtn); wrap.appendChild(card); overlay.appendChild(wrap);

    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = overlay.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) { e.preventDefault(); return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    var closed = false;
    function close() {
      if (closed) return; closed = true;
      overlay.classList.add('is-closing');
      document.removeEventListener('keydown', onKey);
      setTimeout(function () {
        overlay.remove();
        document.body.style.overflow = '';
        if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} }
      }, 240);
    }
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    setTimeout(function () { closeBtn.focus(); }, 30);

    return {
      overlay: overlay, card: card,
      setContent: function (html) { card.innerHTML = html; },
      close: close
    };
  }

  global.ITHFx = { reduceMotion: reduceMotion, confetti: confetti, countUp: countUp, modal: modal, typeText: typeText };
})(typeof window !== 'undefined' ? window : this);
