/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Global State
   ──────────────────────────────────────────────────────────────── */

let molecules = [];
let searchQuery = "";
let selectedCategory = "all";
let activeNavIndex = -1;
let activeNavCard = null;
let currentFilteredList = [];
let selectedMoleculeIndex = -1;
let glViewer = null;
let isSpinning = false;
let currentStyle = "ballstick";

let starredIds = new Set();
try {
  const savedStarred = safeStorage.getItem("starred_ids");
  if (savedStarred) {
    starredIds = new Set(JSON.parse(savedStarred));
  }
} catch (e) {
  console.warn("Failed to load/parse starred_ids:", e);
}

let quizMode = false;
let quizGot = parseInt(safeStorage.getItem("quiz_got", "0"));
let quizMiss = parseInt(safeStorage.getItem("quiz_miss", "0"));
let activeFgBadge = null;
