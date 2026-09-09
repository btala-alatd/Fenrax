import ImageTracer from "imagetracerjs";
import { dataUrlToBlob, toPngDataUrl } from "@/lib/image-file";
import { saveBlob } from "@/lib/save-to";
import { prepareArt, printifyPreset } from "@/lib/printify";
import type { ProductId } from "@/lib/studio-data";

const MAX_TRACE = 2200;
const CHROMA = { r: 127, g: 0, b: 255, a: 255 };

type Swatch = { r: number; g: number; b: number; a: number };

function hexSwatch(hex: string): Swatch {
  const raw = hex.replace("#", "").trim();
  const n = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  return {
    r: Number.parseInt(n.slice(0, 2), 16) || 0,
    g: Number.parseInt(n.slice(2, 4), 16) || 0,
    b: Number.parseInt(n.slice(4, 6), 16) || 0,
    a: 255,
  };
}

function uniqueSwatches(pal: Swatch[]) {
  const out: Swatch[] = [];
  for (const swatch of pal) {
    if (
      out.some(
        (item) =>
          Math.abs(item.r - swatch.r) +
            Math.abs(item.g - swatch.g) +
            Math.abs(item.b - swatch.b) <
          18,
      )
    ) {
      continue;
    }
    out.push(swatch);
  }
  return out;
}

function samplePalette(imageData: ImageData, max = 6): Swatch[] {
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] < 16) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r === CHROMA.r && g === CHROMA.g && b === CHROMA.b) continue;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const hit = buckets.get(key);
    if (hit) hit.count += 1;
    else buckets.set(key, { count: 1, r, g, b });
  }
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, max)
    .map((item) => ({ r: item.r, g: item.g, b: item.b, a: 255 }));
}

function nearest(r: number, g: number, b: number, pal: Swatch[]) {
  let best = pal[0];
  let bestD = Infinity;
  for (const swatch of pal) {
    const dr = r - swatch.r;
    const dg = g - swatch.g;
    const db = b - swatch.b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) {
      bestD = d;
      best = swatch;
    }
  }
  return best;
}

function posterize(imageData: ImageData, pal: Swatch[]) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) {
      data[i] = CHROMA.r;
      data[i + 1] = CHROMA.g;
      data[i + 2] = CHROMA.b;
      data[i + 3] = 255;
      continue;
    }
    const swatch = nearest(data[i], data[i + 1], data[i + 2], pal);
    data[i] = swatch.r;
    data[i + 1] = swatch.g;
    data[i + 2] = swatch.b;
    data[i + 3] = 255;
  }
  return imageData;
}

function stripChroma(svg: string) {
  return svg
    .replace(/<path[^>]*fill="rgb\(\s*127\s*,\s*0\s*,\s*255\s*\)"[^>]*\/?>(?:<\/path>)?/gi, "")
    .replace(/<path[^>]*fill="#7f00ff"[^>]*\/?>(?:<\/path>)?/gi, "")
    .replace(/<polygon[^>]*fill="rgb\(\s*127\s*,\s*0\s*,\s*255\s*\)"[^>]*\/?>(?:<\/polygon>)?/gi, "");
}

export async function downloadPng(dataUrl: string, filename: string) {
  const png = await toPngDataUrl(dataUrl);
  await saveBlob(dataUrlToBlob(png), filename);
}

export async function rasterToSvg(
  dataUrl: string,
  colors: string[] = [],
  productId?: ProductId,
  tight = false,
): Promise<string> {
  const art = await prepareArt(dataUrl);
  return rasterToSvgFromArt(art, colors, productId, tight);
}

export async function rasterToSvgFromArt(
  art: HTMLCanvasElement,
  colors: string[] = [],
  productId?: ProductId,
  tight = false,
): Promise<string> {
  const srcW = art.width;
  const srcH = art.height;
  const scale = Math.min(1, MAX_TRACE / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not trace SVG.");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(art, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);

  const pal: Swatch[] = uniqueSwatches([
    ...samplePalette(imageData, 6),
    hexSwatch("#111111"),
    hexSwatch("#f4efe6"),
    hexSwatch("#ffffff"),
    ...colors.filter(Boolean).map(hexSwatch),
    CHROMA,
  ]);
  posterize(imageData, pal);

  const svg = ImageTracer.imagedataToSVG(imageData, {
    pal,
    numberofcolors: pal.length,
    colorquantcycles: 1,
    colorsampling: 0,
    pathomit: 1,
    ltres: 0.2,
    qtres: 0.2,
    strokewidth: 0,
    blurradius: 0,
    linefilter: true,
    rightangleenhance: true,
    roundcoords: 1,
    viewbox: true,
    scale: 1,
    layering: 0,
  });

  if (!svg || (!svg.includes("<path") && !svg.includes("<polygon"))) {
    throw new Error("Could not build a vector from that graphic.");
  }

  const inner = stripChroma(svg)
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");

  if (tight) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${srcW}" height="${srcH}" viewBox="0 0 ${width} ${height}" fill="none">${inner}</svg>`;
  }

  const preset = productId ? printifyPreset(productId) : null;
  const outW = preset?.width ?? srcW;
  const outH = preset?.height ?? srcH;
  const pad = 0.08;
  const innerW = outW * (1 - pad * 2);
  const innerH = outH * (1 - pad * 2);
  const fit = Math.min(innerW / width, innerH / height);
  const dw = width * fit;
  const dh = height * fit;
  const dx = (outW - dw) / 2;
  const dy = (outH - dh) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}" viewBox="0 0 ${outW} ${outH}" fill="none"><g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${fit.toFixed(4)})">${inner}</g></svg>`;
}

export async function downloadSvg(
  dataUrl: string,
  filename: string,
  colors: string[] = [],
  productId?: ProductId,
  tight = false,
) {
  const svg = await rasterToSvg(dataUrl, colors, productId, tight);
  await saveBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), filename);
}

export function fileStem(id: string, slug = "print") {
  return `${slug}-${id.slice(0, 8)}`;
}
