// LoveyPix — Main Application Controller
import { FILTERS, getFilterById } from "./filters.js";
import { FRAMES, getFrameById, renderPhotoStrip, renderDemoStrip } from "./frames.js";
import {
  VIRTUAL_BGS,
  ensureSegmenter,
  prewarmSegmenter,
  preloadVirtualBgImage,
  drawVideoWithVirtualBg,
} from "./backgrounds.js";
import {
  CHARACTER_PACKS,
  getAllCharacters,
  getCharacterById,
  preloadCharacterAsset,
  isCharacterAssetLoaded,
  addCustomCharacterFile,
  removeCustomCharacter,
  drawCharacterOverlay,
} from "./characters.js";
import { sound } from "./sound.js";

// ============================================================================
// Application State
// ============================================================================

const state = {
  step: 1, // 1 = Setup, 2 = Capture/Upload, 3 = Frame & Download
  layout: 4, // 3 or 4
  mode: "camera", // "camera" | "upload"
  timer: 3, // 3, 5, or 0 (manual)
  filterId: "original",
  frameId: "pixel-love",
  caption: "",
  showDate: true,

  // Fullscreen Camera Effects
  dockTab: "filter", // "filter" | "bg" | "char"
  virtualBgId: "none",
  characterPack: "all",
  characterId: "none",
  characterSide: "right", // "right" | "left" | "both"
  characterSize: "md", // "sm" | "md" | "lg"
  charX: 0.82,
  charY: 0.78,
  charFlip: false,
  isDraggingChar: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
  lastCharBox: null,

  // Camera state
  stream: null,
  rafId: null,
  facingMode: "user",
  videoDevices: [],
  currentDeviceIndex: 0,
  mirrored: true,
  isCapturing: false,
  retakeSlotIndex: null,

  // Captured/uploaded HTMLCanvasElement per slot
  photos: [null, null, null, null],
  demoFrameIndex: 0,
};

// ============================================================================
// DOM Elements
// ============================================================================

const el = {
  // Topbar
  btnHome: document.getElementById("btnHome"),
  btnSound: document.getElementById("btnSound"),
  soundIcon: document.getElementById("soundIcon"),
  stepPills: document.querySelectorAll(".step-pill"),

  // Views
  viewSetup: document.getElementById("viewSetup"),
  fullscreenBooth: document.getElementById("fullscreenBooth"),
  viewCapture: document.getElementById("viewCapture"),
  viewCustomize: document.getElementById("viewCustomize"),

  // Setup
  layoutBtns: document.querySelectorAll("[data-layout]"),
  modeBtns: document.querySelectorAll("[data-mode]"),
  timerBtns: document.querySelectorAll("[data-timer]"),
  timerGroup: document.getElementById("timerGroup"),
  btnStartBooth: document.getElementById("btnStartBooth"),
  demoStripCanvas: document.getElementById("demoStripCanvas"),

  // Fullscreen Camera Booth
  btnFsBack: document.getElementById("btnFsBack"),
  btnFsSwitchUpload: document.getElementById("btnFsSwitchUpload"),
  cameraVideo: document.getElementById("cameraVideo"),
  liveCameraCanvas: document.getElementById("liveCameraCanvas"),
  cameraTintOverlay: document.getElementById("cameraTintOverlay"),
  aiLoadingPill: document.getElementById("aiLoadingPill"),
  countdownOverlay: document.getElementById("countdownOverlay"),
  countdownNumber: document.getElementById("countdownNumber"),
  flashOverlay: document.getElementById("flashOverlay"),
  cameraStatusPill: document.getElementById("cameraStatusPill"),
  cameraError: document.getElementById("cameraError"),
  cameraErrorText: document.getElementById("cameraErrorText"),
  btnRetryCamera: document.getElementById("btnRetryCamera"),
  btnFallbackUpload: document.getElementById("btnFallbackUpload"),

  btnMirror: document.getElementById("btnMirror"),
  mirrorLabel: document.getElementById("mirrorLabel"),
  btnFlipCam: document.getElementById("btnFlipCam"),
  btnCycleTimer: document.getElementById("btnCycleTimer"),
  timerLabel: document.getElementById("timerLabel"),
  btnShutter: document.getElementById("btnShutter"),
  shutterText: document.getElementById("shutterText"),
  btnResetShots: document.getElementById("btnResetShots"),
  btnFsNext: document.getElementById("btnFsNext"),

  fsFilledCount: document.getElementById("fsFilledCount"),
  fsTotalCount: document.getElementById("fsTotalCount"),
  fsSlotsGrid: document.getElementById("fsSlotsGrid"),

  dockTabs: document.querySelectorAll("[data-dock-tab]"),
  fsCharTools: document.getElementById("fsCharTools"),
  charPngInput: document.getElementById("charPngInput"),
  btnUploadChar: document.getElementById("btnUploadChar"),
  btnCharSize: document.getElementById("btnCharSize"),
  charSizeLabel: document.getElementById("charSizeLabel"),
  btnCharPos: document.getElementById("btnCharPos"),
  charPosLabel: document.getElementById("charPosLabel"),
  fsCharPacksWrap: document.getElementById("fsCharPacksWrap"),
  fsCharPacks: document.getElementById("fsCharPacks"),
  fsFilterChips: document.getElementById("fsFilterChips"),
  fsBgChips: document.getElementById("fsBgChips"),
  fsCharChips: document.getElementById("fsCharChips"),

  // Upload View
  captureLayoutBadge: document.getElementById("captureLayoutBadge"),
  tabCamera: document.getElementById("tabCamera"),
  tabUpload: document.getElementById("tabUpload"),
  dropzone: document.getElementById("dropzone"),
  multiFileInput: document.getElementById("multiFileInput"),
  uploadCountTarget: document.getElementById("uploadCountTarget"),
  singleSlotInput: document.getElementById("singleSlotInput"),
  captureFilterChips: document.getElementById("captureFilterChips"),
  filledCount: document.getElementById("filledCount"),
  totalCount: document.getElementById("totalCount"),
  slotsGrid: document.getElementById("slotsGrid"),
  btnGoToFrames: document.getElementById("btnGoToFrames"),

  // Customize
  btnBackToCapture: document.getElementById("btnBackToCapture"),
  previewWindowTitle: document.getElementById("previewWindowTitle"),
  stripCanvas: document.getElementById("stripCanvas"),
  btnDownload: document.getElementById("btnDownload"),
  btnShare: document.getElementById("btnShare"),
  btnStartOver: document.getElementById("btnStartOver"),
  framesGrid: document.getElementById("framesGrid"),
  activeFrameName: document.getElementById("activeFrameName"),
  customizeFilterChips: document.getElementById("customizeFilterChips"),
  coupleCaptionInput: document.getElementById("coupleCaptionInput"),
  showDateCheckbox: document.getElementById("showDateCheckbox"),

  saveModal: document.getElementById("saveModal"),
  saveModalImg: document.getElementById("saveModalImg"),
  saveModalDownloadLink: document.getElementById("saveModalDownloadLink"),
  btnCloseSaveModal: document.getElementById("btnCloseSaveModal"),
  btnCloseSaveModal2: document.getElementById("btnCloseSaveModal2"),

  toast: document.getElementById("toast"),
};

