// Virtual Background Engine (MediaPipe Selfie Segmentation + Real Themed/Meme Images + Y2K Studio BGs)

export const VIRTUAL_BGS = [
  {
    id: "none",
    name: "Asli",
    icon: "🚫",
    swatch: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    src: null,
  },
  {
    id: "blur",
    name: "Soft Blur",
    icon: "🫧",
    swatch: "linear-gradient(135deg, #cbd5e1, #94a3b8)",
    src: null,
  },
  // Real Themed & Meme Image Backgrounds
  {
    id: "bikini-bottom",
    name: "Bikini Bottom",
    icon: "🍍",
    src: "assets/backgrounds/bikini-bottom.jpg",
  },
  {
    id: "krusty-krab",
    name: "Krusty Krab",
    icon: "🍔",
    src: "assets/backgrounds/krusty-krab.jpg",
  },
  {
    id: "mariland",
    name: "Sanrio World",
    icon: "🎀",
    src: "assets/backgrounds/mariland.jpg",
  },
  {
    id: "sanrio-land",
    name: "Puroland",
    icon: "🏰",
    src: "assets/backgrounds/sanrio-land.jpg",
  },
  {
    id: "barbie-dreamhouse",
    name: "Barbie House",
    icon: "💖",
    src: "assets/backgrounds/barbie-dreamhouse.jpg",
  },
  {
    id: "this-is-fine",
    name: "This Is Fine 🔥",
    icon: "🔥",
    src: "assets/backgrounds/this-is-fine.jpg",
  },
  {
    id: "windows-xp",
    name: "Y2K Bliss",
    icon: "🏞️",
    src: "assets/backgrounds/windows-xp.jpg",
  },
  {
    id: "hundred-acre-wood",
    name: "Pooh Forest",
    icon: "🍯",
    src: "assets/backgrounds/hundred-acre-wood.jpg",
  },
  {
    id: "pokemon-town",
    name: "Pallet Town",
    icon: "⚡",
    src: "assets/backgrounds/pokemon-town.jpg",
  },
  // Studio & Y2K Canvas Backdrops
  {
    id: "pink-studio",
    name: "Pink Booth",
    icon: "🩷",
    swatch: "linear-gradient(135deg, #ff7ec3, #ffc8e6)",
    src: null,
  },
  {
    id: "y2k-clouds",
    name: "Y2K Sky",
    icon: "☁️",
    swatch: "linear-gradient(180deg, #93c5fd, #fbcfe8)",
    src: null,
  },
  {
    id: "cyber-grid",
    name: "Cyber Neon",
    icon: "⚡",
    swatch: "linear-gradient(135deg, #1e1038, #7e22ce, #22d3ee)",
    src: null,
  },
  {
    id: "cherry-cafe",
    name: "Picnic Pink",
    icon: "🍓",
    swatch: "repeating-conic-gradient(#ffb8dc 0% 25%, #fff5fb 0% 50%) 50% / 14px 14px",
    src: null,
  },
  {
    id: "starry-night",
    name: "Midnight",
    icon: "🌙",
    swatch: "linear-gradient(180deg, #0f172a, #312e81)",
    src: null,
  },
  {
    id: "pixel-hearts",
    name: "Pixel Love",
    icon: "💗",
    swatch: "linear-gradient(135deg, #ff4fa3, #fde047)",
    src: null,
  },
];

// ============================================================================
// Background Image Cache
// ============================================================================

const bgImageCache = new Map();

export function preloadVirtualBgImage(bgId) {
  const bg = VIRTUAL_BGS.find((b) => b.id === bgId);
  if (!bg || !bg.src) return Promise.resolve(null);
  const existing = bgImageCache.get(bgId);
  if (existing instanceof HTMLImageElement) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      bgImageCache.set(bgId, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = bg.src;
  });
}

// ============================================================================
// MediaPipe Selfie Segmenter (Pre-warmed, Balanced Speed + Crisp 256x256 Edges)
// ============================================================================

const isIOS =
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isMobile = isIOS || /Android/i.test(navigator.userAgent);

let segmenter = null;
let segmenterPromise = null;
let segmenterFailed = false;
let lastMaskTimestamp = 0;
let hasValidMask = false;
let prevAlpha = null; // Temporal smoothing buffer to prevent flickering/jagged edges

const maskCanvas = document.createElement("canvas");
const maskCtx = maskCanvas.getContext("2d");
const personCanvas = document.createElement("canvas");
const personCtx = personCanvas.getContext("2d");
const blurCanvasA = document.createElement("canvas");
const blurCtxA = blurCanvasA.getContext("2d");
const blurCanvasB = document.createElement("canvas");
const blurCtxB = blurCanvasB.getContext("2d");

