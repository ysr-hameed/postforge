// Engine-owned chrome: canvas, mood decoration (or full-bleed photo), header, footer. Same every time.
import { baseCss } from "./baseCss.js";
import { getFormat } from "./formats.js";
import { rgba, mix } from "./theme.js";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const box = (css) => `<div style="display:flex;position:absolute;${css}"></div>`;

const DECO = {
  blobs(t, W, H, r) {
    const side = r() > 0.5, a = t.mood === "light" ? 0.22 : 0.3;
    const blob = (cx, cy, size, al) => box(`left:${Math.round(cx - size / 2)}px;top:${Math.round(cy - size / 2)}px;width:${size}px;height:${size}px;border-radius:999px;background-image:radial-gradient(circle at 50% 50%,${rgba(t.deco, al)} 0%,${rgba(t.deco, 0)} 68%)`);
    const ring = (cx, cy, size) => box(`left:${Math.round(cx - size / 2)}px;top:${Math.round(cy - size / 2)}px;width:${size}px;height:${size}px;border-radius:999px;border:2px solid ${rgba(t.deco, 0.22)}`);
    return blob(side ? W * 0.9 : W * 0.1, H * (0.08 + r() * 0.12), W, t.key === "poster" ? 0.12 : a) + blob(side ? W * 0.05 : W * 0.95, H * (0.85 + r() * 0.1), W * 0.8, t.key === "poster" ? 0.08 : a * 0.65) + ring(side ? W * 0.98 : W * 0.02, H * 0.18, W * 0.5) + ring(side ? W * 0.98 : W * 0.02, H * 0.18, W * 0.72);
  },
  rings(t, W, H, r) {
    const cx = W * (r() > 0.5 ? 0.95 : 0.05), cy = H * (0.12 + r() * 0.1);
    return [0.4, 0.58, 0.76, 0.94].map((k) => { const s = Math.round(W * k); return box(`left:${Math.round(cx - s / 2)}px;top:${Math.round(cy - s / 2)}px;width:${s}px;height:${s}px;border-radius:999px;border:2px solid ${rgba(t.deco, 0.3 - k * 0.15)}`); }).join("");
  },
  lines(t, W, H) {
    return box(`left:0;top:0;width:${W}px;height:${H}px;background-image:repeating-linear-gradient(0deg,${rgba(t.pal.ink, 0.06)} 0px,${rgba(t.pal.ink, 0.06)} 2px,rgba(0,0,0,0) 2px,rgba(0,0,0,0) 54px)`) +
      box(`left:46px;top:0;width:3px;height:${H}px;background-color:${rgba(t.deco, 0.35)}`);
  },
  sunburst(t, W, H, r) {
    const cx = r() > 0.5 ? 88 : 12, stops = [];
    for (let i = 0; i < 18; i++) stops.push(`${rgba(t.deco, 0.1)} ${i * 20}deg ${i * 20 + 10}deg,rgba(0,0,0,0) ${i * 20 + 10}deg ${i * 20 + 20}deg`);
    return box(`left:0;top:0;width:${W}px;height:${H}px;background-image:conic-gradient(from 0deg at ${cx}% 6%,${stops.join(",")})`);
  },
  stripes(t, W, H, r) {
    const right = r() > 0.5, s = Math.round(W * 0.34);
    return box(`${right ? "right" : "left"}:0;top:0;width:${s}px;height:${s}px;background-image:repeating-linear-gradient(135deg,${rgba(t.deco, 0.8)} 0px,${rgba(t.deco, 0.8)} 14px,rgba(0,0,0,0) 14px,rgba(0,0,0,0) 36px)`);
  },
  grid(t, W, H) {
    const g = rgba(t.deco, 0.12);
    return box(`left:0;top:0;width:${W}px;height:${H}px;background-image:repeating-linear-gradient(0deg,${g} 0px,${g} 2px,rgba(0,0,0,0) 2px,rgba(0,0,0,0) 72px),repeating-linear-gradient(90deg,${g} 0px,${g} 2px,rgba(0,0,0,0) 2px,rgba(0,0,0,0) 72px)`) +
      box(`left:${W * 0.5}px;top:${-H * 0.2}px;width:${W}px;height:${W}px;border-radius:999px;background-image:radial-gradient(circle at 50% 50%,${rgba(t.deco, 0.22)} 0%,${rgba(t.deco, 0)} 65%)`);
  },
  arches(t, W, H, r) {
    const right = r() > 0.4, w = Math.round(W * 0.36);
    return [[1, 0.13], [0.72, 0.1], [0.46, 0.08]].map(([k, a]) => { const ww = Math.round(w * k), hh = Math.round(ww * 1.35); return box(`${right ? "right" : "left"}:${Math.round(W * 0.04 + (w - ww) / 2)}px;bottom:${Math.round(H * 0.075)}px;width:${ww}px;height:${hh}px;border-top-left-radius:${ww}px;border-top-right-radius:${ww}px;background-color:${rgba(t.deco, a)}`); }).join("");
  },
  confetti(t, W, H, r) {
    const cols = [t.deco, t.accent2, mix(t.deco, "#ffffff", 0.5)], out = [];
    for (let i = 0; i < 22; i++) {
      const s = 16 + Math.floor(r() * 30), x = Math.floor(r() * (W - s)), y = Math.floor(r() * (H - s)), c = cols[i % 3], k = i % 3;
      const edge = x < W * 0.12 || x > W * 0.78 || y < H * 0.06 || y > H * 0.9;
      if (!edge && r() > 0.25) continue;
      out.push(box(`left:${x}px;top:${y}px;width:${s}px;height:${k === 1 ? Math.round(s * 0.45) : s}px;border-radius:${k === 0 ? 999 : 6}px;background-color:${rgba(c, 0.42)};transform:rotate(${Math.floor(r() * 90)}deg)`));
    }
    return out.join("");
  },
  none() { return ""; },
};

export function buildDocument({ bodyHtml, brand, theme, fmtKey, scale, density = 1, clip = false, tag, seed = 7, withDeco = true, bgSrc = null }) {
  const fmt = getFormat(fmtKey), W = fmt.w, H = fmt.h;
  const r = rng(seed * 31 + 5);
  let deco = "";
  if (withDeco) {
    if (bgSrc) deco = `<img src="${bgSrc}" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;object-fit:cover">` +
      box(`left:0;top:0;width:${W}px;height:${H}px;background-image:linear-gradient(180deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.45) 35%,rgba(0,0,0,0.82) 100%)`);
    else deco = (DECO[theme.st.deco] || DECO.none)(theme, W, H, r);
  }
  const initial = esc((brand.name || "B").trim().charAt(0).toUpperCase());
  const html =
    `<div class="pf-canvas" style="${theme.vars}">` +
      `<div class="pf-deco">${deco}</div>` +
      `<div class="pf-frame">` +
        `<div class="pf-head"><div class="pf-brand"><div class="pf-mark">${initial}</div><div class="pf-brandname">${esc(brand.name || "Brand")}</div></div>` +
        `<div class="pf-headtag">${esc(tag || "")}</div></div>` +
        `<div class="pf-main">${bodyHtml}</div>` +
        `<div class="pf-foot"><div class="pf-cta">${esc(brand.cta || "")}</div><div class="pf-url">${esc(brand.url || brand.handle || "")}</div></div>` +
      `</div>` +
    `</div>`;
  return { html, css: baseCss({ fmtKey, S: scale, D: density, clip }) };
}