let toastTimer = null;
let pendingSingleSlotIndex = null;

// ============================================================================
// Initialization
// ============================================================================

function init() {
  buildFilterChips(el.captureFilterChips);
  buildFilterChips(el.customizeFilterChips);
  buildFilterChips(el.fsFilterChips, true);
  buildBgChips();
  buildCharPacks();
  buildCharChips();
  buildFrameCards();
  bindEvents();
  syncSetupUI();
  renderDemoLoop();

  // Preload any available local PNG assets in assets/characters/ silently
  getAllCharacters().forEach((ch) => {
    if (ch.src) {
      preloadCharacterAsset(ch).then((img) => {
        if (img) buildCharChips();
      });
    }
  });

  if (navigator.share && navigator.canShare) {
    el.btnShare.hidden = false;
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      renderDemoStrip(el.demoStripCanvas, FRAMES[state.demoFrameIndex].id);
      if (state.step === 3) renderMainStrip();
    });
  }
}

function renderDemoLoop() {
  renderDemoStrip(el.demoStripCanvas, FRAMES[state.demoFrameIndex].id);
  setInterval(() => {
    if (state.step !== 1) return;
    state.demoFrameIndex = (state.demoFrameIndex + 1) % FRAMES.length;
    renderDemoStrip(el.demoStripCanvas, FRAMES[state.demoFrameIndex].id);
  }, 2600);
}

// ============================================================================
// UI Builders
// ============================================================================

function buildFilterChips(container, compact = false) {
  container.innerHTML = "";
  FILTERS.forEach((f) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = (compact ? "effect-chip" : "filter-chip") + (f.id === state.filterId ? " active" : "");
    btn.dataset.filterId = f.id;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(f.id === state.filterId));
    btn.innerHTML = `
      <span class="${compact ? "effect-swatch" : "filter-swatch"}" style="background:${f.swatch}"></span>
      <span>${f.name}</span>
    `;
    btn.addEventListener("click", () => {
      sound.pop();
      setFilter(f.id);
    });
    container.appendChild(btn);
  });
}

function buildBgChips() {
  el.fsBgChips.innerHTML = "";
  VIRTUAL_BGS.forEach((bg) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "effect-chip" + (bg.id === state.virtualBgId ? " active" : "");
    btn.dataset.bgId = bg.id;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(bg.id === state.virtualBgId));
    const swatchHtml = bg.src
      ? `<img class="bg-thumb-img" src="${bg.src}" alt="" />`
      : `<span class="effect-swatch" style="background:${bg.swatch}">${bg.icon}</span>`;
    btn.innerHTML = `${swatchHtml}<span>${bg.name}</span>`;
    btn.addEventListener("click", () => {
      sound.pop();
      selectVirtualBg(bg.id);
    });
    el.fsBgChips.appendChild(btn);
  });
}

function buildCharPacks() {
  el.fsCharPacks.innerHTML = "";
  CHARACTER_PACKS.forEach((pack) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack-pill" + (pack.id === state.characterPack ? " active" : "");
    btn.dataset.packId = pack.id;
    btn.textContent = pack.name;
    btn.addEventListener("click", () => {
      sound.pop();
      state.characterPack = pack.id;
      buildCharPacks();
      buildCharChips();
    });
    el.fsCharPacks.appendChild(btn);
  });
}

function buildCharChips() {
  el.fsCharChips.innerHTML = "";
  const all = getAllCharacters();
  const filtered = all.filter((ch) => {
    if (ch.id === "none") return true;
    if (state.characterPack === "all") return true;
    return ch.pack === state.characterPack;
  });

  filtered.forEach((ch) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "effect-chip" + (ch.id === state.characterId ? " active" : "");
    btn.dataset.charId = ch.id;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(ch.id === state.characterId));
    btn.title = ch.pose || ch.name;

    const hasPng = ch.src && isCharacterAssetLoaded(ch.id);
    const iconHtml = hasPng
      ? `<img class="char-thumb-img" src="${ch.src}" alt="" />`
      : `<span class="effect-swatch" style="background:${ch.bg}">${ch.emoji}</span>`;

    btn.innerHTML = `${iconHtml}<span>${ch.name}</span>`;

    if (ch.isCustom) {
      const del = document.createElement("span");
      del.className = "char-delete-x";
      del.textContent = "×";
      del.title = "Hapus stiker custom ini";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        sound.pop();
        removeCustomCharacter(ch.id);
        if (state.characterId === ch.id) selectCharacter("none");
        buildCharChips();
      });
      btn.appendChild(del);
    }

    btn.addEventListener("click", () => {
      sound.pop();
      selectCharacter(ch.id);
    });
    el.fsCharChips.appendChild(btn);
  });
}

