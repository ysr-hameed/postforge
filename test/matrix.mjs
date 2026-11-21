import fs from "node:fs";
import { DEMOS } from "../src/brain/siteReader.js";
import { runPipeline } from "../src/pipeline.js";
import { FORMATS } from "../src/engine/formats.js";
import { renderPost } from "../src/engine/render.js";

const only = process.argv[2]; // optional: format filter
let total = 0, fail = 0, dropped = 0; const bad = [], typesSeen = new Set(), stylesSeen = new Set();
for (const host of Object.keys(DEMOS)) for (const fmt of Object.keys(FORMATS)) {
  if (only && fmt !== only) continue;
  for (const style of ["auto", "mix"]) {
    const res = await runPipeline({ url: host, count: 12, format: fmt, style, seed: style === "mix" ? 42 : 11 });
    for (const p of res.posts) {
      total++; typesSeen.add(p.visualType); stylesSeen.add(p.style);
      if (p.report.droppedOptional.length) dropped++;
      if (!p.report.passed) { fail++; bad.push(`${host} ${fmt} ${p.visualType} ${p.style} s=${p.report.scale} ${JSON.stringify(p.report.issues[0] || {})}`); }
    }
  }
}
console.log(`matrix: ${total} renders, ${fail} failed, ${dropped} used optional-drop, ${typesSeen.size} visual types, ${stylesSeen.size} styles`);
bad.slice(0, 20).forEach((b) => console.log("  FAIL", b));

const hostile = `<script>alert(1)</script><img src="http://x/y.png"><img data-slot="zzz"><div style="position:absolute;left:-400px;font-size:300px;margin:900px">😀 bad</div>
<h1 class="made-up-class pf-h1">${"Supercalifragilisticexpialidocious ".repeat(12)}</h1><p>${"lorem ipsum dolor sit amet ".repeat(80)}</p>
<span class="pf-num" style="font-size:900px">1234567890123</span><div class="pf-optional"><p>dropme one</p></div>`;
const h = await renderPost({ body: hostile, brand: { name: "SlyxUp", style: "midnight" }, format: "portrait", tag: "hostile" });
console.log("hostile:", JSON.stringify({ passed: h.report.passed, clipped: h.report.clipped, dropped: h.report.droppedOptional.length, warnings: h.report.sanitizerWarnings.length }));
