/*!
 * ith-register.js — Monsoon Minds Championship 2026 registration + checkout.
 *
 * Flow (same architecture as the previous season, rebuilt cleanly):
 *   choose mode → pick arenas & participant counts → cart with school bulk
 *   discount → fill details → accept terms → Pay → POST /api/create-order →
 *   open Razorpay with the returned order_id → on success store the txn in
 *   localStorage and redirect to success.html (which reads txn_id / txn_amount).
 *
 * The backend (functions/api/create-order.js) keeps the Razorpay SECRET on the
 * server; only the public Key ID is used here.
 *
 * Vanilla JS, no dependencies besides Razorpay's checkout.js (loaded in the page).
 */
(function () {
  'use strict';

  /* ======================================================================
   * CONFIG — review these before going live.
   * ==================================================================== */
  var CONFIG = {
    // Your PUBLIC Razorpay Key ID (safe to expose; the secret lives in the
    // Worker/Function env). Replace if you rotate keys.
    razorpayKeyId: 'rzp_live_Si0l9ROHLTplT2',
    createOrderUrl: '/api/create-order',
    successUrl: 'success.html',
    currencySymbol: '₹',
    // School bulk discount: at/above this many entries, apply the discount.
    bulkThreshold: 10,
    bulkDiscountRate: 0.5 // 50% off
  };

  /* ======================================================================
   * ⚠️  ARENA CATALOGUE & PRICES — PLACEHOLDER DATA, SET REAL VALUES HERE.
   * The eight Monsoon Minds arenas. `price` is per entry (one participant in
   * Individual mode, one team in School mode). `min`/`max` bound the number of
   * participants an entry may contain. Edit names, prices and limits to match
   * the real competition before opening registration.
   * ==================================================================== */
  var ARENAS = [
    { id: 'science', name: 'Science & STEM',        icon: 'icon-science', price: 499, min: 1, max: 3, desc: 'Applied understanding, not rote recall.' },
    { id: 'maths',   name: 'Mathematics',           icon: 'icon-math',    price: 499, min: 1, max: 1, desc: 'Hard problems, elegant solutions, a clock.' },
    { id: 'writing', name: 'Creative Writing',      icon: 'icon-pen',     price: 399, min: 1, max: 1, desc: 'Originality and craft over correctness.' },
    { id: 'art',     name: 'Art & Design',          icon: 'icon-palette', price: 399, min: 1, max: 1, desc: 'Turn an idea into something that moves people.' },
    { id: 'coding',  name: 'Coding & AI',           icon: 'icon-code',    price: 499, min: 1, max: 3, desc: 'Think computationally. Build the answer.' },
    { id: 'quiz',    name: 'Quiz & GK',             icon: 'icon-globe',   price: 399, min: 1, max: 2, desc: 'Breadth, speed and composure under pressure.' },
    { id: 'innov',   name: 'Innovation & Projects', icon: 'icon-bulb',    price: 499, min: 2, max: 4, desc: 'Solve a real problem and show your working.' },
    { id: 'speak',   name: 'Public Speaking',       icon: 'icon-mic',     price: 399, min: 1, max: 1, desc: 'Think on your feet. Hold the room.' }
  ];

  /* ======================================================================
   * State
   * ==================================================================== */
  var mode = 'individual';               // 'individual' | 'school'
  var qty = {};                          // arenaId -> number of entries
  ARENAS.forEach(function (a) { qty[a.id] = 0; });

  /* ======================================================================
   * Tiny DOM helpers
   * ==================================================================== */
  function el(id) { return document.getElementById(id); }
  function money(n) { return CONFIG.currencySymbol + Math.round(n).toLocaleString('en-IN'); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function arena(id) { for (var i = 0; i < ARENAS.length; i++) if (ARENAS[i].id === id) return ARENAS[i]; return null; }

  /* The unit label depends on mode: participants (individual) vs teams (school). */
  function unitWord(plural) { return mode === 'school' ? (plural ? 'teams' : 'team') : (plural ? 'participants' : 'participant'); }

  /* ======================================================================
   * Render: arena cards
   * ==================================================================== */
  function renderArenas() {
    var host = el('rgArenas');
    if (!host) return;
    host.innerHTML = '';

    ARENAS.forEach(function (a) {
      var n = qty[a.id];
      var card = document.createElement('article');
      card.className = 'rg-arena' + (n > 0 ? ' is-on' : '');
      card.innerHTML =
        '<span class="rg-arena__ic" aria-hidden="true"><svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><use href="#' + a.icon + '"></use></svg></span>' +
        '<h3 class="rg-arena__n">' + esc(a.name) + '</h3>' +
        '<p class="rg-arena__d">' + esc(a.desc) + '</p>' +
        '<p class="rg-arena__price">' + money(a.price) + ' <span>/ ' + unitWord(false) + '</span></p>' +
        '<div class="rg-step" role="group" aria-label="Number of ' + unitWord(true) + ' for ' + esc(a.name) + '">' +
          '<button type="button" class="rg-step__btn" data-act="dec" data-id="' + a.id + '" aria-label="Remove one">–</button>' +
          '<span class="rg-step__n" data-count="' + a.id + '">' + n + '</span>' +
          '<button type="button" class="rg-step__btn" data-act="inc" data-id="' + a.id + '" aria-label="Add one">+</button>' +
        '</div>' +
        '<p class="rg-arena__pax">' + a.min + '–' + a.max + ' per entry</p>';
      host.appendChild(card);
    });
  }

  function step(id, delta) {
    var a = arena(id);
    if (!a) return;
    var n = qty[id] + delta;
    if (n < 0) n = 0;
    qty[id] = n;
    renderArenas();
    renderCart();
  }

  /* ======================================================================
   * Cart + totals
   * ==================================================================== */
  function lines() {
    var out = [];
    ARENAS.forEach(function (a) {
      if (qty[a.id] > 0) out.push({ id: a.id, name: a.name, n: qty[a.id], price: a.price, sum: qty[a.id] * a.price });
    });
    return out;
  }
  function totalEntries() { var t = 0; ARENAS.forEach(function (a) { t += qty[a.id]; }); return t; }

  function totals() {
    var items = lines();
    var subtotal = 0;
    items.forEach(function (l) { subtotal += l.sum; });
    var entries = totalEntries();
    var discount = 0;
    if (mode === 'school' && entries >= CONFIG.bulkThreshold) discount = subtotal * CONFIG.bulkDiscountRate;
    return { items: items, subtotal: subtotal, discount: discount, total: subtotal - discount, entries: entries };
  }

  function renderCart() {
    var t = totals();

    // items
    var box = el('rgItems');
    if (t.items.length === 0) {
      box.innerHTML = '<p class="rg-cart__empty">No arenas added yet. Pick one on the left to begin.</p>';
    } else {
      box.innerHTML = t.items.map(function (l) {
        return '<div class="rg-item">' +
          '<div class="rg-item__main"><span class="rg-item__n">' + esc(l.name) + '</span>' +
          '<span class="rg-item__meta">' + l.n + ' ' + unitWord(l.n !== 1) + ' × ' + money(l.price) + '</span></div>' +
          '<span class="rg-item__sum">' + money(l.sum) + '</span>' +
          '<button type="button" class="rg-item__rm" data-rm="' + l.id + '" aria-label="Remove ' + esc(l.name) + '">' +
            '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#icon-trash"></use></svg></button>' +
        '</div>';
      }).join('');
    }

    // counts + totals
    el('rgCount').textContent = t.items.length + (t.items.length === 1 ? ' item' : ' items');
    el('rgSubtotal').textContent = money(t.subtotal);
    el('rgTotal').textContent = money(t.total);
    var discRow = el('rgDiscRow');
    if (t.discount > 0) { discRow.hidden = false; el('rgDiscount').textContent = '−' + money(t.discount); }
    else { discRow.hidden = true; }

    // school bulk tracker
    var track = el('rgTrack');
    if (mode === 'school') {
      track.hidden = false;
      var pct = Math.min((t.entries / CONFIG.bulkThreshold) * 100, 100);
      el('rgTrackFill').style.width = pct + '%';
      el('rgTrackFrac').textContent = t.entries + ' / ' + CONFIG.bulkThreshold;
      track.querySelector('.rg-track__bar').setAttribute('aria-valuenow', Math.round(pct));
      el('rgTrackFill').classList.toggle('is-done', t.entries >= CONFIG.bulkThreshold);
      el('rgTrackNote').textContent = t.entries >= CONFIG.bulkThreshold
        ? '50% school discount unlocked 🎉'
        : 'Add ' + (CONFIG.bulkThreshold - t.entries) + ' more ' + unitWord(true) + ' to unlock the 50% school discount.';
    } else {
      track.hidden = true;
    }

    updatePayState();
  }

  /* ======================================================================
   * Mode switch
   * ==================================================================== */
  function setMode(next) {
    if (next === mode) return;
    mode = next;
    // reflect selection
    [].forEach.call(document.querySelectorAll('.rg-mode__opt'), function (b) {
      var on = b.getAttribute('data-mode') === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    // coordinator fields
    var coord = el('rgCoordinator');
    var required = ['rg-tname', 'rg-tphone', 'rg-temail'];
    if (mode === 'school') {
      coord.hidden = false;
      required.forEach(function (id) { el(id).required = true; });
      el('rg-qty-hint').textContent = 'Set how many teams you’re entering in each arena. 10+ entries unlock a 50% discount.';
    } else {
      coord.hidden = true;
      required.forEach(function (id) { el(id).required = false; });
      el('rg-qty-hint').textContent = 'Set how many participants you’re entering in each arena.';
    }
    renderArenas();
    renderCart();
  }

  /* ======================================================================
   * Pay button state
   * ==================================================================== */
  function updatePayState() {
    var t = totals();
    var termsOk = el('rgTerms').checked;
    var btn = el('rgPay');
    if (t.items.length === 0) { btn.disabled = true; btn.textContent = 'Add an arena to continue'; return; }
    if (!termsOk) { btn.disabled = true; btn.textContent = 'Accept the terms to pay'; return; }
    btn.disabled = false;
    btn.textContent = 'Pay ' + money(t.total) + ' securely';
  }

  /* ======================================================================
   * Checkout
   * ==================================================================== */
  function collectForm() {
    return {
      name: el('rg-name').value.trim(),
      email: el('rg-email').value.trim(),
      phone: el('rg-phone').value.trim(),
      grade: el('rg-grade').value.trim(),
      schoolName: el('rg-school').value.trim(),
      schoolAddress: el('rg-city').value.trim(),
      teacherName: (el('rg-tname').value || '').trim() || 'N/A',
      teacherPhone: (el('rg-tphone').value || '').trim() || 'N/A',
      teacherEmail: (el('rg-temail').value || '').trim() || 'N/A'
    };
  }

  function pay() {
    var form = el('rgForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!window.Razorpay) { alert('Payment library failed to load. Please refresh and try again.'); return; }

    var t = totals();
    if (t.total <= 0 || t.items.length === 0) return;

    var f = collectForm();
    var cartSummary = t.items.map(function (l) { return l.n + '× ' + l.name; }).join(', ');
    var amountText = money(t.total);

    var btn = el('rgPay');
    var restore = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Securing…';

    fetch(CONFIG.createOrderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountToPay: t.total,
        mode: mode,
        name: f.name, email: f.email, phone: f.phone, grade: f.grade,
        schoolName: f.schoolName, schoolAddress: f.schoolAddress,
        teacherName: f.teacherName, teacherPhone: f.teacherPhone, teacherEmail: f.teacherEmail,
        cartSummary: cartSummary.substring(0, 200)
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (order) {
        if (!order || !order.id) throw new Error((order && order.error) || 'Could not start the payment. Please try again.');

        var rzp = new Razorpay({
          key: CONFIG.razorpayKeyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Inspire Talent Hub',
          description: 'Monsoon Minds Championship 2026 — Registration',
          order_id: order.id,
          prefill: { name: f.name, email: f.email, contact: f.phone },
          theme: { color: '#e8c66a' },
          handler: function (res) {
            try {
              localStorage.setItem('txn_id', res.razorpay_payment_id || '');
              localStorage.setItem('txn_amount', amountText);
              localStorage.setItem('user_email', f.email);
              localStorage.setItem('school_name', f.schoolName);
              localStorage.setItem('cart_data', JSON.stringify(t.items));
            } catch (e) { /* storage may be blocked; the redirect still confirms */ }
            window.location.href = CONFIG.successUrl;
          },
          modal: { ondismiss: function () { btn.disabled = false; updatePayState(); } }
        });
        rzp.on('payment.failed', function (resp) {
          alert('Payment failed: ' + (resp.error && resp.error.description ? resp.error.description : 'please try again.'));
          btn.disabled = false; updatePayState();
        });
        rzp.open();
        btn.textContent = restore;
      })
      .catch(function (err) {
        alert(err.message || 'Something went wrong starting the payment. Please try again.');
        btn.disabled = false; updatePayState();
      });
  }

  /* ======================================================================
   * Wire up
   * ==================================================================== */
  function init() {
    renderArenas();
    renderCart();

    // arena steppers (event delegation)
    el('rgArenas').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.rg-step__btn') : null;
      if (!b) return;
      step(b.getAttribute('data-id'), b.getAttribute('data-act') === 'inc' ? 1 : -1);
    });

    // cart remove
    el('rgItems').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.rg-item__rm') : null;
      if (!b) return;
      qty[b.getAttribute('data-rm')] = 0;
      renderArenas(); renderCart();
    });

    // mode
    [].forEach.call(document.querySelectorAll('.rg-mode__opt'), function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });

    el('rgTerms').addEventListener('change', updatePayState);
    el('rgPay').addEventListener('click', pay);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
