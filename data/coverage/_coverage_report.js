/* Internal coverage report generator for a chapter question bank.
 * Usage: node coverage_report.js
 * Loads the qbank files, then reports for the target chapter:
 *   - counts by type
 *   - difficulty distribution (foundational / intermediate / advanced)
 *   - competency percentage
 *   - subtopic coverage vs an NCERT subtopic map (flags weak areas)
 *   - near-duplicate stem detection (paraphrase guard)
 *   - Gold-Standard pass/fail summary against target ranges.
 */
global.window = {};
var files = ['', 'b', 'c', 'd', 'e', 'f'].map(function (x) { return '/home/user/ith/data/qbank-science-10' + x + '.js'; });
files.push('/home/user/ith/data/qbank-science-10-cre-ext1.js');
files.push('/home/user/ith/data/qbank-science-10-cre-ext2.js');
files.push('/home/user/ith/data/qbank-science-10-cre-ext3.js');
files.forEach(function (f) { require(f); });

var KEY = process.argv[2] || 'cbse|10|science|chemical-reactions-and-equations';
var TITLE = 'Chemical Reactions and Equations';
var b = window.ITH_QBANK[KEY];

// ---- Target ranges (revised quality target) ----
var TARGET = { mcq: [100, 150], ar: [25, 40], vsa: [30, 50], sa: [40, 60], ma: [30, 40], la: [25, 35], cs: [20, 30] };

// ---- NCERT subtopic map: subtopic -> keywords (lowercase) ----
var SUBTOPICS = {
  'Chemical change & signs of reaction': ['chemical change', 'physical change', 'new substance', 'sign', 'effervescence', 'change in colour', 'change in temperature', 'change of state'],
  'Writing & balancing equations': ['balance', 'balanced', 'skeletal', 'coefficient', 'word equation'],
  'State symbols & conditions': ['(aq)', '(g)', '(s)', '(l)', 'state symbol', 'catalyst', 'over the arrow', 'reversible', '⇌'],
  'Law of conservation of mass': ['conservation of mass', 'lavoisier', 'closed', 'sealed', 'open vessel', 'open dish'],
  'Quantitative / mole reasoning': ['mole', 'moles', 'calculate', 'mass of', 'g of', 'how many'],
  'Combination reactions': ['combination'],
  'Decomposition (thermal/electrolytic/photolytic)': ['decomposition', 'thermal', 'electroly', 'photochemical', 'photolytic', 'sunlight', 'ferrous sulphate', 'lead nitrate', 'silver chloride', 'calcium carbonate', 'kclo'],
  'Displacement & reactivity': ['displacement', 'displace', 'reactivity', 'iron nail', 'more reactive'],
  'Double displacement & precipitation': ['double displacement', 'precipitat', 'barium sulphate', 'lead iodide', 'ion'],
  'Oxidation-reduction (redox) & agents': ['oxidation', 'reduction', 'redox', 'oxidising agent', 'reducing agent', 'oxidised', 'reduced', 'gain of oxygen', 'loss of oxygen'],
  'Corrosion': ['corrosion', 'rust', 'tarnish', 'silver sulphide', 'basic copper carbonate', 'galvanis'],
  'Rancidity & food preservation': ['rancid', 'antioxidant', 'nitrogen', 'fats and oils', 'refrigerat'],
  'Exothermic & endothermic': ['exothermic', 'endothermic', 'heat is released', 'absorbs heat', 'quicklime', 'respiration', 'photosynthesis']
};

function textOf(item) {
  var t = [];
  if (item.q) t.push(item.q);
  if (item.A) t.push(item.A);
  if (item.R) t.push(item.R);
  if (item.a && typeof item.a === 'string') t.push(item.a);
  if (item.e) t.push(item.e);
  if (item.o) t.push(item.o.join(' '));
  if (item.k) t.push(item.k.join(' '));
  if (item.p) t.push(item.p);
  if (item.q && Array.isArray(item.q)) item.q.forEach(function (s) { t.push(s.q + ' ' + s.a); });
  return t.join(' ').toLowerCase();
}