export function isSegmenterReady() {
  return Boolean(segmenter);
}

export function prewarmSegmenter() {
  if (!segmenter && !segmenterPromise && !segmenterFailed) {
    ensureSegmenter().catch(() => {});
  }
}

export async function ensureSegmenter(onStatus) {
  if (segmenter) return segmenter;
  if (segmenterFailed) return null;
  if (segmenterPromise) {
    if (onStatus) onStatus("Memuat AI Virtual Background...");
    const res = await segmenterPromise;
    if (onStatus) onStatus(null);
    return res;
  }

  segmenterPromise = (async () => {
    // 256x256 square selfie_segmenter gives much cleaner hair/shoulder edges than landscape 256x144
    const modelUrl =
      "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

    const createWithDelegate = async (delegate) => {
      const vision = await import(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
      );
      const fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      return vision.ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: modelUrl, delegate },
        runningMode: "VIDEO",
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    };

    try {
      if (onStatus) onStatus("Memuat AI Virtual Background...");
      // On iOS, go straight to CPU to avoid the 15s WebGL2 GPU timeout while keeping 256x256 quality
      segmenter = await createWithDelegate(isIOS ? "CPU" : "GPU");
      if (onStatus) onStatus(null);
      return segmenter;
    } catch (err) {
      console.warn("Primary segmenter delegate failed, retrying CPU:", err);
      try {
        segmenter = await createWithDelegate("CPU");
        if (onStatus) onStatus(null);
        return segmenter;
      } catch (err2) {
        console.error("Virtual BG segmenter failed:", err2);
        segmenterFailed = true;
        if (onStatus) onStatus(null);
        return null;
      }
    }
  })();

  return segmenterPromise;
}

// ============================================================================
// Composite Video Frame + Virtual Background onto target Canvas
// ============================================================================

