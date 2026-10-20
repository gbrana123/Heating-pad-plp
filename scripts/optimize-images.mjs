import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [flatSource, packSource] = process.argv.slice(2);
if (!flatSource || !packSource) {
  throw new Error("Usage: node scripts/optimize-images.mjs <flat-product-image> <packshot-image>");
}

const output = path.resolve("public/images");
await fs.mkdir(output, { recursive: true });

const white = { r: 255, g: 255, b: 255, alpha: 1 };

await sharp(packSource)
  .flatten({ background: white })
  .resize(1400, 1400, { fit: "contain", background: white, kernel: "lanczos3" })
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
  .toFile(path.join(output, "hk-comfort-hero.png"));

await sharp(flatSource)
  .flatten({ background: white })
  .resize(1400, 900, { fit: "contain", background: white, kernel: "lanczos3" })
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
  .toFile(path.join(output, "hk-comfort-flat.png"));

await sharp(packSource)
  .flatten({ background: white })
  .extract({ left: 80, top: 255, width: 720, height: 520 })
  .resize(1400, 1000, { fit: "contain", background: white, kernel: "lanczos3" })
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
  .toFile(path.join(output, "hk-comfort-product.png"));

await sharp(flatSource)
  .flatten({ background: white })
  .extract({ left: 75, top: 55, width: 550, height: 260 })
  .resize(1400, 820, { fit: "cover", position: "centre", kernel: "lanczos3" })
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
  .toFile(path.join(output, "hk-comfort-detail.png"));

console.log(`Optimized four PNG assets in ${output}`);
