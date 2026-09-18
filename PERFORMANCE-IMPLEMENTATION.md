# Performance & loading implementation — Devlin Leicester homepage

This document explains **everything** that was changed to make the homepage load fast, in the right order, without
flicker. It is written so that someone new to the project can follow it: every item says **what was wrong**,
**what was added or changed**, **where it lives**, and **why it works**.

> Line numbers refer to `index.html` as formatted at the time of writing. If the file is reformatted, search for the
> names shown in `code` instead.

---

## 1. Requirements

**A. Load in three steps**

| Step | What must appear | Rule |
|---|---|---|
| 1 | Header, brand logo, page background | Lightest first, no white screen |
| 2 | Hero photo with its text | Right after the header |
| 3 | Everything else (videos, animations, lower sections, scripts) | In the background, after 1 and 2 |

**B. No flicker, no jump** — nothing may change size, position or font after it is first drawn.

**C. Mobile must look right** — hero, headings, video bubble and founder video readable, nothing overlapping.

**D. Reuse the codebase** — use existing values and patterns; do not invent new design.

---

## 2. Results (measured)

| Measurement | Before | After |
|---|---|---|
| Lighthouse Mobile score (local, median of 3) | 58 | 63 |
| First Contentful Paint | 6.9 s | 4.8 s |
| Largest Contentful Paint | 16.2 s | 11.6 s |
| Speed Index | 7.5 s | 4.8 s |
| Page weight | 6.4 MB | 3.3 MB |
| Layout shifts while loading (CSS/JS delayed 1.5 s, desktop + phone) | 3 | **0** |
| Nav text width during load (font swap) | 87.5 px → 81.9 px | constant 81.9 px |

Lighthouse figures were taken before the final CSS work; shift and font figures are from the final version.

---

## 3. How the page loads now

```
index.html (read top to bottom; the browser paints as it goes)
│
├── <head>
│   ├── <meta charset>                        first line, so the page is never re-parsed
│   ├── preload: hero photo (fetchpriority=high)
│   ├── inline script: hero reveal timer      → adds html.hero-ready / html.bubble-ready
│   ├── <style data-critical>  STAGE 1        page base + header + embedded fonts + guards
│   └── preload: css/home.bundle.css          download starts now, NOT applied yet
│
└── <body>
    ├── <header>
    │   ├── logo  <img src="data:image/webp;base64,…">   (no download)
    │   ├── nav, social icons (embedded icon font)
    │   └── inline script: header pre-layout             → correct header layout before first paint
    ├── <style data-critical-hero>  STAGE 2              hero
    ├── hero markup  (text shown with the photo, bubble + WhatsApp tab 0.4 s later)
    ├── <style data-critical-below>  STAGE 3             first section under the hero (visible on phones)
    ├── <link … home.bundle.css>                         STEP 3: everything else, applied HERE, in one step
    ├── rest of the page
    └── scripts at the end: deferred-video script, core.min.js, script.js, nav-tooltip.js, cookie-consent.js
```

**Why the full stylesheet is applied after Stage 3 and not in `<head>`:** the three stage blocks are copies of rules
from the full stylesheet. In CSS, when two rules are equally specific, the one that appears **later** wins. The full
stylesheet must come after every stage block so it keeps the final say, exactly as when everything sat in `<head>`.
The `<head>` only holds a *preload* for it, so the download still starts immediately.

---

## 4. Catalogue: everything that was added

### 4.1 Scripts and functions

