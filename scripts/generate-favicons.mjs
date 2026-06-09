/**
 * Génère les favicons et icônes PWA à partir de public/brand/factoni-icon.png.
 *
 * Usage:
 *   node scripts/generate-favicons.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import toIco from "to-ico";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "public", "brand", "factoni-icon.png");
const APP_DIR = path.join(ROOT, "app");
const ICONS_DIR = path.join(ROOT, "public", "icons");

const PNG_SIZES = [
  { size: 32, name: "icon-32.png" },
  { size: 64, name: "icon-64.png" },
  { size: 180, name: "icon-180.png" },
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
];

const ICO_SIZES = [16, 32, 48];

async function resizeIcon(size) {
  return sharp(SOURCE)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  await fs.mkdir(ICONS_DIR, { recursive: true });

  for (const { size, name } of PNG_SIZES) {
    const out = path.join(ICONS_DIR, name);
    await sharp(SOURCE)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(out);
    console.log(`✓ ${path.relative(ROOT, out)} (${size}×${size})`);
  }

  const icon32 = await resizeIcon(32);
  const icon180 = await resizeIcon(180);
  const icon512 = await resizeIcon(512);

  await fs.writeFile(path.join(APP_DIR, "icon.png"), icon32);
  console.log("✓ app/icon.png (32×32)");

  await fs.writeFile(path.join(APP_DIR, "apple-icon.png"), icon180);
  console.log("✓ app/apple-icon.png (180×180)");

  const icoBuffers = await Promise.all(ICO_SIZES.map((s) => resizeIcon(s)));
  const ico = await toIco(icoBuffers);
  await fs.writeFile(path.join(APP_DIR, "favicon.ico"), ico);
  console.log(`✓ app/favicon.ico (${ICO_SIZES.join(", ")}px)`);

  await fs.copyFile(path.join(ICONS_DIR, "icon-512.png"), path.join(ICONS_DIR, "icon.png"));
  console.log("✓ public/icons/icon.png (alias 512×512)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
