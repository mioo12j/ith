# Inspire Talent Hub — Internal Project Overview

A concise maintenance reference for the website and, in particular, the **Study Hub**.
Audience: developers maintaining or extending the platform.

> **Nature of the project:** a fully **static, front-end-only** website (HTML + CSS +
> vanilla JavaScript). There is **no backend and no database**. All personalised
> state (quiz attempts, progress, bookmarks, streaks) lives in the visitor's own
> browser via `localStorage`. The whole site can be served from any static host.

---

## 1. Architecture at a glance

- **Pages:** 46 hand-authored HTML pages (marketing/competition site + the Study Hub).
- **Styling:** one shared `style.css` (~4.7k lines, design-token driven, gold/dark theme)
  plus a standalone `assets/print-paper.css` used only for printing exam papers.
- **Scripts:** small, dependency-free vanilla-JS modules (no framework, no build step).
  Each page includes only the scripts it needs.
- **Data:** the Study Hub is driven entirely by static JS data files under `data/`
  that attach objects to `window` (syllabus tree, questions, notes, question bank).
- **No bundler / no npm runtime dependency.** Playwright (dev-only) is used for
  automated verification; it is not shipped.

---

## 2. Folder structure

```
/                       46 *.html pages, style.css, script.js, sitemap.xml, robots.txt
/assets/
  js/                   Study Hub + shared runtime modules (see §4)
  print-paper.css       self-contained A4 stylesheet for printing exam papers
  cert/                 certificate + brand assets (logo.png, seal.png, …)
  gallery/              gallery imagery (SVG)
/data/
  syllabus.js           CBSE syllabus tree (boards → grades → subjects → chapters)
  syllabus-icse.js      ICSE syllabus tree (activates the icse board)
  study-questions*.js   authored MCQ pool per chapter        → window.ITH_STUDY_Q
  study-content*.js     authored notes / flashcards / formulas → window.ITH_STUDY_CONTENT
  qbank-science-10*.js  PREMIUM authored question bank         → window.ITH_QBANK
  coverage/             per-chapter Gold-Standard coverage reports + the report tool
/docs/                  this overview
```

---

## 3. The Study Hub data model (`window.*`)

| Global | Shape | Source |
|---|---|---|
| `ITH_SYLLABUS` | `{ boards:[…], grades:[…], tree:{ board:{ grade:[ {id,name,icon,chapters:[…]} ] } } }` | `data/syllabus*.js` |
| `ITH_STUDY_Q` | `{ "board\|grade\|subjectId\|slug": [ {q, o:[4], a, e, d} ] }` | `data/study-questions*.js` |
| `ITH_STUDY_CONTENT` | `{ key: { notes:[…], formulas:[{n,x}], cards:[{f,b}] } }` | `data/study-content*.js` |
| `ITH_QBANK` | `{ key: { mcq, ar, vsa, sa, ma, la, cs } }` (premium authored, rich metadata) | `data/qbank-*.js` |

`key = board + "|" + grade + "|" + subjectId + "|" + slug(chapter)` where
`slug = s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')`.

### Premium question-bank item shapes (`ITH_QBANK`)
- `mcq`: `{ q, o:[4], a, e, d(1|2|3), comp? }` — `a` = index of correct option.
- `ar` : `{ A, R, a }` — `a`: 0=(a) both & R explains, 1=(b) both, 2=(c) A-true R-false, 3=(d) A-false R-true.
- `vsa`(2m) / `sa`(3m) / `ma`(4m) / `la`(5m): `{ q, a, k:[keywords], cm }` (`cm` = common error).
- `cs` : `{ p:passage, q:[ {q, a, m, k?, cm?} ] }` — case/source-based; sub-marks sum to 5.

Chapters may grow across multiple files: an **extension file** simply
`window.ITH_QBANK[key].mcq.push(...)` etc. (see `qbank-science-10-cre-ext*.js`).
The engine samples from the whole pool, so a larger bank = more unique papers.

---

## 4. Key runtime modules (`assets/js/`)

| Module | Responsibility |
|---|---|
| `ith-study.js` | **Study Hub engine.** Navigation (grade → subject → chapter → tools), chapter tools (notes, definitions, formula sheet, flashcards, match, practice test, T/F, fill-blanks, exam tips), the **80-mark exam-paper generator** (`buildPaper`), the **isolated-iframe print** flow (`printPapers`), and the public nav API `window.ITHStudy`. Records attempts to `window.ITHDash`. |
| `ith-dash.js` | **Student dashboard** (`window.ITHDash`). localStorage store; progress, accuracy, time, streaks, editable daily goal, competency analytics, weak-topic detection + recommendations, bookmarks, subject progress, recent activity, continue-where-you-left-off, chapter completion. |
| `ith-quiz.js` | Shared **quiz runner** (`window.ITHQuiz.start`). Practice/exam modes, timer, per-question timer, combo streak, instant feedback, animated score ring, full answer review. |
| `ith-flashcards.js`, `ith-match.js` | Flashcard flip deck and match-the-terms game. |
| `ith-cert-core.js`, `ith-cert-fx.js`, `ith-qr.js` | Certificate rendering, effects, and QR verification (competition side). |
| `ith-practice.js` | Standalone Practice Arena (general-knowledge) quiz on `practice.html`. |
| `script.js` | Site-wide chrome: nav, reveal-on-scroll, cursor, footer canvas, etc. |