function buildFrameCards() {
  el.framesGrid.innerHTML = "";
  FRAMES.forEach((frame) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "frame-card" + (frame.id === state.frameId ? " active" : "");
    btn.dataset.frameId = frame.id;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(frame.id === state.frameId));
    btn.innerHTML = `
      <div class="frame-swatch" style="background:${frame.swatchBg}">
        <span>${frame.icon}</span>
      </div>
      <div class="frame-meta">
        <strong>${frame.name}</strong>
        <small>${frame.subtitle}</small>
      </div>
    `;
    btn.addEventListener("click", () => {
      sound.pop();
      setFrame(frame.id);
    });
    el.framesGrid.appendChild(btn);
  });
}

// ============================================================================
// Event Bindings
// ============================================================================

function bindEvents() {
  // Topbar
  el.btnHome.addEventListener("click", () => {
    sound.pop();
    goToStep(1);
  });

  el.btnSound.addEventListener("click", () => {
    sound.enabled = !sound.enabled;
    el.soundIcon.textContent = sound.enabled ? "🔊" : "🔇";
    el.btnSound.setAttribute("aria-pressed", String(sound.enabled));
    if (sound.enabled) sound.pop();
  });

  el.stepPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const target = Number(pill.dataset.step);
      if (target === 3 && !areAllSlotsFilled()) {
        showToast(`Lengkapi dulu ${state.layout} foto sebelum pilih frame ya!`);
        return;
      }
      sound.pop();
      goToStep(target);
    });
  });

  // Step 1: Setup
  el.layoutBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sound.pop();
      const newLayout = Number(btn.dataset.layout);
      if (state.layout !== newLayout) {
        state.layout = newLayout;
        state.photos = new Array(newLayout).fill(null);
      }
      syncSetupUI();
    });
  });

  el.modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sound.pop();
      state.mode = btn.dataset.mode;
      syncSetupUI();
    });
  });

  el.timerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sound.pop();
      state.timer = Number(btn.dataset.timer);
      syncSetupUI();
    });
  });

  el.btnStartBooth.addEventListener("click", () => {
    sound.pop();
    goToStep(2);
  });

  // Step 2A: Fullscreen Camera Navigation & Controls
  el.btnFsBack.addEventListener("click", () => {
    if (state.isCapturing) return;
    sound.pop();
    goToStep(1);
  });

  el.btnFsSwitchUpload.addEventListener("click", () => {
    if (state.isCapturing) return;
    sound.pop();
    switchCaptureMode("upload");
  });

  el.btnRetryCamera.addEventListener("click", () => startCamera());
  el.btnFallbackUpload.addEventListener("click", () => switchCaptureMode("upload"));

  el.btnMirror.addEventListener("click", () => {
    sound.pop();
    state.mirrored = !state.mirrored;
    syncCameraToolsUI();
  });

  el.btnFlipCam.addEventListener("click", () => {
    sound.pop();
    if (state.videoDevices.length > 1) {
      state.currentDeviceIndex = (state.currentDeviceIndex + 1) % state.videoDevices.length;
      const dev = state.videoDevices[state.currentDeviceIndex];
      showToast(`Kamera: ${dev.label || `Kamera #${state.currentDeviceIndex + 1}`}`);
    } else {
      state.facingMode = state.facingMode === "user" ? "environment" : "user";
      state.mirrored = state.facingMode === "user";
    }
    syncCameraToolsUI();
    startCamera();
  });

  el.btnCycleTimer.addEventListener("click", () => {
    sound.pop();
    const order = [3, 5, 0];
    state.timer = order[(order.indexOf(state.timer) + 1) % order.length];
    syncCameraToolsUI();
  });

  // Dock tabs (Filter / Virtual BG / Karakter)
  el.dockTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      sound.pop();
      setDockTab(tab.dataset.dockTab);
    });
  });

  el.btnUploadChar.addEventListener("click", () => {
    sound.pop();
    el.charPngInput.click();
  });

  el.charPngInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    let lastAdded = null;
    for (const file of files) {
      lastAdded = await addCustomCharacterFile(file);
    }
    e.target.value = "";
    if (lastAdded) {
      state.characterPack = "custom";
      buildCharPacks();
      buildCharChips();
      selectCharacter(lastAdded.id);
      sound.success();
      showToast(`Stiker "${lastAdded.name}" berhasil ditambahkan! ✨`);
    }
  });

  el.btnCharSize.addEventListener("click", () => {
    sound.pop();
    const order = ["sm", "md", "lg"];
    const labels = { sm: "Kecil", md: "Sedang", lg: "Besar" };
    state.characterSize = order[(order.indexOf(state.characterSize) + 1) % order.length];
    el.charSizeLabel.textContent = labels[state.characterSize];
  });

  el.btnCharPos.addEventListener("click", () => {
    sound.pop();
    const order = ["right", "left", "both"];
    const labels = { right: "Kanan", left: "Kiri", both: "2 Sisi" };
    state.characterSide = order[(order.indexOf(state.characterSide) + 1) % order.length];
    if (state.characterSide === "right") {
      state.charX = 0.82;
      state.charY = 0.78;
    } else if (state.characterSide === "left") {
      state.charX = 0.18;
      state.charY = 0.78;
    }
    el.charPosLabel.textContent = labels[state.characterSide];
  });

  // Drag-to-move character freely on live camera canvas (Mouse & Touch)
  const getCanvasPoint = (e) => {
    const rect = el.liveCameraCanvas.getBoundingClientRect();
    const scaleX = el.liveCameraCanvas.width / rect.width;
    const scaleY = el.liveCameraCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  el.liveCameraCanvas.addEventListener("pointerdown", (e) => {
    if (state.characterId === "none" || state.isCapturing) return;
    const pt = getCanvasPoint(e);
    const box = state.lastCharBox;
    // Allow grabbing if pointer is inside or near the character box
    const pad = 28;
    const hit =
      !box ||
      (pt.x >= box.x - pad &&
        pt.x <= box.x + box.w + pad &&
        pt.y >= box.y - pad &&
        pt.y <= box.y + box.h + pad);
    if (!hit) return;

    if (state.characterSide === "both") {
      state.characterSide = "right";
      el.charPosLabel.textContent = "Bebas";
    }

    state.isDraggingChar = true;
    const cx = state.charX * el.liveCameraCanvas.width;
    const cy = state.charY * el.liveCameraCanvas.height;
    state.dragOffsetX = cx - pt.x;
    state.dragOffsetY = cy - pt.y;
    el.liveCameraCanvas.setPointerCapture(e.pointerId);
    el.liveCameraCanvas.classList.add("dragging");
  });

  el.liveCameraCanvas.addEventListener("pointermove", (e) => {
    if (!state.isDraggingChar) return;
    const pt = getCanvasPoint(e);
    const nx = (pt.x + state.dragOffsetX) / el.liveCameraCanvas.width;
    const ny = (pt.y + state.dragOffsetY) / el.liveCameraCanvas.height;
    state.charX = Math.max(0.06, Math.min(0.94, nx));
    state.charY = Math.max(0.08, Math.min(0.94, ny));
  });

  const stopCharDrag = () => {
    if (!state.isDraggingChar) return;
    state.isDraggingChar = false;
    el.liveCameraCanvas.classList.remove("dragging");
  };
  el.liveCameraCanvas.addEventListener("pointerup", stopCharDrag);
  el.liveCameraCanvas.addEventListener("pointercancel", stopCharDrag);

  el.liveCameraCanvas.addEventListener("dblclick", () => {
    if (state.characterId === "none") return;
    sound.pop();
    state.charFlip = !state.charFlip;
    showToast("Arah karakter dibalik! ↔");
  });

  el.btnShutter.addEventListener("click", () => handleShutterClick());
  el.btnResetShots.addEventListener("click", () => {
    if (state.isCapturing) return;
    sound.pop();
    state.photos = new Array(state.layout).fill(null);
    state.retakeSlotIndex = null;
    renderSlots();
    syncCameraToolsUI();
    showToast("Semua pose di-reset. Siap foto lagi!");
  });

  el.btnFsNext.addEventListener("click", () => {
    if (!areAllSlotsFilled() || state.isCapturing) return;
    sound.success();
    goToStep(3);
  });

  // Step 2B: Upload View Controls
  el.tabCamera.addEventListener("click", () => {
    sound.pop();
    switchCaptureMode("camera");
  });
  el.tabUpload.addEventListener("click", () => {
    sound.pop();
    switchCaptureMode("upload");
  });

  el.dropzone.addEventListener("click", () => el.multiFileInput.click());
  el.dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.multiFileInput.click();
    }
  });
  el.dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.dropzone.classList.add("dragover");
  });
  el.dropzone.addEventListener("dragleave", () => {
    el.dropzone.classList.remove("dragover");
  });
  el.dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    el.dropzone.classList.remove("dragover");
    if (e.dataTransfer.files?.length) {
      handleMultiFiles(e.dataTransfer.files);
    }
  });

  el.multiFileInput.addEventListener("change", (e) => {
    if (e.target.files?.length) {
      handleMultiFiles(e.target.files);
      e.target.value = "";
    }
  });

  el.singleSlotInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file && pendingSingleSlotIndex !== null) {
      loadImageFile(file).then((img) => {
        state.photos[pendingSingleSlotIndex] = img;
        pendingSingleSlotIndex = null;
        sound.shutter();
        renderSlots();
      });
    }
    e.target.value = "";
  });

  el.btnGoToFrames.addEventListener("click", () => {
    if (!areAllSlotsFilled()) return;
    sound.success();
    goToStep(3);
  });

  // Step 3: Customize & Download
  el.btnBackToCapture.addEventListener("click", () => {
    sound.pop();
    goToStep(2);
  });

  el.coupleCaptionInput.addEventListener("input", (e) => {
    state.caption = e.target.value;
    renderMainStrip();
  });

  el.showDateCheckbox.addEventListener("change", (e) => {
    state.showDate = e.target.checked;
    renderMainStrip();
  });

  el.btnDownload.addEventListener("click", () => downloadStrip());
  el.btnShare.addEventListener("click", () => shareStrip());
  el.btnStartOver.addEventListener("click", () => {
    sound.pop();
    state.photos = new Array(state.layout).fill(null);
    state.retakeSlotIndex = null;
    goToStep(1);
  });
}

