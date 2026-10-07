/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - 3D/2D Viewer Logic
   ──────────────────────────────────────────────────────────────── */

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
      if (typeof $3Dmol === "undefined") {
        console.warn("3Dmol is not defined. Falling back to 2D skeletal representation.");
        const selectViewMode = document.getElementById("selectViewMode");
        if (selectViewMode) {
          selectViewMode.value = "skeletal";
          const option3d = selectViewMode.querySelector('option[value="3d"]');
          if (option3d) {
            option3d.disabled = true;
            option3d.textContent = "3D View (Offline - Unavailable)";
          }
        }
        updateMoleculeRepresentation();
      } else {
        showFallbackImage(mol);
      }
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
