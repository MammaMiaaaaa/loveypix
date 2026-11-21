// Real PNG Transparent Character Engine + 5 Iconic Packs + Custom Upload Support

export const CHARACTER_PACKS = [
  { id: "all", name: "Semua" },
  { id: "bikini-bottom", name: "🧽 Bikini Bottom" },
  { id: "sanrio", name: "🎀 Sanrio" },
  { id: "barbie", name: "💖 Barbie" },
  { id: "meme", name: "😂 Meme Lucu" },
  { id: "classic", name: "🐻 Klasik" },
  { id: "custom", name: "⭐ Upload-ku" },
];

export const BUILTIN_CHARACTERS = [
  { id: "none", pack: "all", name: "Tanpa", emoji: "🚫", bg: "#f3f4f6", src: null },

  // 1. Geng Bikini Bottom
  {
    id: "spongebob",
    pack: "bikini-bottom",
    name: "SpongeBob",
    pose: "Pose ceria / Imagination",
    emoji: "🧽",
    bg: "#fef08a",
    src: "assets/characters/spongebob.png",
  },
  {
    id: "patrick",
    pack: "bikini-bottom",
    name: "Patrick",
    pose: "Senyum polos / pegang hati",
    emoji: "⭐",
    bg: "#fbcfe8",
    src: "assets/characters/patrick.png",
  },
  {
    id: "squidward",
    pack: "bikini-bottom",
    name: "Squidward",
    pose: "Pose cemberut / bersedekap",
    emoji: "🐙",
    bg: "#bae6fd",
    src: "assets/characters/squidward.png",
  },
  {
    id: "mr-krabs",
    pack: "bikini-bottom",
    name: "Mr. Krabs",
    pose: "Mata dolar / angkat capit",
    emoji: "🦀",
    bg: "#fecaca",
    src: "assets/characters/mr-krabs.png",
  },

  // 2. Sanrio Couple Favorites
  {
    id: "kuromi",
    pack: "sanrio",
    name: "Kuromi",
    pose: "Pose cheeky / peace sign",
    emoji: "😈",
    bg: "#e9d5ff",
    src: "assets/characters/kuromi.png",
  },
  {
    id: "my-melody",
    pack: "sanrio",
    name: "My Melody",
    pose: "Pose manis / pegang hati",
    emoji: "🐰",
    bg: "#ffd1e8",
    src: "assets/characters/my-melody.png",
  },
  {
    id: "cinnamoroll",
    pack: "sanrio",
    name: "Cinnamoroll",
    pose: "Terbang melambai gemoy",
    emoji: "☁️",
    bg: "#dbeafe",
    src: "assets/characters/cinnamoroll.png",
  },
  {
    id: "hello-kitty",
    pack: "sanrio",
    name: "Hello Kitty",
    pose: "Pose pita merah klasik",
    emoji: "🎀",
    bg: "#ffe4e6",
    src: "assets/characters/hello-kitty.png",
  },

  // 3. Barbie & Y2K Glam
  {
    id: "barbie",
    pack: "barbie",
    name: "Barbie Glam",
    pose: "Kacamata hati / pink glam",
    emoji: "💖",
    bg: "#ff9fd0",
    src: "assets/characters/barbie.png",
  },
  {
    id: "barbie-ken",
    pack: "barbie",
    name: "Barbie & Ken",
    pose: "Pose couple Y2K",
    emoji: "👑",
    bg: "#fbcfe8",
    src: "assets/characters/barbie-ken.png",
  },

  // 4. Meme & Lucu Korea
  {
    id: "loopy",
    pack: "meme",
    name: "Zanmang Loopy",
    pose: "Peace sign / finger heart",
    emoji: "🦫",
    bg: "#ffd1e8",
    src: "assets/characters/loopy.png",
  },
  {
    id: "we-bare-bears",
    pack: "meme",
    name: "We Bare Bears",
    pose: "Tumpuk tiga (Bear Stack)",
    emoji: "🐼",
    bg: "#fef3c7",
    src: "assets/characters/we-bare-bears.png",
  },
  {
    id: "shinchan",
    pack: "meme",
    name: "Shinchan",
    pose: "Pose joget / pipi merona",
    emoji: "😜",
    bg: "#fed7aa",
    src: "assets/characters/shinchan.png",
  },

  // 5. Klasik Couple
  {
    id: "pooh",
    pack: "classic",
    name: "Winnie the Pooh",
    pose: "Pegang madu / peluk hati",
    emoji: "🍯",
    bg: "#fef08a",
    src: "assets/characters/pooh.png",
  },
  {
    id: "snoopy",
    pack: "classic",
    name: "Snoopy",
    pose: "Joe Cool / peluk hati",
    emoji: "🐶",
    bg: "#e2e8f0",
    src: "assets/characters/snoopy.png",
  },
  {
    id: "pikachu",
    pack: "classic",
    name: "Pikachu",
    pose: "Melambai / pipi listrik",
    emoji: "⚡",
    bg: "#fde047",
    src: "assets/characters/pikachu.png",
  },
  {
    id: "eevee",
    pack: "classic",
    name: "Eevee",
    pose: "Pose duduk gemoy",
    emoji: "🦊",
    bg: "#fde68a",
    src: "assets/characters/eevee.png",
  },
  {
    id: "care-bears",
    pack: "classic",
    name: "Care Bears",
    pose: "Beruang pelangi pastel",
    emoji: "🌈",
    bg: "#cffafe",
    src: "assets/characters/care-bears.png",
  },
];

// ============================================================================
// Image Cache + Custom Uploaded PNGs (Persisted in localStorage)
// ============================================================================

