/**
 * ════════════════════════════════════════════════════════════════════════════
 * Inspire TALENT HUB — GALLERY & MEDIA MODULE
 * Accessible lightbox, category filtering, and video modal.
 * Pure vanilla JS, zero dependencies. Shared by index.html and gallery.html.
 * ════════════════════════════════════════════════════════════════════════════
 */
"use strict";

(function galleryModule() {
  const qsa = (s, c = document) => Array.from((c || document).querySelectorAll(s));

  /* ─────────────────────────────────────────────────────────────────────────
     1. CATEGORY FILTERING + "LOAD MORE" PAGINATION
     Works for a filter-only grid (homepage) and a filtered+paginated grid
     (gallery page). Pagination activates when the grid has data-page-size.
  ───────────────────────────────────────────────────────────────────────── */
  qsa(".gallery-filters").forEach((bar) => {
    const grid = document.getElementById(bar.getAttribute("data-target"));
    if (!grid) return;
    const buttons = qsa("[data-filter]", bar);
    const items = qsa(".gallery-item", grid);
    const pageSize = parseInt(grid.getAttribute("data-page-size"), 10) || Infinity;
    const loadMore = document.querySelector(
      '[data-loadmore][data-target="' + grid.id + '"]'
    );

    let filter = "all";
    let shown = pageSize;

    function apply() {
      let matched = 0;
      items.forEach((item) => {
        const cats = (item.getAttribute("data-category") || "").split(/\s+/);
        const isMatch = filter === "all" || cats.includes(filter);
        if (isMatch) {
          matched += 1;
          item.hidden = matched > shown;
        } else {
          item.hidden = true;
        }
      });
      if (loadMore) loadMore.hidden = matched <= shown;
    }

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      filter = btn.getAttribute("data-filter");
      shown = pageSize; // reset pagination when the filter changes
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      apply();
    });

    if (loadMore) {
      loadMore.addEventListener("click", () => {
        shown += pageSize;
        apply();
      });
    }

    apply();
  });

  /* ─────────────────────────────────────────────────────────────────────────
     2. ACCESSIBLE LIGHTBOX
  ───────────────────────────────────────────────────────────────────────── */
  const triggers = qsa("[data-lightbox]");
  if (triggers.length) {
    // Build the overlay once
    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image viewer");
    overlay.hidden = true;
    overlay.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="Close image viewer">&times;</button>
      <button class="lightbox__nav lightbox__prev" type="button" aria-label="Previous image">&#8249;</button>
      <figure class="lightbox__stage">
        <img class="lightbox__img" alt="" />
        <figcaption class="lightbox__caption"></figcaption>
      </figure>
      <button class="lightbox__nav lightbox__next" type="button" aria-label="Next image">&#8250;</button>`;
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector(".lightbox__img");
    const capEl = overlay.querySelector(".lightbox__caption");
    const btnClose = overlay.querySelector(".lightbox__close");
    const btnPrev = overlay.querySelector(".lightbox__prev");
    const btnNext = overlay.querySelector(".lightbox__next");

    let index = 0;
    let lastFocused = null;

    const srcOf = (t) => t.getAttribute("data-full") || (t.querySelector("img") && t.querySelector("img").src);
    const capOf = (t) => {
      const img = t.querySelector("img");
      return t.getAttribute("data-caption") || (img && img.getAttribute("alt")) || "";
    };

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      const t = triggers[index];
      imgEl.src = srcOf(t);
      const cap = capOf(t);
      imgEl.alt = cap;
      capEl.textContent = cap;
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => overlay.classList.add("is-open"));
      btnClose.focus();
    }

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      const done = () => {
        overlay.hidden = true;
        imgEl.removeAttribute("src");
        overlay.removeEventListener("transitionend", done);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      };
      overlay.addEventListener("transitionend", done);
      // Fallback if no transition fires
      setTimeout(() => { if (!overlay.hidden) done(); }, 400);
    }

    triggers.forEach((t, i) => {
      t.addEventListener("click", (e) => { e.preventDefault(); open(i); });
    });
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => show(index - 1));
    btnNext.addEventListener("click", () => show(index + 1));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    document.addEventListener("keydown", (e) => {
      if (overlay.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "Tab") {
        // Simple focus trap within the overlay controls
        const focusables = [btnClose, btnPrev, btnNext];
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     3. VIDEO MODAL (embed-ready; graceful placeholder state)
  ───────────────────────────────────────────────────────────────────────── */
  const videoTriggers = qsa("[data-video]");
  if (videoTriggers.length) {
    const modal = document.createElement("div");
    modal.className = "video-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Video player");
    modal.hidden = true;
    modal.innerHTML = `
      <button class="video-modal__close" type="button" aria-label="Close video">&times;</button>
      <div class="video-modal__frame">
        <div class="video-modal__slot"></div>
      </div>`;
    document.body.appendChild(modal);

    const slot = modal.querySelector(".video-modal__slot");
    const vClose = modal.querySelector(".video-modal__close");
    let vLastFocused = null;

    function openVideo(trigger) {
      vLastFocused = document.activeElement;
      const embed = trigger.getAttribute("data-video-embed");
      const title = trigger.getAttribute("data-video-title") || "Student experience video";
      if (embed) {
        slot.innerHTML =
          `<iframe src="${embed}" title="${title}" frameborder="0" ` +
          `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
          `allowfullscreen></iframe>`;
      } else {
        // Placeholder state — real embeds (e.g. YouTube) drop in via data-video-embed
        slot.innerHTML =
          `<div class="video-modal__placeholder">` +
          `<p class="video-modal__ph-title">${title}</p>` +
          `<p class="video-modal__ph-sub">Video coming soon. Verified student stories will appear here.</p>` +
          `</div>`;
      }
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => modal.classList.add("is-open"));
      vClose.focus();
    }

    function closeVideo() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      const done = () => {
        modal.hidden = true;
        slot.innerHTML = ""; // stop playback
        modal.removeEventListener("transitionend", done);
        if (vLastFocused && vLastFocused.focus) vLastFocused.focus();
      };
      modal.addEventListener("transitionend", done);
      setTimeout(() => { if (!modal.hidden) done(); }, 400);
    }

    videoTriggers.forEach((t) => {
      t.addEventListener("click", (e) => { e.preventDefault(); openVideo(t); });
    });
    vClose.addEventListener("click", closeVideo);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeVideo(); });
    document.addEventListener("keydown", (e) => {
      if (!modal.hidden && e.key === "Escape") closeVideo();
    });
  }
})();
