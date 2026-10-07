/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Search & Rendering
   ──────────────────────────────────────────────────────────────── */

function highlightText(text, query) {
  if (!query) return text;
  const escapedQuery = query.replace(/[-/\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function matchesMoleculeFilter(m, onlyStarred) {
  if (onlyStarred && !starredIds.has(m.id)) return false;
  if (selectedCategory !== "all") {
    if (m._lowerCategories ? !m._lowerCategories.includes(selectedCategory) : !m.categories.map(c => c.toLowerCase()).includes(selectedCategory)) {
      return false;
    }
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    const matchesName = m.original_name.toLowerCase().includes(query);
    const matchesFormula = m.formula && m.formula.toLowerCase().includes(query);
    const matchesSmiles = m.smiles && m.smiles.toLowerCase().includes(query);
    const matchesCategory = m._lowerCategories
      ? m._lowerCategories.some(c => c.includes(query))
      : m.categories.some(c => c.toLowerCase().includes(query));
    return matchesName || matchesFormula || matchesSmiles || matchesCategory;
  }

  return true;
}

function createCategoryBadgesHTML(categories) {
  return categories
    .map(cat => {
      const className = cat.toLowerCase().replace(/\s+/g, "-");
      return `<span class="badge ${className}">${cat}</span>`;
    })
    .join("");
}

function createPropertyMetaHTML(formula, weight) {
  if (!formula && !weight) return "";
  let metaHTML = `<div class="property-meta">`;
  if (formula) {
    metaHTML += `
      <div class="prop-item">
        <span class="prop-label">Formula:</span>
        <span class="prop-val">${highlightText(formula, searchQuery)}</span>
      </div>
    `;
  }
  if (weight) {
    metaHTML += `
      <div class="prop-item">
        <span class="prop-label">MW:</span>
        <span class="prop-val">${weight} g/mol</span>
      </div>
    `;
  }
  metaHTML += `</div>`;
  return metaHTML;
}

function createCardThumbHTML(skeletalSvg) {
  if (skeletalSvg) {
    return `<div class="card-thumb">${skeletalSvg}</div>`;
  }
  return `<div class="card-thumb no-svg">${NO_SVG_ICON}</div>`;
}

function createMoleculeCardHTML(mol, idx, isStarred) {
  const badgesHTML = createCategoryBadgesHTML(mol.categories);
  const metaHTML = createPropertyMetaHTML(mol.formula, mol.weight);
  const thumbHTML = createCardThumbHTML(mol.skeletal_svg);

  return `
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
        ${COPY_ICON}
        <span>Copy</span>
      </button>
      <button class="btn-star ${isStarred ? "starred" : ""}" data-star-btn="${idx}" title="Bookmark this molecule">
        ${isStarred ? "★" : "☆"}
      </button>
    </div>
  `;
}

function createMoleculeCard(mol, idx) {
  const card = document.createElement("div");
  card.className = "molecule-card";
  card.setAttribute("id", `mol-card-${idx}`);
  card.setAttribute("data-index", idx);

  const isStarred = starredIds.has(mol.id);
  card.innerHTML = createMoleculeCardHTML(mol, idx, isStarred);

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

  return card;
}

function renderMolecules() {
  moleculesList.innerHTML = "";

  const onlyStarred = document.getElementById("btnStarredFilter")?.classList.contains("active");
  currentFilteredList = molecules.filter(m => matchesMoleculeFilter(m, onlyStarred));

  activeNavIndex = -1;
  activeNavCard = null;

  if (currentFilteredList.length === 0) {
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";

  currentFilteredList.forEach((mol, idx) => {
    const card = createMoleculeCard(mol, idx);
    moleculesList.appendChild(card);
  });
}