| Name / identifier | Where | What it does | Why |
|---|---|---|---|
| **Hero reveal script** — `ready()` | `index.html` `<head>`, right after the hero-photo preload (~line 36–50) | Creates `new Image()` with the same URL as the preloaded hero photo. When it loads (or fails), `ready()` adds the class `hero-ready` to `<html>`, then after 400 ms adds `bubble-ready`. A `setTimeout(ready, 3000)` calls it anyway after 3 s. | Lets CSS show the hero text only when the photo is ready (Step 2), then the video bubble and WhatsApp tab. Uses the preloaded URL, so the photo is not downloaded twice. The 3 s fallback guarantees text is never stuck hidden. |
| **Header pre-layout script** — variables `isDevice`, `breakpoints`, `layout`, `deviceLayout`, `layoutClass` | Directly after `</nav>` in `index.html` (~line 2619), `privacy-policy.html` and `cookie-policy.html` | Reads the navbar's `data-*-layout` attributes, picks the class the menu plugin would pick for this screen width (breakpoints 0 / 576 / 768 / 992 / 1200 / 1600 px, and a mobile-device check), and adds it to the `<nav>` (`rd-navbar-static` or `rd-navbar-fixed`) plus `…-linked` to `<html>`. | `style.css` hides `.rd-navbar` (`display:none`) until the plugin adds that class. Without this script the header would appear only after `core.min.js` runs. Kept inline (not a `.js` file) because an extra download here would delay the header. **The same script is in all three pages — keep them identical.** |
| **Deferred video script** — function `start(video)` | Before `js/core.min.js` at the end of `index.html` (~line 6670) | `start()` sets `preload="auto"` and calls `play()` once. Videos with `data-deferred-autoplay="load"` start on `window.load`. Videos with `="visible"` start when scrolled within 300 px (IntersectionObserver, registered only after `load` so it measures the final layout). | Step 3: videos must not compete with the header and hero for bandwidth. |
| **Slider video guard** | `js/script.js`, `toggleSwiperInnerVideos()` (~line 265) | `if (videos.length && !videos.get(0).hasAttribute('data-deferred-autoplay'))` | The slider used to start any video in the active slide immediately; deferred videos are now left to `start()`. |
| **Style injection position** | `js/cookie-consent.js` (~line 10), `js/nav-tooltip.js` (~line 28) | `(document.body \|\| document.head).appendChild(st)` instead of `document.head.appendChild(st)` | These scripts add their own CSS. Since the full stylesheet is now applied in `<body>`, CSS added to `<head>` would come first and lose. Adding it at the end of the body keeps it winning. |

### 4.2 Inline style blocks

| Block | Where | Contains | Size |
|---|---|---|---|
| `<style data-critical="">` | `<head>` (~line 51) | Stage 1: `html`, `body`, `.page`, header, fonts (incl. embedded), video pop-up guards, WhatsApp tab | ~305 rules, 46 KB |
| `<style data-critical-hero="">` | right after `</header>` (~line 2647) | Stage 2: hero | ~170 rules, 16 KB |
| `<style data-critical-below="">` | right before the first section under the hero (~line 3966) | Stage 3: that section | ~151 rules, 13 KB |

These blocks were **generated from the real stylesheets** (not hand-copied), so they match `css/home.bundle.css`
exactly. Rules kept their original order; a rule that could style something in an earlier stage went into the earliest
stage. **Do not hand-edit them** — see §7.

### 4.3 Custom CSS rules (written for this work, inside the stage blocks)

| Rule | Purpose |
|---|---|
| **Step 1 colour block** (the first rules inside `<style data-critical>`): `html, body { background-color:#fff }`, `.rd-navbar { background-color:#fff }`, `.leicester-hero .swiper-slide-bg { background-color:#3a3f44 }` | The requirement's "main background colour" as its own explicit Step 1 item. Page and header colours are the values from `css/style.css`; the hero gets a dark grey placeholder (the same grey used for the policy-page banners) that shows only until the hero photo covers it. The first paint is therefore never a blank screen. A colour cannot be "preloaded" like a file; putting it first in the inline CSS is the equivalent |
| `.leicester-hero .swiper-slide-caption, .leicester-hero .leicester-hero-video-bubble-wrap, .why-devlin-wa-rail .why-devlin-whatsapp { opacity:0; transition:opacity .25s }` | Hide hero text, video bubble and WhatsApp tab until the reveal script says so |
| `.hero-ready .leicester-hero .swiper-slide-caption { opacity:1 }` | Show hero text when the photo has loaded |
| `.bubble-ready .leicester-hero .leicester-hero-video-bubble-wrap, .bubble-ready .why-devlin-wa-rail .why-devlin-whatsapp { opacity:1 }` | Show bubble + WhatsApp tab 0.4 s after the text |
| `.video-expanded-overlay{…position:fixed;opacity:0;pointer-events:none…}` and related `.video-close-*` rules | Keep the two full-screen video pop-ups (`#storeVideoOverlay`, `#heroVideoOverlay`) invisible from the first paint. Before, they waited for the stylesheet and flashed as a big video block |
| `.service-step.is-visible .card-lite, .service-step.is-visible .media { animation: slide-top … }` + `@keyframes slide-top` | End state of the "Step Into Comfort" scroll animation. It was missing, so the cards stayed faded |
| `html .rd-navbar .rd-navbar-nav .rd-nav-link { font-family:"Roboto Nav", Roboto, … }` | Nav links use the embedded nav font (see 4.4) |
| `.why-devlin-whatsapp i { display:block; width:20px; height:20px; line-height:20px; overflow:hidden }` | Fixed box for the WhatsApp icon, so its label does not move 3 px when the icon font arrives |
| `html, body { overscroll-behavior-x: none }` | Stops the trackpad two-finger swipe from navigating to the previous/next page (also in `css/style.css`) |

