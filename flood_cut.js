const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const jpegData = fs.readFileSync('assets/images/ruby-earrings-oxblood.jpg');
const raw = jpeg.decode(jpegData);
const w = raw.width;
const h = raw.height;
const data = raw.data;

// Flood fill from (0,0) to find all connected background pixels
const isBg = new Uint8Array(w * h);
const queue = [0, 0, w - 1, 0, 0, h - 1, w - 1, h - 1]; // start from all 4 corners
isBg[0] = 1;
isBg[w - 1] = 1;
isBg[(h - 1) * w] = 1;
isBg[(h - 1) * w + (w - 1)] = 1;

function isOxbloodBg(r, g, b) {
  // Oxblood background has:
  // r is between 40 and 75
  // g is between 0 and 15
  // b is between 0 and 15
  // and r is dominant over g and b by at least 35
  return (r >= 30 && r <= 85 && g <= 25 && b <= 25);
}

// Queue-based flood fill
let head = 0;
while (head < queue.length) {
  const cx = queue[head++];
  const cy = queue[head++];

  const neighbors = [
    [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
      const idx = ny * w + nx;
      if (!isBg[idx]) {
        const pIdx = idx * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];
        if (isOxbloodBg(r, g, b)) {
          isBg[idx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
}

console.log('Background flood filled pixels:', queue.length / 2);

// Create transparent PNG with anti-aliasing on edges
const outPng = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    const pIdx = idx * 4;
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];

    if (isBg[idx]) {
      // Check if neighboring non-bg pixel for soft edge
      let hasJewelNeighbor = false;
      const nbs = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
      for (const [nx, ny] of nbs) {
        if (nx>=0 && nx<w && ny>=0 && ny<h && !isBg[ny*w+nx]) {
          hasJewelNeighbor = true;
          break;
        }
      }
      if (hasJewelNeighbor) {
        outPng.data[pIdx] = r;
        outPng.data[pIdx + 1] = g;
        outPng.data[pIdx + 2] = b;
        outPng.data[pIdx + 3] = 90; // gentle feather
      } else {
        outPng.data[pIdx] = 0;
        outPng.data[pIdx + 1] = 0;
        outPng.data[pIdx + 2] = 0;
        outPng.data[pIdx + 3] = 0;
      }
    } else {
      outPng.data[pIdx] = r;
      outPng.data[pIdx + 1] = g;
      outPng.data[pIdx + 2] = b;
      outPng.data[pIdx + 3] = 255;
    }
  }
}

fs.writeFileSync('assets/images/ruby-earrings-transparent.png', PNG.sync.write(outPng));
console.log('Regenerated assets/images/ruby-earrings-transparent.png with flood fill');

// Re-crop individual pieces
function cropWithPadding(minX, maxX, minY, maxY, pad, outName) {
  const x1 = Math.max(0, minX - pad);
  const x2 = Math.min(w, maxX + pad);
  const y1 = Math.max(0, minY - pad);
  const y2 = Math.min(h, maxY + pad);
  const cw = x2 - x1;
  const ch = y2 - y1;

  const out = new PNG({ width: cw, height: ch });
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const srcIdx = ((y1 + y) * w + (x1 + x)) * 4;
      const destIdx = (y * cw + x) * 4;
      out.data[destIdx] = outPng.data[srcIdx];
      out.data[destIdx + 1] = outPng.data[srcIdx + 1];
      out.data[destIdx + 2] = outPng.data[srcIdx + 2];
      out.data[destIdx + 3] = outPng.data[srcIdx + 3];
    }
  }
  fs.writeFileSync('assets/images/' + outName, PNG.sync.write(out));
  console.log(`Saved ${outName} (${cw}x${ch})`);
}

cropWithPadding(100, 233, 56, 206, 12, 'ruby-angle-front-pair.png');
cropWithPadding(154, 233, 56, 135, 10, 'ruby-angle-front-single.png');
cropWithPadding(323, 413, 188, 289, 12, 'ruby-angle-tilt.png');
cropWithPadding(543, 631, 66, 167, 12, 'ruby-angle-profile.png');
cropWithPadding(662, 689, 331, 357, 6, 'star-sparkle.png');