// ============================================================================
// Navigation & View Sync
// ============================================================================

function goToStep(stepNum) {
  if (state.isCapturing) return;
  state.step = stepNum;

  const isFullscreenCam = stepNum === 2 && state.mode === "camera";
  document.body.classList.toggle("booth-fullscreen", isFullscreenCam);

  el.viewSetup.classList.toggle("active", stepNum === 1);
  el.fullscreenBooth.hidden = !isFullscreenCam;
  el.viewCapture.classList.toggle("active", stepNum === 2 && state.mode === "upload");
  el.viewCustomize.classList.toggle("active", stepNum === 3);

  el.stepPills.forEach((pill) => {
    const s = Number(pill.dataset.step);
    pill.classList.toggle("active", s === stepNum);
    pill.classList.toggle("done", s < stepNum);
  });

  if (stepNum === 2) {
    ensurePhotoArrayLength();
    el.captureLayoutBadge.textContent = `${state.layout} FOTO`;
    el.totalCount.textContent = String(state.layout);
    el.fsTotalCount.textContent = String(state.layout);
    el.uploadCountTarget.textContent = String(state.layout);
    renderSlots();
    applyLiveFilter();
    if (isFullscreenCam) {
      syncCameraToolsUI();
      startCamera();
    } else {
      stopCamera();
    }
  } else {
    stopCamera();
  }

  if (stepNum === 3) {
    renderMainStrip();
  }

  if (!isFullscreenCam) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function ensurePhotoArrayLength() {
  if (state.photos.length !== state.layout) {
    const next = new Array(state.layout).fill(null);
    for (let i = 0; i < Math.min(state.photos.length, state.layout); i++) {
      next[i] = state.photos[i];
    }
    state.photos = next;
  }
}

function syncSetupUI() {
  el.layoutBtns.forEach((b) => {
    const active = Number(b.dataset.layout) === state.layout;
    b.classList.toggle("active", active);
    b.setAttribute("aria-checked", String(active));
  });
  el.modeBtns.forEach((b) => {
    const active = b.dataset.mode === state.mode;
    b.classList.toggle("active", active);
    b.setAttribute("aria-checked", String(active));
  });
  el.timerBtns.forEach((b) => {
    const active = Number(b.dataset.timer) === state.timer;
    b.classList.toggle("active", active);
    b.setAttribute("aria-checked", String(active));
  });
  el.timerGroup.style.display = state.mode === "camera" ? "flex" : "none";
}

function switchCaptureMode(mode) {
  state.mode = mode;
  state.retakeSlotIndex = null;
  goToStep(2);
}

// ============================================================================
// Dock Tabs, Virtual Backgrounds & Characters
// ============================================================================

function setDockTab(tabName) {
  state.dockTab = tabName;
  el.dockTabs.forEach((t) => {
    const active = t.dataset.dockTab === tabName;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  });
  const isCharTab = tabName === "char";
  el.fsFilterChips.hidden = tabName !== "filter";
  el.fsBgChips.hidden = tabName !== "bg";
  el.fsCharChips.hidden = !isCharTab;
  el.fsCharPacksWrap.hidden = !isCharTab;
  el.fsCharTools.hidden = !isCharTab;
  el.btnCharPos.hidden = !(isCharTab && state.characterId !== "none");
  el.btnCharSize.hidden = !(isCharTab && state.characterId !== "none");
}

async function selectVirtualBg(bgId) {
  state.virtualBgId = bgId;
  el.fsBgChips.querySelectorAll("[data-bg-id]").forEach((btn) => {
    const active = btn.dataset.bgId === bgId;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-checked", String(active));
  });

  if (bgId !== "none") {
    preloadVirtualBgImage(bgId);
    const seg = await ensureSegmenter((statusMsg) => {
      if (statusMsg) {
        el.aiLoadingPill.textContent = `✨ ${statusMsg}`;
        el.aiLoadingPill.hidden = false;
      } else {
        el.aiLoadingPill.hidden = true;
      }
    });
    if (!seg) {
      showToast("AI Virtual Background butuh koneksi internet untuk memuat model.");
      state.virtualBgId = "none";
      selectVirtualBg("none");
    }
  }
}

function selectCharacter(charId) {
  state.characterId = charId;
  el.fsCharChips.querySelectorAll("[data-char-id]").forEach((btn) => {
    const active = btn.dataset.charId === charId;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-checked", String(active));
  });
  const showExtras = state.dockTab === "char" && charId !== "none";
  el.btnCharPos.hidden = !showExtras;
  el.btnCharSize.hidden = !showExtras;
  el.liveCameraCanvas.classList.toggle("has-char", charId !== "none");

  if (charId !== "none") {
    const ch = getCharacterById(charId);
    if (ch?.src) {
      preloadCharacterAsset(ch).then((img) => {
        if (img) buildCharChips();
      });
    }
    showToast(`Geser ${ch?.name || "karakter"} langsung di layar! (2× klik = balik)`);
  }
}

// ============================================================================
// Camera Engine + Live Compositing Loop (BG + Person + Character)
// ============================================================================

async function startCamera() {
  stopCamera();
  el.cameraError.hidden = true;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError(
      "Browser ini tidak mendukung akses kamera langsung (atau halaman tidak dibuka lewat localhost/HTTPS). Yuk pakai mode Upload Galeri!"
    );
    return;
  }

  const preferredVideo =
    state.videoDevices.length > 1 && state.videoDevices[state.currentDeviceIndex]?.deviceId
      ? {
          deviceId: { ideal: state.videoDevices[state.currentDeviceIndex].deviceId },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        }
      : {
          facingMode: { ideal: state.facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        };

  let stream = null;
  let lastErr = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: preferredVideo, audio: false });
  } catch (err) {
    lastErr = err;
    if (err.name !== "NotAllowedError" && err.name !== "PermissionDeniedError") {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        lastErr = null;
      } catch (err2) {
        lastErr = err2;
      }
    }
  }

  if (!stream) {
    console.warn("Camera error:", lastErr);
    showCameraError(formatCameraError(lastErr));
    return;
  }

  if (state.step !== 2 || state.mode !== "camera") {
    stream.getTracks().forEach((t) => t.stop());
    return;
  }

  state.stream = stream;
  el.cameraVideo.srcObject = stream;
  el.cameraVideo.muted = true;

  try {
    await el.cameraVideo.play();
  } catch (playErr) {
    if (playErr?.name !== "AbortError") {
      console.warn("Video play warning:", playErr);
    }
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    state.videoDevices = devices.filter((d) => d.kind === "videoinput");
    const activeTrack = stream.getVideoTracks()[0];
    const activeId = activeTrack?.getSettings?.().deviceId;
    if (activeId && state.videoDevices.length > 0) {
      const idx = state.videoDevices.findIndex((d) => d.deviceId === activeId);
      if (idx !== -1) state.currentDeviceIndex = idx;
    }
  } catch {
    // Ignore enumerateDevices errors
  }

  applyLiveFilter();
  syncCameraToolsUI();
  startLiveRenderLoop();
  // Silently pre-warm AI Virtual Background model so it's ready faster when tapped
  setTimeout(() => prewarmSegmenter(), 600);
}

