import ImageTracer from "imagetracerjs";
import { dataUrlToBlob, toPngDataUrl } from "@/lib/image-file";
import { saveBlob } from "@/lib/save-to";
import { prepareArt, printifyPreset } from "@/lib/printify";
import type { ProductId } from "@/lib/studio-data";

const TRACE_EDGE = 1800;
const MAX_INK = 6;

type Swatch = { r: number; g: number; b: number; a: number };

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

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

function colorKey(r: number, g: number, b: number) {
  return (r << 16) | (g << 8) | b;
}

function uniqueSwatches(pal: Swatch[], minDelta = 12) {
  const out: Swatch[] = [];
  for (const swatch of pal) {
    if (
      out.some(
        (item) =>
          Math.abs(item.r - swatch.r) +
            Math.abs(item.g - swatch.g) +
            Math.abs(item.b - swatch.b) <
          minDelta,
      )
    ) {
      continue;
    }
    out.push(swatch);
  }
  return out;
}

function collectPixels(imageData: ImageData) {
  const { data } = imageData;
  const pixels: Swatch[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue;
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: 255 });
  }
  return pixels;
}

function channelRange(pixels: Swatch[], channel: "r" | "g" | "b") {
  let min = 255;
  let max = 0;
  for (const pixel of pixels) {
    const v = pixel[channel];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return max - min;
}

function averageSwatch(pixels: Swatch[]): Swatch {
  if (!pixels.length) return { r: 0, g: 0, b: 0, a: 255 };
  let r = 0;
  let g = 0;
  let b = 0;
  for (const pixel of pixels) {
    r += pixel.r;
    g += pixel.g;
    b += pixel.b;
  }
  const n = pixels.length;
  return { r: clampByte(r / n), g: clampByte(g / n), b: clampByte(b / n), a: 255 };
}

function medianCut(pixels: Swatch[], target: number): Swatch[] {
  if (!pixels.length) return [{ r: 17, g: 17, b: 17, a: 255 }];
  const buckets: Swatch[][] = [pixels.slice()];
  while (buckets.length < target) {
    let widest = 0;
    let range = -1;
    for (let i = 0; i < buckets.length; i += 1) {
      const bucket = buckets[i]!;
      if (bucket.length < 2) continue;
      const span = Math.max(
        channelRange(bucket, "r"),
        channelRange(bucket, "g"),
        channelRange(bucket, "b"),
      );
      if (span > range) {
        range = span;
        widest = i;
      }
    }
    if (range <= 8) break;
    const bucket = buckets[widest]!;
    const channel =
      channelRange(bucket, "r") >= channelRange(bucket, "g") &&
      channelRange(bucket, "r") >= channelRange(bucket, "b")
        ? "r"
        : channelRange(bucket, "g") >= channelRange(bucket, "b")
          ? "g"
          : "b";
    bucket.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.max(1, Math.floor(bucket.length / 2));
    buckets.splice(widest, 1, bucket.slice(0, mid), bucket.slice(mid));
  }
  return buckets.map(averageSwatch);
}

function countDistinct(pixels: Swatch[], shift = 3) {
  const keys = new Set<number>();
  for (const pixel of pixels) {
    keys.add(colorKey(pixel.r >> shift, pixel.g >> shift, pixel.b >> shift));
  }
  return keys.size;
}

function luma(swatch: Swatch) {
  return 0.2126 * swatch.r + 0.7152 * swatch.g + 0.0722 * swatch.b;
}

function sat(swatch: Swatch) {
  return Math.max(swatch.r, swatch.g, swatch.b) - Math.min(swatch.r, swatch.g, swatch.b);
}

function isField(swatch: Swatch) {
  return luma(swatch) > 188 && sat(swatch) < 40;
}

function buildPalette(imageData: ImageData, colors: string[]): Swatch[] {
  const pixels = collectPixels(imageData);
  if (!pixels.length) return [{ r: 17, g: 17, b: 17, a: 255 }];

  const distinct = countDistinct(pixels, 4);
  const target = Math.min(MAX_INK, Math.max(3, distinct <= 6 ? distinct : 5));
  const sampled =
    pixels.length > 14000
      ? pixels.filter((_, index) => index % Math.ceil(pixels.length / 14000) === 0)
      : pixels;
  const cut = medianCut(sampled, target).filter((swatch) => !isField(swatch));
  const brand = colors.filter(Boolean).map(hexSwatch);
  const presentBrand = brand.filter((swatch) => {
    if (isField(swatch)) return false;
    return pixels.some(
      (pixel) =>
        Math.abs(pixel.r - swatch.r) +
          Math.abs(pixel.g - swatch.g) +
          Math.abs(pixel.b - swatch.b) <
        48,
    );
  });
  const pal = uniqueSwatches([...cut, ...presentBrand], 22).slice(0, MAX_INK);
  return pal.length ? pal : [{ r: 17, g: 17, b: 17, a: 255 }];
}

function despeckle(imageData: ImageData) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const at = (x: number, y: number) => (y * width + x) * 4;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = at(x, y);
      const self = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
      const counts = new Map<number, number>();
      let majority = self;
      let majorityN = 0;
      let selfN = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const j = at(x + dx, y + dy);
          const key = (src[j] << 16) | (src[j + 1] << 8) | src[j + 2];
          const n = (counts.get(key) ?? 0) + 1;
          counts.set(key, n);
          if (key === self) selfN = n;
          if (n > majorityN) {
            majorityN = n;
            majority = key;
          }
        }
      }
      if (selfN <= 1 && majorityN >= 5) {
        data[i] = (majority >> 16) & 255;
        data[i + 1] = (majority >> 8) & 255;
        data[i + 2] = majority & 255;
      }
    }
  }
  return imageData;
}

