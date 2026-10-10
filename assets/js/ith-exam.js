/* =====================================================================
 * ith-exam.js — Monsoon Minds live quiz / assessment engine
 * ---------------------------------------------------------------------
 * One page per quiz. window.EXAM_CONFIG drives everything. Views:
 *   view-registration  — details + team + level + rules, then Start
 *   view-quiz          — timed MCQ, palette, flag, prev/next
 *   view-review        — flagged / unanswered summary before submit
 *   view-completion    — receipt only (SCORE IS HIDDEN from the student)
 *
 * Key properties vs. the old single-page portal:
 *  - Answers are NEVER shipped in plaintext. Each question carries a
 *    salted SHA-256 hash of its correct option; we score by hashing the
 *    chosen option and comparing. (Still client-side: a determined coder
 *    could brute-force the 4 visible options — real secrecy needs a
 *    backend. This only defeats casual "view source".)
 *  - Works on phones: screen-share (desktop only) is best-effort; on
 *    mobile we record camera+mic. Nothing hard-locks the student out.
 *  - Recording is watermarked and downloads to the student's device; a
 *    firm notice says no recording = grounds for disqualification.
 *  - The result email to the organiser is SHORT (identity + score +
 *    integrity flags) so FormSubmit delivers it reliably.
 *  - Timer + answers persist in localStorage: a refresh RESUMES the same
 *    remaining time; the exam cannot be restarted.
 * ===================================================================== */
