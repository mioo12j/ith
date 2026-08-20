/*!
 * ith-snake.js — a low-opacity trail of arena/instrument icons that drifts
 * horizontally behind section text as the page scrolls (the "snake").
 *
 * Self-contained: icons are inline SVG paths defined here, so the effect works
 * on every page regardless of that page's sprite. Decorative only — it injects
 * aria-hidden layers, adds no content, and disables itself for reduced-motion.
 */
(function () {
  'use strict';

  var mq = window.matchMedia;
  if (mq && mq('(prefers-reduced-motion: reduce)').matches) return;

  // Arenas & instruments: book, pen, music note, brush/palette, flask (science),
  // code, mic (speaking), lightbulb (innovation), star, trophy/medal.
  var ICONS = [
    'M4 4h9a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z M20 4h-3a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h3z', // book
    'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z', // pen
    'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z', // music
    'M12 2a10 10 0 0 0 0 20c1 0 1.6-.8 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1.1a1.6 1.6 0 0 1 1.7-1.6H16a5.5 5.5 0 0 0 5.5-5.6C21.5 6 17.5 2 12 2z', // palette
    'M9 2v6L4.5 17A2.5 2.5 0 0 0 6.8 21h10.4a2.5 2.5 0 0 0 2.3-4L15 8V2 M8 2h8 M7 15h10', // flask
    'M16 18l6-6-6-6 M8 6l-6 6 6 6', // code
    'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4', // mic
    'M9 18h6 M10 22h4 M15 14a5 5 0 1 0-6 0c.8.8 1.3 1.5 1.5 2.5h3c.2-1 .7-1.7 1.5-2.5z', // bulb
    'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z', // star
    'M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M7 4H4v2a3 3 0 0 0 3 3 M17 4h3v2a3 3 0 0 1-3 3' // trophy
  ];

  function makeIcon(d, wy) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('class', 'ith-snake__i');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.setProperty('--wy', wy + 'px');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    return svg;
  }

  var hosts = document.querySelectorAll('[data-snake], .hm-section, .cm-section, .cm-hero');
  if (!hosts.length) return;

  var bands = [];
  hosts.forEach(function (host, hi) {
    // ensure the host can position an absolute child
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    var layer = document.createElement('div');
    layer.className = 'ith-snake';
    layer.setAttribute('aria-hidden', 'true');
    var row = document.createElement('div');
    row.className = 'ith-snake__row';

    // enough icons to span very wide screens, weaving up and down
    var count = 16;
    for (var i = 0; i < count; i++) {
      var d = ICONS[(i + hi) % ICONS.length];
      var wy = Math.round(Math.sin((i + hi) * 0.9) * 26); // vertical wave → snake
      row.appendChild(makeIcon(d, wy));
    }
    layer.appendChild(row);
    // snake sits above the section background but below the content wrapper
    host.insertBefore(layer, host.firstChild);
    bands.push({ host: host, row: row, dir: hi % 2 === 0 ? 1 : -1 });
  });

  var raf = 0;
  function update() {
    raf = 0;
    var vh = window.innerHeight || 1;
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var r = b.host.getBoundingClientRect();
      // progress 0→1 as the section travels up through the viewport
      var p = (vh - r.top) / (vh + r.height);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var range = 160; // px of horizontal travel
      var x = (p - 0.5) * 2 * range * b.dir;
      b.row.style.transform = 'translate(' + x.toFixed(1) + 'px, -50%)';
    }
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
