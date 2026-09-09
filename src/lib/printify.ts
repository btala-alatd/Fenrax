import { downloadBlob, loadImage } from "@/lib/image-file";
import type { AspectRatioId, ProductId } from "@/lib/studio-data";

const DPI = 300;
const PAD = 0.08;

export type PrintifyPreset = {
  id: ProductId;
  label: string;
  width: number;
  height: number;
  inches: string;
  aspect: AspectRatioId;
  note: string;
};

export const PRINTIFY_PRESETS: Record<ProductId, PrintifyPreset> = {
  tee: {
    id: "tee",
    label: "Tee front",
    width: 4500,
    height: 5400,
    inches: "15×18",
    aspect: "3:4",
    note: "Full-front DTG. Printify working canvas for most tees.",
  },
  back: {
    id: "back",
    label: "Tee / hoodie back",
    width: 4500,
    height: 5400,
    inches: "15×18",
    aspect: "3:4",
    note: "Full-back DTG. Same canvas as the front.",
  },
  chest: {
    id: "chest",
    label: "Left chest",
    width: 1800,
    height: 1800,
    inches: "6×6",
    aspect: "1:1",
    note: "Left-chest / pocket. Thick marks only.",
  },
  long: {
    id: "long",
    label: "Long sleeve front",
    width: 4500,
    height: 5400,
    inches: "15×18",
    aspect: "3:4",
    note: "Long-sleeve front. Same DTG canvas as a tee.",
  },
  tank: {
    id: "tank",
    label: "Tank front",
    width: 3600,
    height: 4800,
    inches: "12×16",
    aspect: "3:4",
    note: "Tank / racerback front print area.",
  },
  hoodie: {
    id: "hoodie",
    label: "Hoodie front",
    width: 4500,
    height: 5400,
    inches: "15×18",
    aspect: "3:4",
    note: "Hoodie front at 300 DPI. Keep art above the pocket.",
  },
  crew: {
    id: "crew",
    label: "Crewneck front",
    width: 4500,
    height: 5400,
    inches: "15×18",
    aspect: "3:4",
    note: "Crewneck / sweatshirt front.",
  },
  tote: {
    id: "tote",
    label: "Tote face",
    width: 4200,
    height: 4800,
    inches: "14×16",
    aspect: "3:4",
    note: "Canvas tote print. Centered, durable fills.",
  },
  hat: {
    id: "hat",
    label: "Cap front",
    width: 1800,
    height: 1200,
    inches: "6×4",
    aspect: "16:9",
    note: "Printed cap panel. For embroidery, keep strokes thick.",
  },
  mug: {
    id: "mug",
    label: "Mug wrap 11oz",
    width: 2700,
    height: 1125,
    inches: "9×3.75",
    aspect: "16:9",
    note: "11oz wrap. Keep important art away from the handle gap.",
  },
  tumbler: {
    id: "tumbler",
    label: "Tumbler wrap 20oz",
    width: 2700,
    height: 2400,
    inches: "9×8",
    aspect: "4:3",
    note: "20oz tumbler wrap. Center the art; edges wrap.",
  },
  sticker: {
    id: "sticker",
    label: "Sticker 6×6",
    width: 1800,
    height: 1800,
    inches: "6×6",
    aspect: "1:1",
    note: "Die-cut sticker. Transparent edge required.",
  },
  poster: {
    id: "poster",
    label: "Poster 12×16",
    width: 3600,
    height: 4800,
    inches: "12×16",
    aspect: "3:4",
    note: "Art print. Printify can scale this to other poster sizes.",
  },
  pillow: {
    id: "pillow",
    label: "Pillow 16×16",
    width: 4800,
    height: 4800,
    inches: "16×16",
    aspect: "1:1",
    note: "Throw pillow face. Square, full-bleed friendly.",
  },
  phone: {
    id: "phone",
    label: "Phone case",
    width: 1800,
    height: 3200,
    inches: "6×10.7",
    aspect: "9:16",
    note: "Phone case. Center the art; camera area is cropped in Product Creator.",
  },
  baby: {
    id: "baby",
    label: "Baby onesie",
    width: 3600,
    height: 4800,
    inches: "12×16",
    aspect: "3:4",
    note: "Baby bodysuit front. Keep the mark simple and thick.",
  },
  canvas: {
    id: "canvas",
    label: "Canvas 16×20",
    width: 4800,
    height: 6000,
    inches: "16×20",
    aspect: "4:5",
    note: "Gallery canvas. Full-bleed friendly.",
  },
  repeat: {
    id: "repeat",
    label: "AOP panel",
    width: 4500,
    height: 5400,
    inches: "15×18",
    aspect: "1:1",
    note: "All-over panel. Tile-safe. Check Product Creator for cut files.",
  },
};

