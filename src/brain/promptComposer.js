// Builds the exact prompt a real visual-writer LLM would receive.
// The engine owns fonts/colors/chrome/fit, so the prompt is short, strict and about COMPOSITION, TYPOGRAPHY and IMAGE USE only.
import { KNOWN_CLASSES } from "../engine/baseCss.js";
import { VISUAL_TYPES } from "./visualTypes.js";
import { STYLES } from "../engine/theme.js";
import { getFormat } from "../engine/formats.js";

const VOCAB = `LAYOUT   pf-stack pf-row pf-row-top pf-wrap pf-between pf-center pf-end pf-middle pf-bottom pf-grow pf-gap-s|m|l|xl pf-grid-2 pf-grid-3 pf-grid-2-1 pf-split pf-spacer
HEADINGS pf-display pf-h1 pf-h2 pf-h3 (or <h1><h2><h3>)  -> the mood's own head font; case/spacing are automatic
BODY     pf-lead pf-body (or <p>) pf-small pf-kicker pf-num pf-num-m pf-quote pf-quote-mark
FONT ROLES (mix inside ONE line for personality; each is a real, different typeface)
         pf-flair (the mood's signature accent face) pf-serif pf-serif-i (Instrument Serif) pf-script (Caveat) pf-hand (Kalam)
         pf-mono (Space Mono) pf-cond (Bebas) pf-anton pf-wide (Unbounded) pf-black (Archivo Black) pf-round (Fredoka) pf-bricolage pf-rozha (Hindi-friendly serif) pf-fraunces
SIZE FX  pf-xl pf-xxl pf-sm (relative jumps inside a line)  pf-track pf-squeeze pf-upper pf-lower pf-underline
COLOR    pf-accent pf-accent2 pf-mute pf-ink pf-grad pf-strike pf-bold
SURFACE  pf-card pf-card-accent pf-card-outline pf-card-soft pf-pad-s pf-pad-l   (radius/border/shadow follow the mood)
IMAGES   <div class="pf-photo SIZE"><img data-slot="hero|a|b|c"></div>   SIZE: pf-ph-grow (absorbs spare height) pf-ph-wide pf-ph-banner pf-ph-sq pf-ph-tall pf-ph-circle pf-ph-arch pf-ph-half
         pf-polaroid (wrap a pf-photo for a tilted print)
ATOMS    pf-chip pf-chip-solid pf-chip-ink pf-chip-line pf-badge pf-sticker pf-datebox pf-idx pf-idx-line pf-ico+pf-yes|pf-no pf-dot pf-dot-inv pf-rule pf-divider pf-leader pf-bar(style="--v:0-100") pf-tilt-l pf-tilt-r
CONTROL  pf-optional  (engine may delete this block if space runs out)`;

export function composePrompt({ profile, post, format = "portrait", style = "midnight", slots = {} }) {
  const fmt = getFormat(format);
  const vt = VISUAL_TYPES[post.visualType];
  const st = STYLES[style] || STYLES.midnight;
  const system = `You are the VISUAL MAKER inside a social-post engine. You are NOT the strategist and NOT a copywriter: the brief and copy are given. Your only job is to compose the BODY ZONE of one post: layout, typography and image placement.

OUTPUT CONTRACT
- Return ONLY the inner HTML of the body zone. No <html>, <head>, <style>, <script>, no markdown fences, no explanation.
- The engine already provides, and you must never write: fonts, @import, colors, brand header, footer/CTA, background, margins, canvas size, scaling, image files.
- Allowed tags: div span p h1 h2 h3 b strong em br small ul ol li img. Allowed classes: only pf-* from the vocabulary below.
- <img> is allowed ONLY as <img data-slot="hero|a|b|c"> inside a .pf-photo box. Never write a src or URL: the engine fills slots with the brand's real photos, uploads, or generated art plates.
- Inline style is allowed ONLY for: color, background, text-align, justify-content, align-items, flex-grow, grid-template-columns, width(%), opacity, --v. Never font-size, px, position, margin, padding, transform, emoji.

VOCABULARY (the only classes that exist)
${VOCAB}

MOOD FOR THIS POST: ${st.label}. The engine applies its fonts, palette, corner radius, borders and shadows automatically. Compose in its spirit (e.g. brutal/poster = big, blunt, few words; luxe/earthy = airy, serif, generous space; playful/soft = round, friendly; neon/midnight = high-contrast, techy).

TYPOGRAPHY RULES (this is what separates a designed post from a template)
1. Headline is the hero. Pick ONE phrase of 1-2 words and give it a different voice with a FONT ROLE or pf-underline/pf-accent. Never style more than one phrase per headline.
2. Mix at most 3 typefaces in a post (the mood's head font + one font role + body). Do not stack two scripts or two serifs.
3. Create real scale contrast: focal element 2-4x the next one. Use pf-xl/pf-xxl on a single word instead of making everything big.
4. Kickers and labels are small, uppercase and quiet. Numbers and prices use pf-num / pf-num-m.
5. Hindi/Hinglish is supported in every face; keep Hindi lines short and never put it in pf-script on long lines.

COMPOSITION RULES
1. ONE focal point. Max 2 surfaces (cards). Use accent for ONE idea, not decoration.
2. Group with gap classes, never empty <div>s. Equal rhythm for repeated rows.
3. Text budget: ${vt.budget}. Cut words before you shrink anything; the engine scales type to fit, so never pad.
4. Wrap anything non-essential in pf-optional so it can be dropped instead of overflowing.
5. Images: use a photo only where it adds meaning (${vt.img}). One dominant image max; make it pf-ph-grow in tall canvases, a banner/side-by-side on square/landscape. Never place text over an image yourself (the hero-photo type is handled by the engine's full-bleed background).
6. Vary composition between posts: alignment, card vs open layout, where the number or photo sits.
7. Anything that could overlap, overflow or touch the canvas edge is a failure. Prefer fewer, larger, well-spaced blocks.

VISUAL TYPE: ${vt.label}
${vt.direction}`;

  const user = `FORMAT: ${fmt.label} (${fmt.w}x${fmt.h}). Body zone is the area between the engine header and footer.${format === "landscape" ? " Landscape: prefer side-by-side (photo | text) layouts; the zone is short." : ""}
BRAND: ${profile.name} (${profile.niche}) · tone: ${profile.tone} · audience: ${profile.audience}
IMAGE SLOTS AVAILABLE: ${Object.keys(slots).length ? Object.entries(slots).map(([k, v]) => `${k} = ${v}`).join(", ") : "hero = art/photo, a = art/photo (b, c also valid)"}
BRIEF (copy is final; do not rewrite facts, you may trim words):
${JSON.stringify({ visualType: post.visualType, ...post.data }, null, 2)}
Return only the body HTML.`;
  return { system, user, classCount: KNOWN_CLASSES.size, full: `# SYSTEM\n${system}\n\n# USER\n${user}` };
}
