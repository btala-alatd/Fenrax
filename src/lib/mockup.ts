import { loadImage } from "@/lib/image-file";
import { prepareArt } from "@/lib/printify";
import type { Brand } from "@/lib/brand";
import type { ProductId } from "@/lib/studio-data";

type Audience = Brand["audience"];

type Place = {
  cx: number;
  taper: number;
  gapIn: number;
  widthIn: number;
  maxHIn: number;
};

const PLACE: Record<ProductId, Place> = {
  tee: { cx: 0.5, taper: 0.96, gapIn: 3.5, widthIn: 12, maxHIn: 14 },
  long: { cx: 0.5, taper: 0.96, gapIn: 3.5, widthIn: 12, maxHIn: 14 },
  tank: { cx: 0.5, taper: 0.96, gapIn: 3.25, widthIn: 11, maxHIn: 13 },
  hoodie: { cx: 0.5, taper: 0.95, gapIn: 4.25, widthIn: 11, maxHIn: 12 },
  crew: { cx: 0.5, taper: 0.96, gapIn: 3.75, widthIn: 12, maxHIn: 13 },
  chest: { cx: 0.28, taper: 0.99, gapIn: 3.5, widthIn: 4, maxHIn: 4 },
  back: { cx: 0.5, taper: 0.96, gapIn: 3.5, widthIn: 13, maxHIn: 15 },
  baby: { cx: 0.5, taper: 0.97, gapIn: 2.5, widthIn: 8, maxHIn: 9 },
  tote: { cx: 0.5, taper: 1, gapIn: 1.5, widthIn: 12, maxHIn: 13 },
  hat: { cx: 0.5, taper: 0.86, gapIn: 0.6, widthIn: 2.25, maxHIn: 2.25 },
  mug: { cx: 0.48, taper: 0.9, gapIn: 0.6, widthIn: 3, maxHIn: 3.5 },
  tumbler: { cx: 0.5, taper: 0.92, gapIn: 0.4, widthIn: 2.5, maxHIn: 6 },
  sticker: { cx: 0.5, taper: 1, gapIn: 0.2, widthIn: 3, maxHIn: 3 },
  poster: { cx: 0.5, taper: 1, gapIn: 0.4, widthIn: 12, maxHIn: 16 },
  pillow: { cx: 0.5, taper: 1, gapIn: 0.8, widthIn: 12, maxHIn: 12 },
  phone: { cx: 0.5, taper: 0.98, gapIn: 0.2, widthIn: 2.4, maxHIn: 5 },
  canvas: { cx: 0.5, taper: 1, gapIn: 0.5, widthIn: 12, maxHIn: 16 },
  repeat: { cx: 0.5, taper: 0.96, gapIn: 0.4, widthIn: 16, maxHIn: 18 },
};

function placeOf(id: ProductId, audience: Audience = "men"): Place {
  const base = PLACE[id] ?? PLACE.tee;
  if (audience !== "kids") return base;
  if (id === "chest") return { ...base, gapIn: 2.4, widthIn: 2.75, maxHIn: 2.75 };
  if (id === "baby") return { ...base, gapIn: 2.2, widthIn: 5, maxHIn: 5.5 };
  if (id === "hoodie" || id === "crew") return { ...base, gapIn: 3.2, widthIn: 9, maxHIn: 9 };
  if (id === "back") return { ...base, gapIn: 2.8, widthIn: 10, maxHIn: 11 };
  if (!APPAREL.has(id)) return base;
  return { ...base, gapIn: 2.6, widthIn: 10, maxHIn: 11 };
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not stamp the print."));
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not stamp the print."));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(blob);
      },
      "image/png",
      1,
    );
  });
}

function isSkin(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return r > 70 && r >= g && r > b + 6 && max - min > 12 && g > 28 && b < r - 4;
}

function isField(r: number, g: number, b: number, a: number) {
  if (a < 12) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const L = (r + g + b) / 3;
  return L > 210 && max - min < 48;
}

