// "Website understanding" without a real LLM: fetch + parse + keyword heuristics (+ photos from the site).
// Swap analyzeSite() for an LLM call later; the returned profile shape stays the same.
import { parse } from "node-html-parser";
import { hslToHex } from "../engine/theme.js";

const D = (name, niche, style, accent, tagline, audience, tone, cta, host) => ({ name, niche, style, accent, tagline, audience, tone, cta, url: host, keywords: [], headings: [] });
export const DEMOS = {
  "slyxup.com": D("SlyxUp", "dev", "midnight", "#ff5a36", "Open-source auth + billing for indie builders", "indie developers and small SaaS teams", "sharp, practical, builder-to-builder", "Start free", "slyxup.com"),
  "spiceroute.in": D("Spice Route", "restaurant", "retro", "#e4572e", "Slow-cooked North Indian kitchen in the heart of the city", "families and office crowds nearby", "warm, hungry, inviting", "Order on WhatsApp", "spiceroute.in"),
  "fitpulse.fit": D("FitPulse", "fitness", "poster", "#2ee59d", "30-minute strength plans that fit a busy life", "busy professionals who skip the gym", "energetic, no-excuses, friendly", "Join free trial", "fitpulse.fit"),
  "glowandco.in": D("Glow & Co", "beauty", "soft", "#e0568a", "Skin-first beauty, gentle routines, real results", "women 20-40 who want simple skincare", "gentle, confident, caring", "Book a consult", "glowandco.in"),
  "auricjewels.in": D("Auric", "jewelry", "luxe", "#d4af37", "Handcrafted gold and diamond jewellery for moments that last", "families shopping for weddings and gifts", "refined, warm, trustworthy", "Visit the studio", "auricjewels.in"),
  "wanderkind.in": D("Wanderkind", "travel", "earthy", "#4f7a4a", "Small-group trips to quiet corners of India", "travellers 25-45 who avoid crowds", "calm, curious, adventurous", "Plan my trip", "wanderkind.in"),
  "littlesprouts.in": D("Little Sprouts", "kids", "playful", "#ff6b3d", "Play-based preschool and weekend activity club", "parents of kids aged 2-8", "cheerful, caring, energetic", "Book a free trial", "littlesprouts.in"),
  "urbanthread.in": D("Urban Thread", "fashion", "clean", "#1f3dff", "Minimal everyday wear made to last", "style-conscious professionals", "understated, sharp, honest", "Shop the drop", "urbanthread.in"),
  "shaadistory.in": D("Shaadi Story", "events", "festive", "#f2b632", "Wedding planning and decor, start to shehnai", "couples and families planning weddings", "warm, celebratory, reliable", "Plan your wedding", "shaadistory.in"),
  "brewhaus.in": D("Brew Haus", "cafe", "paper", "#c8482b", "Small-batch coffee and fresh bakes", "neighbourhood regulars and remote workers", "cosy, relaxed, a little witty", "Visit today", "brewhaus.in"),
};

export const NICHE_STYLE = { dev: "midnight", restaurant: "retro", cafe: "paper", fitness: "poster", fashion: "clean", ecommerce: "brutal", beauty: "soft", jewelry: "luxe", realestate: "luxe", travel: "earthy", education: "paper", agency: "brutal", events: "festive", kids: "playful", health: "soft", finance: "midnight", coach: "poster", generic: "clean" };
const NICHE_CTA = { restaurant: "Order now", cafe: "Visit today", education: "Enroll today", beauty: "Book now", jewelry: "Visit the store", realestate: "Book a visit", travel: "Plan my trip", events: "Plan your event", kids: "Book a trial", health: "Book a consult", fitness: "Join now", fashion: "Shop now", ecommerce: "Shop now", finance: "Get started", coach: "Book a call" };

