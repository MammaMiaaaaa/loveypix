// 10 Y2K Retro & Playful Couple Photo Booth Frames — High-Res Canvas Renderer
import { getFilterById } from "./filters.js";

export const FRAMES = [
  {
    id: "pixel-love",
    name: "Pixel Love",
    subtitle: "8-Bit Heart",
    icon: "👾",
    swatchBg: "linear-gradient(135deg, #ff4fa3 0%, #ffb3d9 100%)",
  },
  {
    id: "cyber-chrome",
    name: "Cyber Chrome",
    subtitle: "Y2K Sparkle",
    icon: "✦",
    swatchBg: "linear-gradient(135deg, #2563eb 0%, #93c5fd 55%, #e2e8f0 100%)",
  },
  {
    id: "love-exe",
    name: "LOVE.EXE 98",
    subtitle: "Retro OS",
    icon: "💻",
    swatchBg: "linear-gradient(135deg, #c0c0c0 0%, #e5e7eb 50%, #ff85c0 100%)",
  },
  {
    id: "tamagotchi",
    name: "Tamagotchi",
    subtitle: "Virtual Pet",
    icon: "🐣",
    swatchBg: "linear-gradient(135deg, #ffd84d 0%, #b8f742 100%)",
  },
  {
    id: "checker-pop",
    name: "Checker Pop",
    subtitle: "Skater Y2K",
    icon: "🏁",
    swatchBg: "repeating-conic-gradient(#a855f7 0% 25%, #fde047 0% 50%) 50% / 18px 18px",
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    subtitle: "Cloud & Cute",
    icon: "🦋",
    swatchBg: "linear-gradient(180deg, #ff85c0 0%, #93c5fd 100%)",
  },
  {
    id: "mixtape-cd",
    name: "Mixtape CD",
    subtitle: "MP3 Player",
    icon: "💿",
    swatchBg: "linear-gradient(135deg, #ddd6fe 0%, #fbcfe8 55%, #bae6fd 100%)",
  },
  {
    id: "arcade-night",
    name: "Arcade Night",
    subtitle: "Neon Glow",
    icon: "🕹️",
    swatchBg: "linear-gradient(135deg, #1e1038 0%, #581c87 60%, #ec4899 100%)",
  },
  {
    id: "sticker-bomb",
    name: "Sticker Bomb",
    subtitle: "Kawaii Pack",
    icon: "🍓",
    swatchBg: "linear-gradient(135deg, #fffbeb 0%, #ffe4e6 100%)",
  },
  {
    id: "film-2000s",
    name: "Film 2000s",
    subtitle: "35mm Retro",
    icon: "🎞️",
    swatchBg: "linear-gradient(135deg, #18181b 0%, #27272a 70%, #f97316 100%)",
  },
];

export function getFrameById(id) {
  return FRAMES.find((f) => f.id === id) || FRAMES[0];
}

// ============================================================================
// Drawing Primitives (Pixel Art & Y2K Vector Helpers)
// ============================================================================

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawPixelHeart(ctx, cx, cy, px, fill = "#ff2e88", outline = "#1d1528") {
  const grid = [
    "01100110",
    "11111111",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
  ];
  const w = grid[0].length * px;
  const h = grid.length * px;
  const startX = Math.round(cx - w / 2);
  const startY = Math.round(cy - h / 2);

  if (outline) {
    ctx.fillStyle = outline;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === "1") {
          ctx.fillRect(startX + c * px - 2, startY + r * px - 2, px + 4, px + 4);
        }
      }
    }
  }
  ctx.fillStyle = fill;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === "1") {
        ctx.fillRect(startX + c * px, startY + r * px, px, px);
      }
    }
  }
  // Cute pixel shine
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(startX + 1 * px, startY + 1 * px, px, px);
}