export function printifyPreset(productId: ProductId): PrintifyPreset {
  return PRINTIFY_PRESETS[productId] ?? PRINTIFY_PRESETS.tee;
}

export const PRINTIFY_CATALOG: Record<ProductId, string> = {
  tee: "Bella+Canvas 3001 / Gildan 64000 — large front",
  back: "Tee or hoodie — large back",
  chest: "Left chest / pocket print",
  long: "Long sleeve tee — large front",
  tank: "Unisex tank / racerback — front",
  hoodie: "Gildan 18500 hoodie — front, above pocket",
  crew: "Gildan 18000 crewneck — front",
  tote: "Canvas tote — front face",
  hat: "Printed cap panel / dad hat",
  mug: "11 oz ceramic mug wrap",
  tumbler: "20 oz tumbler wrap",
  sticker: "Kiss-cut / die-cut sticker 6×6",
  poster: "Matte poster 12×16 (scales to other sizes)",
  pillow: "Throw pillow 16×16",
  phone: "Tough / slim phone case",
  baby: "Baby short-sleeve onesie — front",
  canvas: "Gallery canvas 16×20",
  repeat: "All-over print — use Product Creator template",
};

function dist(r: number, g: number, b: number, key: { r: number; g: number; b: number }) {
  const dr = r - key.r;
  const dg = g - key.g;
  const db = b - key.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleBorder(data: Uint8ClampedArray, width: number, height: number) {
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const take = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  };
  for (let x = 0; x < width; x += 2) {
    take(x, 0);
    take(x, 1);
    take(x, height - 1);
    take(x, height - 2);
  }
  for (let y = 0; y < height; y += 2) {
    take(0, y);
    take(1, y);
    take(width - 1, y);
    take(width - 2, y);
  }
  const mid = (arr: number[]) => {
    const sorted = arr.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 240;
  };
  return { r: mid(rs), g: mid(gs), b: mid(bs) };
}

function isMagenta(r: number, g: number, b: number) {
  return Math.min(r, b) - g > 28 && r > 80 && b > 80;
}

function isGreenScreen(r: number, g: number, b: number) {
  return g - Math.max(r, b) > 28 && g > 90;
}

function isChroma(r: number, g: number, b: number) {
  return isMagenta(r, g, b) || isGreenScreen(r, g, b);
}

function isSaturated(r: number, g: number, b: number) {
  return Math.max(r, g, b) - Math.min(r, g, b) > 32;
}

function isTick(r: number, g: number, b: number) {
  if (isChroma(r, g, b)) return false;
  return isSaturated(r, g, b);
}

function pixelLuma(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function floodKnock(
  imageData: ImageData,
  ground: { r: number; g: number; b: number },
  tol: number,
  ignoreTickBelow = -1,
) {
  const { data, width, height } = imageData;
  const n = width * height;
  const marked = new Uint8Array(n);
  const qx = new Int32Array(n);
  const qy = new Int32Array(n);
  let head = 0;
  let tail = 0;

  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (marked[idx]) return;
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = pixelLuma(r, g, b);
    if (l > ignoreTickBelow && isTick(r, g, b)) return;
    if (dist(r, g, b, ground) > tol && !isChroma(r, g, b)) return;
    marked[idx] = 1;
    qx[tail] = x;
    qy[tail] = y;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (head < tail) {
    const x = qx[head];
    const y = qy[head];
    head += 1;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  return marked;
}

function defringe(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  ground: { r: number; g: number; b: number },
  marked: Uint8Array,
) {
  const n = width * height;
  for (let idx = 0; idx < n; idx += 1) {
    if (marked[idx]) continue;
    const x = idx % width;
    const y = (idx / width) | 0;
    const edge =
      (x > 0 && marked[idx - 1]) ||
      (x < width - 1 && marked[idx + 1]) ||
      (y > 0 && marked[idx - width]) ||
      (y < height - 1 && marked[idx + width]);
    if (!edge) continue;
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isTick(r, g, b)) continue;
    const d = dist(r, g, b, ground);
    const t = 38;
    if (d >= t) continue;
    const a = d / t;
    if (a < 0.14) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = Math.max(0, Math.min(255, Math.round((r - (1 - a) * ground.r) / a)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - a) * ground.g) / a)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - a) * ground.b) / a)));
    data[i + 3] = Math.round(a * 255);
  }
}

