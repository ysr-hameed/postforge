// Zero-dependency HTTP server: serves the UI and the JSON API.  npm start -> http://localhost:3000
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEMOS } from "./brain/siteReader.js";
import { runPipeline, brandOf } from "./pipeline.js";
import { renderPost } from "./engine/render.js";
import { FORMATS } from "./engine/formats.js";
import { STYLES } from "./engine/theme.js";
import { VISUAL_TYPES } from "./brain/visualTypes.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const UI = path.resolve(here, "../ui");
const PORT = process.env.PORT || 3000;

const sessions = new Map(); // sid -> photos[] (kept so /api/rerender can re-render with the same images)
const dataUrlToBuf = (u) => Buffer.from(String(u).split(",")[1] || "", "base64");
const readJson = (req) => new Promise((ok, bad) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 40e6) req.destroy(); }); req.on("end", () => { try { ok(JSON.parse(b || "{}")); } catch (e) { bad(e); } }); });
const send = (res, code, obj, type = "application/json") => { res.writeHead(code, { "content-type": type }); res.end(type === "application/json" ? JSON.stringify(obj) : obj); };

const routes = {
  "GET /api/meta": async () => ({
    demos: Object.keys(DEMOS), formats: Object.fromEntries(Object.entries(FORMATS).map(([k, v]) => [k, v.label])),
    types: Object.fromEntries(Object.entries(VISUAL_TYPES).map(([k, v]) => [k, v.label])), styles: Object.fromEntries(Object.entries(STYLES).map(([k, v]) => [k, v.label])),
  }),

  "POST /api/generate": async (req) => {
    const { url, topic = "", count = 6, format = "portrait", type = "", style = "auto", seed = 11, photos = [] } = await readJson(req);
    const uploads = photos.slice(0, 4).map(dataUrlToBuf).filter((b) => b.length > 100);
    const res = await runPipeline({ url, topic: topic.trim(), count, format, type: type || null, style, uploads, seed });
    const sid = Math.random().toString(36).slice(2);
    sessions.set(sid, res.photos); if (sessions.size > 25) sessions.delete(sessions.keys().next().value);
    const { photos: _p, ...profile } = res.profile;
    return {
      sid, profile: { ...profile, photoCount: res.photos.length },
      posts: res.posts.map((p) => ({ ...p, png: "data:image/png;base64," + p.png.toString("base64") })),
    };
  },

  // Edit the AI's body in the UI and see the engine guard it live.
  "POST /api/rerender": async (req) => {
    const { body, brand, format = "portrait", tag = "", seed = 7, sid, photoBg = false } = await readJson(req);
    const r = await renderPost({ body, brand, format, tag, seed, photos: sessions.get(sid) || [], photoBg });
    return { body: r.body, report: r.report, png: "data:image/png;base64," + r.png.toString("base64") };
  },
};

http.createServer(async (req, res) => {
  try {
    const key = `${req.method} ${req.url.split("?")[0]}`;
    if (routes[key]) return send(res, 200, await routes[key](req));
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) return send(res, 200, fs.readFileSync(path.join(UI, "index.html"), "utf8"), "text/html; charset=utf-8");
    send(res, 404, { error: "not found" });
  } catch (e) { console.error(e); send(res, 500, { error: String(e.message || e) }); }
}).listen(PORT, () => console.log(`PostForge running -> http://localhost:${PORT}`));
