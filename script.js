/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - JavaScript
   Main logic for search, filtering, 3D/2D viewing, quiz mode
   ──────────────────────────────────────────────────────────────── */

// ── CONSTANTS ────────────────────────────────────────────────────
const CATEGORIES = [
  "stereochemistry", "haloalkane", "alkene", "alkyne", "cyclic", "aromatic",
  "alcohol", "ether", "carboxylic acid", "ester", "amide", "anhydride",
  "alkane", "aldehyde", "ketone", "other"
];

const FG_ATOMS = {
  "Alcohol": { elem: "O" },
  "Ether": { elem: "O" },
  "Haloalkane": { elem: ["F", "Cl", "Br", "I"] },
  "Carboxylic Acid": { elem: "O" },
  "Aldehyde": { elem: "O" },
  "Ketone": { elem: "O" },
  "Amine": { elem: "N" },
  "Amide": { elem: "N" },
  "Nitrile": { elem: "N" }
};

// ── GLOBAL STATE ─────────────────────────────────────────────────
let molecules = [];
let searchQuery = "";
let selectedCategory = "all";
let activeNavIndex = -1;
let currentFilteredList = [];
let selectedMoleculeIndex = -1;
let glViewer = null;
let isSpinning = false;
let currentStyle = "ballstick";

let starredIds = new Set(JSON.parse(localStorage.getItem("starred_ids") || "[]"));
let quizMode = false;
let quizGot = parseInt(localStorage.getItem("quiz_got") || "0");
let quizMiss = parseInt(localStorage.getItem("quiz_miss") || "0");
let activeFgBadge = null;

// ── DOM ELEMENTS ─────────────────────────────────────────────────
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const shortcutBadge = document.getElementById("shortcutBadge");
const filtersContainer = document.getElementById("filtersContainer");
const moleculesList = document.getElementById("moleculesList");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const detailSidebar = document.getElementById("detailSidebar");
const sidebarWelcome = document.getElementById("sidebarWelcome");
const sidebarDetails = document.getElementById("sidebarDetails");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const btnSidebarClose = document.getElementById("btnSidebarClose");

const detailMolId = document.getElementById("detailMolId");
const detailMolName = document.getElementById("detailMolName");
const detailFormula = document.getElementById("detailFormula");
const detailWeight = document.getElementById("detailWeight");
const detailSmiles = document.getElementById("detailSmiles");
const detailCategories = document.getElementById("detailCategories");
const smilesHelpBanner = document.getElementById("smilesHelpBanner");
const smilesHelpToggle = document.getElementById("smilesHelpToggle");

const btnSpin = document.getElementById("btnSpin");
const spinText = document.getElementById("spinText");
const btnStyle = document.getElementById("btnStyle");
const styleText = document.getElementById("styleText");
const viewerControls = document.getElementById("viewerControls");

const btnCopyName = document.getElementById("btnCopyName");
const btnDownloadPse = document.getElementById("btnDownloadPse");
const btnDownloadSdf = document.getElementById("btnDownloadSdf");
const btnPubchem = document.getElementById("btnPubchem");

// ── INITIALIZATION ───────────────────────────────────────────────
async function init() {
  // Load data from JSON file
  try {
    const response = await fetch("molecules.json");
    molecules = await response.json();
  } catch (err) {
    console.error("Failed to load molecules.json:", err);
    molecules = [];
  }

  setupTheme();
  setupFilters();
  updateStats();
  renderMolecules();
  setupEventListeners();

  console.log(`Loaded ${molecules.length} molecules. Application ready.`);
}

// ── THEME MANAGEMENT ────────────────────────────────────────────
function setupTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }
}

