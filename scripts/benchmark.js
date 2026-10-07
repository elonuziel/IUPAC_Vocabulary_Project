const fs = require("fs");

const molecules = JSON.parse(fs.readFileSync("molecules.json", "utf8"));
const CATEGORIES = [
  "stereochemistry", "haloalkane", "alkene", "alkyne", "cyclic", "aromatic",
  "alcohol", "ether", "carboxylic acid", "ester", "amide", "anhydride",
  "alkane", "aldehyde", "ketone", "other"
];

function setupFiltersBaseline(molecules) {
  const counts = {};
  CATEGORIES.forEach(cat => {
    const count = molecules.filter(m =>
      m.categories.map(c => c.toLowerCase()).includes(cat)
    ).length;
    counts[cat] = count;
  });
  return counts;
}

function filterMoleculesBaseline(molecules, selectedCategory) {
  return molecules.filter(m => {
    if (selectedCategory !== "all") {
      if (!m.categories.map(c => c.toLowerCase()).includes(selectedCategory)) {
        return false;
      }
    }
    return true;
  });
}

function precomputeMolecules(molecules) {
  return molecules.map(m => ({
    ...m,
    _lowerCategories: m.categories ? m.categories.map(c => c.toLowerCase()) : []
  }));
}

function setupFiltersOptimized(moleculesOptimized) {
  const counts = {};
  moleculesOptimized.forEach(m => {
    if (m._lowerCategories) {
      m._lowerCategories.forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    }
  });
  return counts;
}

function filterMoleculesOptimized(moleculesOptimized, selectedCategory) {
  return moleculesOptimized.filter(m => {
    if (selectedCategory !== "all") {
      if (!m._lowerCategories.includes(selectedCategory)) {
        return false;
      }
    }
    return true;
  });
}

// Verification
const baselineCounts = setupFiltersBaseline(molecules);
const optMolecules = precomputeMolecules(molecules);
const optCounts = setupFiltersOptimized(optMolecules);

let match = true;
CATEGORIES.forEach(cat => {
  const b = baselineCounts[cat] || 0;
  const o = optCounts[cat] || 0;
  if (b !== o) {
    console.error(`Mismatch for category "${cat}": baseline=${b}, opt=${o}`);
    match = false;
  }
});

if (match) {
  console.log("SUCCESS: Category counts match perfectly between Baseline and Optimized!");
}

// Benchmarking
const ITERATIONS = 10000;

console.log(`\n--- Running setupFilters Benchmark (${ITERATIONS} iterations) ---`);

const t0 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  setupFiltersBaseline(molecules);
}
const t1 = performance.now();
const baselineSetupTime = t1 - t0;

const t2 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  setupFiltersOptimized(optMolecules);
}
const t3 = performance.now();
const optSetupTime = t3 - t2;

console.log(`Baseline setupFilters: ${baselineSetupTime.toFixed(2)} ms`);
console.log(`Optimized setupFilters: ${optSetupTime.toFixed(2)} ms`);
console.log(`Speedup: ${(baselineSetupTime / optSetupTime).toFixed(2)}x faster (${((1 - optSetupTime / baselineSetupTime) * 100).toFixed(2)}% reduction in execution time)`);

console.log(`\n--- Running filterMolecules Benchmark (${ITERATIONS} iterations x ${CATEGORIES.length} categories) ---`);

const t4 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  CATEGORIES.forEach(cat => {
    filterMoleculesBaseline(molecules, cat);
  });
}
const t5 = performance.now();
const baselineFilterTime = t5 - t4;

const t6 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  CATEGORIES.forEach(cat => {
    filterMoleculesOptimized(optMolecules, cat);
  });
}
const t7 = performance.now();
const optFilterTime = t7 - t6;

console.log(`Baseline filterMolecules: ${baselineFilterTime.toFixed(2)} ms`);
console.log(`Optimized filterMolecules: ${optFilterTime.toFixed(2)} ms`);
console.log(`Speedup: ${(baselineFilterTime / optFilterTime).toFixed(2)}x faster (${((1 - optFilterTime / baselineFilterTime) * 100).toFixed(2)}% reduction in execution time)`);
