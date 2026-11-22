const fs = require('fs');
const { PNG } = require('pngjs');

const srcPng = PNG.sync.read(fs.readFileSync('assets/images/ruby-earrings-transparent.png'));
const w = srcPng.width;
const h = srcPng.height;

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
      out.data[destIdx] = srcPng.data[srcIdx];
      out.data[destIdx + 1] = srcPng.data[srcIdx + 1];
      out.data[destIdx + 2] = srcPng.data[srcIdx + 2];
      out.data[destIdx + 3] = srcPng.data[srcIdx + 3];
    }
  }
  fs.writeFileSync('assets/images/' + outName, PNG.sync.write(out));
  console.log(`Saved ${outName} (${cw}x${ch})`);
}

// 1. Both front studs together
cropWithPadding(100, 233, 56, 206, 12, 'ruby-angle-front-pair.png');

// 2. Single front stud
cropWithPadding(154, 233, 56, 135, 10, 'ruby-angle-front-single.png');

// 3. Tilted 45-degree angle
cropWithPadding(323, 413, 188, 289, 12, 'ruby-angle-tilt.png');

// 4. Side profile with clasp
cropWithPadding(543, 631, 66, 167, 12, 'ruby-angle-profile.png');

// 5. Delicate star sparkle
cropWithPadding(662, 689, 331, 357, 6, 'star-sparkle.png');

console.log('All individual ruby pieces extracted perfectly!');
