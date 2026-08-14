# Inspire Talent Hub — Engineering & Product Handbook

> **Read this first.** This document is the single source of truth for the entire
> Inspire Talent Hub platform. It is written for a person or an AI agent arriving
> with **zero prior context** — no memory of previous conversations, no knowledge
> of the codebase. If you read this document top to bottom, you should understand
> what this product is, why it exists, how every part of it works, which file does
> what, what the rules are, and where the traps are.
>
> It documents the **whole software**, not only the code: the product, the
> content model, the operational workflows, the conventions, and the reasoning
> behind the important decisions.
>
> **Last verified against the codebase:** August 2026.
> **Repository:** `mioo12j/ith` · **Working branch:** `claude/audit-incremental-improvements-xfe5bj`

---

## Table of contents

1. [What this product is](#1-what-this-product-is)
2. [Current operational status](#2-current-operational-status)
3. [Architecture in one page](#3-architecture-in-one-page)
4. [Repository map](#4-repository-map)
5. [Page inventory (all 48 pages)](#5-page-inventory-all-48-pages)
6. [The JavaScript systems](#6-the-javascript-systems)
7. [The data layer](#7-the-data-layer)
8. [Subsystem deep-dives](#8-subsystem-deep-dives)
9. [CSS architecture & design system](#9-css-architecture--design-system)
10. [SEO and AI-discovery infrastructure](#10-seo-and-ai-discovery-infrastructure)
11. [Invariants — rules that must not be broken](#11-invariants--rules-that-must-not-be-broken)
12. [Traps and gotchas](#12-traps-and-gotchas)
13. [Recipes — how to do common tasks](#13-recipes--how-to-do-common-tasks)
14. [Testing and verification](#14-testing-and-verification)
15. [Deployment](#15-deployment)
16. [Known open issues](#16-known-open-issues)
17. [Feature catalogue — what every feature does](#17-feature-catalogue--what-every-feature-does)
18. [End-to-end user journeys](#18-end-to-end-user-journeys)
19. [Forms, lead capture and communications](#19-forms-lead-capture-and-communications)
20. [Operational runbooks](#20-operational-runbooks)
21. [Decision log — why the software is like this](#21-decision-log--why-the-software-is-like-this)
22. [Glossary](#22-glossary)

---

## 1. What this product is

**Inspire Talent Hub** is an Indian education platform with **two distinct products**
under one brand. Understanding that this is *two products, not one* explains most
of the codebase.

### Product A — National student competitions (the primary business)

Online-first academic and creative competitions for **school students in Classes
6–12** across India. The proposition is *fairness*: criteria are published before
students compete, entries are judged independently against those criteria, and
every participant receives a **certificate that anyone can verify online**.

Competitions run in **eight arenas**: Science & STEM, Mathematics, Creative
Writing, Art & Design, Coding & AI, Quiz & GK, Innovation & Projects, and Public
Speaking.

Competitions are organised into **seasons**. A season runs, concludes, results are
published, certificates are issued, and then the next season is announced. The
website must always accurately reflect *which* season is open, closed, or upcoming
— this is the single most common source of factual drift on the site.

### Product B — The Study Hub (a free supporting tool)

A completely free, **login-free**, browser-based learning environment for CBSE and
ICSE, Classes 6–12. It offers chapter notes, definitions, formula sheets,
flashcards, a match game, timed practice tests, true/false and fill-in-the-blank
drills, and **printable 80-mark competency-based examination papers with verified
answer keys**.

The Study Hub exists to serve the competitions business (prepared students are
better competitors, and it gives the brand a reason to be visited year-round), but
it is genuinely free and requires no account.

### Who the audiences are

Every page should make sense to at least one of these, and the site collectively
serves all of them:

| Audience | What they need from the site |
|---|---|
| **Students** (Classes 6–12) | What to enter, how to prepare, how to check results, free study tools |
| **Parents / guardians** | Is this legitimate? Is it safe for my child? What does it cost? |
| **Teachers / school coordinators** | How do I bring 40 students in at once? |
| **School principals / administrators** | Institutional participation, recognition, reporting |
| **Journalists / researchers** | What is this organisation, verifiably? |
| **Search engines & AI assistants** | Structured, machine-readable facts about all of the above |

---

## 2. Current operational status

**This section goes stale fastest. Verify it before trusting it.**

- **Back to School Competition 2026** — **CONCLUDED** (July 2026). Winners were
  felicitated, all participants certified. Its photographs and certificates are
  real. The site presents it in the **past tense**.
- **Monsoon Minds Championship 2026** — **UPCOMING**. Registrations open at
  `2026-08-26T09:00:00+05:30`. `competition.html` is dedicated to this season and
  runs a live countdown to that timestamp.
- **Academic Kickoff Fest 2026** — the event whose results populate
  `data/certificates.js` (the certificate database currently in production).
  Note the naming inconsistency: the certificate dataset says "Academic Kickoff
  Fest" while the concluded season is described as "Back to School Competition".
  **These are historical labels; do not "fix" one to match the other without
  confirming with the business owner which is correct.**

**Real media assets:** the platform owns exactly **one** genuine event photograph:
`assets/gallery/felicitation-dps-raipur.jpg` — a student felicitation at Delhi
Public School, Raipur. Earlier versions of the site shipped twelve branded
placeholder SVGs pretending to be event photos; **these were deliberately deleted**.
Do not reintroduce placeholder imagery that implies events which did not happen.

---

## 3. Architecture in one page

```
   Browser
      │
      │  plain HTTPS request for a .html file
      ▼
   Static host / CDN  (Netlify, Vercel or Cloudflare Pages — see §15)
      │
      └── serves pre-written HTML, CSS, JS and images. Nothing is generated
          on a server. There is no application server. There is no database.
          There is no build step.

   Everything interactive runs in the visitor's browser:
      ├── Study Hub engine        (assets/js/ith-study.js + data/*.js)
      ├── Quiz / flashcards / match games
      ├── Certificate verification (data/certificates.js + ith-cert-core.js)
      ├── Exam-paper generation and A4 printing
      └── Progress storage         → browser localStorage, never a server
```

**Three consequences you must internalise:**

1. **There is no backend.** Do not propose "add an API endpoint" or "store it in
   the database". Neither exists. All persistent participant data (certificates,
   results) is committed into the repository as JavaScript files and deployed.
2. **There is no build step.** No npm, no bundler, no framework, no transpiler.
   The `.html`, `.css` and `.js` files in the repository are *byte-for-byte* what
   the browser receives. Everything is vanilla ES5/ES6-compatible JavaScript.
3. **Forms are the only write path.** Contact and notification forms POST to
   **FormSubmit** (`https://formsubmit.co/info@inspiretalenthub.in`), which relays
   them to email. That is the only way data flows *from* a visitor *to* the
   organisation.

### The only third-party services

This is a short and deliberately checkable list. It is published publicly on
`technology.html` and `privacy.html`, so **if you add a third party you must
update both pages** or the site becomes dishonest.

| Service | What it receives | Why |
|---|---|---|
| **Google Fonts** | The visitor's IP (as with any request) | Serves the four brand typefaces |
| **FormSubmit** | Only what a user types into a form, only on submit | Relays form submissions to email |
| **The static host / CDN** | Standard connection info | Serves the files |

There is **no analytics, no advertising, no tracking pixels, no session recording,
no A/B testing, no chat widget, and no third-party JavaScript of any kind.** The
site sets **no cookies of its own**.

---

## 4. Repository map

```
/
├── *.html                     48 pages — the entire site (see §5)
├── style.css                  ~240 KB — the global stylesheet for all pages
├── script.js                  ~35 KB  — global site chrome (loader, cursor, nav, reveal)
├── gallery.js                 gallery filtering + lightbox (legacy; see §12)
├── logo.jpeg                  1254×1254 brand logo (favicon, schema logo, loader)
├── robots.txt                 crawler directives + sitemap pointer
├── sitemap.xml                44 URLs with <lastmod> (hand-maintained — see §13)
├── llms.txt                   plain-language site summary for AI/LLM search systems
├── manifest.webmanifest       PWA manifest (name, icons, theme colours)
├── README.md                  minimal stub
│
├── .well-known/
│   └── security.txt           RFC 9116 machine-readable security contact
│
├── assets/
│   ├── home.css               homepage-only stylesheet (all classes `hm-` prefixed)
│   ├── og-cover.jpg           1200×630 social-share card (generated — see §13)
│   ├── logo.webp              WebP version of the logo
│   ├── print-paper.css        standalone A4 stylesheet for printed exam papers
│   ├── cert/                  certificate artwork: emblem, seal, signature (PNG + WebP)
│   ├── gallery/               felicitation-dps-raipur.jpg/.webp — the ONE real photo
│   └── js/                    all feature modules (see §6)
│
├── data/                      47 files — the entire content database (see §7)
│   ├── syllabus.js            CBSE subject/chapter tree
│   ├── syllabus-icse.js       ICSE subject/chapter tree
│   ├── study-questions*.js    chapter test questions (CBSE + ICSE, per grade)
│   ├── study-content*.js      notes, definitions, formulas, tips (CBSE + ICSE)
│   ├── qbank-science-10*.js   the deep Class 10 Science question bank
│   ├── practice-questions.js  Practice Arena mixed-GK question pool
│   ├── certificates.js        THE CERTIFICATE DATABASE — real participant records
│   └── coverage/              internal QA tooling for question-bank coverage
│
└── docs/
    └── ENGINEERING_HANDBOOK.md   ← this document
```

---

## 5. Page inventory (all 48 pages)

### Core product pages
| Page | Purpose |
|---|---|
| `index.html` | **Homepage.** Rebuilt from scratch; uses its own `assets/home.css` design system (`hm-` classes) and `assets/js/ith-home.js`. Hero → two paths → arenas → how it works → trust → season recap → voices → FAQ → CTA. |
| `competition.html` | The **current/upcoming season** (Monsoon Minds 2026). Live countdown, categories, eligibility, rewards, FAQ. Carries `Event` + `FAQPage` schema. |
| `study.html` | **Study Hub.** A thin HTML shell; the entire application is rendered by `assets/js/ith-study.js` into `#shTool`/`#shHub`/etc. Loads ~40 data files. |
| `practice.html` | **Practice Arena** — mixed general-knowledge quizzes, separate from the Study Hub. |
| `StudentPortal.html` | **Results Portal.** Look up results by Certificate ID, registration number or name. |
| `verifycertificate.html` | **Certificate verification.** ID entry + in-page QR scanner (modal). |
| `certificate.html` | Renders an individual certificate for printing. `noindex` + robots-disallowed. |
| `admin.html` | Internal tool to import/validate participant data and generate `certificates.js`. `noindex` + robots-disallowed. |

### Trust & transparency (high-EEAT — treat these as load-bearing)
`about.html` · `judging-process.html` · `how-competitions-work.html` ·
`technology.html` · `security.html` · `safety.html` · `code-of-conduct.html` ·
`privacy.html` · `terms.html` · `accessibility.html` · `disclaimer.html` ·
`cookies.html` · `refund.html`

### Audience pages
`schools.html` · `teachers.html` · `parent-guide.html` · `campus-ambassador.html` ·
`careers.html` · `partners.html` · `scholarships.html`

### Content / marketing
`benefits-of-student-competitions.html` · `competition-preparation-guide.html` ·
`resources.html` · `learnmore.html` · `impact.html` · `hall-of-fame.html` ·
`success-stories.html` · `reviews.html` · `gallery.html` · `events.html` ·
`workshops.html` · `news.html` · `media.html` · `downloads.html` ·
`writingcompetitionthemereveal.html` · `faq.html` · `Contact.html` ·
`sitemap.html` · `404.html` · `success.html`

> **Note the two capitalised filenames** — `Contact.html` and `StudentPortal.html`.
> They are inconsistent with the rest of the site (all lowercase). Renaming them
> requires updating ~183 internal links, all canonicals, and the sitemap, **plus
> host-level 301 redirects** or you will create 404s. See §16.

---

## 6. The JavaScript systems

All modules are **vanilla JavaScript, dependency-free, IIFE-wrapped**, and attach
their public API to a `window.ITH*` global. No module system, no imports.

### `script.js` (~35 KB) — global site chrome
Loaded on nearly every page. Contains, in order:

1. **Loader engine** — controls `#loader`. Shows the brand logo for a **700 ms
   minimum**, fades as soon as the page is ready, then **removes itself from the
   DOM** so it can never intercept clicks. Has a **3-second hard safety cap** so a
   visitor can never be trapped behind it.
2. **Custom cursor** — only on `(pointer: fine)` devices; a dot that tracks
   instantly and an outline that lerps behind it.
3. **Magnetic physics** — `.btn-magnetic-wrap` buttons pull toward the cursor;
   `.feature-item`/`.stat-item` cards do a subtle 3D tilt.
4. **Navigation controller** — scroll state, and the mobile hamburger
   (`#index-hamburger` → `#index-navLinks`).
5. **Scroll reveal** — an IntersectionObserver that adds `.visible` to `.reveal`
   elements. **See the critical no-JS caveat in §12.**

### `assets/js/ith-study.js` (~55 KB) — the Study Hub engine
The largest and most important module. Renders the entire Study Hub as a
five-step wizard inside `study.html`:

```
Step 1  #shGrade     choose board (CBSE/ICSE) + class (6–12)
Step 2  #shSubject   choose subject
Step 3  #shChapter   choose chapter (with search/filter)
Step 4  #shHub       choose a tool for that chapter
Step 5  #shTool      the active tool renders into #shToolRoot
```

The ten chapter tools: **Revision Notes, Important Definitions, Formula Sheet,
Flashcards, Match-up Game, Practice Test, True or False, Fill in the Blanks,
Exam Paper (80 marks), Exam Tips & Common Mistakes.** Each is rendered only if
the chapter's data can support it — see the unlock conditions in §17.3.

It exposes `window.ITHStudy` (navigation API) and orchestrates the other modules.
It also owns **`printPapers()`** — the A4 print pipeline (see §8.3).

### The tool modules
| Module | Global | Responsibility |
|---|---|---|
| `ith-quiz.js` | `ITHQuiz` | Timed quiz runner. Practice mode (instant feedback) and Exam mode (results at end). Renders `.pa-*` classes, shared with the Practice Arena. |
| `ith-flashcards.js` | `ITHFlash` | Flip-card revision with known/unknown tracking and a summary ring. |
| `ith-match.js` | `ITHMatch` | Term↔definition matching game with a timer. Renders `.mt-tile`. |
| `ith-dash.js` | `ITHDash` | Student dashboard: streaks, goals, weak-topic identification, competency analytics, bookmarks. **Owns all localStorage.** |
| `ith-practice.js` | — | Drives the standalone Practice Arena on `practice.html`. |

### The certificate modules
| Module | Global | Responsibility |
|---|---|---|
| `ith-cert-core.js` | `ITHCert` | The certificate domain model: `search()`, `findByCertId()`, `certificateEligible()`, `verifyUrl()`, `competitionCode()`, `validateRow()`. Reads `window.ITH_CERT_DB`. |
| `ith-qr.js` | `ITHQR` | Pure-JS QR code generator. `ITHQR.toSVG(text, opts)` → SVG string. No external library. |
| `ith-cert-fx.js` | `ITHFx` | Small visual-effects helper; notably `ITHFx.reduceMotion()`. |

### The small helpers
| Module | Responsibility |
|---|---|
| `ith-home.js` | Homepage only: `.hm-reveal` scroll cascade + the live season countdown (`#hmCountdown`, driven by its `data-target` attribute). |
| `ith-study-reveal.js` | Scroll-reveal cascade for Study Hub / Practice Arena cards. Uses a `MutationObserver` because the engine injects DOM continuously. Deliberately **excludes** live quiz options and game tiles so they are usable the instant they appear. |
| `gallery.js` | Legacy gallery filtering + lightbox. Mostly inert now that the gallery holds one photo. |

---

## 7. The data layer

All content is plain JavaScript files that assign to a `window` global. They are
loaded with ordinary `<script>` tags in a **specific order** (base files first,
extensions after).

| Global | Source | Shape |
|---|---|---|
| `ITH_SYLLABUS` | `syllabus.js`, `syllabus-icse.js` | `boards: [{id,name,active}]` and `tree[boardId][grade] = [{id,name,icon,chapters:[String]}]` |
| `ITH_STUDY_Q` | `study-questions*.js` | Chapter test questions |
| `ITH_STUDY_CONTENT` | `study-content*.js` | Notes, definitions, formulas, exam tips |
| `ITH_QBANK` | `qbank-science-10*.js` | The deep Class 10 Science bank |
| `ITH_PRACTICE` | `practice-questions.js` | Practice Arena pool |
| `ITH_CERT_DB` | `certificates.js` | `{meta:{...}, records:[{certId,name,school,competition,...}]}` |

### The universal content key

```
board | grade | subjectId | slug(chapterName)
e.g.  cbse|10|science|acids-bases-and-salts
```

**Every** content lookup uses this key. Get it wrong and content silently fails to
appear (the chapter shows a "coming soon" state rather than erroring).

### Question item shapes (the question bank)

```js
mcq  { q, o:[4 options], a:answerIndex, e:explanation, d:difficulty, comp?:isCompetency }
ar   { A:assertion, R:reason, a:0-3 }              // assertion–reason
vsa  { q, a, k:[keywords], cm:marks }              // very short answer
sa   { q, a, k, cm }                               // short answer
ma   { q, a, k, cm }                               // medium answer
la   { q, a, k, cm }                               // long answer
cs   { p:passage, q:[{q,a,m,k?,cm?}] }             // case study
```

### Extending a question bank

Extension files **push onto the existing bank** rather than redefining it:

```js
(function () {
  var b = window.ITH_QBANK['cbse|10|science|acids-bases-and-salts'];
  function add(key, arr) { (b[key] = b[key] || []).push.apply(b[key], arr); }
  add('mcq', [ /* ...new items... */ ]);
})();
```

The extension file must be loaded **after** the base file in `study.html`.

### Content quality standard ("Gold Standard")

The question bank is held to an internal editorial bar, enforced by
`data/coverage/_coverage_report.js`:

- Educator-grade questions — **never** generated by changing names/numbers/wording
  of an existing question
- **≥50% competency-based** items in every generated exam paper (non-negotiable)
- Verified answer keys
- Subtopic coverage validation and **near-duplicate detection**
- Target depth per chapter: ~100–150 MCQ, 25–40 AR, 30–50 VSA, 40–60 SA, 30–40 MA,
  25–35 LA, 20–30 case studies (≈300–450 items)

---

## 8. Subsystem deep-dives

### 8.1 Certificate issuance and verification

This is the platform's trust anchor. Understand it fully before touching it.

**Certificate ID format:** `ITH-<YEAR>-<COMPCODE>-<HASH6>` — e.g.
`ITH-2026-CAQZ-87W1H7`. IDs are unique per certificate.

**The verification flow:**
1. `admin.html` imports participant data, validates rows, and produces
   `data/certificates.js`, which is **committed to the repository and deployed**.
2. Each certificate carries its ID *and* a QR code. The QR encodes the **URL of
   the verification page with the ID appended** — not the result itself.
3. Scanning with any ordinary phone camera opens `verifycertificate.html?id=…`,
   which looks the ID up in `ITH_CERT_DB` and displays participant, competition,
   category and issue date — or clearly reports no match.
4. Anyone can verify. No account, no permission, no special software.

**Why a forgery fails:** an ID that was never issued simply is not in the dataset.

### 8.2 The QR scanner (verifycertificate.html)

Uses the browser `BarcodeDetector` API plus `getUserMedia`. It opens as a
**fixed, centred modal overlay** (`.qr-scanner--modal`) with a backdrop and body
scroll-lock — *not* as an in-flow element below the form, because on a phone
users could not tell they had to scroll to find it. If `BarcodeDetector` or the
camera is unavailable, it falls back to a message directing the user to type the
ID or use their phone's native camera app.

### 8.3 The isolated-iframe A4 print pipeline ⚠️ **critical, non-obvious**

**The problem:** browsers print what they see. On a phone, the layout viewport is
~390 px wide, so printing an exam paper or certificate directly produced
mis-scaled, unusable output. A whole-page `window.print()` also fought a global
`@media print` rule that hides everything except the certificate.

**The solution**, implemented in both `ith-study.js` (`printPapers()`) and
`certificate.html` (`printCertificate()`):

1. Create a hidden `<iframe>`.
2. Write a **complete standalone document** into it containing:
   - `<base href>` so relative asset paths still resolve
   - `<meta name="viewport" content="width=794">` — **794 px is exactly 210 mm at
     96 DPI**, i.e. A4 width
   - a linked stylesheet (`assets/print-paper.css` for papers)
   - `@page { size: A4 portrait; margin: 0 }` and forced element dimensions
     (`794 × 1123 px` for a certificate)
3. Call `print()` on the **iframe's** window on `onload`, with a timeout fallback.

**Result:** output is identical from a budget phone and a desktop, because the
printed document is completely independent of the device viewport.

**If you touch printing, you must re-verify** that the printed element measures
210 mm / 794 px with zero overflow at both 375 px and 1440 px.

### 8.4 Exam paper generation

`buildPaper()` in `ith-study.js` assembles an **80-mark** paper in-browser from
the question bank, following the CBSE blueprint for section structure and marks.
Generation is local and pseudo-random, so a student can generate unlimited
practice papers and two students revising the same chapter do not get identical
papers. Every generated paper must satisfy the **≥50% competency** rule. Papers
are printed through the pipeline in §8.3, and every printed page carries a
watermark.

### 8.5 Local storage model

The Study Hub is **login-free**; all personalisation lives in the visitor's own
browser. `ith-dash.js` owns these four keys:

| Key | Contents |
|---|---|
| `ith_stats` | Practice history, scores, competency analytics |
| `ith_bookmarks` | Bookmarked chapters/questions |
| `ith_goal` | The student's study goal |
| `ith_last` | Last-visited location, for "continue where you left off" |

**Nothing is transmitted to a server** — there is no server to transmit to. This is
a documented privacy promise on `privacy.html` and `technology.html`. Honest
trade-offs (also documented): clearing browser data clears progress, progress does
not sync across devices, and a shared device shares progress.

---

## 9. CSS architecture & design system

### Two stylesheets

- **`style.css`** (~240 KB) — global, loaded by every page. Token-driven.
- **`assets/home.css`** (~25 KB) — homepage only. **Every class is prefixed `hm-`**
  so it is structurally impossible for it to affect another page.

Also: **`assets/print-paper.css`** — standalone A4 print stylesheet, loaded only
inside the print iframe.

### Design tokens (defined at the top of `style.css`)

```css
/* Brand */
--color-brand-primary: #e8c66a;   /* gold — the brand colour */
--color-bg-base:       #02040a;   /* near-black background */
--color-bg-surface-1/2/3          /* elevated dark surfaces */
--color-text-primary/secondary/tertiary/quaternary

/* 8-point spacing scale — use these, never arbitrary values */
--spacing-1: .25rem   --spacing-2: .5rem    --spacing-3: .75rem
--spacing-4: 1rem     --spacing-5: 1.25rem  --spacing-6: 1.5rem
--spacing-7: 1.75rem  --spacing-8: 2rem     --spacing-10: 2.5rem
--spacing-12: 3rem    --spacing-16: 4rem    --spacing-24: 6rem  --spacing-32: 8rem
```

### Typography system — four families, each with one job

| Role | Family | Token |
|---|---|---|
| Headings & titles | **Cormorant Garamond** (600) | `--font-family-display`, `--font-family-heading` |
| Long-form reading text | **EB Garamond**, line-height 1.8 | `--font-family-read` |
| All UI (nav, buttons, labels, forms) | **Inter** | `--font-family-body` |
| **Every number** | **Inter, tabular figures** | `--font-family-num` |
| Hindi / Devanagari | **Noto Serif Devanagari** | fallback in every stack |

> **The number rule is deliberate.** Countdowns, statistics, rings, class numbers
> and table figures all use `--font-family-num` with `font-variant-numeric:
> tabular-nums` so digits align and do not jitter as they tick.

### Reusable components in `style.css`

`.ith-cards` / `.ith-card` (numbered insight cards — the standard way to present
prose), `.check-list`, `.info-note`, `.process-grid` / `.process-step`,
`.ith-table`, `.faq-list` / `.faq-item`, `.gallery-cross-links`, `.btn` +
`.btn-gold` / `.btn-outline`, `.section-header` / `.section-tag` / `.section-title`.

**Prefer composing these** over writing new CSS. Content pages are built almost
entirely from them.

### Interaction standards

- Hover: lift + `scale(1.02)` + gold border + shadow · Active: `scale(0.98)`
- **Minimum 44 × 44 px touch targets** on every interactive element
- `:focus-visible` outlines everywhere
- Mobile-first: base styles are mobile; scale **up** with `min-width` queries
- Every animation must be disabled under `prefers-reduced-motion`

---

## 10. SEO and AI-discovery infrastructure

The site is built to be understood by traditional crawlers **and** by LLM/AI search
systems. Current state:

| Artefact | Status |
|---|---|
| Unique `<title>` ≤62 chars | All 48 pages |
| Unique `<meta description>` ≤160 chars | All 48 pages |
| Self-referential canonical | Every page |
| Open Graph + Twitter Card | All content pages, using `assets/og-cover.jpg` (1200×630) |
| **JSON-LD structured data** | **111 valid blocks** |
| `sitemap.xml` | 44 URLs, each with `<lastmod>` |
| `robots.txt` | References the sitemap; disallows `admin`, `certificate`, `success` |
| `llms.txt` | Plain-language site summary for AI systems |
| `.well-known/security.txt` | RFC 9116 |
| `manifest.webmanifest` | Linked from every page |

**Schema types in use:** `WebPage` ×45, `BreadcrumbList` ×45, `FAQPage` ×13,
`EducationalOrganization`, `WebSite` + `SearchAction`, `Course` + `CourseInstance`
(Study Hub), `Event` (competition season), `Article`.

**Measured performance** (local assets, mobile 375 px): **LCP 116–188 ms, CLS 0–0.02.**

### ⚠️ The no-JavaScript indexability rule

`.reveal` sets `opacity:0; visibility:hidden` and is un-hidden by `script.js`.
Without a fallback, **any client that does not execute JavaScript sees almost
nothing** — `competition.html` once exposed only **5 indexable words**.

The fix, at the end of `style.css`, must never be removed:

```css
html.no-js .reveal, html.no-js .hm-reveal { opacity:1 !important; visibility:visible !important; transform:none !important; }
@media (scripting: none) { .reveal, .hm-reveal { opacity:1 !important; visibility:visible !important; transform:none !important; } }
```

The inline bootstrap `document.documentElement.classList.replace('no-js','js')`
at the top of every `<body>` is what makes this safe — the fallback applies only
when scripting genuinely did not run.

**After this fix:** competition.html **2,938** indexable words, about.html
**3,914**, judging-process.html **3,543**.

---

## 11. Invariants — rules that must not be broken

1. **No backend, no build step, no framework, no npm.** Vanilla HTML/CSS/JS only.
2. **Never publish content that is not true.** No invented statistics, no
   placeholder photos implying events that did not happen, no fake contact
   details. (A dummy phone number `+91-98765-43210` once shipped in the homepage
   Organization schema — it was removed. Do not reintroduce that class of error.)
3. **Only real media.** One genuine photograph exists. Do not add stock or
   generated imagery that implies real events.
4. **The no-JS reveal fallback stays.** See §10.
5. **Every number uses `--font-family-num`** with tabular figures.
6. **8-point spacing tokens only** — no arbitrary `padding: 13px`.
7. **≥44 px touch targets** and `:focus-visible` on everything interactive.
8. **Every generated exam paper is ≥50% competency-based.**
9. **Zero horizontal overflow at 375 px** and **zero JS errors** on every page —
   verified before any commit (§14).
10. **Print output must be true A4** via the isolated-iframe pipeline (§8.3).
11. **If you add a third-party service, update `technology.html` and
    `privacy.html`** — both publish an exhaustive list.
12. **Certificate IDs are permanent.** A certificate that cannot be verified years
    later is worthless. Never renumber or remove issued records.

---

## 12. Traps and gotchas

- **`gallery.js` and `.reveal` are legacy but load-bearing.** `.reveal` is used on
  ~45 pages and depends on `script.js`. The newer homepage uses `.hm-reveal`
  (progressive enhancement — visible by default) which is the better pattern.
- **`.ith-cards.reveal.is-visible .ith-card`** — this selector expects `is-visible`
  but `script.js` adds `visible`. The card stagger animation therefore never
  fires. Harmless (nothing is hidden by it) but confusing.
- **Scroll-reveal tests are timing-sensitive.** Scrolling faster than the
  IntersectionObserver can react produces false "content is hidden" failures. Use
  realistic scroll steps with pauses.
- **`admin.html` and `certificate.html` each declare two `<h1>`s** because they
  render two mutually exclusive states; exactly one is visible at runtime. Both
  are `noindex` + robots-disallowed. This is intentional — do not "fix" it by
  deleting a heading.
- **`--spacing-5/7/10` were once referenced but undefined**, silently collapsing to
  zero. They are now defined. Verify a token exists before using it.
- **`style.css` is 240 KB but gzips to ~43 KB.** Minification is *not* the win it
  appears to be. A hand-rolled CSS minifier was written and **discarded because it
  dropped 472 of 723 selectors**. Do not hand-roll one; use a real tool
  (cssnano/csso) behind a proper build step or leave it alone.
- **Images must carry `width`, `height` and `loading`** or CLS regresses.
- **WebP is served via `<picture>` with JPEG/PNG fallback.** Keep the fallback.
- **`og:image` must stay 1200×630** (`assets/og-cover.jpg`). The square `logo.jpeg`
  is the *schema* logo — a different thing. Do not conflate them.

---

## 13. Recipes — how to do common tasks

### Announce a new competition season
1. Update `competition.html`: title, meta description, `Event` schema (`name`,
   `startDate`), hero, body copy, FAQ, and the countdown `launchDate`.
2. Update the homepage hero status pill and `#hmCountdown`'s `data-target`.
3. Move the previous season to past tense on `index.html` (recap section),
   `events.html` and `news.html`.
4. Update `llms.txt` (it states current status).
5. Re-verify at 375/1440 px.

### Publish results / issue certificates
1. Use `admin.html` to import and validate participant rows.
2. Regenerate `data/certificates.js`; commit it.
3. Confirm `meta.resultsPublished` and `meta.downloadsEnabled`.
4. Spot-check several IDs through `verifycertificate.html` and `StudentPortal.html`.

### Add questions to a chapter
1. Create `data/qbank-<subject>-<grade>-<chapterslug>-extN.js` using the push
   pattern in §7.
2. Register it in `study.html` **after** the base bank file.
3. Run `data/coverage/_coverage_report.js` — it must pass duplicate detection and
   the ≥50% competency gate.

### Add a new page
Copy the head/nav/footer shell from an existing page (`safety.html` is a clean
template), then: unique title (≤62) and description (≤160), self-referential
canonical, OG/Twitter tags, `BreadcrumbList` + `WebPage` JSON-LD, add it to
`sitemap.xml` with a `<lastmod>`, add it to the footer, and add it to `llms.txt`
if it matters to AI systems.

### Regenerate the social share image
Build an HTML card at exactly 1200×630, screenshot it with Playwright to
`assets/og-cover.jpg` (JPEG, quality ~88). Keep the brand: dark radial background,
gold accents, Cormorant headline, Inter stat row.

---

## 14. Testing and verification

There is no test framework. Verification is done by driving a **real browser with
Playwright**, which is installed at `/opt/node22/lib/node_modules/playwright`.

```js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const b = await chromium.launch({ args: ['--no-sandbox', '--no-proxy-server'] });
// Block non-file:// requests for speed; allow fonts.g* when testing typography.
await ctx.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());
```

**The mandatory pre-commit checks:**

| Check | Requirement |
|---|---|
| Horizontal overflow | `scrollWidth - clientWidth === 0` on every page at **375 px** (also test 768/1440) |
| JavaScript errors | Zero `pageerror` events on every page |
| Structured data | Every JSON-LD block `JSON.parse`s |
| Titles/descriptions | Unique; ≤62 / ≤160 chars |
| Internal links | Every `href="*.html"` resolves to a real file |
| Print output | Certificate/paper measures 794 px (A4) with no overflow |
| No-JS indexability | With `javaScriptEnabled:false`, `<main>` still exposes its content |

> **Note on measuring performance in a sandbox:** if outbound network is proxied,
> Google Fonts requests can take ~13 s and destroy the LCP measurement. Measure
> with fonts **blocked** to get the site's true cost (LCP ≈ 116–188 ms), and treat
> font latency as a separate, network-dependent factor.

---

## 15. Deployment

- **Host:** a static host — **Netlify, Vercel or Cloudflare Pages** (confirm which
  before making host-specific changes).
- **Canonical origin:** `https://www.inspiretalenthub.in` — every canonical, OG URL
  and sitemap entry uses this exact host.
- **Critical host configuration:** the site must be reachable at **one** origin.
  Set `www.inspiretalenthub.in` as the primary domain and **301-redirect**
  everything else to it: the non-`www` apex, `http://`, and the host's free deploy
  subdomain (`*.netlify.app` / `*.vercel.app` / `*.pages.dev`). Failing to do this
  is the main cause of "Duplicate without user-selected canonical" and "Page with
  redirect" in Google Search Console — those are **hosting settings, not code
  defects**, and cannot be fixed in this repository.
- **Deploy = commit + push.** There is no build.
- **Search Console:** submit `https://www.inspiretalenthub.in/sitemap.xml`.

---

## 16. Known open issues

| Issue | Notes |
|---|---|
| **Duplicate/redirect URLs in Search Console** | Fix at the host: one canonical origin + 301s (§15). Not a code issue. |
| **Uppercase filenames** | `Contact.html`, `StudentPortal.html`. Renaming needs ~183 link updates + canonicals + sitemap + host 301s. |
| **`sameAs` profiles unverified** | The homepage Organization schema declares Facebook/Twitter/LinkedIn/Instagram accounts. **Confirm these exist or remove them** — asserting profiles that do not exist is a credibility risk. |
| **`foundingDate: 2020`** | In the Organization schema; unverified. Confirm with the business owner. |
| **Eight thin pages** (199–280 words) | `campus-ambassador`, `careers`, `cookies`, `disclaimer`, `events`, `news`, `reviews`, `workshops`. |
| **CSS/JS not minified** | See the warning in §12. Needs a real build step, not a hand-rolled minifier. |
| **Success stories are representative** | `success-stories.html` uses named students/schools as representative examples, not verified case studies. Replace with consented real stories when available. |
| **`success.html` is orphaned** | Nothing links to it and no plain form sets FormSubmit's `_next`, so those users land on FormSubmit's generic thank-you page. Fixing it requires per-form `_next` values *and* copy that fits every form type (§19). `Contact.html` already has its own inline success panel. |
| **Study Hub content depth** | Only Class 10 Science approaches the Gold-Standard target. Expanding the remaining chapters/subjects/boards is the largest outstanding content programme. |

---

## 17. Feature catalogue — what every feature does

This section is the **functional specification**. §5 lists the pages; this lists the
*capabilities*, what each one is for, where it is implemented, and what makes it
appear or not appear.

### 17.1 Competition-side features

| Feature | What it does for the user | Implemented in | Notes / conditions |
|---|---|---|---|
| **Season landing page** | Explains the current competition: what it is, who can enter, arenas, dates, fees, rules | `competition.html` | The single page that must be rewritten every season |
| **Live countdown** | Counts down to the moment registration opens | `competition.html` (`launchDate`), `index.html` (`#hmCountdown data-target`) + `assets/js/ith-home.js` | Two separate countdowns exist. **They must carry the same timestamp.** Currently `2026-08-26T09:00:00+05:30` |
| **Pre-registration capture** | Lets a student register interest before the season opens | `competition.html` form → FormSubmit (§19) | Not a payment or a confirmed entry — it is an interest signal |
| **Arena explanations** | Describes the eight competition categories | `index.html` (`.hm-arenas`), `competition.html`, `how-competitions-work.html` | Eight arenas; see §1 |
| **Process transparency** | Shows how entries are judged, by whom, against what published criteria | `judging-process.html`, `how-competitions-work.html` | This is a *trust* feature, not decoration — it is the answer to "is this legitimate?" |
| **Parent reassurance** | Answers safety, cost, data and legitimacy questions for guardians | `parent-guide.html`, `safety.html`, `privacy.html` | Parents are a decision-maker audience, not a secondary one |
| **School / bulk participation** | Explains how a teacher or school enters many students at once | `schools.html`, `teachers.html` | Both carry their own lead forms |
| **Preparation material** | Helps a student get ready to compete | `competition-preparation-guide.html`, `resources.html`, plus the whole Study Hub | The bridge between Product A and Product B |
| **Past-season record** | Shows what actually happened last season | `index.html` recap, `events.html`, `news.html`, `gallery.html`, `hall-of-fame.html`, `impact.html` | Must be **past tense** once a season concludes |
| **Social proof** | Student and school testimonials | `reviews.html`, `index.html` (`#testimonials`), `success-stories.html` | Names and schools are real Indian students/schools. See §16 on the "representative" caveat |

### 17.2 Trust and verification features

These exist so that a certificate issued by Inspire Talent Hub is worth something
to a third party (a school, a college, a scholarship board) who has no relationship
with us. Treat them as the most safety-critical part of the codebase.

| Feature | What it does | Implemented in |
|---|---|---|
| **Result lookup** | A student searches for their own result by name or certificate ID | `StudentPortal.html` |
| **Certificate rendering** | Draws the actual certificate, with the participant's details and an embedded QR | `certificate.html` + `assets/js/ith-cert-core.js` (`ITHCert`) |
| **QR generation** | Produces the QR image with no external service and no network call | `assets/js/ith-qr.js` (`ITHQR.toSVG()`) |
| **Public verification (typed)** | Anyone types a certificate ID and gets a verdict | `verifycertificate.html` |
| **Public verification (scanned)** | Anyone scans the QR with a phone camera and lands on the verdict page | QR encodes `verifycertificate.html?id=…` |
| **In-page QR scanner** | Scans a certificate using the site's own camera modal | `verifycertificate.html` (`BarcodeDetector` + `getUserMedia`), §8.2 |
| **A4 certificate printing** | Produces a correctly-scaled printable/PDF certificate from any device | `printCertificate()` in `certificate.html`, §8.3 |
| **Certificate registry** | The dataset every verification is checked against | `data/certificates.js` (`ITH_CERT_DB`) |
| **Registry build tool** | Imports participant rows, validates them, exports the registry file | `admin.html` (3 steps: Import → Review & Validate → Publish settings & Export) |

> **The verification promise in one line:** if an ID is not in `ITH_CERT_DB`, the
> certificate is not real. Everything above exists to make that check trivially
> easy for a stranger, and impossible to fake without repository access.

### 17.3 Study Hub features

Entry point `study.html`, engine `assets/js/ith-study.js`. Navigation is a
**four-level drill-down**: Board → Class → Subject → Chapter → chapter hub.

At the chapter hub the user is offered up to **ten tools**. The tools are rendered
conditionally — a tool only appears if the chapter's data can support it. This is
deliberate: it is better to show fewer tools than to show a tool that opens empty.

| Tool | What it does | Appears only when |
|---|---|---|
| **Revision Notes** | Key points for the chapter, plus formulas if present | `notes.length` or `formulas.length` |
| **Important Definitions** | Key terms with explanations | `cards.length` |
| **Formula Sheet** | Just the formulas, for last-minute revision | `formulas.length` |
| **Flashcards** | Flip-card drill over the chapter's terms | `cards.length` |
| **Match-up Game** | Timed term↔meaning matching game | `authoredCards` **and** `cards.length >= 3` |
| **Practice Test** | Chapter questions with instant feedback and scoring | `questions.length` |
| **True or False** | Fast concept check generated from the notes | `notes.length` |
| **Fill in the Blanks** | Recall drill over key terms | `cards.length >= 4` |
| **Exam Paper (80 marks)** | Generates and prints a full CBSE-style annual paper | `questions.length` |
| **Exam Tips & Common Mistakes** | What to focus on and what students get wrong | `notes.length` or `cards.length` |

Additional Study Hub capabilities:

| Feature | What it does | Implemented in |
|---|---|---|
| **Chapter search** | Filters the chapter list as you type | `#shChapterSearch` in `ith-study.js` |
| **Bookmarking** | Star a chapter to find it again | `ITHDash.toggleBookmark` → `ith_bookmarks` |
| **Per-chapter progress** | Shows "Not started" / "Keep practising" / "Practised" / **"Mastered"** with best score | `ITHDash.chapterProgress` → `ith_stats` |
| **Continue where you left off** | Returns the student to their last chapter | `ITHDash.setLast/getLast` → `ith_last` |
| **Study goal** | A target the student sets for themselves | `ith_goal` |
| **Dashboard** | Aggregated stats, streaks, weak areas, bookmarks | `ITHDash.renderDashboard` |
| **Practice Arena** | Cross-chapter mixed practice with category selection | `practice.html` + `assets/js/ith-practice.js` (`ITH_PRACTICE`) |

`ITHDash` public API — the only supported way to touch Study Hub state:

```js
window.ITHDash = {
  record, setLast, getLast,
  isBookmarked, toggleBookmark, listBookmarks,
  chapterProgress, hasActivity, renderDashboard
};
```

**Never read or write the four localStorage keys directly from another module.**
Go through `ITHDash`, or the shapes will drift and the dashboard will silently
mis-report a student's progress.

### 17.4 Institutional / credibility features

These pages are not filler. They are what a journalist, a school principal or an
AI assistant reads to decide whether this organisation is real.

| Page | Purpose |
|---|---|
| `about.html` | Who we are, what we stand for |
| `technology.html` | How the platform is actually built, what it stores, which third parties are involved |
| `security.html` + `.well-known/security.txt` | Responsible disclosure policy (RFC 9116) |
| `accessibility.html` | Conformance target, checks actually run, known limitations |
| `privacy.html`, `cookies.html`, `terms.html`, `refund.html`, `disclaimer.html` | Legal and policy surface, including DPDP Act 2023 and children's data |
| `code-of-conduct.html` | Behaviour rules including the AI-tools policy for entries |
| `safety.html` | Child-safety posture |
| `impact.html`, `hall-of-fame.html` | Outcomes and recognition |
| `media.html`, `downloads.html` | Press and brand assets |
| `faq.html`, `sitemap.html`, `404.html` | Navigation and support surface |

---

## 18. End-to-end user journeys

Read these to understand how the pieces connect in practice. Each step names the
file that serves it, so a journey doubles as a regression checklist.

### Journey A — A student enters a competition

1. Arrives on `index.html` (usually from search or a school WhatsApp forward).
2. Reads the hero status pill — it tells them whether a season is **open**,
   **upcoming**, or **concluded**, and links to `competition.html`.
3. On `competition.html` they see the countdown, arenas, eligibility, fees, rules.
4. If they still have doubts they follow links to `how-competitions-work.html`,
   `judging-process.html`, `safety.html` or `parent-guide.html`.
5. They submit the pre-registration form → the enquiry arrives by email (§19).
6. They prepare using `competition-preparation-guide.html`, `resources.html`
   and the Study Hub.

**Failure mode to watch:** if the homepage status pill and `competition.html`
disagree about the season, this journey breaks trust at step 2 — before the user
has read a single real sentence.

### Journey B — A student checks a result and gets a certificate

1. Goes to `StudentPortal.html` and searches by name or certificate ID.
2. Sees their result; if the registry says results are published and downloads are
   enabled, they proceed.
3. Opens `certificate.html`, which renders the certificate with their details and a
   generated QR code.
4. Prints or saves it as PDF through the **isolated-iframe A4 pipeline** (§8.3), so
   it comes out correct even from a ₹8,000 phone.

**Failure mode to watch:** `meta.resultsPublished` / `meta.downloadsEnabled` in
`data/certificates.js` gate steps 2–3. If results are announced publicly but these
flags are false, students hit a dead end.

### Journey C — A stranger verifies someone else's certificate

*(A school admissions officer, a scholarship board, a recruiter.)*

1. Scans the QR on the printed certificate with a normal phone camera — or types
   the ID into `verifycertificate.html`.
2. The page looks the ID up in `ITH_CERT_DB`.
3. **Match:** participant name, competition, category and issue date are shown.
   **No match:** it says so plainly.
4. No account, no app, no permission required — by design.

### Journey D — A student uses the Study Hub

1. Lands on `study.html` (often directly from search).
2. Board → Class → Subject → Chapter.
3. Picks one of the ten tools (§17.3).
4. Takes a practice test; the score is recorded via `ITHDash.record`.
5. Progress badges update; the chapter can reach **Mastered**.
6. Optionally generates and prints an 80-mark exam paper.
7. Returns later — `ith_last` offers "continue where you left off".

**No login exists at any step.** Everything is on-device (§8.5).

### Journey E — A teacher or school gets involved

1. `schools.html` or `teachers.html` — bulk participation, recognition, logistics.
2. Submits the school-partnership or educator form (§19).
3. May also use `resources.html`, `workshops.html`, `downloads.html`.

### Journey F — A search engine or AI assistant reads the site

1. Fetches `robots.txt` → `sitemap.xml` (44 URLs, all with `<lastmod>`).
2. Optionally reads `llms.txt` for a plain-language description of the site and its
   current status.
3. Crawls pages, many of which **run no JavaScript**. Content is still readable
   because of the `html.no-js` / `@media (scripting: none)` reveal fallback
   (§10, §11) — without it these pages expose almost no text.
4. Parses the JSON-LD: `WebPage`×45, `BreadcrumbList`×45, `FAQPage`×13, plus
   `EducationalOrganization`, `WebSite`+`SearchAction`, `Course`+`CourseInstance`,
   `Event` and `Article` — **111 valid blocks**.

---

## 19. Forms, lead capture and communications

**There is no backend, so there is no database of leads.** Every form on the site
posts directly to a third-party form relay, and the submission arrives as an
**email**. The inbox *is* the CRM.

- **Relay:** FormSubmit — `https://formsubmit.co/info@inspiretalenthub.in`
- **Destination:** `info@inspiretalenthub.in`
- **Method:** ordinary HTML `POST`, no JavaScript required to submit
- **Common hidden fields:** `_subject` (routing label), `_template=table`
  (readable email layout), `_captcha=false`

### The thirteen public forms

Each carries a distinct `_subject`, which is the **only** way to tell submissions
apart in the inbox. Keep them unique.

Twelve are plain `POST` forms. **`Contact.html` is the exception:** it also posts
to FormSubmit as a fallback, but when JavaScript is available its submit handler
calls `preventDefault()` and posts to the **AJAX endpoint**
(`formsubmit.co/ajax/…`) with `fetch`, so the visitor never leaves the page and
sees an inline success panel instead.

| Page | `_subject` | What the lead means |
|---|---|---|
| `Contact.html` | New Contact Form Submission | General enquiry |
| `competition.html` | New Pre-Registration Alert | **Highest-value lead** — wants to compete |
| `index.html` | New Newsletter Subscription | Newsletter |
| `schools.html` | School Partnership Enquiry | Institutional participation |
| `teachers.html` | Educator Interest | Teacher / coordinator |
| `partners.html` | Partnership Enquiry | Sponsor / partner |
| `campus-ambassador.html` | Campus Ambassador Application | Student ambassador |
| `careers.html` | Careers Interest | Job applicant |
| `workshops.html` | Workshop Interest | Workshop demand |
| `scholarships.html` | Scholarship Updates Interest | Scholarship demand |
| `events.html` | Event Updates Subscription | Event notifications |
| `news.html` | News Subscription | News notifications |
| `resources.html` | Resource Updates Subscription | Resource notifications |

*(`verifycertificate.html`, `StudentPortal.html` and `admin.html` also contain
`<form>` elements, but those are **local** — intercepted with `preventDefault()`
and handled entirely in-browser. They send nothing anywhere. Do not "wire them
up"; that is the design.)*

### Operational consequences you must understand

- **The email address is a hard dependency.** If `info@inspiretalenthub.in` stops
  being monitored, every lead on the site is silently lost. Nothing on the site
  will show an error.
- **FormSubmit requires activation.** The first submission to a new address
  triggers a confirmation email that must be clicked, or nothing is delivered.
- **Changing the address means editing 13 files.** There is no shared constant,
  and `Contact.html` contains the address **twice** (the `action` fallback and the
  `fetch` AJAX URL) — both must be changed together.
- **Submissions are not stored by us.** There is no export, no dashboard, no
  retry. This is consistent with the privacy promise on `privacy.html`, but it
  means the inbox must be backed up like a system of record — because it is one.
- **Known gap:** `success.html` ("Registration Confirmed") exists but **nothing
  links to it**, and no form sets FormSubmit's `_next` field. After submitting,
  users land on FormSubmit's generic thank-you page instead of a branded one.
  Fixing it means adding `_next` per form *and* rewriting `success.html` so its
  wording fits every form type — a copy decision, not just a code change.
  (`Contact.html` is unaffected: it shows its own inline success panel.)

---

## 20. Operational runbooks

These are the recurring **business** processes the software has to support. §13
gives the mechanical steps; this gives the surrounding operation.

### Runbook 1 — Running a competition season

| Phase | What happens in the business | What must change in the software |
|---|---|---|
| **Announce** | New season named and dated | `competition.html` (title, meta, `Event` schema, hero, copy, FAQ, `launchDate`); homepage status pill + `#hmCountdown data-target`; `llms.txt` |
| **Open** | Registration opens | Status pill → open; countdown reaches zero and must degrade gracefully, not display negative time |
| **Compete** | Entries submitted | Usually no site change |
| **Judge** | Independent judging against published criteria | `judging-process.html` must already describe exactly what is being done |
| **Publish results** | Winners announced | Regenerate `data/certificates.js` via `admin.html`; set `meta.resultsPublished` |
| **Certify** | Certificates issued | Set `meta.downloadsEnabled`; spot-check IDs in `StudentPortal.html` **and** `verifycertificate.html` |
| **Archive** | Season concludes | Move the season to **past tense** on `index.html` recap, `events.html`, `news.html`; add real photos only if they exist; update `impact.html` / `hall-of-fame.html` |

> **The single most common defect in this codebase's history is season drift** —
> one page saying "live now" while another says "coming soon". After any season
> change, grep the whole repo for the old season name and the old date before
> committing.

### Runbook 2 — Issuing certificates

1. Collect the final participant list (name, school, competition, category, result).
2. Open `admin.html` → **Import Participant Data**.
3. **Review & Validate** — resolve every flagged row. Do not publish with warnings
   outstanding; a bad row becomes a certificate that fails verification in public.
4. **Publish Settings & Export** → produces `data/certificates.js`.
5. Commit and deploy that file. *This is the moment the certificates become real.*
6. Verify by sampling: pick several IDs (including one that should **not** exist)
   and run them through `verifycertificate.html`. The non-existent one must fail.
7. Print one certificate end-to-end from a **phone** and confirm A4 output (§8.3).

**Never hand-edit `data/certificates.js`.** The ID hash and record shape are
produced by the tool; a hand-edit that looks fine can break lookups.

### Runbook 3 — Adding or extending Study Hub content

1. Decide the exact content key: `board|grade|subjectId|slug(chapter)` (§7).
   Getting this wrong makes content silently invisible — there is no error.
2. Ensure the chapter exists in `ITH_SYLLABUS` for that board/grade/subject.
3. Add notes/definitions/formulas to `ITH_STUDY_CONTENT`, questions to the
   relevant bank, using the **push** pattern for extension files.
4. Register the new file in `study.html` **after** its base file.
5. Run `data/coverage/_coverage_report.js` — near-duplicate detection and the
   **≥50% competency** gate must pass.
6. Open the chapter in a browser and confirm the right tools unlocked (§17.3).

**Editorial rule that overrides convenience:** questions are educator-grade and
original. Producing "new" questions by swapping names or numbers in an existing
question is explicitly forbidden — it inflates counts while degrading the product.

### Runbook 4 — Handling a security report

1. Reports arrive at `info@inspiretalenthub.in` (per `.well-known/security.txt`).
2. `security.html` defines scope, out-of-scope, safe harbour, and what we ask of
   researchers. It honestly states there is **no paid bounty**.
3. Keep `Expires:` in `security.txt` in the future — an expired file signals a
   dead policy.

### Runbook 5 — Publishing any new page

Follow the §13 recipe, then confirm all of: unique title (≤62) and description
(≤160), self-referential canonical, OG/Twitter tags, `BreadcrumbList` + `WebPage`
JSON-LD, an entry in `sitemap.xml` **with `<lastmod>`**, a footer link, an
`llms.txt` entry if it matters to AI systems, and the §14 checks passing.

---

## 21. Decision log — why the software is like this

Understanding *why* prevents an eager future contributor from "fixing" something
that is correct. Each entry is a decision that was made deliberately.

| Decision | Why | What breaks if reversed |
|---|---|---|
| **No backend, no database** | An education site whose critical output is a verifiable document does not need one, and a static site cannot leak a database it does not have | Hosting cost, attack surface, and the privacy promise all change |
| **No build step, no npm, no framework** | The site must be editable by opening a file. A build step is a permanent dependency and a permanent way for the site to become un-deployable | Anyone can no longer clone and edit; the deploy story stops being "push" |
| **Login-free Study Hub, state in localStorage** | Removes the biggest drop-off in student tools, and means no child accounts to protect | Consent, storage and child-data obligations appear immediately |
| **Certificate registry committed to the repo** | Verification works for anyone, forever, with no API, no uptime dependency and no rate limit | Verification becomes a service that can go down |
| **QR encodes a verification *URL*, not the result** | A QR containing the result could be forged by generating a new QR. A URL forces a lookup against our registry | Certificates become trivially forgeable |
| **Isolated-iframe print pipeline** | Browsers print the layout viewport; on a phone that produced unusable certificates and papers | Every certificate and paper printed from a phone comes out mis-scaled |
| **`.reveal` animations must fall back when JS is off** | Non-JS crawlers saw almost nothing — `competition.html` exposed **5 indexable words**; with the fallback, **2,938** | Thousands of words disappear from search engines, silently |
| **Homepage CSS is a separate, `hm-`-prefixed file** | Lets the homepage be redesigned from scratch without any risk of collateral damage to 47 other pages | Homepage changes start breaking unrelated pages |
| **Exactly one real photograph** | The site previously shipped placeholder imagery implying events that never happened. That is a credibility risk far larger than a sparse gallery | The site starts asserting things that are not true |
| **Three font families, one numeric font** | Cormorant Garamond (headings), EB Garamond (reading), Inter (everything else + tabular numbers). A ceiling of three keeps it typographically coherent and fast | Visual coherence and font-loading cost both degrade |
| **CSS/JS shipped unminified** | No trustworthy minifier exists in this environment; a hand-rolled one silently destroyed 472 of 723 selectors. `style.css` gzips 237 KB → 43.8 KB anyway (measured) | Shipping a silently-corrupt stylesheet is far worse than shipping a larger correct one |
| **Every claim on the site must be true** | The 500+ schools figure and similar claims are real, from the concluded season. The site's entire value proposition is verifiability | If one claim is found false, the certificates are worth nothing either |

---

## 22. Glossary

| Term | Meaning |
|---|---|
| **Arena** | One of the eight competition categories (Science & STEM, Mathematics, Creative Writing, Art & Design, Coding & AI, Quiz & GK, Innovation & Projects, Public Speaking) |
| **Season** | One full competition cycle: announce → open → compete → judge → results → certificates → archive |
| **Content key** | `board\|grade\|subjectId\|slug(chapter)` — the universal Study Hub lookup key |
| **Competency item** | A question testing application/analysis rather than recall. **≥50%** of every generated exam paper must be competency items |
| **Gold Standard** | The internal editorial bar for question-bank content, enforced by `data/coverage/_coverage_report.js` |
| **Mastered** | A chapter progress state, awarded from practice-test performance stored in `ith_stats` |
| **Certificate ID** | `ITH-<YEAR>-<COMPCODE>-<HASH6>`, e.g. `ITH-2026-CAQZ-87W1H7` |
| **Registry** | `data/certificates.js` / `ITH_CERT_DB` — the committed dataset every verification checks against |
| **Reveal** | The scroll-in animation classes (`.reveal`, `.hm-reveal`, …) that **must** fall back to visible without JavaScript |
| **The pipeline** | The isolated-iframe A4 print mechanism (§8.3) |
| **`hm-`** | Prefix reserved for homepage-only CSS in `assets/home.css` |
| **`sh-` / `pa-`** | Prefixes for Study Hub and Practice Arena CSS |
| **FormSubmit** | The third-party relay that turns every public form on the site into an email |

---

## Appendix — quick orientation for a new agent

If you have just been dropped into this repository with no context, do this:

1. Read §1–§3 to understand the product and that there is **no backend/build**.
2. Read §17 (what every feature does) and §18 (how the journeys connect) to
   understand the product as a user experiences it, not just as files.
3. Run the checks in §14 to establish a clean baseline **before** changing anything.
4. Read §11 (invariants), §12 (traps) and §21 (why things are the way they are)
   before writing a single line — §21 in particular exists to stop you "fixing"
   something that is already correct.
5. Find the relevant system in §6, the relevant file in §4, and the relevant
   process in §20.
6. Make the change, re-run §14, then commit and push.

**If you are about to change the season, the certificates, or anything printed,**
read the matching runbook in §20 first. Those three are the ones where a mistake
is visible to the public and hard to walk back.

**The three mistakes that cause the most damage here:**
publishing something untrue, breaking the no-JS reveal fallback (which silently
hides thousands of words from search engines), and breaking the A4 print pipeline
(which silently ruins every certificate and exam paper printed from a phone).
