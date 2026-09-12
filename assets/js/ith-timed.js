/*!
 * ith-timed.js — Monsoon Minds live "theme reveal" rooms for timed events.
 *
 * One page (live.html) serves every timed event via ?event=<id>. A participant
 * fills their details, agrees to the rules, and presses Start. On Start:
 *   1. a FormSubmit email is sent to the organiser with the participant's
 *      details, a unique Reference Number, and the exact start time
 *      (both local and UTC);
 *   2. the theme/brief is revealed and a countdown begins.
 * The deadline is start + duration; a fixed grace period is allowed after that,
 * beyond which submissions are not accepted. The started state is stored in the
 * browser so a refresh RESUMES the same countdown (it does not restart it or
 * re-send the email).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ORGANISER: set each event's `theme` below BEFORE its competition window
 * opens. Whatever you type appears to the participant the moment they Start.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var ORG_EMAIL  = 'info@inspiretalenthub.in';
  var AJAX_URL   = 'https://formsubmit.co/ajax/' + ORG_EMAIL;
  var GRACE_MIN  = 20;                 // grace minutes after the deadline
  var RESUME_MAX_H = 12;               // resume a stored session only if within N hours

  /* The 11 timed events. minutes = the working window; theme = revealed on Start. */
  var EVENTS = {
    'code-xplosion':        { name: 'Code Xplosion',              cat: 'Coding & Tech',  minutes: 90,  task: 'Competitive Python coding. The problems appear below when you start — solve them and submit your solution files before the deadline.' },
    'junior-code-drizzle':  { name: 'Junior Code Drizzle',        cat: 'Coding & Tech',  minutes: 90,  task: 'Beginner block-based coding (Scratch or similar). Build the small game or animation described below and submit it before the deadline.' },
    'prompt-storm':         { name: 'Prompt Storm',               cat: 'Coding & Tech',  minutes: 75,  task: 'AI prompt-engineering challenge. Hit the target described below with the cleanest prompts and submit your prompts and outputs before the deadline.' },
    'cad-cloudburst':       { name: 'CAD Cloudburst',             cat: 'Coding & Tech',  minutes: 120, task: '3D CAD modelling. Model the brief below and submit your model/export before the deadline.' },
    'essay-writing':        { name: 'Essay Writing Competition',  cat: 'Writing',        minutes: 90,  task: 'Write an essay on the revealed topic below, then submit your document before the deadline.' },
    'story-writing':        { name: 'Story Writing Competition',  cat: 'Writing',        minutes: 90,  task: 'Write an original story from the revealed prompt below, then submit your document before the deadline.' },
    'poetry-writing':       { name: 'Poetry Writing Competition', cat: 'Writing',        minutes: 90,  task: 'Write a poem on the revealed theme below, then submit your document before the deadline.' },
    'canva-design':         { name: 'Canva Design Contest',       cat: 'Design & Art',   minutes: 90,  task: 'Make a digital poster/graphic on the revealed theme below and submit your design (file or share link) before the deadline.' },
    'poster-design':        { name: 'Poster Design Competition',  cat: 'Design & Art',   minutes: 90,  task: 'Create a single awareness poster (digital or hand-drawn) on the theme below and submit a clear photo/export before the deadline.' },
    'meme-design':          { name: 'Meme Design Competition',    cat: 'Design & Art',   minutes: 90,  task: 'Make an original meme on the revealed theme below and submit your image before the deadline.' },
    'digital-art':          { name: 'Digital Art & Illustration', cat: 'Design & Art',   minutes: 120, task: 'Draw an original illustration from the prompt below in any drawing app and submit your export before the deadline.' }
  };

  /* ───────────────────────────────────────────────────────────────────────
   * THEMES — organiser edits these before each event opens.
   * Keep them as short paragraphs; use \n for new lines.
   * ─────────────────────────────────────────────────────────────────────── */
  var THEMES = {
    'code-xplosion':       '⚠ Theme/problems not set yet. (Organiser: set THEMES["code-xplosion"] in assets/js/ith-timed.js before this event opens.)',
    'junior-code-drizzle': '⚠ Theme not set yet. (Organiser: set THEMES["junior-code-drizzle"] before this event opens.)',
    'prompt-storm':        '⚠ Target not set yet. (Organiser: set THEMES["prompt-storm"] before this event opens.)',
    'cad-cloudburst':      '⚠ Brief not set yet. (Organiser: set THEMES["cad-cloudburst"] before this event opens.)',
    'essay-writing':       '⚠ Topic not set yet. (Organiser: set THEMES["essay-writing"] before this event opens.)',
    'story-writing':       '⚠ Prompt not set yet. (Organiser: set THEMES["story-writing"] before this event opens.)',
    'poetry-writing':      '⚠ Theme not set yet. (Organiser: set THEMES["poetry-writing"] before this event opens.)',
    'canva-design':        '⚠ Theme not set yet. (Organiser: set THEMES["canva-design"] before this event opens.)',
    'poster-design':       '⚠ Theme not set yet. (Organiser: set THEMES["poster-design"] before this event opens.)',
    'meme-design':         '⚠ Theme not set yet. (Organiser: set THEMES["meme-design"] before this event opens.)',
    'digital-art':         '⚠ Prompt not set yet. (Organiser: set THEMES["digital-art"] before this event opens.)'
  };

  /* helpers */
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function eventId() { var m = (location.search || '').match(/[?&]event=([^&]+)/); return m ? decodeURIComponent(m[1]).toLowerCase() : ''; }
  function fmtClock(d) { return two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
  function fmtHM(d) { var h = d.getHours(), ap = h >= 12 ? 'PM' : 'AM', h12 = h % 12; if (h12 === 0) h12 = 12; return h12 + ':' + two(d.getMinutes()) + ' ' + ap; }
  function fmtFull(d) {
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear() + ', ' + fmtHM(d);
  }
  function genRef() {
    var t = Date.now().toString(36).toUpperCase();
    var r = ''; for (var i = 0; i < 4; i++) r += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32));
    return 'MM-' + t.slice(-6) + '-' + r;
  }

  var root = document.getElementById('tmRoot');
  var id = eventId();
  var ev = EVENTS[id];

  document.addEventListener('DOMContentLoaded', boot);
  if (document.readyState !== 'loading') boot();
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    root = document.getElementById('tmRoot'); if (!root) return;
    if (!ev) { renderIndex(); return; }
    document.title = ev.name + ' — Live Room | Monsoon Minds 2026';
    var s = loadSession();
    if (s) renderActive(s); else renderStart();
  }

  /* ── session persistence ─────────────────────────────────────────────── */
  function lsKey() { return 'mm_live_' + id; }
  function loadSession() {
    try {
      var raw = localStorage.getItem(lsKey()); if (!raw) return null;
      var s = JSON.parse(raw); if (!s || !s.startISO) return null;
      var age = (Date.now() - Date.parse(s.startISO)) / 3600000;
      if (isNaN(age) || age < 0 || age > RESUME_MAX_H) return null;
      return s;
    } catch (e) { return null; }
  }
  function saveSession(s) { try { localStorage.setItem(lsKey(), JSON.stringify(s)); } catch (e) {} }

  /* ── START screen ────────────────────────────────────────────────────── */
  function renderStart() {
    root.innerHTML = '';
    var wrap = el('div', 'tm-card');

    wrap.appendChild(el('span', 'tm-kicker', esc(ev.cat) + ' · Live room'));
    wrap.appendChild(el('h1', 'tm-title', esc(ev.name)));
    wrap.appendChild(el('p', 'tm-task', esc(ev.task)));

    // rules
    var rules = el('div', 'tm-rules');
    rules.innerHTML =
      '<h2 class="tm-h2">Read this before you start</h2>' +
      '<ul>' +
        '<li>You have <strong>' + ev.minutes + ' minutes</strong> to work once you press <em>Start</em>. A <strong>' + GRACE_MIN + '-minute grace period</strong> is allowed after that only for submitting.</li>' +
        '<li>You can start <strong>any time during the competition-day window</strong>, from anywhere — but once you start, the clock does not stop.</li>' +
        '<li><strong>Do not close, refresh, or leave this screen</strong> while the timer runs. (If something goes wrong, reopening this page will resume the same countdown — it will not give you extra time.)</li>' +
        '<li>The moment you start, we are notified by email with your details, your start time, and your <strong>Reference Number</strong>.</li>' +
        '<li>You submit your finished work by <strong>emailing it to ' + ORG_EMAIL + '</strong> with your Reference Number in the subject, <strong>before your deadline</strong> (grace included). Anything received after the grace deadline is <strong>not considered</strong>.</li>' +
      '</ul>';
    wrap.appendChild(rules);

    // "if you start now" live line
    var live = el('div', 'tm-live', '');
    live.id = 'tmLive';
    wrap.appendChild(live);

    // form
    var form = el('form', 'tm-form');
    form.setAttribute('novalidate', 'novalidate');
    form.innerHTML =
      '<div class="tm-grid">' +
        '<label class="tm-field"><span>Full name <b>*</b></span><input name="name" type="text" required autocomplete="name" placeholder="Your full name" /></label>' +
        '<label class="tm-field"><span>Email <b>*</b></span><input name="email" type="email" required autocomplete="email" placeholder="you@example.com" /></label>' +
        '<label class="tm-field"><span>Phone (WhatsApp) <b>*</b></span><input name="phone" type="tel" required inputmode="tel" autocomplete="tel" placeholder="+91 …" /></label>' +
        '<label class="tm-field"><span>School / institution <b>*</b></span><input name="school" type="text" required placeholder="Full school name" /></label>' +
        '<label class="tm-field tm-field--wide"><span>Address (city &amp; state) <b>*</b></span><input name="address" type="text" required placeholder="City, State" /></label>' +
      '</div>' +
      '<label class="tm-agree"><input type="checkbox" id="tmAgree" /> <span>I am ready to start now. I understand the timer starts immediately, that I must submit before the deadline (plus the ' + GRACE_MIN + '-minute grace), and that late submissions are not accepted.</span></label>' +
      '<p id="tmErr" class="tm-err" role="alert"></p>' +
      '<button type="submit" id="tmStart" class="tm-btn" disabled>Reveal theme &amp; start the clock</button>' +
      '<p class="tm-fine">Reference number and start time are recorded when you press start.</p>';
    wrap.appendChild(form);

    root.appendChild(wrap);

    var agree = form.querySelector('#tmAgree');
    var btn = form.querySelector('#tmStart');
    agree.addEventListener('change', function () { btn.disabled = !agree.checked; });
    form.addEventListener('submit', function (e) { e.preventDefault(); doStart(form); });

    // live "if you start now" ticker
    (function tick() {
      var now = new Date();
      var end = new Date(now.getTime() + ev.minutes * 60000);
      var grace = new Date(end.getTime() + GRACE_MIN * 60000);
      live.innerHTML =
        '<div class="tm-live__row"><span>Your device time now</span><b>' + fmtClock(now) + '</b></div>' +
        '<div class="tm-live__row"><span>If you start now, submit by</span><b>' + fmtHM(end) + '</b></div>' +
        '<div class="tm-live__row tm-live__row--grace"><span>Hard deadline (with ' + GRACE_MIN + ' min grace)</span><b>' + fmtHM(grace) + '</b></div>';
      startTimer = setTimeout(tick, 1000);
    })();
  }

  var startTimer = null;

  function doStart(form) {
    var errEl = form.querySelector('#tmErr');
    errEl.textContent = '';
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!form.querySelector('#tmAgree').checked) { errEl.textContent = 'Please tick the box to confirm you are ready to start.'; return; }

    var get = function (n) { var i = form.querySelector('[name="' + n + '"]'); return i ? i.value.trim() : ''; };
    var now = new Date();
    var ref = genRef();
    var end = new Date(now.getTime() + ev.minutes * 60000);
    var grace = new Date(end.getTime() + GRACE_MIN * 60000);

    var btn = form.querySelector('#tmStart');
    btn.disabled = true; var restore = btn.textContent; btn.textContent = 'Starting…';

    var payload = {
      _subject: 'MM LIVE START — ' + ev.name + ' — ' + get('name') + ' (' + ref + ')',
      _template: 'table', _captcha: 'false',
      Event: ev.name, Category: ev.cat, Duration_minutes: String(ev.minutes),
      Reference_Number: ref,
      Name: get('name'), Email: get('email'), Phone: get('phone'),
      School: get('school'), Address: get('address'),
      Start_time_local: fmtFull(now),
      Start_time_UTC: now.toISOString(),
      Submit_by_local: fmtFull(end),
      Grace_deadline_local: fmtFull(grace)
    };

    fetch(AJAX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (res && (res.success === 'true' || res.success === true)) {
          var s = { ref: ref, startISO: now.toISOString(), email: get('email'), name: get('name') };
          saveSession(s);
          if (startTimer) clearTimeout(startTimer);
          renderActive(s);
        } else { throw new Error('unexpected'); }
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = restore;
        errEl.textContent = 'We could not register your start (check your connection and try again). Your clock has NOT started.';
      });
  }

  /* ── ACTIVE screen (theme + countdown) ───────────────────────────────── */
  function renderActive(s) {
    var startMs = Date.parse(s.startISO);
    var endMs = startMs + ev.minutes * 60000;
    var graceMs = endMs + GRACE_MIN * 60000;
    var startD = new Date(startMs), endD = new Date(endMs), graceD = new Date(graceMs);

    root.innerHTML = '';
    var wrap = el('div', 'tm-card tm-card--active');

    // header
    wrap.appendChild(el('span', 'tm-kicker', esc(ev.cat) + ' · In progress'));
    wrap.appendChild(el('h1', 'tm-title', esc(ev.name)));

    // countdown
    var cd = el('div', 'tm-cd');
    cd.innerHTML =
      '<div class="tm-cd__state" id="tmState">Time remaining</div>' +
      '<div class="tm-cd__clock" id="tmClock">--:--</div>' +
      '<div class="tm-cd__bar"><span id="tmBar"></span></div>';
    wrap.appendChild(cd);

    // key times
    var times = el('div', 'tm-times');
    times.innerHTML =
      '<div class="tm-times__row"><span>Started at</span><b>' + fmtHM(startD) + '</b></div>' +
      '<div class="tm-times__row"><span>Submit by</span><b>' + fmtHM(endD) + '</b></div>' +
      '<div class="tm-times__row tm-times__row--grace"><span>Hard deadline (grace)</span><b>' + fmtHM(graceD) + '</b></div>' +
      '<div class="tm-times__row"><span>Your device time now</span><b id="tmNow">' + fmtClock(new Date()) + '</b></div>' +
      '<div class="tm-times__row tm-times__row--ref"><span>Reference number</span><b>' + esc(s.ref) + '</b></div>';
    wrap.appendChild(times);

    // theme reveal
    var theme = el('div', 'tm-theme');
    theme.innerHTML = '<h2 class="tm-h2">Your theme / brief</h2>' +
      '<div class="tm-theme__body">' + esc(THEMES[id] || '').replace(/\n/g, '<br>') + '</div>' +
      '<p class="tm-theme__task">' + esc(ev.task) + '</p>';
    wrap.appendChild(theme);

    // how to submit
    var sub = el('div', 'tm-submit');
    sub.innerHTML =
      '<h2 class="tm-h2">How to submit</h2>' +
      '<p>Email your finished work to <a href="mailto:' + ORG_EMAIL + '?subject=' + encodeURIComponent('Submission ' + ev.name + ' — ' + s.ref) + '"><strong>' + ORG_EMAIL + '</strong></a> with your Reference Number <strong>' + esc(s.ref) + '</strong> in the subject line, <strong>before ' + fmtHM(graceD) + '</strong>. We use the time your email reaches us. Keep this screen open until you have sent it.</p>';
    wrap.appendChild(sub);

    root.appendChild(wrap);

    // warn on leave while live
    window.addEventListener('beforeunload', beforeUnload);

    var clockEl = document.getElementById('tmClock');
    var stateEl = document.getElementById('tmState');
    var barEl = document.getElementById('tmBar');
    var nowEl = document.getElementById('tmNow');

    (function tick() {
      var now = Date.now();
      if (nowEl) nowEl.textContent = fmtClock(new Date());
      var remain, label, pct, danger = false, over = false;
      if (now < endMs) {
        remain = endMs - now; label = 'Time remaining';
        pct = 100 - (remain / (ev.minutes * 60000)) * 100;
        if (remain < 5 * 60000) danger = true;
      } else if (now < graceMs) {
        remain = graceMs - now; label = 'GRACE PERIOD — submit now'; danger = true;
        pct = 100;
        wrap.classList.add('is-grace');
      } else {
        over = true; label = 'Time is over';
        wrap.classList.add('is-over');
      }
      if (over) {
        clockEl.textContent = '00:00';
        stateEl.textContent = 'Window closed';
        clockEl.classList.add('is-over');
        if (barEl) barEl.style.width = '100%';
        window.removeEventListener('beforeunload', beforeUnload);
        // replace theme submit area note
        if (!document.getElementById('tmClosed')) {
          var closed = el('div', 'tm-closed', 'The submission window (including grace) has closed. Submissions received after ' + fmtHM(graceD) + ' are not considered. If you have already emailed your work, you are done.');
          closed.id = 'tmClosed';
          stateEl.parentNode.parentNode.insertBefore(closed, stateEl.parentNode.nextSibling);
        }
        return; // stop ticking
      }
      var secs = Math.floor(remain / 1000);
      var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), sec = secs % 60;
      clockEl.textContent = (h > 0 ? two(h) + ':' : '') + two(m) + ':' + two(sec);
      stateEl.textContent = label;
      clockEl.classList.toggle('is-danger', danger);
      if (barEl) barEl.style.width = Math.max(0, Math.min(100, pct)) + '%';
      setTimeout(tick, 500);
    })();
  }

  function beforeUnload(e) { e.preventDefault(); e.returnValue = ''; return ''; }

  /* ── INDEX (no/unknown ?event) ───────────────────────────────────────── */
  function renderIndex() {
    document.title = 'Live Competition Rooms | Monsoon Minds 2026';
    root.innerHTML = '';
    var wrap = el('div', 'tm-card');
    wrap.appendChild(el('span', 'tm-kicker', 'Monsoon Minds 2026'));
    wrap.appendChild(el('h1', 'tm-title', 'Live competition rooms'));
    wrap.appendChild(el('p', 'tm-task', 'Open your event’s room on its competition day. Enter your details, agree to the rules, and press Start — your theme appears and the clock begins.'));
    var groups = {};
    Object.keys(EVENTS).forEach(function (k) { var c = EVENTS[k].cat; (groups[c] = groups[c] || []).push(k); });
    Object.keys(groups).forEach(function (cat) {
      wrap.appendChild(el('h2', 'tm-h2', esc(cat)));
      var ul = el('ul', 'tm-index');
      groups[cat].forEach(function (k) {
        var li = el('li');
        li.innerHTML = '<a href="live?event=' + k + '"><span>' + esc(EVENTS[k].name) + '</span><em>' + EVENTS[k].minutes + ' min</em></a>';
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    });
    root.appendChild(wrap);
  }
})();