export function drawVideoWithVirtualBg(ctx, video, w, h, bgId, mirrored) {
  const drawCroppedVideo = (targetCtx, tw, th) => {
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const vRatio = vw / vh;
    const cRatio = tw / th;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (vRatio > cRatio) {
      sw = vh * cRatio;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / cRatio;
      sy = (vh - sh) / 2;
    }
    targetCtx.save();
    if (mirrored) {
      targetCtx.translate(tw, 0);
      targetCtx.scale(-1, 1);
    }
    targetCtx.drawImage(video, sx, sy, sw, sh, 0, 0, tw, th);
    targetCtx.restore();
  };

  if (bgId === "none" || !segmenter || video.readyState < 2) {
    drawCroppedVideo(ctx, w, h);
    return;
  }

  // Balanced ~25fps on mobile, ~40fps on desktop with temporal & spatial edge smoothing
  const now = performance.now();
  const minInterval = isMobile ? 38 : 24;
  if (!hasValidMask || now - lastMaskTimestamp >= minInterval) {
    let result = null;
    try {
      result = segmenter.segmentForVideo(video, now);
    } catch {
      drawCroppedVideo(ctx, w, h);
      return;
    }

    const confMask = result?.confidenceMasks?.[0];
    if (confMask) {
      const mw = confMask.width;
      const mh = confMask.height;
      const len = mw * mh;
      const floatData = confMask.getAsFloat32Array();

      if (!prevAlpha || prevAlpha.length !== len) {
        prevAlpha = new Float32Array(len);
      }

      // 1) Smoothstep confidence ramp + temporal blend (reduces jitter)
      const rawAlpha = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        const v = floatData[i];
        let t = (v - 0.18) / 0.62;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        // Smoothstep curve for natural soft hair/shoulder transition
        const s = t * t * (3 - 2 * t);
        const blended = hasValidMask ? s * 0.72 + prevAlpha[i] * 0.28 : s;
        prevAlpha[i] = blended;
        rawAlpha[i] = blended;
      }

      // 2) Fast 3x3 spatial feathering pass on mask edges (eliminates jagged/stair-step edges!)
      if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
        maskCanvas.width = mw;
        maskCanvas.height = mh;
      }
      const imgData = maskCtx.createImageData(mw, mh);
      const px = imgData.data;
      for (let y = 0; y < mh; y++) {
        const yUp = y > 0 ? y - 1 : 0;
        const yDn = y < mh - 1 ? y + 1 : mh - 1;
        for (let x = 0; x < mw; x++) {
          const idx = y * mw + x;
          const c = rawAlpha[idx];
          let avg = c;
          // Only feather transition zone pixels for maximum speed
          if (c > 0.02 && c < 0.98) {
            const xL = x > 0 ? x - 1 : 0;
            const xR = x < mw - 1 ? x + 1 : mw - 1;
            avg =
              (rawAlpha[yUp * mw + xL] +
                rawAlpha[yUp * mw + x] * 2 +
                rawAlpha[yUp * mw + xR] +
                rawAlpha[y * mw + xL] * 2 +
                c * 4 +
                rawAlpha[y * mw + xR] * 2 +
                rawAlpha[yDn * mw + xL] +
                rawAlpha[yDn * mw + x] * 2 +
                rawAlpha[yDn * mw + xR]) /
              16;
          }
          const o = idx * 4;
          px[o] = 255;
          px[o + 1] = 255;
          px[o + 2] = 255;
          px[o + 3] = Math.round(avg * 255);
        }
      }
      maskCtx.putImageData(imgData, 0, 0);
      hasValidMask = true;
      lastMaskTimestamp = now;
    }
    result?.close?.();
  }

  if (!hasValidMask) {
    drawCroppedVideo(ctx, w, h);
    return;
  }

  const mw = maskCanvas.width;
  const mh = maskCanvas.height;

  // 2) Draw chosen background
  const bgDef = VIRTUAL_BGS.find((b) => b.id === bgId);
  if (bgId === "blur") {
    drawSmoothSoftBlur(ctx, drawCroppedVideo, w, h);
  } else if (bgDef?.src) {
    const bgImg = bgImageCache.get(bgId);
    if (bgImg instanceof HTMLImageElement && bgImg.complete && bgImg.naturalWidth > 0) {
      drawCoverImage(ctx, bgImg, w, h);
    } else {
      preloadVirtualBgImage(bgId);
      ctx.fillStyle = "#1d1528";
      ctx.fillRect(0, 0, w, h);
    }
  } else {
    drawVirtualBgArt(ctx, bgId, w, h);
  }

  // 3) Cut out foreground person cleanly with smooth mask
  if (personCanvas.width !== w || personCanvas.height !== h) {
    personCanvas.width = w;
    personCanvas.height = h;
  }
  personCtx.clearRect(0, 0, w, h);
  personCtx.globalCompositeOperation = "source-over";
  drawCroppedVideo(personCtx, w, h);

  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 480;
  const vRatio = vw / vh;
  const cRatio = w / h;
  let msx = 0, msy = 0, msw = mw, msh = mh;
  if (vRatio > cRatio) {
    msw = mh * cRatio;
    msx = (mw - msw) / 2;
  } else {
    msh = mw / cRatio;
    msy = (mh - msh) / 2;
  }

  personCtx.save();
  personCtx.globalCompositeOperation = "destination-in";
  personCtx.imageSmoothingEnabled = true;
  personCtx.imageSmoothingQuality = "high";
  if (mirrored) {
    personCtx.translate(w, 0);
    personCtx.scale(-1, 1);
  }
  personCtx.drawImage(maskCanvas, msx, msy, msw, msh, 0, 0, w, h);
  personCtx.restore();

  // 4) Composite foreground person over background
  ctx.drawImage(personCanvas, 0, 0, w, h);
}

// Buttery-smooth Soft Blur (uses native CSS filter on half-res canvas, or multi-pass bilinear fallback)
function drawSmoothSoftBlur(ctx, drawCroppedVideo, w, h) {
  const halfW = Math.round(w * 0.5);
  const halfH = Math.round(h * 0.5);
  if (blurCanvasA.width !== halfW || blurCanvasA.height !== halfH) {
    blurCanvasA.width = halfW;
    blurCanvasA.height = halfH;
  }

  if (typeof blurCtxA.filter === "string") {
    blurCtxA.save();
    blurCtxA.filter = "blur(8px)";
    drawCroppedVideo(blurCtxA, halfW, halfH);
    blurCtxA.restore();
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(blurCanvasA, 0, 0, halfW, halfH, 0, 0, w, h);
    ctx.restore();
    return;
  }

  // Fallback progressive multi-pass blur (smooth, non-blocky)
  const qW = Math.round(w * 0.25);
  const qH = Math.round(h * 0.25);
  if (blurCanvasB.width !== qW || blurCanvasB.height !== qH) {
    blurCanvasB.width = qW;
    blurCanvasB.height = qH;
  }
  drawCroppedVideo(blurCtxA, halfW, halfH);
  blurCtxB.imageSmoothingEnabled = true;
  blurCtxB.drawImage(blurCanvasA, 0, 0, halfW, halfH, 0, 0, qW, qH);
  blurCtxA.imageSmoothingEnabled = true;
  blurCtxA.drawImage(blurCanvasB, 0, 0, qW, qH, 0, 0, halfW, halfH);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(blurCanvasA, 0, 0, halfW, halfH, 0, 0, w, h);
  ctx.restore();
}

