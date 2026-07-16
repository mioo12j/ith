/* Inspire Talent Hub — Practice Arena.
 * Builds the setup UI, then hands the chosen question set to the shared
 * ITHQuiz runner (assets/js/ith-quiz.js) for a consistent test experience.
 */
(function () {
  'use strict';
  var DB = window.ITH_PRACTICE;
  if (!DB) return;

  function el(id) { return document.getElementById(id); }
  function ce(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function reduceMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  var selectedCats = {};

  function catName(id) { var c = DB.categories.filter(function (x) { return x.id === id; })[0]; return c ? c.name : id; }
  function activeCatIds() { var ids = Object.keys(selectedCats); return ids.length ? ids : DB.categories.map(function (c) { return c.id; }); }
  function pool() {
    var cats = activeCatIds(), diff = el('paDiff').value;
    return DB.questions.filter(function (q) { return cats.indexOf(q.c) !== -1 && (diff === 'any' || String(q.d) === diff); });
  }
  function catLabel() { var ids = activeCatIds(); return ids.length === DB.categories.length ? 'All categories' : ids.map(catName).join(', '); }

  function buildList() {
    var p = pool(), want = parseInt(el('paCount').value, 10);
    return shuffle(p).slice(0, Math.min(want, p.length)).map(function (q) {
      return { q: q.q, o: q.o, a: q.a, e: q.e, meta: catName(q.c) };
    });
  }

  function updateAvail() {
    var avail = pool().length, want = parseInt(el('paCount').value, 10);
    el('paAvail').textContent = avail + ' question' + (avail === 1 ? '' : 's') + ' available' + (avail < want ? ' — your quiz will use all ' + avail : '');
    el('paStart').disabled = avail === 0;
  }

  function showPanel(id) {
    ['paSetup', 'paQuiz'].forEach(function (s) { var n = el(s); if (n) n.hidden = (s !== id); });
    var scroller = el(id === 'paQuiz' ? 'paQuiz' : 'paSetup');
    if (scroller && scroller.scrollIntoView) scroller.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function startQuiz() {
    var list = buildList();
    if (!list.length) return;
    showPanel('paQuiz');
    window.ITHQuiz.start(list, {
      root: el('paQuizRoot'),
      timed: el('paTimed').checked,
      metaLabel: catLabel(),
      onExit: function () { showPanel('paSetup'); },
      onRetry: buildList
    });
  }

  function initSetup() {
    var chipWrap = el('paCatChips');
    DB.categories.forEach(function (c) {
      var count = DB.questions.filter(function (q) { return q.c === c.id; }).length;
      var btn = ce('button', 'pa-chip', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-' + c.icon + '"></use></svg><span>' + esc(c.name) + '</span><small>' + count + '</small>');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        if (selectedCats[c.id]) { delete selectedCats[c.id]; btn.setAttribute('aria-pressed', 'false'); btn.classList.remove('is-on'); }
        else { selectedCats[c.id] = true; btn.setAttribute('aria-pressed', 'true'); btn.classList.add('is-on'); }
        updateAvail();
      });
      chipWrap.appendChild(btn);
    });
    el('paStart').addEventListener('click', startQuiz);
    ['paDiff', 'paCount'].forEach(function (id) { el(id).addEventListener('change', updateAvail); });
    updateAvail();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('paSetup')) return;
    initSetup();
  });
})();
