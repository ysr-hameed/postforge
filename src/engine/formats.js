// Canvas formats. Safe margins are enforced by the engine, never by the AI.
export const FORMATS = {
  portrait:  { w: 1080, h: 1350, label: "Portrait 4:5 (Instagram feed)" },
  square:    { w: 1080, h: 1080, label: "Square 1:1" },
  story:     { w: 1080, h: 1920, label: "Story / Reel 9:16", safeTop: 140, safeBottom: 180 },
  landscape: { w: 1200, h: 675,  label: "Landscape 16:9 (X / LinkedIn)" },
};
export const getFormat = (k) => FORMATS[k] || FORMATS.portrait;