function startLiveRenderLoop() {
  if (state.rafId) cancelAnimationFrame(state.rafId);

  const canvas = el.liveCameraCanvas;
  const ctx = canvas.getContext("2d");

  const renderFrame = () => {
    if (!state.stream || state.step !== 2 || state.mode !== "camera") {
      state.rafId = null;
      return;
    }

    if (el.cameraVideo.readyState >= 2) {
      drawVideoWithVirtualBg(
        ctx,
        el.cameraVideo,
        canvas.width,
        canvas.height,
        state.virtualBgId,
        state.mirrored
      );

      if (state.characterId !== "none") {
        state.lastCharBox = drawCharacterOverlay(ctx, state.characterId, canvas.width, canvas.height, {
          side: state.characterSide,
          sizeScale: state.characterSize,
          charX: state.charX,
          charY: state.charY,
          charFlip: state.charFlip,
          isDragging: state.isDraggingChar,
        });
      } else {
        state.lastCharBox = null;
      }
    }

    state.rafId = requestAnimationFrame(renderFrame);
  };

  state.rafId = requestAnimationFrame(renderFrame);
}

function stopCamera() {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }
  el.cameraVideo.srcObject = null;
}

function showCameraError(msg) {
  el.cameraErrorText.textContent = msg;
  el.cameraError.hidden = false;
}

