const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

// Process sapphire ring to create a floating transparent cutout
const saphData = fs.readFileSync('assets/images/ring-sapphire-cerebral.jpg');
const rawSaph = jpeg.decode(saphData);
const sw = rawSaph.width;
const sh = rawSaph.height;
const sdata = rawSaph.data;

const outSaph = new PNG({ width: sw, height: sh });

// Sample corner background of sapphire ring (dark slate/blue black)
// The ring itself is bright silver/platinum, gold caduceus, and luminous blue sapphire
for (let y = 0; y < sh; y++) {
  for (let x = 0; x < sw; x++) {
    const idx = (y * sw + x) * 4;
    const r = sdata[idx];
    const g = sdata[idx + 1];
    const b = sdata[idx + 2];

    // Background is dark blue-black textured surface
    // Ring has high brightness (r>80, g>80, b>80 or strong gold/blue saturation)
    const brightness = (r + g + b) / 3;
    const isGold = (r > 100 && g > 70 && b < 60);
    const isBlueGem = (b > 110 && b > r * 1.3);
    const isSilver = (brightness > 90);

    let alpha = 255;
    if (y > sh * 0.75 && brightness < 50) {
      // Bottom reflection pedestal
      alpha = 0;
    } else if (!isGold && !isBlueGem && !isSilver && brightness < 45) {
      alpha = 0;
    } else if (brightness < 65 && !isBlueGem && !isGold) {
      alpha = Math.round(((brightness - 45) / 20) * 255);
    }

    outSaph.data[idx] = r;
    outSaph.data[idx + 1] = g;
    outSaph.data[idx + 2] = b;
    outSaph.data[idx + 3] = alpha;
  }
}

fs.writeFileSync('assets/images/sapphire-ring-floating.png', PNG.sync.write(outSaph));
console.log('Saved assets/images/sapphire-ring-floating.png');