function fabricKey(image: ImageData) {
  const { width, height, data } = image;
  for (const fy of [0.42, 0.5, 0.58]) {
    const i = (Math.floor(height * fy) * width + Math.floor(width * 0.5)) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (!isSkin(r, g, b)) return [r, g, b] as const;
  }
  const i = (Math.floor(height * 0.52) * width + Math.floor(width * 0.5)) * 4;
  return [data[i], data[i + 1], data[i + 2]] as const;
}

function isFabric(
  r: number,
  g: number,
  b: number,
  key: readonly [number, number, number],
) {
  if (isSkin(r, g, b)) return false;
  return Math.abs(r - key[0]) + Math.abs(g - key[1]) + Math.abs(b - key[2]) < 108;
}

function garmentBox(image: ImageData) {
  const { width, height, data } = image;
  const key = fabricKey(image);
  const step = Math.max(1, Math.floor(height / 160));
  let top = height;
  let bottom = 0;
  let best = { y: 0, left: 0, right: 0, w: 0 };
  for (let y = 0; y < height; y += step) {
    let left = -1;
    let right = -1;
    for (let x = 2; x < width - 2; x += 2) {
      const i = (y * width + x) * 4;
      if (!isFabric(data[i], data[i + 1], data[i + 2], key)) continue;
      if (left < 0) left = x;
      right = x;
    }
    const w = left < 0 ? 0 : right - left;
    if (w < width * 0.16) continue;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
    if (w > best.w) best = { y, left, right, w };
  }
  if (best.w < width * 0.16 || bottom - top < height * 0.18) return null;
  const chestY = Math.min(bottom, top + Math.round((bottom - top) * 0.22));
  let left = best.left;
  let right = best.right;
  const mid = (chestY * width + Math.floor(width / 2)) * 4;
  if (isFabric(data[mid], data[mid + 1], data[mid + 2], key)) {
    left = Math.floor(width / 2);
    right = left;
    while (left > 2) {
      const i = (chestY * width + left - 1) * 4;
      if (!isFabric(data[i], data[i + 1], data[i + 2], key)) break;
      left -= 1;
    }
    while (right < width - 3) {
      const i = (chestY * width + right + 1) * 4;
      if (!isFabric(data[i], data[i + 1], data[i + 2], key)) break;
      right += 1;
    }
  }
  return {
    collar: top,
    hem: bottom,
    left,
    right,
    chest: Math.max(48, right - left),
  };
}

const APPAREL = new Set<ProductId>([
  "tee",
  "long",
  "tank",
  "hoodie",
  "crew",
  "chest",
  "back",
  "baby",
  "repeat",
]);

const OBJECT_PLACE: Record<
  string,
  { cx: number; cy: number; w: number; h: number; taper: number }
> = {
  hat: { cx: 0.5, cy: 0.36, w: 0.42, h: 0.34, taper: 0.88 },
  mug: { cx: 0.47, cy: 0.48, w: 0.56, h: 0.52, taper: 0.92 },
  tumbler: { cx: 0.5, cy: 0.48, w: 0.6, h: 0.7, taper: 0.9 },
  tote: { cx: 0.5, cy: 0.54, w: 0.72, h: 0.58, taper: 1 },
  sticker: { cx: 0.5, cy: 0.5, w: 0.9, h: 0.9, taper: 1 },
  poster: { cx: 0.5, cy: 0.5, w: 0.84, h: 0.88, taper: 1 },
  pillow: { cx: 0.5, cy: 0.5, w: 0.78, h: 0.78, taper: 1 },
  phone: { cx: 0.5, cy: 0.56, w: 0.78, h: 0.7, taper: 0.98 },
  canvas: { cx: 0.5, cy: 0.5, w: 0.88, h: 0.9, taper: 1 },
};

