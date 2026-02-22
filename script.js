/**
 * EcoScan — script.js
 * Final: Shimmer + Magnetic Buttons + Floating Particles
 * All original functionality preserved
 */

"use strict";

// ══════════════════════════════════════════════════════════════
// ── CONFIG ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
const API_BASE = "https://ecoscan-ai-backend-zbj0.onrender.com";
const MAX_PREVIEW_THUMBS = 5;

// ══════════════════════════════════════════════════════════════
// ── FLOATING PARTICLES CANVAS ─────────────────────────────────
// ══════════════════════════════════════════════════════════════
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
const PARTICLE_COUNT = 40; // Low count for performance
const PARTICLE_SIZE = 1.5;
const PARTICLE_SPEED = 0.3; // Very slow

class Particle {
  constructor() {
    this.reset();
    this.y = Math.random() * canvas.height; // Start at random position
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
    this.vy = Math.random() * PARTICLE_SPEED + 0.2;
    this.opacity = Math.random() * 0.3 + 0.1; // Very low opacity
    this.size = Math.random() * PARTICLE_SIZE + 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    if (this.y > canvas.height + 10) this.reset();
    if (this.x < -10) this.x = canvas.width + 10;
    if (this.x > canvas.width + 10) this.x = -10;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 245, 255, ${this.opacity})`;
    ctx.fill();
    
    // Subtle glow
    ctx.shadowBlur = 4;
    ctx.shadowColor = `rgba(0, 245, 255, ${this.opacity * 0.5})`;
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
  
  requestAnimationFrame(animateParticles);
}

// Initialize particles
resizeCanvas();
initParticles();
animateParticles();

window.addEventListener("resize", () => {
  resizeCanvas();
  initParticles();
});

// ══════════════════════════════════════════════════════════════
// ── MAGNETIC BUTTON EFFECT ────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll(".magnetic-btn");

  magneticButtons.forEach(button => {
    button.addEventListener("mousemove", (e) => {
      if (button.disabled) return;

      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center
      const deltaX = (e.clientX - centerX) * 0.3; // Reduced strength for subtlety
      const deltaY = (e.clientY - centerY) * 0.3;
      
      // Apply smooth transform
      button.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    });

    button.addEventListener("mouseleave", () => {
      // Reset to original position
      button.style.transform = "translate(0, 0) scale(1)";
    });
  });
}

// ══════════════════════════════════════════════════════════════
// ── ENTRANCE ANIMATIONS ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Add fade-in animation to main elements
  const animatedElements = [
    { selector: '.site-header', delay: '0s' },
    { selector: '.hero', delay: '0.1s' },
    { selector: '.upload-card', delay: '0.2s' },
    { selector: '.site-footer', delay: '0.3s' }
  ];

  animatedElements.forEach(({ selector, delay }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('fade-in-up');
      element.style.animationDelay = delay;
    }
  });

  // Initialize magnetic buttons after DOM load
  initMagneticButtons();
});

// ══════════════════════════════════════════════════════════════
// ── CURSOR GLOW TRACKING ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════
const cursorGlow = document.getElementById("cursorGlow");
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateGlow() {
  const lerp = 0.15;
  glowX += (mouseX - glowX) * lerp;
  glowY += (mouseY - glowY) * lerp;
  
  cursorGlow.style.left = `${glowX}px`;
  cursorGlow.style.top = `${glowY}px`;
  
  requestAnimationFrame(animateGlow);
}

animateGlow();

// ══════════════════════════════════════════════════════════════
// ── DOM REFS (Original) ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════
const dropZone     = document.getElementById("dropZone");
const fileInput    = document.getElementById("fileInput");
const previewStrip = document.getElementById("previewStrip");
const cardActions  = document.getElementById("cardActions");
const clearBtn     = document.getElementById("clearBtn");
const predictBtn   = document.getElementById("predictBtn");
const loaderWrap   = document.getElementById("loaderWrap");
const resultsSection = document.getElementById("resultsSection");
const resultsGrid  = document.getElementById("resultsGrid");

// ══════════════════════════════════════════════════════════════
// ── STATE (Original) ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
/** @type {File[]} */
let selectedFiles = [];

// ══════════════════════════════════════════════════════════════
// ── DRAG & DROP (Original) ────────────────────────────────────
// ══════════════════════════════════════════════════════════════
const uploadCard = document.getElementById("uploadCard");

["dragenter", "dragover"].forEach(evt =>
  uploadCard.addEventListener(evt, e => {
    e.preventDefault();
    uploadCard.classList.add("drag-over");
  })
);

["dragleave", "drop"].forEach(evt =>
  uploadCard.addEventListener(evt, e => {
    e.preventDefault();
    uploadCard.classList.remove("drag-over");
  })
);

uploadCard.addEventListener("drop", e => {
  const files = [...e.dataTransfer.files].filter(isImage);
  if (!files.length) { showToast("Only image files (JPG, PNG, WEBP) are accepted."); return; }
  addFiles(files);
});

dropZone.addEventListener("click", e => {
  if (e.target.closest(".btn")) return;
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const files = [...fileInput.files];
  addFiles(files);
  fileInput.value = "";
});

// ══════════════════════════════════════════════════════════════
// ── FILE MANAGEMENT (Original) ────────────────────────────────
// ══════════════════════════════════════════════════════════════
function addFiles(files) {
  files.forEach(f => {
    if (!selectedFiles.some(s => s.name === f.name && s.size === f.size)) {
      selectedFiles.push(f);
    }
  });
  renderPreviews();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderPreviews();
}

function clearAll() {
  selectedFiles = [];
  renderPreviews();
  resultsSection.hidden = true;
  resultsGrid.innerHTML = "";
}

// ══════════════════════════════════════════════════════════════
// ── PREVIEW RENDERING (Original) ──────────────────────────────
// ══════════════════════════════════════════════════════════════
function renderPreviews() {
  previewStrip.innerHTML = "";

  if (!selectedFiles.length) {
    previewStrip.hidden = true;
    cardActions.hidden  = true;
    return;
  }

  previewStrip.hidden = false;
  cardActions.hidden  = false;

  const limit = Math.min(selectedFiles.length, MAX_PREVIEW_THUMBS);

  selectedFiles.slice(0, limit).forEach((file, idx) => {
    const thumb = document.createElement("div");
    thumb.className = "preview-thumb";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    img.onload = () => URL.revokeObjectURL(img.src);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", e => { e.stopPropagation(); removeFile(idx); });

    thumb.append(img, removeBtn);
    previewStrip.appendChild(thumb);
  });

  if (selectedFiles.length > MAX_PREVIEW_THUMBS) {
    const more = document.createElement("div");
    more.className = "preview-count";
    more.textContent = `+${selectedFiles.length - MAX_PREVIEW_THUMBS} more`;
    previewStrip.appendChild(more);
  }
}

// ══════════════════════════════════════════════════════════════
// ── PREDICT (Original) ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
predictBtn.addEventListener("click", runPredictions);
clearBtn.addEventListener("click",   clearAll);

async function runPredictions() {
  if (!selectedFiles.length) { showToast("No images selected."); return; }

  setPredictingState(true);
  resultsGrid.innerHTML = "";
  resultsSection.hidden  = true;

  const promises = selectedFiles.map(file => classifyImage(file));
  const results  = await Promise.allSettled(promises);

  results.forEach((outcome, idx) => {
    const file = selectedFiles[idx];
    if (outcome.status === "fulfilled") {
      appendResultCard(file, outcome.value);
    } else {
      appendResultCard(file, null, outcome.reason?.message ?? "Unknown error");
    }
  });

  document.querySelectorAll(".result-card").forEach((card, i) => {
    card.style.animationDelay = `${i * 80}ms`;
  });

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

  setPredictingState(false);
}

async function classifyImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/predict/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `Server error ${response.status}`;
    try {
      const err = await response.json();
      detail = err.detail ?? detail;
    } catch (_) { /* ignore */ }
    throw new Error(detail);
  }

  return response.json();
}

// ══════════════════════════════════════════════════════════════
// ── RESULT CARD BUILDER (Original) ────────────────────────────
// ══════════════════════════════════════════════════════════════
function appendResultCard(file, data, error = null) {
  const isError  = !!error;
  const isClean  = !isError && data.prediction === "CLEAN";
  const category = isError ? "error" : (isClean ? "clean" : "garbage");
  const confidence = isError ? 0 : data.confidence;

  const card = document.createElement("div");
  card.className = `result-card ${category}`;

  const imgWrap = document.createElement("div");
  imgWrap.className = "result-img-wrap";
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.alt = file.name;
  img.onload = () => URL.revokeObjectURL(img.src);
  imgWrap.appendChild(img);

  const body = document.createElement("div");
  body.className = "result-body";

  const fname = document.createElement("p");
  fname.className = "result-filename";
  fname.textContent = file.name;
  fname.title = file.name;

  const badge = document.createElement("div");
  badge.className = `result-badge ${isError ? "badge-error" : (isClean ? "badge-clean" : "badge-garbage")}`;
  badge.innerHTML = isError ? "⚠️ Error" : (isClean ? "✅ CLEAN" : "🚮 GARBAGE");

  const confRow = document.createElement("div");
  confRow.className = "confidence-row";

  const confLabel = document.createElement("span");
  confLabel.className = "confidence-label";
  confLabel.textContent = isError ? error : "Confidence";

  const confVal = document.createElement("span");
  confVal.className = `confidence-value ${category}`;
  confVal.textContent = isError ? "—" : `${confidence.toFixed(1)}%`;

  confRow.append(confLabel, confVal);

  const track = document.createElement("div");
  track.className = "progress-track";
  const fill = document.createElement("div");
  fill.className = `progress-fill ${category}`;
  fill.style.width = "0%";
  track.appendChild(fill);

  body.append(fname, badge, confRow, track);
  card.append(imgWrap, body);
  resultsGrid.appendChild(card);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fill.style.width = isError ? "100%" : `${confidence}%`;
    });
  });
}

// ══════════════════════════════════════════════════════════════
// ── HELPERS (Original) ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function setPredictingState(predicting) {
  loaderWrap.hidden   = !predicting;
  predictBtn.disabled = predicting;
  clearBtn.disabled   = predicting;

  const btnText = predictBtn.querySelector(".btn-text");
  if (btnText) btnText.textContent = predicting ? "Analysing…" : "Analyse images";
}

function isImage(file) {
  return /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
}

let toastTimer = null;
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: rgba(255,107,107,0.18);
      border: 1px solid rgba(255,107,107,0.4);
      color: #ffb3b3;
      padding: 12px 24px;
      border-radius: 100px;
      font-size: 0.85rem;
      backdrop-filter: blur(16px);
      z-index: 999;
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s;
      opacity: 0;
      pointer-events: none;
      white-space: nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.transform = "translateX(-50%) translateY(0)";
  toast.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(80px)";
    toast.style.opacity = "0";
  }, 3500);
}