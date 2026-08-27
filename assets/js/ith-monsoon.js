/*!
 * ith-monsoon.js — Monsoon Minds Championship 2026 registration + checkout.
 *
 * Data mirrors the two official brochures (Science & Technology, 23 events;
 * Multidisciplinary, 24 events). Pricing per the organiser:
 *   Science & Technology  → ₹600 per participant, per event
 *   Multidisciplinary     → ₹400 per participant, per event
 * An event's price = per-head rate × number of participants (bounded by the
 * event's min–max team size). Schools entering 14+ events get 40% off the
 * order AND Rolling-Trophy eligibility.
 *
 * Flow (ecommerce-style, one page, four views routed by #/ hash):
 *   browse (search + filter + add to cart, floating cart bar)
 *     → cart (review + adjust + promo)
 *     → details (registrant form)
 *     → review (confirm everything + terms + Pay)
 *   Pay → POST /api/create-order → Razorpay → store snapshot → success.html
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
    schoolThreshold: 14,                           // events needed for discount + Rolling Trophy
    schoolDiscountRate: 0.40,                      // 40% off for schools at 14+ events
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
    'RAIN15':   { kind: 'percent', value: 15, label: '15% off — early bird' }
  };

  function rate(c) { return c.cat === 'sci' ? CONFIG.rateSci : CONFIG.rateMulti; }

  /* state */
  var mode = 'individual';
  var filter = 'all';
  var search = '';
  var view = 'browse';
  var parts = {};                    // compId -> participants (0 = not in cart)
  var coupon = null;
  COMPS.forEach(function (c) { parts[c.id] = 0; });

  function el(id) { return document.getElementById(id); }
  function money(n) { return CONFIG.currencySymbol + Math.round(n).toLocaleString('en-IN'); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function comp(id) { for (var i = 0; i < COMPS.length; i++) if (COMPS[i].id === id) return COMPS[i]; return null; }
  function catName(cat) { return cat === 'sci' ? 'Science & Tech' : 'Multidisciplinary'; }

  /* ======================================================================
   * Gate: countdown + password unlock
   * ==================================================================== */
  var unlockTime = Date.parse(CONFIG.unlockAt);
  function isPreviewed() { try { return sessionStorage.getItem('mm_ok') === '1'; } catch (e) { return false; } }
  function locked() { if (isPreviewed()) return false; if (isNaN(unlockTime)) return false; return Date.now() < unlockTime; }
  function applyGate() { document.body.classList.toggle('mm-locked', locked()); updateCartBar(); }

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
   * View routing (browse / cart / details / review) via #/ hash
   * ==================================================================== */
  var VIEWS = { browse: 'mmViewBrowse', cart: 'mmViewCart', details: 'mmViewDetails', review: 'mmViewReview' };

  function parseHash() {
    var raw = location.hash || '';
    var m = raw.match(/^#\/(cart|details|review)/);
    return m ? m[1] : 'browse';
  }

  /* Set the hash — the hashchange handler does the actual work. */
  function navigate(name) {
    if (name !== 'browse' && eventCount() === 0) name = 'browse';
    var target = '#/' + name;
    if (location.hash === target) applyRoute();     // same hash: apply directly
    else location.hash = target;
  }

  function applyRoute() {
    var raw = location.hash || '';
    // In-page anchor (e.g. #mmPick) — let the browser scroll, don't switch views.
    if (raw && raw.indexOf('#/') !== 0) return;

    var name = parseHash();
    if (name !== 'browse' && eventCount() === 0) name = 'browse';
    view = name;

    for (var k in VIEWS) {
      if (!VIEWS.hasOwnProperty(k)) continue;
      var node = el(VIEWS[k]);
      if (node) node.classList.toggle('is-active', k === name);
    }

    if (name === 'cart') renderCart();
    if (name === 'review') { renderCart(); renderReview(); }
    updateCartBar();
    armReveal();

    // scroll to top of the active checkout view (browse scrolls to top)
    var top = el(VIEWS[name]);
    if (name === 'browse') window.scrollTo({ top: 0, behavior: 'auto' });
    else if (top) {
      var y = top.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: Math.max(y, 0), behavior: 'auto' });
      try { top.focus({ preventScroll: true }); } catch (e) { top.focus(); }
    }
  }

  /* ======================================================================
   * Competition cards (filterable + searchable)
   * ==================================================================== */
  function matchSearch(c) {
    if (!search) return true;
    var q = search.toLowerCase();
    return c.name.toLowerCase().indexOf(q) !== -1 ||
           c.desc.toLowerCase().indexOf(q) !== -1 ||
           catName(c.cat).toLowerCase().indexOf(q) !== -1;
  }

  function renderComps() {
    var host = el('mmComps'); if (!host) return;
    host.innerHTML = '';
    var shown = 0;
    COMPS.forEach(function (c) {
      if (filter !== 'all' && c.cat !== filter) return;
      if (!matchSearch(c)) return;
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
          (n > 0
            ? '<div class="mm-step" role="group" aria-label="Participants for ' + esc(c.name) + '">' +
                '<button type="button" class="mm-step__btn" data-act="dec" data-id="' + c.id + '" aria-label="Fewer participants">–</button>' +
                '<span class="mm-step__n">' + n + '</span>' +
                '<button type="button" class="mm-step__btn" data-act="inc" data-id="' + c.id + '" aria-label="More participants">+</button>' +
              '</div>'
            : '<button type="button" class="mm-comp__add" data-act="inc" data-id="' + c.id + '"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-cart"></use></svg> Add to cart</button>') +
          '<button type="button" class="mm-comp__pdf" data-pdf="' + c.cat + '">Brochure</button>' +
        '</div>';
      host.appendChild(card);
    });
    var count = el('mmShownCount'); if (count) count.textContent = shown + (shown === 1 ? ' event' : ' events');
    var none = el('mmNoResults'); if (none) none.hidden = shown !== 0;
    if (window.ITHReveal) window.ITHReveal();
  }

  function step(id, dir) {
    var c = comp(id); if (!c) return;
    var n = parts[id];
    if (dir > 0) { n = (n <= 0) ? c.min : Math.min(n + 1, c.max); }
    else { n = (n <= c.min) ? 0 : n - 1; }
    parts[id] = n;
    renderComps(); renderCart(); updateCartBar();
    if (view === 'review') renderReview();
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

  function cartItemHTML(l) {
    var c = comp(l.id);
    var canStep = c && c.min !== c.max;
    return '<div class="mm-item mm-item--lg">' +
      '<div class="mm-item__main"><span class="mm-item__n">' + esc(l.name) + '</span>' +
      '<span class="mm-item__meta">' + catName(l.cat) + ' · ' + money(l.price) + ' / participant</span></div>' +
      (canStep
        ? '<div class="mm-step" role="group" aria-label="Participants for ' + esc(l.name) + '">' +
            '<button type="button" class="mm-step__btn" data-act="dec" data-id="' + l.id + '" aria-label="Fewer participants">–</button>' +
            '<span class="mm-step__n">' + l.n + '</span>' +
            '<button type="button" class="mm-step__btn" data-act="inc" data-id="' + l.id + '" aria-label="More participants">+</button>' +
          '</div>'
        : '<span class="mm-item__solo">' + l.n + ' participant</span>') +
      '<span class="mm-item__sum">' + money(l.sum) + '</span>' +
      '<button type="button" class="mm-item__rm" data-rm="' + l.id + '" aria-label="Remove ' + esc(l.name) + '">' +
        '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#icon-trash"></use></svg></button>' +
    '</div>';
  }

  function renderCart() {
    var t = totals();
    var box = el('mmItems');
    if (box) {
      if (!t.items.length) {
        box.innerHTML = '<p class="mm-cart__empty">Your cart is empty. <button type="button" class="mm-linkbtn" data-goto="browse">Browse competitions</button></p>';
      } else {
        box.innerHTML = t.items.map(cartItemHTML).join('');
      }
    }

    if (el('mmCount')) el('mmCount').textContent = t.events + (t.events === 1 ? ' event' : ' events');
    if (el('mmSubtotal')) el('mmSubtotal').textContent = money(t.subtotal);
    if (el('mmTotal')) el('mmTotal').textContent = money(t.total);

    var sRow = el('mmSchoolRow');
    if (sRow) { if (t.school > 0) { sRow.hidden = false; el('mmSchoolCut').textContent = '−' + money(t.school); } else { sRow.hidden = true; } }
    var cRow = el('mmCouponRow');
    if (cRow) { if (coupon && t.items.length) { cRow.hidden = false; el('mmCouponCut').textContent = '−' + money(t.couponCut); el('mmCouponTag').textContent = coupon.code; } else { cRow.hidden = true; } }

    var track = el('mmTrack');
    if (track) {
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
    }

    var toDetails = el('mmToDetails');
    if (toDetails) {
      if (!t.items.length) { toDetails.disabled = true; toDetails.textContent = 'Add a competition to continue'; }
      else { toDetails.disabled = false; toDetails.textContent = 'Continue to details'; }
    }
  }

  /* ======================================================================
   * Review (confirm) view
   * ==================================================================== */
  function renderReview() {
    var t = totals();
    var d = formData();

    var who = el('mmRevWho');
    if (who) {
      var rows = [
        ['Name', d.name], ['Email', d.email], ['Phone', d.phone],
        ['Grade', d.grade], ['School', d.schoolName], ['City & state', d.schoolAddress]
      ];
      if (mode === 'school') {
        rows.push(['Coordinator', d.teacherName]);
        rows.push(['Coordinator phone', d.teacherPhone]);
        rows.push(['Coordinator email', d.teacherEmail]);
      }
      who.innerHTML = rows.map(function (r) {
        return '<div class="mm-review__row"><dt>' + esc(r[0]) + '</dt><dd>' + (r[1] ? esc(r[1]) : '<span class="mm-review__miss">—</span>') + '</dd></div>';
      }).join('');
    }

    var items = el('mmRevItems');
    if (items) {
      items.innerHTML = t.items.length
        ? t.items.map(function (l) {
            return '<div class="mm-review__item"><span>' + esc(l.name) + ' <em>' + l.n + ' × ' + money(l.price) + '</em></span><span>' + money(l.sum) + '</span></div>';
          }).join('')
        : '<p class="mm-cart__empty">No competitions selected.</p>';
    }

    if (el('mmRevSubtotal')) el('mmRevSubtotal').textContent = money(t.subtotal);
    if (el('mmRevTotal')) el('mmRevTotal').textContent = money(t.total);
    var sr = el('mmRevSchoolRow');
    if (sr) { if (t.school > 0) { sr.hidden = false; el('mmRevSchoolCut').textContent = '−' + money(t.school); } else { sr.hidden = true; } }
    var cr = el('mmRevCouponRow');
    if (cr) { if (coupon && t.items.length) { cr.hidden = false; el('mmRevCouponCut').textContent = '−' + money(t.couponCut); el('mmRevCouponTag').textContent = coupon.code; } else { cr.hidden = true; } }

    updatePay();
  }

  /* ======================================================================
   * Floating cart bar (browse view only)
   * ==================================================================== */
  function updateCartBar() {
    var bar = el('mmCartBar'); if (!bar) return;
    var t = totals();
    var showable = view === 'browse' && t.events > 0 && !locked() && !document.body.classList.contains('mm-modal-open');
    bar.hidden = !showable;
    if (showable) {
      el('mmCartBadge').textContent = t.events;
      el('mmBarCount').textContent = t.events + (t.events === 1 ? ' event' : ' events');
      el('mmBarTotal').textContent = money(t.total);
    }
  }

  /* coupon */
  function applyCoupon() {
    var code = (el('mmCoupon').value || '').trim().toUpperCase(); var msg = el('mmCouponMsg');
    if (!code) return;
    var def = COUPONS[code];
    if (!def) { coupon = null; msg.textContent = 'That code isn’t valid.'; msg.className = 'mm-coupon__msg is-bad'; }
    else { coupon = { code: code, kind: def.kind, value: def.value }; msg.textContent = def.label + ' applied.'; msg.className = 'mm-coupon__msg is-ok'; }
    renderCart(); updateCartBar(); if (view === 'review') renderReview();
  }
  function clearCoupon() { coupon = null; el('mmCoupon').value = ''; var m = el('mmCouponMsg'); m.textContent = ''; m.className = 'mm-coupon__msg'; renderCart(); updateCartBar(); if (view === 'review') renderReview(); }

  /* mode */
  function setMode(next) {
    mode = next;
    [].forEach.call(document.querySelectorAll('.mm-modepop__opt'), function (b) { b.classList.toggle('is-on', b.getAttribute('data-mode') === mode); });
    var txt = mode === 'school' ? 'a School' : 'an Individual';
    if (el('mmModeLabel')) el('mmModeLabel').textContent = txt;
    if (el('mmModeLabel2')) el('mmModeLabel2').textContent = txt;
    var coord = el('mmCoord'); var req = ['mm-tname', 'mm-tphone', 'mm-temail'];
    if (coord) {
      if (mode === 'school') { coord.hidden = false; req.forEach(function (id) { if (el(id)) el(id).required = true; }); }
      else { coord.hidden = true; req.forEach(function (id) { if (el(id)) el(id).required = false; }); }
    }
    renderCart(); updateCartBar(); if (view === 'review') renderReview();
  }
  function showModePopup() { var m = el('mmModePopup'); if (m) { m.hidden = false; document.body.classList.add('mm-modal-open'); updateCartBar(); } }
  function hideModePopup() { var m = el('mmModePopup'); if (m) { m.hidden = true; document.body.classList.remove('mm-modal-open'); updateCartBar(); } }
  function maybePopup() { if (locked()) return; var a; try { a = sessionStorage.getItem('mm_mode_asked') === '1'; } catch (e) { a = false; } if (!a) showModePopup(); }

  /* pay */
  function updatePay() {
    var t = totals(); var btn = el('mmPay'); if (!btn) return;
    if (!t.items.length) { btn.disabled = true; btn.textContent = 'Your cart is empty'; return; }
    var terms = el('mmTerms');
    if (terms && !terms.checked) { btn.disabled = true; btn.textContent = 'Accept the terms to pay'; return; }
    btn.disabled = false; btn.textContent = 'Pay ' + money(t.total) + ' securely';
  }

  function formData() {
    var g = function (id) { var n = el(id); return n ? n.value.trim() : ''; };
    return {
      name: g('mm-name'), email: g('mm-email'), phone: g('mm-phone'),
      grade: g('mm-grade'), schoolName: g('mm-school'), schoolAddress: g('mm-city'),
      teacherName: g('mm-tname') || 'N/A',
      teacherPhone: g('mm-tphone') || 'N/A',
      teacherEmail: g('mm-temail') || 'N/A'
    };
  }

  function pay() {
    // Hard gate: no payment without explicit consent to Terms & Refund Policy.
    var terms = el('mmTerms');
    if (terms && !terms.checked) { navigate('review'); updatePay(); if (terms.focus) terms.focus(); return; }
    var f = el('mmForm');
    if (f && !f.checkValidity()) { navigate('details'); setTimeout(function () { f.reportValidity(); }, 60); return; }
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

  /* search */
  function onSearch() {
    search = (el('mmSearch').value || '').trim();
    var clr = el('mmSearchClear'); if (clr) clr.hidden = !search;
    renderComps();
  }
  function clearSearch() { search = ''; if (el('mmSearch')) el('mmSearch').value = ''; if (el('mmSearchClear')) el('mmSearchClear').hidden = true; renderComps(); }

  function clearAllFilters() {
    filter = 'all'; clearSearch();
    [].forEach.call(document.querySelectorAll('.mm-filter__btn'), function (x) { x.classList.toggle('is-on', x.getAttribute('data-filter') === 'all'); });
    renderComps();
  }

  function init() {
    initGate();
    renderComps();
    renderCart();
    armReveal();

    // add / stepper on the browse grid
    el('mmComps').addEventListener('click', function (e) {
      var s = e.target.closest ? e.target.closest('[data-act]') : null;
      if (s && s.getAttribute('data-id')) { step(s.getAttribute('data-id'), s.getAttribute('data-act') === 'inc' ? 1 : -1); return; }
      var pdf = e.target.closest ? e.target.closest('.mm-comp__pdf') : null;
      if (pdf) { window.open(BROCHURE[pdf.getAttribute('data-pdf')], '_blank', 'noopener'); }
    });

    // cart: steppers + remove
    var itemsBox = el('mmItems');
    if (itemsBox) itemsBox.addEventListener('click', function (e) {
      var s = e.target.closest ? e.target.closest('.mm-step__btn') : null;
      if (s && s.getAttribute('data-id')) { step(s.getAttribute('data-id'), s.getAttribute('data-act') === 'inc' ? 1 : -1); return; }
      var b = e.target.closest ? e.target.closest('.mm-item__rm') : null;
      if (b) { parts[b.getAttribute('data-rm')] = 0; renderComps(); renderCart(); updateCartBar(); }
    });

    // search
    var sInput = el('mmSearch');
    if (sInput) { sInput.addEventListener('input', onSearch); sInput.addEventListener('search', onSearch); }
    if (el('mmSearchClear')) el('mmSearchClear').addEventListener('click', clearSearch);
    if (el('mmClearAll')) el('mmClearAll').addEventListener('click', clearAllFilters);

    // filter
    [].forEach.call(document.querySelectorAll('.mm-filter__btn'), function (b) {
      b.addEventListener('click', function () {
        filter = b.getAttribute('data-filter');
        [].forEach.call(document.querySelectorAll('.mm-filter__btn'), function (x) { x.classList.toggle('is-on', x === b); });
        renderComps();
      });
    });

    // mode
    [].forEach.call(document.querySelectorAll('.mm-modepop__opt'), function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); try { sessionStorage.setItem('mm_mode_asked', '1'); } catch (e) {} hideModePopup(); });
    });
    if (el('mmModeChange')) el('mmModeChange').addEventListener('click', showModePopup);
    if (el('mmModeChange2')) el('mmModeChange2').addEventListener('click', showModePopup);

    // coupon
    if (el('mmCouponBtn')) el('mmCouponBtn').addEventListener('click', applyCoupon);
    if (el('mmCouponClear')) el('mmCouponClear').addEventListener('click', clearCoupon);
    if (el('mmCoupon')) el('mmCoupon').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } });

    // terms + pay
    if (el('mmTerms')) el('mmTerms').addEventListener('change', updatePay);
    if (el('mmPay')) el('mmPay').addEventListener('click', pay);

    // step navigation buttons
    if (el('mmToDetails')) el('mmToDetails').addEventListener('click', function () { if (eventCount() > 0) navigate('details'); });
    if (el('mmToReview')) el('mmToReview').addEventListener('click', function () {
      var f = el('mmForm');
      if (f && !f.checkValidity()) { f.reportValidity(); return; }
      navigate('review');
    });

    // any [data-goto] (cart bar, backlinks, stepbar, empty-state)
    document.addEventListener('click', function (e) {
      var g = e.target.closest ? e.target.closest('[data-goto]') : null;
      if (!g) return;
      e.preventDefault();
      navigate(g.getAttribute('data-goto'));
    });

    // brochure buttons
    [].forEach.call(document.querySelectorAll('[data-brochure]'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); window.open(BROCHURE[b.getAttribute('data-brochure')], '_blank', 'noopener'); });
    });

    initNotify();

    window.addEventListener('hashchange', applyRoute);
    applyRoute();     // honour a deep link on load (falls back to browse when cart is empty)
    updateCartBar();
    maybePopup();
  }

  /* ======================================================================
   * Notify-me: email capture on the pre-launch gate (FormSubmit.co)
   * ==================================================================== */
  var NOTIFY_ENDPOINT = 'https://formsubmit.co/ajax/info@inspiretalenthub.in';

  function notifyDone(msg, ok) {
    var m = el('mmNotifyMsg'); if (!m) return;
    m.textContent = msg;
    m.className = 'mm-notify__msg ' + (ok ? 'is-ok' : 'is-bad');
  }

  function initNotify() {
    var form = el('mmNotifyForm'); if (!form) return;

    // Native FormSubmit fallback returns to ?notified=1 — greet those visitors.
    try { if (/[?&]notified=1/.test(location.search)) { form.classList.add('is-done'); notifyDone('You’re on the list! We’ll email you the moment registration opens. ☔', true); } } catch (e) {}

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = el('mmNotifyEmail');
      var honey = form.querySelector('.mm-notify__honey');
      if (honey && honey.value) return;                 // bot trap
      if (!input.value || (form.checkValidity && !form.checkValidity())) { if (form.reportValidity) form.reportValidity(); return; }

      var btn = form.querySelector('.mm-notify__btn');
      var restore = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…';
      notifyDone('', true);

      fetch(NOTIFY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: input.value.trim(),
          _subject: 'Monsoon Minds 2026 — Notify me when registration opens',
          _template: 'table',
          _captcha: 'false'
        })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && (res.success === 'true' || res.success === true)) {
            form.classList.add('is-done');
            notifyDone('You’re on the list! We’ll email you the moment registration opens. ☔', true);
          } else {
            throw new Error('unexpected');
          }
        })
        .catch(function () {
          // Network/CORS failed — fall back to a normal FormSubmit POST (redirects).
          btn.textContent = restore; btn.disabled = false;
          form.submit();
        });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
