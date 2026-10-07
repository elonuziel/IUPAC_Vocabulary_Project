/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Filters & Stats
   ──────────────────────────────────────────────────────────────── */

function setupFilters() {
  const categoryCounts = {};
  molecules.forEach(m => {
    if (m._lowerCategories) {
      m._lowerCategories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }
  });

  CATEGORIES.forEach(cat => {
    const count = categoryCounts[cat] || 0;
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