function despill(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const mag = Math.min(r, b) - g;
    if (mag > 10) {
      data[i] = Math.max(0, r - mag);
      data[i + 2] = Math.max(0, b - mag);
      if (g < 50 && mag > 36) data[i + 3] = 0;
    }
    const green = g - Math.max(r, b);
    if (green > 10) {
      data[i + 1] = Math.max(0, g - green);
      if (green > 36 && Math.max(r, b) < 50) data[i + 3] = 0;
    }
  }
}

function punchFieldHoles(
  imageData: ImageData,
  ground: { r: number; g: number; b: number },
  marked: Uint8Array,
  tol: number,
) {
  const { data } = imageData;
  for (let idx = 0; idx < marked.length; idx += 1) {
    if (marked[idx]) continue;
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isTick(r, g, b)) continue;
    if (isChroma(r, g, b) || dist(r, g, b, ground) <= tol) {
      marked[idx] = 1;
    }
  }
}

function knockOut(imageData: ImageData, holes = true) {
  const { data, width, height } = imageData;
  let trans = 0;
  let borderN = 0;
  const tally = (x: number, y: number) => {
    borderN += 1;
    if (data[(y * width + x) * 4 + 3] < 16) trans += 1;
  };
  for (let x = 0; x < width; x += 2) {
    tally(x, 0);
    tally(x, height - 1);
  }
  for (let y = 0; y < height; y += 2) {
    tally(0, y);
    tally(width - 1, y);
  }
  if (borderN && trans / borderN > 0.55) return imageData;

  const sampled = sampleBorder(data, width, height);
  const luma =
    0.2126 * sampled.r + 0.7152 * sampled.g + 0.0722 * sampled.b;
  const darkField = luma < 48;
  const grounds = darkField
    ? [sampled, { r: 0, g: 0, b: 0 }, { r: 12, g: 12, b: 12 }]
    : [
        sampled,
        { r: 242, g: 243, b: 245 },
        { r: 255, g: 255, b: 255 },
        { r: 232, g: 232, b: 232 },
        { r: 243, g: 234, b: 212 },
      ];
  const tols = darkField ? [20, 32, 44] : [28, 40, 54];
  const ignoreTick = darkField ? 36 : -1;

  let bestMarked: Uint8Array | null = null;
  let bestHits = 0;
  let bestGround = sampled;
  for (const ground of grounds) {
    for (const tol of tols) {
      const marked = floodKnock(imageData, ground, tol, ignoreTick);
      let hits = 0;
      for (let i = 0; i < marked.length; i += 1) hits += marked[i];
      const ratio = hits / marked.length;
      if (ratio < 0.02 || ratio > 0.97) continue;
      if (hits > bestHits) {
        bestHits = hits;
        bestMarked = marked;
        bestGround = ground;
      }
    }
  }

  let marked = bestMarked;
  let ground = bestGround;
  if (!marked) {
    marked = floodKnock(imageData, sampled, darkField ? 36 : 48, darkField ? 36 : -1);
    ground = sampled;
    let hits = 0;
    for (let i = 0; i < marked.length; i += 1) hits += marked[i];
    if (hits < marked.length * 0.02) return imageData;
  }

  if (holes && !darkField) punchFieldHoles(imageData, ground, marked, 30);

  let knocked = 0;
  for (let idx = 0; idx < marked.length; idx += 1) {
    if (!marked[idx]) continue;
    data[idx * 4 + 3] = 0;
    knocked += 1;
  }
  if (knocked < marked.length * 0.02) return imageData;
  defringe(data, width, height, ground, marked);
  despill(data);
  return imageData;
}