function formatCameraError(err) {
  const name = err?.name || "UnknownError";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Izin kamera ditolak (NotAllowedError). Cek izin kamera di browser & macOS System Settings → Privacy & Security → Camera, lalu klik Coba Lagi.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Kamera tidak terdeteksi di perangkat ini (NotFoundError). Gunakan mode Upload Galeri.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Kamera sedang dipakai aplikasi lain (NotReadableError). Tutup Zoom/Meet/OBS lalu klik Coba Lagi.";
  }
  return `Kamera tidak bisa dibuka (${name}). Coba refresh halaman atau gunakan mode Upload Galeri.`;
}

function syncCameraToolsUI() {
  el.btnMirror.classList.toggle("active", state.mirrored);
  el.mirrorLabel.textContent = state.mirrored ? "ON" : "OFF";
  el.timerLabel.textContent = state.timer === 0 ? "Manual" : `${state.timer}d`;

  const filled = getFilledCount();
  el.btnResetShots.hidden = filled === 0;
  el.btnFsNext.disabled = filled < state.layout;

  if (state.retakeSlotIndex !== null) {
    el.cameraStatusPill.textContent = `Retake Pose #${state.retakeSlotIndex + 1}`;
    el.shutterText.textContent = `RETAKE POSE #${state.retakeSlotIndex + 1}`;
  } else if (filled >= state.layout) {
    el.cameraStatusPill.textContent = `Selesai! ${filled}/${state.layout}`;
    el.shutterText.textContent = "JEPRET ULANG SEMUA";
  } else {
    el.cameraStatusPill.textContent = `Pose ${filled}/${state.layout}`;
    el.shutterText.textContent =
      state.timer === 0
        ? `JEPRET POSE #${filled + 1}`
        : filled === 0
        ? `JEPRET OTOMATIS (${state.layout}×)`
        : `LANJUT JEPRET (${state.layout - filled} LAGI)`;
  }
}

async function handleShutterClick() {
  if (state.isCapturing) return;
  if (!state.stream) {
    showToast("Kamera belum aktif. Izinkan kamera atau pakai mode Upload.");
    return;
  }

  state.isCapturing = true;
  el.btnShutter.disabled = true;

  try {
    if (state.retakeSlotIndex !== null) {
      const idx = state.retakeSlotIndex;
      if (state.timer > 0) await runCountdown(state.timer);
      captureFrameToSlot(idx);
      state.retakeSlotIndex = null;
      showToast(`Pose #${idx + 1} berhasil di-retake! ✨`);
      return;
    }

    if (areAllSlotsFilled()) {
      state.photos = new Array(state.layout).fill(null);
      renderSlots();
    }

    if (state.timer === 0) {
      const nextIdx = state.photos.findIndex((p) => p === null);
      if (nextIdx !== -1) captureFrameToSlot(nextIdx);
      return;
    }

    for (let i = 0; i < state.layout; i++) {
      if (state.photos[i] !== null) continue;
      if (state.step !== 2 || state.mode !== "camera") break;

      el.cameraStatusPill.textContent = `Pose #${i + 1}/${state.layout}...`;
      highlightTargetSlot(i);
      await runCountdown(state.timer);
      captureFrameToSlot(i);
      await sleep(550);
    }

    if (areAllSlotsFilled()) {
      sound.success();
      showToast("Semua pose selesai! Klik 'Lanjut Frame →' ✨");
    }
  } finally {
    state.isCapturing = false;
    el.btnShutter.disabled = false;
    highlightTargetSlot(null);
    renderSlots();
    syncCameraToolsUI();
  }
}