function drawCoverImage(ctx, img, w, h) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (ir > cr) {
    sw = img.naturalHeight * cr;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / cr;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

// ============================================================================
// Procedural Y2K / Studio Backdrops
// ============================================================================

function drawVirtualBgArt(ctx, bgId, w, h) {
  ctx.save();
  switch (bgId) {
    case "pink-studio": {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#ff9fd0");
      grad.addColorStop(1, "#ffe4f3");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += w / 10) {
        const fold = ctx.createLinearGradient(x, 0, x + w / 10, 0);
        fold.addColorStop(0, "rgba(255,255,255,0.22)");
        fold.addColorStop(0.5, "rgba(255,79,163,0.12)");
        fold.addColorStop(1, "rgba(255,255,255,0.22)");
        ctx.fillStyle = fold;
        ctx.fillRect(x, 0, w / 10, h);
      }
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = `${Math.round(w * 0.08)}px sans-serif`;
      ctx.fillText("♥", w * 0.1, h * 0.22);
      ctx.fillText("✦", w * 0.84, h * 0.24);
      ctx.fillText("♥", w * 0.82, h * 0.78);
      break;
    }

    case "y2k-clouds": {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#7dd3fc");
      grad.addColorStop(0.55, "#c4b5fd");
      grad.addColorStop(1, "#fbcfe8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      const drawCloud = (cx, cy, s) => {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(cx - 28 * s, cy + 8 * s, 26 * s, 0, Math.PI * 2);
        ctx.arc(cx, cy - 10 * s, 34 * s, 0, Math.PI * 2);
        ctx.arc(cx + 32 * s, cy + 4 * s, 28 * s, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(w * 0.18, h * 0.22, w / 600);
      drawCloud(w * 0.82, h * 0.26, w / 550);
      drawCloud(w * 0.15, h * 0.78, w / 680);
      drawCloud(w * 0.86, h * 0.75, w / 650);
      break;
    }

    case "cyber-grid": {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#120726");
      grad.addColorStop(0.55, "#3b0764");
      grad.addColorStop(1, "#831843");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      const sunGrad = ctx.createLinearGradient(0, h * 0.18, 0, h * 0.56);
      sunGrad.addColorStop(0, "#fde047");
      sunGrad.addColorStop(1, "#ff4fa3");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(34, 211, 238, 0.55)";
      ctx.lineWidth = 2;
      const horizon = h * 0.56;
      for (let i = 0; i <= 10; i++) {
        const y = horizon + Math.pow(i / 10, 1.6) * (h - horizon);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + i * (w * 0.05), horizon);
        ctx.lineTo(w / 2 + i * (w * 0.22), h);
        ctx.stroke();
      }
      break;
    }

    case "cherry-cafe": {
      const size = Math.max(28, Math.round(w / 16));
      ctx.fillStyle = "#fff5fb";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255, 133, 192, 0.35)";
      for (let x = 0; x < w; x += size * 2) ctx.fillRect(x, 0, size, h);
      for (let y = 0; y < h; y += size * 2) ctx.fillRect(0, y, w, size);
      break;
    }

    case "starry-night": {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#090d24");
      grad.addColorStop(1, "#2e1065");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 42; i++) {
        const sx = ((i * 137.5) % 100) * (w / 100);
        const sy = ((i * 73.1) % 100) * (h / 100);
        const r = (i % 3) + 1.5;
        ctx.fillStyle = i % 4 === 0 ? "#fde047" : "#ffffff";
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(w * 0.16, h * 0.2, w * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111036";
      ctx.beginPath();
      ctx.arc(w * 0.185, h * 0.185, w * 0.052, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "pixel-hearts": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#ff85c0");
      grad.addColorStop(0.5, "#fde047");
      grad.addColorStop(1, "#a855f7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.38)";
      const step = Math.max(54, Math.round(w / 11));
      ctx.font = `${Math.round(step * 0.52)}px sans-serif`;
      for (let y = step * 0.7; y < h; y += step) {
        for (let x = step * 0.3; x < w; x += step) {
          ctx.fillText((Math.floor(x / step) + Math.floor(y / step)) % 2 === 0 ? "♥" : "★", x, y);
        }
      }
      break;
    }
  }
  ctx.restore();
}
