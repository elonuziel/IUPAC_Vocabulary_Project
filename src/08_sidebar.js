/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Detail Sidebar
   ──────────────────────────────────────────────────────────────── */

function updateMoleculeDetails(mol) {
  detailMolId.textContent = `#${String(mol.id).padStart(3, "0")}`;
  detailMolName.textContent = mol.original_name;
  detailFormula.textContent = mol.formula || "N/A";
  detailWeight.textContent = mol.weight ? `${mol.weight} g/mol` : "N/A";
  detailSmiles.textContent = mol.smiles || "N/A";

  detailCategories.innerHTML = mol.categories
    .map(cat => {
      const className = cat.toLowerCase().replace(/\s+/g, "-");
      return `<span class="badge ${className}" data-fg-category="${cat}">${cat}</span>`;
    })
    .join("");

  detailCategories.querySelectorAll("[data-fg-category]").forEach(badge => {
    badge.style.cursor = "pointer";
    badge.addEventListener("click", () => {
      highlightFunctionalGroup(badge.getAttribute("data-fg-category"), badge);
    });
  });

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
}

function initializeViewerForMolecule(mol) {
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
    selectViewMode.value = typeof $3Dmol !== "undefined" ? "3d" : "skeletal";
  }

  updateMoleculeRepresentation();
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

  updateMoleculeDetails(mol);
  initializeViewerForMolecule(mol);
}

function updateActiveNavCard() {
  if (activeNavCard) {
    activeNavCard.classList.remove("active-nav");
    activeNavCard = null;
  }

  if (activeNavIndex >= 0 && activeNavIndex < currentFilteredList.length) {
    const activeCard = document.getElementById(`mol-card-${activeNavIndex}`);
    if (activeCard) {
      activeCard.classList.add("active-nav");
      activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      activeNavCard = activeCard;
    }
  }
}

function closeSidebar() {
  detailSidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
  activeNavIndex = -1;
  updateActiveNavCard();
}
