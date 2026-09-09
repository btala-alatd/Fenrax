import JSZip from "jszip";
import { brandSlug, themeOf, type Brand } from "@/lib/brand";
import { buildEtsyListing } from "@/lib/etsy";
import { dataUrlToBlob } from "@/lib/image-file";
import { saveBlob } from "@/lib/save-to";
import {
  PRINTIFY_CATALOG,
  buildPrintifyFromArt,
  prepareArt,
  toTransparentPng,
} from "@/lib/printify";
import type { Still } from "@/lib/studio-data";

function yieldTick() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

function segment(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "item"
  );
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
}

function stillStem(still: Still, index: number) {
  const n = String(index).padStart(2, "0");
  return `${n}-${segment(still.categoryId)}-${segment(still.productId)}-${still.id.slice(0, 6)}`;
}

function brandReadme(brand: Brand, count: number) {
  const theme = themeOf(brand);
  return [
    `${brand.name} generated images`,
    "",
    "FOLDERS",
    "  images/                 every generated image, numbered",
    "  01-…/image.png          the same file in its SKU folder",
    "  01-…/prompt.txt         what printed it",
    "  brand/                  house sheet",
    "",
    `House: ${brand.name} (${brand.initials})`,
    `Theme: ${theme.label}`,
    `Prints: ${count}`,
  ].join("\n");
}

async function addGeneratedImage(
  zip: JSZip,
  still: Still,
  root: string,
  index: number,
) {
  const stem = stillStem(still, index);
  const png = await toTransparentPng(still.dataUrl, true);
  const blob = dataUrlToBlob(png);
  zip.file(`${root}/images/${stem}.png`, blob, { compression: "STORE" });
  zip.file(`${root}/${stem}/image.png`, blob, { compression: "STORE" });
  zip.file(
    `${root}/${stem}/prompt.txt`,
    [
      still.prompt,
      "",
      `lens ${still.lens}  lead ${still.leadId}  category ${still.categoryId}  style ${still.styleId}  product ${still.productId}${still.anime ? "  anime" : ""}`,
      "",
      still.composedPrompt,
    ].join("\n"),
  );
}

export async function zipGeneratedImages(
  stills: Still[],
  brand: Brand,
  onProgress?: (done: number, total: number) => void,
) {
  if (stills.length === 0) throw new Error("Print something first.");
  const slug = brandSlug(brand);
  const root = `${slug}-images-${stamp()}`;
  const zip = new JSZip();
  zip.file(`${root}/brand/brand.json`, JSON.stringify(brand, null, 2));
  zip.file(`${root}/brand/readme.txt`, brandReadme(brand, stills.length));

  const ordered = stills.slice().reverse();
  let packed = 0;
  for (let i = 0; i < ordered.length; i += 1) {
    onProgress?.(i + 1, ordered.length);
    try {
      await addGeneratedImage(zip, ordered[i], root, i + 1);
      packed += 1;
    } catch {
      zip.file(`${root}/images/${stillStem(ordered[i], i + 1)}-FAILED.txt`, "Could not pack this image.");
    }
    await yieldTick();
  }
  if (packed === 0) throw new Error("Could not pack those images.");

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  await saveBlob(blob, `${root}.zip`);
  return root;
}

async function addPrintifyFolder(
  zip: JSZip,
  still: Still,
  brand: Brand,
  folder: string,
) {
  const printFile = true;
  const art = await prepareArt(still.dataUrl, printFile, printFile);
  await yieldTick();
  const print = await buildPrintifyFromArt(art, still.productId, !printFile);
  await yieldTick();
  const listing = buildEtsyListing(still, brand);
  zip.file(`${folder}/printify/printify.png`, print.blob, { compression: "STORE" });
  zip.file(
    `${folder}/printify/readme.txt`,
    "Upload printify.png in Printify Product Creator.\nTransparent graphic only. Place and size it on the garment.\nDo not upload a shirt photo.\n",
  );
  zip.file(`${folder}/listing/title.txt`, listing.title);
  zip.file(`${folder}/listing/tags.txt`, listing.tags.join("\n"));
  zip.file(`${folder}/listing/description.txt`, listing.description);
  zip.file(`${folder}/listing/category.txt`, listing.category);
  zip.file(
    `${folder}/listing/printify.txt`,
    `${print.preset.label}\n${print.preset.inches} · ${print.preset.width}×${print.preset.height} · ${print.dpi} DPI · ${print.grade}\n${PRINTIFY_CATALOG[print.preset.id]}\n${print.preset.note}\n`,
  );
}

export async function zipPrintifyPack(
  stills: Still[],
  brand: Brand,
  onProgress?: (done: number, total: number) => void,
) {
  if (stills.length === 0) throw new Error("Print something first.");
  const slug = brandSlug(brand);
  const root = `${slug}-printify-${stamp()}`;
  const zip = new JSZip();
  zip.file(`${root}/brand/brand.json`, JSON.stringify(brand, null, 2));
  zip.file(
    `${root}/brand/readme.txt`,
    brandReadme(brand, stills.length) +
      "\n\nUPLOAD printify/printify.png in Product Creator. Transparent graphic only.",
  );

  const ordered = stills.slice().reverse();
  for (let i = 0; i < ordered.length; i += 1) {
    const still = ordered[i];
    onProgress?.(i + 1, ordered.length);
    const folder = `${root}/${stillStem(still, i + 1)}`;
    await addGeneratedImage(zip, still, root, i + 1);
    await addPrintifyFolder(zip, still, brand, folder);
    await yieldTick();
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  await saveBlob(blob, `${root}.zip`);
  return root;
}


