const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const pdfPath = 'C:/Users/SpidyOp/Downloads/Website Drafts- PEJ Document .pdf';
const outDir = path.join(__dirname, 'extracted_master_assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const buf = fs.readFileSync(pdfPath);
const str = buf.toString('latin1');

// Extract all images
let imgRegex = /\/Subtype\s*\/Image[\s\S]*?\/Length\s+(\d+)[\s\S]*?stream[\r\n]+/g;
let match;
let imgIndex = 0;

while ((match = imgRegex.exec(str)) !== null) {
  imgIndex++;
  const header = match[0];
  const lengthMatch = header.match(/\/Length\s+(\d+)/);
  const widthMatch = header.match(/\/Width\s+(\d+)/);
  const heightMatch = header.match(/\/Height\s+(\d+)/);
  const filterMatch = header.match(/\/Filter\s*\/([a-zA-Z0-9]+)/);

  const len = lengthMatch ? parseInt(lengthMatch[1]) : 0;
  const width = widthMatch ? parseInt(widthMatch[1]) : 0;
  const height = heightMatch ? parseInt(heightMatch[1]) : 0;
  const filter = filterMatch ? filterMatch[1] : '';

  const streamStart = match.index + header.length;
  const imgStream = buf.subarray(streamStart, streamStart + len);

  console.log(`Image ${imgIndex}: ${width}x${height}, Filter: ${filter}, Size: ${imgStream.length}`);

  if (filter === 'DCTDecode') {
    const outPath = path.join(outDir, `master_img_${imgIndex}_${width}x${height}.jpg`);
    fs.writeFileSync(outPath, imgStream);
  } else if (filter === 'FlateDecode') {
    try {
      const decompressed = zlib.inflateSync(imgStream);
      // If RGB
      if (decompressed.length === width * height * 3) {
        // save as PNG
        const pngBuf = createPng(width, height, decompressed);
        const outPath = path.join(outDir, `master_img_${imgIndex}_${width}x${height}.png`);
        fs.writeFileSync(outPath, pngBuf);
      } else {
        console.log(`FlateDecode size mismatch: ${decompressed.length} vs ${width * height * 3}`);
      }
    } catch (e) {
      console.log(`FlateDecode error for image ${imgIndex}:`, e.message);
    }
  }
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function createPng(width, height, rgbData) {
  const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rawScanlines = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawScanlines[rowStart] = 0;
    rgbData.copy(rawScanlines, rowStart + 1, y * width * 3, (y + 1) * width * 3);
  }

  const compressedIdat = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk('IDAT', compressedIdat);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
}