function samplePoint(productId: ProductId, width: number, height: number) {
  const map: Partial<Record<ProductId, [number, number]>> = {
    hat: [0.5, 0.28],
    mug: [0.48, 0.52],
    tumbler: [0.5, 0.5],
    tote: [0.5, 0.55],
    phone: [0.5, 0.56],
    pillow: [0.5, 0.5],
    poster: [0.5, 0.5],
    canvas: [0.5, 0.5],
    sticker: [0.5, 0.5],
  };
  const [fx, fy] = map[productId] ?? [0.5, 0.48];
  return [Math.floor(width * fx), Math.floor(height * fy)] as const;
}

function objectBox(image: ImageData, productId: ProductId) {
  const { width, height, data } = image;
  const [sx, sy] = samplePoint(productId, width, height);
  const i0 = (sy * width + sx) * 4;
  let key = [data[i0], data[i0 + 1], data[i0 + 2]] as const;
  if (isSkin(key[0], key[1], key[2])) {
    const j = (Math.min(height - 2, sy + Math.floor(height * 0.12)) * width + sx) * 4;
    key = [data[j], data[j + 1], data[j + 2]];
  }
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const x0 = Math.floor(width * 0.06);
  const x1 = Math.floor(width * 0.94);
  const y0 = Math.floor(height * 0.06);
  const y1 = Math.floor(height * 0.94);
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * width + x) * 4;
      if (isSkin(data[i], data[i + 1], data[i + 2])) continue;
      if (Math.abs(data[i] - key[0]) + Math.abs(data[i + 1] - key[1]) + Math.abs(data[i + 2] - key[2]) > 96) {
        continue;
      }
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX - minX < width * 0.1 || maxY - minY < height * 0.1) {
    return {
      x: Math.floor(width * 0.28),
      y: Math.floor(height * 0.28),
      w: Math.floor(width * 0.44),
      h: Math.floor(height * 0.44),
    };
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function objectArea(image: ImageData, productId: ProductId, scale: number) {
  const spec = OBJECT_PLACE[productId] ?? OBJECT_PLACE.tote;
  const grow = Math.min(1.12, Math.max(0.85, scale));
  const box = objectBox(image, productId);
  let w = box.w * spec.w * grow;
  let h = box.h * spec.h * grow;
  let x = box.x + box.w * spec.cx - w / 2;
  let y = box.y + box.h * spec.cy - h / 2;
  x = Math.max(2, Math.min(x, image.width - w - 2));
  y = Math.max(2, Math.min(y, image.height - h - 2));
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(Math.max(20, w)),
    h: Math.round(Math.max(20, h)),
    taper: spec.taper,
  };
}

function apparelArea(image: ImageData, productId: ProductId, scale: number, audience: Audience = "men") {
  const kids = audience === "kids";
  const place = placeOf(productId, audience);
  const grow = Math.min(1.12, Math.max(0.85, scale));
  const { width, height } = image;
  const shirt = garmentBox(image);
  const collar = shirt?.collar ?? Math.floor(height * 0.28);
  const hem = shirt?.hem ?? Math.floor(height * 0.82);
  const chest = shirt?.chest ?? Math.floor(width * 0.42);
  const left = shirt?.left ?? Math.floor((width - chest) / 2);
  const shirtH = Math.max(48, hem - collar);
  const chestIn = kids ? 16 : 20;
  const pxPerIn = chest / chestIn;
  const gap = Math.round(place.gapIn * pxPerIn);
  let top = collar + gap;
  const chestFloor = collar + Math.round(shirtH * (kids ? 0.32 : 0.38));
  if (top > chestFloor) top = chestFloor;
  let w = place.widthIn * pxPerIn * grow;
  let h = place.maxHIn * pxPerIn * grow;
  const pocket =
    productId === "hoodie" || productId === "crew"
      ? collar + Math.round((kids ? 9.5 : 12.2) * pxPerIn)
      : hem - Math.round(shirtH * (kids ? 0.18 : 0.12));
  const maxH = Math.max(32, pocket - top);
  if (h > maxH) {
    const s = maxH / h;
    h = maxH;
    w *= s;
  }
  if (top + h > pocket) top = Math.max(collar + Math.min(gap, shirtH * 0.18), pocket - h);
  let x = left + chest * place.cx - w / 2;
  x = Math.max(4, Math.min(x, width - w - 4));
  const y = Math.max(0, Math.min(top, height - h));
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(Math.max(24, w)),
    h: Math.round(Math.max(24, h)),
    taper: place.taper,
  };
}

