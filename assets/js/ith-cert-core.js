/*!
 * ith-cert-core.js — Certificate & Results core engine (front-end only).
 *
 * Shared, dependency-free logic for the Inspire Talent Hub certificate & results
 * system. Handles record normalisation, multi-field search, deterministic
 * Certificate-ID generation, verification lookups, validation and CSV parsing.
 *
 * Data source: window.ITH_CERT_DB — either an array of records, or
 *   { meta: {...}, records: [...] }. Loaded from data/certificates.js (the
 *   published dataset) which an admin regenerates via the import tool.
 *
 * No backend. All data shipped to the page is, by definition, visible to the
 * client; the dataset therefore contains only the fields needed to display a
 * result and a certificate — never sensitive personal data.
 */
(function (global) {
  'use strict';

  var SITE = 'https://www.Inspiretalenthub.in/';
  var VERIFY_PAGE = 'verifycertificate.html';

  // ---- Certificate-ID configuration ----------------------------------------
  // Format: ITH-<YEAR>-<COMPCODE>-<HASH6>  e.g. ITH-2026-POETRY-A7F3K9
  var ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32 (no I L O U)

  // Curated competition → short code map (extend as competitions are added).
  var COMP_CODES = {
    'poetry writing competition': 'POETRY',
    'essay writing competition': 'ESSAY',
    'story writing competition': 'STORY',
    'creative writing competition': 'WRITE',
    'meme design competition': 'MEME',
    'magazine design competition': 'MAGZN',
    'canva design contest': 'CANVA',
    'filmmaking competition': 'FILM',
    'ecorise business blueprint': 'ECORISE',
    'ecovision 3d challenge': 'ECO3D',
    'futuretech league': 'FUTECH',
    'atl innovators lab': 'ATLINV',
    'mathematics quiz': 'MATHQZ',
    'science quiz': 'SCIQZ',
    'current affairs quiz': 'CAQZ'
  };

  function competitionCode(name) {
    var key = String(name || '').trim().toLowerCase();
    if (COMP_CODES[key]) return COMP_CODES[key];
    // Fallback: distinctive uppercase alphanumerics, dropping filler words.
    var filler = /\b(competition|contest|challenge|the|of|and|writing|quiz|league|design)\b/gi;
    var base = String(name || '').replace(filler, ' ').replace(/[^A-Za-z0-9]+/g, ' ').trim();
    if (!base) base = String(name || '').replace(/[^A-Za-z0-9]+/g, '');
    var code = base.toUpperCase().replace(/\s+/g, '').slice(0, 6);
    return code || 'GEN';
  }

  // Small deterministic string hash (xmur3) → 6 base32 chars.
  function hash6(str, salt) {
    var s = String(salt || '') + '' + String(str || '');
    var h = 1779033703 ^ s.length;
    for (var i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    var h1 = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
    var h2 = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    var out = '';
    for (var c = 0; c < 6; c++) {
      var word = c < 3 ? h1 : h2;
      out += ID_ALPHABET[(word >>> ((c % 3) * 5)) & 31];
    }
    return out;
  }

  // Generate a Certificate ID from record fields. Deterministic given the same
  // inputs + salt; the salt lets the importer resolve the rare hash collision.
  function makeCertId(year, competition, seedParts, salt) {
    var seed = [].concat(seedParts || []).join('|');
    return 'ITH-' + String(year) + '-' + competitionCode(competition) + '-' + hash6(seed, salt);
  }

  function isValidCertIdFormat(id) {
    return /^ITH-\d{4}-[A-Z0-9]{2,8}-[0-9A-HJ-NP-TV-Z]{6}$/.test(String(id || '').trim().toUpperCase());
  }

  // ---- Data access ----------------------------------------------------------
  function rawDb() {
    var db = global.ITH_CERT_DB;
    if (!db) return { meta: {}, records: [] };
    if (Array.isArray(db)) return { meta: {}, records: db };
    return { meta: db.meta || {}, records: db.records || [] };
  }

  function bool(v, dflt) {
    if (v === undefined || v === null || v === '') return dflt === undefined ? false : dflt;
    if (typeof v === 'boolean') return v;
    var s = String(v).trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === 'y' || s === '1' || s === 'available';
  }

  function normalizeRecord(r) {
    var rec = {
      certId: String(r.certId || r.certificateId || '').trim(),
      regNo: String(r.regNo || r.registrationNumber || r.registration || '').trim(),
      name: String(r.name || r.participantName || r.fullName || '').trim(),
      email: String(r.email || '').trim(),
      school: String(r.school || r.schoolName || '').trim(),
      competition: String(r.competition || r.competitionName || r.event || '').trim(),
      category: String(r.category || '').trim(),
      year: String(r.year || '').trim(),
      participationStatus: String(r.participationStatus || 'Participated').trim(),
      resultStatus: String(r.resultStatus || r.result || 'Participant').trim(),
      rank: String(r.rank || '').trim(),
      issueDate: String(r.issueDate || r.date || '').trim(),
      certificateAvailable: bool(r.certificateAvailable !== undefined ? r.certificateAvailable : r.certificate, true)
    };
    return rec;
  }

  var _cache = null;
  function records() {
    if (_cache) return _cache;
    _cache = rawDb().records.map(normalizeRecord);
    return _cache;
  }
  function meta() { return rawDb().meta; }
  function reset() { _cache = null; }

  function resultsPublished() {
    var m = meta();
    return m.resultsPublished === undefined ? records().length > 0 : !!m.resultsPublished;
  }
  function downloadsEnabled() {
    var m = meta();
    return m.downloadsEnabled === undefined ? true : !!m.downloadsEnabled;
  }

  // ---- Search ---------------------------------------------------------------
  function norm(s) { return String(s || '').trim().toLowerCase(); }

  // query: { regNo, certId, name, email, school, competition, year }
  // AND across all provided (non-empty) fields. Identifiers match exactly
  // (case-insensitive); name/school/competition match as case-insensitive
  // substring; year matches exactly.
  function search(query) {
    query = query || {};
    var provided = {};
    ['regNo', 'certId', 'name', 'email', 'school', 'competition', 'year'].forEach(function (k) {
      if (query[k] != null && String(query[k]).trim() !== '') provided[k] = norm(query[k]);
    });
    if (Object.keys(provided).length === 0) return { ok: false, reason: 'empty', results: [] };

    var exact = { regNo: 1, certId: 1, email: 1, year: 1 };
    var results = records().filter(function (rec) {
      return Object.keys(provided).every(function (k) {
        var q = provided[k];
        var v = norm(rec[k]);
        if (k === 'year') return v === q;
        if (exact[k]) return v === q;
        return v.indexOf(q) !== -1; // substring for name/school/competition
      });
    });
    return { ok: true, results: results };
  }

  function findByCertId(id) {
    var q = norm(id);
    if (!q) return null;
    var hit = records().filter(function (r) { return norm(r.certId) === q; });
    return hit.length ? hit[0] : null;
  }

  // ---- Eligibility / URLs ---------------------------------------------------
  function certificateEligible(rec) {
    return !!(rec && rec.certId && rec.certificateAvailable && downloadsEnabled() && resultsPublished());
  }
  function verifyUrl(certId) { return SITE + VERIFY_PAGE + '?id=' + encodeURIComponent(certId); }
  function certificateUrl(certId) { return 'certificate.html?id=' + encodeURIComponent(certId); }

  // ---- Validation (used by the admin importer) ------------------------------
  var REQUIRED = ['name', 'competition', 'year'];
  function validateRow(row, index) {
    var errors = [];
    REQUIRED.forEach(function (f) {
      if (!String(row[f] || '').trim()) errors.push('Missing ' + f);
    });
    var y = String(row.year || '').trim();
    if (y && !/^\d{4}$/.test(y)) errors.push('Year must be 4 digits');
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.email).trim())) errors.push('Invalid email');
    return { row: index, ok: errors.length === 0, errors: errors };
  }

  // ---- CSV parsing (RFC-4180-ish: quotes, commas, newlines) ------------------
  function parseCSV(text) {
    var rows = [], row = [], field = '', i = 0, inQuotes = false;
    text = String(text).replace(/^﻿/, ''); // strip BOM
    while (i < text.length) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        }
        field += ch; i++; continue;
      }
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(field); field = ''; i++; continue; }
      if (ch === '\r') { i++; continue; }
      if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += ch; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
  }

  // Map a header row + data rows to record objects using a flexible alias map.
  var HEADER_ALIASES = {
    regno: 'regNo', registrationnumber: 'regNo', registration: 'regNo', 'reg no': 'regNo', 'reg. no': 'regNo',
    certid: 'certId', certificateid: 'certId', 'certificate id': 'certId',
    name: 'name', participantname: 'name', fullname: 'name', 'participant name': 'name',
    email: 'email', 'email address': 'email',
    school: 'school', schoolname: 'school', 'school name': 'school',
    competition: 'competition', competitionname: 'competition', event: 'competition', 'competition name': 'competition',
    category: 'category', grade: 'category', 'grade band': 'category',
    year: 'year',
    participationstatus: 'participationStatus', 'participation status': 'participationStatus', status: 'participationStatus',
    resultstatus: 'resultStatus', result: 'resultStatus', 'result status': 'resultStatus',
    rank: 'rank', position: 'rank',
    issuedate: 'issueDate', date: 'issueDate', 'issue date': 'issueDate',
    certificateavailable: 'certificateAvailable', certificate: 'certificateAvailable', 'certificate available': 'certificateAvailable'
  };
  function rowsToRecords(rows) {
    if (!rows.length) return [];
    var header = rows[0].map(function (h) { return String(h).trim().toLowerCase().replace(/[_-]+/g, ''); });
    var fields = header.map(function (h) { return HEADER_ALIASES[h] || HEADER_ALIASES[h.replace(/\s+/g, '')] || null; });
    var out = [];
    for (var r = 1; r < rows.length; r++) {
      var obj = {};
      for (var c = 0; c < rows[r].length; c++) {
        if (fields[c]) obj[fields[c]] = String(rows[r][c]).trim();
      }
      out.push(obj);
    }
    return out;
  }

  global.ITHCert = {
    // config
    SITE: SITE,
    // data
    records: records, meta: meta, reset: reset,
    resultsPublished: resultsPublished, downloadsEnabled: downloadsEnabled,
    // search / lookup
    search: search, findByCertId: findByCertId,
    // eligibility / urls
    certificateEligible: certificateEligible, verifyUrl: verifyUrl, certificateUrl: certificateUrl,
    // id generation
    competitionCode: competitionCode, makeCertId: makeCertId, isValidCertIdFormat: isValidCertIdFormat,
    // import / validation
    validateRow: validateRow, parseCSV: parseCSV, rowsToRecords: rowsToRecords,
    normalizeRecord: normalizeRecord
  };
})(typeof window !== 'undefined' ? window : this);