(function () {
  'use strict';
  var C = window.EXAM_CONFIG;
  if (!C) return;

  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'exam_' + C.slug;
  var qp = new URLSearchParams(location.search);

  /* test hooks */
  if (qp.get('exam_reset') === '1') { try { localStorage.removeItem(KEY); } catch (e) {} }
  var noProctor = qp.get('exam_noproctor') === '1';   /* lets automated tests skip camera */
  var nowOverride = qp.get('exam_now') ? Date.parse(qp.get('exam_now')) : null;
  var nowBase = nowOverride, nowSet = nowOverride ? Date.now() : 0;
  function now() { return nowOverride ? (nowBase + (Date.now() - nowSet)) : Date.now(); }

  var durMs = (C.durationSeconds || 1800) * 1000;
  var MARK = C.marking || { correct: 4, wrong: -1, blank: 0 };
  var availFrom = C.availableFrom ? Date.parse(C.availableFrom) : null;
  var availUntil = C.availableUntil ? Date.parse(C.availableUntil) : null;

  /* ---------- storage ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }
  var ST = load();

  /* ---------- helpers ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtClock(sec) {
    if (sec < 0) sec = 0;
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(s);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function norm(s) { return String(s).trim().toLowerCase().replace(/\s+/g, ' '); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function genRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', a = null;
    try { if (window.crypto && crypto.getRandomValues) { a = new Uint8Array(6); crypto.getRandomValues(a); } } catch (e) { a = null; }
    for (var i = 0; i < 6; i++) { var v = a ? a[i] : Math.floor(Math.random() * 256); out += chars.charAt(v % chars.length); }
    return 'MM-' + (C.refPrefix || 'QZ') + '-' + out;
  }
  function sha256hex(str) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve('');
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      var b = new Uint8Array(buf), o = '';
      for (var i = 0; i < b.length; i++) o += b[i].toString(16).padStart(2, '0');
      return o;
    });
  }
  function keyFor(qid, optText) { return sha256hex(C.salt + '::' + C.slug + '::' + qid + '::' + norm(optText)); }

  /* ---------- views ---------- */
  var VIEWS = ['view-registration', 'view-quiz', 'view-review', 'view-completion'];
  function showView(id) {
    VIEWS.forEach(function (v) { var el = $(v); if (el) el.classList.toggle('is-active', v === id); });
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  function levelById(id) {
    for (var i = 0; i < C.levels.length; i++) if (C.levels[i].id === id) return C.levels[i];
    return C.levels[0];
  }

  /* =================================================================
   * PROCTORING — graceful, phone-aware. Composites camera (+ screen on
   * desktop) onto a watermarked canvas and records it + mic to .webm.
   * ================================================================= */
  var Proctor = {
    camStream: null, screenStream: null, micStream: null,
    recorder: null, chunks: [], canvas: null, ctx: null, raf: null,
    canvasStream: null, available: false, screenOn: false, startedTick: 0,

    isMobile: function () {
      return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && !/Macintosh/i.test(navigator.userAgent));
    },

    /* returns a promise that resolves to true if at least a camera is recording */
    start: function () {
      var self = this;
      if (noProctor) { this.available = false; return Promise.resolve(false); }
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return Promise.resolve(false);

      return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: true })
        .then(function (cam) {
          self.camStream = cam;
          self.micStream = cam; /* audio rides on the same stream */
          /* desktop: also try screen share, best effort */
          if (!self.isMobile() && navigator.mediaDevices.getDisplayMedia) {
            return navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 8 } }, audio: false })
              .then(function (scr) { self.screenStream = scr; self.screenOn = true; })
              .catch(function () { /* screen declined — camera only is fine */ });
          }
        })
        .then(function () { self._beginRecording(); self.available = true; return true; })
        .catch(function () { self.available = false; return false; });
    },

    _beginRecording: function () {
      var self = this;
      var cv = document.createElement('canvas');
      cv.width = 1280; cv.height = 720;
      this.canvas = cv; this.ctx = cv.getContext('2d');

      var camVid = document.createElement('video');
      camVid.muted = true; camVid.playsInline = true; camVid.srcObject = this.camStream;
      camVid.play().catch(function () {});
      var scrVid = null;
      if (this.screenStream) {
        scrVid = document.createElement('video');
        scrVid.muted = true; scrVid.playsInline = true; scrVid.srcObject = this.screenStream;
        scrVid.play().catch(function () {});
      }

      var name = (ST && ST.cand ? (ST.cand.fname + ' ' + ST.cand.lname) : '').toUpperCase();
      var ref = (ST && ST.ref) || '';
      this.startedTick = now();

      function draw() {
        var ctx = self.ctx, w = cv.width, h = cv.height;
        ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
        if (scrVid && scrVid.videoWidth) {
          /* screen fills the frame, camera is PiP bottom-right */
          ctx.drawImage(scrVid, 0, 0, w, h);
          var pw = 300, ph = 225;
          if (camVid.videoWidth) ctx.drawImage(camVid, w - pw - 16, h - ph - 16, pw, ph);
        } else if (camVid.videoWidth) {
          /* camera only — centered, letterboxed */
          var r = Math.min(w / camVid.videoWidth, h / camVid.videoHeight);
          var dw = camVid.videoWidth * r, dh = camVid.videoHeight * r;
          ctx.drawImage(camVid, (w - dw) / 2, (h - dh) / 2, dw, dh);
        }
        /* kinetic watermark */
        var t = (now() - self.startedTick) / 1000;
        var stamp = new Date(now()).toLocaleString('en-IN');
        ctx.save();
        ctx.globalAlpha = 0.32; ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 22px monospace';
        var label = 'INSPIRE TALENT HUB  |  ' + ref + '  |  ' + name + '  ';
        var x = (w - ((t * 60) % (w + 400)));
        ctx.fillText(label + label, x, 40);
        ctx.restore();
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(C.name + '  ·  ' + stamp, 16, h - 18);
        self.raf = requestAnimationFrame(draw);
      }
      draw();

      try {
        this.canvasStream = cv.captureStream(12);
        /* add the mic audio track */
        var at = this.camStream.getAudioTracks();
        if (at && at[0]) this.canvasStream.addTrack(at[0]);
        var mime = '';
        ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].some(function (m) {
          if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) { mime = m; return true; }
          return false;
        });
        this.recorder = new MediaRecorder(this.canvasStream, mime ? { mimeType: mime, videoBitsPerSecond: 1200000 } : undefined);
        this.chunks = [];
        this.recorder.ondataavailable = function (e) { if (e.data && e.data.size) self.chunks.push(e.data); };
        this.recorder.onstop = function () { self._download(); };
        this.recorder.start(1000);
      } catch (e) { this.available = false; }
    },

    _download: function () {
      try {
        if (!this.chunks.length) return;
        var blob = new Blob(this.chunks, { type: 'video/webm' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var safe = (ST && ST.cand ? (ST.cand.fname + '_' + ST.cand.lname) : 'candidate').replace(/[^A-Za-z0-9_]/g, '');
        a.href = url; a.download = 'INSPIRE_AUDIT_' + safe + '_' + ((ST && ST.ref) || '') + '.webm';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
      } catch (e) {}
    },

    mountSelfView: function () {
      if (!this.camStream || $('selfcam')) return;
      var box = document.createElement('div');
      box.id = 'selfcam'; box.className = 'selfcam';
      box.innerHTML = '<span class="selfcam-dot"></span>';
      var v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.autoplay = true; v.srcObject = this.camStream;
      box.appendChild(v); document.body.appendChild(box);
      v.play().catch(function () {});
    },

    stop: function () {
      if (this.raf) cancelAnimationFrame(this.raf);
      try { if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop(); } catch (e) {}
      [this.camStream, this.screenStream].forEach(function (s) {
        if (s) s.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      });
      var sc = $('selfcam'); if (sc) sc.remove();
    }
  };

  /* =================================================================
   * SECURITY — logs anomalies (sent to organiser), shows a gentle
   * notice, but NEVER force-submits or hard-locks (fair + mobile-safe).
   * ================================================================= */
  var Security = {
    on: false,
    tally: { blur: 0, copy: 0, paste: 0, cut: 0, context: 0, fsexit: 0 },
    _flash: null,

    boot: function () {
      if (this.on) return; this.on = true;
      var self = this;
      this._block = function (e) { e.preventDefault(); self._bump('context', 'Right-click'); };
      this._copy = function (e) { e.preventDefault(); self._bump('copy', 'Copy'); };
      this._paste = function (e) { e.preventDefault(); self._bump('paste', 'Paste'); };
      this._cut = function (e) { e.preventDefault(); self._bump('cut', 'Cut'); };
      this._keys = function (e) {
        var k = e.key ? e.key.toLowerCase() : '';
        if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) || ((e.ctrlKey || e.metaKey) && k === 'u')) {
          e.preventDefault(); self._bump('context', 'DevTools shortcut');
        }
      };
      this._vis = function () { if (document.hidden) self._bump('blur', 'Left the exam tab/window'); };
      this._fs = function () { if (!document.fullscreenElement) self._bump('fsexit', 'Exited full-screen'); };
      document.addEventListener('contextmenu', this._block);
      document.addEventListener('copy', this._copy);
      document.addEventListener('paste', this._paste);
      document.addEventListener('cut', this._cut);
      document.addEventListener('keydown', this._keys);
      document.addEventListener('visibilitychange', this._vis);
      document.addEventListener('fullscreenchange', this._fs);
    },
    _bump: function (kind, desc) {
      if (!ST || ST.submitted) return;
      this.tally[kind] = (this.tally[kind] || 0) + 1;
      if (ST.integrity) { ST.integrity[kind] = this.tally[kind]; save(); }
      this.flash(desc);
    },
    flash: function (desc) {
      var ov = $('ui-security-overlay'); if (!ov) return;
      var d = $('sec-desc'); if (d) d.textContent = 'Logged: ' + desc + '. Your exam is not interrupted — keep going calmly.';
      ov.classList.add('is-active');
      clearTimeout(this._flash);
      this._flash = setTimeout(function () { ov.classList.remove('is-active'); }, 2600);
    },
    disarm: function () {
      if (!this.on) return; this.on = false;
      document.removeEventListener('contextmenu', this._block);
      document.removeEventListener('copy', this._copy);
      document.removeEventListener('paste', this._paste);
      document.removeEventListener('cut', this._cut);
      document.removeEventListener('keydown', this._keys);
      document.removeEventListener('visibilitychange', this._vis);
      document.removeEventListener('fullscreenchange', this._fs);
    }
  };

  /* =================================================================
   * QUIZ FLOW
   * ================================================================= */
  var idx = 0, timer = null;

  function buildAttempt(levelId, cand) {
    var lvl = levelById(levelId);
    var qs = lvl.questions.map(function (q) {
      var opts = (C.shuffleOptions === false) ? q.options.slice() : shuffle(q.options.slice());
      return { qid: q.qid, text: q.text, options: opts, keyHash: q.keyHash };
    });
    if (C.shuffleQuestions !== false) shuffle(qs);
    ST = {
      ref: genRef(), level: levelId, cand: cand,
      qlist: qs, answers: {}, flags: {}, startedAt: now(), submitted: false,
      integrity: { blur: 0, copy: 0, paste: 0, cut: 0, context: 0, fsexit: 0 },
      recording: false
    };
    save();
  }

  function renderPalette() {
    var root = $('ui-question-palette'); if (!root) return;
    root.innerHTML = '';
    ST.qlist.forEach(function (q, i) {
      var c = document.createElement('div');
      c.className = 'palette-cell' + (ST.answers[i] != null ? ' is-answered' : '') + (ST.flags[i] ? ' is-flagged' : '') + (i === idx ? ' is-current' : '');
      c.textContent = (i + 1);
      c.addEventListener('click', function () { idx = i; renderQ(); });
      root.appendChild(c);
    });
  }

  function renderQ() {
    var q = ST.qlist[idx];
    if ($('ui-q-idx')) $('ui-q-idx').textContent = (idx + 1);
    if ($('ui-q-total')) $('ui-q-total').textContent = ST.qlist.length;
    if ($('ui-question-text')) $('ui-question-text').textContent = (idx + 1) + '. ' + q.text;
    var root = $('ui-options-root'); if (root) {
      root.innerHTML = '';
      q.options.forEach(function (opt, oi) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'option-card' + (ST.answers[idx] === oi ? ' is-selected' : '');
        card.innerHTML = '<span class="option-dot"></span><span class="option-text">' + esc(opt) + '</span>';
        card.addEventListener('click', function () {
          ST.answers[idx] = oi; save();
          Array.prototype.forEach.call(root.children, function (c) { c.classList.remove('is-selected'); });
          card.classList.add('is-selected');
          renderPalette();
        });
        root.appendChild(card);
      });
    }
    var flagBtn = $('btn-flag-question');
    if (flagBtn) flagBtn.classList.toggle('is-flagged-active', !!ST.flags[idx]);
    if ($('btn-quiz-prev')) $('btn-quiz-prev').disabled = (idx === 0);
    var last = (idx === ST.qlist.length - 1);
    if ($('btn-quiz-next')) $('btn-quiz-next').style.display = last ? 'none' : '';
    if ($('btn-quiz-submit')) $('btn-quiz-submit').style.display = last ? '' : 'none';
    renderPalette();
  }

  function runTimer() {
    if (timer) clearInterval(timer);
    function t() {
      if (!ST || ST.submitted) { clearInterval(timer); timer = null; return; }
      var rem = ST.startedAt + durMs - now();
      var wrap = $('ui-timer-container'), banner = $('ui-overtime-banner');
      if (rem > 0) {
        /* still within the 30 minutes */
        var left = Math.floor(rem / 1000);
        if ($('ui-timer-text')) $('ui-timer-text').textContent = fmtClock(left);
        if (wrap) { wrap.classList.toggle('is-critical', left <= 300); wrap.classList.remove('is-overtime'); }
        if (banner) banner.style.display = 'none';
      } else {
        /* SOFT LIMIT: time is up but we do NOT submit — count extra time up */
        var over = Math.floor((now() - (ST.startedAt + durMs)) / 1000);
        if ($('ui-timer-text')) $('ui-timer-text').textContent = '+' + fmtClock(over);
        if (wrap) { wrap.classList.remove('is-critical'); wrap.classList.add('is-overtime'); }
        if ($('ui-overtime-amount')) $('ui-overtime-amount').textContent = humanDur(over);
        if (banner) banner.style.display = '';
      }
    }
    t(); timer = setInterval(t, 1000);
  }
  function humanDur(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m ? m + ' min ' : '') + s + ' s';
  }
  function overtimeSec() { return Math.max(0, Math.floor((now() - (ST.startedAt + durMs)) / 1000)); }

  function showReview() {
    var fl = [], un = [];
    ST.qlist.forEach(function (q, i) { if (ST.flags[i]) fl.push(i + 1); if (ST.answers[i] == null) un.push(i + 1); });
    if ($('review-flagged-count')) $('review-flagged-count').textContent = fl.length;
    if ($('review-unanswered-count')) $('review-unanswered-count').textContent = un.length;
    if ($('review-flagged-list')) $('review-flagged-list').textContent = fl.length ? ('Questions: ' + fl.join(', ')) : 'No questions flagged.';
    if ($('review-unanswered-list')) $('review-unanswered-list').textContent = un.length ? ('Questions: ' + un.join(', ')) : 'All questions answered.';
    showView('view-review');
  }

  function finish() {
    if (!ST || ST.submitted) { showView('view-completion'); return; }
    Security.disarm();
    if (timer) { clearInterval(timer); timer = null; }
    ST.overtimeSec = overtimeSec();

    /* score: hash each chosen option, compare to stored key hash */
    var tasks = ST.qlist.map(function (q, i) {
      var a = ST.answers[i];
      if (a == null) return Promise.resolve({ state: 'blank' });
      return keyFor(q.qid, q.options[a]).then(function (h) { return { state: (h && h === q.keyHash) ? 'correct' : 'wrong' }; });
    });

    Promise.all(tasks).then(function (res) {
      var correct = 0, wrong = 0, blank = 0;
      res.forEach(function (r) { if (r.state === 'correct') correct++; else if (r.state === 'wrong') wrong++; else blank++; });
      var total = ST.qlist.length;
      var raw = correct * MARK.correct + wrong * MARK.wrong + blank * (MARK.blank || 0);
      var maxScore = total * MARK.correct;

      ST.submitted = true; ST.endedAt = now();
      ST.result = { correct: correct, wrong: wrong, blank: blank, total: total, raw: raw, max: maxScore };
      save();

      Proctor.stop();   /* stops + triggers the .webm download */
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}

      fillCompletion();
      emailResult();
      showView('view-completion');
    });
  }

  function integritySummary() {
    var t = ST.integrity || {};
    var bits = [];
    if (t.blur) bits.push(t.blur + '× left tab');
    if (t.fsexit) bits.push(t.fsexit + '× exited full-screen');
    if (t.copy || t.paste || t.cut) bits.push((t.copy + t.paste + t.cut) + '× clipboard');
    if (t.context) bits.push(t.context + '× right-click/devtools');
    var flagged = bits.length > 0;
    return (flagged ? 'FLAGGED — ' + bits.join(', ') : 'Clean') +
      '; recording: ' + (ST.recording ? 'YES' : 'NO (disqualification grounds)');
  }

  function fillCompletion() {
    if ($('ui-trace-id')) $('ui-trace-id').textContent = ST.ref;
    if ($('ui-trace-time')) $('ui-trace-time').textContent = new Date(now()).toLocaleString('en-IN');
    var over = ST.overtimeSec || 0;
    var note = $('completion-auto-note');
    if (note) {
      note.style.display = over > 0 ? '' : 'none';
      var span = $('completion-overtime-amount');
      if (span) span.textContent = humanDur(over);
    }
    var recMiss = $('completion-rec-missing');
    if (recMiss) recMiss.style.display = ST.recording ? 'none' : '';
    var vid = $('completion-video-block');
    if (vid) vid.style.display = ST.recording ? '' : 'none';
  }

  function emailResult() {
    var f = $('exam-result-form'); if (!f) return;
    var set = function (n, v) { if (f.elements[n]) f.elements[n].value = (v == null ? '' : v); };
    var r = ST.result, c = ST.cand, over = ST.overtimeSec || 0;
    set('Reference', ST.ref);
    set('Name', c.fname + ' ' + c.lname);
    set('Team name', c.team || '(none given)');
    set('Level', levelById(ST.level).name + ' (' + levelById(ST.level).meta + ')');
    set('Class', c.cls);
    set('School', c.school);
    set('Phone', c.phone);
    set('Email', c.email);
    set('Score', r.raw + ' / ' + r.max + '  (correct ' + r.correct + ', wrong ' + r.wrong + ', blank ' + r.blank + ' of ' + r.total + ')');
    set('Integrity', integritySummary());
    set('Time taken', over > 0 ? ('30 min + ' + humanDur(over) + ' EXTRA time') : 'within 30 minutes');
    set('Submitted', new Date(now()).toLocaleString('en-IN'));
    try { f.submit(); } catch (e) {}
  }

  /* ---------- availability gate ---------- */
  function gateMessage() {
    var box = $('exam-gate'); var btn = $('btn-init-quiz');
    var t = now();
    if (availFrom && t < availFrom) {
      if (box) { box.style.display = ''; box.textContent = 'This quiz opens on ' + (C.dayLabel || new Date(availFrom).toLocaleString('en-IN')) + '. Please come back then.'; }
      if (btn) btn.disabled = true;
      return true;
    }
    if (availUntil && t > availUntil) {
      if (box) { box.style.display = ''; box.textContent = 'The window for ' + C.name + ' has closed.'; }
      if (btn) btn.disabled = true;
      return true;
    }
    return false;
  }

  /* ---------- registration submit → start ---------- */
  function wireRegistration() {
    var form = $('form-registration'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (gateMessage()) return;
      /* native + manual validation */
      var get = function (id) { var el = $(id); return el ? el.value.trim() : ''; };
      var reqIds = ['reg-fname', 'reg-lname', 'reg-email', 'reg-phone', 'reg-class', 'reg-school'];
      for (var i = 0; i < reqIds.length; i++) { if (!get(reqIds[i])) { var el = $(reqIds[i]); if (el) el.reportValidity ? el.reportValidity() : el.focus(); return; } }
      var lvlEl = form.querySelector('input[name="level-vis"]:checked');
      if (!lvlEl) { alert('Please choose your level (Junior or Senior).'); return; }
      if (!$('consent-check') || !$('consent-check').checked) { if ($('consent-check')) $('consent-check').reportValidity(); return; }

      var cand = {
        fname: get('reg-fname'), lname: get('reg-lname'), email: get('reg-email'),
        phone: get('reg-phone'), cls: get('reg-class'), school: get('reg-school'),
        team: get('reg-team')
      };
      var levelId = lvlEl.value;

      var btn = $('btn-init-quiz');
      if (btn) { btn.disabled = true; btn.textContent = 'Setting up — allow camera/mic…'; }

      Proctor.start().then(function (ok) {
        if (!ok && !noProctor) {
          /* recording unavailable — ask the student to accept the consequence rather than lock them out */
          var proceed = window.confirm(
            'We could not start the required recording (camera blocked or unavailable).\n\n' +
            'You may continue, but WITHOUT a recording your result can be DISQUALIFIED if questioned.\n\n' +
            'Click OK to continue anyway, or Cancel to fix camera permissions and retry.');
          if (!proceed) { if (btn) { btn.disabled = false; btn.textContent = '🚀 Acknowledge & Start Quiz'; } return; }
        }
        buildAttempt(levelId, cand);
        ST.recording = !!ok;
        save();
        Proctor.mountSelfView();
        /* desktop: request full-screen (best-effort; mobile browsers may refuse) */
        if (!Proctor.isMobile()) { try { (document.documentElement.requestFullscreen || function () {}).call(document.documentElement); } catch (e) {} }
        Security.boot();
        idx = 0;
        showView('view-quiz');
        renderQ();
        runTimer();
      });
    });
  }

  /* ---------- quiz controls ---------- */
  function wireControls() {
    if ($('btn-quiz-prev')) $('btn-quiz-prev').addEventListener('click', function () { if (idx > 0) { idx--; renderQ(); } });
    if ($('btn-quiz-next')) $('btn-quiz-next').addEventListener('click', function () { if (idx < ST.qlist.length - 1) { idx++; renderQ(); } });
    if ($('btn-flag-question')) $('btn-flag-question').addEventListener('click', function () {
      ST.flags[idx] = !ST.flags[idx]; save(); renderQ();
    });
    if ($('btn-quiz-submit')) $('btn-quiz-submit').addEventListener('click', function () { showReview(); });
    if ($('btn-review-back')) $('btn-review-back').addEventListener('click', function () { showView('view-quiz'); renderQ(); });
    if ($('btn-review-confirm')) $('btn-review-confirm').addEventListener('click', function () {
      if (window.confirm('Submit your final answers? You cannot return to the quiz after this.')) finish();
    });
    if ($('btn-return-fullscreen')) $('btn-return-fullscreen').addEventListener('click', function () {
      try { (document.documentElement.requestFullscreen || function () {}).call(document.documentElement); } catch (e) {}
      var ov = $('ui-fullscreen-overlay'); if (ov) ov.classList.remove('is-active');
    });
  }

  /* ---------- warn before leaving an active attempt ---------- */
  window.addEventListener('beforeunload', function (e) {
    if (ST && ST.startedAt && !ST.submitted) { e.preventDefault(); e.returnValue = ''; return ''; }
  });

  /* ---------- router / boot ---------- */
  function boot() {
    wireRegistration();
    wireControls();

    if (ST && ST.submitted) { fillCompletion(false); showView('view-completion'); return; }
    if (ST && ST.startedAt && ST.qlist) {
      /* resume an in-progress attempt — including in overtime; never auto-submit.
         (note: recording cannot resume across reloads) */
      ST.recording = false; /* a reload drops the recorder */
      Security.boot();
      idx = 0;
      showView('view-quiz');
      renderQ();
      runTimer();
      return;
    }
    gateMessage();
    showView('view-registration');
  }

  boot();
})();
