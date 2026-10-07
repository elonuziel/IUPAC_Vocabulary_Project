/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Quiz & Bookmarks
   ──────────────────────────────────────────────────────────────── */

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
  safeStorage.setItem("starred_ids", JSON.stringify([...starredIds]));
  if (document.getElementById("btnStarredFilter").classList.contains("active")) {
    renderMolecules();
  }
}

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
    safeStorage.setItem("quiz_got", quizGot);
  } else {
    quizMiss++;
    safeStorage.setItem("quiz_miss", quizMiss);
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
  safeStorage.removeItem("quiz_got");
  safeStorage.removeItem("quiz_miss");
  updateQuizScore();
}

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
