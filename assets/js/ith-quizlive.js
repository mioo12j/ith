/* =====================================================================
 * ith-quizlive.js — Monsoon Minds live MCQ quiz engine
 * ---------------------------------------------------------------------
 * window.QUIZ_CONFIG drives it. States:
 *   stPre     — before the quiz day: countdown to availableFrom
 *   stStart   — individual login + level pick + system check, then Start
 *   stQuiz    — 30-minute quiz, one question at a time, visible timer
 *   stResult  — submitted; score is hidden from the student (emailed to you)
 *   stClosed  — window closed
 *
 * On Start we email "STARTED" to the organiser (FormSubmit → hidden iframe).
 * On submit/timeout we auto-score the MCQs client-side and email the score +
 * every answer to the organiser; the student only sees a confirmation.
 * Start time + answers are saved in localStorage so a refresh RESUMES the
 * same remaining time and keeps answers — no restart.
 *
 * Static-site caveat: the answer key is only base64-obfuscated, not secret.
 * ===================================================================== */
(function () {
  'use strict';
  var C = window.QUIZ_CONFIG;
  if (!C) return;
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'qz_' + C.slug;
  var qp = new URLSearchParams(location.search);
  if (qp.get('qz_reset') === '1') { try { localStorage.removeItem(KEY); } catch (e) {} }
  var nowOverride = qp.get('qz_now') ? Date.parse(qp.get('qz_now')) : null;
  var nowBase = nowOverride, nowSet = nowOverride ? Date.now() : 0;
  function now() { return nowOverride ? (nowBase + (Date.now() - nowSet)) : Date.now(); }

  var availFrom = Date.parse(C.availableFrom), availUntil = Date.parse(C.availableUntil);
  var durMs = C.durationMinutes * 60000;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  var ST = load() || null;

  var PANELS = ['stPre', 'stStart', 'stQuiz', 'stResult', 'stClosed'];
  function show(id) { PANELS.forEach(function (p) { var el = $(p); if (el) el.hidden = (p !== id); }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ms) { if (ms < 0) ms = 0; var s = Math.floor(ms / 1000); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
  function b64decArr(s) { try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (e) { return []; } }

  function genRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', a = null;
    try { if (window.crypto && crypto.getRandomValues) { a = new Uint8Array(6); crypto.getRandomValues(a); } } catch (e) { a = null; }
    for (var i = 0; i < 6; i++) { var v = a ? a[i] : Math.floor(Math.random() * 256); out += chars.charAt(v % chars.length); }
    return 'MM-' + (C.refPrefix || 'QZ') + '-' + out;
  }

  function levelById(id) {
    for (var i = 0; i < C.levels.length; i++) if (C.levels[i].id === id) return C.levels[i];
    return C.levels[0];
  }

  /* ---------- pre countdown ---------- */
  var preTimer = null;
  function runPre() {
    if (preTimer) return;
    function t() {
      var d = availFrom - now();
      if (d <= 0) { clearInterval(preTimer); preTimer = null; route(); return; }
      if ($('qzD')) $('qzD').textContent = pad(Math.floor(d / 86400000));
      if ($('qzH')) $('qzH').textContent = pad(Math.floor(d / 3600000) % 24);
      if ($('qzM')) $('qzM').textContent = pad(Math.floor(d / 60000) % 60);
      if ($('qzS')) $('qzS').textContent = pad(Math.floor(d / 1000) % 60);
    }
    t(); preTimer = setInterval(t, 1000);
  }

  /* ---------- quiz rendering ---------- */
  var idx = 0;
  function qs() { return levelById(ST.level).questions; }
  function setAns(i, v) { ST.answers[i] = v; save(ST); }

  function renderQ() {
    var list = qs(), q = list[idx];
    if ($('qzCount')) $('qzCount').textContent = 'Q ' + (idx + 1) + ' / ' + list.length;
    if ($('qzBar')) $('qzBar').style.width = (100 * (idx + 1) / list.length) + '%';
    if ($('qzRef')) $('qzRef').textContent = ST.ref || '';
    var qt = $('qzQ'); if (qt) qt.textContent = (idx + 1) + '. ' + q.q;
    var opts = $('qzOpts'); if (!opts) return;
    opts.innerHTML = '';
    if (q.type === 'text') {
      var ta = document.createElement('textarea');
      ta.className = 'qz-text'; ta.rows = 4; ta.placeholder = 'Type your answer here…';
      ta.value = (ST.answers[idx] != null ? ST.answers[idx] : '');
      ta.addEventListener('input', function () { setAns(idx, ta.value); });
      opts.appendChild(ta);
    } else {
      q.options.forEach(function (opt, oi) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'qz-opt' + (ST.answers[idx] === oi ? ' is-sel' : '');
        b.innerHTML = '<span class="qz-opt__k">' + String.fromCharCode(65 + oi) + '</span>' + escapeHtml(opt);
        b.addEventListener('click', function () {
          setAns(idx, oi);
          Array.prototype.forEach.call(opts.children, function (c) { c.classList.remove('is-sel'); });
          b.classList.add('is-sel');
        });
        opts.appendChild(b);
      });
    }
    if ($('qzPrev')) $('qzPrev').disabled = (idx === 0);
    var last = (idx === list.length - 1);
    if ($('qzNext')) $('qzNext').hidden = last;
    if ($('qzSubmit')) $('qzSubmit').hidden = !last;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  /* ---------- timer loop ---------- */
  var loop = null;
  function runLoop() {
    if (loop) clearInterval(loop);
    function t() {
      if (!ST || !ST.startedAt || ST.submitted) { clearInterval(loop); loop = null; return; }
      var left = ST.startedAt + durMs - now();
      if ($('qzTimer')) {
        $('qzTimer').textContent = fmt(left);
        $('qzTimer').classList.toggle('qz-warn', left <= 2 * 60000);
      }
      if (left <= 0) { clearInterval(loop); loop = null; finish(true); }
    }
    t(); loop = setInterval(t, 250);
  }

  /* ---------- scoring + finish ---------- */
  function finish(auto) {
    if (!ST || ST.submitted) { show('stResult'); return; }
    var list = qs(), keys = b64decArr((C.answerKeys || {})[ST.level] || ''), correct = 0, mcq = 0, lines = [];
    for (var i = 0; i < list.length; i++) {
      var q = list[i], a = ST.answers[i];
      if (q.type === 'text') {
        lines.push('Q' + (i + 1) + ' (typed): ' + (a != null ? a : '(blank)'));
      } else {
        mcq++;
        var chosen = (a != null) ? q.options[a] : '(blank)';
        var ok = (keys[i] != null && a === keys[i]);
        if (ok) correct++;
        lines.push('Q' + (i + 1) + ': ' + (a != null ? String.fromCharCode(65 + a) + ') ' + chosen : '(blank)') + (keys[i] != null ? (ok ? '  ✓' : '  ✗') : ''));
      }
    }
    ST.submitted = true; ST.score = correct; ST.total = mcq; ST.endedAt = now();
    save(ST);
    emailResult(correct, mcq, lines, auto);
    if ($('qzRefDone')) $('qzRefDone').textContent = ST.ref || '';
    if ($('qzResultNote')) $('qzResultNote').textContent =
      (auto ? 'Time is up — your answers were submitted automatically. ' : '') +
      'Your responses have been recorded and sent to the organisers. Final results will be published on the website.';
    show('stResult');
  }

  function emailResult(score, total, lines, auto) {
    var f = $('qzResultForm'); if (!f) return;
    try {
      var set = function (k, v) { if (f.elements[k]) f.elements[k].value = v; };
      set('Reference number', ST.ref); set('Full name', ST.name); set('Email', ST.email);
      set('Phone / WhatsApp', ST.phone); set('Class & section', ST.cls);
      set('School name', ST.school); set('Level', levelById(ST.level).label);
      set('Auto score (MCQ)', score + ' / ' + total + (auto ? '  (auto-submitted on timeout)' : ''));
      set('Answers', lines.join('\n'));
      set('Submitted at', new Date(now()).toLocaleString('en-IN'));
      f.submit();
    } catch (e) {}
  }

  /* ---------- router ---------- */
  function route() {
    ST = load();
    var t = now();
    if (ST && ST.submitted) { if ($('qzRefDone')) $('qzRefDone').textContent = ST.ref || ''; show('stResult'); return; }
    if (ST && ST.startedAt) {
      if (t >= ST.startedAt + durMs) { show('stQuiz'); finish(true); return; }
      idx = 0; show('stQuiz'); renderQ(); runLoop(); return;
    }
    if (t < availFrom) { show('stPre'); runPre(); return; }
    if (t > availUntil) { if ($('qzClosedMsg')) $('qzClosedMsg').textContent = 'The window for ' + C.name + ' has closed.'; show('stClosed'); return; }
    show('stStart');
  }

  /* ---------- wire controls ---------- */
  function val(form, n) { var e = form.elements[n]; return e ? e.value.trim() : ''; }
  var startForm = $('qzStartForm');
  if (startForm) startForm.addEventListener('submit', function () {
    var lvl = (startForm.elements['Level'] ? startForm.elements['Level'].value : (C.levels[0] && C.levels[0].id)) || 'junior';
    var ref = genRef();
    ST = {
      startedAt: now(), ref: ref, level: lvl, answers: {}, submitted: false,
      name: val(startForm, 'Full name'), email: val(startForm, 'Email'),
      phone: val(startForm, 'Phone / WhatsApp'), cls: val(startForm, 'Class & section'),
      school: val(startForm, 'School name'), addr: val(startForm, 'School address'), city: val(startForm, 'City & state')
    };
    save(ST);
    if ($('qzRefField')) $('qzRefField').value = ref;
    if ($('qzLevelField')) $('qzLevelField').value = levelById(lvl).label;
    if ($('qzStartedAtField')) $('qzStartedAtField').value = new Date(ST.startedAt).toLocaleString('en-IN');
    /* let the form post into the hidden iframe (emails organiser), then begin */
    setTimeout(function () { idx = 0; show('stQuiz'); renderQ(); runLoop(); }, 30);
  });

  var prev = $('qzPrev'), next = $('qzNext'), sub = $('qzSubmit');
  if (prev) prev.addEventListener('click', function () { if (idx > 0) { idx--; renderQ(); } });
  if (next) next.addEventListener('click', function () { if (idx < qs().length - 1) { idx++; renderQ(); } });
  if (sub) sub.addEventListener('click', function () {
    var blanks = 0; var list = qs();
    for (var i = 0; i < list.length; i++) if (ST.answers[i] == null || ST.answers[i] === '') blanks++;
    var msg = blanks ? ('You have ' + blanks + ' unanswered question' + (blanks > 1 ? 's' : '') + '. Submit anyway?') : 'Submit your quiz? You cannot change answers after this.';
    if (window.confirm(msg)) finish(false);
  });

  window.addEventListener('beforeunload', function (e) {
    if (ST && ST.startedAt && !ST.submitted && now() < ST.startedAt + durMs) { e.preventDefault(); e.returnValue = ''; return ''; }
  });

  route();
})();
