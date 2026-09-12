# Student project videos

Self-hosted clips shown in the "Student Showcase" section of `gallery.html`.

## Adding a video
1. Drop the file here, e.g. `student-project-1.mp4`.
2. In `gallery.html`, point the card's `data-video-src` at it and fill in the
   real `video-name` (project title), `video-sub` (student · class · school)
   and `video-desc`.

## File guidance (important — static site on Cloudflare Pages)
- **Format:** MP4 (H.264 video + AAC audio) plays everywhere. WebM also works.
- **Size:** keep each file **under 25 MB** — Cloudflare Pages rejects larger
  files. Aim well below that so clips load fast on phones.
- **Compress** before adding (e.g. 720p, ~1–2 Mbps). A 45–90s clip fits easily.
- **Orientation:** landscape (16:9) fills the player best; portrait clips are
  letterboxed on black, which is fine.

The player is the shared video modal in `gallery.js` (native `<video>` with
controls). No poster image is required — cards use a branded gradient
thumbnail. To use a real poster frame instead, add `data-video-poster="…"`.
