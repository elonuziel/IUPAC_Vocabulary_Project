/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Event Listeners
   ──────────────────────────────────────────────────────────────── */

function setupSearchListeners() {
  searchInput.addEventListener("input", e => {
    searchQuery = e.target.value;
    clearBtn.style.display = searchQuery ? "block" : "none";
    shortcutBadge.style.display = searchQuery ? "none" : "block";
    renderMolecules();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearBtn.style.display = "none";
    shortcutBadge.style.display = "block";
    searchInput.focus();
    renderMolecules();
  });
}

function setupThemeListeners() {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark-theme");
    safeStorage.setItem("theme", isDark ? "dark" : "light");
    if (glViewer) {
      glViewer.setBackgroundColor(isDark ? "#111827" : "#f9fafb");
      glViewer.render();
    }
  });
}

function setupSidebarListeners() {
  btnSidebarClose.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  btnCopyName.addEventListener("click", () => {
    if (selectedMoleculeIndex >= 0) {
      const mol = currentFilteredList[selectedMoleculeIndex];
      copyToClipboard(mol.original_name, "IUPAC Name Copied!");
    }
  });

  if (smilesHelpToggle && smilesHelpBanner) {
    smilesHelpToggle.addEventListener("click", () => {
      const isOpen = smilesHelpBanner.classList.toggle("open");
      smilesHelpToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
}

function setupViewerListeners() {
  document.getElementById("selectViewMode").addEventListener("change", updateMoleculeRepresentation);

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

  const btnCapture = document.getElementById("btnCapture");
  if (btnCapture) {
    btnCapture.addEventListener("click", () => {
      if (selectedMoleculeIndex >= 0) {
        const mol = currentFilteredList[selectedMoleculeIndex];
        downloadSnapshot(glViewer, mol.original_name);
      }
    });
  }

  const btn2dCapture = document.getElementById("btn2dCapture");
  if (btn2dCapture) {
    btn2dCapture.addEventListener("click", download2dSnapshot);
  }
}

function setupFilterListeners() {
  const btnStarredFilter = document.getElementById("btnStarredFilter");
  if (btnStarredFilter) {
    btnStarredFilter.addEventListener("click", () => {
      btnStarredFilter.classList.toggle("active");
      renderMolecules();
    });
  }

  filtersContainer.addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedCategory = btn.getAttribute("data-category");
    renderMolecules();
  });
}

function setupQuizListeners() {
  const btnQuizMode = document.getElementById("btnQuizMode");
  if (btnQuizMode) {
    btnQuizMode.addEventListener("click", toggleQuiz);
  }

  document.addEventListener("click", e => {
    if (e.target.id === "btnQuit Quiz") {
      toggleQuiz();
    }
  });

  document.addEventListener("click", e => {
    if (e.target.textContent === "Reset") {
      resetQuizScore();
    }
  });
}

function setupKeyboardListeners() {
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
}

function setupEventListeners() {
  setupSearchListeners();
  setupThemeListeners();
  setupSidebarListeners();
  setupViewerListeners();
  setupFilterListeners();
  setupQuizListeners();
  setupKeyboardListeners();
}