// Flatten all items with a type + difficulty + competency tag
var items = [];
function push(type, arr, diffFn, compFn) {
  (arr || []).forEach(function (it) { items.push({ type: type, it: it, text: textOf(it), diff: diffFn(it), comp: compFn(it) }); });
}
push('mcq', b.mcq, function (m) { return m.d === 1 ? 'F' : m.d === 3 ? 'A' : 'I'; }, function (m) { return !!m.comp; });
push('ar', b.ar, function () { return 'A'; }, function () { return true; });
push('vsa', b.vsa, function () { return 'F'; }, function () { return false; });
push('sa', b.sa, function () { return 'I'; }, function () { return false; });
push('ma', b.ma, function () { return 'A'; }, function () { return true; });
push('la', b.la, function () { return 'A'; }, function () { return true; });
push('cs', b.cs, function () { return 'A'; }, function () { return true; });

// ---- Counts by type ----
var counts = {};
['mcq', 'ar', 'vsa', 'sa', 'ma', 'la', 'cs'].forEach(function (t) { counts[t] = (b[t] || []).length; });
var totalItems = items.length;
var csSub = (b.cs || []).reduce(function (n, c) { return n + c.q.length; }, 0);

// ---- Difficulty distribution ----
var diff = { F: 0, I: 0, A: 0 };
items.forEach(function (x) { diff[x.diff]++; });

// ---- Competency ----
var comp = items.filter(function (x) { return x.comp; }).length;

// ---- Subtopic coverage ----
var cov = {};
Object.keys(SUBTOPICS).forEach(function (st) {
  var kws = SUBTOPICS[st];
  var n = items.filter(function (x) { return kws.some(function (k) { return x.text.indexOf(k) !== -1; }); }).length;
  cov[st] = n;
});

// ---- Near-duplicate (paraphrase) detection on stems ----
function normTokens(s) { return (s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean); }
function jaccard(a, b) { var A = new Set(a), B = new Set(b); var inter = 0; A.forEach(function (x) { if (B.has(x)) inter++; }); return inter / (A.size + B.size - inter || 1); }
var stems = [];
['mcq', 'vsa', 'sa', 'ma', 'la'].forEach(function (t) { (b[t] || []).forEach(function (it) { stems.push({ t: t, q: it.q }); }); });
(b.ar || []).forEach(function (it) { stems.push({ t: 'ar', q: it.A + ' ' + it.R }); });
var dups = [];
for (var i = 0; i < stems.length; i++) {
  for (var j = i + 1; j < stems.length; j++) {
    var sim = jaccard(normTokens(stems[i].q), normTokens(stems[j].q));
    if (sim >= 0.82) dups.push({ sim: sim.toFixed(2), a: stems[i].q.slice(0, 60), c: stems[j].q.slice(0, 60) });
  }
}

// ---- Print report ----
function bar(n, max) { var w = Math.round((n / max) * 24); return '█'.repeat(w) + '·'.repeat(24 - w); }
console.log('\n==================================================================');
console.log(' INTERNAL COVERAGE REPORT — ' + TITLE);
console.log(' key: ' + KEY);
console.log('==================================================================\n');

console.log('1) QUESTIONS BY TYPE  (count / target range / status)');
var typeName = { mcq: 'MCQ', ar: 'Assertion-Reason', vsa: 'Very Short (2m)', sa: 'Short (3m)', ma: 'Medium (4m)', la: 'Long/HOTS (5m)', cs: 'Case Study' };
var typeOK = true;
['mcq', 'ar', 'vsa', 'sa', 'ma', 'la', 'cs'].forEach(function (t) {
  var c = counts[t], lo = TARGET[t][0], hi = TARGET[t][1];
  var ok = c >= lo ? '✓ in range' : '✗ need +' + (lo - c);
  if (c < lo) typeOK = false;
  console.log('   ' + (typeName[t] + '            ').slice(0, 18) + String(c).padStart(3) + '   [' + lo + '–' + hi + ']   ' + ok);
});
console.log('   ' + 'Case sub-questions'.slice(0, 18) + String(csSub).padStart(3));
console.log('   TOTAL question items: ' + (totalItems - counts.cs + csSub) + ' (incl. case sub-questions)\n');