### 4.4 Assets embedded in the HTML (base64)

| Asset | Where | Size | Why embedded |
|---|---|---|---|
| **Brand logo** | Header `<img class="brand-logo-dark" src="data:image/webp;base64,…">` (~line 2574) | ~14 KB | The logo is part of Step 1 and must appear instantly, with no network request. Made from `images/logo-2-301w.webp` (301 px WebP, sharp on retina, displayed at 180 × 49). The separate logo preload was removed because it is no longer needed. |
| **Social icon font** (`"Material Design Icons"`) | Stage 1, `@font-face` with `url(data:font/woff2;base64,…)` and `font-display:block` | 1.5 KB | Facebook / Instagram header icons appeared late because the font only downloaded after the header was drawn |
| **"Roboto Nav"** font | Stage 1, `@font-face { font-family:"Roboto Nav"; src:url(data:font/woff2;base64,…) }` | ~7.7 KB | A 5.8 KB subset of Roboto containing only the nav letters. Without it the nav was first drawn in a wider fallback font (87.5 px) and then narrowed to Roboto (81.9 px) |

Embedding is used **only** for tiny, must-be-instant files: embedded bytes are re-downloaded with every page view and
are not cached separately.

### 4.5 New and changed files

| File | Status | Purpose |
|---|---|---|
| `images/stores/LeicesterStoreImg.webp` | new | Hero photo, 486 KB JPG → **125 KB** WebP |
| `images/logo-2-180w.webp`, `images/logo-2-301w.webp` | new | Logo as WebP. The footer uses `srcset="…180w.webp 1x, …301w.webp 2x"`; the header embeds the 301 px version. `images/logo-2.png` stays for `og:image`, `twitter:image` and JSON-LD (social previews and Google expect PNG/JPG) |
| `videos/michael-preview.mp4` | new | 5-second, 320 px preview for the founder play button: 13.5 MB → **488 KB**. Clicking still opens the full `videos/michael.mp4` |
| `GrobyProjects/*/thumbs/*.webp` | new | 700 px gallery thumbnails (6.54 MB → 2.57 MB). Clicking still opens the full photo |
| Other `images/**/*.webp` | new | WebP versions of 35 large JPG/PNG images |
| `css/fonts.subset.css`, `css/fontawesome-6.4.0.subset.min.css` | new (generated) | Icon CSS trimmed to the 27 icons in use (293 KB → 25 KB); `font-display:swap` |
| `css/style.min.css`, `css/bootstrap.min.css` | new (generated) | Minified versions |
| `css/home.css` | new | Homepage styles below the first screen, moved out of the old 5,691-line inline block |
| `css/home.bundle.css` | new (generated) | **The homepage's only stylesheet**: `home.css` + `local-fonts.css` + `fonts.subset.css` + `bootstrap.min.css` + `style.min.css` + Font Awesome subset, in that order |
| `css/style.css` | changed | `.page` no longer `opacity:0`; hero height `calc(80vh + 60px)` / `calc(80vh + 90px)` like the live site; removed the extra mobile `55vh` rule; `overscroll-behavior-x`; mobile hero text bottom-aligned |
| `index.html`, `privacy-policy.html`, `cookie-policy.html` | changed | See sections 4.1–4.4 and 5 |
| `js/script.js`, `js/cookie-consent.js`, `js/nav-tooltip.js` | changed | See 4.1 |
| `.gitignore` | new | Ignores `.DS_Store` |