const NICHES = {
  dev: ["api", "developer", "saas", "open source", "github", "code", "cli", "software", "platform", "auth", "deploy", "sdk"],
  restaurant: ["menu", "restaurant", "biryani", "dine", "kitchen", "chef", "catering", "reservation", "thali", "tandoor"],
  cafe: ["cafe", "coffee", "bakery", "espresso", "brew", "latte", "pastry", "roast"],
  fitness: ["gym", "fitness", "workout", "trainer", "yoga", "strength", "training", "crossfit"],
  fashion: ["fashion", "apparel", "wear", "collection", "boutique", "clothing", "outfit", "streetwear", "saree", "kurta"],
  ecommerce: ["shop", "cart", "store", "buy", "shipping", "checkout", "sale", "deals", "gadget"],
  beauty: ["beauty", "skincare", "salon", "makeup", "spa", "hair", "glow", "cosmetic", "facial"],
  jewelry: ["jewel", "gold", "diamond", "ring", "necklace", "silver", "bridal jewellery"],
  realestate: ["property", "real estate", "apartment", "flat", "villa", "builder", "homes", "plots", "rera"],
  travel: ["travel", "trip", "tour", "holiday", "itinerary", "resort", "trek", "hotel", "destination"],
  education: ["course", "learn", "student", "class", "academy", "tutor", "exam", "lesson", "bootcamp", "school"],
  agency: ["agency", "portfolio", "clients", "branding", "marketing", "design studio", "seo", "creative"],
  events: ["wedding", "event", "decor", "planner", "shaadi", "celebration", "catering service", "photography"],
  kids: ["kids", "preschool", "children", "toys", "baby", "nursery", "playschool", "parenting"],
  health: ["clinic", "doctor", "dental", "hospital", "wellness", "therapy", "physio", "health", "ayurveda"],
  finance: ["finance", "loan", "insurance", "invest", "mutual fund", "tax", "bank", "wealth", "credit"],
  coach: ["coach", "mentor", "consulting", "personal brand", "mindset", "speaker", "career"],
};
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const clean = (s = "") => s.replace(/\s+/g, " ").trim();
export function detectNiche(text) {
  const t = text.toLowerCase(); let best = ["generic", 0];
  for (const [k, words] of Object.entries(NICHES)) { const sc = words.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0); if (sc > best[1]) best = [k, sc]; }
  return best[0];
}

async function grabPhotos(root, base) {
  const cands = [];
  for (const sel of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) { const c = root.querySelector(sel)?.getAttribute("content"); if (c) cands.push(c); }
  for (const im of root.querySelectorAll("img")) {
    const src = im.getAttribute("src") || im.getAttribute("data-src") || im.getAttribute("data-lazy-src");
    if (!src || src.startsWith("data:") || /logo|icon|sprite|pixel|tracking|avatar|badge|flag|\.svg|\.gif/i.test(src)) continue;
    const w = +(im.getAttribute("width") || 0); if (w && w < 300) continue;
    cands.push(src);
  }
  const out = [], seen = new Set();
  for (const c of cands) {
    if (out.length >= 4) break;
    let u; try { u = new URL(c, base).toString(); } catch { continue; }
    if (seen.has(u)) continue; seen.add(u);
    try {
      const res = await fetch(u, { signal: AbortSignal.timeout(6000), headers: { "user-agent": "PostForgeBot/1.0" } });
      const ct = res.headers.get("content-type") || "";
      if (!res.ok || !/image\/(jpeg|png|webp)/.test(ct)) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 150_000 && buf.length < 5_000_000) out.push(buf);
    } catch { /* skip */ }
  }
  return out;
}

export async function analyzeSite(input) {
  let url = clean(input || "");
  if (!url) throw new Error("Website URL required");
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (DEMOS[host]) return { ...DEMOS[host], source: "demo-profile", host, photos: [] };

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "user-agent": "PostForgeBot/1.0" } });
    const root = parse(await res.text());
    const meta = (n) => clean(root.querySelector(`meta[name="${n}"]`)?.getAttribute("content") || root.querySelector(`meta[property="${n}"]`)?.getAttribute("content") || "");
    const title = clean(root.querySelector("title")?.text || "");
    const name = meta("og:site_name") || title.split(/[|\-–—:]/)[0].trim() || host;
    const headings = root.querySelectorAll("h1,h2,h3").map((h) => clean(h.text)).filter((t) => t.length > 3 && t.length < 90).slice(0, 8);
    const nav = root.querySelectorAll("nav a").map((a) => clean(a.text)).filter((t) => t && t.length < 24).slice(0, 8);
    const description = meta("description") || meta("og:description");
    const theme = meta("theme-color");
    const niche = detectNiche([title, description, ...headings, ...nav, host].join(" "));
    const photos = await grabPhotos(root, url);
    return {
      name, niche, host, url: host, source: `live-fetch (${photos.length} photos found)`, photos,
      tagline: description || headings[0] || `${name}`, audience: niche === "generic" ? "people who visit the site" : `${niche} customers`, tone: "clear, confident, helpful",
      accent: /^#[0-9a-f]{6}$/i.test(theme) ? theme : undefined, // undefined -> the style pack's own default accent
      style: NICHE_STYLE[niche], cta: NICHE_CTA[niche] || "Get started", keywords: nav, headings,
    };
  } catch (e) {
    const niche = detectNiche(host.replace(/[.-]/g, " "));
    const name = host.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { name, niche, host, url: host, source: `domain-only (${e.name === "TimeoutError" ? "timeout" : "fetch failed"})`, photos: [],
      tagline: `${name}`, audience: "your visitors", tone: "clear, confident", accent: undefined, style: NICHE_STYLE[niche], cta: NICHE_CTA[niche] || "Learn more", keywords: [], headings: [] };
  }
}