console.log('2) DIFFICULTY DISTRIBUTION (item-based)');
console.log('   Foundational  ' + String(diff.F).padStart(3) + '  ' + bar(diff.F, totalItems) + '  ' + Math.round(diff.F / totalItems * 100) + '%');
console.log('   Intermediate  ' + String(diff.I).padStart(3) + '  ' + bar(diff.I, totalItems) + '  ' + Math.round(diff.I / totalItems * 100) + '%');
console.log('   Advanced      ' + String(diff.A).padStart(3) + '  ' + bar(diff.A, totalItems) + '  ' + Math.round(diff.A / totalItems * 100) + '%\n');

console.log('3) COMPETENCY / HOTS SHARE');
console.log('   ' + comp + ' of ' + totalItems + ' items are competency-based = ' + Math.round(comp / totalItems * 100) + '%\n');

console.log('4) SUBTOPIC COVERAGE  (items touching each subtopic; ⚠ = weak < 6)');
var weak = [];
Object.keys(cov).forEach(function (st) {
  var n = cov[st]; var flag = n < 6 ? ' ⚠ WEAK' : '';
  if (n < 6) weak.push(st);
  console.log('   ' + (st + ' ').padEnd(48, '.') + String(n).padStart(3) + flag);
});
console.log('');

console.log('5) PARAPHRASE / NEAR-DUPLICATE CHECK (stem similarity ≥ 0.82)');
if (!dups.length) console.log('   ✓ No near-duplicate stems detected.\n');
else { console.log('   ✗ ' + dups.length + ' possible near-duplicate pair(s):'); dups.slice(0, 12).forEach(function (d) { console.log('     [' + d.sim + '] "' + d.a + '…" ~ "' + d.c + '…"'); }); console.log(''); }

console.log('6) GOLD-STANDARD CHECKLIST');
console.log('   [' + (typeOK ? '✓' : ' ') + '] All question types meet minimum target counts');
console.log('   [' + (diff.F > 0 && diff.I > 0 && diff.A > 0 ? '✓' : ' ') + '] Difficulty balanced (foundational → advanced present)');
console.log('   [' + (comp / totalItems >= 0.35 ? '✓' : ' ') + '] Competency share ≥ 35%');
console.log('   [' + (weak.length === 0 ? '✓' : ' ') + '] Every subtopic has adequate coverage (≥ 6 items)');
console.log('   [' + (dups.length === 0 ? '✓' : ' ') + '] No near-duplicate/paraphrased stems');
var gold = typeOK && weak.length === 0 && dups.length === 0 && comp / totalItems >= 0.35;
console.log('\n   ==> ' + (gold ? 'GOLD STANDARD COMPLETE ✅' : 'NOT YET COMPLETE — see remaining weak areas below'));
if (!gold) {
  console.log('\n   REMAINING BEFORE GOLD STANDARD:');
  ['mcq', 'ar', 'vsa', 'sa', 'ma', 'la', 'cs'].forEach(function (t) { if (counts[t] < TARGET[t][0]) console.log('     • ' + typeName[t] + ': add ' + (TARGET[t][0] - counts[t]) + ' more (to reach ' + TARGET[t][0] + ')'); });
  weak.forEach(function (st) { console.log('     • Deepen subtopic: ' + st); });
  if (dups.length) console.log('     • Rewrite ' + dups.length + ' near-duplicate stem(s)');
}
console.log('\n==================================================================\n');
