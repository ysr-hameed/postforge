# PostForge

Social post visual engine. **The AI writes only the body.** Fonts, brand header/footer, colors, spacing,
safe margins and fitting belong to the engine. Rendering is done by **Takumi** (Rust, no headless browser).

```
website URL
   │  src/brain/siteReader.js     reads title/meta/headings/theme-color  -> site profile
   ▼
strategist  (src/brain/strategist.js)   decides WHAT to post + WHICH visual type
   ▼
promptComposer (src/brain/promptComposer.js)   builds the exact prompt a visual-writer LLM gets  (shown in the UI)
   ▼
visual-writer LLM (src/brain/mockLLM.js)       returns BODY HTML ONLY      <- replace this with a real model later
   ▼
ENGINE (src/engine/*)
   sanitize.js   whitelist tags / pf-* classes / safe style props, strips emoji + scripts
   shell.js      canvas, decoration, header, footer (same every time)
   baseCss.js    the design system (type scale, cards, chips, grids...)
   fit.js        measures with Takumi, finds overflow/overlap, picks the LARGEST scale that fits
                 levers: type scale -> spacing density -> drop pf-optional blocks -> clip (flagged)
   render.js     Takumi Renderer + bundled fonts -> PNG + report
```

## Run
```bash
npm install
npm start                 # UI at http://localhost:3000
node cli.js --demo        # renders sample posts into samples/
node cli.js --url yoursite.com --topic "Diwali wishes" --count 6 --format portrait --style mix --photos a.jpg,b.jpg
node test/matrix.mjs      # 520 renders (10 brands x 4 formats x auto/mix) + hostile-body test
```
Formats: `portrait` 1080x1350, `square` 1080x1080, `story` 1080x1920 (extra safe zones), `landscape` 1200x675.

## v2: moods, creative type, images
- **12 style packs** (`src/engine/theme.js`): midnight, luxe, paper, retro, brutal, poster, soft, neon, earthy, festive, playful, clean.
  Each owns its fonts, palette, corner radius, border, shadow, headline case and background decoration. `--style auto|mix|<name>`.
  `auto` = matches the detected business, `mix` = a different mood per post.
- **No Inter.** 19 families bundled: DM Sans (body), Space Grotesk, Fraunces, Instrument Serif, DM Serif Display, Playfair, Archivo Black, Anton,
  Bebas Neue, Bricolage Grotesque, Unbounded, Syne, Fredoka, Baloo 2, Rozha One, Caveat, Kalam, Space Mono, Noto Sans Devanagari (Hindi fallback).
  The AI mixes them inside one headline with font-role classes (`pf-flair pf-script pf-serif-i pf-mono pf-cond ...`).
- **Images**: `<div class="pf-photo pf-ph-grow"><img data-slot="hero"></div>`. The AI never writes a URL. Slots are filled from
  (1) photos you upload, (2) photos found on the website (og:image + `<img>`), (3) procedural art plates (SVG, palette-aware).
  `hero-photo` posts use a full-bleed photo background with an automatic readability overlay.
- **16 visual types** across 17 niches (dev, restaurant, cafe, fitness, fashion, ecommerce, beauty, jewelry, real estate, travel, education,
  agency, events, kids, health, finance, coach). Occasion topics ("Diwali wishes", "birthday") produce greeting posts.
- Real photos are only as good as what the site or you provide. The art plates are illustrations, not photography.
- Takumi gotcha: inline `background-color` on a wrapped `<span>` renders wrong, so there is no highlighter-box class. Use pf-underline, font roles or pf-accent.

## What the AI is allowed to write
Tags: `div span p h1 h2 h3 b strong em br small ul ol li img` (img only as `<img data-slot=...>`). Classes: only `pf-*` (see `promptComposer.js` VOCAB).
Inline style only: color, background, text-align, justify-content, align-items, flex-grow, grid-template-columns, width %, opacity, `--v`.
Everything else is dropped and listed in the report. Wrap non-essential blocks in `pf-optional` so the engine can drop them instead of overflowing.

## Plug in a real LLM later
Replace `writeBody()` in `src/brain/mockLLM.js` with an API call that sends `composePrompt(...).system` and `.user`
and returns the model's text. Same for `planPosts()` (strategist) and `analyzeSite()`. Nothing else changes: the
sanitizer and fit loop protect you from whatever the model writes.

## Notes
- Stats marked `verify: true` in the strategist are placeholders. Replace with real numbers before posting.
- Takumi findings (v2.22): CSS vars, calc, grid, gradients, background-clip:text, rotate and shadows work;
  `-webkit-line-clamp` did not clamp; `renderer.needs()` is typed but absent in the native binding. Wrap thresholds
  are exact, so fit.js backs off 1.5% and re-verifies the value it renders.
- Fonts bundled in `fonts/`: Inter, Space Grotesk, Playfair Display, Anton, Noto Sans Devanagari (Hindi). All OFL.
  No emoji font, so emoji are stripped. Add a font in `render.js` FONTS + `theme.js` FONT_PAIRS.
- Termux: `@takumi-rs/core` ships prebuilt binaries for linux/macos/windows only, no Android target. Run inside
  `proot-distro` Ubuntu (arm64-gnu binary) or on a small VPS/Render. Not tested on a device.
# postforge
