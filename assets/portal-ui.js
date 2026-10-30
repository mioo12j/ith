(() => {
  const form = document.querySelector('#result-search');
  const out = document.querySelector('#portal-results');
  const C = window.ITHCert;
  if (!form || !out) return;
  if (!C || !window.ITH_CERT_DB) { out.textContent = 'Results could not load. Please refresh the page.'; return; }
  const CONTACT = 'info@inspiretalenthub.in';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // CONFIG — when the General's video is uploaded, set these (same file as the
  // homepage section). While GENERAL_VIDEO is empty, a dignified placeholder shows.
  const GENERAL_VIDEO = '';            // e.g. 'assets/jj-singh-message.mp4'
  const GENERAL_POSTER = '';           // e.g. 'assets/jj-poster.jpg'

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const firstName = n => String(n).trim().split(/\s+/)[0] || n;
  const isWinner = r => /winner/i.test(r.resultStatus);
  const isBlocked = r => /disqualif|withdraw/i.test(r.resultStatus);
  const resultLabel = r => isWinner(r) ? ((r.rank ? r.rank + ' Place' : 'Winner') + ' 🏅') : 'Participant';

  // Populate the competition dropdown from the dataset (these names only).
  const sel = form.elements['competition'];
  if (sel) {
    [...new Set(C.records().map(r => r.competition).filter(Boolean))].sort()
      .forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.append(o); });
  }

  /* ---------- Result celebration dialog ---------- */
  const dialog = document.createElement('dialog');
  dialog.className = 'celebration-dialog';
  dialog.setAttribute('aria-label', 'Your Monsoon Minds result');
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button'; closeBtn.className = 'close-celebration'; closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close result');
  const content = document.createElement('div'); content.className = 'celebration-content';
  dialog.append(closeBtn, content); document.body.append(dialog);
  closeBtn.onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  /* ---------- General J.J. Singh message dialog (shown before the result) ---------- */
  const gDialog = document.createElement('dialog');
  gDialog.className = 'general-dialog';
  gDialog.setAttribute('aria-label', 'A message from General J.J. Singh');
  const gCard = document.createElement('div'); gCard.className = 'general-card';
  gDialog.append(gCard); document.body.append(gDialog);
  let continueCb = null;
  let watched = false;
  // Compulsory: once a video exists it must be watched; block Escape until then.
  gDialog.addEventListener('cancel', e => { if (GENERAL_VIDEO && !watched) e.preventDefault(); });

  function proceed() {
    const cb = continueCb; continueCb = null;
    gDialog.close();
    if (cb) cb();
  }

  function videoNode(onWatched) {
    if (GENERAL_VIDEO) {
      const v = document.createElement('video');
      v.controls = true; v.playsInline = true; v.preload = 'metadata';
      v.setAttribute('controlsList', 'nodownload noplaybackrate');
      if (GENERAL_POSTER) v.poster = GENERAL_POSTER;
      const src = document.createElement('source'); src.src = GENERAL_VIDEO; src.type = 'video/mp4';
      v.append(src);
      v.addEventListener('ended', () => onWatched(true));
      v.addEventListener('error', () => onWatched(false)); // don't trap viewers if it fails to load
      return v;
    }
    const ph = document.createElement('div'); ph.className = 'general-video-ph';
    ph.innerHTML = '<span class="general-play" aria-hidden="true">▶</span>' +
      '<span class="general-soon">VIDEO MESSAGE · ARRIVING SOON</span>';
    return ph;
  }

  function buildGeneral() {
    gCard.replaceChildren();
    watched = false;
    const gated = !!GENERAL_VIDEO; // watching is only enforceable once a video exists
    const kicker = document.createElement('p'); kicker.className = 'general-kicker'; kicker.textContent = 'A MESSAGE BEFORE YOUR RESULT';
    const h = document.createElement('h2'); h.textContent = 'A message from General J.J. Singh';

    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'primary-action general-continue';
    const hint = document.createElement('p'); hint.className = 'general-hint';

    function unlock(completed) {
      watched = true;
      btn.disabled = false;
      btn.textContent = 'Continue to my result →';
      hint.textContent = '';
      if (completed) proceed(); // video finished → show the result
    }

    const vwrap = document.createElement('div'); vwrap.className = 'general-video'; vwrap.append(videoNode(unlock));

    const bio = document.createElement('div'); bio.className = 'general-bio';
    const img = document.createElement('img');
    img.src = 'assets/general-jj-singh.jpg'; img.alt = 'General J.J. Singh'; img.width = 88; img.height = 105; img.loading = 'lazy';
    const info = document.createElement('div');
    const nm = document.createElement('h3'); nm.textContent = 'General Joginder Jaswant Singh';
    const md = document.createElement('p'); md.className = 'medals'; md.textContent = 'PVSM · AVSM · VSM · ADC';
    const ul = document.createElement('ul');
    ['13th Governor of Arunachal Pradesh', '47th Chairman, Chiefs of Staff Committee', '21st Chief of the Army Staff',
     'Officer of the Legion of Honour (France, 2016)'].forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
    info.append(nm, md, ul); bio.append(img, info);

    if (gated) {
      btn.disabled = true; btn.textContent = 'Watch the full message to continue';
      hint.textContent = 'Please watch the message to the end to see your result.';
    } else {
      btn.disabled = false; btn.textContent = 'Continue to my result →';
    }
    btn.onclick = () => { if (!btn.disabled) proceed(); };

    gCard.append(kicker, h, vwrap, bio, hint, btn);
  }

  function generalIntro(cb) {
    continueCb = cb;
    buildGeneral();
    if (gDialog.showModal) gDialog.showModal(); else proceed();
  }

  /* ---------- Rendering helpers ---------- */
  function confetti(n, colors) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const bit = document.createElement('i'); bit.className = 'confetti-bit';
      const size = 6 + Math.random() * 8;
      bit.style.left = (Math.random() * 100).toFixed(1) + '%';
      bit.style.width = size.toFixed(1) + 'px';
      bit.style.height = (size * 1.6).toFixed(1) + 'px';
      bit.style.setProperty('--color', colors[i % colors.length]);
      bit.style.animationDelay = (Math.random() * 0.9).toFixed(2) + 's';
      bit.style.animationDuration = (1.9 + Math.random() * 1.4).toFixed(2) + 's';
      content.append(bit);
    }
  }
  function note(title, html, tone) {
    out.replaceChildren();
    const card = document.createElement('article');
    card.className = 'result-note result-note--' + (tone || 'info');
    const h = document.createElement('h3'); h.textContent = title;
    const p = document.createElement('p'); p.innerHTML = html;
    card.append(h, p); out.append(card);
    out.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }

  function openResult(rec) {
    content.replaceChildren();
    const winner = isWinner(rec);
    const badge = document.createElement('div'); badge.className = 'celebration-star'; badge.textContent = winner ? '🏆' : '✦';
    const kicker = document.createElement('p'); kicker.className = 'rev-kicker'; kicker.textContent = 'MONSOON MINDS 2026';
    const h = document.createElement('h2'); h.textContent = winner ? ('Congratulations, ' + firstName(rec.name) + '!') : 'Thank you for taking part!';
    content.append(badge, kicker, h);

    const dl = document.createElement('dl'); dl.className = 'result-details';
    [['Name', rec.name], ['School', rec.school], ['Class', rec.category ? 'Class ' + rec.category : ''],
     ['Competition', rec.competition], ['Result', resultLabel(rec)]].forEach(([k, v]) => {
      if (!v) return;
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd);
    });
    content.append(dl);

    if (rec.reward) {
      const rw = document.createElement('div'); rw.className = 'reward-banner';
      rw.innerHTML = '<span class="reward-coin" aria-hidden="true">🪙</span>' +
        '<span class="reward-text"><strong>Cash Reward</strong>' + esc(rec.reward) + '</span>';
      content.append(rw);
      confetti(90, ['#ffd94a', '#ffe780', '#f7cf6d', '#fff3b0', '#ffcf3a']);
    } else if (winner) {
      confetti(64, ['#f7cf6d', '#81d6bd', '#c4a0f5', '#e893b8']);
    } else {
      confetti(40, ['#81d6bd', '#9ec7ff', '#c4a0f5']);
    }

    if (C.certificateEligible(rec)) {
      const a = document.createElement('a'); a.className = 'primary-action';
      a.href = 'certificate.html?id=' + encodeURIComponent(rec.certId);
      a.textContent = 'Open your certificate ↗'; content.append(a);
    } else {
      const cs = document.createElement('p'); cs.className = 'cert-status';
      cs.textContent = '🎓 Your official certificate will be available to download here soon.';
      content.append(cs);
    }
    if (dialog.showModal) dialog.showModal();
  }

  function showOne(rec) {
    if (isBlocked(rec)) {
      note('We couldn’t generate this result',
        'Looks like we’re having a problem generating your result. Please contact the organizers at <a href="mailto:' + CONTACT + '">' + CONTACT + '</a> for more information.',
        'warn');
      return;
    }
    note('Result found 🎉', 'First, a message from General J.J. Singh — then your result.', 'ok');
    generalIntro(() => openResult(rec));   // video + the General's details first, then the result
  }

  function chooser(list) {
    out.replaceChildren();
    const card = document.createElement('article'); card.className = 'result-note';
    const h = document.createElement('h3'); h.textContent = 'We found a few matches';
    const p = document.createElement('p'); p.textContent = 'Select your entry to see the result:';
    card.append(h, p);
    const wrap = document.createElement('div'); wrap.className = 'match-list';
    list.forEach(rec => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'match-item';
      b.innerHTML = '<strong>' + esc(rec.name) + '</strong><span>' + esc(rec.school || '') +
        (rec.category ? ' · Class ' + esc(rec.category) : '') + '</span>';
      b.onclick = () => showOne(rec); wrap.append(b);
    });
    card.append(wrap); out.append(card);
    out.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    out.replaceChildren();
    const data = Object.fromEntries(new FormData(form));
    const name = (data.name || '').trim(), comp = (data.competition || '').trim();
    if (!name || !comp) { note('Add your details', 'Please enter your name and choose your competition.', 'info'); return; }
    if (!C.resultsPublished()) { note('Results not published yet', 'Please check back after the official announcement.', 'info'); return; }
    const res = C.search({ name: name, competition: comp });
    const list = res.results || [];
    if (!list.length) {
      note('Name not found', 'The name is not in the record. Please check the spelling, or contact support at <a href="mailto:' + CONTACT + '">' + CONTACT + '</a>.', 'warn');
      return;
    }
    if (list.length === 1) { showOne(list[0]); return; }
    chooser(list);
  });
  form.addEventListener('reset', () => { out.replaceChildren(); dialog.close(); gDialog.close(); });
})();