function unusedChroma(pal: Swatch[]): Swatch {
  const candidates: Swatch[] = [
    { r: 255, g: 0, b: 255, a: 255 },
    { r: 0, g: 255, b: 255, a: 255 },
    { r: 255, g: 0, b: 0, a: 255 },
    { r: 0, g: 255, b: 0, a: 255 },
  ];
  let best = candidates[0]!;
  let bestD = -1;
  for (const candidate of candidates) {
    let min = Infinity;
    for (const swatch of pal) {
      const d =
        (candidate.r - swatch.r) ** 2 +
        (candidate.g - swatch.g) ** 2 +
        (candidate.b - swatch.b) ** 2;
      if (d < min) min = d;
    }
    if (min > bestD) {
      bestD = min;
      best = candidate;
    }
  }
  return best;
}

function nearest(r: number, g: number, b: number, pal: Swatch[]) {
  let best = pal[0]!;
  let bestD = Infinity;
  for (const swatch of pal) {
    const dr = r - swatch.r;
    const dg = g - swatch.g;
    const db = b - swatch.b;
    const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (d < bestD) {
      bestD = d;
      best = swatch;
    }
  }
  return best;
}

function posterize(imageData: ImageData, pal: Swatch[], chroma: Swatch) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) {
      data[i] = chroma.r;
      data[i + 1] = chroma.g;
      data[i + 2] = chroma.b;
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

function rgb(swatch: Swatch) {
  return `rgb\\(\\s*${swatch.r}\\s*,\\s*${swatch.g}\\s*,\\s*${swatch.b}\\s*\\)`;
}

function hexOf(swatch: Swatch) {
  return `#${[swatch.r, swatch.g, swatch.b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function stripChroma(svg: string, chroma: Swatch) {
  const fill = rgb(chroma);
  const hex = hexOf(chroma);
  return svg
    .replace(new RegExp(`<path[^>]*fill="${fill}"[^>]*\\/?>(?:<\\/path>)?`, "gi"), "")
    .replace(new RegExp(`<path[^>]*fill="${hex}"[^>]*\\/?>(?:<\\/path>)?`, "gi"), "")
    .replace(new RegExp(`<polygon[^>]*fill="${fill}"[^>]*\\/?>(?:<\\/polygon>)?`, "gi"), "")
    .replace(new RegExp(`<polygon[^>]*fill="${hex}"[^>]*\\/?>(?:<\\/polygon>)?`, "gi"), "");
}

function stripLightPaper(svg: string) {
  return svg.replace(
    /<path([^>]*)fill="rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)"([^>]*)\/?>(?:<\/path>)?/gi,
    (full, _pre, r, g, b) => {
      const swatch = { r: Number(r), g: Number(g), b: Number(b), a: 255 };
      return isField(swatch) ? "" : full;
    },
  );
}

function dropDust(svg: string) {
  return svg.replace(/<path([^>]*)\sd="([^"]*)"([^>]*)\/?>(?:<\/path>)?/gi, (full, _a, d) => {
    const cmds = d.match(/[MLHVCSQTAZ]/gi)?.length ?? 0;
    return cmds < 6 ? "" : full;
  });
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
  const scale = TRACE_EDGE / Math.max(srcW, srcH);
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not trace SVG.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(art, 0, 0, width, height);
  let imageData = ctx.getImageData(0, 0, width, height);

  const pal = buildPalette(imageData, colors);
  const chroma = unusedChroma(pal);
  posterize(imageData, pal, chroma);
  despeckle(imageData);
  despeckle(imageData);

  const svg = ImageTracer.imagedataToSVG(imageData, {
    pal: [...pal, chroma],
    numberofcolors: pal.length + 1,
    colorquantcycles: 1,
    colorsampling: 0,
    mincolorratio: 0.02,
    pathomit: Math.max(48, Math.round(Math.max(width, height) * 0.04)),
    ltres: 2.4,
    qtres: 2.4,
    strokewidth: 0,
    blurradius: 1,
    blurdelta: 20,
    linefilter: true,
    rightangleenhance: false,
    roundcoords: 1,
    viewbox: true,
    scale: 1,
    layering: 0,
  });

  if (!svg || (!svg.includes("<path") && !svg.includes("<polygon"))) {
    throw new Error("Could not build a vector from that graphic.");
  }

  const inner = dropDust(stripLightPaper(stripChroma(svg, chroma)))
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");

  if (!inner.includes("<path") && !inner.includes("<polygon")) {
    throw new Error("Could not build a vector from that graphic.");
  }

  if (tight) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">${inner}</svg>`;
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
