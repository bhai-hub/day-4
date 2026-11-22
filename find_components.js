const fs = require('fs');
const { PNG } = require('pngjs');

const png = PNG.sync.read(fs.readFileSync('assets/images/ruby-earrings-transparent.png'));
const w = png.width;
const h = png.height;

// Find bounding boxes of all pixels with alpha > 50
let visited = new Uint8Array(w * h);
let components = [];

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    if (png.data[idx + 3] > 50 && !visited[y * w + x]) {
      // BFS
      let minX = x, maxX = x, minY = y, maxY = y;
      let queue = [x, y];
      visited[y * w + x] = 1;
      let count = 0;

      while (queue.length > 0) {
        const cy = queue.pop();
        const cx = queue.pop();
        count++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nidx = (ny * w + nx) * 4;
            if (!visited[ny * w + nx] && png.data[nidx + 3] > 50) {
              visited[ny * w + nx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }

      if (count > 200) {
        components.push({ minX, maxX, minY, maxY, count });
      }
    }
  }
}

console.log('Components found:', components);
