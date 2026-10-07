/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Theme & 3D Availability
   ──────────────────────────────────────────────────────────────── */

function setupTheme() {
  const savedTheme = safeStorage.getItem("theme") || "dark";
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }
}

function check3DmolAvailability() {
  if (typeof $3Dmol === "undefined") {
    console.warn("3Dmol library is not available. 3D view disabled.");
    const selectViewMode = document.getElementById("selectViewMode");
    if (selectViewMode) {
      const option3d = selectViewMode.querySelector('option[value="3d"]');
      if (option3d) {
        option3d.disabled = true;
        option3d.textContent = "3D View (Offline - Unavailable)";
      }
      selectViewMode.value = "skeletal";
    }
  }
}
