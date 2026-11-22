const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const buf = fs.readFileSync('C:/Users/SpidyOp/.gemini/antigravity/brain/19a7125f-77ef-4c6e-880d-55594ec2e0ca/.user_uploaded/media_1795374022403_41a1ab5d.pdf');

// Find Image 3 stream
const targetStr = '/Width 928\n/Height 1152';
let pos = buf.indexOf(Buffer.from(targetStr));
if (pos === -1) {
  pos = buf.indexOf(Buffer.from('/Width 928'));
}
console.log('Target pos:', pos);

const streamPos = buf.indexOf(Buffer.from('stream'), pos);
// Stream starts after \r\n or \n
let dataStart = streamPos + 6;
if (buf[dataStart] === 0x0D && buf[dataStart+1] === 0x0A) dataStart += 2;
else if (buf[dataStart] === 0x0A) dataStart += 1;

const streamEnd = buf.indexOf(Buffer.from('endstream'), dataStart);
const rawStream = buf.subarray(dataStart, streamEnd);
console.log('Stream length:', rawStream.length);

const decompressed = zlib.inflateSync(rawStream);
console.log('Decompressed length:', decompressed.length, 'expected:', 928 * 1152 * 3);

const width = 928;
const height = 1152;

// Create BMP file (Windows Bitmap) - simple and 100% lossless
// BMP rows must be multiple of 4 bytes, 928 * 3 = 2784 (multiple of 4: 2784 % 4 = 0, no padding needed!)
const rowSize = width * 3;
const imageSize = rowSize * height;
const fileSize = 54 + imageSize;

const bmpHeader = Buffer.alloc(54);
// BM header
bmpHeader.write('BM', 0);
bmpHeader.writeUInt32LE(fileSize, 2);
bmpHeader.writeUInt32LE(54, 10); // offset to pixel data
// DIB header
bmpHeader.writeUInt32LE(40, 14); // header size
bmpHeader.writeInt32LE(width, 18);
bmpHeader.writeInt32LE(-height, 22); // negative height for top-down bitmap!
bmpHeader.writeUInt16LE(1, 26); // color planes
bmpHeader.writeUInt16LE(24, 28); // 24-bit
bmpHeader.writeUInt32LE(0, 30); // BI_RGB (no compression)
bmpHeader.writeUInt32LE(imageSize, 34);
bmpHeader.writeInt32LE(2835, 38); // 72 DPI
bmpHeader.writeInt32LE(2835, 42); // 72 DPI

// Convert RGB to BGR
const bgrData = Buffer.alloc(imageSize);
for (let i = 0; i < width * height; i++) {
  const r = decompressed[i * 3];
  const g = decompressed[i * 3 + 1];
  const b = decompressed[i * 3 + 2];
  bgrData[i * 3] = b;
  bgrData[i * 3 + 1] = g;
  bgrData[i * 3 + 2] = b; // wait, bgrData[i*3+1] is g, bgrData[i*3+2] is r!
}
// Fix correctly:
for (let i = 0; i < width * height; i++) {
  const r = decompressed[i * 3];
  const g = decompressed[i * 3 + 1];
  const b = decompressed[i * 3 + 2];
  bgrData[i * 3] = b;
  bgrData[i * 3 + 1] = g;
  bgrData[i * 3 + 2] = r;
}

const bmpBuffer = Buffer.concat([bmpHeader, bgrData]);
const outBmpPath = 'C:/Users/SpidyOp/Desktop/cmw/templates/day-4/extracted_assets/model_physician_vogue.bmp';
fs.writeFileSync(outBmpPath, bmpBuffer);
console.log('Saved BMP to:', outBmpPath);

// Also create PNG using zlib
// PNG format:
// 8 bytes PNG signature
// IHDR chunk: 13 bytes (width, height, bitdepth: 8, colortype: 2 (RGB), compression: 0, filter: 0, interlace: 0)
// IDAT chunk: zlib deflated scanlines (each scanline prepended with 0x00 filter byte)
// IEND chunk

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

const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8; // 8 bit
ihdrData[9] = 2; // RGB
ihdrData[10] = 0;
ihdrData[11] = 0;
ihdrData[12] = 0;
const ihdrChunk = makeChunk('IHDR', ihdrData);

// Prepare scanlines: each row has 1 filter byte (0) + 928*3 bytes
const rawScanlines = Buffer.alloc(height * (1 + width * 3));
for (let y = 0; y < height; y++) {
  const rowStart = y * (1 + width * 3);
  rawScanlines[rowStart] = 0; // Filter None
  decompressed.copy(rawScanlines, rowStart + 1, y * width * 3, (y + 1) * width * 3);
}

const compressedIdat = zlib.deflateSync(rawScanlines);
const idatChunk = makeChunk('IDAT', compressedIdat);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const pngBuffer = Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
const outPngPath = 'C:/Users/SpidyOp/Desktop/cmw/templates/day-4/extracted_assets/model_physician_vogue.png';
fs.writeFileSync(outPngPath, pngBuffer);
console.log('Saved PNG to:', outPngPath);
