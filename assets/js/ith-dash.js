/* Inspire Talent Hub — Study Hub student dashboard (device-local, no backend).
 * Progress, streaks, daily goal, weak-topic detection, recommendations,
 * bookmarks, competency & subject analytics, recent activity, continue-where-
 * you-left-off. All state lives in localStorage. Exposes window.ITHDash, used by
 * ith-study.js (which records attempts and provides navigation via ITHStudy).
 */
(function () {
  'use strict';
  var K_STATS = 'ith_stats', K_BM = 'ith_bookmarks', K_GOAL = 'ith_goal', K_LAST = 'ith_last';
  var GOAL_DEFAULT = 20;

  function lget(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function icon(n, sz) { sz = sz || 20; return '<svg width="' + sz + '" height="' + sz + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-' + n + '"></use></svg>'; }
  function dayKey(ts) { var d = new Date(ts); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }

  function stats() { return lget(K_STATS, []); }
  function bookmarks() { return lget(K_BM, {}); }
  function goal() { return lget(K_GOAL, { target: GOAL_DEFAULT }); }

  // ---- public: record an attempt ----
  function record(e) {
    if (!e) return;
    if (e.elapsed && e.elapsed > 6000) e.elapsed = Math.round(e.elapsed / 1000); // normalise ms -> s
    var arr = stats(); arr.push(e); lset(K_STATS, arr.slice(-600));
  }
  function setLast(e) { if (e) lset(K_LAST, e); }
  function getLast() { return lget(K_LAST, null); }

  // ---- public: bookmarks ----
  function isBookmarked(key) { return !!bookmarks()[key]; }
  function toggleBookmark(e) {
    var bm = bookmarks();
    if (bm[e.key]) { delete bm[e.key]; lset(K_BM, bm); return false; }
    e.ts = Date.now(); bm[e.key] = e; lset(K_BM, bm); return true;
  }
  function listBookmarks() { var bm = bookmarks(); return Object.keys(bm).map(function (k) { return bm[k]; }).sort(function (a, b) { return b.ts - a.ts; }); }

  // ---- public: per-chapter progress ----
  function chapterProgress(key) {
    var best = 0, last = 0, n = 0, c = 0, t = 0;
    stats().forEach(function (r) { if (r.key === key) { n++; best = Math.max(best, r.pct); last = r.pct; c += r.correct; t += r.total; } });
    return { attempts: n, best: best, last: last, avg: pct(c, t), mastered: n > 0 && best >= 85 };
  }
  function hasActivity() { return stats().length > 0 || listBookmarks().length > 0 || !!getLast(); }

  // ---- analytics summary ----
  function summarize() {
    var S = { qs: 0, correct: 0, time: 0, compT: 0, compC: 0, byKey: {}, bySubj: {}, days: {}, n: 0 };
    stats().forEach(function (r) {
      S.n++; S.qs += r.total || 0; S.correct += r.correct || 0; S.time += r.elapsed || 0;
      S.compT += r.compTotal || 0; S.compC += r.compCorrect || 0;
      var dk = dayKey(r.ts); S.days[dk] = (S.days[dk] || 0) + (r.total || 0);
      var b = S.byKey[r.key] || (S.byKey[r.key] = { attempts: 0, best: 0, last: 0, correct: 0, total: 0, chapter: r.chapter, subjectName: r.subjectName, board: r.board, grade: r.grade, subjectId: r.subjectId, key: r.key, ts: 0 });
      b.attempts++; b.best = Math.max(b.best, r.pct); b.last = r.pct; b.correct += r.correct || 0; b.total += r.total || 0; b.ts = Math.max(b.ts, r.ts);
      var sk = r.board + '|' + r.grade + '|' + r.subjectId;
      var su = S.bySubj[sk] || (S.bySubj[sk] = { name: r.subjectName, board: r.board, grade: r.grade, subjectId: r.subjectId, correct: 0, total: 0, chapters: {} });
      su.correct += r.correct || 0; su.total += r.total || 0; su.chapters[r.key] = 1;
    });
    return S;
  }
  function streak(days) {
    var d = new Date();
    if (!days[dayKey(d)]) { d.setDate(d.getDate() - 1); if (!days[dayKey(d)]) return 0; }
    var n = 0; while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n;
  }
  function fmtTime(sec) {
    if (!sec) return '0m';
    var h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    return h ? (h + 'h ' + m + 'm') : (m + 'm');
  }
  function chapterList(S) { return Object.keys(S.byKey).map(function (k) { return S.byKey[k]; }); }

  // ---- rendering ----
  function statTile(ic, val, label, tone) {
    return '<div class="dash-stat dash-stat--' + (tone || 'default') + '"><span class="dash-stat__ic">' + icon(ic, 22) + '</span>' +
      '<span class="dash-stat__val">' + val + '</span><span class="dash-stat__lbl">' + esc(label) + '</span></div>';
  }
  function ring(percent, center) {
    var r = 34, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, percent)) / 100);
    return '<svg class="dash-ring" width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">' +
      '<circle cx="42" cy="42" r="' + r + '" class="dash-ring__bg"/>' +
      '<circle cx="42" cy="42" r="' + r + '" class="dash-ring__fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '<text x="42" y="47" text-anchor="middle" class="dash-ring__t">' + center + '</text></svg>';
  }
  function bar(percent, tone) {
    return '<span class="dash-bar"><span class="dash-bar__fill dash-bar__fill--' + (tone || 'ok') + '" style="width:' + Math.max(3, Math.min(100, percent)) + '%"></span></span>';
  }
  function tone(p) { return p >= 85 ? 'gold' : p >= 60 ? 'ok' : 'weak'; }

  function render(host) {
    if (!host) return;
    var S = summarize();
    var acc = pct(S.correct, S.qs);
    var g = goal(), today = S.days[dayKey(Date.now())] || 0, gp = pct(today, g.target);
    var str = streak(S.days);
    var chs = chapterList(S);
    var weak = chs.filter(function (c) { return c.total >= 4 && pct(c.correct, c.total) < 60; }).sort(function (a, b) { return pct(a.correct, a.total) - pct(b.correct, b.total); });
    var strong = chs.filter(function (c) { return pct(c.correct, c.total) >= 85 && c.total >= 4; }).sort(function (a, b) { return pct(b.correct, b.total) - pct(a.correct, a.total); });
    var subs = Object.keys(S.bySubj).map(function (k) { return S.bySubj[k]; }).sort(function (a, b) { return b.total - a.total; });
    var recent = stats().slice(-8).reverse();
    var compPct = pct(S.compC, S.compT);
    var last = getLast();
    var bms = listBookmarks();
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    var h = '';
    // Header
    h += '<div class="dash-top">' +
      '<div><h2 class="dash-hi">' + greet + ', <span class="text-gold">learner</span></h2>' +
      '<p class="dash-sub">Your progress is saved privately on this device.</p></div>' +
      '<div class="dash-streak" title="Consecutive days studied">' + icon('star', 18) + '<b>' + str + '</b><span>day' + (str === 1 ? '' : 's') + ' streak</span></div>' +
      '</div>';

    // Continue where you left off
    if (last) {
      h += '<div class="dash-continue">' +
        '<div class="dash-continue__txt"><span class="dash-continue__k">Continue where you left off</span>' +
        '<b>' + esc(last.chapter) + '</b><span class="dash-continue__m">' + (last.board || '').toUpperCase() + ' · Class ' + last.grade + ' · ' + esc(last.subjectName || '') + '</span></div>' +
        '<div class="dash-continue__act">' +
        '<button type="button" class="btn btn-gold hover-target" data-open=\'' + esc(JSON.stringify(last)) + '\'><span>Resume</span></button>' +
        '<button type="button" class="btn btn-outline text-gold hover-target" data-test=\'' + esc(JSON.stringify(last)) + '\'><span>Practice test</span></button>' +
        '</div></div>';
    }

    // Stat row
    h += '<div class="dash-stats">' +
      statTile('chart', acc + '%', 'Overall accuracy', tone(acc)) +
      statTile('check', S.qs, 'Questions answered', 'default') +
      statTile('clock', fmtTime(S.time), 'Time studied', 'default') +
      statTile('grad', Object.keys(S.byKey).length, 'Chapters practised', 'default') +
      '</div>';

    // Goal + competency
    h += '<div class="dash-grid2">';
    h += '<div class="dash-card"><div class="dash-card__head"><h3>Today\'s goal</h3>' +
      '<button type="button" class="dash-mini hover-target" data-goal>Edit</button></div>' +
      '<div class="dash-goal">' + ring(gp, today + '/' + g.target) +
      '<div class="dash-goal__txt"><b>' + today + ' of ' + g.target + ' questions</b>' +
      '<span>' + (gp >= 100 ? 'Goal reached — great work! 🎉' : 'Answer ' + Math.max(0, g.target - today) + ' more to hit today\'s goal.') + '</span></div></div></div>';
    h += '<div class="dash-card"><div class="dash-card__head"><h3>Competency performance</h3></div>' +
      '<div class="dash-goal">' + ring(compPct, compPct + '%') +
      '<div class="dash-goal__txt"><b>Application &amp; reasoning</b>' +
      '<span>' + (S.compT ? 'You score ' + compPct + '% on competency-based questions (' + S.compC + '/' + S.compT + ').' : 'Take a test to measure your higher-order skills.') + '</span></div></div></div>';
    h += '</div>';

    // Weak topics & recommendations
    h += '<div class="dash-card"><div class="dash-card__head"><h3>What to revise next</h3><span class="dash-card__note">Smart suggestions from your results</span></div>';
    if (weak.length) {
      h += '<ul class="dash-weak">';
      weak.slice(0, 5).forEach(function (c) {
        var p = pct(c.correct, c.total);
        h += '<li><div class="dash-weak__info"><b>' + esc(c.chapter) + '</b><span>Class ' + c.grade + ' · ' + esc(c.subjectName) + ' · accuracy ' + p + '%</span>' + bar(p, 'weak') + '</div>' +
          '<div class="dash-weak__act">' +
          '<button type="button" class="dash-chip hover-target" data-open=\'' + esc(JSON.stringify(c)) + '\'>Revise</button>' +
          '<button type="button" class="dash-chip dash-chip--gold hover-target" data-retry=\'' + esc(JSON.stringify(c)) + '\'>Retry wrong</button>' +
          '</div></li>';
      });
      h += '</ul>';
    } else {
      h += '<p class="dash-empty">' + (S.n ? 'No weak areas yet — keep practising to build a full picture.' : 'Take a few practice tests and personalised revision tips will appear here.') + '</p>';
    }
    h += '</div>';

    // Subject progress
    if (subs.length) {
      h += '<div class="dash-card"><div class="dash-card__head"><h3>Subject progress</h3></div><ul class="dash-subs">';
      subs.forEach(function (su) {
        var p = pct(su.correct, su.total), nc = Object.keys(su.chapters).length;
        h += '<li><button type="button" class="dash-subs__btn hover-target" data-subj=\'' + esc(JSON.stringify({ board: su.board, grade: su.grade, subjectId: su.subjectId })) + '\' aria-label="Open ' + esc(su.name) + ', Class ' + su.grade + ', ' + p + '% accuracy">' +
          '<div class="dash-subs__row"><b>' + esc(su.name) + '</b><span>Class ' + su.grade + ' · ' + nc + ' chapter' + (nc === 1 ? '' : 's') + ' · ' + p + '%</span></div>' + bar(p, tone(p)) + '</button></li>';
      });
      h += '</ul></div>';
    }

    // Strong topics + Bookmarks (two columns)
    h += '<div class="dash-grid2">';
    h += '<div class="dash-card"><div class="dash-card__head"><h3>Your strong topics</h3></div>';
    if (strong.length) { h += '<ul class="dash-taglist">' + strong.slice(0, 6).map(function (c) { return '<li class="dash-tag dash-tag--gold">' + icon('medal', 14) + esc(c.chapter) + ' · ' + pct(c.correct, c.total) + '%</li>'; }).join('') + '</ul>'; }
    else { h += '<p class="dash-empty">Score 85%+ in a chapter to see it here.</p>'; }
    h += '</div>';
    h += '<div class="dash-card"><div class="dash-card__head"><h3>Bookmarked chapters</h3></div>';
    if (bms.length) {
      h += '<ul class="dash-bms">' + bms.slice(0, 8).map(function (b) {
        return '<li><button type="button" class="dash-chip hover-target" data-open=\'' + esc(JSON.stringify(b)) + '\'>' + icon('star', 14) + esc(b.chapter) + '</button></li>';
      }).join('') + '</ul>';
    } else { h += '<p class="dash-empty">Tap the ☆ Bookmark button on any chapter to pin it here.</p>'; }
    h += '</div>';
    h += '</div>';

    // Recent activity
    if (recent.length) {
      h += '<div class="dash-card"><div class="dash-card__head"><h3>Recent activity</h3></div><ul class="dash-recent">';
      recent.forEach(function (r) {
        h += '<li><span class="dash-recent__dot dash-recent__dot--' + tone(r.pct) + '"></span>' +
          '<span class="dash-recent__ch">' + esc(r.chapter) + '</span>' +
          '<span class="dash-recent__meta">Class ' + r.grade + ' · ' + esc(r.subjectName || '') + '</span>' +
          '<b class="dash-recent__score">' + r.correct + '/' + r.total + ' · ' + r.pct + '%</b></li>';
      });
      h += '</ul></div>';
    }

    host.innerHTML = h;
    wire(host);
  }

  function parse(el, attr) { try { return JSON.parse(el.getAttribute(attr)); } catch (e) { return null; } }
  function wire(host) {
    var ST = window.ITHStudy || {};
    host.querySelectorAll('[data-open]').forEach(function (b) { b.addEventListener('click', function () { ST.openChapter && ST.openChapter(parse(b, 'data-open')); }); });
    host.querySelectorAll('[data-test]').forEach(function (b) { b.addEventListener('click', function () { ST.openTest && ST.openTest(parse(b, 'data-test')); }); });
    host.querySelectorAll('[data-retry]').forEach(function (b) { b.addEventListener('click', function () { ST.retryWrong && ST.retryWrong(parse(b, 'data-retry')); }); });
    host.querySelectorAll('[data-subj]').forEach(function (b) { b.addEventListener('click', function () { var s = parse(b, 'data-subj'); ST.openSubject && ST.openSubject(s.board, s.grade, s.subjectId); }); });
    var gb = host.querySelector('[data-goal]');
    if (gb) gb.addEventListener('click', function () {
      var cur = goal().target;
      var v = window.prompt('Set your daily practice goal (questions per day):', cur);
      var n = parseInt(v, 10);
      if (n && n > 0 && n <= 500) { lset(K_GOAL, { target: n }); render(host); }
    });
  }

  window.ITHDash = {
    record: record, setLast: setLast, getLast: getLast,
    isBookmarked: isBookmarked, toggleBookmark: toggleBookmark, listBookmarks: listBookmarks,
    chapterProgress: chapterProgress, hasActivity: hasActivity, renderDashboard: render
  };
})();
