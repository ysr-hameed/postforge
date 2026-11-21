// STYLE PACKS: each mood owns its fonts, palette, radius, border, shadow, headline case and background decoration.
// The AI never picks any of this; the engine (or the user) picks a style per brand.
export function hexToRgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export const rgba = (hex, a) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };
export function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
export function lum(hex) { const [r, g, b] = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export function hslToHex(h, s, l) { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join(""); }

const HI = "'Noto Sans Devanagari'";
const F = {
  sg: `'Space Grotesk',${HI}`, dm: `'DM Sans',${HI}`, fr: `'Fraunces',${HI}`, is: `'Instrument Serif',${HI}`, dms: `'DM Serif Display',${HI}`,
  ab: `'Archivo Black',${HI}`, an: `'Anton',${HI}`, bri: `'Bricolage Grotesque',${HI}`, ub: `'Unbounded',${HI}`, rz: `'Rozha One',${HI}`,
  fr2: `'Fredoka','Baloo 2',${HI}`, sy: `'Syne',${HI}`, cav: `'Caveat',${HI}`, kal: `'Kalam',${HI}`, mono: `'Space Mono',${HI}`, pf: `'Playfair Display',${HI}`,
};

// pal(accent) -> colors. `flip` = brand color is the page background, highlight role becomes ink.
export const STYLES = {
  midnight: { label: "Midnight (dark tech)", head: F.sg, body: F.dm, flair: F.is, flairItalic: 1, kicker: F.mono, headW: 700, tt: "none", ls: "-0.03em", hs: 1, rad: 36, bw: 2, shadow: "none", deco: "blobs",
    pal: (a) => ({ bg: mix("#0b0b12", a, 0.1), bg2: mix("#0b0b12", a, 0.28), ink: "#f6f6fb", mute: "#a9a9bd", card: "rgba(255,255,255,0.07)", line: "rgba(255,255,255,0.14)" }) },
  luxe: { label: "Luxe (black + gold, serif)", head: F.fr, body: F.dm, flair: F.is, flairItalic: 1, kicker: F.dm, headW: 600, tt: "none", ls: "-0.02em", hs: 0.96, rad: 10, bw: 2, shadow: "none", deco: "rings", defAccent: "#d4af37",
    pal: (a) => ({ bg: mix("#0d0b09", a, 0.1), bg2: mix("#0d0b09", a, 0.2), ink: "#f4ecd8", mute: "#b9ad92", card: "rgba(255,240,200,0.06)", line: rgba(a, 0.45) }) },
  paper: { label: "Paper (editorial cream)", head: F.fr, body: F.dm, flair: F.cav, flairItalic: 0, kicker: F.dm, headW: 700, tt: "none", ls: "-0.025em", hs: 0.98, rad: 14, bw: 2, shadow: "none", deco: "lines", defAccent: "#c8482b",
    pal: () => ({ bg: "#f5f0e6", bg2: "#ebe3d0", ink: "#1b1a17", mute: "#6b665a", card: "rgba(27,26,23,0.05)", line: "rgba(27,26,23,0.2)" }) },
  retro: { label: "Retro (cream, hard shadows)", head: F.dms, body: F.dm, flair: F.cav, flairItalic: 0, kicker: F.mono, headW: 400, tt: "none", ls: "-0.01em", hs: 1.02, rad: 22, bw: 4, shadow: "9px 9px 0 #1d1a16", deco: "sunburst", defAccent: "#e4572e",
    pal: () => ({ bg: "#f6e9cf", bg2: "#f0dcb4", ink: "#1d1a16", mute: "#5d5446", card: "#fff7e4", line: "#1d1a16" }) },
  brutal: { label: "Brutalist (heavy, mono)", head: F.ab, body: F.dm, flair: F.is, flairItalic: 1, kicker: F.mono, headW: 400, tt: "uppercase", ls: "-0.02em", hs: 0.84, rad: 0, bw: 5, shadow: "10px 10px 0 #0d0d0d", deco: "stripes", defAccent: "#ffd400",
    pal: () => ({ bg: "#f2efe6", bg2: "#e6e1d2", ink: "#0d0d0d", mute: "#4a4a44", card: "#ffffff", line: "#0d0d0d" }) },
  poster: { label: "Poster (brand-color bg, condensed)", head: F.an, body: F.dm, flair: F.is, flairItalic: 1, kicker: F.mono, headW: 400, tt: "uppercase", ls: "0.005em", hs: 1.12, rad: 22, bw: 3, shadow: "none", deco: "blobs", flip: true,
    pal: (a) => ({ bg: a, bg2: mix(a, "#000000", 0.35), ink: lum(a) > 0.4 ? "#101018" : "#ffffff", mute: lum(a) > 0.4 ? "rgba(16,16,24,0.7)" : "rgba(255,255,255,0.78)", card: lum(a) > 0.4 ? "rgba(16,16,24,0.1)" : "rgba(255,255,255,0.16)", line: lum(a) > 0.4 ? "rgba(16,16,24,0.3)" : "rgba(255,255,255,0.35)" }) },
  soft: { label: "Soft (pastel, rounded)", head: F.bri, body: F.dm, flair: F.cav, flairItalic: 0, kicker: F.dm, headW: 800, tt: "none", ls: "-0.03em", hs: 1, rad: 58, bw: 0, shadow: "0 22px 50px rgba(60,30,60,0.10)", deco: "blobs", defAccent: "#e0568a",
    pal: (a) => ({ bg: mix("#fff8f6", a, 0.1), bg2: mix("#fff0ee", a, 0.26), ink: "#2b2430", mute: "#7a6f80", card: "rgba(255,255,255,0.78)", line: rgba(a, 0.25) }) },
  neon: { label: "Neon (nightlife, gaming)", head: F.ub, body: F.dm, flair: F.mono, flairItalic: 0, kicker: F.mono, headW: 800, tt: "none", ls: "-0.045em", hs: 0.76, rad: 24, bw: 2, shadow: "none", deco: "grid", defAccent: "#b6ff3b", glow: true,
    pal: (a) => ({ bg: mix("#07060f", a, 0.1), bg2: mix("#07060f", a, 0.26), ink: "#f4f2ff", mute: "#a8a3c8", card: "rgba(255,255,255,0.06)", line: rgba(a, 0.55) }) },
  earthy: { label: "Earthy (organic, warm)", head: F.fr, body: F.dm, flair: F.is, flairItalic: 1, kicker: F.dm, headW: 700, tt: "none", ls: "-0.025em", hs: 1, rad: 60, bw: 0, shadow: "none", deco: "arches", defAccent: "#4f7a4a",
    pal: (a) => ({ bg: "#efe6d2", bg2: "#e2d4b4", ink: "#2a2418", mute: "#6d6246", card: "rgba(42,36,24,0.07)", line: "rgba(42,36,24,0.2)" }) },
  festive: { label: "Festive (maroon + gold)", head: F.rz, body: F.dm, flair: F.kal, flairItalic: 0, kicker: F.dm, headW: 400, tt: "none", ls: "0em", hs: 0.94, rad: 30, bw: 2, shadow: "none", deco: "sunburst", defAccent: "#f2b632",
    pal: (a) => ({ bg: mix("#2a0710", a, 0.08), bg2: mix("#4a0d1b", a, 0.12), ink: "#fff3d6", mute: "#e0c9a0", card: "rgba(255,230,170,0.09)", line: rgba(a, 0.5) }) },
  playful: { label: "Playful (bright, bubbly)", head: F.fr2, body: F.dm, flair: F.cav, flairItalic: 0, kicker: F.dm, headW: 700, tt: "none", ls: "-0.02em", hs: 0.98, rad: 40, bw: 4, shadow: "7px 7px 0 #1b1340", deco: "confetti", defAccent: "#ff6b3d",
    pal: (a) => ({ bg: mix("#fffaf0", a, 0.16), bg2: mix("#fff2d6", a, 0.3), ink: "#1b1340", mute: "#574c85", card: "#ffffff", line: "#1b1340" }) },
  clean: { label: "Clean (minimal, white)", head: F.sy, body: F.dm, flair: F.is, flairItalic: 1, kicker: F.dm, headW: 800, tt: "none", ls: "-0.035em", hs: 0.92, rad: 8, bw: 2, shadow: "none", deco: "none", defAccent: "#1f3dff",
    pal: () => ({ bg: "#ffffff", bg2: "#f1f0ec", ink: "#111111", mute: "#6a6a66", card: "rgba(17,17,17,0.04)", line: "rgba(17,17,17,0.16)" }) },
};
export const STYLE_KEYS = Object.keys(STYLES);
const LEGACY = { dark: "midnight", light: "clean", bold: "poster" };

export function buildTheme(brand = {}, opts = {}) {
  const key = STYLES[brand.style] ? brand.style : STYLES[LEGACY[brand.mood]] ? LEGACY[brand.mood] : STYLE_KEYS.includes(brand.mood) ? brand.mood : "midnight";
  const st = STYLES[key];
  const brandColor = brand.accent || st.defAccent || "#ff5a36";
  let pal = st.pal(brandColor);
  const flip = !!st.flip;
  let accent = flip ? pal.ink : brandColor;
  let accent2 = flip ? (lum(brandColor) > 0.4 ? "#3a3a4a" : "#e8e8f0") : (brand.accent2 || mix(brandColor, lum(pal.bg) > 0.5 ? "#000000" : "#ffffff", 0.35));
  let onAccent = flip ? brandColor : (lum(brandColor) > 0.42 ? "#101018" : "#ffffff");
  // photo background: force light-on-dark palette so text is always readable on top of any image
  if (opts.photoBg) {
    pal = { ...pal, ink: "#ffffff", mute: "rgba(255,255,255,0.82)", card: "rgba(0,0,0,0.42)", line: "rgba(255,255,255,0.35)" };
    // the overlay is dark, so the highlight color must be light enough to read on it
    accent = flip ? "#ffffff" : (lum(brandColor) < 0.5 ? mix(brandColor, "#ffffff", 0.55) : brandColor);
    onAccent = flip ? "#101018" : (lum(accent) > 0.42 ? "#101018" : "#ffffff");
    accent2 = flip ? "#f1f1f1" : mix(accent, "#ffffff", 0.3);
  }
  const shadow = st.glow ? `0 0 46px ${rgba(brandColor, 0.38)}` : st.shadow.replace(/#1d1a16|#0d0d0d|#1b1340/, pal.line.startsWith("#") ? pal.line : pal.ink);
  const flair = st.flair;
  const flairK = flair === F.cav ? 1.34 : flair === F.kal ? 1.12 : flair === F.is ? 1.24 : 0.9;
  return {
    key, st, mood: lum(pal.bg) > 0.5 ? "light" : "dark", accent, accent2, onAccent, pal, brandColor, deco: flip ? pal.ink : brandColor, photoBg: !!opts.photoBg,
    vars: `--accent:${accent};--accent2:${accent2};--accent-soft:${rgba(accent, 0.18)};--on-accent:${onAccent};` +
      `--bg:${pal.bg};--bg2:${pal.bg2};--ink:${pal.ink};--mute:${pal.mute};--card:${pal.card};--line:${pal.line};` +
      `--font-head:${st.head};--font-body:${st.body};--font-flair:${flair};--font-kicker:${st.kicker};--head-w:${st.headW};--head-tt:${st.tt};--head-ls:${st.ls};--hs:${st.hs};` +
      `--rad:${st.rad};--bw:${st.bw};--shadow:${shadow};--flair-style:${st.flairItalic ? "italic" : "normal"};--flair-k:${flairK};`,
  };
}