### The 80-mark exam paper (`buildPaper` in `ith-study.js`)
- Sections **A** objective (20×1, incl. assertion-reason) · **B** VSA (2m) · **C** SA (3m) ·
  **D** medium/competency (4m) · **E** long/HOTS (flex, so the total is always **exactly 80**) ·
  **F** case/source-based (5m).
- **Competency guarantee:** Sections D + E + F always count toward competency, so
  **every generated paper is ≥ 50 %** competency by marks (verified minimum 53 %).
- Prefers authored `ITH_QBANK` questions per section; falls back to generation from
  the chapter's own notes/flashcards when no bank exists — never generic chapter-name
  prompts where authored content is available.
- Answer key prints model answers + expected key terms + common-error notes.

### Printing system (mobile-safe)
`printPapers()` renders the paper into a **hidden `<iframe>`** that loads the
standalone `assets/print-paper.css` with a fixed `width=794` (210 mm) viewport and a
`<base>` for assets, then prints that iframe. This isolates print from the page's
device-width viewport and the site's global certificate print rule — producing an
identical clean **A4** document (with a per-page watermark and a separate answer key)
on mobile and desktop alike.

---

## 5. Gold-Standard content pipeline

Each chapter is authored to a **Gold-Standard** bar before it is considered complete:

1. **Author** genuinely diverse questions (no paraphrases) covering every subtopic,
   misconception, application and exception — with rich metadata and model answers.
2. **Coverage report** — `data/coverage/_coverage_report.js` (run with Node) reports
   counts by type, difficulty distribution, competency %, NCERT-subtopic coverage and
   a **near-duplicate/paraphrase** check, then a pass/fail gate against target ranges
   (≈100–150 MCQ / 25–40 A-R / 30–50 VSA / 40–60 SA / 30–40 MA / 25–35 LA / 20–30 CS,
   ≈300–450 items/chapter).
3. **Certify** only when every check passes; save the report under `data/coverage/`.

Flagship reference: **Chemical Reactions and Equations** (Class 10 Science) — 300 items,
Gold-Standard certified (`data/coverage/chemical-reactions-and-equations.txt`).

---

## 6. Analytics & dashboard (device-local)

`localStorage` keys: `ith_stats` (attempt history), `ith_bookmarks`, `ith_goal`,
`ith_last`, plus legacy `ith_attempts` / `ith_wrong`. `ith-study.js` writes rich
records via `ITHDash.record({ ts, key, board, grade, subject…, correct, total, pct,
elapsed, compTotal, compCorrect })`; `ith-dash.js` derives all dashboard views from
them. Nothing leaves the device.

---

## 7. SEO implementation

- Every indexable page: unique `<title>` + meta description, `canonical`, robots,
  viewport, theme-color, Open Graph + Twitter Card, favicon/apple-touch-icon.
- Structured data (JSON-LD): `EducationalOrganization` + `WebSite`+`SearchAction` +
  `FAQPage` (home); `BreadcrumbList` on every content page; `Event`+`Organization`
  (competitions); `FAQPage` (faq); **`Course`** (Study Hub, `study.html`).
- `sitemap.xml` (42 indexable URLs) + `robots.txt` (with `Disallow` for admin /
  certificate / success and the sitemap reference).
- All images carry `alt`; one `<h1>` per indexable page; no duplicate titles/descriptions.

---

## 8. Verification tools (dev-only, run with Node + Playwright)

- **Paper audit** — generates 2 papers for every chapter of every board (1,720 papers)
  and asserts: max marks = 80, section-mark sum = 80, Sections A–F present, no duplicate
  question stems, no duplicate MCQ options, key count = question count, **competency ≥ 50 %**.
- **Coverage report** — `data/coverage/_coverage_report.js` (see §5).
- **Static site audit** — missing assets, duplicate element IDs, broken internal links,
  `<section>` tag balance, duplicate titles/descriptions, JSON-LD validity.
- **Runtime audit** — loads all 46 pages headless and asserts zero JS errors and zero
  live duplicate IDs; drives the quiz and print flows.

> These scripts live in the developer scratchpad, not the shipped site. Re-run them
> after any content or engine change before committing.

---

## 9. Maintenance guidance

- **Add chapter content:** append authored items to the relevant `data/*` file (or an
  extension file that pushes into `ITH_QBANK[key]`), then include the new script in
  `study.html`. Run the paper audit + coverage report before committing.
- **Add a page:** copy an existing page's `<head>` block and give it unique metadata,
  canonical and structured data; add it to `sitemap.xml`.
- **Keep the invariant:** the exam paper must always total exactly 80 marks and stay
  ≥ 50 % competency — the audit enforces both.
- **Do not** reintroduce whole-page `window.print()` for papers; always use the
  isolated-iframe `printPapers()` path.
