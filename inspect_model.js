const fs = require('fs');
const { PNG } = require('pngjs');

const img = PNG.sync.read(fs.readFileSync('assets/images/model-physician-vogue.png'));
const w = img.width;
const h = img.height;

console.log('Image dimensions:', w, h);

// Let's sample a few horizontal lines across the image
// Line y = 150 (across hair bun)
// Line y = 300 (across head)
// Line y = 450 (across face/eyes/ear)
// Line y = 600 (across chin/neck)
// Line y = 800 (across white coat)
// Line y = 1000 (across lower white coat)

function inspectLine(y) {
  let vals = [];
  for (let x = 0; x < w; x += 40) {
    const idx = (y * w + x) * 4;
    vals.push(`x=${x}:[${img.data[idx]},${img.data[idx+1]},${img.data[idx+2]}]`);
  }
  console.log(`\n--- Y = ${y} ---`);
  console.log(vals.join('  '));
}

inspectLine(150);
inspectLine(300);
inspectLine(450);
inspectLine(600);
inspectLine(800);
inspectLine(1000);
