/* =====================================================================
 * ith-reveal.js — Monsoon Minds live theme-reveal / timed-competition engine
 * ---------------------------------------------------------------------
 * Per-page config lives in window.REVEAL_CONFIG. Drives five panels:
 *   stPre     — before the competition day: countdown to availableFrom
 *   stStart   — participant enters details, reads rules, clicks Start
 *   stLive    — topic revealed, personal work timer counts down
 *   stSubmit  — work time over, submission-window timer + instructions
 *   stClosed  — window closed
 *
 * On Start we POST the participant's details to FormSubmit (into a hidden
 * iframe, so the page stays put) → the organiser is emailed "X started".
 * The start time is saved in localStorage so a refresh RESUMES the same
 * remaining time rather than restarting it.
 *
 * NOTE: this is a client-side engine on a static site. The topic is only
 * base64-obfuscated, not truly secret — real secrecy needs a backend.
 * ===================================================================== */
(function () {
  'use strict';
  var C = window.REVEAL_CONFIG;
  if (!C) return;
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'rvl_' + C.slug;
  var qp = new URLSearchParams(location.search);

  /* test hooks: ?rvl_reset=1 clears state, ?rvl_now=ISO fakes the clock */
  if (qp.get('rvl_reset') === '1') { try { localStorage.removeItem(KEY); } catch (e) {} }
  var nowOverride = qp.get('rvl_now') ? Date.parse(qp.get('rvl_now')) : null;
  var nowBase = nowOverride, nowSet = nowOverride ? Date.now() : 0;
  function now() { return nowOverride ? (nowBase + (Date.now() - nowSet)) : Date.now(); }

  var availFrom = Date.parse(C.availableFrom);
  var availUntil = Date.parse(C.availableUntil);
  var workMs = C.workMinutes * 60000;
  var submitMs = C.submitMinutes * 60000;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  var PANELS = ['stPre', 'stStart', 'stLive', 'stSubmit', 'stClosed'];
  function show(id) { PANELS.forEach(function (p) { var el = $(p); if (el) el.hidden = (p !== id); }); }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ms) {
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(ss);
  }
  function decodeTopic() {
    try { return decodeURIComponent(escape(atob(C.topicB64 || ''))); } catch (e) { return C.topic || ''; }
  }

  /* ---------- topic reveal (once) ---------- */
  var revealed = false;
  function revealTopic() {
    if (revealed) return; revealed = true;
    var t = $('rvlTopic');
    if (t) {
      if (C.topicIsProblemSet) {
        if (C.problemSetB64) {
          try { t.innerHTML = decodeURIComponent(escape(atob(C.problemSetB64))); }
          catch (e) { t.textContent = 'Your Python problem set has been emailed to you.'; }
          t.classList.add('rvl-topic--doc');
        } else if (C.problemSetUrl) {
          t.innerHTML = 'Your Python problem set is ready: <a href="' + C.problemSetUrl + '" target="_blank" rel="noopener">open the problem set</a>.';
        } else {
          t.innerHTML = 'Your Python problem set has been emailed to you. Check your inbox (and spam) now — your timer is running.';
        }
      } else {
        t.textContent = decodeTopic();
      }
      t.classList.remove('rvl-blur');
    }
  }
  function fillParticipant(st) {
    var n = $('rvlWho');
    if (n && st) n.textContent = (st.name || '') + (st.school ? ' · ' + st.school : '');
  }
  function genRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', a = null;
    try { if (window.crypto && crypto.getRandomValues) { a = new Uint8Array(6); crypto.getRandomValues(a); } } catch (e) { a = null; }
    for (var i = 0; i < 6; i++) { var v = a ? a[i] : Math.floor(Math.random() * 256); out += chars.charAt(v % chars.length); }
    return 'MM-' + (C.refPrefix || 'XX') + '-' + out;
  }
  function fillRef(st) {
    var r = (st && st.ref) || '';
    if ($('rvlRefLive')) $('rvlRefLive').textContent = r;
    if ($('rvlRefSubmit')) $('rvlRefSubmit').textContent = r;
    var m = $('rvlMailto');
    if (m) m.href = 'mailto:' + C.submitEmail + '?subject=' +
      encodeURIComponent('Monsoon Minds — ' + C.name + ' submission — ' + r + (st && st.name ? ' — ' + st.name : ''));
  }

  /* ---------- countdown-to-open ---------- */
  function setPreCells(ms) {
    if (ms < 0) ms = 0;
    var d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000),
        m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    if ($('rvlD')) $('rvlD').textContent = pad(d);
    if ($('rvlH')) $('rvlH').textContent = pad(h);
    if ($('rvlM')) $('rvlM').textContent = pad(m);
    if ($('rvlS')) $('rvlS').textContent = pad(s);
  }
  var preTimer = null;
  function runPre() {
    if (preTimer) return;
    function t() {
      var d = availFrom - now();
      if (d <= 0) { clearInterval(preTimer); preTimer = null; render(); return; }
      setPreCells(d);
    }
    t(); preTimer = setInterval(t, 1000);
  }

  /* ---------- the live/submit timer loop ---------- */
  var loop = null;
  function runLoop() {
    if (loop) clearInterval(loop);
    function t() {
      var st = load();
      if (!st || !st.startedAt) { clearInterval(loop); loop = null; render(); return; }
      var tnow = now(), workEnd = st.startedAt + workMs, subEnd = workEnd + submitMs;
      if (tnow < workEnd) {
        if ($('stLive').hidden) show('stLive');
        var left = workEnd - tnow;
        if ($('rvlWorkTimer')) $('rvlWorkTimer').textContent = fmt(left);
        if ($('rvlWorkBar')) $('rvlWorkBar').style.width = (100 * (1 - left / workMs)).toFixed(1) + '%';
        if (left <= 5 * 60000 && $('rvlWorkTimer')) $('rvlWorkTimer').classList.add('rvl-warn');
      } else if (tnow < subEnd) {
        if ($('stSubmit').hidden) show('stSubmit');
        if ($('rvlSubTimer')) $('rvlSubTimer').textContent = fmt(subEnd - tnow);
      } else {
        clearInterval(loop); loop = null;
        setClosed('Time is up — the submission window for ' + C.name + ' has closed.');
        show('stClosed');
      }
    }
    t(); loop = setInterval(t, 250);
  }

  function setClosed(msg) { if ($('rvlClosedMsg')) $('rvlClosedMsg').textContent = msg; }

  /* ---------- main state decision ---------- */
  function render() {
    var st = load(), tnow = now();
    if (st && st.startedAt) { revealTopic(); fillParticipant(st); fillRef(st); runLoop(); return; }
    if (tnow < availFrom) { show('stPre'); runPre(); return; }
    if (tnow > availUntil) { setClosed('The start window for ' + C.name + ' has closed.'); show('stClosed'); return; }
    show('stStart');
  }

  /* ---------- start form ---------- */
  function val(form, name) { var el = form.elements[name]; return el ? el.value.trim() : ''; }
  var startForm = $('rvlStartForm');
  if (startForm) {
    startForm.addEventListener('submit', function () {
      /* native validation has already passed, or this event would not fire */
      var prev = load();
      var st = {
        startedAt: now(),
        ref: (prev && prev.ref) || genRef(),
        name: val(startForm, 'Full name'),
        email: val(startForm, 'Email'),
        phone: val(startForm, 'Phone / WhatsApp'),
        cls: val(startForm, 'Class & section'),
        school: val(startForm, 'School name'),
        addr: val(startForm, 'School address'),
        city: val(startForm, 'City & state')
      };
      save(st);
      var rf = $('rvlRefField'); if (rf) rf.value = st.ref;
      var sa = $('rvlStartedAtField'); if (sa) sa.value = new Date(st.startedAt).toLocaleString('en-IN');
      /* do NOT preventDefault: the form posts into the hidden iframe (emails
         the organiser with the reference number). We reveal immediately after. */
      setTimeout(function () { revealTopic(); fillParticipant(st); fillRef(st); show('stLive'); runLoop(); }, 30);
    });
  }

  /* ---------- "I've emailed my submission" ---------- */
  var doneBtn = $('rvlDoneBtn');
  if (doneBtn) {
    doneBtn.addEventListener('click', function () {
      var st = load(); if (!st) return;
      var f = $('rvlDoneForm');
      if (f) {
        try {
          var set = function (k, v) { if (f.elements[k]) f.elements[k].value = v || ''; };
          set('Reference number', st.ref);
          set('Full name', st.name); set('Email', st.email); set('Phone / WhatsApp', st.phone);
          set('Class & section', st.cls); set('School name', st.school);
          set('School address', st.addr); set('City & state', st.city);
          set('Submitted at', new Date(now()).toLocaleString('en-IN'));
          f.submit();
        } catch (e) {}
      }
      doneBtn.disabled = true;
      doneBtn.textContent = 'Submission recorded ✓';
      if ($('rvlDoneMsg')) $('rvlDoneMsg').hidden = false;
    });
  }

  /* ---------- warn before leaving a running attempt ---------- */
  window.addEventListener('beforeunload', function (e) {
    var st = load();
    if (st && st.startedAt && now() < st.startedAt + workMs + submitMs) {
      e.preventDefault(); e.returnValue = ''; return '';
    }
  });

  render();
})();