// ── FILTERS & STATS ─────────────────────────────────────────────
function setupFilters() {
  CATEGORIES.forEach(cat => {
    const count = molecules.filter(m =>
      m.categories.map(c => c.toLowerCase()).includes(cat)
    ).length;
    if (count > 0) {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.setAttribute("data-category", cat);

      let displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (cat === "carboxylic acid") displayName = "Acids";
      if (cat === "stereochemistry") displayName = "Stereo";
      if (cat === "haloalkane") displayName = "Halogens";

      btn.innerHTML = `<span>${displayName}</span><span class="filter-count">${count}</span>`;
      filtersContainer.appendChild(btn);
    }
  });
  document.getElementById("count-all").textContent = molecules.length;
}

function updateStats() {
  document.getElementById("stat-total").textContent = molecules.length;
  const stereoCount = molecules.filter(m =>
    m.categories.includes("Stereochemistry")
  ).length;
  document.getElementById("stat-stereo").textContent = stereoCount;
  const haloCount = molecules.filter(m =>
    m.categories.includes("Haloalkane")
  ).length;
  document.getElementById("stat-halo").textContent = haloCount;
  const unsatCount = molecules.filter(m =>
    m.categories.includes("Alkene") || m.categories.includes("Alkyne")
  ).length;
  document.getElementById("stat-unsaturated").textContent = unsatCount;
}

