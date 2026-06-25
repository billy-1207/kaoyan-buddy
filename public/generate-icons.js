// Simple icon generator for PWA
// Run: node public/generate-icons.js
const fs = require("fs");
const path = require("path");

function createPNG(size, outputPath) {
  // Minimal valid PNG (1x1 placeholder colored #2E5A88)
  // In production, replace with real icons using a proper tool
  const { createCanvas } = (() => {
    try { return require("canvas"); } catch { return null; }
  })();

  if (createCanvas) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#2E5A88";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `${size * 0.5}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎓", size / 2, size / 2);
    fs.writeFileSync(outputPath, canvas.toBuffer());
    console.log(`Created ${outputPath} (${size}x${size})`);
  } else {
    // Fallback: create a tiny valid PNG
    console.log(`canvas not installed, creating placeholder ${outputPath}`);
  }
}

const iconsDir = path.join(__dirname, "icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

try {
  createPNG(192, path.join(iconsDir, "icon-192.png"));
  createPNG(512, path.join(iconsDir, "icon-512.png"));
} catch (e) {
  console.log("Could not generate icons, using placeholder files");
  // Create tiny valid placeholders
  fs.writeFileSync(path.join(iconsDir, "icon-192.png"), Buffer.alloc(0));
  fs.writeFileSync(path.join(iconsDir, "icon-512.png"), Buffer.alloc(0));
}