function printArea(image: ImageData, productId: ProductId, scale = 1, audience: Audience = "men") {
  if (APPAREL.has(productId)) return apparelArea(image, productId, scale, audience);
  return objectArea(image, productId, scale);
}

function punchLightField(source: HTMLCanvasElement) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  const image = ctx.getImageData(0, 0, source.width, source.height);
  const { data, width, height } = image;
  const seen = new Uint8Array(width * height);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (seen[i]) return;
    const p = i * 4;
    if (!isField(data[p], data[p + 1], data[p + 2], data[p + 3])) return;
    seen[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }
  while (stack.length) {
    const i = stack.pop()!;
    data[i * 4 + 3] = 0;
    const x = i % width;
    const y = (i / width) | 0;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  ctx.putImageData(image, 0, 0);
  return source;
}

function keepDenseInk(source: HTMLCanvasElement) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  const image = ctx.getImageData(0, 0, source.width, source.height);
  const { data, width, height } = image;
  const cs = 16;
  const gw = Math.ceil(width / cs);
  const gh = Math.ceil(height / cs);
  const dense = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy += 1) {
    for (let gx = 0; gx < gw; gx += 1) {
      let ink = 0;
      let n = 0;
      const x1 = Math.min(width, (gx + 1) * cs);
      const y1 = Math.min(height, (gy + 1) * cs);
      for (let y = gy * cs; y < y1; y += 1) {
        for (let x = gx * cs; x < x1; x += 1) {
          n += 1;
          if (data[(y * width + x) * 4 + 3] >= 80) ink += 1;
        }
      }
      if (n && ink / n >= 0.14) dense[gy * gw + gx] = 1;
    }
  }
  const seen = new Uint8Array(gw * gh);
  let best: number[] = [];
  const stack: number[] = [];
  for (let i = 0; i < dense.length; i += 1) {
    if (!dense[i] || seen[i]) continue;
    stack.length = 0;
    stack.push(i);
    seen[i] = 1;
    const blob: number[] = [];
    while (stack.length) {
      const cur = stack.pop()!;
      blob.push(cur);
      const x = cur % gw;
      const y = (cur / gw) | 0;
      const next = [cur - 1, cur + 1, cur - gw, cur + gw];
      const ok = [x > 0, x + 1 < gw, y > 0, y + 1 < gh];
      for (let k = 0; k < 4; k += 1) {
        if (!ok[k]) continue;
        const n = next[k];
        if (n < 0 || n >= dense.length || seen[n] || !dense[n]) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }
    if (blob.length > best.length) best = blob;
  }
  const keep = new Uint8Array(gw * gh);
  for (const i of best) keep[i] = 1;
  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % width;
    const py = ((i / 4) / width) | 0;
    const gx = Math.min(gw - 1, (px / cs) | 0);
    const gy = Math.min(gh - 1, (py / cs) | 0);
    if (!keep[gy * gw + gx] || data[i + 3] < 64) data[i + 3] = 0;
  }
  ctx.putImageData(image, 0, 0);

  const row = new Uint32Array(height);
  const col = new Uint32Array(width);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 64) continue;
      row[y] += 1;
      col[x] += 1;
    }
  }
  const rowMin = Math.max(10, Math.floor(width * 0.02));
  const colMin = Math.max(10, Math.floor(height * 0.02));
  let minY = 0;
  let maxY = height - 1;
  let minX = 0;
  let maxX = width - 1;
  while (minY < height && row[minY] < rowMin) minY += 1;
  while (maxY > minY && row[maxY] < rowMin) maxY -= 1;
  while (minX < width && col[minX] < colMin) minX += 1;
  while (maxX > minX && col[maxX] < colMin) maxX -= 1;
  if (maxX <= minX || maxY <= minY) return source;
  const cut = document.createElement("canvas");
  cut.width = maxX - minX + 1;
  cut.height = maxY - minY + 1;
  const cutCtx = cut.getContext("2d");
  if (!cutCtx) return source;
  cutCtx.drawImage(source, minX, minY, cut.width, cut.height, 0, 0, cut.width, cut.height);
  return cut;
}

