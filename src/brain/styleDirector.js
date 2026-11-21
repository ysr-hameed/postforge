// Chooses the MOOD (style pack) per post: brand default, a single override, or a niche-aware mix.
import { STYLES, STYLE_KEYS } from "../engine/theme.js";
const ALT = {
  dev: ["midnight", "neon", "clean", "brutal"], restaurant: ["retro", "festive", "earthy", "paper"], cafe: ["paper", "earthy", "retro", "soft"],
  fitness: ["poster", "brutal", "neon", "midnight"], fashion: ["clean", "luxe", "brutal", "paper"], ecommerce: ["brutal", "playful", "clean", "poster"],
  beauty: ["soft", "luxe", "clean", "earthy"], jewelry: ["luxe", "festive", "paper", "clean"], realestate: ["luxe", "clean", "earthy", "paper"],
  travel: ["earthy", "retro", "poster", "soft"], education: ["paper", "playful", "clean", "midnight"], agency: ["brutal", "poster", "clean", "neon"],
  events: ["festive", "luxe", "soft", "retro"], kids: ["playful", "soft", "poster", "earthy"], health: ["soft", "clean", "earthy", "paper"],
  finance: ["midnight", "clean", "luxe", "paper"], coach: ["poster", "luxe", "paper", "clean"], generic: STYLE_KEYS,
};
export function pickStyle(profile, mode = "auto", index = 0) {
  if (STYLES[mode]) return mode;
  if (mode === "mix") { const list = ALT[profile.niche] || STYLE_KEYS; return list[index % list.length]; }
  return STYLES[profile.style] ? profile.style : "clean";
}
