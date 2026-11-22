const fs = require('fs');
const { PNG } = require('pngjs');

const img = PNG.sync.read(fs.readFileSync('assets/images/model-physician-vogue.png'));
const w = img.width;
const h = img.height;

// Mask array: 1 = model, 0 = background
const mask = new Uint8Array(w * h);

// Let's inspect the boundaries row by row
for (let y = 0; y < h; y++) {
  // 1. Find left edge of model
  let leftEdge = -1;

  if (y < 115) {
    // Above bun - entirely background
    leftEdge = -1;
  } else if (y < 340) {
    // Bun & upper hair: hair is dark (r < 80, g < 80, b < 80), background is beige (r > 120, g > 100)
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const b = img.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // When it transitions from beige background (brightness > 110) to dark hair (brightness < 75)
      if (x > 380 && brightness < 80) {
        leftEdge = x;
        break;
      }
    }
  } else if (y < 520) {
    // Hair, ear, earring:
    // Left background is beige (brightness > 120, r > 130).
    // Hair or earring starts around x ~ 400..440
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const b = img.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Detect transition: hair is dark (brightness < 60), or pearl earring (bright white with silver [180..240])
      // Notice background at x=380..420 is beige [140, 125, 100], and hair is [20, 20, 20]
      if (x > 360 && (brightness < 85 || (x > 420 && brightness > 160 && b > 140))) {
        leftEdge = x;
        break;
      }
    }
  } else {
    // White lab coat on left:
    // At y=520..1152:
    // At x < 100..380: background is beige [170..210, 150..190, 125..160] (r > g + 15, r > b + 30).
    // White coat starts: coat has blue-gray cast [130..230, 130..230, 135..235] (b is close to r or b > r - 5!)
    // Notice in sample at y=800:
    // x=160: [183, 167, 144] -> r=183, b=144 (r - b = 39, beige background!)
    // x=200: [61, 62, 56] -> dark collar/seam line!
    // x=240: [119, 116, 109]
    // x=320: [173, 172, 177] -> r=173, b=177 (b > r, white coat!)
    // So coat begins at the dark edge or where r - b < 18!
    for (let x = 50; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const b = img.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Dark edge line or white fabric (b > r - 12 or brightness < 80)
      if (brightness < 85 || (r - b < 15 && brightness > 90) || (x > 100 && b > r - 5)) {
        leftEdge = x;
        break;
      }
    }
  }

  // 2. Find right edge of model
  let rightEdge = -1;

  if (y < 115) {
    rightEdge = -1;
  } else if (y < 340) {
    // Bun / head right edge:
    // Scan backwards from x = 850 down to 500
    for (let x = 850; x >= 450; x--) {
      const idx = (y * w + x) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const b = img.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Dark background on right is [30, 30, 30] to [40, 40, 40]
      // Hair starts when brightness rises or texture changes (r > 48 || g > 48 || b > 45)
      if (r > 48 || g > 48 || b > 45) {
        rightEdge = x;
        break;
      }
    }
  } else if (y < 620) {
    // Face / skin on right:
    // Scan backwards from x = 880 down to 500
    for (let x = 880; x >= 500; x--) {
      const idx = (y * w + x) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const b = img.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Skin is warm peach: r > 75, r > b + 15
      if ((r > 60 && r > b + 12) || brightness > 60) {
        rightEdge = x;
        break;
      }
    }
  } else {
    // Front white coat / chest on right:
    // Scan backwards from x = 750 down to 450
    for (let x = 750; x >= 450; x--) {
      const idx = (y * w + x) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const b = img.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // White coat: brightness > 75
      if (brightness > 65 || (r > 58 && b > 50)) {
        rightEdge = x;
        break;
      }
    }
  }

  if (leftEdge !== -1 && rightEdge !== -1 && rightEdge > leftEdge) {
    for (let x = leftEdge; x <= rightEdge; x++) {
      mask[y * w + x] = 1;
    }
  }
}

// Generate the isolated PNG with anti-aliased feathering on edges
const outPng = new PNG({ width: w, height: h });

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    const pIdx = idx * 4;

    if (mask[idx] === 1) {
      // Check distance to boundary for soft anti-aliased edge
      let isEdge = false;
      const nbs = [[x+1,y],[x-1,y],[x,y+1],[x,y-1],[x+2,y],[x-2,y]];
      for (const [nx, ny] of nbs) {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h || mask[ny * w + nx] === 0) {
          isEdge = true;
          break;
        }
      }

      outPng.data[pIdx] = img.data[pIdx];
      outPng.data[pIdx + 1] = img.data[pIdx + 1];
      outPng.data[pIdx + 2] = img.data[pIdx + 2];
      outPng.data[pIdx + 3] = isEdge ? 180 : 255;
    } else {
      outPng.data[pIdx] = 0;
      outPng.data[pIdx + 1] = 0;
      outPng.data[pIdx + 2] = 0;
      outPng.data[pIdx + 3] = 0;
    }
  }
}

const outPath = 'assets/images/model-physician-cutout.png';
fs.writeFileSync(outPath, PNG.sync.write(outPng));
console.log('Saved isolated model cutout to:', outPath);
