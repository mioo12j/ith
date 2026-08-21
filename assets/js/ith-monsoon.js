/*!
 * ith-monsoon.js — Monsoon Minds Championship 2026 registration + checkout.
 *
 * Highly-interactive buy page: pick competitions → cart (with promo code and
 * school bulk discount) → accept terms → Pay → POST /api/create-order → open
 * Razorpay with the returned order_id → store the txn in localStorage →
 * redirect to success.html.
 *
 * Pre-launch gate: until UNLOCK_AT the public sees a countdown teaser only.
 * A discreet password field unlocks the full page for production checks.
 * (The password lives in client JS — it is a soft gate, not real security.)
 *
 * Vanilla JS; depends only on Razorpay checkout.js (loaded in the page).
 */
(function () {
  'use strict';

  /* ======================================================================
   * CONFIG — review before going live.
   * ==================================================================== */
  var CONFIG = {
    razorpayKeyId: 'rzp_live_Si0l9ROHLTplT2',   // PUBLIC key id (secret stays server-side)
    createOrderUrl: '/api/create-order',
    successUrl: 'success.html',
    currencySymbol: '₹',
    unlockAt: '2026-08-31T09:00:00+05:30',        // registration opens; page unlocks then
    previewPassword: 'sid@1001',                   // soft gate for production checks
    bulkThreshold: 10,                             // school bulk discount kicks in at N entries
    bulkDiscountRate: 0.5                          // 50% off
  };

  /* ======================================================================
   * ⚠️  FICTIONAL COMPETITIONS & PLACEHOLDER PRICES — set real values here.
   * price is per entry (one participant, or one team in School mode).
   * min/max bound the participants an entry may contain.
   * ==================================================================== */
  var COMPS = [
    // ₹500 flagship tier
    { id: 'cloudburst', name: 'Cloudburst Coding Challenge', tier: 'Flagship', price: 500, min: 1, max: 3, icon: 'icon-code',    desc: 'Build a small app or game against the clock.' },
    { id: 'rainmaker',  name: 'Rainmaker Robotics & AI',      tier: 'Flagship', price: 500, min: 2, max: 4, icon: 'icon-bulb',    desc: 'Design a smart machine that solves a real problem.' },
    { id: 'innovlab',   name: 'Monsoon Innovation Lab',       tier: 'Flagship', price: 500, min: 2, max: 4, icon: 'icon-science', desc: 'Prototype a fresh idea and pitch it to judges.' },
    { id: 'stormsci',   name: 'StormChasers Science Quest',   tier: 'Flagship', price: 500, min: 1, max: 2, icon: 'icon-globe',   desc: 'Experiments, reasoning and real-world science.' },
    // ₹300 creative & quiz tier
    { id: 'petrichor',  name: 'Petrichor Poetry Slam',        tier: 'Creative', price: 300, min: 1, max: 1, icon: 'icon-pen',     desc: 'Write and perform an original monsoon poem.' },
    { id: 'puddle',     name: 'Puddle Splash Art & Design',   tier: 'Creative', price: 300, min: 1, max: 1, icon: 'icon-palette', desc: 'Turn the rains into a piece that moves people.' },
    { id: 'thunder',    name: 'Thunderbolt GK Quiz',          tier: 'Creative', price: 300, min: 1, max: 2, icon: 'icon-star',    desc: 'Fast, fun, all-round general-knowledge showdown.' },
    { id: 'downpour',   name: 'Downpour Debate & Speaking',   tier: 'Creative', price: 300, min: 1, max: 1, icon: 'icon-mic',     desc: 'Think on your feet and hold the room.' },
    { id: 'umbrella',   name: 'Umbrella Tales Story Writing', tier: 'Creative', price: 300, min: 1, max: 1, icon: 'icon-medal',   desc: 'Craft a short story from a surprise prompt.' },
    { id: 'drizzle',    name: 'Drizzle Design Studio',        tier: 'Creative', price: 300, min: 1, max: 1, icon: 'icon-grad',    desc: 'Poster / digital design on a themed brief.' }
  ];

  /* ======================================================================
   * COUPONS.  MONSOON1 forces the whole order to ₹1 for end-to-end testing —
   * REMOVE IT before launch. RAIN15 is a demo percentage coupon.
   * ==================================================================== */
  var COUPONS = {
    'MONSOON1': { kind: 'test1',   label: 'Test mode — total set to ₹1' },
    'RAIN15':   { kind: 'percent', value: 15, label: '15% off — early bird' }
  };

  /* ======================================================================
   * State
   * ==================================================================== */
  var mode = 'individual';           // 'individual' | 'school'
  var qty = {};                      // compId -> entries
  var coupon = null;                 // { code, kind, value, label }
  COMPS.forEach(function (c) { qty[c.id] = 0; });

  /* helpers */
  function el(id) { return document.getElementById(id); }
  function money(n) { return CONFIG.currencySymbol + Math.round(n).toLocaleString('en-IN'); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function comp(id) { for (var i = 0; i < COMPS.length; i++) if (COMPS[i].id === id) return COMPS[i]; return null; }
  function unit(pl) { return mode === 'school' ? (pl ? 'teams' : 'team') : (pl ? 'participants' : 'participant'); }

  /* ======================================================================
   * Gate: countdown + password unlock
   * ==================================================================== */
  var unlockTime = Date.parse(CONFIG.unlockAt);

  function isPreviewed() {
    try { return sessionStorage.getItem('mm_ok') === '1'; } catch (e) { return false; }
  }
  function locked() {
    if (isPreviewed()) return false;
    if (isNaN(unlockTime)) return false;
    return Date.now() < unlockTime;
  }

  function applyGate() {
    document.body.classList.toggle('mm-locked', locked());
  }

  function initGate() {
    // ?key=<password> also unlocks, for convenience
    try {
      var m = location.search.match(/[?&]key=([^&]+)/);
      if (m && decodeURIComponent(m[1]) === CONFIG.previewPassword) {
        sessionStorage.setItem('mm_ok', '1');
      }
    } catch (e) {}

    applyGate();

    // countdown to unlock
    var cd = el('mmGateCd');
    if (cd && !isNaN(unlockTime)) {
      var cells = { d: el('mmCdD'), h: el('mmCdH'), m: el('mmCdM'), s: el('mmCdS') };
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var tick = function () {
        var left = unlockTime - Date.now();
        if (left <= 0) {
          try { sessionStorage.setItem('mm_ok', '1'); } catch (e) {}
          applyGate();
          if (cells.d) { cells.d.textContent = cells.h.textContent = cells.m.textContent = cells.s.textContent = '00'; }
          clearInterval(timer);
          return;
        }
        var secs = Math.floor(left / 1000);
        if (cells.d) cells.d.textContent = pad(Math.floor(secs / 86400));
        if (cells.h) cells.h.textContent = pad(Math.floor(secs / 3600) % 24);
        if (cells.m) cells.m.textContent = pad(Math.floor(secs / 60) % 60);
        if (cells.s) cells.s.textContent = pad(secs % 60);
      };
      tick();
      var timer = setInterval(tick, 1000);
    }

    // discreet password unlock
    var form = el('mmGateForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var val = (el('mmPass').value || '');
        if (val === CONFIG.previewPassword) {
          try { sessionStorage.setItem('mm_ok', '1'); } catch (e2) {}
          applyGate();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          form.classList.remove('mm-gate__form--bad');
          void form.offsetWidth;               // restart the shake
          form.classList.add('mm-gate__form--bad');
          el('mmPass').value = '';
        }
      });
    }
  }

  /* ======================================================================
   * Render: competition cards
   * ==================================================================== */
  function renderComps() {
    var host = el('mmComps');
    if (!host) return;
    host.innerHTML = '';
    COMPS.forEach(function (c, i) {
      var n = qty[c.id];
      var card = document.createElement('article');
      card.className = 'mm-comp mm-reveal' + (n > 0 ? ' is-on' : '');
      card.style.setProperty('--mm-i', (i % 5));
      card.innerHTML =
        '<div class="mm-comp__top">' +
          '<span class="mm-comp__ic" aria-hidden="true"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><use href="#' + c.icon + '"></use></svg></span>' +
          '<span class="mm-comp__tier">' + esc(c.tier) + '</span>' +
        '</div>' +
        '<h3 class="mm-comp__n">' + esc(c.name) + '</h3>' +
        '<p class="mm-comp__d">' + esc(c.desc) + '</p>' +
        '<div class="mm-comp__foot">' +
          '<span class="mm-comp__price">' + money(c.price) + ' <span>/ ' + unit(false) + '</span></span>' +
          '<span class="mm-comp__pax">' + c.min + '–' + c.max + ' per entry</span>' +
        '</div>' +
        '<div class="mm-comp__actions">' +
          '<div class="mm-step" role="group" aria-label="Entries for ' + esc(c.name) + '">' +
            '<button type="button" class="mm-step__btn" data-act="dec" data-id="' + c.id + '" aria-label="Remove one">–</button>' +
            '<span class="mm-step__n">' + n + '</span>' +
            '<button type="button" class="mm-step__btn" data-act="inc" data-id="' + c.id + '" aria-label="Add one">+</button>' +
          '</div>' +
          '<button type="button" class="mm-comp__pdf" data-pdf="' + c.id + '">Brochure</button>' +
        '</div>';
      host.appendChild(card);
    });
    if (window.ITHReveal) window.ITHReveal();  // re-arm reveal if present
  }

  function step(id, d) {
    var c = comp(id); if (!c) return;
    var n = qty[id] + d; if (n < 0) n = 0;
    qty[id] = n;
    renderComps(); renderCart();
  }

  /* ======================================================================
   * Cart + totals (school discount + coupon)
   * ==================================================================== */
  function lines() {
    var out = [];
    COMPS.forEach(function (c) { if (qty[c.id] > 0) out.push({ id: c.id, name: c.name, n: qty[c.id], price: c.price, sum: qty[c.id] * c.price }); });
    return out;
  }
  function entries() { var t = 0; COMPS.forEach(function (c) { t += qty[c.id]; }); return t; }

  function totals() {
    var items = lines();
    var subtotal = 0; items.forEach(function (l) { subtotal += l.sum; });
    var school = (mode === 'school' && entries() >= CONFIG.bulkThreshold) ? subtotal * CONFIG.bulkDiscountRate : 0;
    var afterSchool = subtotal - school;
    var couponCut = 0, testOne = false;
    if (coupon && items.length) {
      if (coupon.kind === 'test1') { couponCut = afterSchool - 1; testOne = true; }
      else if (coupon.kind === 'percent') { couponCut = afterSchool * (coupon.value / 100); }
    }
    var total = testOne ? 1 : Math.max(afterSchool - couponCut, 0);
    return { items: items, subtotal: subtotal, school: school, couponCut: couponCut, total: total, entries: entries() };
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
          '<span class="mm-item__meta">' + l.n + ' ' + unit(l.n !== 1) + ' × ' + money(l.price) + '</span></div>' +
          '<span class="mm-item__sum">' + money(l.sum) + '</span>' +
          '<button type="button" class="mm-item__rm" data-rm="' + l.id + '" aria-label="Remove ' + esc(l.name) + '">' +
            '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#icon-trash"></use></svg></button>' +
        '</div>';
      }).join('');
    }

    el('mmCount').textContent = t.items.length + (t.items.length === 1 ? ' item' : ' items');
    el('mmSubtotal').textContent = money(t.subtotal);
    el('mmTotal').textContent = money(t.total);

    var schoolRow = el('mmSchoolRow');
    if (t.school > 0) { schoolRow.hidden = false; el('mmSchoolCut').textContent = '−' + money(t.school); } else { schoolRow.hidden = true; }

    var cRow = el('mmCouponRow');
    if (coupon && t.items.length) { cRow.hidden = false; el('mmCouponCut').textContent = '−' + money(t.couponCut); el('mmCouponTag').textContent = coupon.code; } else { cRow.hidden = true; }

    // school tracker
    var track = el('mmTrack');
    if (mode === 'school') {
      track.hidden = false;
      var pct = Math.min((t.entries / CONFIG.bulkThreshold) * 100, 100);
      el('mmTrackFill').style.width = pct + '%';
      el('mmTrackFrac').textContent = t.entries + ' / ' + CONFIG.bulkThreshold;
      el('mmTrackFill').classList.toggle('is-done', t.entries >= CONFIG.bulkThreshold);
      el('mmTrackNote').textContent = t.entries >= CONFIG.bulkThreshold
        ? '50% school discount unlocked 🎉'
        : 'Add ' + (CONFIG.bulkThreshold - t.entries) + ' more ' + unit(true) + ' to unlock 50% off.';
    } else { track.hidden = true; }

    updatePay();
  }

  /* ======================================================================
   * Coupon
   * ==================================================================== */
  function applyCoupon() {
    var input = el('mmCoupon');
    var msg = el('mmCouponMsg');
    var code = (input.value || '').trim().toUpperCase();
    if (!code) return;
    var def = COUPONS[code];
    if (!def) {
      coupon = null;
      msg.textContent = 'That code isn’t valid.';
      msg.className = 'mm-coupon__msg is-bad';
    } else {
      coupon = { code: code, kind: def.kind, value: def.value };
      msg.textContent = def.label + ' applied.';
      msg.className = 'mm-coupon__msg is-ok';
    }
    renderCart();
  }
  function clearCoupon() {
    coupon = null;
    el('mmCoupon').value = '';
    var msg = el('mmCouponMsg'); msg.textContent = ''; msg.className = 'mm-coupon__msg';
    renderCart();
  }

  /* ======================================================================
   * Mode
   * ==================================================================== */
  function setMode(next) {
    if (next === mode) return;
    mode = next;
    [].forEach.call(document.querySelectorAll('.mm-mode__opt'), function (b) {
      var on = b.getAttribute('data-mode') === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var coord = el('mmCoord');
    var req = ['mm-tname', 'mm-tphone', 'mm-temail'];
    if (mode === 'school') { coord.hidden = false; req.forEach(function (id) { el(id).required = true; }); }
    else { coord.hidden = true; req.forEach(function (id) { el(id).required = false; }); }
    renderComps(); renderCart();
  }

  /* ======================================================================
   * Pay state + checkout
   * ==================================================================== */
  function updatePay() {
    var t = totals();
    var btn = el('mmPay');
    if (!t.items.length) { btn.disabled = true; btn.textContent = 'Add a competition to continue'; return; }
    if (!el('mmTerms').checked) { btn.disabled = true; btn.textContent = 'Accept the terms to pay'; return; }
    btn.disabled = false; btn.textContent = 'Pay ' + money(t.total) + ' securely';
  }

  function form() {
    return {
      name: el('mm-name').value.trim(), email: el('mm-email').value.trim(), phone: el('mm-phone').value.trim(),
      grade: el('mm-grade').value.trim(), schoolName: el('mm-school').value.trim(), schoolAddress: el('mm-city').value.trim(),
      teacherName: (el('mm-tname').value || '').trim() || 'N/A',
      teacherPhone: (el('mm-tphone').value || '').trim() || 'N/A',
      teacherEmail: (el('mm-temail').value || '').trim() || 'N/A'
    };
  }

  function pay() {
    var f = el('mmForm');
    if (!f.checkValidity()) { f.reportValidity(); return; }
    if (!window.Razorpay) { alert('Payment library failed to load. Please refresh and try again.'); return; }

    var t = totals();
    if (!t.items.length || t.total < 1) return;

    var d = form();
    var summary = t.items.map(function (l) { return l.n + '× ' + l.name; }).join(', ');
    if (coupon) summary += ' [coupon:' + coupon.code + ']';
    var amountText = money(t.total);

    var btn = el('mmPay'); var restore = btn.textContent;
    btn.disabled = true; btn.textContent = 'Securing…';

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
          order_id: order.id,
          prefill: { name: d.name, email: d.email, contact: d.phone },
          theme: { color: '#e8c66a' },
          handler: function (res) {
            try {
              localStorage.setItem('txn_id', res.razorpay_payment_id || '');
              localStorage.setItem('txn_ref', res.razorpay_order_id || order.id || '');
              localStorage.setItem('txn_amount', amountText);
              localStorage.setItem('user_email', d.email);
              localStorage.setItem('school_name', d.schoolName);
              localStorage.setItem('cart_data', JSON.stringify(t.items));
            } catch (e) {}
            window.location.href = CONFIG.successUrl;
          },
          modal: { ondismiss: function () { btn.disabled = false; updatePay(); } }
        });
        rzp.on('payment.failed', function (resp) {
          alert('Payment failed: ' + (resp.error && resp.error.description ? resp.error.description : 'please try again.'));
          btn.disabled = false; updatePay();
        });
        rzp.open(); btn.textContent = restore;
      })
      .catch(function (err) { alert(err.message || 'Something went wrong. Please try again.'); btn.disabled = false; updatePay(); });
  }

  /* ======================================================================
   * Wire up
   * ==================================================================== */
  /* scroll-reveal for .mm-reveal (re-armable after re-renders) */
  function armReveal() {
    var items = [].slice.call(document.querySelectorAll('.mm-reveal:not(.is-in)'));
    if (!items.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { items.forEach(function (n) { n.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (n) { io.observe(n); setTimeout(function () { n.classList.add('is-in'); }, 2500); });
  }
  window.ITHReveal = armReveal;

  function init() {
    initGate();
    renderComps();
    renderCart();
    armReveal();

    el('mmComps').addEventListener('click', function (e) {
      var s = e.target.closest ? e.target.closest('.mm-step__btn') : null;
      if (s) { step(s.getAttribute('data-id'), s.getAttribute('data-act') === 'inc' ? 1 : -1); return; }
      var pdf = e.target.closest ? e.target.closest('.mm-comp__pdf') : null;
      if (pdf) { toast('Brochure coming soon — we’ll add a downloadable PDF for each competition.'); }
    });

    el('mmItems').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.mm-item__rm') : null;
      if (!b) return;
      qty[b.getAttribute('data-rm')] = 0; renderComps(); renderCart();
    });

    [].forEach.call(document.querySelectorAll('.mm-mode__opt'), function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });

    el('mmCouponBtn').addEventListener('click', applyCoupon);
    el('mmCouponClear').addEventListener('click', clearCoupon);
    el('mmCoupon').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } });
    el('mmTerms').addEventListener('change', updatePay);
    el('mmPay').addEventListener('click', pay);

    var mainPdf = el('mmBrochure');
    if (mainPdf) mainPdf.addEventListener('click', function (e) { e.preventDefault(); toast('The full brochure is coming soon — check back shortly.'); });
  }

  /* tiny toast */
  function toast(text) {
    var host = el('mmToast');
    if (!host) { alert(text); return; }
    var t = document.createElement('div');
    t.className = 'mm-toast__item';
    t.textContent = text;
    host.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 300); }, 3200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
