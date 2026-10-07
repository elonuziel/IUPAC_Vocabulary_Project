/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Initialization
   ──────────────────────────────────────────────────────────────── */

async function init() {
  try {
    const response = await fetch("molecules.json");
    molecules = await response.json();
    molecules.forEach(m => {
      m._lowerCategories = m.categories ? m.categories.map(c => c.toLowerCase()) : [];
    });
  } catch (err) {
    console.error("Failed to load molecules.json:", err);
    molecules = [];
  }

  setupTheme();
  setupFilters();
  updateStats();
  renderMolecules();
  setupEventListeners();
  check3DmolAvailability();

  console.log(`Loaded ${molecules.length} molecules. Application ready.`);
}

document.addEventListener("DOMContentLoaded", init);
