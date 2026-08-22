/*!
 * ith-monsoon.js — Monsoon Minds Championship 2026 registration + checkout.
 *
 * Data mirrors the two official brochures (Science & Technology, 23 events;
 * Multidisciplinary, 24 events). Pricing per the organiser:
 *   Science & Technology  → ₹600 per participant, per event
 *   Multidisciplinary     → ₹400 per participant, per event
 * An event's price = per-head rate × number of participants (bounded by the
 * event's min–max team size). Schools entering 15+ events get 40% off the
 * order AND Rolling-Trophy eligibility.
 *
 * Flow: (gate) → choose mode → pick events & participants → cart (promo code,
 * school discount) → accept terms → Pay → POST /api/create-order → Razorpay →
 * store order snapshot → success.html.
 */
(function () {
  'use strict';

  var CONFIG = {
    razorpayKeyId: 'rzp_live_Si0l9ROHLTplT2',   // PUBLIC key id (secret stays server-side)
    createOrderUrl: '/api/create-order',
    successUrl: 'success.html',
    currencySymbol: '₹',
    unlockAt: '2026-08-31T09:00:00+05:30',        // registration opens; page unlocks then
    previewPassword: 'sid@1001',                   // soft gate for production checks
    schoolThreshold: 15,                           // events needed for discount + Rolling Trophy
    schoolDiscountRate: 0.40,                      // 40% off for schools at 15+ events
    rateSci: 600,                                  // ₹ per participant — Science & Technology
    rateMulti: 400                                 // ₹ per participant — Multidisciplinary
  };

  var BROCHURE = {
    sci:   'assets/brochure/monsoon-minds-2026-science-technology.pdf',
    multi: 'assets/brochure/monsoon-minds-2026-multidisciplinary.pdf'
  };

  /* ======================================================================
   * The 47 events, from the brochures. cat: 'sci' (₹600) | 'multi' (₹400).
   * min/max = participants per team; g = eligible grades (display only).
   * ==================================================================== */
  var COMPS = [
    // ---- Science & Technology (₹600 / participant) ----
    { id: 'atl-innov',   cat: 'sci', name: "ATL Innovators' Lab",        g: '6–12', min: 2, max: 5, icon: 'icon-bulb',    desc: 'Build a prototype that solves a real problem.' },
    { id: 'atl-tinker',  cat: 'sci', name: 'ATL Tinkering Challenge',    g: '6–12', min: 2, max: 5, icon: 'icon-bulb',    desc: 'Tinker, test and invent, Atal-style.' },
    { id: 'ecovision',   cat: 'sci', name: 'EcoVision 3D Challenge',     g: '6–10', min: 2, max: 5, icon: 'icon-palette', desc: 'Model a greener future in 3D.' },
    { id: 'futuretech',  cat: 'sci', name: 'FutureTech League',          g: '5–12', min: 1, max: 5, icon: 'icon-code',    desc: 'Robotics, AI and smart-tech ideas.' },
    { id: 'codexplosion',cat: 'sci', name: 'Code Xplosion',             g: '9–12', min: 1, max: 5, icon: 'icon-code',    desc: 'Serious coding against the clock.' },
    { id: 'jr-code',     cat: 'sci', name: 'Junior Code Drizzle',        g: '4–8',  min: 2, max: 5, icon: 'icon-code',    desc: 'First steps into coding, for juniors.' },
    { id: 'vibecraft',   cat: 'sci', name: 'Vibe Craft',                 g: '6–12', min: 2, max: 5, icon: 'icon-palette', desc: 'A creative tech-design showcase.' },
    { id: 'promptstorm', cat: 'sci', name: 'Prompt Storm',               g: '8–12', min: 2, max: 5, icon: 'icon-bulb',    desc: 'Master the art of AI prompting.' },
    { id: 'appmonsoon',  cat: 'sci', name: 'App Monsoon',                g: '8–12', min: 2, max: 5, icon: 'icon-code',    desc: 'Design an app that helps people.' },
    { id: 'autodrive',   cat: 'sci', name: 'Auto Drive Arena',          g: '8–12', min: 2, max: 5, icon: 'icon-code',    desc: 'Autonomous driving, simulated.' },
    { id: 'skypilot',    cat: 'sci', name: 'Sky Pilot Drone Sim',        g: '8–12', min: 2, max: 5, icon: 'icon-science', desc: 'Fly and navigate in a drone sim.' },
    { id: 'datadownpour',cat: 'sci', name: 'Data Downpour',              g: '8–12', min: 2, max: 5, icon: 'icon-globe',   desc: 'Find the story hidden in data.' },
    { id: 'ecoinvent',   cat: 'sci', name: 'Eco Invent: Waste to Wonder',g: '6–12', min: 1, max: 5, icon: 'icon-bulb',    desc: 'Turn waste into something wonderful.' },
    { id: 'hydrohackers',cat: 'sci', name: 'Hydro Hackers',              g: '8–12', min: 2, max: 5, icon: 'icon-science', desc: 'Water-smart engineering solutions.' },
    { id: 'cybershield', cat: 'sci', name: 'Cyber Shield',               g: '8–12', min: 2, max: 5, icon: 'icon-shield',  desc: 'Defend the digital world.' },
    { id: 'cosmosquest', cat: 'sci', name: 'Cosmos Quest',               g: '6–12', min: 2, max: 5, icon: 'icon-star',    desc: 'Journey through space and astronomy.' },
    { id: 'biobloom',    cat: 'sci', name: 'Bio Bloom',                  g: '8–12', min: 2, max: 5, icon: 'icon-science', desc: 'Biology, life and living systems.' },
    { id: 'chemcloud',   cat: 'sci', name: 'Chem Cloud',                 g: '6–10', min: 2, max: 5, icon: 'icon-science', desc: 'Chemistry that clicks.' },
    { id: 'physics',     cat: 'sci', name: 'Physics Phenomena',          g: '6–12', min: 2, max: 5, icon: 'icon-science', desc: 'Physics in action.' },
    { id: 'aihomobots',  cat: 'sci', name: 'AI Homo Bots',               g: '8–12', min: 2, max: 5, icon: 'icon-bulb',    desc: 'Design a helpful humanoid AI.' },
    { id: 'cadcloud',    cat: 'sci', name: 'CAD Cloudburst',             g: '8–12', min: 2, max: 5, icon: 'icon-palette', desc: 'Precision design with CAD.' },
    { id: 'gamejam',     cat: 'sci', name: 'Game Jam Monsoon',           g: '8–12', min: 2, max: 5, icon: 'icon-code',    desc: 'Build a game in the rain-jam.' },
    { id: 'venturelaunch',cat:'sci', name: 'Venture Launch',             g: '9–12', min: 2, max: 5, icon: 'icon-medal',   desc: 'Pitch a startup to the judges.' },

    // ---- Multidisciplinary (₹400 / participant) ----
    { id: 'ca-quiz',     cat: 'multi', name: 'Current Affairs Quiz',           g: '8–12', min: 2, max: 5, icon: 'icon-globe',   desc: 'Know the world you live in.' },
    { id: 'sci-quiz',    cat: 'multi', name: 'Science Quiz',                   g: '6–10', min: 2, max: 5, icon: 'icon-science', desc: 'Space, discoveries and health.' },
    { id: 'math-quiz',   cat: 'multi', name: 'Mathematics Quiz',              g: '6–12', min: 2, max: 5, icon: 'icon-grad',    desc: 'Logic, numbers and speed.' },
    { id: 'gk-quiz',     cat: 'multi', name: 'General Knowledge Quiz',        g: '6–12', min: 2, max: 5, icon: 'icon-star',    desc: 'An all-round GK showdown.' },
    { id: 'wordwizard',  cat: 'multi', name: 'Word Wizard',                    g: '6–12', min: 2, max: 5, icon: 'icon-pen',     desc: 'Vocabulary and language mastery.' },
    { id: 'essay',       cat: 'multi', name: 'Essay Writing Competition',      g: '8–12', min: 1, max: 1, icon: 'icon-pen',     desc: 'Argue and express in prose.' },
    { id: 'story',       cat: 'multi', name: 'Story Writing Competition',      g: '6–10', min: 1, max: 1, icon: 'icon-pen',     desc: 'Craft an original story.' },
    { id: 'poetry',      cat: 'multi', name: 'Poetry Writing Competition',     g: '6–12', min: 1, max: 1, icon: 'icon-pen',     desc: 'Compose a monsoon poem.' },
    { id: 'canva',       cat: 'multi', name: 'Canva Design Contest',           g: '8–12', min: 1, max: 1, icon: 'icon-palette', desc: 'Design on a themed brief.' },
    { id: 'poster',      cat: 'multi', name: 'Poster Design Competition',      g: '6–12', min: 1, max: 1, icon: 'icon-palette', desc: 'Say it in one striking poster.' },
    { id: 'meme',        cat: 'multi', name: 'Meme Design Competition',        g: '6–12', min: 1, max: 1, icon: 'icon-palette', desc: 'Wit meets design.' },
    { id: 'magazine',    cat: 'multi', name: 'Magazine Design Competition',    g: '8–12', min: 2, max: 5, icon: 'icon-palette', desc: 'Compile a digital magazine.' },
    { id: 'film',        cat: 'multi', name: 'Filmmaking Competition',         g: '8–12', min: 2, max: 5, icon: 'icon-palette', desc: 'Plan, shoot and edit a short film.' },
    { id: 'reel',        cat: 'multi', name: 'Awareness Reel Challenge',       g: '8–12', min: 2, max: 5, icon: 'icon-mic',     desc: 'A reel that spreads awareness.' },
    { id: 'photo',       cat: 'multi', name: 'Monsoon Frames Photography',     g: '6–12', min: 1, max: 1, icon: 'icon-palette', desc: 'Capture the rains in one frame.' },
    { id: 'digiart',     cat: 'multi', name: 'Digital Art & Illustration',    g: '6–12', min: 1, max: 1, icon: 'icon-palette', desc: 'Illustrate your imagination.' },
    { id: 'debate',      cat: 'multi', name: 'Rain Check Debate',             g: '8–12', min: 2, max: 5, icon: 'icon-mic',     desc: 'Argue both sides, think fast.' },
    { id: 'elocution',   cat: 'multi', name: 'Voice of the Monsoon Elocution',g: '6–12', min: 1, max: 1, icon: 'icon-mic',     desc: 'Speak with power and clarity.' },
    { id: 'spellbee',    cat: 'multi', name: 'Spell Bee',                     g: '6–10', min: 1, max: 1, icon: 'icon-pen',     desc: 'Spell your way to the top.' },
    { id: 'singing',     cat: 'multi', name: 'Monsoon Melodies Solo Singing', g: '6–12', min: 1, max: 1, icon: 'icon-mic',     desc: 'One voice, one song.' },
    { id: 'dance',       cat: 'multi', name: 'Rhythm of the Rain Dance',       g: '6–12', min: 1, max: 5, icon: 'icon-star',    desc: 'Move to the monsoon beat.' },
    { id: 'instrumental',cat: 'multi', name: 'Strings & Showers Instrumental', g: '6–12', min: 1, max: 1, icon: 'icon-mic',     desc: 'Play your instrument live.' },
    { id: 'podcast',     cat: 'multi', name: 'Podcast & RJ Hunt',             g: '8–12', min: 2, max: 5, icon: 'icon-mic',     desc: 'Host, talk, entertain.' },
    { id: 'venturespark',cat: 'multi', name: 'VentureSpark Business Builder',  g: '11–12',min: 2, max: 5, icon: 'icon-medal',   desc: 'Build and pitch a business.' }
  ];

  var COUPONS = {
    'MONSOON1': { kind: 'test1',   label: 'Test mode — total set to ₹1' },
    'RAIN15':   { kind: 'percent', value: 15, label: '15% off — early bird' }
  };

  function rate(c) { return c.cat === 'sci' ? CONFIG.rateSci : CONFIG.rateMulti; }

  /* state */
  var mode = 'individual';
  var filter = 'all';
  var parts = {};                    // compId -> participants (0 = not in cart)
  var coupon = null;
  COMPS.forEach(function (c) { parts[c.id] = 0; });

  function el(id) { return document.getElementById(id); }
  function money(n) { return CONFIG.currencySymbol + Math.round(n).toLocaleString('en-IN'); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function comp(id) { for (var i = 0; i < COMPS.length; i++) if (COMPS[i].id === id) return COMPS[i]; return null; }

  /* ======================================================================
   * Gate: countdown + password unlock
   * ==================================================================== */
  var unlockTime = Date.parse(CONFIG.unlockAt);
  function isPreviewed() { try { return sessionStorage.getItem('mm_ok') === '1'; } catch (e) { return false; } }
  function locked() { if (isPreviewed()) return false; if (isNaN(unlockTime)) return false; return Date.now() < unlockTime; }
  function applyGate() { document.body.classList.toggle('mm-locked', locked()); }

  function initGate() {
    try {
      var m = location.search.match(/[?&]key=([^&]+)/);
      if (m && decodeURIComponent(m[1]) === CONFIG.previewPassword) sessionStorage.setItem('mm_ok', '1');
    } catch (e) {}
    applyGate();

    var cd = el('mmGateCd');
    if (cd && !isNaN(unlockTime)) {
      var cells = { d: el('mmCdD'), h: el('mmCdH'), m: el('mmCdM'), s: el('mmCdS') };
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var tick = function () {
        var left = unlockTime - Date.now();
        if (left <= 0) {
          try { sessionStorage.setItem('mm_ok', '1'); } catch (e) {}
          applyGate(); maybePopup();
          if (cells.d) cells.d.textContent = cells.h.textContent = cells.m.textContent = cells.s.textContent = '00';
          clearInterval(timer); return;
        }
        var secs = Math.floor(left / 1000);
        if (cells.d) cells.d.textContent = pad(Math.floor(secs / 86400));
        if (cells.h) cells.h.textContent = pad(Math.floor(secs / 3600) % 24);
        if (cells.m) cells.m.textContent = pad(Math.floor(secs / 60) % 60);
        if (cells.s) cells.s.textContent = pad(secs % 60);
      };
      tick(); var timer = setInterval(tick, 1000);
    }

    var form = el('mmGateForm');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ((el('mmPass').value || '') === CONFIG.previewPassword) {
        try { sessionStorage.setItem('mm_ok', '1'); } catch (e2) {}
        applyGate(); maybePopup(); window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        form.classList.remove('mm-gate__form--bad'); void form.offsetWidth;
        form.classList.add('mm-gate__form--bad'); el('mmPass').value = '';
      }
    });
  }

  /* ======================================================================
   * Competition cards (filterable)
   * ==================================================================== */
  function renderComps() {
    var host = el('mmComps'); if (!host) return;
    host.innerHTML = '';
    var shown = 0;
    COMPS.forEach(function (c) {
      if (filter !== 'all' && c.cat !== filter) return;
      shown++;
      var n = parts[c.id];
      var card = document.createElement('article');
      card.className = 'mm-comp mm-reveal' + (n > 0 ? ' is-on' : '');
      card.setAttribute('data-cat', c.cat);
      card.innerHTML =
        '<div class="mm-comp__top">' +
          '<span class="mm-comp__ic" aria-hidden="true"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><use href="#' + c.icon + '"></use></svg></span>' +
          '<span class="mm-comp__tier">' + (c.cat === 'sci' ? 'Science &amp; Tech' : 'Multidisciplinary') + '</span>' +
        '</div>' +
        '<h3 class="mm-comp__n">' + esc(c.name) + '</h3>' +
        '<p class="mm-comp__d">' + esc(c.desc) + '</p>' +
        '<div class="mm-comp__foot">' +
          '<span class="mm-comp__price">' + money(rate(c)) + ' <span>/ participant</span></span>' +
          '<span class="mm-comp__pax">Grades ' + c.g + ' · ' + (c.min === c.max ? c.min + ' participant' : c.min + '–' + c.max + ' per team') + '</span>' +
        '</div>' +
        '<div class="mm-comp__actions">' +
          '<div class="mm-step" role="group" aria-label="Participants for ' + esc(c.name) + '">' +
            '<button type="button" class="mm-step__btn" data-act="dec" data-id="' + c.id + '" aria-label="Fewer participants">–</button>' +
            '<span class="mm-step__n">' + (n || 0) + '</span>' +
            '<button type="button" class="mm-step__btn" data-act="inc" data-id="' + c.id + '" aria-label="More participants">+</button>' +
          '</div>' +
          '<button type="button" class="mm-comp__pdf" data-pdf="' + c.cat + '">Brochure</button>' +
        '</div>';
      host.appendChild(card);
    });
    var count = el('mmShownCount'); if (count) count.textContent = shown + ' events';
    if (window.ITHReveal) window.ITHReveal();
  }

  function step(id, dir) {
    var c = comp(id); if (!c) return;
    var n = parts[id];
    if (dir > 0) { n = (n <= 0) ? c.min : Math.min(n + 1, c.max); }
    else { n = (n <= c.min) ? 0 : n - 1; }
    parts[id] = n;
    renderComps(); renderCart();
  }

  /* ======================================================================
   * Cart + totals
   * ==================================================================== */
  function lines() {
    var out = [];
    COMPS.forEach(function (c) {
      if (parts[c.id] > 0) out.push({ id: c.id, name: c.name, n: parts[c.id], price: rate(c), sum: rate(c) * parts[c.id], cat: c.cat });
    });
    return out;
  }
  function eventCount() { var t = 0; COMPS.forEach(function (c) { if (parts[c.id] > 0) t++; }); return t; }

  function totals() {
    var items = lines();
    var subtotal = 0; items.forEach(function (l) { subtotal += l.sum; });
    var events = eventCount();
    var school = (mode === 'school' && events >= CONFIG.schoolThreshold) ? subtotal * CONFIG.schoolDiscountRate : 0;
    var afterSchool = subtotal - school;
    var couponCut = 0, testOne = false;
    if (coupon && items.length) {
      if (coupon.kind === 'test1') { couponCut = afterSchool - 1; testOne = true; }
      else if (coupon.kind === 'percent') { couponCut = afterSchool * (coupon.value / 100); }
    }
    var total = testOne ? 1 : Math.max(afterSchool - couponCut, 0);
    return { items: items, subtotal: subtotal, school: school, couponCut: couponCut, total: total, events: events };
  }

  function renderCart() {
    var t = totals();
    var box = el('mmItems');
    if (!t.items.length) {
      box.innerHTML = '<p class="mm-cart__empty">Pick a competition to start building your entry.</p>';
    } else {
      box.innerHTML = t.items.map(function (l) {
        return '<div class="mm-item">' +
          '<div class="mm-item__main"><span class="mm-item__n">' + esc(l.name) + '</span>' +
          '<span class="mm-item__meta">' + l.n + ' × ' + money(l.price) + ' / participant</span></div>' +
          '<span class="mm-item__sum">' + money(l.sum) + '</span>' +
          '<button type="button" class="mm-item__rm" data-rm="' + l.id + '" aria-label="Remove ' + esc(l.name) + '">' +
            '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#icon-trash"></use></svg></button>' +
        '</div>';
      }).join('');
    }

    el('mmCount').textContent = t.events + (t.events === 1 ? ' event' : ' events');
    el('mmSubtotal').textContent = money(t.subtotal);
    el('mmTotal').textContent = money(t.total);

    var sRow = el('mmSchoolRow');
    if (t.school > 0) { sRow.hidden = false; el('mmSchoolCut').textContent = '−' + money(t.school); } else { sRow.hidden = true; }
    var cRow = el('mmCouponRow');
    if (coupon && t.items.length) { cRow.hidden = false; el('mmCouponCut').textContent = '−' + money(t.couponCut); el('mmCouponTag').textContent = coupon.code; } else { cRow.hidden = true; }

    var track = el('mmTrack');
    if (mode === 'school') {
      track.hidden = false;
      var pct = Math.min((t.events / CONFIG.schoolThreshold) * 100, 100);
      el('mmTrackFill').style.width = pct + '%';
      el('mmTrackFrac').textContent = t.events + ' / ' + CONFIG.schoolThreshold;
      el('mmTrackFill').classList.toggle('is-done', t.events >= CONFIG.schoolThreshold);
      el('mmTrackNote').textContent = t.events >= CONFIG.schoolThreshold
        ? '40% school discount + Rolling Trophy eligibility unlocked 🏆'
        : 'Enter ' + (CONFIG.schoolThreshold - t.events) + ' more events to unlock 40% off + Rolling Trophy.';
    } else { track.hidden = true; }

    updatePay();
  }

  /* coupon */
  function applyCoupon() {
    var code = (el('mmCoupon').value || '').trim().toUpperCase(); var msg = el('mmCouponMsg');
    if (!code) return;
    var def = COUPONS[code];
    if (!def) { coupon = null; msg.textContent = 'That code isn’t valid.'; msg.className = 'mm-coupon__msg is-bad'; }
    else { coupon = { code: code, kind: def.kind, value: def.value }; msg.textContent = def.label + ' applied.'; msg.className = 'mm-coupon__msg is-ok'; }
    renderCart();
  }
  function clearCoupon() { coupon = null; el('mmCoupon').value = ''; var m = el('mmCouponMsg'); m.textContent = ''; m.className = 'mm-coupon__msg'; renderCart(); }

  /* mode */
  function setMode(next) {
    mode = next;
    [].forEach.call(document.querySelectorAll('.mm-modepop__opt'), function (b) { b.classList.toggle('is-on', b.getAttribute('data-mode') === mode); });
    var label = el('mmModeLabel'); if (label) label.textContent = mode === 'school' ? 'a School' : 'an Individual';
    var coord = el('mmCoord'); var req = ['mm-tname', 'mm-tphone', 'mm-temail'];
    if (mode === 'school') { coord.hidden = false; req.forEach(function (id) { el(id).required = true; }); }
    else { coord.hidden = true; req.forEach(function (id) { el(id).required = false; }); }
    renderCart();
  }
  function showModePopup() { var m = el('mmModePopup'); if (m) { m.hidden = false; document.body.classList.add('mm-modal-open'); } }
  function hideModePopup() { var m = el('mmModePopup'); if (m) { m.hidden = true; document.body.classList.remove('mm-modal-open'); } }
  function maybePopup() { if (locked()) return; var a; try { a = sessionStorage.getItem('mm_mode_asked') === '1'; } catch (e) { a = false; } if (!a) showModePopup(); }

  /* pay */
  function updatePay() {
    var t = totals(); var btn = el('mmPay');
    if (!t.items.length) { btn.disabled = true; btn.textContent = 'Add a competition to continue'; return; }
    if (!el('mmTerms').checked) { btn.disabled = true; btn.textContent = 'Accept the terms to pay'; return; }
    btn.disabled = false; btn.textContent = 'Pay ' + money(t.total) + ' securely';
  }

  function formData() {
    return {
      name: el('mm-name').value.trim(), email: el('mm-email').value.trim(), phone: el('mm-phone').value.trim(),
      grade: el('mm-grade').value.trim(), schoolName: el('mm-school').value.trim(), schoolAddress: el('mm-city').value.trim(),
      teacherName: (el('mm-tname').value || '').trim() || 'N/A',
      teacherPhone: (el('mm-tphone').value || '').trim() || 'N/A',
      teacherEmail: (el('mm-temail').value || '').trim() || 'N/A'
    };
  }

  function pay() {
    var f = el('mmForm'); if (!f.checkValidity()) { f.reportValidity(); return; }
    if (!window.Razorpay) { alert('Payment library failed to load. Please refresh and try again.'); return; }
    var t = totals(); if (!t.items.length || t.total < 1) return;
    var d = formData();
    var summary = t.items.map(function (l) { return l.n + '× ' + l.name; }).join(', ');
    if (coupon) summary += ' [coupon:' + coupon.code + ']';
    var amountText = money(t.total);
    var btn = el('mmPay'); var restore = btn.textContent; btn.disabled = true; btn.textContent = 'Securing…';

    fetch(CONFIG.createOrderUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountToPay: t.total, mode: mode,
        name: d.name, email: d.email, phone: d.phone, grade: d.grade,
        schoolName: d.schoolName, schoolAddress: d.schoolAddress,
        teacherName: d.teacherName, teacherPhone: d.teacherPhone, teacherEmail: d.teacherEmail,
        cartSummary: summary.substring(0, 200)
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (order) {
        if (!order || !order.id) throw new Error((order && order.error) || 'Could not start the payment. Please try again.');
        var rzp = new Razorpay({
          key: CONFIG.razorpayKeyId, amount: order.amount, currency: order.currency || 'INR',
          name: 'Inspire Talent Hub', description: 'Monsoon Minds Championship 2026 — Registration',
          order_id: order.id, prefill: { name: d.name, email: d.email, contact: d.phone }, theme: { color: '#4d8dff' },
          handler: function (res) {
            try {
              localStorage.setItem('txn_id', res.razorpay_payment_id || '');
              localStorage.setItem('txn_ref', res.razorpay_order_id || order.id || '');
              localStorage.setItem('txn_amount', amountText);
              localStorage.setItem('mm_order', JSON.stringify({
                txnId: res.razorpay_payment_id || '', txnRef: res.razorpay_order_id || order.id || '',
                amountText: amountText, mode: mode,
                name: d.name, email: d.email, phone: d.phone, grade: d.grade, school: d.schoolName, city: d.schoolAddress,
                items: t.items, subtotal: t.subtotal, schoolCut: t.school, couponCut: t.couponCut,
                coupon: coupon ? coupon.code : '', total: t.total, events: t.events
              }));
            } catch (e) {}
            window.location.href = CONFIG.successUrl;
          },
          modal: { ondismiss: function () { btn.disabled = false; updatePay(); } }
        });
        rzp.on('payment.failed', function (resp) { alert('Payment failed: ' + (resp.error && resp.error.description ? resp.error.description : 'please try again.')); btn.disabled = false; updatePay(); });
        rzp.open(); btn.textContent = restore;
      })
      .catch(function (err) { alert(err.message || 'Something went wrong. Please try again.'); btn.disabled = false; updatePay(); });
  }

  /* reveal */
  function armReveal() {
    var items = [].slice.call(document.querySelectorAll('.mm-reveal:not(.is-in)'));
    if (!items.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { items.forEach(function (n) { n.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (n) { io.observe(n); setTimeout(function () { n.classList.add('is-in'); }, 2500); });
  }
  window.ITHReveal = armReveal;

  function toast(text) {
    var host = el('mmToast'); if (!host) { alert(text); return; }
    var t = document.createElement('div'); t.className = 'mm-toast__item'; t.textContent = text; host.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 300); }, 3200);
  }

  function init() {
    initGate();
    renderComps();
    renderCart();
    armReveal();

    el('mmComps').addEventListener('click', function (e) {
      var s = e.target.closest ? e.target.closest('.mm-step__btn') : null;
      if (s) { step(s.getAttribute('data-id'), s.getAttribute('data-act') === 'inc' ? 1 : -1); return; }
      var pdf = e.target.closest ? e.target.closest('.mm-comp__pdf') : null;
      if (pdf) { window.open(BROCHURE[pdf.getAttribute('data-pdf')], '_blank', 'noopener'); }
    });
    el('mmItems').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.mm-item__rm') : null;
      if (!b) return; parts[b.getAttribute('data-rm')] = 0; renderComps(); renderCart();
    });
    [].forEach.call(document.querySelectorAll('.mm-filter__btn'), function (b) {
      b.addEventListener('click', function () {
        filter = b.getAttribute('data-filter');
        [].forEach.call(document.querySelectorAll('.mm-filter__btn'), function (x) { x.classList.toggle('is-on', x === b); });
        renderComps();
      });
    });
    [].forEach.call(document.querySelectorAll('.mm-modepop__opt'), function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); try { sessionStorage.setItem('mm_mode_asked', '1'); } catch (e) {} hideModePopup(); });
    });
    var change = el('mmModeChange'); if (change) change.addEventListener('click', showModePopup);
    el('mmCouponBtn').addEventListener('click', applyCoupon);
    el('mmCouponClear').addEventListener('click', clearCoupon);
    el('mmCoupon').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } });
    el('mmTerms').addEventListener('change', updatePay);
    el('mmPay').addEventListener('click', pay);
    [].forEach.call(document.querySelectorAll('[data-brochure]'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); window.open(BROCHURE[b.getAttribute('data-brochure')], '_blank', 'noopener'); });
    });
    maybePopup();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
