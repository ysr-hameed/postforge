// Geometry guard: finds overflow / overlap / clipping from Takumi's measured layout tree,
// then picks the LARGEST type scale that passes. Optional blocks are dropped if nothing fits.
const EPS = 1.5;
const rect = (n) => ({ x: n.transform[4], y: n.transform[5], w: n.width, h: n.height });
const plain = (n) => Math.abs(n.transform[1]) < 1e-3 && Math.abs(n.transform[2]) < 1e-3;

export function analyze(root) {
  const issues = [];
  const frame = root.children[1];
  if (!frame) return { issues: [{ type: "structure", msg: "frame missing" }], fill: 0 };
  const main = frame.children[1];
  const M = rect(main);
  let lastBottom = M.y;

  const walk = (n, path) => {
    const R = rect(n);
    const kids = n.children;
    kids.forEach((c, i) => {
      const C = rect(c), where = `${path}>${i}`;
      if (!plain(c) || C.w === 0 || C.h === 0) return;
      if (C.x + C.w > R.x + R.w + EPS) issues.push({ type: "overflow-x", where, by: Math.round(C.x + C.w - R.x - R.w) });
      if (C.y + C.h > R.y + R.h + EPS) issues.push({ type: "overflow-y", where, by: Math.round(C.y + C.h - R.y - R.h) });
      if (C.x < R.x - EPS) issues.push({ type: "overflow-left", where });
      if (C.y < R.y - EPS) issues.push({ type: "overflow-top", where });
    });
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = rect(kids[i]), b = rect(kids[j]);
      if (!plain(kids[i]) || !plain(kids[j]) || !a.w || !b.w || !a.h || !b.h) continue;
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 3 && oy > 3) issues.push({ type: "overlap", where: `${path}>${i}&${j}`, area: Math.round(ox * oy) });
    }
    // text runs must stay inside their own box
    for (const run of n.runs || []) {
      if (run.x + run.width > R.w + EPS + 2) issues.push({ type: "text-overflow-x", where: path, text: run.text.slice(0, 24) });
    }
    kids.forEach((c, i) => walk(c, `${path}>${i}`));
  };

  walk(frame, "frame");
  for (const c of main.children) lastBottom = Math.max(lastBottom, c.transform[5] + c.height);
  const fill = Math.min(1.5, (lastBottom - M.y) / M.h);
  // header / footer must not be squeezed
  return { issues, fill };
}

// Levers, in order of preference: (1) biggest type scale that fits, (2) tighter spacing density,
// (3) drop pf-optional blocks, last-first. The engine never lets the AI "win" by overflowing.
const DENSITIES = [1, 0.8, 0.62];

export async function fitScale({ measure, bodyRoot, min = 0.8, max = 1.4, iters = 9 }) {
  const dropped = [];
  const initial = bodyRoot.innerHTML;
  const tryAt = async (s, d) => analyze(await measure(bodyRoot.innerHTML, s, d));

  for (;;) {
    for (const d of DENSITIES) {
      const atMin = await tryAt(min, d);
      if (atMin.issues.length) continue;
      const atMax = await tryAt(max, d);
      if (!atMax.issues.length) return { scale: max, density: d, ok: true, dropped, result: atMax };
      let lo = min, hi = max, bestRes = atMin;
      for (let i = 0; i < iters; i++) {
        const mid = (lo + hi) / 2, r = await tryAt(mid, d);
        if (r.issues.length === 0) { lo = mid; bestRes = r; } else hi = mid;
      }
      // Text wrapping flips at hard thresholds, so never sit exactly on one:
      // back off 1.5% and VERIFY the exact value that will be rendered.
      let final = Math.max(min, lo * 0.985), res = await tryAt(final, d);
      while (res.issues.length && final > min) { final = Math.max(min, final * 0.98); res = await tryAt(final, d); }
      if (!res.issues.length) return { scale: final, density: d, ok: true, dropped, result: res };
    }
    const opt = bodyRoot.querySelectorAll(".pf-optional");
    if (!opt.length) {
      const d = DENSITIES[DENSITIES.length - 1];
      // nothing fits even after every optional drop -> dropping content only hurts: restore it and let the engine clip + flag
      if (dropped.length) bodyRoot.set_content(initial);
      return { scale: min, density: d, ok: false, dropped: [], result: await tryAt(min, d) };
    }
    const victim = opt[opt.length - 1];
    dropped.push(victim.text.trim().slice(0, 40) || "optional block");
    victim.remove();
  }
}