type Ink = { r: number; g: number; b: number };

function clampInk(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function inkRange(pixels: Ink[], channel: keyof Ink) {
  let min = 255;
  let max = 0;
  for (const pixel of pixels) {
    const v = pixel[channel];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return max - min;
}

function averageInk(pixels: Ink[]): Ink {
  if (!pixels.length) return { r: 20, g: 20, b: 20 };
  let r = 0;
  let g = 0;
  let b = 0;
  for (const pixel of pixels) {
    r += pixel.r;
    g += pixel.g;
    b += pixel.b;
  }
  const n = pixels.length;
  return { r: clampInk(r / n), g: clampInk(g / n), b: clampInk(b / n) };
}

function cutInks(pixels: Ink[], target: number): Ink[] {
  if (!pixels.length) return [{ r: 20, g: 20, b: 20 }];
  const buckets: Ink[][] = [pixels.slice()];
  while (buckets.length < target) {
    let widest = 0;
    let range = -1;
    for (let i = 0; i < buckets.length; i += 1) {
      const bucket = buckets[i]!;
      if (bucket.length < 2) continue;
      const span = Math.max(
        inkRange(bucket, "r"),
        inkRange(bucket, "g"),
        inkRange(bucket, "b"),
      );
      if (span > range) {
        range = span;
        widest = i;
      }
    }
    if (range <= 14) break;
    const bucket = buckets[widest]!;
    const channel: keyof Ink =
      inkRange(bucket, "r") >= inkRange(bucket, "g") &&
      inkRange(bucket, "r") >= inkRange(bucket, "b")
        ? "r"
        : inkRange(bucket, "g") >= inkRange(bucket, "b")
          ? "g"
          : "b";
    bucket.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.max(1, Math.floor(bucket.length / 2));
    buckets.splice(widest, 1, bucket.slice(0, mid), bucket.slice(mid));
  }
  return buckets.map(averageInk);
}

function nearestInk(r: number, g: number, b: number, pal: Ink[]) {
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

function collectInk(imageData: ImageData) {
  const { data } = imageData;
  const pixels: Ink[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (l > 220 && max - min < 18) continue;
    pixels.push({ r, g, b });
  }
  return pixels;
}

function merchFlatten(imageData: ImageData) {
  const pixels = collectInk(imageData);
  if (pixels.length < 40) return imageData;
  const sampled =
    pixels.length > 12000
      ? pixels.filter((_, index) => index % Math.ceil(pixels.length / 12000) === 0)
      : pixels;
  const pal = cutInks(sampled, 5);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue;
    const swatch = nearestInk(data[i], data[i + 1], data[i + 2], pal);
    data[i] = swatch.r;
    data[i + 1] = swatch.g;
    data[i + 2] = swatch.b;
    data[i + 3] = 255;
  }
  return imageData;
}

function merchDespeckle(imageData: ImageData) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const at = (x: number, y: number) => (y * width + x) * 4;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = at(x, y);
      let opaqueN = 0;
      const counts = new Map<number, number>();
      let majority = 0;
      let majorityN = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const j = at(x + dx, y + dy);
          if (src[j + 3] < 16) continue;
          opaqueN += 1;
          const key = (src[j] << 16) | (src[j + 1] << 8) | src[j + 2];
          const n = (counts.get(key) ?? 0) + 1;
          counts.set(key, n);
          if (n > majorityN) {
            majorityN = n;
            majority = key;
          }
        }
      }
      if (src[i + 3] >= 16 && opaqueN <= 2) {
        data[i + 3] = 0;
        continue;
      }
      if (src[i + 3] >= 16 && majorityN >= 5) {
        const self = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
        const selfN = counts.get(self) ?? 0;
        if (selfN <= 2) {
          data[i] = (majority >> 16) & 255;
          data[i + 1] = (majority >> 8) & 255;
          data[i + 2] = majority & 255;
        }
      }
    }
  }
  return imageData;
}

