const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'assets', 'images');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to copy file
function copy(src, destName) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(targetDir, destName));
    console.log(`Copied ${src} -> ${destName}`);
  } else {
    console.warn(`File not found: ${src}`);
  }
}

// 1. Model physician photo (Page 5)
copy(path.join(__dirname, 'extracted_assets', 'model_physician_vogue.png'), 'model-physician-vogue.png');

// 2. Reference hero rippled glass (Page 3)
copy(path.join(__dirname, 'extracted_assets', 'extracted_img_1.jpg'), 'hero-rippled-glass-ref.jpg');

// 3. Reference hero marked up (Page 4)
copy(path.join(__dirname, 'extracted_assets', 'extracted_img_2.jpg'), 'hero-markup-ref.jpg');

// 4. Ruby earrings floating on Oxblood Red (Page 7)
copy(path.join(__dirname, 'extracted_assets', 'extracted_img_3.jpg'), 'ruby-earrings-oxblood.jpg');

// 5. Additional anatomical gemstone jewels from design-3 / day-3
const design3Dir = 'C:/Users/SpidyOp/Desktop/cmw/templates/design-3/assets/images';
copy(path.join(design3Dir, 'ring-ruby-cor-vitalis.jpg'), 'ring-ruby-cor-vitalis.jpg');
copy(path.join(design3Dir, 'ring-sapphire-cerebral.jpg'), 'ring-sapphire-cerebral.jpg');
copy(path.join(design3Dir, 'royal-sapphire.jpg'), 'royal-sapphire.jpg');
copy(path.join(design3Dir, 'piece-3-pearl.jpg'), 'piece-pearl-bone.jpg');
copy(path.join(design3Dir, 'diamond-solitaire.jpg'), 'diamond-solitaire.jpg');
copy(path.join(design3Dir, 'diamond-facets.jpg'), 'diamond-facets.jpg');
copy(path.join(design3Dir, 'cosmic-gold-liquid.jpg'), 'texture-gold-liquid.jpg');
copy(path.join(design3Dir, 'gold-mesh-waves.jpg'), 'texture-gold-nerves.jpg');
copy(path.join(design3Dir, 'hero-surgeon-signet.jpg'), 'hero-surgeon-gold.jpg');
copy(path.join(design3Dir, 'piece-1-gold.jpg'), 'piece-gold-nerve.jpg');

// Day-3 assets
const day3Dir = 'C:/Users/SpidyOp/Desktop/cmw/templates/day-3/assets/images';
copy(path.join(day3Dir, 'atrial-earrings-macro.jpg'), 'atrial-earrings-macro.jpg');
copy(path.join(day3Dir, 'cardio-necklace-macro.jpg'), 'cardio-necklace-macro.jpg');
copy(path.join(day3Dir, 'ecg-solitaire-ring-macro.jpg'), 'ecg-solitaire-ring-macro.jpg');
copy(path.join(day3Dir, 'ring-soft-knot-macro.jpg'), 'ring-soft-knot-macro.jpg');

console.log('All assets prepared in assets/images!');