const STORAGE_KEY = "loveypix_custom_characters_v1";
const loadedImages = new Map(); // id -> HTMLImageElement | "missing"
let customCharacters = loadStoredCustomCharacters();

function loadStoredCustomCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveCustomCharacters() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCharacters));
  } catch (err) {
    console.warn("Could not persist custom characters (storage quota):", err);
  }
}

export function getAllCharacters() {
  return [...BUILTIN_CHARACTERS, ...customCharacters];
}

export function getCharacterById(id) {
  return getAllCharacters().find((c) => c.id === id) || BUILTIN_CHARACTERS[0];
}

export function isCharacterAssetLoaded(id) {
  const entry = loadedImages.get(id);
  return entry instanceof HTMLImageElement && entry.complete && entry.naturalWidth > 0;
}

export function isCharacterAssetMissing(id) {
  return loadedImages.get(id) === "missing";
}

export function preloadCharacterAsset(char) {
  if (!char || !char.src) return Promise.resolve(null);
  const existing = loadedImages.get(char.id);
  if (existing instanceof HTMLImageElement) return Promise.resolve(existing);
  if (existing === "missing") return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      loadedImages.set(char.id, img);
      resolve(img);
    };
    img.onerror = () => {
      loadedImages.set(char.id, "missing");
      resolve(null);
    };
    img.src = char.src;
  });
}

export async function addCustomCharacterFile(file) {
  const dataUrl = await resizePngToDataUrl(file, 700);
  const cleanName = file.name.replace(/\.[^.]+$/, "").slice(0, 16) || "Stiker";
  const newChar = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    pack: "custom",
    name: cleanName,
    emoji: "⭐",
    bg: "#fef08a",
    src: dataUrl,
    isCustom: true,
  };
  customCharacters.unshift(newChar);
  if (customCharacters.length > 16) customCharacters = customCharacters.slice(0, 16);
  saveCustomCharacters();
  await preloadCharacterAsset(newChar);
  return newChar;
}

export function removeCustomCharacter(id) {
  customCharacters = customCharacters.filter((c) => c.id !== id);
  loadedImages.delete(id);
  saveCustomCharacters();
}

function resizePngToDataUrl(file, maxDim = 700) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        const s = maxDim / Math.max(w, h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      off.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(off.toDataURL("image/png"));
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

// ============================================================================
// Draw Character Overlay on Live Camera & Captured Photo
// ============================================================================

export function drawCharacterOverlay(ctx, characterId, w, h, opts = {}) {
  if (!characterId || characterId === "none") return null;

  const {
    side = "right",
    sizeScale = "md",
    charX = 0.82,
    charY = 0.78,
    charFlip = false,
    isDragging = false,
  } = typeof opts === "string" ? { side: opts } : opts;

  const char = getCharacterById(characterId);
  if (!char) return null;

  const scaleFactor = sizeScale === "sm" ? 0.28 : sizeScale === "lg" ? 0.52 : 0.4;
  const targetH = h * scaleFactor;

  const img = loadedImages.get(characterId);

  // If real PNG image is loaded, draw it crisply preserving aspect ratio!
  if (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) {
    const ratio = img.naturalWidth / img.naturalHeight;
    const drawH = targetH;
    const drawW = Math.min(drawH * ratio, w * 0.55);
    const actualH = drawW / ratio;

    const drawAt = (cx, cy, flipX) => {
      const dx = cx - drawW / 2;
      const dy = cy - actualH / 2;
      ctx.save();
      if (flipX) {
        ctx.translate(dx + drawW, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, drawW, actualH);
      } else {
        ctx.drawImage(img, dx, dy, drawW, actualH);
      }
      if (isDragging) {
        ctx.strokeStyle = "#ffd84d";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(flipX ? 0 : dx, flipX ? 0 : dy, drawW, actualH);
      }
      ctx.restore();
      return { x: dx, y: dy, w: drawW, h: actualH };
    };

    if (side === "both") {
      const padX = drawW / 2 + w * 0.02;
      const cy = Math.min(h - actualH / 2, Math.max(actualH / 2, charY * h));
      drawAt(padX, cy, !charFlip);
      return drawAt(w - padX, cy, charFlip);
    }

    const cx = charX * w;
    const cy = charY * h;
    return drawAt(cx, cy, charFlip);
  }

  // Trigger async load if not yet attempted
  if (!loadedImages.has(characterId) && char.src) {
    preloadCharacterAsset(char);
  }

  // Friendly placeholder badge if PNG file hasn't been placed in assets/characters/ yet
  const boxW = Math.min(w * 0.34, 290);
  const boxH = 92;
  const bx = Math.max(12, Math.min(w - boxW - 12, charX * w - boxW / 2));
  const by = Math.max(12, Math.min(h - boxH - 12, charY * h - boxH / 2));

  ctx.save();
  ctx.fillStyle = "rgba(255, 245, 251, 0.92)";
  ctx.strokeStyle = "#1d1528";
  ctx.lineWidth = 3;
  roundRect(ctx, bx, by, boxW, boxH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1d1528";
  ctx.font = '700 20px "Fredoka", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`${char.emoji} ${char.name}`, bx + 16, by + 30);

  ctx.fillStyle = "#ff4fa3";
  ctx.font = '600 13px "Space Grotesk", sans-serif';
  ctx.fillText(`Taruh PNG di ${char.src}`, bx + 16, by + 56);
  ctx.fillStyle = "#5b4d6e";
  ctx.fillText("atau klik tombol '+ Upload PNG'", bx + 16, by + 74);
  ctx.restore();
  return { x: bx, y: by, w: boxW, h: boxH };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
