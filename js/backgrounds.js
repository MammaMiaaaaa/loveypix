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
// MediaPipe Selfie Segmenter (Lazy-loaded on first Virtual BG selection)
// ============================================================================

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isMobile = isIOS || /Android/i.test(navigator.userAgent);

let segmenter = null;
let segmenterPromise = null;
let segmenterFailed = false;
let lastMaskTimestamp = 0;
let hasValidMask = false;

const maskCanvas = document.createElement("canvas");
const maskCtx = maskCanvas.getContext("2d");
const personCanvas = document.createElement("canvas");
const personCtx = personCanvas.getContext("2d");
const blurCanvas = document.createElement("canvas");
const blurCtx = blurCanvas.getContext("2d");

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
    const modelUrl =
      "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite";

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
      // On iOS Safari, GPU WebGL2 delegate often hangs/fails and causes 15-20s retries; go straight to CPU
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

  // On mobile, throttle segmentation to ~15fps and reuse latest mask for smooth rendering
  const now = performance.now();
  const minInterval = isMobile ? 65 : 28;
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
      const floatData = confMask.getAsFloat32Array();

      if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
        maskCanvas.width = mw;
        maskCanvas.height = mh;
      }
      const imgData = maskCtx.createImageData(mw, mh);
      const px = imgData.data;
      for (let i = 0; i < floatData.length; i++) {
        const v = floatData[i];
        const alpha = v < 0.25 ? 0 : v > 0.72 ? 255 : Math.round(((v - 0.25) / 0.47) * 255);
        const o = i * 4;
        px[o] = 255;
        px[o + 1] = 255;
        px[o + 2] = 255;
        px[o + 3] = alpha;
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

  // 2) Draw chosen background (fast downscale blur for iOS compatibility, real image, or Y2K art)
  const bgDef = VIRTUAL_BGS.find((b) => b.id === bgId);
  if (bgId === "blur") {
    const bw = Math.max(48, Math.round(w / 14));
    const bh = Math.max(36, Math.round(h / 14));
    if (blurCanvas.width !== bw || blurCanvas.height !== bh) {
      blurCanvas.width = bw;
      blurCanvas.height = bh;
    }
    drawCroppedVideo(blurCtx, bw, bh);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(blurCanvas, 0, 0, bw, bh, 0, 0, w, h);
    ctx.restore();
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

  // 3) Cut out foreground person
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
  if (!isIOS) {
    personCtx.filter = "blur(1.5px)";
  }
  if (mirrored) {
    personCtx.translate(w, 0);
    personCtx.scale(-1, 1);
  }
  personCtx.drawImage(maskCanvas, msx, msy, msw, msh, 0, 0, w, h);
  personCtx.restore();

  // 4) Composite foreground person over background
  ctx.drawImage(personCanvas, 0, 0, w, h);
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
