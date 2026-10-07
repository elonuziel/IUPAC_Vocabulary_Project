/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Snapshots & Downloads
   ──────────────────────────────────────────────────────────────── */

function downloadSnapshot(viewerInstance, compoundName) {
  if (!viewerInstance) return;
  try {
    const canvas = document.querySelector("#molecule-3d-viewer canvas");
    if (!canvas) {
      showToast("Failed to find 3D canvas.");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl || dataUrl === "data:,") {
      showToast("Failed to capture image.");
      return;
    }
    const base64Data = dataUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/png" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = compoundName.replace(/[^a-zA-Z0-9_-]/g, "_") + "_snapshot.png";
    link.href = objectUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    showToast("Snapshot downloaded!");
  } catch (err) {
    showToast("Failed to download snapshot: " + err.message);
  }
}

function download2dSnapshot() {
  const mol = selectedMoleculeIndex >= 0 ? currentFilteredList[selectedMoleculeIndex] : null;
  const content2d = document.getElementById("molecule-2d-content");
  if (!content2d || !mol) return;

  const viewMode = document.getElementById("selectViewMode").value;
  const svgEl = content2d.querySelector("svg");

  if (viewMode === "condensed" || !svgEl) {
    const text = content2d.textContent.trim();
    if (!text) {
      showToast("Nothing to capture.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = document.documentElement.classList.contains("dark-theme")
      ? "#111827"
      : "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = document.documentElement.classList.contains("dark-theme")
      ? "#f1f5f9"
      : "#1e293b";
    ctx.font = "bold 22px 'Fira Code', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    downloadCanvasAsPng(canvas, mol.original_name + "_" + viewMode);
    return;
  }

  const svgClone = svgEl.cloneNode(true);
  const isDark = document.documentElement.classList.contains("dark-theme");
  const bg = isDark ? "#111827" : "#f9fafb";
  const fg = isDark ? "#f1f5f9" : "#1e293b";

  svgClone.querySelectorAll("[fill='var(--text-primary)']").forEach(el => {
    el.setAttribute("fill", fg);
  });

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", bg);
  svgClone.insertBefore(rect, svgClone.firstChild);

  const svgStr = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const img = new Image();
  const vb = svgEl.getAttribute("viewBox");
  let W = 800,
    H = 600;
  if (vb) {
    const [, , w, h] = vb.split(/\s+/).map(Number);
    W = Math.max(w, 400);
    H = Math.max(h, 300);
  }
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    URL.revokeObjectURL(svgUrl);
    downloadCanvasAsPng(canvas, mol.original_name + "_" + viewMode);
  };
  img.onerror = () => {
    URL.revokeObjectURL(svgUrl);
    showToast("Failed to render SVG.");
  };
  img.src = svgUrl;
}

function downloadCanvasAsPng(canvas, name) {
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "image/png" });
  const objUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = name.replace(/[^a-zA-Z0-9_-]/g, "_") + ".png";
  link.href = objUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objUrl), 100);
  showToast("Snapshot downloaded!");
}