function dropSmallBlobs(imageData: ImageData) {
  const { data, width, height } = imageData;
  const n = width * height;
  const minSize = Math.max(48, Math.round(n * 0.0012));
  const seen = new Uint8Array(n);
  const qx = new Int32Array(n);
  const qy = new Int32Array(n);
  const stack: number[] = [];
  for (let start = 0; start < n; start += 1) {
    if (seen[start] || data[start * 4 + 3] < 16) continue;
    let head = 0;
    let tail = 0;
    qx[0] = start % width;
    qy[0] = (start / width) | 0;
    tail = 1;
    seen[start] = 1;
    stack.length = 0;
    stack.push(start);
    while (head < tail) {
      const x = qx[head]!;
      const y = qy[head]!;
      head += 1;
      const neigh = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      for (const [nx, ny] of neigh) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const idx = ny * width + nx;
        if (seen[idx] || data[idx * 4 + 3] < 16) continue;
        seen[idx] = 1;
        qx[tail] = nx;
        qy[tail] = ny;
        tail += 1;
        stack.push(idx);
      }
    }
    if (stack.length < minSize) {
      for (const idx of stack) data[idx * 4 + 3] = 0;
    }
  }
  return imageData;
}

function trimTransparent(source: HTMLCanvasElement) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  const { width, height } = source;
  const { data } = ctx.getImageData(0, 0, width, height);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return source;
  const pad = Math.round(Math.max(width, height) * 0.02);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const cut = document.createElement("canvas");
  cut.width = w;
  cut.height = h;
  const cutCtx = cut.getContext("2d");
  if (!cutCtx) return source;
  cutCtx.drawImage(source, minX, minY, w, h, 0, 0, w, h);
  return cut;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32(value: number) {
  return Uint8Array.of(
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  );
}

function withDpi(png: ArrayBuffer, dpi = DPI) {
  const src = new Uint8Array(png);
  if (src.length < 33 || src[0] !== 0x89) return src;
  const ppm = Math.round(dpi / 0.0254);
  const typeAndData = new Uint8Array(13);
  typeAndData.set([0x70, 0x48, 0x59, 0x73]);
  typeAndData.set(u32(ppm), 4);
  typeAndData.set(u32(ppm), 8);
  typeAndData[12] = 1;
  const chunk = new Uint8Array(4 + 13 + 4);
  chunk.set(u32(9), 0);
  chunk.set(typeAndData, 4);
  chunk.set(u32(crc32(typeAndData)), 17);
  const ihdrEnd = 8 + 4 + 4 + 13 + 4;
  const out = new Uint8Array(src.length + chunk.length);
  out.set(src.subarray(0, ihdrEnd), 0);
  out.set(chunk, ihdrEnd);
  out.set(src.subarray(ihdrEnd), ihdrEnd + chunk.length);
  return out;
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not write PNG."));
        return;
      }
      void blob.arrayBuffer().then(resolve, reject);
    }, "image/png");
  });
}

export type PrintGrade = "print" | "soft" | "draft";

export type PrintifyBuild = {
  blob: Blob;
  artBlob: Blob;
  preset: PrintifyPreset;
  previewUrl: string;
  artWidth: number;
  artHeight: number;
  scale: number;
  dpi: number;
  grade: PrintGrade;
  transparent: boolean;
};

export function evaluateArtworkResolution(
  artWidth: number,
  artHeight: number,
  preset: PrintifyPreset,
): { dpi: number; scale: number; grade: PrintGrade } {
  const innerW = preset.width * (1 - PAD * 2);
  const innerH = preset.height * (1 - PAD * 2);
  const scale = Math.min(innerW / Math.max(1, artWidth), innerH / Math.max(1, artHeight));
  const dpi = Math.round(DPI / Math.max(scale, 0.0001));
  const grade: PrintGrade = dpi >= 240 ? "print" : dpi >= 160 ? "soft" : "draft";
  return { dpi, scale, grade };
}

