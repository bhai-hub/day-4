const fs = require("fs");
const path = require("path");

const pdfPath = "C:/Users/SpidyOp/.gemini/antigravity/brain/19a7125f-77ef-4c6e-880d-55594ec2e0ca/.user_uploaded/media_1795374022403_41a1ab5d.pdf";
const outDir = path.join(__dirname, "extracted_assets");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const buf = fs.readFileSync(pdfPath);
console.log("PDF buffer size:", buf.length);

// Extract JPEGs
let count = 0;
let pos = 0;
while (pos < buf.length - 1) {
  if (buf[pos] === 0xFF && buf[pos+1] === 0xD8 && buf[pos+2] === 0xFF) {
    let endPos = pos + 2;
    while (endPos < buf.length - 1) {
      if (buf[endPos] === 0xFF && buf[endPos+1] === 0xD9) {
        break;
      }
      endPos++;
    }
    if (endPos < buf.length - 1) {
      const imgBuf = buf.subarray(pos, endPos + 2);
      count++;
      const outPath = path.join(outDir, `extracted_img_${count}.jpg`);
      fs.writeFileSync(outPath, imgBuf);
      console.log(`Saved ${outPath} (${imgBuf.length} bytes)`);
      pos = endPos + 2;
      continue;
    }
  }
  pos++;
}

// Extract PNGs
let pngCount = 0;
pos = 0;
const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const pngEnd = Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

while (pos < buf.length - 8) {
  if (buf.subarray(pos, pos + 8).equals(pngHeader)) {
    let endPos = pos + 8;
    while (endPos < buf.length - 8) {
      if (buf.subarray(endPos, endPos + 8).equals(pngEnd)) {
        break;
      }
      endPos++;
    }
    if (endPos < buf.length - 8) {
      const imgBuf = buf.subarray(pos, endPos + 8);
      pngCount++;
      const outPath = path.join(outDir, `extracted_img_${pngCount}.png`);
      fs.writeFileSync(outPath, imgBuf);
      console.log(`Saved ${outPath} (${imgBuf.length} bytes)`);
      pos = endPos + 8;
      continue;
    }
  }
  pos++;
}

console.log(`Finished extraction: ${count} JPEGs, ${pngCount} PNGs`);
