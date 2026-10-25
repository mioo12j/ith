
  (function () {
    var C = window.ITHCert;
    function el(id) { return document.getElementById(id); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

    // Extract a Certificate ID from a scanned QR payload or a link. Handles new
    // verification URLs (?id=...), older/alternate certificate links that used a
    // different query key (?cert=, ?certid=, ?code=, ?c=, ?ref=, ?q=), a bare
    // Certificate ID, or an ID sitting anywhere in the text. Exposed for testing.
    function extractCertId(text) {
      var s = String(text || '').trim();
      if (!s) return '';
      var m = s.match(/[?&](?:id|cert|certid|cert_id|certificate|code|c|ref|q)=([^&\s#]+)/i);
      if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return m[1]; } }
      // Otherwise treat a plausible ID token (anywhere in the string) as the ID.
      var t = s.match(/\b([A-Z]{2,5}\d{0,4}[-][A-Z0-9-]{4,})\b/i);
      return t ? t[1] : s;
    }
    window.__extractCertId = extractCertId;

    // Read a Certificate ID from the current page URL. Supports the standard
    // ?id= param plus legacy/alternate keys, and, as a last resort, any plausible
    // ID token in the query or hash so old QR codes still land verified.
    function idFromUrl() {
      var p = new URLSearchParams(location.search);
      var keys = ['id', 'cert', 'certid', 'cert_id', 'certificate', 'code', 'c', 'ref', 'q'];
      for (var i = 0; i < keys.length; i++) {
        var v = p.get(keys[i]);
        if (v && v.trim()) return v.trim();
      }
      var hash = (location.hash || '').replace(/^#/, '');
      if (hash) {
        var hp = new URLSearchParams(hash);
        for (var j = 0; j < keys.length; j++) {
          var hv = hp.get(keys[j]);
          if (hv && hv.trim()) return hv.trim();
        }
      }
      var token = extractCertId(location.search + ' ' + hash);
      return (token && token !== (location.search + ' ' + hash).trim()) ? token : '';
    }

    var scanStream = null, scanRAF = null, detector = null;

    document.addEventListener('DOMContentLoaded', function () {
      el('verifyForm').addEventListener('submit', function (e) { e.preventDefault(); verify(el('v_id').value); });
      var id = idFromUrl();
      if (id) { el('v_id').value = id; verify(id); }

      el('scanBtn').addEventListener('click', startScan);
      el('scanCancel').addEventListener('click', stopScan);
    });

    function startScan() {
      el('qrFallback').hidden = true;
      var hasDetector = ('BarcodeDetector' in window);
      var hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      if (!hasDetector || !hasCamera) {
        if (!hasCamera) el('qrFallbackMsg').innerHTML = 'This browser can\u2019t open the camera here. Point your phone\u2019s <strong>camera app</strong> at the certificate\u2019s QR code to verify, or type the Certificate ID above.';
        el('qrFallback').hidden = false;
        return;
      }
      try { detector = new window.BarcodeDetector({ formats: ['qr_code'] }); }
      catch (e) { el('qrFallback').hidden = false; return; }

      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then(function (stream) {
          scanStream = stream;
          var v = el('scanVideo');
          v.srcObject = stream; v.setAttribute('playsinline', '');
          el('qrScanner').hidden = false;
          el('qrScanner').classList.add('qr-scanner--modal');
          document.body.classList.add('qr-open');
          el('scanStatus').textContent = 'Point your camera at the QR code on the certificate.';
          return v.play();
        })
        .then(function () { tick(); })
        .catch(function () {
          el('qrFallbackMsg').innerHTML = 'We couldn\u2019t access the camera (permission denied or unavailable). Point your phone\u2019s <strong>camera app</strong> at the QR code to verify, or type the Certificate ID above.';
          el('qrFallback').hidden = false;
          stopScan();
        });
    }

    function tick() {
      var v = el('scanVideo');
      if (!scanStream || !detector || v.readyState < 2) { scanRAF = requestAnimationFrame(tick); return; }
      detector.detect(v).then(function (codes) {
        if (codes && codes.length) {
          var id = extractCertId(codes[0].rawValue);
          el('scanStatus').textContent = 'QR detected - verifying…';
          stopScan();
          el('v_id').value = id;
          verify(id);
          return;
        }
        scanRAF = requestAnimationFrame(tick);
      }).catch(function () { scanRAF = requestAnimationFrame(tick); });
    }

    function stopScan() {
      if (scanRAF) { cancelAnimationFrame(scanRAF); scanRAF = null; }
      if (scanStream) { scanStream.getTracks().forEach(function (t) { t.stop(); }); scanStream = null; }
      var v = el('scanVideo'); if (v) v.srcObject = null;
      el('qrScanner').hidden = true;
      el('qrScanner').classList.remove('qr-scanner--modal');
      document.body.classList.remove('qr-open');
    }

    function cell(label, value, i) {
      var delay = (0.35 + (i || 0) * 0.07).toFixed(2);
      return '<div class="result-cell" style="animation-delay:' + delay + 's"><dt>' + esc(label) + '</dt><dd>' + (value ? esc(value) : ' - ') + '</dd></div>';
    }

    var CHECK_SVG = '<svg class="cs-badge-icon" viewBox="0 0 52 52" aria-hidden="true"><circle class="cs-check__circle" cx="26" cy="26" r="24"/><path class="cs-check__path" d="M15 27l7.5 7.5L38 19"/></svg>';
    var CROSS_SVG = '<svg class="cs-badge-icon" viewBox="0 0 52 52" aria-hidden="true"><circle class="cs-cross__circle" cx="26" cy="26" r="24"/><line class="cs-cross__line" x1="18" y1="18" x2="34" y2="34"/><line class="cs-cross__line cs-cross__line--2" x1="34" y1="18" x2="18" y2="34"/></svg>';

    var LOADING_HTML =
      '<div class="cs-modal__loader"><div class="cs-loader">' +
        '<div class="cs-spinner" role="status" aria-label="Verifying certificate"></div>' +
        '<p>Verifying certificate<span class="cs-loader__dots"></span></p>' +
      '</div></div>';

    function verify(rawId) {
      var id = String(rawId || '').trim();
      if (!id) { el('v_id').focus(); return; }
      var m = window.ITHFx.modal({ label: 'Certificate verification' });
      m.setContent(LOADING_HTML);
      var wait = window.ITHFx.reduceMotion() ? 0 : 900;
      setTimeout(function () { renderResult(id, m); }, wait);
    }

    function gridItem(label, value, opts, i) {
      opts = opts || {};
      var span = opts.span ? ' span2' : '';
      var ddcls = opts.mono ? ' class="mono"' : '';
      return '<div class="' + span.trim() + '" style="animation-delay:' + (0.6 + i * 0.09).toFixed(2) + 's">' +
        '<dt>' + esc(label) + '</dt><dd' + ddcls + '>' + (value ? esc(value) : ' - ') + '</dd></div>';
    }

    function renderResult(id, m) {
      var rec = C.findByCertId(id);

      if (!rec) {
        m.setContent(
          '<div class="cred cred--error">' +
            '<div class="cred__seal">' + CROSS_SVG + '</div>' +
            '<div class="cred__tag">Verification Failed</div>' +
            '<h2 class="cred__title">Not Verified</h2>' +
            '<p class="cred__sub">No certificate matches the ID &ldquo;' + esc(id) + '&rdquo;. Please double-check the ID and try again, or scan the QR code printed on the certificate.</p>' +
          '</div>');
        return;
      }

      var available = C.certificateEligible(rec);
      var resultText = rec.resultStatus + (rec.rank && rec.rank !== rec.resultStatus ? ' \u00b7 ' + rec.rank : '');
      var items = [
        gridItem('Competition', rec.competition, {}, 0),
        gridItem('Category', rec.category, {}, 1),
        gridItem('Result', resultText, {}, 2),
        gridItem('Issue Date', rec.issueDate, {}, 3),
        gridItem('Certificate ID', rec.certId, { mono: true, span: true }, 4)
      ].join('');

      m.setContent(
        '<div class="cred">' +
          '<div class="cred__seal">' + CHECK_SVG + '</div>' +
          '<div class="cred__tag">\u2726 Verified Genuine Certificate \u2726</div>' +
          '<h2 class="cred__title">Certificate Verified</h2>' +
          '<p class="cred__present">This certificate is issued to</p>' +
          '<p class="cred__name" id="credName"></p>' +
          '<div class="cred__divider" aria-hidden="true"></div>' +
          '<div class="cred__grid">' + items + '</div>' +
          (available ?
            '<div class="cred__cta"><a class="btn btn-gold hover-target" href="' + esc(C.certificateUrl(rec.certId)) + '"><span>View Certificate</span><div class="btn-ripple" aria-hidden="true"></div></a></div>' : '') +
        '</div>');
      window.ITHFx.typeText(m.card.querySelector('#credName'), rec.name, { speed: 60, delay: 480 });
      window.ITHFx.confetti(m.card.querySelector('.cred'));
    }
  })();
  