function drawSparkle(ctx, cx, cy, size, fill = "#ffffff", stroke = null) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.16, -size * 0.16, size, 0);
  ctx.quadraticCurveTo(size * 0.16, size * 0.16, 0, size);
  ctx.quadraticCurveTo(-size * 0.16, size * 0.16, -size, 0);
  ctx.quadraticCurveTo(-size * 0.16, -size * 0.16, 0, -size);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSmiley(ctx, cx, cy, r, bg = "#ffd84d") {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#1d1528";
  ctx.stroke();

  // Eyes
  ctx.fillStyle = "#1d1528";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.16, r * 0.1, r * 0.16, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + r * 0.3, cy - r * 0.16, r * 0.1, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.05, r * 0.48, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
}

function drawStar5(ctx, cx, cy, outerR, innerR, fill = "#ffd84d", stroke = "#1d1528") {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCloud(ctx, cx, cy, scale = 1, fill = "#ffffff") {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(-20, 4, 16, 0, Math.PI * 2);
  ctx.arc(-4, -8, 20, 0, Math.PI * 2);
  ctx.arc(16, -2, 17, 0, Math.PI * 2);
  ctx.arc(28, 6, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawButterfly(ctx, cx, cy, size = 18, color = "#ff4fa3") {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = "#1d1528";
  ctx.lineWidth = 2;
  // Left wings
  ctx.beginPath();
  ctx.ellipse(-size * 0.55, -size * 0.25, size * 0.55, size * 0.38, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-size * 0.42, size * 0.32, size * 0.38, size * 0.28, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right wings
  ctx.beginPath();
  ctx.ellipse(size * 0.55, -size * 0.25, size * 0.55, size * 0.38, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(size * 0.42, size * 0.32, size * 0.38, size * 0.28, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Body
  ctx.fillStyle = "#1d1528";
  roundRectPath(ctx, -3, -size * 0.45, 6, size * 0.9, 3);
  ctx.fill();
  ctx.restore();
}

function drawStrawberry(ctx, cx, cy, size = 20) {
  ctx.save();
  ctx.translate(cx, cy);
  // Berry body
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.bezierCurveTo(-size, size * 0.4, -size * 0.95, -size * 0.6, 0, -size * 0.55);
  ctx.bezierCurveTo(size * 0.95, -size * 0.6, size, size * 0.4, 0, size);
  ctx.closePath();
  ctx.fillStyle = "#ff3b6b";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#1d1528";
  ctx.stroke();
  // Leaves
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.ellipse(-size * 0.32, -size * 0.55, size * 0.35, size * 0.18, -0.3, 0, Math.PI * 2);
  ctx.ellipse(size * 0.32, -size * 0.55, size * 0.35, size * 0.18, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Seeds
  ctx.fillStyle = "#fef08a";
  [[-6, -2], [6, -2], [0, 5], [-4, 10], [4, 10]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx * (size / 20), sy * (size / 20), 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawCuteBear(ctx, cx, cy, r = 20) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "#d99b66";
  ctx.strokeStyle = "#1d1528";
  ctx.lineWidth = 2.5;
  // Ears
  ctx.beginPath();
  ctx.arc(-r * 0.68, -r * 0.65, r * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(r * 0.68, -r * 0.65, r * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Head
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Snout
  ctx.fillStyle = "#fff1e0";
  ctx.beginPath();
  ctx.ellipse(0, r * 0.22, r * 0.42, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Blush
  ctx.fillStyle = "rgba(255, 105, 165, 0.55)";
  ctx.beginPath();
  ctx.arc(-r * 0.48, r * 0.12, r * 0.18, 0, Math.PI * 2);
  ctx.arc(r * 0.48, r * 0.12, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Eyes & nose
  ctx.fillStyle = "#1d1528";
  ctx.beginPath();
  ctx.arc(-r * 0.32, -r * 0.14, r * 0.1, 0, Math.PI * 2);
  ctx.arc(r * 0.32, -r * 0.14, r * 0.1, 0, Math.PI * 2);
  ctx.arc(0, r * 0.12, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawFilmGrain(ctx, x, y, w, h, amount) {
  if (!amount) return;
  ctx.save();
  const step = 4;
  for (let gx = x; gx < x + w; gx += step) {
    for (let gy = y; gy < y + h; gy += step) {
      if (Math.random() > 0.72) {
        const v = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${v},${v},${v},${amount / 255})`;
        ctx.fillRect(gx, gy, 2, 2);
      }
    }
  }
  ctx.restore();
}

function formatDateStamp(style = "normal") {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const yy = String(yyyy).slice(-2);
  if (style === "film") return `'${yy} ${mm} ${dd}`;
  return `${dd}.${mm}.${yyyy}`;
}

// ============================================================================
// Main Strip Renderer (Supports layout 3 or 4, and all 10 Y2K frames)
// ============================================================================

export function renderPhotoStrip(canvas, options) {
  const {
    photos = [],
    layout = 4,
    frameId = "pixel-love",
    filterId = "original",
    caption = "",
    showDate = true,
  } = options;

  const W = 720;
  const sidePad = frameId === "film-2000s" ? 74 : 46;
  const topPad = frameId === "love-exe" ? 114 : 96;
  const gap = 26;
  const photoW = W - sidePad * 2;
  const photoH = layout === 3 ? Math.round(photoW * 0.74) : Math.round(photoW * 0.68);
  const footerH = frameId === "mixtape-cd" ? 210 : 184;
  const H = topPad + layout * photoH + (layout - 1) * gap + footerH;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const filter = getFilterById(filterId);

  // Compute slot rects
  const slots = [];
  for (let i = 0; i < layout; i++) {
    slots.push({
      x: sidePad,
      y: topPad + i * (photoH + gap),
      w: photoW,
      h: photoH,
    });
  }

  const footerTop = slots[slots.length - 1].y + photoH;
  const userCaption = caption.trim();
  const dateText = showDate ? formatDateStamp(frameId === "film-2000s" ? "film" : "normal") : "";

  // 1) Draw Frame Background
  drawFrameBackground(ctx, frameId, W, H, slots, footerTop);

  // 2) Draw Photos into Slots with Filter
  slots.forEach((slot, idx) => {
    const photo = photos[idx];
    const radius = getPhotoRadius(frameId);

    ctx.save();
    roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, radius);
    ctx.clip();

    if (photo) {
      ctx.filter = filter.css || "none";
      drawImageCover(ctx, photo, slot.x, slot.y, slot.w, slot.h);
      ctx.filter = "none";

      if (filter.tint) {
        ctx.fillStyle = filter.tint;
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      }
      if (filter.grain) {
        drawFilmGrain(ctx, slot.x, slot.y, slot.w, slot.h, filter.grain);
      }
    } else {
      ctx.fillStyle = "#f3e8ff";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      ctx.fillStyle = "#a855f7";
      ctx.font = '700 28px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`POSE #${idx + 1}`, slot.x + slot.w / 2, slot.y + slot.h / 2);
    }
    ctx.restore();

    // Photo border styling per frame
    drawPhotoBorder(ctx, frameId, slot, radius);
  });

  // 3) Draw Frame Foreground Decorations, Header & Footer
  drawFrameOverlay(ctx, frameId, W, H, slots, footerTop, userCaption, dateText);
}

function getPhotoRadius(frameId) {
  switch (frameId) {
    case "love-exe":
    case "film-2000s":
    case "pixel-love":
      return 4;
    case "bubblegum":
    case "tamagotchi":
      return 22;
    default:
      return 12;
  }
}

function drawPhotoBorder(ctx, frameId, slot, radius) {
  ctx.save();
  roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, radius);
  if (frameId === "love-exe") {
    // Inset retro OS bevel
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#808080";
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slot.x + slot.w, slot.y);
    ctx.lineTo(slot.x + slot.w, slot.y + slot.h);
    ctx.lineTo(slot.x, slot.y + slot.h);
    ctx.stroke();
  } else if (frameId === "arcade-night") {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#22d3ee";
    ctx.stroke();
  } else if (frameId === "film-2000s") {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#3f3f46";
    ctx.stroke();
  } else if (frameId === "cyber-chrome") {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1d4ed8";
    ctx.stroke();
  } else {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1d1528";
    ctx.stroke();
  }
  ctx.restore();
}

function drawFrameBackground(ctx, frameId, W, H) {
  ctx.save();
  switch (frameId) {
    case "pixel-love": {
      ctx.fillStyle = "#ff5ca8";
      ctx.fillRect(0, 0, W, H);
      // Pixel dot grid
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (let x = 16; x < W; x += 24) {
        for (let y = 16; y < H; y += 24) {
          ctx.fillRect(x, y, 6, 6);
        }
      }
      // Inner white pixel card
      ctx.fillStyle = "#fff0f7";
      ctx.fillRect(22, 22, W - 44, H - 44);
      ctx.strokeStyle = "#1d1528";
      ctx.lineWidth = 6;
      ctx.strokeRect(22, 22, W - 44, H - 44);
      break;
    }

    case "cyber-chrome": {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#1d4ed8");
      grad.addColorStop(0.35, "#60a5fa");
      grad.addColorStop(0.65, "#e2e8f0");
      grad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Perspective cyber grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 2;
      for (let x = 0; x <= W; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      break;
    }

    case "love-exe": {
      ctx.fillStyle = "#d4d0c8";
      ctx.fillRect(0, 0, W, H);
      // Outer 3D bevel
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(3, H - 3);
      ctx.lineTo(3, 3);
      ctx.lineTo(W - 3, 3);
      ctx.stroke();
      ctx.strokeStyle = "#404040";
      ctx.beginPath();
      ctx.moveTo(W - 3, 3);
      ctx.lineTo(W - 3, H - 3);
      ctx.lineTo(3, H - 3);
      ctx.stroke();

      // Classic Win98 gradient title bar
      const barGrad = ctx.createLinearGradient(16, 16, W - 16, 16);
      barGrad.addColorStop(0, "#2563eb");
      barGrad.addColorStop(0.6, "#a855f7");
      barGrad.addColorStop(1, "#ff4fa3");
      ctx.fillStyle = barGrad;
      ctx.fillRect(16, 16, W - 32, 62);
      break;
    }

    case "tamagotchi": {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#ffe45e");
      grad.addColorStop(0.55, "#b8f742");
      grad.addColorStop(1, "#7bf1a8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Soft diagonal stripes
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 14;
      for (let i = -H; i < W + H; i += 54) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - H * 0.4, H);
        ctx.stroke();
      }
      // Gadget screen border
      roundRectPath(ctx, 20, 20, W - 40, H - 40, 34);
      ctx.strokeStyle = "#1d1528";
      ctx.lineWidth = 6;
      ctx.stroke();
      break;
    }

    case "checker-pop": {
      const size = 40;
      for (let y = 0; y < H; y += size) {
        for (let x = 0; x < W; x += size) {
          const isEven = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0;
          ctx.fillStyle = isEven ? "#a855f7" : "#fde047";
          ctx.fillRect(x, y, size, size);
        }
      }
      // Inner hot-pink frame panel
      roundRectPath(ctx, 26, 26, W - 52, H - 52, 20);
      ctx.fillStyle = "#fff5fb";
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#1d1528";
      ctx.stroke();
      break;
    }

    case "bubblegum": {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#ff7ec3");
      grad.addColorStop(0.5, "#f9a8d4");
      grad.addColorStop(1, "#7dd3fc");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Soft clouds in background
      drawCloud(ctx, 90, 62, 1.15, "rgba(255,255,255,0.75)");
      drawCloud(ctx, W - 95, 76, 0.95, "rgba(255,255,255,0.75)");
      drawCloud(ctx, 110, H - 105, 1.3, "rgba(255,255,255,0.8)");
      drawCloud(ctx, W - 110, H - 72, 1.1, "rgba(255,255,255,0.8)");
      break;
    }

    case "mixtape-cd": {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#e9d5ff");
      grad.addColorStop(0.5, "#fce7f3");
      grad.addColorStop(1, "#cffafe");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Metallic silver inner border
      roundRectPath(ctx, 18, 18, W - 36, H - 36, 24);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 5;
      ctx.stroke();
      roundRectPath(ctx, 24, 24, W - 48, H - 48, 20);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case "arcade-night": {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#120726");
      grad.addColorStop(0.5, "#230c47");
      grad.addColorStop(1, "#120726");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Neon border
      ctx.strokeStyle = "#ff4fa3";
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, W - 32, H - 32);
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, W - 48, H - 48);
      break;
    }

    case "sticker-bomb": {
      ctx.fillStyle = "#fffbeb";
      ctx.fillRect(0, 0, W, H);
      // Polka dots
      ctx.fillStyle = "rgba(255, 133, 192, 0.25)";
      for (let x = 22; x < W; x += 36) {
        for (let y = 22; y < H; y += 36) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = "#1d1528";
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, W - 24, H - 24);
      break;
    }

    case "film-2000s": {
      ctx.fillStyle = "#141418";
      ctx.fillRect(0, 0, W, H);
      // Sprocket holes on left and right sides
      ctx.fillStyle = "#f4f4f5";
      for (let y = 34; y < H - 34; y += 54) {
        roundRectPath(ctx, 18, y, 30, 32, 6);
        ctx.fill();
        roundRectPath(ctx, W - 48, y, 30, 32, 6);
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

function drawFrameOverlay(ctx, frameId, W, H, slots, footerTop, caption, dateText) {
  ctx.save();
  const centerX = W / 2;
  const footerMidY = footerTop + (H - footerTop) / 2;

  switch (frameId) {
    case "pixel-love": {
      // Header
      drawPixelHeart(ctx, 88, 58, 5, "#ff2e88");
      drawPixelHeart(ctx, W - 88, 58, 5, "#ff2e88");
      ctx.fillStyle = "#1d1528";
      ctx.font = '700 26px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("LOVEYPIX ♥ 8-BIT", centerX, 58);

      // Side mini hearts between photos
      slots.forEach((s, i) => {
        if (i < slots.length - 1) {
          const midY = s.y + s.h + 13;
          drawPixelHeart(ctx, 64, midY, 3, "#ff4fa3", null);
          drawPixelHeart(ctx, W - 64, midY, 3, "#ff4fa3", null);
        }
      });

      // Footer
      ctx.fillStyle = "#ff2e88";
      ctx.font = '700 28px "Silkscreen", monospace';
      ctx.fillText(caption || "PLAYER 1 + PLAYER 2", centerX, footerMidY - 18);
      ctx.fillStyle = "#1d1528";
      ctx.font = '700 18px "Silkscreen", monospace';
      ctx.fillText(dateText ? `LEVEL UP! • ${dateText}` : "LEVEL UP! • LOVEYPIX", centerX, footerMidY + 26);
      break;
    }

    case "cyber-chrome": {
      drawSparkle(ctx, 86, 52, 24, "#ffffff", "#1d4ed8");
      drawSparkle(ctx, W - 86, 52, 24, "#ffffff", "#1d4ed8");
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 5;
      ctx.font = '700 30px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText("✦ CYBER LOVE ✦", centerX, 52);
      ctx.fillText("✦ CYBER LOVE ✦", centerX, 52);

      // Corner sparkles on photos
      slots.forEach((s, i) => {
        drawSparkle(ctx, i % 2 === 0 ? s.x + 16 : s.x + s.w - 16, s.y + 18, 16, "#ffffff", "#2563eb");
      });

      // Chrome pill footer
      roundRectPath(ctx, 84, footerMidY - 46, W - 168, 92, 46);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#1d4ed8";
      ctx.stroke();

      ctx.fillStyle = "#1e3a8a";
      ctx.font = '700 28px "Fredoka", sans-serif';
      ctx.fillText(caption || "Y2K SOULMATES", centerX, footerMidY - 12);
      ctx.font = '700 17px "Silkscreen", monospace';
      ctx.fillStyle = "#2563eb";
      ctx.fillText(dateText ? `LOVEYPIX.NET // ${dateText}` : "LOVEYPIX.NET // 2000", centerX, footerMidY + 22);
      break;
    }

    case "love-exe": {
      // Title bar text & Win98 buttons
      ctx.fillStyle = "#ffffff";
      ctx.font = '700 24px "Silkscreen", monospace';
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("♥ LOVE.EXE — Photobooth", 34, 47);

      // _ [] X buttons
      ["_", "□", "×"].forEach((sym, i) => {
        const bx = W - 132 + i * 38;
        ctx.fillStyle = "#d4d0c8";
        ctx.fillRect(bx, 30, 32, 32);
        ctx.strokeStyle = "#1d1528";
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, 30, 32, 32);
        ctx.fillStyle = "#1d1528";
        ctx.font = '700 20px "Space Grotesk", monospace';
        ctx.textAlign = "center";
        ctx.fillText(sym, bx + 16, 46);
      });

      // Progress bar in footer
      const barX = 64;
      const barY = footerTop + 30;
      const barW = W - 128;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(barX, barY, barW, 34);
      ctx.strokeStyle = "#404040";
      ctx.lineWidth = 3;
      ctx.strokeRect(barX, barY, barW, 34);

      // Blue/pink progress blocks
      for (let bx = barX + 6; bx < barX + barW - 14; bx += 22) {
        ctx.fillStyle = bx % 44 === 0 ? "#ff4fa3" : "#2563eb";
        ctx.fillRect(bx, barY + 6, 16, 22);
      }

      ctx.fillStyle = "#1d1528";
      ctx.font = '700 24px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.fillText(caption || "STATUS: 100% IN LOVE", centerX, footerTop + 98);
      ctx.font = '600 18px "Space Grotesk", monospace';
      ctx.fillStyle = "#404040";
      ctx.fillText(dateText ? `Saved on ${dateText} • LoveyPix 98` : "Saved forever • LoveyPix 98", centerX, footerTop + 136);
      break;
    }

    case "tamagotchi": {
      ctx.fillStyle = "#1d1528";
      ctx.font = '700 26px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("★ TAMAGOTCHI LOVE ★", centerX, 56);

      // Cute gadget buttons at bottom
      const btnY = H - 52;
      [centerX - 110, centerX, centerX + 110].forEach((bx, idx) => {
        ctx.beginPath();
        ctx.arc(bx, btnY, 18, 0, Math.PI * 2);
        ctx.fillStyle = idx === 1 ? "#ff4fa3" : "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#1d1528";
        ctx.stroke();
      });

      drawPixelHeart(ctx, 84, footerTop + 56, 4, "#ff4fa3");
      drawPixelHeart(ctx, W - 84, footerTop + 56, 4, "#ff4fa3");

      ctx.fillStyle = "#1d1528";
      ctx.font = '700 27px "Fredoka", sans-serif';
      ctx.fillText(caption || "MY FAVORITE POOKIE ♥", centerX, footerTop + 46);
      ctx.font = '700 17px "Silkscreen", monospace';
      ctx.fillText(dateText || "LOVEYPIX PET", centerX, footerTop + 82);
      break;
    }

    case "checker-pop": {
      drawSmiley(ctx, 88, 60, 22, "#fde047");
      drawStar5(ctx, W - 88, 60, 22, 10, "#ff4fa3", "#1d1528");
      ctx.fillStyle = "#1d1528";
      ctx.font = '700 28px "Fredoka", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CHECKERED CRUSH!", centerX, 60);

      // Footer sticker banner
      roundRectPath(ctx, 70, footerMidY - 42, W - 140, 84, 18);
      ctx.fillStyle = "#fde047";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#1d1528";
      ctx.stroke();

      ctx.fillStyle = "#1d1528";
      ctx.font = '700 28px "Fredoka", sans-serif';
      ctx.fillText(caption || "COOLEST COUPLE EVER", centerX, footerMidY - 10);
      ctx.font = '700 16px "Silkscreen", monospace';
      ctx.fillStyle = "#7e22ce";
      ctx.fillText(dateText ? `LOVEYPIX ★ ${dateText}` : "LOVEYPIX ★ Y2K", centerX, footerMidY + 22);
      break;
    }

    case "bubblegum": {
      drawButterfly(ctx, 90, 56, 20, "#ff4fa3");
      drawButterfly(ctx, W - 90, 56, 20, "#38bdf8");
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#1d1528";
      ctx.lineWidth = 5;
      ctx.font = '700 32px "Fredoka", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText("Bubblegum Crush", centerX, 54);
      ctx.fillText("Bubblegum Crush", centerX, 54);

      ctx.font = '700 30px "Fredoka", sans-serif';
      ctx.strokeText(caption || "Sweetest Us ♥", centerX, footerMidY - 16);
      ctx.fillText(caption || "Sweetest Us ♥", centerX, footerMidY - 16);

      ctx.fillStyle = "#1d1528";
      ctx.font = '700 18px "Fredoka", sans-serif';
      ctx.fillText(dateText ? `LoveyPix • ${dateText}` : "LoveyPix • Forever", centerX, footerMidY + 26);
      break;
    }

    case "mixtape-cd": {
      ctx.fillStyle = "#4c1d95";
      ctx.font = '700 22px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("♪ NOW PLAYING: US ♪", centerX, 54);

      // MP3 Player Footer
      const barY = footerTop + 42;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(96, barY);
      ctx.lineTo(W - 96, barY);
      ctx.stroke();

      ctx.strokeStyle = "#ff4fa3";
      ctx.beginPath();
      ctx.moveTo(96, barY);
      ctx.lineTo(W * 0.62, barY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(W * 0.62, barY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#1d1528";
      ctx.fill();

      ctx.fillStyle = "#475569";
      ctx.font = '700 15px "Space Grotesk", monospace';
      ctx.textAlign = "left";
      ctx.fillText("02:14", 96, barY + 24);
      ctx.textAlign = "right";
      ctx.fillText("03:45", W - 96, barY + 24);

      // Song title & controls
      ctx.textAlign = "center";
      ctx.fillStyle = "#1d1528";
      ctx.font = '700 28px "Fredoka", sans-serif';
      ctx.fillText(caption || "Our Love Song ♥", centerX, footerTop + 98);

      ctx.font = '700 24px "Space Grotesk", sans-serif';
      ctx.fillStyle = "#6d28d9";
      ctx.fillText("⏮    ▶    ⏭", centerX, footerTop + 140);

      if (dateText) {
        ctx.font = '700 15px "Silkscreen", monospace';
        ctx.fillStyle = "#64748b";
        ctx.fillText(`LOVEYPIX MIXTAPE • ${dateText}`, centerX, footerTop + 178);
      }
      break;
    }

    case "arcade-night": {
      drawStar5(ctx, 84, 54, 18, 8, "#fde047", "#ff4fa3");
      drawStar5(ctx, W - 84, 54, 18, 8, "#22d3ee", "#ff4fa3");
      ctx.fillStyle = "#22d3ee";
      ctx.font = '700 26px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ARCADE DATE NIGHT", centerX, 54);

      ctx.fillStyle = "#fde047";
      ctx.font = '700 28px "Silkscreen", monospace';
      ctx.fillText(caption || "HIGH SCORE: US!", centerX, footerMidY - 18);

      ctx.fillStyle = "#ff7ec3";
      ctx.font = '700 17px "Silkscreen", monospace';
      ctx.fillText(dateText ? `INSERT COIN ♥ ${dateText}` : "INSERT COIN ♥ LOVEYPIX", centerX, footerMidY + 26);
      break;
    }

    case "sticker-bomb": {
      // Cute stickers around header & photo corners
      drawCuteBear(ctx, 84, 54, 24);
      drawStrawberry(ctx, W - 84, 54, 22);
      ctx.fillStyle = "#1d1528";
      ctx.font = '700 30px "Fredoka", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Cutie Pie Club!", centerX, 54);

      slots.forEach((s, i) => {
        if (i === 0) drawStar5(ctx, s.x + s.w - 14, s.y + 14, 18, 8, "#fde047", "#1d1528");
        if (i === 1) drawPixelHeart(ctx, s.x + 14, s.y + s.h - 14, 4, "#ff4fa3");
        if (i === 2) drawSmiley(ctx, s.x + s.w - 14, s.y + s.h - 14, 18, "#b8f742");
        if (i === 3) drawStrawberry(ctx, s.x + 18, s.y + 18, 16);
      });

      drawButterfly(ctx, 90, footerMidY, 18, "#c084fc");
      drawPixelHeart(ctx, W - 90, footerMidY, 4, "#ff3b6b");

      ctx.fillStyle = "#ff4fa3";
      ctx.font = '700 30px "Fredoka", sans-serif';
      ctx.fillText(caption || "Best Date Ever ♥", centerX, footerMidY - 14);
      ctx.fillStyle = "#1d1528";
      ctx.font = '700 17px "Silkscreen", monospace';
      ctx.fillText(dateText || "LOVEYPIX STICKERS", centerX, footerMidY + 26);
      break;
    }

    case "film-2000s": {
      ctx.fillStyle = "#f97316";
      ctx.font = '700 22px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("LOVEYPIX 400 • 35MM", centerX, 52);

      // Frame numbers next to each photo
      slots.forEach((s, i) => {
        ctx.fillStyle = "#fb923c";
        ctx.font = '700 16px "Silkscreen", monospace';
        ctx.textAlign = "right";
        ctx.fillText(`0${i + 1}A`, s.x + s.w - 10, s.y + s.h - 16);
      });

      // Retro digital camera orange date stamp & caption
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = '700 28px "Fredoka", sans-serif';
      ctx.fillText(caption || "Memories Together", centerX, footerMidY - 18);

      ctx.fillStyle = "#fb923c";
      ctx.font = '700 22px "Silkscreen", monospace';
      ctx.fillText(dateText || "'26 11 21", centerX, footerMidY + 26);
      break;
    }
  }

  ctx.restore();
}

// ============================================================================
// Landing Page Demo Strip (Cute illustrated couple placeholders)
// ============================================================================

export function renderDemoStrip(canvas, frameId = "pixel-love") {
  const dummyPhotos = [
    createIllustratedPose("#ffd1e8", "#ff4fa3", "✌️", "POSE 1"),
    createIllustratedPose("#dbeafe", "#3b82f6", "🫶", "POSE 2"),
    createIllustratedPose("#fef08a", "#eab308", "😘", "POSE 3"),
    createIllustratedPose("#e9d5ff", "#a855f7", "🥰", "POSE 4"),
  ];

  renderPhotoStrip(canvas, {
    photos: dummyPhotos,
    layout: 4,
    frameId,
    filterId: "original",
    caption: "Raka ♥ Nara",
    showDate: true,
  });
}

function createIllustratedPose(bg, accent, emoji, label) {
  const off = document.createElement("canvas");
  off.width = 480;
  off.height = 360;
  const ctx = off.getContext("2d");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 480, 360);

  // Cute subtle circles
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.arc(90, 80, 56, 0, Math.PI * 2);
  ctx.arc(390, 270, 72, 0, Math.PI * 2);
  ctx.fill();

  // Couple silhouettes / cute emoji
  ctx.font = "110px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 240, 165);

  ctx.fillStyle = accent;
  ctx.font = '700 24px "Silkscreen", monospace';
  ctx.fillText(label, 240, 295);

  return off;
}
