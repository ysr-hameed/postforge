// Procedural art plates (SVG) used when a post has no real photo. Palette-aware, seeded, style-aware.
// These are illustrations, not photos. Real photos come from the website or user uploads.
import { mix, lum } from "./theme.js";

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const W = 1200, H = 900;

function blobPath(r, cx, cy, rad, wob) {
  const n = 7, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = rad * (1 - wob + r() * wob * 2); pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
  let d = `M${((pts[0][0] + pts[n - 1][0]) / 2).toFixed(1)},${((pts[0][1] + pts[n - 1][1]) / 2).toFixed(1)}`;
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; d += `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`; }
  return d + "Z";
}

const KINDS = {
  blobs(r, c) {
    let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="${blobPath(r, W * (0.2 + r() * 0.6), H * (0.2 + r() * 0.6), 280 + r() * 220, 0.3)}" fill="${c.pick(r)}" opacity="${(0.75 + r() * 0.25).toFixed(2)}"/>`;
    for (let i = 0; i < 6; i++) s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(14 + r() * 40).toFixed(0)}" fill="${c.ink}" opacity="0.14"/>`;
    return s;
  },
  rings(r, c) {
    const cx = W * (0.35 + r() * 0.3), cy = H * (0.35 + r() * 0.3);
    let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>`;
    for (let i = 12; i >= 1; i--) s += `<circle cx="${cx}" cy="${cy}" r="${i * 62}" fill="${i % 2 ? c.a : c.b}" opacity="${(0.25 + (12 - i) * 0.06).toFixed(2)}"/>`;
    return s + `<circle cx="${cx}" cy="${cy}" r="70" fill="${c.ink}" opacity="0.9"/>`;
  },
  waves(r, c) {
    let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>`;
    const bands = 7;
    for (let i = 0; i < bands; i++) {
      const y = H * (0.18 + i * 0.12), amp = 40 + r() * 60, ph = r() * 6;
      let d = `M0,${H} L0,${y}`;
      for (let x = 0; x <= W; x += 40) d += ` L${x},${(y + Math.sin(x / 170 + ph) * amp).toFixed(1)}`;
      s += `<path d="${d} L${W},${H}Z" fill="${c.pick(r)}" opacity="${(0.55 + i * 0.07).toFixed(2)}"/>`;
    }
    return s;
  },
  dots(r, c) {
    let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>`;
    const gap = 44, ox = r() * W, oy = r() * H;
    for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) {
      const d = Math.hypot(x - ox, y - oy) / Math.hypot(W, H), rad = Math.max(1.5, (1 - d) * gap * 0.46);
      s += `<circle cx="${x}" cy="${y}" r="${rad.toFixed(1)}" fill="${d < 0.5 ? c.a : c.b}"/>`;
    }
    return s;
  },
  mosaic(r, c) {
    let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>`;
    const n = 4, cw = W / (n + 2), ch = H / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n + 2; x++) {
      const px = x * cw, py = y * ch, col = c.pick(r), col2 = c.pick(r), t = Math.floor(r() * 4);
      s += `<rect x="${px}" y="${py}" width="${cw}" height="${ch}" fill="${col2}"/>`;
      const R = Math.min(cw, ch);
      if (t === 0) s += `<path d="M${px},${py + ch} L${px},${py} A${R},${R} 0 0 1 ${px + R},${py + ch}Z" fill="${col}"/>`;
      else if (t === 1) s += `<circle cx="${px + cw / 2}" cy="${py + ch / 2}" r="${R * 0.38}" fill="${col}"/>`;
      else if (t === 2) s += `<path d="M${px + cw},${py} L${px + cw},${py + ch} L${px},${py + ch}Z" fill="${col}"/>`;
      else s += `<rect x="${px + cw * 0.2}" y="${py + ch * 0.2}" width="${cw * 0.6}" height="${ch * 0.6}" rx="${R * 0.3}" fill="${col}"/>`;
    }
    return s;
  },
  sunrise(r, c) {
    let s = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.b}"/><stop offset="1" stop-color="${c.bg}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sk)"/>`;
    const cx = W * (0.3 + r() * 0.4), hy = H * 0.66;
    for (let i = 5; i >= 1; i--) s += `<circle cx="${cx}" cy="${hy}" r="${i * 95}" fill="${i % 2 ? c.a : c.ink}" opacity="${(0.18 + (5 - i) * 0.14).toFixed(2)}"/>`;
    s += `<rect x="0" y="${hy}" width="${W}" height="${H - hy}" fill="${c.bg}"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${(r() * W * 0.3).toFixed(0)}" y="${hy + 24 + i * 34}" width="${(W * (0.4 + r() * 0.55)).toFixed(0)}" height="9" rx="4" fill="${c.pick(r)}" opacity="0.7"/>`;
    return s;
  },
  arches(r, c) {
    let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>`;
    const n = 3, aw = W / (n + 1);
    for (let i = 0; i < n; i++) {
      const x = aw * 0.5 + i * aw * 1.0 + (r() * 20 - 10), h = H * (0.5 + r() * 0.35);
      for (let k = 0; k < 3; k++) { const w = aw * (0.9 - k * 0.22), xx = x + (aw * 0.9 - w) / 2, hh = h - k * 50; s += `<path d="M${xx},${H} L${xx},${H - hh + w / 2} A${w / 2},${w / 2} 0 0 1 ${xx + w},${H - hh + w / 2} L${xx + w},${H}Z" fill="${[c.a, c.b, c.ink][k]}" opacity="${[0.95, 0.9, 0.85][k]}"/>`; }
    }
    return s + `<circle cx="${W * (0.7 + r() * 0.2)}" cy="${H * 0.2}" r="90" fill="${c.a}" opacity="0.9"/>`;
  },
  stripes(r, c) {
    let s = `<rect width="${W}" height="${H}" fill="${c.bg}"/>`;
    for (let i = -6; i < 22; i++) s += `<polygon points="${i * 90},0 ${i * 90 + 46},0 ${i * 90 - 500 + 46},${H} ${i * 90 - 500},${H}" fill="${i % 3 ? c.a : c.b}" opacity="0.9"/>`;
    return s + `<circle cx="${W * (0.3 + r() * 0.4)}" cy="${H * 0.5}" r="${190 + r() * 60}" fill="${c.ink}"/><circle cx="${W * 0.5}" cy="${H * 0.5}" r="90" fill="${c.bg}" opacity="0.0"/>`;
  },
};
export const ART_KINDS = Object.keys(KINDS);
const PREFS = {
  midnight: ["blobs", "rings", "waves"], luxe: ["rings", "arches", "waves"], paper: ["mosaic", "arches", "sunrise"], retro: ["sunrise", "mosaic", "stripes"],
  brutal: ["stripes", "mosaic", "dots"], poster: ["blobs", "dots", "mosaic"], soft: ["blobs", "waves", "arches"], neon: ["rings", "dots", "waves"],
  earthy: ["arches", "sunrise", "waves"], festive: ["rings", "mosaic", "sunrise"], playful: ["mosaic", "blobs", "dots"], clean: ["rings", "waves", "dots"],
};

export function makeArt({ theme, seed = 1, slotIndex = 0 }) {
  const r = rng(seed * 7919 + slotIndex * 104729 + 13);
  const { accent, accent2, pal, brandColor } = theme;
  const light = theme.mood === "light";
  const base = light
    ? [brandColor, mix(brandColor, "#ffffff", 0.35), mix(brandColor, "#ffffff", 0.65), mix(brandColor, "#000000", 0.18), mix(pal.bg2, brandColor, 0.35)]
    : [brandColor, mix(brandColor, "#ffffff", 0.4), mix(brandColor, "#000000", 0.35), theme.key === "poster" ? pal.ink : accent2, mix(pal.bg, brandColor, 0.5)];
  const c = { bg: theme.key === "poster" ? mix(pal.bg, "#000000", 0.2) : pal.bg2, ink: lum(pal.bg) > 0.5 ? "#15151c" : "#ffffff", a: base[0], b: base[1], pick: (rr) => base[Math.floor(rr() * base.length)] };
  const kinds = PREFS[theme.key] || ART_KINDS;
  const kind = kinds[(Math.floor(r() * 10) + slotIndex) % kinds.length];
  const body = KINDS[kind](r, c);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
}
