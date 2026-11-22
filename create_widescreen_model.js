const fs = require('fs');
const { PNG } = require('pngjs');

// Load model photo
const modelPng = PNG.sync.read(fs.readFileSync('assets/images/model-physician-vogue.png'));
const mw = modelPng.width; // 928
const mh = modelPng.height; // 1152

// Create 1920x1080 widescreen canvas
const W = 1920;
const H = 1080;
const outPng = new PNG({ width: W, height: H });

// Target background color: warm golden-brown gradient
// Center: #483018, edges: #1c1106
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = (y * W + x) * 4;
    const nx = (x - W / 2) / (W / 2);
    const ny = (y - H / 2) / (H / 2);
    const dist = Math.sqrt(nx * nx + ny * ny);

    // Warm champagne golden-brown ambient gradient
    const t = Math.min(1, Math.max(0, dist / 1.3));
    const r = Math.round(72 * (1 - t) + 26 * t);
    const g = Math.round(48 * (1 - t) + 16 * t);
    const b = Math.round(24 * (1 - t) + 8 * t);

    outPng.data[idx] = r;
    outPng.data[idx + 1] = g;
    outPng.data[idx + 2] = b;
    outPng.data[idx + 3] = 255;
  }
}

// Scale model to fit comfortably in center
// Let height = 980px (almost full height, preserving bun and coat)
const scale = 980 / mh;
const targetW = Math.round(mw * scale); // ~790px
const targetH = 980;
const startX = Math.round((W - targetW) / 2);
const startY = Math.round((H - targetH) / 2) + 20;

for (let dy = 0; dy < targetH; dy++) {
  const sy = Math.min(mh - 1, Math.floor(dy / scale));
  const outY = startY + dy;
  if (outY < 0 || outY >= H) continue;

  for (let dx = 0; dx < targetW; dx++) {
    const sx = Math.min(mw - 1, Math.floor(dx / scale));
    const outX = startX + dx;
    if (outX < 0 || outX >= W) continue;

    const sIdx = (sy * mw + sx) * 4;
    const sr = modelPng.data[sIdx];
    const sg = modelPng.data[sIdx + 1];
    const sb = modelPng.data[sIdx + 2];

    // Calculate edge feathering
    // X feathering at left and right edges
    let alphaX = 1;
    const edgeDistX = Math.min(dx, targetW - 1 - dx);
    if (edgeDistX < 120) {
      alphaX = edgeDistX / 120;
      alphaX = 0.5 - 0.5 * Math.cos(alphaX * Math.PI); // smooth cosine ease
    }

    // Y feathering at bottom edge
    let alphaY = 1;
    const edgeDistY = targetH - 1 - dy;
    if (edgeDistY < 90) {
      alphaY = edgeDistY / 90;
      alphaY = 0.5 - 0.5 * Math.cos(alphaY * Math.PI);
    }

    const alpha = alphaX * alphaY;

    const dIdx = (outY * W + outX) * 4;
    const bgR = outPng.data[dIdx];
    const bgG = outPng.data[dIdx + 1];
    const bgB = outPng.data[dIdx + 2];

    // Blend
    outPng.data[dIdx] = Math.round(sr * alpha + bgR * (1 - alpha));
    outPng.data[dIdx + 1] = Math.round(sg * alpha + bgG * (1 - alpha));
    outPng.data[dIdx + 2] = Math.round(sb * alpha + bgB * (1 - alpha));
  }
}

fs.writeFileSync('assets/images/hero-physician-widescreen.png', PNG.sync.write(outPng));
console.log('Saved seamless assets/images/hero-physician-widescreen.png (1920x1080)!');
