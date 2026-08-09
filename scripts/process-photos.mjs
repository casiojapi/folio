#!/usr/bin/env node
// Reads full-res photos from photos-source/, writes compressed web versions to
// public/photos/, and (re)builds data/photos.json. Safe to re-run: hand-edited
// fields (title, location, description, order, featured) are preserved.

import { readdir, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import exifr from "exifr";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_DIR = path.join(ROOT, "photos-source");
const OUTPUT_DIR = path.join(ROOT, "public", "photos");
const MANIFEST_PATH = path.join(ROOT, "data", "photos.json");

const MAX_DIMENSION = 2400;
const QUALITY = 82;
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);

function slugify(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatShutterSpeed(exposureTime) {
  if (!exposureTime) return null;
  if (exposureTime >= 1) return `${exposureTime}s`;
  return `1/${Math.round(1 / exposureTime)}s`;
}

async function extractExif(filePath) {
  try {
    const exif = await exifr.parse(filePath, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
        "CreateDate",
      ],
    });
    if (!exif) return {};
    const camera = [exif.Make, exif.Model].filter(Boolean).join(" ").trim() || null;
    return {
      camera: camera || null,
      lens: exif.LensModel || null,
      focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : null,
      aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
      shutterSpeed: formatShutterSpeed(exif.ExposureTime),
      iso: exif.ISO ? `ISO ${exif.ISO}` : null,
      takenAt: (exif.DateTimeOriginal || exif.CreateDate || null)?.toISOString?.() ?? null,
    };
  } catch {
    return {};
  }
}

async function generateBlurDataURL(pipeline) {
  const buffer = await pipeline
    .clone()
    .resize(20)
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString("base64")}`;
}

async function loadExistingManifest() {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return new Map(parsed.map((entry) => [entry.slug, entry]));
  } catch {
    return new Map();
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });

  const existing = await loadExistingManifest();
  const files = (await readdir(SOURCE_DIR)).filter((f) =>
    EXTENSIONS.has(path.extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log(`No source photos found in ${SOURCE_DIR}. Drop images there and re-run.`);
    return;
  }

  const results = [];

  for (const file of files) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const slug = slugify(file);
    const outputFile = `${slug}.webp`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    const image = sharp(sourcePath).rotate();
    const metadata = await image.metadata();

    const resized = image.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

    const [blurDataURL, outputInfo] = await Promise.all([
      generateBlurDataURL(sharp(sourcePath).rotate()),
      resized.webp({ quality: QUALITY }).toFile(outputPath),
    ]);

    const exif = await extractExif(sourcePath);
    const prior = existing.get(slug) ?? {};
    const sourceStat = await stat(sourcePath);

    results.push({
      slug,
      src: `/photos/${outputFile}`,
      width: outputInfo.width,
      height: outputInfo.height,
      blurDataURL,
      title: prior.title ?? "",
      description: prior.description ?? "",
      location: prior.location ?? "",
      order: prior.order ?? null,
      featured: prior.featured ?? false,
      ...exif,
      takenAt: exif.takenAt ?? prior.takenAt ?? sourceStat.mtime.toISOString(),
      originalWidth: metadata.width ?? null,
      originalHeight: metadata.height ?? null,
    });

    console.log(`processed ${file} -> ${outputFile} (${outputInfo.size} bytes)`);
  }

  results.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
  });

  await writeFile(MANIFEST_PATH, JSON.stringify(results, null, 2) + "\n");
  console.log(`\nWrote ${results.length} photos to ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