---

## 5. Every fix, explained

### 5.1 Loading screen removed

**Was:** `<div class="preloader">` covered the page until `js/script.js` removed it on `window.load` — after every image
and video had finished. About 2 s of spinner on a phone.

**Now:** the preloader block is deleted from all three pages. The `opacity: 0` on `.page` in `css/style.css` was also
removed; the preloader script was the only thing that faded `.page` in, so without that removal every page stayed blank.

### 5.2 Step 1 exactly: header CSS, brand logo, main background colour

| Step 1 item | How it is delivered | Network request needed? |
|---|---|---|
| Main background colour | The **Step 1 colour block**, first rules in `<style data-critical>` (4.3) | No |
| Header CSS | The rest of `<style data-critical>` in `<head>` + the header pre-layout script (4.1) | No |
| Brand logo | Base64 inside the header `<img>` (4.4) | No |
| Header social icons, nav font | Embedded fonts (4.4) | No |

Everything Step 1 needs arrives inside the HTML itself, so the header is drawn in the first paint.

### 5.3 Hero photo early and small

`<link rel="preload" href="images/stores/LeicesterStoreImg.webp" as="image" fetchpriority="high">` in `<head>`, and
the same URL written directly into the hero slide's `style="background-image: …"`. Before, the photo was set only by
JavaScript through `data-slide-bg`, which the browser cannot see early: the download started at 1.54 s instead of
~0.6 s. `fetchpriority="high"` is used once per page, for this image only.

### 5.4 Hero text, bubble and WhatsApp tab in order

The template's first-slide animation attributes (`data-caption-animate`, `data-caption-delay="1200"` — a deliberate
1.2 s pause) were removed. The reveal script + rules in 4.1 / 4.3 now give: **photo → text → 0.4 s → bubble + WhatsApp tab**.

### 5.5 Videos last

| Video | Before | After |
|---|---|---|
| Hero bubble (`LeicesterStoreVideo-bubble.mp4`) | `autoplay preload="auto"` | `preload="none" data-deferred-autoplay="load"` |
| Founder preview | `autoplay preload="metadata"` (13.5 MB file) | `preload="none" data-deferred-autoplay="visible"` (488 KB file) |

### 5.6 One stylesheet instead of six

Six background stylesheets applied one by one as each arrived. For ~22 ms Bootstrap was active without `style.min.css`,
and the hero text box changed height (368 → 357 → 368 px). They are now one file, `css/home.bundle.css`, applied in one step.

### 5.7 Inline CSS that matches the stylesheet

The original 5,691-line inline block was hand-copied and had drifted from `style.css`, causing: nav text 13 → 14 px on
load, hero 780 → 720 px on load, and the "Step Into Comfort" cards stuck faded. The inline CSS is now generated from
the real stylesheets and split into the three stages (4.2). Result: 0 differences between "inline only" and "everything
loaded" for the header and hero.

### 5.8 Mobile layout

| Issue | Cause | Fix |
|---|---|---|
| Hero photo shrunk, text under the bubble | Extra `"Shorter hero height on mobile" → 55vh` rule, not on the live site | Removed; hero is 70vh again (568 px on a 375 × 812 phone) |
| Section headings 36 px, 4 lines on phones | The codebase's 30 px phone rule was written **before** the ≤991.98 px rule, so it never applied | Phone rule moved after the tablet rule in `css/home.css`. A scan of all CSS found no other case |
| "Visit Our Groby… Today" 32 px (bigger than the h1) | `style="font-size: 32px"` written in the HTML | Attribute removed; it uses the codebase h4 size (26 px phone / 36 px desktop) |
| Video bubble touching the header | `top: 48px`; mobile header is 56 px tall | Bubble 90 → **72 px**, `top: 64px` (existing ≤575 px block) |
| "Request a Measure" mid-photo with empty space below | Caption vertically centred | Mobile hero block: `align-items: flex-end; padding-bottom: 40px` |
| Founder play button (128 px) covering the "Our Promise" card | No phone rule for the button | Added to the existing ≤575 px block: button **80 px**, icon **40 px** |

