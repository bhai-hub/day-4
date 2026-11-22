const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const jpegData = fs.readFileSync('assets/images/ruby-earrings-oxblood.jpg');
const rawImageData = jpeg.decode(jpegData);
console.log('Decoded ruby-earrings-oxblood.jpg:', rawImageData.width, 'x', rawImageData.height);

// Inspect corner color (background color)
const w = rawImageData.width;
const h = rawImageData.height;
const data = rawImageData.data;

// Sample top-left corner (0,0)
const bgR = data[0];
const bgG = data[1];
const bgB = data[2];
console.log(`Background sample: R=${bgR}, G=${bgG}, B=${bgB}`);

// Let's create an alpha-keyed PNG of the entire image where background is transparent
const outPng = new PNG({ width: w, height: h });

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Distance from oxblood background:
    // Background is roughly R=68, G=3, B=5 or similar
    // Jewelry has diamonds (bright white/gray, R>150, G>150, B>150)
    // and rubies (intense red/crimson R>120, G<60, B<70 with higher brightness)
    // Sparkle star has R~100-140, G~50-90, B~50-90
    const colorDist = Math.sqrt(
      Math.pow(r - bgR, 2) +
      Math.pow(g - bgG, 2) * 2 +
      Math.pow(b - bgB, 2) * 2
    );

    let alpha = 255;
    if (colorDist < 18) {
      alpha = 0;
    } else if (colorDist < 35) {
      alpha = Math.round(((colorDist - 18) / (35 - 18)) * 255);
    }

    outPng.data[idx] = r;
    outPng.data[idx + 1] = g;
    outPng.data[idx + 2] = b;
    outPng.data[idx + 3] = alpha;
  }
}

fs.writeFileSync('assets/images/ruby-earrings-transparent.png', PNG.sync.write(outPng));
console.log('Saved assets/images/ruby-earrings-transparent.png');

// Now crop the 3 individual earring components:
// 1. Front pair: x: 80 to 250, y: 120 to 300
// 2. Center tilt: x: 300 to 450, y: 220 to 380
// 3. Profile: x: 500 to 650, y: 70 to 230

function crop(src, x1, y1, x2, y2, outName) {
  const cropW = x2 - x1;
  const cropH = y2 - y1;
  const cropPng = new PNG({ width: cropW, height: cropH });
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((y1 + y) * w + (x1 + x)) * 4;
      const destIdx = (y * cropW + x) * 4;
      cropPng.data[destIdx] = outPng.data[srcIdx];
      cropPng.data[destIdx + 1] = outPng.data[srcIdx + 1];
      cropPng.data[destIdx + 2] = outPng.data[srcIdx + 2];
      cropPng.data[destIdx + 3] = outPng.data[srcIdx + 3];
    }
  }
  fs.writeFileSync('assets/images/' + outName, PNG.sync.write(cropPng));
  console.log(`Saved crop ${outName} (${cropW}x${cropH})`);
}

crop(outPng, 80, 100, 260, 310, 'ruby-angle-front.png');
crop(outPng, 310, 210, 440, 385, 'ruby-angle-tilt.png');
crop(outPng, 520, 75, 650, 235, 'ruby-angle-profile.png');
