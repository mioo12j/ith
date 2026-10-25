# Monsoon Minds live quiz — preservation & rebuild spec

> The five `mm-quiz-*.html` pages were removed from the live site on 2026-10-25
> (Monsoon Minds concluded). This document captures exactly how they worked so
> they can be rebuilt later. The full original source remains in git history on
> branch `claude/audit-incremental-improvements-xfe5bj` at commit `8267767`
> (and its parents). The engine and stylesheet (`assets/js/ith-exam.js`,
> `assets/exam.css`) are **kept in the repo**, so rebuilding is mainly a matter
> of re-adding the per-quiz pages.

## What the quizzes were

Five timed, proctored, single-page MCQ assessments for Monsoon Minds 2026:

| Page (removed) | Quiz | refPrefix |
|---|---|---|
| `mm-quiz-mathematics.html` | Mathematics | QMA |
| `mm-quiz-science.html` | Science | QSC |
| `mm-quiz-general-knowledge.html` | General Knowledge | QGK |
| `mm-quiz-current-affairs.html` | Current Affairs | QCA |
| `mm-quiz-word-wizard.html` | Word Wizard | QWW |

## Architecture (unchanged from the originals)

- **One HTML page per quiz.** Each page loads `assets/exam.css` + `assets/js/ith-exam.js`
  and defines a single global `window.EXAM_CONFIG` object (inline `<script>`).
  Everything else is driven by that config.
- **Engine:** `assets/js/ith-exam.js` — `window.EXAM_CONFIG` drives four views:
  `view-registration` (details + team + level + rules → Start), `view-quiz`
  (timed MCQ with palette, flag, prev/next), `view-review` (flagged/unanswered
  summary), `view-completion` (receipt only — **the score is hidden from the
  student**).
- **Answer secrecy:** answers are never shipped in plaintext. Each question
  carries a **salted SHA-256 hash** of its correct option; scoring hashes the
  chosen option and compares. (Still client-side — defeats casual "view source",
  not a determined attacker. True secrecy needs a backend.)
- **Question pool:** each quiz holds a large pool per level and draws a random
  subset per participant (`drawCount`), with `shuffleQuestions` / `shuffleOptions`.
- **Timer & resume:** timer + answers persist in `localStorage` under
  `exam_<slug>`; a refresh RESUMES the same remaining time and the exam cannot be
  restarted. Soft duration with overtime handling.
- **Proctoring:** best-effort. Desktop = screen-share; mobile = camera+mic
  recording, watermarked, downloaded to the student's device. A firm notice says
  no recording = grounds for disqualification. Nothing hard-locks the student.
- **Result delivery:** a SHORT email (identity + score + integrity flags) is sent
  to the organiser via FormSubmit (`info@inspiretalenthub.in`) so it delivers
  reliably.
- **Test hooks (query params):** `?exam_reset=1` clears saved state;
  `?exam_noproctor=1` skips the camera (for automated tests); `?exam_now=<ISO>`
  overrides "now" to test open/close windows.

## `window.EXAM_CONFIG` shape (from the Mathematics page)

```js
window.EXAM_CONFIG = {
  slug: "mathematics",
  name: "Mathematics Quiz",
  icon: "📐",
  refPrefix: "QMA",
  submitEmail: "info@inspiretalenthub.in",
  durationSeconds: 1800,                 // 30 minutes
  marking: { correct: 4, wrong: -1, blank: 0 },
  salt: "mmq-2026-7f3a9c21e5",           // used for the SHA-256 answer hashes
  availableFrom:  "2026-10-11T05:00:00+05:30",
  availableUntil: "2026-10-11T23:59:59+05:30",
  dayLabel:  "Sunday, 11 October 2026",
  openLabel: "Sunday, 11 October 2026 · 5:00 AM IST",
  shuffleQuestions: true,
  shuffleOptions: true,
  sample: false,
  drawCount: 60,                          // random questions drawn from the pool
  levels: [
    { id: "junior", name: "Junior", meta: "Grades 6–8",
      questions: [ { qid: "...", q: "...", options: ["...","...","...","..."],
                    /* correct option stored only as a salted hash */ } /* …~180 per level */ ]
    }
    /* …more levels (e.g. senior) with their own question pools */
  ]
};
```

## To rebuild later

1. Recreate one `mm-quiz-<slug>.html` per quiz (copy an old one from git history
   at commit `8267767`, or scaffold fresh with the two asset links above).
2. Fill `window.EXAM_CONFIG` — set `availableFrom`/`availableUntil`/`dayLabel`/
   `openLabel` to the new event dates, regenerate salted answer hashes with a new
   `salt`, and supply the per-level question pools.
3. Link the pages from the Monsoon Minds / championship page when the event opens.
4. Keep `assets/exam.css` and `assets/js/ith-exam.js` as-is unless the format
   changes.

> Note: the engine's answer secrecy and proctoring are client-side only. For a
> higher-stakes round, move scoring and answer storage behind a server (a
> Cloudflare Pages Function like the existing `functions/api/create-order.js`).
