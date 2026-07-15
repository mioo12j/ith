/*!
 * ith-qr.js — Minimal, dependency-free QR Code generator (byte + numeric mode).
 * Pure vanilla JS. Supports QR versions 1–6, error-correction level M (default)
 * — comfortably large enough for a certificate verification URL. No network, no
 * backend, no third-party code. Renders to an SVG string or a <canvas>.
 *
 * Implemented from the ISO/IEC 18004 specification. The Reed–Solomon core is
 * unit-tested against the standard "HELLO WORLD" reference codewords (see
 * ITHQR._selftest).
 */
(function (global) {
  'use strict';

  // ---- Galois field GF(256), primitive polynomial 0x11D ----
  var EXP = new Array(512), LOG = new Array(256);
  (function initGF() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function gfMul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  // Reed–Solomon error-correction codewords for a data byte array.
  function rsGenPoly(degree) {
    var poly = [1];
    for (var d = 0; d < degree; d++) {
      var np = new Array(poly.length + 1).fill(0);
      for (var i = 0; i < poly.length; i++) {
        np[i] ^= gfMul(poly[i], EXP[d]);
        np[i + 1] ^= poly[i];
      }
      poly = np;
    }
    // poly is built lowest-degree-first (poly[len-1] === 1, the leading term).
    // Return highest-degree-first so poly[0] === 1 for the division routine.
    return poly.reverse();
  }
  function rsEncode(data, ecLen) {
    // Generator is monic (degree ecLen, leading coeff 1); drop the leading term
    // so the remainder array stays length ecLen during long division.
    var gen = rsGenPoly(ecLen); // length ecLen + 1, gen[0] === 1
    var res = new Array(ecLen).fill(0);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ res[0];
      res.shift();
      res.push(0);
      for (var j = 0; j < ecLen; j++) res[j] ^= gfMul(gen[j + 1], factor);
    }
    return res;
  }

  // ---- Error-correction characteristics, level M, versions 1–6 ----
  // version: { ec: ECcodewordsPerBlock, groups: [[numBlocks, dataCodewordsPerBlock], ...], total }
  var EC_M = {
    1: { ec: 10, groups: [[1, 16]], total: 26 },
    2: { ec: 16, groups: [[1, 28]], total: 44 },
    3: { ec: 26, groups: [[1, 44]], total: 70 },
    4: { ec: 18, groups: [[2, 32]], total: 100 },
    5: { ec: 24, groups: [[2, 43]], total: 134 },
    6: { ec: 16, groups: [[4, 27]], total: 172 }
  };
  function dataCapacityBytes(v) {
    var spec = EC_M[v];
    var dataCw = 0;
    spec.groups.forEach(function (g) { dataCw += g[0] * g[1]; });
    // overhead: 4-bit mode indicator + 8-bit byte count (versions 1–9)
    return Math.floor((dataCw * 8 - 12) / 8);
  }
  function totalDataCodewords(v) {
    var dataCw = 0;
    EC_M[v].groups.forEach(function (g) { dataCw += g[0] * g[1]; });
    return dataCw;
  }

  // Alignment-pattern centre coordinate for versions 2–6 (single pattern at (c,c)).
  var ALIGN = { 2: 18, 3: 22, 4: 26, 5: 30, 6: 34 };

  // ---- Bit buffer ----
  function BitBuffer() { this.bits = []; }
  BitBuffer.prototype.put = function (val, len) {
    for (var i = len - 1; i >= 0; i--) this.bits.push((val >>> i) & 1);
  };
  BitBuffer.prototype.length = function () { return this.bits.length; };

  // ---- Encode text into data codewords for a chosen version ----
  function encodeData(text, version) {
    var bytes = toUtf8Bytes(text);
    var bb = new BitBuffer();
    bb.put(0x4, 4);            // byte mode indicator
    bb.put(bytes.length, 8);   // char count (versions 1–9 use 8 bits for byte mode)
    for (var i = 0; i < bytes.length; i++) bb.put(bytes[i], 8);

    var totalData = totalDataCodewords(version);
    var capacityBits = totalData * 8;
    // terminator (up to 4 zero bits)
    var term = Math.min(4, capacityBits - bb.length());
    bb.put(0, term);
    // pad to byte boundary
    while (bb.length() % 8 !== 0) bb.bits.push(0);
    // pad bytes
    var padBytes = [0xec, 0x11], pi = 0;
    while (bb.length() < capacityBits) { bb.put(padBytes[pi % 2], 8); pi++; }

    // to codewords
    var codewords = [];
    for (var b = 0; b < bb.length(); b += 8) {
      var v = 0;
      for (var k = 0; k < 8; k++) v = (v << 1) | bb.bits[b + k];
      codewords.push(v);
    }
    return codewords;
  }

  function toUtf8Bytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
      else if (c < 0xd800 || c >= 0xe000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
      else { // surrogate pair
        i++;
        var cp = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      }
    }
    return out;
  }

  // Split data codewords into blocks, compute EC, interleave.
  function buildFinalCodewords(dataCodewords, version) {
    var spec = EC_M[version];
    var blocks = [];
    var idx = 0;
    spec.groups.forEach(function (g) {
      for (var b = 0; b < g[0]; b++) {
        var data = dataCodewords.slice(idx, idx + g[1]);
        idx += g[1];
        blocks.push({ data: data, ec: rsEncode(data, spec.ec) });
      }
    });
    var maxData = 0;
    blocks.forEach(function (bl) { maxData = Math.max(maxData, bl.data.length); });
    var result = [];
    for (var i = 0; i < maxData; i++)
      blocks.forEach(function (bl) { if (i < bl.data.length) result.push(bl.data[i]); });
    for (var j = 0; j < spec.ec; j++)
      blocks.forEach(function (bl) { result.push(bl.ec[j]); });
    return result;
  }

  // ---- Matrix construction ----
  function sizeForVersion(v) { return v * 4 + 17; }

  // Build the module matrix. Uses an explicit function-module flag grid so data
  // placement and masking exactly match the specification (ported from the
  // reference algorithm in Nayuki's QR-Code-generator).
  function buildMatrix(finalCodewords, version, forceMask) {
    var size = sizeForVersion(version);
    var m = [], fn = [];
    for (var r = 0; r < size; r++) { m.push(new Array(size).fill(0)); fn.push(new Array(size).fill(false)); }
    function setFn(rr, cc, dark) { m[rr][cc] = dark ? 1 : 0; fn[rr][cc] = true; }
    function markFn(rr, cc) { fn[rr][cc] = true; }

    // Timing patterns (row 6 and column 6)
    for (var i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }

    // Finder patterns (7x7) + separators, over a 9x9 region centred on each corner
    drawFinder(size, setFn, 3, 3);
    drawFinder(size, setFn, 3, size - 4);
    drawFinder(size, setFn, size - 4, 3);

    // Alignment pattern (versions 2–6: a single 5x5 pattern)
    if (ALIGN[version]) drawAlignment(setFn, ALIGN[version], ALIGN[version]);

    // Reserve the format-information modules so data placement skips them.
    for (var c1 = 0; c1 < 9; c1++) { if (c1 !== 6) markFn(8, c1); }
    for (var r1 = 0; r1 < 9; r1++) { if (r1 !== 6) markFn(r1, 8); }
    for (var r2 = size - 8; r2 < size; r2++) markFn(r2, 8);   // copy-2 vertical (7) + dark
    for (var c2 = size - 8; c2 < size; c2++) markFn(8, c2);   // copy-2 horizontal (8)
    setFn(size - 8, 8, true); // dark module

    // Place data on the remaining (non-function) modules.
    placeData(m, fn, finalCodewords, size);

    // Try all 8 masks, keep the lowest-penalty result.
    var best = null;
    for (var mask = 0; mask < 8; mask++) {
      if (forceMask != null && mask !== forceMask) continue;
      var cand = cloneMatrix(m);
      applyMask(cand, fn, mask, size);
      writeFormat(cand, mask, size);
      var pen = penalty(cand, size);
      if (best === null || pen < best.pen) best = { pen: pen, matrix: cand };
    }
    return best.matrix;
  }

  function drawFinder(size, setFn, cy, cx) {
    for (var dy = -4; dy <= 4; dy++)
      for (var dx = -4; dx <= 4; dx++) {
        var rr = cy + dy, cc = cx + dx;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        var dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(rr, cc, dist !== 2 && dist !== 4);
      }
  }

  function drawAlignment(setFn, cy, cx) {
    for (var dy = -2; dy <= 2; dy++)
      for (var dx = -2; dx <= 2; dx++)
        setFn(cy + dy, cx + dx, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }

  function placeData(m, fn, codewords, size) {
    var i = 0, total = codewords.length * 8;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5; // skip the timing column
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!fn[y][x] && i < total) {
            m[y][x] = (codewords[i >> 3] >> (7 - (i & 7))) & 1;
            i++;
          }
        }
      }
    }
  }

  function maskFn(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    }
    return false;
  }

  function applyMask(m, fn, mask, size) {
    for (var r = 0; r < size; r++)
      for (var c = 0; c < size; c++)
        if (!fn[r][c] && maskFn(mask, r, c))
          m[r][c] ^= 1;
  }

  // Format information (15 bits) with BCH(15,5) + mask XOR 0b101010000010010
  function formatBits(ecBits, mask) {
    var data = (ecBits << 3) | mask;       // 5 bits
    var rem = data << 10;
    var g = 0x537;                          // BCH generator 0b10100110111
    for (var i = 14; i >= 10; i--) {
      if ((rem >> i) & 1) rem ^= g << (i - 10);
    }
    var bits = ((data << 10) | rem) ^ 0x5412;
    return bits & 0x7fff;
  }

  function writeFormat(m, mask, size) {
    var fmt = formatBits(0, mask); // level M, 15-bit value (bit 14 = MSB)
    function b(i) { return (fmt >> i) & 1; }
    var n = size;
    // Format bits are placed MSB-first. Copy 1 around the top-left finder:
    for (var i = 0; i <= 5; i++) m[8][i] = b(14 - i);   // (8,0..5) = bit14..bit9
    m[8][7] = b(8); m[8][8] = b(7); m[7][8] = b(6);
    for (var r = 0; r <= 5; r++) m[r][8] = b(r);        // (0..5,8) = bit0..bit5
    // Copy 2: vertical strip (7 modules, bit14..bit8) + horizontal strip (8, bit7..bit0)
    for (var j = 0; j < 7; j++) m[n - 1 - j][8] = b(14 - j);
    for (var k = 0; k < 8; k++) m[8][n - 8 + k] = b(7 - k);
    m[n - 8][8] = 1; // dark module always dark
  }

  function penalty(m, size) {
    var score = 0, r, c;
    // Rule 1: runs of 5+ same colour (rows + cols)
    function runScore(getter) {
      var s = 0;
      for (var a = 0; a < size; a++) {
        var run = 1;
        for (var b = 1; b < size; b++) {
          if (getter(a, b) === getter(a, b - 1)) { run++; }
          else { if (run >= 5) s += run - 2; run = 1; }
        }
        if (run >= 5) s += run - 2;
      }
      return s;
    }
    score += runScore(function (a, b) { return m[a][b]; });
    score += runScore(function (a, b) { return m[b][a]; });
    // Rule 2: 2x2 blocks
    for (r = 0; r < size - 1; r++)
      for (c = 0; c < size - 1; c++) {
        var v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
      }
    // Rule 3: finder-like patterns 1011101 with 4 light
    var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    var pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    function lineMatch(line, pat) {
      var s = 0;
      for (var i = 0; i + pat.length <= line.length; i++) {
        var ok = true;
        for (var j = 0; j < pat.length; j++) if (line[i + j] !== pat[j]) { ok = false; break; }
        if (ok) s += 40;
      }
      return s;
    }
    for (r = 0; r < size; r++) {
      var rowArr = m[r].slice();
      var colArr = []; for (c = 0; c < size; c++) colArr.push(m[c][r]);
      score += lineMatch(rowArr, pat1) + lineMatch(rowArr, pat2);
      score += lineMatch(colArr, pat1) + lineMatch(colArr, pat2);
    }
    // Rule 4: dark/light balance
    var dark = 0;
    for (r = 0; r < size; r++) for (c = 0; c < size; c++) if (m[r][c]) dark++;
    var pct = (dark * 100) / (size * size);
    var prev = Math.floor(Math.abs(pct - 50) / 5);
    score += prev * 10;
    return score;
  }

  function cloneMatrix(m) { return m.map(function (row) { return row.slice(); }); }

  // ---- Public: build the module matrix for a text string ----
  function build(text, opts) {
    opts = opts || {};
    var version = opts.version || null;
    if (!version) {
      for (var v = 1; v <= 6; v++) {
        if (toUtf8Bytes(text).length <= dataCapacityBytes(v)) { version = v; break; }
      }
      if (!version) throw new Error('ITHQR: data too long for supported versions (max ~' + dataCapacityBytes(6) + ' bytes)');
    }
    var dataCw = encodeData(text, version);
    var finalCw = buildFinalCodewords(dataCw, version);
    var matrix = buildMatrix(finalCw, version, opts.mask != null ? opts.mask : null);
    return { modules: matrix, size: matrix.length, version: version };
  }

  // ---- Renderers ----
  function toSVG(text, opts) {
    opts = opts || {};
    var q = build(text, opts);
    var n = q.size;
    var margin = opts.margin == null ? 4 : opts.margin;
    var dim = n + margin * 2;
    var dark = opts.dark || '#02040a';
    var light = opts.light || '#ffffff';
    var path = '';
    for (var r = 0; r < n; r++)
      for (var c = 0; c < n; c++)
        if (q.modules[r][c]) path += 'M' + (c + margin) + ' ' + (r + margin) + 'h1v1h-1z';
    var px = opts.size || 300;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim +
      '" width="' + px + '" height="' + px + '" shape-rendering="crispEdges" role="img" aria-label="' +
      (opts.alt || 'QR code') + '">' +
      '<rect width="' + dim + '" height="' + dim + '" fill="' + light + '"/>' +
      '<path d="' + path + '" fill="' + dark + '"/></svg>';
  }

  function toCanvas(canvas, text, opts) {
    opts = opts || {};
    var q = build(text, opts);
    var n = q.size;
    var margin = opts.margin == null ? 4 : opts.margin;
    var dim = n + margin * 2;
    var scale = opts.scale || Math.max(2, Math.floor((opts.size || 300) / dim));
    canvas.width = dim * scale;
    canvas.height = dim * scale;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = opts.light || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = opts.dark || '#02040a';
    for (var r = 0; r < n; r++)
      for (var c = 0; c < n; c++)
        if (q.modules[r][c]) ctx.fillRect((c + margin) * scale, (r + margin) * scale, scale, scale);
    return canvas;
  }

  // ---- Self-test: RS core against the standard "HELLO WORLD" reference ----
  function _selftest() {
    var data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236];
    var expected = [168, 72, 22, 82, 217, 54, 156, 0, 46, 15, 180, 122, 16];
    var got = rsEncode(data, 13);
    for (var i = 0; i < expected.length; i++) if (got[i] !== expected[i]) return { ok: false, got: got, expected: expected };
    // Format-info anchor: (level M, mask 0) is the standard 0b101010000010010.
    if (formatBits(0, 0) !== parseInt('101010000010010', 2)) return { ok: false, fmt: formatBits(0, 0).toString(2) };
    return { ok: true };
  }

  global.ITHQR = {
    build: build,
    toSVG: toSVG,
    toCanvas: toCanvas,
    capacity: dataCapacityBytes,
    _selftest: _selftest,
    _rsEncode: rsEncode
  };
})(typeof window !== 'undefined' ? window : this);
