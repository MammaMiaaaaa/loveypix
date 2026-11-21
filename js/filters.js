// Live & Canvas Photo Filters for LoveyPix

export const FILTERS = [
  {
    id: "original",
    name: "Original",
    swatch: "linear-gradient(135deg, #fff, #e5e7eb)",
    css: "none",
    tint: null,
    grain: 0,
  },
  {
    id: "soft-pink",
    name: "Soft Pink",
    swatch: "linear-gradient(135deg, #ffb8dc, #ffe4f2)",
    css: "brightness(1.06) contrast(0.95) saturate(1.18) hue-rotate(-6deg)",
    tint: "rgba(255, 133, 192, 0.18)",
    grain: 0,
  },
  {
    id: "vintage",
    name: "Vintage Film",
    swatch: "linear-gradient(135deg, #f3c892, #a67c52)",
    css: "sepia(0.32) contrast(1.06) brightness(1.02) saturate(0.92)",
    tint: "rgba(255, 200, 130, 0.14)",
    grain: 14,
  },
  {
    id: "warm",
    name: "Warm Glow",
    swatch: "linear-gradient(135deg, #ffd84d, #fb923c)",
    css: "brightness(1.05) saturate(1.25) sepia(0.16) contrast(1.03)",
    tint: "rgba(255, 180, 90, 0.12)",
    grain: 0,
  },
  {
    id: "bw",
    name: "B&W Classic",
    swatch: "linear-gradient(135deg, #111827, #f9fafb)",
    css: "grayscale(1) contrast(1.18) brightness(1.03)",
    tint: null,
    grain: 8,
  },
  {
    id: "y2k-dream",
    name: "Y2K Dream",
    swatch: "linear-gradient(135deg, #60a5fa, #e879f9)",
    css: "brightness(1.06) contrast(1.04) saturate(1.22) hue-rotate(8deg)",
    tint: "rgba(168, 85, 247, 0.14)",
    grain: 0,
  },
];

export function getFilterById(id) {
  return FILTERS.find((f) => f.id === id) || FILTERS[0];
}
