#!/usr/bin/env node
// node cli.js --url spiceroute.in --count 6 --format portrait [--topic "Diwali wishes"] [--type offer] [--style auto|mix|luxe|retro...] [--photos a.jpg,b.jpg]
// node cli.js --demo        (renders every demo brand into samples/)
import fs from "node:fs";
import path from "node:path";
import { DEMOS } from "./src/brain/siteReader.js";
import { runPipeline } from "./src/pipeline.js";
import { STYLE_KEYS } from "./src/engine/theme.js";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith("--") ? [...a, [x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]] : a), []));

export async function generate({ outDir = "out", ...opts }) {
  const res = await runPipeline(opts);
  fs.mkdirSync(outDir, { recursive: true });
  for (const p of res.posts) {
    const file = path.join(outDir, `${res.profile.host}-${p.id}-${p.visualType}-${p.style}.png`);
    fs.writeFileSync(file, p.png);
    console.log(`${p.report.passed ? "OK  " : "WARN"} ${path.basename(file)}  scale=${p.report.scale} ${p.report.ms}ms`);
  }
  return res;
}

if (process.argv[1].endsWith("cli.js")) {
  if (args.demo) for (const host of Object.keys(DEMOS)) await generate({ url: host, count: 4, outDir: "samples" });
  else if (args.url) {
    const uploads = args.photos ? String(args.photos).split(",").map((f) => fs.readFileSync(f.trim())) : [];
    await generate({ url: args.url, topic: args.topic || "", count: +args.count || 6, format: args.format || "portrait", outDir: args.out || "out", type: args.type || null, style: args.style || "auto", uploads });
  } else console.log(`Usage: node cli.js --url yoursite.com [--topic "Diwali wishes"] [--count 6] [--format portrait|square|story|landscape] [--type offer] [--style auto|mix|${STYLE_KEYS.join("|")}] [--photos a.jpg,b.jpg]\n       node cli.js --demo`);
}
