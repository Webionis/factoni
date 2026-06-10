/**
 * Génère favicons, icônes PWA et assets d'installation à partir de public/brand/factoni-icon.png.
 *
 * Usage:
 *   npm run generate:favicons
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import toIco from "to-ico";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "public", "brand", "factoni-icon.png");
const APP_DIR = path.join(ROOT, "app");
const PUBLIC_DIR = path.join(ROOT, "public");
const ICONS_DIR = path.join(PUBLIC_DIR, "icons");

const PWA_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };

const PNG_SIZES = [
  { size: 32, name: "icon-32.png" },
  { size: 64, name: "icon-64.png" },
  { size: 180, name: "icon-180.png" },
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
];

const ICO_SIZES = [16, 32, 48];

/** Icône sur fond blanc — meilleur rendu écran d'accueil / splash. */
async function renderOnBackground(size, iconScale = 0.82) {
  const iconSize = Math.round(size * iconScale);
  const icon = await sharp(SOURCE)
    .resize(iconSize, iconSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const offset = Math.round((size - iconSize) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: PWA_BACKGROUND,
    },
  })
    .composite([{ input: icon, left: offset, top: offset }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function resizeIconTransparent(size) {
  return sharp(SOURCE)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/** Maskable Android — zone sûre ~60 % au centre sur fond blanc. */
async function renderMaskableIcon(size) {
  return renderOnBackground(size, 0.58);
}

async function main() {
  await fs.mkdir(ICONS_DIR, { recursive: true });

  for (const { size, name } of PNG_SIZES) {
    const out = path.join(ICONS_DIR, name);
    const useBackground = size >= 180;
    const buffer = useBackground
      ? await renderOnBackground(size)
      : await resizeIconTransparent(size);

    await fs.writeFile(out, buffer);
    console.log(`✓ ${path.relative(ROOT, out)} (${size}×${size})`);
  }

  const maskable512 = await renderMaskableIcon(512);
  await fs.writeFile(path.join(ICONS_DIR, "icon-512-maskable.png"), maskable512);
  console.log("✓ public/icons/icon-512-maskable.png (512×512 maskable)");

  const icon32 = await resizeIconTransparent(32);
  const icon180 = await renderOnBackground(180);
  const icon512 = await renderOnBackground(512);

  await fs.writeFile(path.join(APP_DIR, "icon.png"), icon32);
  console.log("✓ app/icon.png (32×32)");

  await fs.writeFile(path.join(APP_DIR, "apple-icon.png"), icon180);
  console.log("✓ app/apple-icon.png (180×180)");

  await fs.writeFile(path.join(PUBLIC_DIR, "apple-touch-icon.png"), icon180);
  console.log("✓ public/apple-touch-icon.png (180×180)");

  const icoBuffers = await Promise.all(ICO_SIZES.map((s) => resizeIconTransparent(s)));
  const ico = await toIco(icoBuffers);
  await fs.writeFile(path.join(APP_DIR, "favicon.ico"), ico);
  await fs.writeFile(path.join(PUBLIC_DIR, "favicon.ico"), ico);
  console.log(`✓ app/favicon.ico + public/favicon.ico (${ICO_SIZES.join(", ")}px)`);

  await fs.copyFile(path.join(ICONS_DIR, "icon-512.png"), path.join(ICONS_DIR, "icon.png"));
  console.log("✓ public/icons/icon.png (alias 512×512)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
