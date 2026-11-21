// MOCK visual-writer LLM. Same contract as a real one: (prompt, brief) -> BODY HTML ONLY.
// It composes from an arrangement grammar + seeded RNG + the style's typographic taste, so output changes per post.
// To plug a real model: replace writeBody() with an API call that sends composePrompt().system/.user.
const E = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, a) => a[Math.floor(r() * a.length)];

// ---- typographic taste per style: which flair treatments suit the mood ----
const FLAIRS = {
  flair: (w) => `<span class="pf-flair pf-accent">${w}</span>`,
  serifi: (w) => `<span class="pf-serif-i pf-accent">${w}</span>`,
  script: (w) => `<span class="pf-script pf-accent">${w}</span>`,
  under: (w) => `<span class="pf-accent pf-underline">${w}</span>`,
  plain: (w) => `<span class="pf-accent">${w}</span>`,
};
const TASTE = {
  midnight: ["flair", "serifi", "under"], luxe: ["flair", "serifi", "under"], paper: ["script", "flair", "under"], retro: ["script", "flair", "under"],
  brutal: ["serifi", "under", "plain"], poster: ["serifi", "flair", "under"], soft: ["script", "flair", "plain"], neon: ["flair", "plain", "under"],
  earthy: ["serifi", "flair", "script"], festive: ["flair", "serifi", "plain"], playful: ["script", "flair", "under"], clean: ["serifi", "flair", "under"],
};
// Wrap ONE word of a headline in a typographic flair. Prefers the brief's word, else a long word near the end.
function fx(text, word, ctx) {
  const words = String(text).split(" ");
  const clean = (w) => w.replace(/[^\p{L}\p{N}']/gu, "").toLowerCase();
  let i = word ? words.findIndex((w) => clean(w) === clean(word)) : -1;
  if (i < 0) {
    const c = words.map((w, k) => [w, k]).filter(([w, k]) => clean(w).length >= 4 && k >= Math.floor(words.length / 2));
    i = c.length ? pick(ctx.r, c)[1] : words.length - 1;
  }
  const kind = pick(ctx.r, TASTE[ctx.style] || TASTE.midnight);
  return words.map((w, k) => (k === i ? FLAIRS[kind](E(w)) : E(w))).join(" ");
}

const photo = (cls, slot) => `<div class="pf-photo ${cls}"><img data-slot="${slot}"></div>`;
const phCls = (fmt) => (fmt === "square" ? "pf-ph-banner" : "pf-ph-grow");
const kick = (t) => `<span class="pf-kicker">${E(t)}</span>`;
// landscape helper: photo on one side, text on the other
const side = (fmt, slot, text, r) => { const left = r() > 0.5; const ph = photo("pf-grow", slot); const tx = `<div class="pf-stack pf-gap-m pf-middle">${text}</div>`; return `<div class="pf-split">${left ? ph + tx : tx + ph}</div>`; };

const G = {
  "myth-fact": (d, c) => {
    const { r } = c;
    if (r() > 0.5) return `<div class="pf-stack pf-gap-m">${kick("Myth vs Fact")}<div class="pf-card-outline"><span class="pf-chip-line">Myth</span><h2 class="pf-strike">${E(d.myth)}</h2></div><div class="pf-card-accent"><span class="pf-badge">Fact</span><h2>${E(d.fact)}</h2></div></div>
<div class="pf-row"><span class="pf-num-m">${E(d.stat.n)}</span><span class="pf-lead pf-mute">${E(d.stat.label)}</span></div>`;
    return `<div class="pf-stack pf-gap-l">${kick("Myth vs Fact")}<h1><span class="pf-strike">${E(d.myth)}</span></h1><div class="pf-rule"></div><h1>${fx(d.fact, null, c)}</h1></div>
<div class="pf-card"><div class="pf-row pf-between"><span class="pf-num-m">${E(d.stat.n)}</span><span class="pf-lead pf-mute">${E(d.stat.label)}</span></div></div>`;
  },
  "big-stat": (d, c) => {
    const { r, fmt } = c, center = r() > 0.4, cc = center ? " pf-center" : "";
    const art = fmt !== "landscape" && fmt !== "square" ? photo("pf-ph-banner pf-optional", "a") : "";
    return `<div class="pf-stack pf-gap-l${cc}">${kick("By the numbers")}<span class="pf-num">${E(d.n)}</span><h2>${fx(d.label, null, c)}</h2><div class="pf-rule"></div><p class="pf-lead pf-mute">${E(d.context)}</p></div>${art}`;
  },
  steps: (d, c) => {
    const { r, fmt } = c, wide = fmt === "landscape", outline = r() > 0.5;
    const detail = (t) => `<span class="pf-small pf-optional">${E(t)}</span>`;
    const one = (s, i) => outline || wide
      ? `<div class="pf-row"><span class="pf-idx-line">${i + 1}</span><div class="pf-stack pf-gap-s"><h3>${E(s.t)}</h3>${detail(s.d)}</div></div>`
      : `<div class="pf-card"><div class="pf-row"><span class="pf-idx">${i + 1}</span><div class="pf-stack pf-gap-s"><h3>${E(s.t)}</h3>${detail(s.d)}</div></div></div>`;
    const rows = d.steps.map(one).join("");
    const head = `<div class="pf-stack">${kick("Step by step")}<h1>${fx(d.title, null, c)}</h1></div>`;
    if (wide) return `<div class="pf-split"><div class="pf-stack pf-grow">${head}</div><div class="pf-stack pf-gap-m" style="flex-grow:1.4">${rows}</div></div>`;
    return `${head}<div class="pf-stack ${outline ? "pf-gap-l" : "pf-gap-m"}">${rows}</div>`;
  },
  checklist: (d, c) => {
    const { r } = c, card = r() > 0.5;
    const rows = d.items.map((t) => `<div class="pf-row"><span class="pf-ico pf-yes">+</span><span class="pf-lead">${E(t)}</span></div>`).join("");
    const list = card ? `<div class="pf-card pf-pad-l pf-stack pf-gap-l">${rows}</div>` : `<div class="pf-stack pf-gap-l">${rows}</div>`;
    return `<div class="pf-stack">${kick("Checklist")}<h1>${fx(d.title, null, c)}</h1></div>${list}${d.foot ? `<p class="pf-small pf-optional">${E(d.foot)}</p>` : ""}`;
  },
  "before-after": (d, c) => {
    const { r, fmt } = c, stacked = r() > 0.45 && fmt !== "landscape";
    const li = (arr, ok, big) => arr.map((t) => `<div class="pf-row pf-gap-m"><span class="pf-ico ${ok ? "pf-yes" : "pf-no"}">${ok ? "+" : "×"}</span><span class="${big ? "pf-lead" : "pf-body"}">${E(t)}</span></div>`).join("");
    const head = `<div class="pf-stack">${kick("Before / After")}<h1>${fx(d.title, null, c)}</h1></div>`;
    if (stacked) return head + `<div class="pf-stack pf-gap-m"><div class="pf-card pf-stack pf-gap-m"><span class="pf-chip-line">Before</span>${li(d.before, false, true)}</div><div class="pf-card-accent pf-stack pf-gap-m"><span class="pf-badge">After</span>${li(d.after, true, true)}</div></div>`;
    return head + `<div class="pf-split"><div class="pf-card pf-stack pf-gap-l"><span class="pf-chip-line">Before</span>${li(d.before, false)}</div><div class="pf-card-accent pf-stack pf-gap-l"><span class="pf-badge">After</span>${li(d.after, true)}</div></div>`;
  },
  quote: (d, c) => {
    const { r, fmt } = c, mode = fmt === "landscape" ? "plain" : pick(r, ["card", "plain", "photo"]);
    const core = `<span class="pf-quote-mark">“</span><p class="pf-quote">${fx(d.quote, null, c)}</p><div class="pf-rule"></div><span class="pf-small">${E(d.by)}</span>`;
    if (mode === "card") return `<div class="pf-card pf-pad-l pf-stack pf-gap-l">${core}</div>`;
    if (mode === "photo") return `${photo(fmt === "square" ? "pf-ph-wide" : "pf-ph-banner", "a")}<div class="pf-stack pf-gap-l">${core}</div>`;
    return `<div class="pf-stack pf-gap-l">${core}</div>`;
  },
  offer: (d, c) => {
    const { r, fmt } = c;
    const head = `<div class="pf-stack pf-gap-m"><span class="pf-badge">${E(d.badge)}</span><h1>${fx(d.headline, null, c)}</h1></div>`;
    const deal = `<div class="pf-card-accent pf-stack pf-gap-m"><div class="pf-row pf-between"><div class="pf-stack pf-gap-s"><span class="pf-num-m">${E(d.offer.n)}</span><p class="pf-body">${E(d.offer.label)}</p></div>${d.sticker && fmt !== "landscape" ? `<span class="pf-sticker">${E(d.sticker)}</span>` : ""}</div><div class="pf-row pf-wrap pf-gap-s">${d.perks.map((p) => `<span class="pf-chip-ink">${E(p)}</span>`).join("")}</div></div>`;
    const urg = `<p class="pf-small pf-optional">${E(d.urgency)}</p>`;
    if (fmt === "landscape") return side(fmt, "hero", head + deal, r);
    return head + photo(phCls(fmt), "hero") + deal + urg;
  },
  compare: (d, c) => {
    const side2 = (s, hot) => `<div class="${hot ? "pf-card-accent" : "pf-card"} pf-stack pf-gap-l"><h3>${E(s.name)}</h3>${s.points.map((p) => `<div class="pf-row pf-gap-s"><span class="${hot ? "pf-dot-inv" : "pf-dot"}"></span><span class="pf-body">${E(p)}</span></div>`).join("")}</div>`;
    return `<div class="pf-stack">${kick("Compare")}<h1>${fx(d.title, null, c)}</h1></div><div class="pf-grid-2">${side2(d.left, d.pick === "left")}${side2(d.right, d.pick !== "left")}</div>`;
  },
  tip: (d, c) => {
    const { fmt } = c, ph = fmt === "portrait" || fmt === "story" ? photo("pf-ph-wide pf-optional", "a") : "";
    return `<div class="pf-stack pf-gap-m">${kick("Pro tip")}<h1>${fx(d.headline, null, c)}</h1></div><div class="pf-card pf-stack pf-gap-m"><p class="pf-lead">${E(d.why)}</p><span class="pf-small">${E(d.example)}</span></div>${ph}<div class="pf-row pf-wrap pf-gap-s pf-optional">${d.chips.map((x) => `<span class="pf-chip">${E(x)}</span>`).join("")}</div>`;
  },
  announce: (d, c) => {
    const { r, fmt } = c, cc = r() > 0.5 ? " pf-center" : "";
    const text = `<div class="pf-stack pf-gap-m${cc}"><span class="pf-badge">${E(d.badge)}</span><span class="pf-display">${fx(d.headline, d.accentWord, c)}</span><p class="pf-lead pf-mute">${E(d.sub)}</p></div>`;
    const chips = `<div class="pf-row pf-wrap pf-gap-s pf-optional${cc ? " pf-middle" : ""}">${d.chips.map((x) => `<span class="pf-chip-line">${E(x)}</span>`).join("")}</div>`;
    if (fmt === "landscape") return side(fmt, "hero", text + chips, r);
    return text + photo(phCls(fmt), "hero") + chips;
  },
  "hero-photo": (d, c) => `<div class="pf-spacer"></div><div class="pf-stack pf-gap-m">${kick(d.kicker)}<span class="pf-display">${fx(d.headline, d.flair, c)}</span><p class="pf-lead">${E(d.sub)}</p></div>`,
  product: (d, c) => {
    const { r, fmt } = c;
    const price = `<div class="pf-row pf-gap-m"><span class="pf-num-m">${E(d.price)}</span>${d.was ? `<span class="pf-lead pf-strike">${E(d.was)}</span>` : ""}</div>`;
    const info = `<div class="pf-stack pf-gap-s"><h1>${fx(d.name, null, c)}</h1><p class="pf-body pf-mute">${E(d.desc)}</p></div>`;
    const tail = `<div class="pf-row pf-between">${price}${d.sticker && fmt !== "landscape" ? `<span class="pf-sticker">${E(d.sticker)}</span>` : ""}</div><div class="pf-row pf-wrap pf-gap-s pf-optional">${d.perks.map((x) => `<span class="pf-chip">${E(x)}</span>`).join("")}</div>`;
    if (fmt === "landscape") return side(fmt, "hero", info + price + `<div class="pf-row pf-wrap pf-gap-s pf-optional">${d.perks.map((x) => `<span class="pf-chip">${E(x)}</span>`).join("")}</div>`, r);
    return photo(phCls(fmt), "hero") + info + tail;
  },
  event: (d, c) => {
    const { fmt } = c;
    const title = `<div class="pf-stack pf-gap-s">${kick("You're invited")}<h1>${fx(d.title, null, c)}</h1></div>`;
    const when = `<div class="pf-row pf-gap-l"><div class="pf-datebox"><span class="pf-num-m">${E(d.day)}</span><span class="pf-kicker">${E(d.month)}</span></div><div class="pf-stack pf-gap-m pf-grow"><div class="pf-row pf-gap-s"><span class="pf-dot"></span><span class="pf-lead">${E(d.time)}</span></div><div class="pf-row pf-gap-s"><span class="pf-dot"></span><span class="pf-lead">${E(d.venue)}</span></div></div></div>`;
    if (fmt === "landscape") {
      const compact = `<div class="pf-stack pf-gap-m"><span class="pf-chip-solid">${E(d.day)} ${E(d.month)}</span><span class="pf-lead">${E(d.time)}</span><span class="pf-lead pf-mute">${E(d.venue)}</span></div>`;
      return `<div class="pf-split"><div class="pf-stack pf-gap-l pf-middle">${title}${compact}</div>${photo("pf-grow", "hero")}</div>`;
    }
    return title + photo(fmt === "square" ? "pf-ph-wide" : "pf-ph-grow", "hero") + when;
  },
  greeting: (d, c) => {
    const { r, fmt } = c, cc = r() > 0.4 ? " pf-center" : "";
    const text = `<div class="pf-stack pf-gap-m${cc}"><span class="pf-display">${fx(d.wish, d.flair, c)}</span><p class="pf-lead pf-mute">${E(d.sub)}</p><span class="pf-kicker">${E(d.from)}</span></div>`;
    if (fmt === "landscape") return side(fmt, "a", text, r);
    const top = fmt === "square" ? "" : `<div class="pf-row pf-between pf-optional"><div class="pf-grow">${kick("With love")}</div><span class="pf-sticker">${E((d.wish.split(" ")[0] || "Hello").slice(0, 8))}</span></div>`;
    return `${top}${text}${photo(fmt === "square" ? "pf-ph-wide" : "pf-ph-grow", "a")}`;
  },
  testimonial: (d, c) => {
    const { fmt } = c;
    const who = `<div class="pf-row pf-gap-m">${photo("pf-ph-circle", "a")}<div class="pf-stack pf-gap-s"><h3>${E(d.name)}</h3><span class="pf-small">${E(d.role)}</span></div></div>`;
    return `<div class="pf-stack pf-gap-l"><span class="pf-quote-mark">“</span><p class="pf-quote">${fx(d.quote, null, c)}</p></div><div class="pf-rule"></div>${who}`;
  },
  "price-list": (d, c) => {
    const { fmt } = c;
    const rows = d.items.map((it) => `<div class="pf-stack pf-gap-s"><div class="pf-row pf-gap-m"><h3>${E(it.n)}</h3><span class="pf-leader"></span><span class="pf-h3 pf-accent">${E(it.p)}</span></div>${it.d ? `<span class="pf-small pf-optional">${E(it.d)}</span>` : ""}</div>`).join("");
    const ph = fmt === "portrait" || fmt === "story" ? photo("pf-ph-wide pf-optional", "hero") : "";
    return `<div class="pf-stack">${kick("Menu")}<h1>${fx(d.title, null, c)}</h1></div>${ph}<div class="pf-stack pf-gap-l">${rows}</div>${d.foot ? `<p class="pf-small pf-optional">${E(d.foot)}</p>` : ""}`;
  },
};

export async function writeBody({ post, format = "portrait", style = "midnight" }) {
  const c = { r: rng(post.seed || 1), fmt: format, style };
  return (G[post.visualType] || G.announce)(post.data, c).replace(/\n/g, "").trim();
}
