/**
 * Prépare les assets logo Factoni pour l'intégration web.
 *
 * Variante black : recadre + retire uniquement le fond #000 (texte/checkmark conservés).
 * Variante white : recadre + retire le fond noir (asset mode sombre).
 *
 * Usage:
 *   node scripts/process-brand-logos.mjs
 *   node scripts/process-brand-logos.mjs --black-only /chemin/vers/nouveau-logo.png
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const BRAND_DIR = path.join(ROOT, "public", "brand");
const SOURCE_DIR = path.join(BRAND_DIR, "source");

const blackOnly = process.argv.includes("--black-only");
const blackInputArg = process.argv.find((arg) => arg.endsWith(".png"));

async function trimLogo(inputPath) {
  return sharp(inputPath).trim({ threshold: 12 }).png();
}

async function removePureBlackBackground(inputPath, outputPath) {
  const trimmed = await trimLogo(inputPath);
  const { data, info } = await trimmed
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Fond d'export #000 uniquement — le texte/checkmark (gris très foncé) reste opaque.
    if (r === 0 && g === 0 && b === 0) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  return { width, height };
}

async function removeDarkBackground(inputPath, outputPath) {
  const trimmed = await trimLogo(inputPath);
  const { data, info } = await trimmed
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r < 28 && g < 28 && b < 28) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  return { width, height };
}

async function main() {
  await fs.mkdir(SOURCE_DIR, { recursive: true });

  const blackSrc = path.join(SOURCE_DIR, "factoni-logo-black-source.png");
  const whiteSrc = path.join(SOURCE_DIR, "factoni-logo-white-source.png");
  const blackOut = path.join(BRAND_DIR, "factoni-logo-black.png");
  const whiteOut = path.join(BRAND_DIR, "factoni-logo-white.png");

  if (blackInputArg) {
    await fs.copyFile(blackInputArg, blackSrc);
    console.log("Source black mise à jour:", blackInputArg);
  }

  const hasBlackSource = await fs
    .access(blackSrc)
    .then(() => true)
    .catch(() => false);

  if (!hasBlackSource) {
    throw new Error(
      `Source black introuvable. Fournir un PNG via --black-only ou placer le fichier dans ${blackSrc}`,
    );
  }

  const blackDims = await removePureBlackBackground(blackSrc, blackOut);
  console.log("Logo black (fond clair):", blackDims);

  if (!blackOnly) {
    const hasWhiteSource = await fs
      .access(whiteSrc)
      .then(() => true)
      .catch(() => false);

    if (!hasWhiteSource) {
      await fs.copyFile(whiteOut, whiteSrc);
    }

    const whiteDims = await removeDarkBackground(whiteSrc, whiteOut);
    console.log("Logo white (fond sombre):", whiteDims);
  } else {
    console.log("Logo white inchangé.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
