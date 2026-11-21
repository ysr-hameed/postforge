// The AI may only write a body made of whitelisted tags, whitelisted pf-* classes
// and a tiny set of safe inline style props. Everything else is removed and reported.
import { parse } from "node-html-parser";
import { KNOWN_CLASSES } from "./baseCss.js";

const TAGS = new Set(["div", "span", "p", "h1", "h2", "h3", "b", "strong", "em", "br", "small", "ul", "ol", "li", "img"]);
export const SLOTS = new Set(["hero", "a", "b", "c"]);
const STYLE_OK = {
  color: /^(#[0-9a-f]{3,8}|var\(--(accent|accent2|ink|mute)\))$/i,
  background: /^(#[0-9a-f]{3,8}|var\(--(accent|accent2|accent-soft|card|ink)\)|linear-gradient\([#0-9a-z(),%.\s-]+\))$/i,
  "text-align": /^(left|center|right)$/,
  "justify-content": /^(flex-start|center|flex-end|space-between|space-around)$/,
  "align-items": /^(flex-start|center|flex-end|stretch)$/,
  "flex-grow": /^[0-9.]{1,3}$/,
  "grid-template-columns": /^[0-9.frm%\s]{1,40}$/,
  width: /^[0-9]{1,3}%$/,
  opacity: /^(0?\.\d+|1|0)$/,
  "--v": /^[0-9]{1,3}$/,
};
const EMOJI = /[\p{Extended_Pictographic}\u200d\ufe0f]/gu;

export function sanitizeBody(html) {
  const warnings = [];
  const root = parse(`<div id="__root">${html}</div>`).querySelector("#__root");

  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const t = child.rawText;
        if (EMOJI.test(t)) { warnings.push("Emoji removed (no emoji font in renderer)"); child.rawText = t.replace(EMOJI, ""); }
        EMOJI.lastIndex = 0;
        continue;
      }
      if (child.nodeType !== 1) { child.remove(); continue; }
      const tag = child.rawTagName?.toLowerCase();
      if (!TAGS.has(tag)) { warnings.push(`<${tag}> not allowed -> removed`); child.remove(); continue; }
      // images: only <img data-slot="hero|a|b|c"> inside a .pf-photo box; the engine supplies the pixels
      if (tag === "img") {
        const slot = child.getAttribute("data-slot");
        if (!SLOTS.has(slot)) { warnings.push("<img> without valid data-slot -> removed"); child.remove(); continue; }
        for (const a of Object.keys(child.attributes)) child.removeAttribute(a);
        child.setAttribute("data-slot", slot);
        child.setAttribute("src", `pf-slot-${slot}`);
        continue;
      }
      // classes
      const cls = (child.getAttribute("class") || "").split(/\s+/).filter(Boolean);
      const keep = cls.filter((c) => KNOWN_CLASSES.has(c));
      cls.filter((c) => !KNOWN_CLASSES.has(c)).forEach((c) => warnings.push(`unknown class .${c} dropped`));
      // style
      const styles = [];
      for (const decl of (child.getAttribute("style") || "").split(";")) {
        const i = decl.indexOf(":"); if (i < 0) continue;
        const k = decl.slice(0, i).trim().toLowerCase(), v = decl.slice(i + 1).trim();
        if (STYLE_OK[k] && STYLE_OK[k].test(v)) styles.push([k, v]);
        else if (k) warnings.push(`style "${k}" not allowed -> dropped`);
      }
      // reset all attrs then re-apply safe ones
      for (const a of Object.keys(child.attributes)) child.removeAttribute(a);
      if (keep.length) child.setAttribute("class", keep.join(" "));
      const vVar = styles.find(([k]) => k === "--v");
      const real = styles.filter(([k]) => k !== "--v").map(([k, v]) => `${k}:${v}`).join(";");
      if (real) child.setAttribute("style", real);
      // progress bar: bake --v into the fill child
      if (vVar && keep.includes("pf-bar")) {
        const pct = Math.max(0, Math.min(100, +vVar[1]));
        child.set_content(`<div class="pf-fill" style="width:${pct}%"></div>`);
        continue;
      }
      walk(child);
    }
  };
  walk(root);

  // optional-block marker: AI may add data-optional via class "pf-optional"? handled in fit via a wrapper.
  return { root, warnings };
}