// ── SEARCH & RENDERING ──────────────────────────────────────────
function highlightText(text, query) {
  if (!query) return text;
  const escapedQuery = query.replace(/[-/\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function renderMolecules() {
  moleculesList.innerHTML = "";

  const onlyStarred = document.getElementById("btnStarredFilter")?.classList.contains("active");
  currentFilteredList = molecules.filter(m => {
    if (onlyStarred && !starredIds.has(m.id)) return false;
    if (selectedCategory !== "all") {
      if (!m.categories.map(c => c.toLowerCase()).includes(selectedCategory)) {
        return false;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = m.original_name.toLowerCase().includes(query);
      const matchesFormula = m.formula && m.formula.toLowerCase().includes(query);
      const matchesSmiles = m.smiles && m.smiles.toLowerCase().includes(query);
      const matchesCategory = m.categories.some(c =>
        c.toLowerCase().includes(query)
      );
      return matchesName || matchesFormula || matchesSmiles || matchesCategory;
    }

    return true;
  });

  activeNavIndex = -1;

  if (currentFilteredList.length === 0) {
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";

  currentFilteredList.forEach((mol, idx) => {
    const card = document.createElement("div");
    card.className = "molecule-card";
    card.setAttribute("id", `mol-card-${idx}`);
    card.setAttribute("data-index", idx);

    const badgesHTML = mol.categories
      .map(cat => {
        const className = cat.toLowerCase().replace(/\s+/g, "-");
        return `<span class="badge ${className}">${cat}</span>`;
      })
      .join("");

    let metaHTML = "";
    if (mol.formula || mol.weight) {
      metaHTML = `<div class="property-meta">`;
      if (mol.formula) {
        metaHTML += `
          <div class="prop-item">
            <span class="prop-label">Formula:</span>
            <span class="prop-val">${highlightText(mol.formula, searchQuery)}</span>
          </div>
        `;
      }
      if (mol.weight) {
        metaHTML += `
          <div class="prop-item">
            <span class="prop-label">MW:</span>
            <span class="prop-val">${mol.weight} g/mol</span>
          </div>
        `;
      }
      metaHTML += `</div>`;
    }

    let previewHTML = "";
    if (mol.has_pymol) {
      previewHTML = `
        <div class="molecule-preview-wrapper" title="PyMOL 3D Render">
          <img src="structures/images/${mol.id}.png" alt="${mol.original_name}" loading="lazy">
        </div>
      `;
    } else if (mol.cid) {
      previewHTML = `
        <div class="molecule-preview-wrapper" title="PubChem 2D Preview">
          <img src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${mol.cid}/PNG" alt="${mol.original_name}" loading="lazy">
        </div>
      `;
    } else {
      previewHTML = `
        <div class="molecule-preview-wrapper" style="background: rgba(0,0,0,0.015)">
          <svg class="structure-fallback" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
      `;
    }

    let thumbHTML = "";
    if (mol.skeletal_svg) {
      thumbHTML = `<div class="card-thumb">${mol.skeletal_svg}</div>`;
    } else {
      thumbHTML = `<div class="card-thumb no-svg"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" opacity="0.4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 4.5H12m-1.5 4.5H12m-1.5 4.5H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg></div>`;
    }

    const isStarred = starredIds.has(mol.id);
    card.innerHTML = `
      <div class="card-left">
        ${thumbHTML}
        <div style="flex:1;min-width:0;">
          <div class="card-id-name">
            <span class="mol-id">#${String(mol.id).padStart(3, "0")}</span>
            <div class="mol-name">${highlightText(mol.original_name, searchQuery)}</div>
            <span class="quiz-reveal-hint">click to reveal</span>
          </div>
          <div class="quiz-answer-btns" id="quizBtns-${idx}" data-molecule-index="${idx}">
            <button class="quiz-btn-got" data-action="got">✓ Got it</button>
            <button class="quiz-btn-miss" data-action="miss">✗ Review</button>
          </div>
          <div class="badges-row">${badgesHTML}</div>
          ${metaHTML}
        </div>
      </div>
      <div class="card-right">
        <button class="copy-btn" data-copy-btn="${idx}" title="Copy IUPAC name">
          <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
          </svg>
          <span>Copy</span>
        </button>
        <button class="btn-star ${isStarred ? "starred" : ""}" data-star-btn="${idx}" title="Bookmark this molecule">
          ${isStarred ? "★" : "☆"}
        </button>
      </div>
    `;

    // Event: Copy button
    const copyBtn = card.querySelector(`[data-copy-btn="${idx}"]`);
    copyBtn.addEventListener("click", e => {
      e.stopPropagation();
      copyToClipboard(mol.original_name, "IUPAC Name Copied!");
      card.classList.add("copied");
      copyBtn.classList.add("success-btn");
      launchConfetti();
      setTimeout(() => {
        card.classList.remove("copied");
        copyBtn.classList.remove("success-btn");
      }, 1200);
    });

    // Event: Star button
    const starBtn = card.querySelector(`[data-star-btn="${idx}"]`);
    starBtn.addEventListener("click", e => {
      e.stopPropagation();
      toggleStar(mol.id, starBtn);
    });

    // Event: Quiz answer buttons
    const quizBtns = card.querySelector(`[id="quizBtns-${idx}"]`);
    if (quizBtns) {
      quizBtns.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const action = btn.getAttribute("data-action");
          quizAnswer(action === "got", card);
        });
      });
    }

    // Event: Click name to reveal (quiz mode)
    const molNameEl = card.querySelector(".mol-name");
    if (molNameEl) {
      molNameEl.addEventListener("click", e => {
        if (document.body.classList.contains("quiz-mode")) {
          e.stopPropagation();
          card.classList.toggle("quiz-revealed");
        }
      });
    }

    // Event: Card click to select molecule
    card.addEventListener("click", () => selectMolecule(idx));

    moleculesList.appendChild(card);
  });
}

function selectMolecule(index) {
  selectedMoleculeIndex = index;
  activeNavIndex = index;
  updateActiveNavCard();

  const mol = currentFilteredList[index];
  if (!mol) return;

  sidebarWelcome.classList.add("hidden");
  sidebarDetails.classList.remove("hidden");

  detailSidebar.classList.add("open");
  sidebarOverlay.classList.add("open");

  // Update details
  detailMolId.textContent = `#${String(mol.id).padStart(3, "0")}`;
  detailMolName.textContent = mol.original_name;
  detailFormula.textContent = mol.formula || "N/A";
  detailWeight.textContent = mol.weight ? `${mol.weight} g/mol` : "N/A";
  detailSmiles.textContent = mol.smiles || "N/A";

  // Update badges
  detailCategories.innerHTML = mol.categories
    .map(cat => {
      const className = cat.toLowerCase().replace(/\s+/g, "-");
      return `<span class="badge ${className}" data-fg-category="${cat}">${cat}</span>`;
    })
    .join("");

  // Attach functional group highlight listeners
  detailCategories.querySelectorAll("[data-fg-category]").forEach(badge => {
    badge.style.cursor = "pointer";
    badge.addEventListener("click", () => {
      highlightFunctionalGroup(badge.getAttribute("data-fg-category"), badge);
    });
  });

  // Update stereo badges
  const stereoBadgesEl = document.getElementById("detailStereoBadges");
  if (stereoBadgesEl) {
    const name = mol.original_name;
    const rsMatches = [...name.matchAll(/\((\d*[RS])\)/g)].map(m => m[1]);
    const ezMatches = [...name.matchAll(/\((\d*[EZ])\)/g)].map(m => m[1]);
    const geoMatch = name.match(/cis|trans/i);
    let badges = "";
    rsMatches.forEach(s => {
      badges += `<span class="stereo-badge rs">${s}</span>`;
    });
    ezMatches.forEach(s => {
      badges += `<span class="stereo-badge ez">${s}</span>`;
    });
    if (geoMatch) badges += `<span class="stereo-badge geo">${geoMatch[0]}</span>`;
    stereoBadgesEl.innerHTML = badges;
  }

  // Update download links
  if (mol.has_sdf) {
    btnDownloadSdf.style.display = "flex";
    btnDownloadSdf.href = `structures/sdf/${mol.id}.sdf`;
  } else {
    btnDownloadSdf.style.display = "none";
  }

  if (mol.has_pymol) {
    btnDownloadPse.style.display = "flex";
    btnDownloadPse.href = `structures/sessions/${mol.id}.pse`;
  } else {
    btnDownloadPse.style.display = "none";
  }

  if (mol.cid) {
    btnPubchem.style.display = "flex";
    btnPubchem.href = `https://pubchem.ncbi.nlm.nih.gov/compound/${mol.cid}`;
  } else {
    btnPubchem.style.display = "none";
  }

  // Update 2D options visibility
  const selectViewMode = document.getElementById("selectViewMode");
  const optFischer = document.getElementById("optFischer");
  const optNewman = document.getElementById("optNewman");
  const optChair = document.getElementById("optChair");
  const optBoat = document.getElementById("optBoat");

  optFischer.style.display = mol.fischer_svg ? "block" : "none";
  optNewman.style.display = mol.newman_svg ? "block" : "none";
  optChair.style.display = mol.chair_svg ? "block" : "none";
  optBoat.style.display = mol.boat_svg ? "block" : "none";

  const currentMode = selectViewMode.value;
  let isAvailable = true;
  if (currentMode === "fischer" && !mol.fischer_svg) isAvailable = false;
  if (currentMode === "newman" && !mol.newman_svg) isAvailable = false;
  if (currentMode === "chair" && !mol.chair_svg) isAvailable = false;
  if (currentMode === "boat" && !mol.boat_svg) isAvailable = false;

  if (!isAvailable) {
    selectViewMode.value = "3d";
  }

  updateMoleculeRepresentation();
}

function updateActiveNavCard() {
  document.querySelectorAll(".molecule-card").forEach(c =>
    c.classList.remove("active-nav")
  );

  if (activeNavIndex >= 0 && activeNavIndex < currentFilteredList.length) {
    const activeCard = document.getElementById(`mol-card-${activeNavIndex}`);
    if (activeCard) {
      activeCard.classList.add("active-nav");
      activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

// ── 3D VIEWER ────────────────────────────────────────────────────
function applyViewerStyle() {
  if (!glViewer) return;

  let baseStyle = {};
  if (currentStyle === "stick") {
    baseStyle = { stick: { radius: 0.16, colorscheme: "Jmol" } };
  } else if (currentStyle === "ballstick") {
    baseStyle = {
      stick: { radius: 0.12, colorscheme: "Jmol" },
      sphere: { scale: 0.28, colorscheme: "Jmol" }
    };
  } else if (currentStyle === "sphere") {
    baseStyle = { sphere: { scale: 0.4, colorscheme: "Jmol" } };
  } else {
    baseStyle = { line: {} };
  }

  glViewer.setStyle({}, baseStyle);

  // Highlight halogens
  const elements = [
    { elem: "Br", color: "orange" },
    { elem: "Cl", color: "green" },
    { elem: "I", color: "purple" }
  ];

  elements.forEach(item => {
    let elemStyle = {};
    if (currentStyle === "stick") {
      elemStyle = { stick: { color: item.color, radius: 0.16 } };
    } else if (currentStyle === "ballstick") {
      elemStyle = {
        stick: { color: item.color, radius: 0.12 },
        sphere: { color: item.color, scale: 0.28 }
      };
    } else if (currentStyle === "sphere") {
      elemStyle = { sphere: { color: item.color, scale: 0.4 } };
    }
    glViewer.setStyle({ elem: item.elem }, elemStyle);
  });

  if (currentStyle === "stick") styleText.textContent = "Style: Stick";
  else if (currentStyle === "ballstick") styleText.textContent = "Style: Ball & Stick";
  else if (currentStyle === "sphere") styleText.textContent = "Style: Sphere";
  else styleText.textContent = "Style: Line";

  glViewer.render();
}

function updateMoleculeRepresentation() {
  const mol = currentFilteredList[selectedMoleculeIndex];
  if (!mol) return;

  const viewMode = document.getElementById("selectViewMode").value;
  const viewer3d = document.getElementById("molecule-3d-viewer");
  const viewer2d = document.getElementById("molecule-2d-viewer");
  const controls3d = document.getElementById("viewerControls");
  const fallbackImg = document.getElementById("viewer-fallback-img");
  const content2d = document.getElementById("molecule-2d-content");
  const btnExpand = document.getElementById("btnExpandViewer");

  if (viewMode === "3d") {
    viewer3d.style.display = "block";
    viewer2d.classList.add("hidden");
    controls3d.style.display = "flex";
    if (btnExpand) btnExpand.style.display = "flex";
    fallbackImg.classList.add("hidden");

    if (mol.sdf_content && typeof $3Dmol !== "undefined") {
      if (glViewer) {
        glViewer.clear();
      } else {
        glViewer = $3Dmol.createViewer(viewer3d, {
          backgroundColor: document.documentElement.classList.contains("dark-theme")
            ? "#111827"
            : "#f9fafb",
          preserveDrawingBuffer: true
        });
      }
      glViewer.addModel(mol.sdf_content, "sdf");
      applyViewerStyle();
      glViewer.zoomTo();
      glViewer.render();
      glViewer.spin(isSpinning);
    } else {
      showFallbackImage(mol);
    }
  } else {
    viewer3d.style.display = "none";
    viewer2d.classList.remove("hidden");
    controls3d.style.display = "none";
    if (btnExpand) btnExpand.style.display = "none";
    fallbackImg.classList.add("hidden");
    if (glViewer) glViewer.spin(false);

    let svgContent = "";
    if (viewMode === "skeletal") svgContent = mol.skeletal_svg;
    else if (viewMode === "wedgedash") svgContent = mol.wedgedash_svg;
    else if (viewMode === "lewis") svgContent = mol.lewis_svg;
    else if (viewMode === "full") svgContent = mol.full_svg;
    else if (viewMode === "fischer") svgContent = mol.fischer_svg;
    else if (viewMode === "newman") svgContent = mol.newman_svg;
    else if (viewMode === "chair") svgContent = mol.chair_svg;
    else if (viewMode === "boat") svgContent = mol.boat_svg;
    else if (viewMode === "condensed") {
      content2d.innerHTML = `<div class="condensed-text-display">${mol.condensed || "N/A"}</div>`;
      return;
    }

    if (svgContent) {
      content2d.innerHTML = svgContent;
    } else {
      content2d.innerHTML = `<div class="condensed-text-display" style="color:var(--text-muted);">Format not available</div>`;
    }
  }
}

function showFallbackImage(mol) {
  const viewerContainer = document.getElementById("molecule-3d-viewer");
  const fallbackImg = document.getElementById("viewer-fallback-img");
  viewerContainer.style.display = "none";
  viewerControls.style.display = "none";
  fallbackImg.classList.remove("hidden");

  if (mol.has_pymol) {
    fallbackImg.src = `structures/images/${mol.id}.png`;
  } else if (mol.cid) {
    fallbackImg.src = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${mol.cid}/PNG`;
  }
}

// ── COPY & CLIPBOARD ─────────────────────────────────────────────
async function copyToClipboard(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg || `Copied to clipboard: "${text}"`);
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    showToast("Failed to copy! Please select and copy manually.");
  }
}

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add("show");

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// ── DOWNLOAD & SNAPSHOT ──────────────────────────────────────────
function downloadSnapshot(viewerInstance, compoundName) {
  if (!viewerInstance) return;
  try {
    const canvas = document.querySelector("#molecule-3d-viewer canvas");
    if (!canvas) {
      showToast("Failed to find 3D canvas.");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl || dataUrl === "data:,") {
      showToast("Failed to capture image.");
      return;
    }
    const base64Data = dataUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/png" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = compoundName.replace(/[^a-zA-Z0-9_-]/g, "_") + "_snapshot.png";
    link.href = objectUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    showToast("Snapshot downloaded!");
  } catch (err) {
    showToast("Failed to download snapshot: " + err.message);
  }
}

function download2dSnapshot() {
  const mol = selectedMoleculeIndex >= 0 ? currentFilteredList[selectedMoleculeIndex] : null;
  const content2d = document.getElementById("molecule-2d-content");
  if (!content2d || !mol) return;

  const viewMode = document.getElementById("selectViewMode").value;
  const svgEl = content2d.querySelector("svg");

  if (viewMode === "condensed" || !svgEl) {
    const text = content2d.textContent.trim();
    if (!text) {
      showToast("Nothing to capture.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = document.documentElement.classList.contains("dark-theme")
      ? "#111827"
      : "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = document.documentElement.classList.contains("dark-theme")
      ? "#f1f5f9"
      : "#1e293b";
    ctx.font = "bold 22px 'Fira Code', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    downloadCanvasAsPng(canvas, mol.original_name + "_" + viewMode);
    return;
  }

  const svgClone = svgEl.cloneNode(true);
  const isDark = document.documentElement.classList.contains("dark-theme");
  const bg = isDark ? "#111827" : "#f9fafb";
  const fg = isDark ? "#f1f5f9" : "#1e293b";

  svgClone.querySelectorAll("[fill='var(--text-primary)']").forEach(el => {
    el.setAttribute("fill", fg);
  });

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", bg);
  svgClone.insertBefore(rect, svgClone.firstChild);

  const svgStr = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const img = new Image();
  const vb = svgEl.getAttribute("viewBox");
  let W = 800,
    H = 600;
  if (vb) {
    const [, , w, h] = vb.split(/\s+/).map(Number);
    W = Math.max(w, 400);
    H = Math.max(h, 300);
  }
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    URL.revokeObjectURL(svgUrl);
    downloadCanvasAsPng(canvas, mol.original_name + "_" + viewMode);
  };
  img.onerror = () => {
    URL.revokeObjectURL(svgUrl);
    showToast("Failed to render SVG.");
  };
  img.src = svgUrl;
}

function downloadCanvasAsPng(canvas, name) {
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "image/png" });
  const objUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = name.replace(/[^a-zA-Z0-9_-]/g, "_") + ".png";
  link.href = objUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objUrl), 100);
  showToast("Snapshot downloaded!");
}

// ── STARS / BOOKMARKS ────────────────────────────────────────────
function toggleStar(molId, btn) {
  if (starredIds.has(molId)) {
    starredIds.delete(molId);
    btn.classList.remove("starred");
    btn.textContent = "☆";
  } else {
    starredIds.add(molId);
    btn.classList.add("starred");
    btn.textContent = "★";
  }
  localStorage.setItem("starred_ids", JSON.stringify([...starredIds]));
  if (document.getElementById("btnStarredFilter").classList.contains("active")) {
    renderMolecules();
  }
}

// ── QUIZ MODE ────────────────────────────────────────────────────
function toggleQuiz() {
  quizMode = !quizMode;
  document.body.classList.toggle("quiz-mode", quizMode);
  const toolbar = document.getElementById("quizToolbar");
  const btnFilter = document.getElementById("btnQuizMode");
  toolbar.classList.toggle("hidden", !quizMode);
  if (btnFilter) btnFilter.classList.toggle("active", quizMode);
  updateQuizScore();
}

function quizAnswer(gotIt, card) {
  if (gotIt) {
    quizGot++;
    localStorage.setItem("quiz_got", quizGot);
  } else {
    quizMiss++;
    localStorage.setItem("quiz_miss", quizMiss);
  }
  if (card) card.classList.add("quiz-revealed");
  updateQuizScore();
}

function updateQuizScore() {
  const g = document.getElementById("scoreGot");
  const m = document.getElementById("scoreMiss");
  if (g) g.textContent = quizGot;
  if (m) m.textContent = quizMiss;
}

function resetQuizScore() {
  quizGot = quizMiss = 0;
  localStorage.removeItem("quiz_got");
  localStorage.removeItem("quiz_miss");
  updateQuizScore();
}

// ── FUNCTIONAL GROUP HIGHLIGHT ──────────────────────────────────
function highlightFunctionalGroup(category, badgeEl) {
  if (activeFgBadge === badgeEl) {
    badgeEl.classList.remove("active-highlight");
    activeFgBadge = null;
    if (glViewer) {
      glViewer.setStyle({}, {
        stick: { radius: 0.12, colorscheme: "Jmol" },
        sphere: { scale: 0.28, colorscheme: "Jmol" }
      });
      glViewer.render();
    }
    return;
  }
  if (activeFgBadge) activeFgBadge.classList.remove("active-highlight");
  activeFgBadge = badgeEl;
  badgeEl.classList.add("active-highlight");

  if (!glViewer) return;
  glViewer.setStyle({}, {
    stick: { radius: 0.1, color: "#444" },
    sphere: { scale: 0.22, color: "#444" }
  });
  const rule = FG_ATOMS[category];
  if (rule) {
    const elems = Array.isArray(rule.elem) ? rule.elem : [rule.elem];
    elems.forEach(el => {
      glViewer.setStyle({ elem: el }, {
        stick: { radius: 0.16, color: "#f59e0b" },
        sphere: { scale: 0.34, color: "#f59e0b" }
      });
    });
  }
  glViewer.render();
}

// ── CONFETTI ────────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height * 0.45,
    vx: (Math.random() - 0.5) * 7,
    vy: -(Math.random() * 6 + 3),
    color: [
      "#6366f1",
      "#a78bfa",
      "#38bdf8",
      "#f59e0b",
      "#22c55e",
      "#f472b6"
    ][Math.floor(Math.random() * 6)],
    size: Math.random() * 5 + 3,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 10
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy + frame * 0.08;
      p.vy += 0.18;
      p.rot += p.rotV;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / 55);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();
    });
    frame++;
    if (frame < 60) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ── HELPER: Close Sidebar ────────────────────────────────────────
function closeSidebar() {
  detailSidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
  activeNavIndex = -1;
  document.querySelectorAll(".molecule-card").forEach(c =>
    c.classList.remove("active-nav")
  );
}

// ── EVENT LISTENERS ──────────────────────────────────────────────
function setupEventListeners() {
  // Search input
  searchInput.addEventListener("input", e => {
    searchQuery = e.target.value;
    clearBtn.style.display = searchQuery ? "block" : "none";
    shortcutBadge.style.display = searchQuery ? "none" : "block";
    renderMolecules();
  });

  // Clear button
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearBtn.style.display = "none";
    shortcutBadge.style.display = "block";
    searchInput.focus();
    renderMolecules();
  });

  // Theme toggle
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (glViewer) {
      glViewer.setBackgroundColor(isDark ? "#111827" : "#f9fafb");
      glViewer.render();
    }
  });

  // Sidebar close
  btnSidebarClose.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  // View mode change
  document.getElementById("selectViewMode").addEventListener("change", updateMoleculeRepresentation);

  // Starred filter
  const btnStarredFilter = document.getElementById("btnStarredFilter");
  if (btnStarredFilter) {
    btnStarredFilter.addEventListener("click", () => {
      btnStarredFilter.classList.toggle("active");
      renderMolecules();
    });
  }

  // Quiz mode button
  const btnQuizMode = document.getElementById("btnQuizMode");
  if (btnQuizMode) {
    btnQuizMode.addEventListener("click", toggleQuiz);
  }

  // 3D controls
  btnSpin.addEventListener("click", () => {
    if (glViewer) {
      isSpinning = !isSpinning;
      glViewer.spin(isSpinning);
      spinText.textContent = isSpinning ? "Spin On" : "Spin Off";
    }
  });

  btnStyle.addEventListener("click", () => {
    if (currentStyle === "stick") {
      currentStyle = "sphere";
    } else if (currentStyle === "sphere") {
      currentStyle = "line";
    } else {
      currentStyle = "stick";
    }
    applyViewerStyle();
  });

  // 3D Capture
  const btnCapture = document.getElementById("btnCapture");
  if (btnCapture) {
    btnCapture.addEventListener("click", () => {
      if (selectedMoleculeIndex >= 0) {
        const mol = currentFilteredList[selectedMoleculeIndex];
        downloadSnapshot(glViewer, mol.original_name);
      }
    });
  }

  // 2D Capture
  const btn2dCapture = document.getElementById("btn2dCapture");
  if (btn2dCapture) {
    btn2dCapture.addEventListener("click", download2dSnapshot);
  }

  // Copy name in sidebar
  btnCopyName.addEventListener("click", () => {
    if (selectedMoleculeIndex >= 0) {
      const mol = currentFilteredList[selectedMoleculeIndex];
      copyToClipboard(mol.original_name, "IUPAC Name Copied!");
    }
  });

  // SMILES help toggle
  if (smilesHelpToggle && smilesHelpBanner) {
    smilesHelpToggle.addEventListener("click", () => {
      const isOpen = smilesHelpBanner.classList.toggle("open");
      smilesHelpToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Global keyboard shortcuts
  window.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }

    if (e.key === "Escape") {
      if (document.activeElement === searchInput) {
        searchInput.value = "";
        searchQuery = "";
        clearBtn.style.display = "none";
        shortcutBadge.style.display = "block";
        searchInput.blur();
        renderMolecules();
      } else {
        closeSidebar();
      }
      return;
    }

    if (currentFilteredList.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (activeNavIndex < currentFilteredList.length - 1) {
          activeNavIndex++;
          selectMolecule(activeNavIndex);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (activeNavIndex > 0) {
          activeNavIndex--;
          selectMolecule(activeNavIndex);
        }
      } else if (e.key === "Enter" && activeNavIndex >= 0) {
        e.preventDefault();
        const mol = currentFilteredList[activeNavIndex];
        copyToClipboard(mol.original_name, "IUPAC Name Copied!");
      }
    }
  });

  // Filter buttons
  filtersContainer.addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedCategory = btn.getAttribute("data-category");
    renderMolecules();
  });

  // Quiz button (fixed)
  document.addEventListener("click", e => {
    if (e.target.id === "btnQuit Quiz") {
      toggleQuiz();
    }
  });

  // Reset quiz button
  document.addEventListener("click", e => {
    if (e.target.textContent === "Reset") {
      resetQuizScore();
    }
  });
}

// ── START APPLICATION ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