function fitArt(areaW: number, areaH: number, artW: number, artH: number, sit = 0.04) {
  const scale = Math.min(areaW / Math.max(1, artW), areaH / Math.max(1, artH));
  const w = Math.max(24, Math.round(artW * scale));
  const h = Math.max(24, Math.round(artH * scale));
  return {
    w,
    h,
    x: Math.round((areaW - w) / 2),
    y: Math.round(Math.max(0, (areaH - h) * sit)),
  };
}

function drawTapered(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  taper: number,
) {
  const strips = 28;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  for (let i = 0; i < strips; i += 1) {
    const t = i / Math.max(1, strips - 1);
    const sy = (i / strips) * source.height;
    const sh = source.height / strips;
    const width = w * (taper + (1 - taper) * t);
    const dx = x + (w - width) / 2;
    const dy = y + (i / strips) * h;
    const dh = h / strips + 0.6;
    ctx.drawImage(source, 0, sy, source.width, sh, dx, dy, width, dh);
  }
}

function sitInFabric(photo: ImageData, overlay: ImageData, ox: number, oy: number) {
  const pw = photo.width;
  const ow = overlay.width;
  const oh = overlay.height;
  const pd = photo.data;
  const od = overlay.data;
  for (let y = 0; y < oh; y += 1) {
    for (let x = 0; x < ow; x += 1) {
      const oi = (y * ow + x) * 4;
      const a = od[oi + 3] / 255;
      if (a < 0.45) continue;
      const px = ox + x;
      const py = oy + y;
      if (px < 0 || py < 0 || px >= pw || py >= photo.height) continue;
      const pi = (py * pw + px) * 4;
      const fr = pd[pi];
      const fg = pd[pi + 1];
      const fb = pd[pi + 2];
      const light = 0.66 + 0.34 * ((fr + fg + fb) / 765);
      const ia = Math.min(1, a * 0.94);
      pd[pi] = Math.round(fr * (1 - ia) + od[oi] * light * ia);
      pd[pi + 1] = Math.round(fg * (1 - ia) + od[oi + 1] * light * ia);
      pd[pi + 2] = Math.round(fb * (1 - ia) + od[oi + 2] * light * ia);
    }
  }
}

export async function stampPrintOnGarment(
  photoUrl: string,
  artUrl: string,
  productId: ProductId,
  scale = 1,
  audience: Audience = "men",
): Promise<string> {
  const photo = await loadImage(photoUrl);
  const art = keepDenseInk(punchLightField(await prepareArt(artUrl, true, true)));
  const width = photo.naturalWidth || photo.width;
  const height = photo.naturalHeight || photo.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not stamp the print.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(photo, 0, 0, width, height);

  const mixed = ctx.getImageData(0, 0, width, height);
  const area = printArea(mixed, productId, scale, audience);
  const fitted = fitArt(area.w, area.h, art.width, art.height, audience === "kids" ? 0.08 : 0.04);
  const overlay = document.createElement("canvas");
  overlay.width = fitted.w;
  overlay.height = fitted.h;
  const octx = overlay.getContext("2d");
  if (!octx) throw new Error("Could not stamp the print.");
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  drawTapered(octx, art, 0, 0, fitted.w, fitted.h, area.taper);

  const ink = octx.getImageData(0, 0, fitted.w, fitted.h);
  sitInFabric(mixed, ink, area.x + fitted.x, area.y + fitted.y);
  ctx.putImageData(mixed, 0, 0);

  return canvasToPng(canvas);
}