async function runCountdown(seconds) {
  el.countdownOverlay.hidden = false;
  for (let s = seconds; s >= 1; s--) {
    el.countdownNumber.textContent = String(s);
    el.countdownNumber.style.animation = "none";
    void el.countdownNumber.offsetWidth;
    el.countdownNumber.style.animation = "";
    sound.countdown(s === 1);
    await sleep(920);
  }
  el.countdownOverlay.hidden = true;
}

function captureFrameToSlot(slotIndex) {
  const src = el.liveCameraCanvas;
  const snap = document.createElement("canvas");
  snap.width = src.width;
  snap.height = src.height;
  const ctx = snap.getContext("2d");

  // Render fresh frame directly so it captures current BG + person + character cleanly
  drawVideoWithVirtualBg(ctx, el.cameraVideo, snap.width, snap.height, state.virtualBgId, state.mirrored);
  if (state.characterId !== "none") {
    drawCharacterOverlay(ctx, state.characterId, snap.width, snap.height, {
      side: state.characterSide,
      sizeScale: state.characterSize,
      charX: state.charX,
      charY: state.charY,
      charFlip: state.charFlip,
      isDragging: false,
    });
  }

  sound.shutter();
  el.flashOverlay.classList.remove("flash");
  void el.flashOverlay.offsetWidth;
  el.flashOverlay.classList.add("flash");

  state.photos[slotIndex] = snap;
  renderSlots();
}

// ============================================================================
// Upload Engine
// ============================================================================