### 5.9 Smaller fixes

| Fix | Why |
|---|---|
| `<meta charset="utf-8">` moved to the first line of `<head>` | Must be in the first 1,024 bytes or the browser may re-parse the page |
| `css/page.css` link removed | File does not exist; 404 on every visit |
| Italic Roboto removed from the inline CSS | 41 KB was queued early; the first screen has no italics |
| Icon fonts set to `font-display: swap` | `block` hid icons up to 3 s (Lighthouse: ~650 ms) |
| `?v=…` on every changed CSS/JS link | Forces browsers to fetch the new file. An old cached stylesheet with new HTML can produce a **blank page** |

---

## 6. Files a developer needs to know

**Edit these:** `css/style.css` (all pages), `css/home.css` (homepage below the first screen), `css/bootstrap.css`, and
the three HTML pages.

**Never hand-edit these (they are generated):** `css/style.min.css`, `css/bootstrap.min.css`, `css/fonts.subset.css`,
`css/fontawesome-6.4.0.subset.min.css`, `css/home.bundle.css`, and the three `<style data-critical…>` blocks in `index.html`.

**Must be deployed:** everything above plus `js/`, `images/`, `videos/`, `fonts/`, `webfonts/`, `GrobyProjects/`.
`css/home.bundle.css` is the homepage's only stylesheet — without it the page is unstyled below the hero.

---

## 7. Making changes later

The build scripts used for this work were local-only and are **not** in the repository. Before changing styles:

1. Edit `css/style.css` or `css/home.css`.
2. Rebuild the generated files:
   * minify: `npx clean-css-cli@5 -O1 -o css/style.min.css css/style.css` (same for `bootstrap.css`);
   * bundle: concatenate, in this order, `css/home.css`, `css/local-fonts.css`, `css/fonts.subset.css`,
     `css/bootstrap.min.css`, `css/style.min.css`, `css/fontawesome-6.4.0.subset.min.css` into `css/home.bundle.css`
     (remove the `@charset` line from each and put one `@charset "UTF-8";` at the top).
3. If the change touches the **header, hero or the first section**, the matching stage block in `index.html` must be
   updated with the same rule, or the element will change when the stylesheet loads (the jump comes back).
4. If you add a new icon class, add its rule to the icon subset files, or it shows as a blank space.
5. Bump `?v=` on `home.bundle.css` in `index.html` (3 places: preload in `<head>`, link after Stage 3, `<noscript>`)
   and on `style.min.css` in the policy pages.
6. Commit the generated files together with the sources.

---

## 8. How it was verified

* **Layout shifts:** a local server delaying every CSS and JS file by 1.5 s, and `PerformanceObserver` recording each
  shift and the element that moved. Final: **0 shifts** at 1400 px and 375 px.
* **No visual change:** computed styles of every element compared before/after each change (1,005 elements desktop,
  998 phone). Final: **0 differences**.
* **Stages are complete:** header and hero styles compared with only the inline CSS vs everything loaded.
* **Speed:** Lighthouse CLI, 3 runs per version, median.
* **Fonts:** nav link width sampled every 50 ms during load.

---

## 9. Not done (known)

| Item | Note |
|---|---|
| `js/core.min.js` (648 KB) | Template plugin bundle, mostly unused; trimming needs full feature testing |
| Phone-sized hero photo | Still 1920 px / 125 KB; a phone version would save ~70–80 KB |
| Responsive `srcset` for card/testimonial images | Tried and reverted; can be retried and measured on its own |
| "Forced reflow" (~157 ms) | From the template's start-up scripts; Lighthouse marks it unscored |
| `css/homepage.css`, `css/one.css`, `css/one1.css` | Not linked by any page; probably safe to delete after a check |
| Accessibility (score 69) | Missing labels, low contrast, `user-scalable="no"`; separate pass recommended |
