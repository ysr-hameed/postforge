import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Native binary where it exists (x86/arm Linux, mac, win). On Android/Termux there is no native
// binary, so fall back to the WASM build, which has the same API and runs everywhere.
async function loadRenderer() {
  try {
    const mod = await import("@takumi-rs/core");
    return mod.Renderer;
  } catch {
    const mod = await import("@takumi-rs/wasm/node");
    if (mod.init) await mod.init();
    return mod.Renderer;
  }
}
import { buildTheme } from "./theme.js";
import { buildDocument } from "./shell.js";
import { sanitizeBody } from "./sanitize.js";
import { fitScale } from "./fit.js";
import { getFormat } from "./formats.js";
import { makeArt } from "./art.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.resolve(here, "../../fonts");
// [family, file, weight?, style?]  (variable fonts: no weight -> full range)
const FONTS = [
  ["DM Sans", "DMSans.ttf"], ["Space Grotesk", "SpaceGrotesk.ttf"], ["Fraunces", "Fraunces.ttf"], ["Fraunces", "FrauncesItalic.ttf", null, "italic"],
  ["Instrument Serif", "InstrumentSerif.ttf", 400], ["Instrument Serif", "InstrumentSerifItalic.ttf", 400, "italic"], ["DM Serif Display", "DMSerifDisplay.ttf", 400],
  ["Playfair Display", "PlayfairDisplay.ttf"], ["Playfair Display", "PlayfairItalic.ttf", null, "italic"],
  ["Archivo Black", "ArchivoBlack.ttf", 400], ["Anton", "Anton-Regular.ttf", 400], ["Bebas Neue", "BebasNeue.ttf", 400],
  ["Bricolage Grotesque", "Bricolage.ttf"], ["Unbounded", "Unbounded.ttf"], ["Syne", "Syne.ttf"], ["Fredoka", "Fredoka.ttf"], ["Baloo 2", "Baloo2.ttf"],
  ["Rozha One", "RozhaOne.ttf", 400], ["Caveat", "Caveat.ttf"], ["Kalam", "Kalam.ttf", 700], ["Space Mono", "SpaceMono.ttf", 700],
  ["Noto Sans Devanagari", "NotoSansDevanagari.ttf"],
];

let rendererPromise;
async function getRenderer() {
  rendererPromise ||= (async () => {
    const Renderer = await loadRenderer();
    const r = new Renderer();
    for (const [name, file, weight, style] of FONTS) {
      await r.registerFont({ name, data: fs.readFileSync(path.join(FONT_DIR, file)), ...(weight ? { weight } : {}), ...(style ? { style } : {}) });
    }
    return r;
  })();
  return rendererPromise;
}

const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const SLOT_ORDER = ["hero", "a", "b", "c"];

function resolveImages({ slots, photos, theme, seed }) {
  const real = [], holder = [], info = {};
  for (const slot of slots) {
    const i = SLOT_ORDER.indexOf(slot), photo = photos[i];
    const data = photo || makeArt({ theme, seed, slotIndex: i });
    info[slot] = photo ? "photo" : "art";
    real.push({ src: `pf-slot-${slot}`, data });
    holder.push({ src: `pf-slot-${slot}`, data: PIXEL });
  }
  return { real, holder, info };
}

/**
 * renderPost({ body, brand, format, tag, seed, photos, photoBg })
 *  body    : HTML the AI wrote (ONLY the body zone)
 *  brand   : { name, accent, style, cta, url }   style = one of STYLES (midnight, luxe, paper, retro, ...)
 *  photos  : Buffer[] real images (site/uploads); missing slots get procedural art
 *  photoBg : true -> first photo (or art) becomes a full-bleed background with a readability overlay
 */
export async function renderPost({ body, brand = {}, format = "portrait", tag = "", seed = 7, debug = false, photos = [], photoBg = false }) {
  const t0 = performance.now();
  const r = await getRenderer();
  const fmt = getFormat(format);
  const theme = buildTheme(brand, { photoBg });
  const { root, warnings } = sanitizeBody(body);

  const usedSlots = () => [...new Set(root.querySelectorAll("img").map((i) => i.getAttribute("data-slot")))];
  const bgSlot = photoBg ? "hero" : null;
  const wantSlots = () => [...new Set([...usedSlots(), ...(bgSlot ? ["hero"] : [])])];
  const bgSrc = photoBg ? "pf-slot-hero" : null;

  const docFor = (bodyHtml, scale, density = 1, clip = false, withDeco = true) =>
    buildDocument({ bodyHtml, brand, theme, fmtKey: format, scale, density, clip, tag, seed, withDeco, bgSrc });
  // layout never depends on pixels (images are absolutely positioned) -> measure with 1x1 placeholders, no decoration
  const measure = (bodyHtml, scale, density = 1) => {
    const { html, css } = docFor(bodyHtml, scale, density, false, false);
    return r.measure(html, { width: fmt.w, height: fmt.h, css: [css], images: resolveImages({ slots: wantSlots(), photos, theme, seed }).holder });
  };

  const fit = await fitScale({ measure, bodyRoot: root });
  const finalBody = root.innerHTML;
  const imgs = resolveImages({ slots: wantSlots(), photos, theme, seed });
  const { html, css } = docFor(finalBody, fit.scale, fit.density, !fit.ok, true);
  const png = await r.render(html, { width: fmt.w, height: fmt.h, format: "png", css: [css], images: imgs.real, drawDebugBorder: debug });

  const issues = fit.result?.issues || [];
  const report = {
    format: `${fmt.w}x${fmt.h}`, style: theme.key, styleLabel: theme.st.label,
    scale: Math.round(fit.scale * 1000) / 1000, density: fit.density,
    fillPct: Math.round((fit.result?.fill || 0) * 100),
    passed: fit.ok && issues.length === 0, clipped: !fit.ok,
    issues, droppedOptional: fit.dropped,
    sanitizerWarnings: [...new Set(warnings)],
    images: imgs.info, photoBackground: photoBg,
    checks: [
      { name: "No overflow (x/y)", pass: !issues.some((i) => i.type.startsWith("overflow") || i.type.startsWith("text-overflow")) },
      { name: "No overlap", pass: !issues.some((i) => i.type === "overlap") },
      { name: "Safe margins respected", pass: fit.ok },
      { name: "Only whitelisted tags/classes", pass: warnings.length === 0 },
    ],
    ms: Math.round(performance.now() - t0),
  };
  return { png, html, css, body: finalBody, report };
}