async function handleMultiFiles(fileList) {
  const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
  if (!files.length) {
    showToast("Pilih file gambar (JPG/PNG/WebP) ya!");
    return;
  }

  let filePtr = 0;
  for (let i = 0; i < state.layout && filePtr < files.length; i++) {
    if (state.photos[i] === null) {
      state.photos[i] = await loadImageFile(files[filePtr++]);
    }
  }
  for (let i = 0; i < state.layout && filePtr < files.length; i++) {
    state.photos[i] = await loadImageFile(files[filePtr++]);
  }

  sound.shutter();
  renderSlots();
  if (areAllSlotsFilled()) {
    showToast("Foto siap! Yuk lanjut pilih frame Y2K ✨");
  }
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1400;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      off.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(off);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

// ============================================================================
// Slots Rendering & Filter Sync
// ============================================================================

function renderSlots() {
  const filled = getFilledCount();
  el.filledCount.textContent = String(filled);
  el.totalCount.textContent = String(state.layout);
  el.fsFilledCount.textContent = String(filled);
  el.fsTotalCount.textContent = String(state.layout);
  el.btnGoToFrames.disabled = filled < state.layout;
  el.btnFsNext.disabled = filled < state.layout;

  const filter = getFilterById(state.filterId);

  const populateContainer = (container, isCameraMode) => {
    container.innerHTML = "";
    for (let i = 0; i < state.layout; i++) {
      const photo = state.photos[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "slot-item" + (photo ? " filled" : "") + (state.retakeSlotIndex === i ? " active-target" : "");
      btn.dataset.slotIndex = String(i);

      if (photo) {
        const thumbUrl = photo.toDataURL("image/jpeg", 0.72);
        btn.innerHTML = `
          <img src="${thumbUrl}" alt="Foto ${i + 1}" style="filter:${filter.css || "none"}" />
          <span class="slot-badge">#${i + 1}</span>
          <span class="slot-retake-pill">${isCameraMode ? "Retake" : "Ganti"}</span>
        `;
      } else {
        btn.innerHTML = `
          <span class="slot-placeholder">
            <span>#${i + 1}</span>
            <span>${isCameraMode ? "📷" : "+ Upload"}</span>
          </span>
        `;
      }

      btn.addEventListener("click", () => {
        if (state.isCapturing) return;
        sound.pop();
        if (!isCameraMode) {
          pendingSingleSlotIndex = i;
          el.singleSlotInput.click();
        } else {
          state.retakeSlotIndex = state.retakeSlotIndex === i ? null : i;
          renderSlots();
          syncCameraToolsUI();
          if (state.retakeSlotIndex !== null) {
            showToast(`Klik JEPRET untuk retake Pose #${i + 1}`);
          }
        }
      });

      container.appendChild(btn);
    }
  };

  populateContainer(el.slotsGrid, false);
  populateContainer(el.fsSlotsGrid, true);
}

function highlightTargetSlot(idx) {
  document.querySelectorAll(".slot-item").forEach((item) => {
    item.classList.toggle("active-target", idx !== null && Number(item.dataset.slotIndex) === idx);
  });
}

function setFilter(filterId) {
  state.filterId = filterId;
  document.querySelectorAll("[data-filter-id]").forEach((chip) => {
    const active = chip.dataset.filterId === filterId;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-checked", String(active));
  });
  applyLiveFilter();
  if (state.step === 2) renderSlots();
  if (state.step === 3) renderMainStrip();
}

function applyLiveFilter() {
  const filter = getFilterById(state.filterId);
  el.liveCameraCanvas.style.filter = filter.css || "none";
  el.cameraTintOverlay.style.backgroundColor = filter.tint || "transparent";
}

function setFrame(frameId) {
  state.frameId = frameId;
  const frame = getFrameById(frameId);
  el.activeFrameName.textContent = frame.name;
  el.previewWindowTitle.textContent = `${frame.name.toUpperCase().replace(/\s+/g, "_")}.PNG`;

  el.framesGrid.querySelectorAll(".frame-card").forEach((card) => {
    const active = card.dataset.frameId === frameId;
    card.classList.toggle("active", active);
    card.setAttribute("aria-checked", String(active));
  });

  renderMainStrip();
}

function renderMainStrip() {
  renderPhotoStrip(el.stripCanvas, {
    photos: state.photos,
    layout: state.layout,
    frameId: state.frameId,
    filterId: state.filterId,
    caption: state.caption,
    showDate: state.showDate,
  });
  scheduleStripBlobCache();
}

// ============================================================================
// Export & Share (Synchronous iOS Gesture-Safe Share Sheet + Save to Photos)
// ============================================================================

const isIOSDevice =
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isTouchMobile = isIOSDevice || /Android/i.test(navigator.userAgent);

let currentSaveBlobUrl = null;
let cachedStripBlob = null;
let cachedStripFile = null;
let cachedStripFilename = "loveypix-strip.png";
let stripCacheTimer = null;

function scheduleStripBlobCache() {
  clearTimeout(stripCacheTimer);
  stripCacheTimer = setTimeout(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    cachedStripFilename = `loveypix-${state.frameId}-${state.layout}cut-${stamp}.png`;
    el.stripCanvas.toBlob((blob) => {
      if (!blob) return;
      cachedStripBlob = blob;
      try {
        cachedStripFile = new File([blob], cachedStripFilename, { type: "image/png" });
      } catch {
        cachedStripFile = null;
      }
    }, "image/png");
  }, 160);
}

function closeSaveModal() {
  el.saveModal.hidden = true;
}

el.btnCloseSaveModal.addEventListener("click", closeSaveModal);
el.btnCloseSaveModal2.addEventListener("click", closeSaveModal);
el.saveModal.addEventListener("click", (e) => {
  if (e.target === el.saveModal) closeSaveModal();
});

function openSaveModal(blob, filename) {
  if (currentSaveBlobUrl) URL.revokeObjectURL(currentSaveBlobUrl);
  currentSaveBlobUrl = URL.createObjectURL(blob);
  el.saveModalImg.src = currentSaveBlobUrl;
  el.saveModalDownloadLink.href = currentSaveBlobUrl;
  el.saveModalDownloadLink.download = filename;
  el.saveModal.hidden = false;
}

function triggerNativeShareSync(purpose = "save") {
  // MUST be called synchronously inside user click without awaiting toBlob first (iOS Safari requirement!)
  if (cachedStripFile && navigator.share && navigator.canShare && navigator.canShare({ files: [cachedStripFile] })) {
    const sharePayload =
      purpose === "share"
        ? { title: "LoveyPix Photo Strip ♥", text: "Foto booth Y2K dari LoveyPix!", files: [cachedStripFile] }
        : { title: "LoveyPix Photo Strip ♥", files: [cachedStripFile] };

    navigator
      .share(sharePayload)
      .then(() => {
        sound.success();
        showToast(
          purpose === "save"
            ? "Berhasil! Foto tersimpan ♥"
            : "Foto strip siap dibagikan! ♥"
        );
      })
      .catch((err) => {
        if (err && err.name === "AbortError") return;
        // Fallback to Save Modal if native share failed
        if (cachedStripBlob) openSaveModal(cachedStripBlob, cachedStripFilename);
      });
    return true;
  }
  return false;
}

function downloadStrip() {
  // On iPhone/iPad (and mobile with file share), open native Share Sheet synchronously
  // so user can tap "Save Image / Simpan Gambar" straight into iPhone Photos (Galeri)!
  if (isIOSDevice) {
    if (triggerNativeShareSync("save")) return;
    // If Share Sheet isn't available (e.g. WhatsApp/IG in-app browser), open Save Modal for long-press Save to Photos
    if (cachedStripBlob) {
      openSaveModal(cachedStripBlob, cachedStripFilename);
      sound.success();
      return;
    }
    el.stripCanvas.toBlob((blob) => {
      if (blob) openSaveModal(blob, cachedStripFilename);
    }, "image/png");
    return;
  }

  // Desktop & Android: Blob URL download
  const runDownload = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 8000);
    sound.success();
    showToast("Foto strip HD berhasil di-download! ♥");
  };

  if (cachedStripBlob) {
    runDownload(cachedStripBlob, cachedStripFilename);
  } else {
    el.stripCanvas.toBlob((blob) => {
      if (blob) runDownload(blob, cachedStripFilename);
    }, "image/png");
  }
}

function shareStrip() {
  if (triggerNativeShareSync("share")) return;

  // Fallback when Web Share with files isn't supported (e.g. Desktop browsers)
  if (isTouchMobile && cachedStripBlob) {
    openSaveModal(cachedStripBlob, cachedStripFilename);
    showToast("Tahan gambar untuk simpan atau bagikan ke WA / IG!");
    return;
  }

  // On Desktop: download PNG + open WhatsApp Web text share prompt
  downloadStrip();
  showToast("Foto sudah di-download — tinggal kirim filenya ke WA / IG!");
}

// ============================================================================
// Helpers
// ============================================================================

function getFilledCount() {
  return state.photos.filter(Boolean).length;
}

function areAllSlotsFilled() {
  return getFilledCount() === state.layout;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.hidden = true;
  }, 3000);
}

init();