export async function prepareArt(dataUrl: string, knock = true, holes = true) {
  const image = await loadImage(dataUrl);
  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  const work = document.createElement("canvas");
  work.width = srcW;
  work.height = srcH;
  const workCtx = work.getContext("2d", { willReadFrequently: true });
  if (!workCtx) throw new Error("Could not prepare the Printify file.");
  workCtx.drawImage(image, 0, 0);
  if (knock) {
    const pixels = workCtx.getImageData(0, 0, srcW, srcH);
    knockOut(pixels, holes);
    merchFlatten(pixels);
    merchDespeckle(pixels);
    dropSmallBlobs(pixels);
    workCtx.putImageData(pixels, 0, 0);
    return trimTransparent(work);
  }
  return work;
}

export async function toTransparentPng(dataUrl: string, holes = true) {
  const art = await prepareArt(dataUrl, true, holes);
  return canvasToPngDataUrl(art);
}

function isSkinTone(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return r > 70 && r >= g && r > b + 6 && max - min > 12 && g > 28 && b < r - 4;
}

export async function looksLikePhoto(dataUrl: string) {
  try {
    const image = await loadImage(dataUrl);
    const w = 64;
    const h = 64;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(image, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let skin = 0;
    let n = 0;
    const y1 = Math.floor(h * 0.52);
    const x0 = Math.floor(w * 0.22);
    const x1 = Math.floor(w * 0.78);
    for (let y = 0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const i = (y * w + x) * 4;
        n += 1;
        if (isSkinTone(data[i], data[i + 1], data[i + 2])) skin += 1;
      }
    }
    return n > 0 && skin / n > 0.1;
  } catch {
    return false;
  }
}

export async function finishPrintFile(dataUrl: string) {
  return toTransparentPng(dataUrl, true);
}

function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

function makeSizedCanvas(width: number, height: number) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    if (canvas.width !== width || canvas.height !== height) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return { canvas, ctx, width, height };
  } catch {
    return null;
  }
}

export async function buildPrintifyFromArt(
  art: HTMLCanvasElement,
  productId: ProductId,
  _opaque = false,
): Promise<PrintifyBuild> {
  const preset = printifyPreset(productId);
  const source = evaluateArtworkResolution(art.width, art.height, preset);

  const attempts = [
    { width: preset.width, height: preset.height },
    { width: Math.round(preset.width * 0.8), height: Math.round(preset.height * 0.8) },
    { width: Math.round(preset.width * (2 / 3)), height: Math.round(preset.height * (2 / 3)) },
  ];

  let made: ReturnType<typeof makeSizedCanvas> = null;
  for (const size of attempts) {
    made = makeSizedCanvas(size.width, size.height);
    if (made) break;
  }

  if (!made) {
    const artPng = withDpi(await canvasToPng(art), DPI);
    const artBlob = new Blob([artPng], { type: "image/png" });
    return {
      blob: artBlob,
      artBlob,
      preset,
      previewUrl: canvasToPngDataUrl(art),
      artWidth: art.width,
      artHeight: art.height,
      scale: source.scale,
      dpi: source.dpi,
      grade: source.grade,
      transparent: true,
    };
  }

  const { canvas, ctx, width, height } = made;
  const innerW = width * (1 - PAD * 2);
  const innerH = height * (1 - PAD * 2);
  const fit = Math.min(innerW / Math.max(1, art.width), innerH / Math.max(1, art.height));
  const dw = art.width * fit;
  const dh = art.height * fit;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(art, dx, dy, dw, dh);

  const png = withDpi(await canvasToPng(canvas), DPI);
  const blob = new Blob([png], { type: "image/png" });
  const fileDpi = Math.round(DPI * (width / preset.width));
  return {
    blob,
    artBlob: blob,
    preset,
    previewUrl: canvasToPngDataUrl(art),
    artWidth: width,
    artHeight: height,
    scale: fit,
    dpi: fileDpi,
    grade: source.grade,
    transparent: true,
  };
}

export async function buildPrintifyPng(
  dataUrl: string,
  productId: ProductId,
  knock = true,
): Promise<PrintifyBuild> {
  const art = await prepareArt(dataUrl, knock, knock);
  return buildPrintifyFromArt(art, productId, !knock);
}

export async function downloadPrintifyPng(
  dataUrl: string,
  productId: ProductId,
  filename: string,
) {
  const { blob, preset } = await buildPrintifyPng(dataUrl, productId);
  downloadBlob(blob, filename);
  return preset;
}
