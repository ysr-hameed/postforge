// THE DESIGN SYSTEM. Fixed. The AI never writes this part.
// S = fit scale (type + spacing), D = spacing density, K = per-format factor.
// Everything mood-specific (fonts, radius, border, shadow, case) comes from CSS variables set by the style pack.
import { getFormat } from "./formats.js";
export const KNOWN_CLASSES = new Set();

export function baseCss({ fmtKey, S = 1, D = 1, clip = false }) {
  const fmt = getFormat(fmtKey);
  const K = fmtKey === "landscape" ? 0.78 : fmtKey === "story" ? 1.06 : 1;
  const n3 = (x) => Math.round(x * 1000) / 1000;
  const p = (n) => `${Math.round(n * S * K * 10) / 10}px`;
  const q = (n) => `${Math.round(n * S * K * D * 10) / 10}px`;
  const f = (n) => `${Math.round(n * K * 10) / 10}px`;
  const hp = (n) => `calc(var(--hs) * ${n3(n * S * K)}px)`;                 // head font size (style-scaled)
  const R = (m = 1) => `calc(var(--rad) * ${n3(m * S * K)}px)`;              // radius
  const BW = "calc(var(--bw) * 1px)";
  const padX = fmtKey === "landscape" ? 64 : 80;
  const padTop = fmt.safeTop ?? (fmtKey === "landscape" ? 44 : 72);
  const padBottom = fmt.safeBottom ?? (fmtKey === "landscape" ? 44 : 72);
  const surf = `border:${BW} solid var(--line);border-radius:${R(1)};box-shadow:var(--shadow)`;

  const css = `
*{box-sizing:border-box;margin:0;padding:0;flex-shrink:0}
.pf-canvas{display:flex;flex-direction:column;position:relative;width:${fmt.w}px;height:${fmt.h}px;background-color:var(--bg);background-image:linear-gradient(160deg,var(--bg) 0%,var(--bg2) 100%);color:var(--ink);font-family:var(--font-body);font-weight:500;overflow:hidden}
.pf-deco{display:flex;position:absolute;left:0;top:0;width:${fmt.w}px;height:${fmt.h}px;overflow:hidden}
.pf-frame{display:flex;position:relative;flex-direction:column;width:${fmt.w}px;height:${fmt.h}px;padding:${f(padTop)} ${f(padX)} ${f(padBottom)} ${f(padX)}}
.pf-head{display:flex;flex-direction:row;align-items:center;justify-content:space-between;height:${f(64)};margin-bottom:${f(24)}}
.pf-brand{display:flex;flex-direction:row;align-items:center;gap:${f(16)}}
.pf-mark{display:flex;align-items:center;justify-content:center;width:${f(56)};height:${f(56)};border-radius:calc(var(--rad) * ${n3(0.45 * K)}px);background-color:var(--accent);color:var(--on-accent);font-family:var(--font-head);font-weight:var(--head-w);font-size:${f(32)}}
.pf-brandname{font-family:var(--font-head);font-size:${f(32)};font-weight:var(--head-w);color:var(--ink);text-transform:var(--head-tt);letter-spacing:-0.01em}
.pf-headtag{font-family:var(--font-kicker);font-size:${f(22)};letter-spacing:0.16em;text-transform:uppercase;color:var(--mute);font-weight:700}
.pf-main{display:flex;flex-direction:column;flex-grow:1;flex-shrink:1;flex-basis:0;min-height:0;justify-content:center;gap:${p(30)}}
.pf-foot{display:flex;flex-direction:row;align-items:center;justify-content:space-between;height:${f(64)};margin-top:${f(24)};border-top:2px solid var(--line);padding-top:${f(22)}}
.pf-cta{font-size:${f(28)};font-weight:800;color:var(--accent)}
.pf-url{font-family:var(--font-kicker);font-size:${f(24)};color:var(--mute);font-weight:700}

/* ---------- type: roles ---------- */
p,h1,h2,h3,span,b,strong,em,small,li{display:block}
span,b,strong,em,small{display:inline}
.pf-display{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(150)};line-height:0.98;letter-spacing:var(--head-ls);text-transform:var(--head-tt)}
.pf-h1,h1{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(98)};line-height:1.03;letter-spacing:var(--head-ls);text-transform:var(--head-tt)}
.pf-h2,h2{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(66)};line-height:1.08;letter-spacing:var(--head-ls);text-transform:var(--head-tt)}
.pf-h3,h3{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(46)};line-height:1.15;letter-spacing:var(--head-ls);text-transform:var(--head-tt)}
.pf-lead{font-size:${p(44)};line-height:1.28;font-weight:500}
.pf-body,p{font-size:${p(35)};line-height:1.36;font-weight:500}
.pf-small,small{font-size:${p(30)};line-height:1.32;color:var(--mute);font-weight:500}
.pf-kicker{font-family:var(--font-kicker);font-size:${p(26)};letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:var(--accent)}
.pf-num{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(280)};line-height:0.92;letter-spacing:var(--head-ls);color:var(--accent);text-transform:var(--head-tt)}
.pf-num-m{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(120)};line-height:0.95;letter-spacing:var(--head-ls);color:var(--accent);text-transform:var(--head-tt)}
.pf-quote{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(68)};line-height:1.14;letter-spacing:var(--head-ls)}
.pf-quote-mark{font-family:var(--font-head);font-weight:var(--head-w);font-size:${hp(220)};line-height:0.7;color:var(--accent)}

/* ---------- type: creative families (always available, any mood) ---------- */
.pf-flair{font-family:var(--font-flair);font-style:var(--flair-style);font-weight:600;font-size:calc(var(--flair-k) * 1em);text-transform:none;letter-spacing:0}
.pf-serif{font-family:'Instrument Serif','Noto Sans Devanagari';font-weight:400;font-size:1.22em;text-transform:none;letter-spacing:-0.01em}
.pf-serif-i{font-family:'Instrument Serif','Noto Sans Devanagari';font-style:italic;font-weight:400;font-size:1.22em;text-transform:none;letter-spacing:-0.01em}
.pf-fraunces{font-family:'Fraunces','Noto Sans Devanagari';font-weight:700;text-transform:none}
.pf-script{font-family:'Caveat','Noto Sans Devanagari';font-weight:700;font-size:1.34em;text-transform:none;letter-spacing:0}
.pf-hand{font-family:'Kalam','Noto Sans Devanagari';font-weight:700;font-size:1.1em;text-transform:none;letter-spacing:0}
.pf-mono{font-family:'Space Mono','Noto Sans Devanagari';font-weight:700;letter-spacing:0.02em;text-transform:none}
.pf-cond{font-family:'Bebas Neue','Noto Sans Devanagari';font-weight:400;font-size:1.2em;text-transform:uppercase;letter-spacing:0.01em}
.pf-anton{font-family:'Anton','Noto Sans Devanagari';font-weight:400;text-transform:uppercase}
.pf-wide{font-family:'Unbounded','Noto Sans Devanagari';font-weight:800;font-size:0.8em;text-transform:none;letter-spacing:-0.04em}
.pf-black{font-family:'Archivo Black','Noto Sans Devanagari';font-weight:400;font-size:0.9em;text-transform:none}
.pf-round{font-family:'Fredoka','Baloo 2','Noto Sans Devanagari';font-weight:700;text-transform:none}
.pf-bricolage{font-family:'Bricolage Grotesque','Noto Sans Devanagari';font-weight:800;text-transform:none}
.pf-rozha{font-family:'Rozha One','Noto Sans Devanagari';font-weight:400;text-transform:none}
.pf-xl{font-size:1.35em}
.pf-xxl{font-size:1.8em}
.pf-sm{font-size:0.7em}
.pf-track{letter-spacing:0.14em}
.pf-squeeze{letter-spacing:-0.05em}
.pf-upper{text-transform:uppercase}
.pf-lower{text-transform:lowercase}
.pf-tight{line-height:1}
.pf-underline{text-decoration:underline}
b,strong,.pf-bold{font-weight:800}
.pf-accent{color:var(--accent)}
.pf-accent2{color:var(--accent2)}
.pf-mute{color:var(--mute)}
.pf-ink{color:var(--ink)}
.pf-grad{background-image:linear-gradient(90deg,var(--accent),var(--accent2));background-clip:text;-webkit-background-clip:text;color:transparent}
.pf-strike{text-decoration:line-through;color:var(--mute)}
.pf-center-text{text-align:center}

/* ---------- layout ---------- */
.pf-stack{display:flex;flex-direction:column;gap:${q(24)}}
.pf-row{display:flex;flex-direction:row;align-items:center;gap:${q(24)}}
.pf-row>.pf-lead,.pf-row>.pf-body,.pf-row>.pf-small,.pf-row>.pf-h3,.pf-row>h3,.pf-row>p,.pf-row-top>.pf-lead{flex-shrink:1;min-width:0}
.pf-row-top{display:flex;flex-direction:row;align-items:flex-start;gap:${q(24)}}
.pf-wrap{flex-wrap:wrap}
.pf-between{justify-content:space-between}
.pf-center{align-items:center;text-align:center}
.pf-end{align-items:flex-end;text-align:right}
.pf-middle{justify-content:center}
.pf-bottom{justify-content:flex-end}
.pf-grow{flex-grow:1;min-height:0;min-width:0}
.pf-fill-w{width:100%}
.pf-gap-s{gap:${q(12)}}
.pf-gap-m{gap:${q(24)}}
.pf-gap-l{gap:${q(40)}}
.pf-gap-xl{gap:${q(64)}}
.pf-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:${q(24)}}
.pf-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:${q(20)}}
.pf-grid-2-1{display:grid;grid-template-columns:2fr 1fr;gap:${q(24)}}
.pf-split{display:flex;flex-direction:row;gap:${q(28)}}
.pf-split>*{flex-grow:1;flex-basis:0;min-width:0}
.pf-spacer{flex-grow:1}

/* ---------- surfaces (shape follows the style pack) ---------- */
.pf-card{display:flex;flex-direction:column;gap:${q(14)};background-color:var(--card);${surf};padding:${q(36)}}
.pf-card-accent{display:flex;flex-direction:column;gap:${q(14)};background-color:var(--accent);color:var(--on-accent);${surf};padding:${q(40)}}
.pf-card-accent .pf-small,.pf-card-accent .pf-mute,.pf-card-accent .pf-kicker,.pf-card-accent .pf-num,.pf-card-accent .pf-num-m,.pf-card-accent .pf-accent{color:var(--on-accent)}
.pf-card-outline{display:flex;flex-direction:column;gap:${q(14)};border:calc(var(--bw) * 1px + 1px) solid var(--accent);border-radius:${R(1)};padding:${q(36)}}
.pf-card-soft{display:flex;flex-direction:column;gap:${q(14)};background-color:var(--accent-soft);border-radius:${R(1)};padding:${q(36)}}
.pf-pad-s{padding:${q(20)}}
.pf-pad-l{padding:${q(56)}}

/* ---------- images: always inside a .pf-photo box, filled via data-slot ---------- */
.pf-photo{display:flex;position:relative;overflow:hidden;width:100%;background-color:var(--card);${surf};border-radius:${R(0.85)}}
.pf-photo img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}
.pf-ph-grow{flex-grow:1;min-height:${q(380)}}
.pf-ph-wide{height:${p(250)}}
.pf-ph-banner{height:${p(340)}}
.pf-ph-sq{height:${p(480)}}
.pf-ph-tall{height:${p(640)}}
.pf-ph-circle{width:${p(170)};height:${p(170)};border-radius:999px}
.pf-ph-arch{border-top-left-radius:${p(400)};border-top-right-radius:${p(400)}}
.pf-ph-half{flex-grow:1;height:${p(400)}}
.pf-polaroid{display:flex;flex-direction:column;background-color:#ffffff;padding:${q(18)} ${q(18)} ${q(70)} ${q(18)};transform:rotate(-3deg);box-shadow:0 20px 44px rgba(0,0,0,0.28);border-radius:${p(6)}}
.pf-polaroid .pf-photo{border:0;box-shadow:none;border-radius:${p(2)}}

/* ---------- atoms ---------- */
.pf-chip{display:flex;flex-direction:row;align-items:center;align-self:flex-start;background-color:var(--accent-soft);color:var(--accent);border-radius:999px;padding:${q(10)} ${q(26)};font-size:${p(28)};font-weight:700}
.pf-chip-solid{display:flex;flex-direction:row;align-items:center;align-self:flex-start;background-color:var(--accent);color:var(--on-accent);border-radius:999px;padding:${q(12)} ${q(30)};font-size:${p(30)};font-weight:800}
.pf-chip-ink{display:flex;flex-direction:row;align-items:center;align-self:flex-start;background-color:var(--ink);color:var(--bg);border-radius:999px;padding:${q(12)} ${q(30)};font-size:${p(30)};font-weight:800}
.pf-chip-line{display:flex;flex-direction:row;align-items:center;align-self:flex-start;border:2px solid var(--line);color:var(--ink);border-radius:999px;padding:${q(10)} ${q(26)};font-size:${p(28)};font-weight:600}
.pf-idx{display:flex;align-items:center;justify-content:center;width:${p(80)};height:${p(80)};border-radius:999px;background-color:var(--accent);color:var(--on-accent);font-family:var(--font-head);font-weight:var(--head-w);font-size:${p(40)}}
.pf-idx-line{display:flex;align-items:center;justify-content:center;width:${p(80)};height:${p(80)};border-radius:999px;border:3px solid var(--accent);color:var(--accent);font-family:var(--font-head);font-weight:var(--head-w);font-size:${p(40)}}
.pf-ico{display:flex;align-items:center;justify-content:center;width:${p(60)};height:${p(60)};border-radius:999px;font-weight:900;font-size:${p(38)}}
.pf-yes{background-color:var(--accent);color:var(--on-accent)}
.pf-no{border:3px solid var(--mute);color:var(--mute)}
.pf-dot{width:${p(18)};height:${p(18)};border-radius:999px;background-color:var(--accent)}
.pf-dot-inv{width:${p(18)};height:${p(18)};border-radius:999px;background-color:var(--on-accent)}
.pf-rule{width:${p(96)};height:${p(8)};border-radius:99px;background-color:var(--accent)}
.pf-divider{width:100%;height:2px;background-color:var(--line)}
.pf-leader{flex-grow:1;height:3px;background-color:var(--line);min-width:${p(30)}}
.pf-bar{display:flex;flex-direction:row;width:100%;height:${p(26)};border-radius:99px;background-color:var(--line)}
.pf-fill{display:flex;height:${p(26)};border-radius:99px;background-color:var(--accent)}
.pf-badge{display:flex;align-self:flex-start;background-color:var(--ink);color:var(--bg);border-radius:calc(var(--rad) * ${n3(0.4 * S * K)}px);padding:${q(8)} ${q(20)};font-family:var(--font-kicker);font-size:${p(24)};font-weight:700;letter-spacing:0.14em;text-transform:uppercase}
.pf-sticker{display:flex;align-items:center;justify-content:center;text-align:center;width:${p(190)};height:${p(190)};border-radius:999px;background-color:var(--accent);color:var(--on-accent);font-family:var(--font-head);font-weight:var(--head-w);font-size:${p(38)};line-height:1;text-transform:uppercase;transform:rotate(-12deg);border:${BW} solid var(--line);box-shadow:var(--shadow)}
.pf-datebox{display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:var(--accent);color:var(--on-accent);${surf};padding:${q(26)} ${q(40)};min-width:${p(230)}}
.pf-datebox .pf-num-m,.pf-datebox .pf-kicker{color:var(--on-accent)}
.pf-tilt-l{transform:rotate(-3deg)}
.pf-tilt-r{transform:rotate(3deg)}
.pf-optional{flex-shrink:0}
`;
  const clipCss = clip ? ".pf-main{overflow:hidden;justify-content:flex-start}" : "";
  for (const m of css.matchAll(/\.(pf-[a-z0-9-]+)/g)) KNOWN_CLASSES.add(m[1]);
  return css + clipCss;
}
baseCss({ fmtKey: "portrait" });
