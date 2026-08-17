const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/logo.png');
const outputPath = path.join(__dirname, '../public/logo.png');

async function removeBackground() {
  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = Buffer.from(data);

  const THRESHOLD = 230; // how "white" counts as background

  function isWhiteLike(idx) {
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const a = pixels[idx + 3];
    return a > 10 && r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD;
  }

  function setTransparent(idx) {
    pixels[idx + 3] = 0;
  }

  function pixelIndex(x, y) {
    return (y * width + x) * channels;
  }

  // Flood fill from all 4 edges using a queue (BFS)
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed from all edge pixels
  for (let x = 0; x < width; x++) {
    queue.push([x, 0]);
    queue.push([x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y]);
    queue.push([width - 1, y]);
  }

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const vIdx = y * width + x;
    if (visited[vIdx]) continue;
    visited[vIdx] = 1;

    const pIdx = pixelIndex(x, y);
    if (!isWhiteLike(pIdx)) continue;

    setTransparent(pIdx);

    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }

  await sharp(pixels, {
    raw: { width, height, channels },
  })
    .png()
    .toFile(outputPath);

  console.log('✅ Background removed with flood-fill. Saved to:', outputPath);
}

removeBackground().catch(console.error);
