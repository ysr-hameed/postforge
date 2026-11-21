// One place that wires: site -> plan -> style -> prompt -> (mock) AI body -> engine render.
import { analyzeSite } from "./brain/siteReader.js";
import { planPosts } from "./brain/strategist.js";
import { composePrompt } from "./brain/promptComposer.js";
import { pickStyle } from "./brain/styleDirector.js";
import { writeBody } from "./brain/mockLLM.js";
import { llmConfig, writeBodyLLM } from "./brain/llmClient.js";
import { renderPost } from "./engine/render.js";
import { STYLES } from "./engine/theme.js";

export const brandOf = (p, style) => ({ name: p.name, accent: p.accent, style, cta: p.cta, url: p.url });

export async function runPipeline({ url, topic = "", count = 6, format = "portrait", type = null, style = "auto", uploads = [], seed = 11, profile: given = null }) {
  const profile = given || (await analyzeSite(url));
  const photos = [...uploads, ...(profile.photos || [])].slice(0, 4);
  const names = ["hero", "a", "b", "c"];
  const slots = Object.fromEntries(names.map((n, i) => [n, photos[i] ? (i < uploads.length ? "your uploaded photo" : "photo from the website") : "generated art plate"]));
  const posts = planPosts(profile, { topic, count: Math.min(+count || 6, 12), seed: +seed, only: type || null });
  const out = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const st = pickStyle(profile, style, i);
    const brand = brandOf(profile, st);
    const prompt = composePrompt({ profile, post, format, style: st, slots });
    // real model when env is configured, otherwise the deterministic mock
    let aiBody, source = "mock";
    if (llmConfig().enabled) {
      try { aiBody = await writeBodyLLM({ system: prompt.system, user: prompt.user }); source = "llm"; }
      catch (e) { console.warn(`LLM failed for ${post.id}, using mock: ${e.message}`); aiBody = await writeBody({ prompt, post, format, style: st }); }
    } else aiBody = await writeBody({ prompt, post, format, style: st });
    const r = await renderPost({ body: aiBody, brand, format, tag: post.tag, seed: post.seed, photos, photoBg: post.photoBg });
    out.push({ ...post, source, style: st, styleLabel: STYLES[st].label, brand, prompt: { system: prompt.system, user: prompt.user }, aiBody, body: r.body, report: r.report, png: r.png });
  }
  return { profile, photos, posts: out };
}
