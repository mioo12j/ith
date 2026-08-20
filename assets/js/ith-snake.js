/*!
 * ith-snake.js — a low-opacity trail of arena/instrument icons that weaves
 * behind section text and loops left→right→left across the page (homepage).
 *
 * Self-contained: icons are inline SVG paths defined here, so it needs no
 * page sprite. Decorative only — injects aria-hidden layers, adds no content,
 * disables itself for reduced-motion. Horizontal drift is a CSS animation
 * (see .ith-snake__row in style.css); this file only builds the icons.
 */
(function () {
  'use strict';

  var mq = window.matchMedia;
  if (mq && mq('(prefers-reduced-motion: reduce)').matches) return;

  // Arenas & instruments: book, pen, music, brush/palette, flask, code, mic,
  // lightbulb, star, trophy.
  var ICONS = [
    'M4 4h9a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z M20 4h-3a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h3z',
    'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z',
    'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    'M12 2a10 10 0 0 0 0 20c1 0 1.6-.8 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1.1a1.6 1.6 0 0 1 1.7-1.6H16a5.5 5.5 0 0 0 5.5-5.6C21.5 6 17.5 2 12 2z',
    'M9 2v6L4.5 17A2.5 2.5 0 0 0 6.8 21h10.4a2.5 2.5 0 0 0 2.3-4L15 8V2 M8 2h8 M7 15h10',
    'M16 18l6-6-6-6 M8 6l-6 6 6 6',
    'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4',
    'M9 18h6 M10 22h4 M15 14a5 5 0 1 0-6 0c.8.8 1.3 1.5 1.5 2.5h3c.2-1 .7-1.7 1.5-2.5z',
    'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z',
    'M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M7 4H4v2a3 3 0 0 0 3 3 M17 4h3v2a3 3 0 0 1-3 3'
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

  var hosts = document.querySelectorAll('[data-snake], .hm-section');
  if (!hosts.length) return;

  hosts.forEach(function (host, hi) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    var layer = document.createElement('div');
    layer.className = 'ith-snake' + (hi % 2 ? ' ith-snake--rev' : '');
    layer.setAttribute('aria-hidden', 'true');

    var row = document.createElement('div');
    row.className = 'ith-snake__row';

    for (var i = 0; i < 16; i++) {
      var d = ICONS[(i + hi) % ICONS.length];
      var wy = Math.round(Math.sin((i + hi) * 0.9) * 26); // vertical wave → snake
      row.appendChild(makeIcon(d, wy));
    }
    layer.appendChild(row);
    host.insertBefore(layer, host.firstChild);
  });
})();
