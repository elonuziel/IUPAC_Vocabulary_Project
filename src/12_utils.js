/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Utilities & Animations
   ──────────────────────────────────────────────────────────────── */

async function copyToClipboard(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg || `Copied to clipboard: "${text}"`);
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    showToast("Failed to copy! Please select and copy manually.");
  }
}

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add("show");

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height * 0.45,
    vx: (Math.random() - 0.5) * 7,
    vy: -(Math.random() * 6 + 3),
    color: [
      "#6366f1",
      "#a78bfa",
      "#38bdf8",
      "#f59e0b",
      "#22c55e",
      "#f472b6"
    ][Math.floor(Math.random() * 6)],
    size: Math.random() * 5 + 3,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 10
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy + frame * 0.08;
      p.vy += 0.18;
      p.rot += p.rotV;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / 55);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();
    });
    frame++;
    if (frame < 60) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}
