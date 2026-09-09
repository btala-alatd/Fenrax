import { loadImage } from "@/lib/image-file";
import { prepareArt, printifyPreset } from "@/lib/printify";
import type { ProductId } from "@/lib/studio-data";

type Place = {
  cx: number;
  taper: number;
  width: number;
  drop: number;
  cover: number;
};

const PLACE: Record<ProductId, Place> = {
  tee: { cx: 0.5, taper: 0.95, width: 0.78, drop: 0.11, cover: 0.78 },
  long: { cx: 0.5, taper: 0.95, width: 0.76, drop: 0.11, cover: 0.78 },
  tank: { cx: 0.5, taper: 0.96, width: 0.74, drop: 0.12, cover: 0.76 },
  hoodie: { cx: 0.5, taper: 0.94, width: 0.76, drop: 0.12, cover: 0.58 },
  crew: { cx: 0.5, taper: 0.95, width: 0.76, drop: 0.11, cover: 0.72 },
  chest: { cx: 0.3, taper: 0.98, width: 0.24, drop: 0.11, cover: 0.28 },
  back: { cx: 0.5, taper: 0.95, width: 0.8, drop: 0.1, cover: 0.8 },
  baby: { cx: 0.5, taper: 0.96, width: 0.72, drop: 0.12, cover: 0.74 },
  tote: { cx: 0.5, taper: 1, width: 0.8, drop: 0.08, cover: 0.82 },
  hat: { cx: 0.5, taper: 0.86, width: 0.62, drop: 0.12, cover: 0.5 },
  mug: { cx: 0.48, taper: 0.9, width: 0.7, drop: 0.1, cover: 0.7 },
  tumbler: { cx: 0.5, taper: 0.92, width: 0.56, drop: 0.08, cover: 0.78 },
  sticker: { cx: 0.5, taper: 1, width: 0.72, drop: 0.06, cover: 0.84 },
  poster: { cx: 0.5, taper: 1, width: 0.78, drop: 0.06, cover: 0.88 },
  pillow: { cx: 0.5, taper: 1, width: 0.8, drop: 0.08, cover: 0.84 },
  phone: { cx: 0.5, taper: 0.98, width: 0.74, drop: 0.08, cover: 0.82 },
  canvas: { cx: 0.5, taper: 1, width: 0.82, drop: 0.06, cover: 0.88 },
  repeat: { cx: 0.5, taper: 0.96, width: 0.9, drop: 0.04, cover: 0.9 },
};

function placeOf(id: ProductId): Place {
  return PLACE[id] ?? PLACE.tee;
}

function printInches(productId: ProductId) {
  const match = printifyPreset(productId).inches.match(/([\d.]+)\s*[×x]\s*([\d.]+)/);
  if (!match) return { w: 15, h: 18 };
  return { w: Number(match[1]), h: Number(match[2]) };
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

function neckFloor(image: ImageData, productId: ProductId) {
  const { width, height, data } = image;
  if (productId === "back" || productId === "tote" || productId === "poster" || productId === "canvas") {
    return Math.floor(height * 0.2);
  }
  const x0 = Math.floor(width * 0.34);
  const x1 = Math.floor(width * 0.66);
  const y0 = Math.floor(height * 0.06);
  const y1 = Math.floor(height * 0.56);
  let last = Math.floor(height * 0.34);
  let found = false;
  for (let y = y0; y < y1; y += 2) {
    let skin = 0;
    let n = 0;
    for (let x = x0; x < x1; x += 3) {
      const i = (y * width + x) * 4;
      n += 1;
      if (isSkin(data[i], data[i + 1], data[i + 2])) skin += 1;
    }
    if (n && skin / n > 0.18) {
      last = y;
      found = true;
    }
  }
  if (!found) return Math.floor(height * 0.36);
  return last;
}

function chestRun(image: ImageData, y: number) {
  const { width, height, data } = image;
  const row = Math.max(0, Math.min(height - 1, Math.round(y)));
  const cx = Math.floor(width / 2);
  const at = (x: number) => {
    const i = (row * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]] as const;
  };
  const key = at(cx);
  if (isSkin(key[0], key[1], key[2])) {
    return { left: Math.floor(width * 0.28), right: Math.floor(width * 0.72) };
  }
  const close = (x: number) => {
    const p = at(x);
    if (isSkin(p[0], p[1], p[2])) return false;
    return Math.abs(p[0] - key[0]) + Math.abs(p[1] - key[1]) + Math.abs(p[2] - key[2]) < 110;
  };
  let left = cx;
  let right = cx;
  while (left > 2 && close(left - 1)) left -= 1;
  while (right < width - 3 && close(right + 1)) right += 1;
  if (right - left < width * 0.22) {
    return { left: Math.floor(width * 0.28), right: Math.floor(width * 0.72) };
  }
  return { left, right };
}

function printArea(image: ImageData, productId: ProductId, scale = 1) {
  const place = placeOf(productId);
  const inches = printInches(productId);
  const ratio = inches.h / Math.max(0.1, inches.w);
  const grow = Math.min(1.15, Math.max(0.8, scale));
  const { width, height } = image;
  const neck = neckFloor(image, productId);
  const top = Math.min(
    Math.floor(height * 0.72),
    neck + Math.round(height * place.drop),
  );
  const run = chestRun(image, top + height * 0.08);
  const chest = Math.max(32, run.right - run.left);
  let w = chest * place.width * grow;
  let h = w * ratio;
  const hem = Math.floor(top + (height - top) * place.cover);
  const maxH = Math.max(32, hem - top);
  if (h > maxH) {
    h = maxH;
    w = h / ratio;
  }
  let x = run.left + chest * place.cx - w / 2;
  x = Math.max(0, Math.min(x, width - w));
  const y = Math.max(0, Math.min(top, height - h));
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(Math.max(24, w)),
    h: Math.round(Math.max(24, h)),
    taper: place.taper,
  };
}

function tightInk(source: HTMLCanvasElement) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  const image = ctx.getImageData(0, 0, source.width, source.height);
  const { data, width, height } = image;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 56) {
      data[i + 3] = 0;
      continue;
    }
    const maxc = Math.max(data[i], data[i + 1], data[i + 2]);
    const minc = Math.min(data[i], data[i + 1], data[i + 2]);
    if (maxc > 210 && minc > 188 && a < 160) data[i + 3] = 0;
  }
  const row = new Uint32Array(height);
  const col = new Uint32Array(width);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 56) continue;
      row[y] += 1;
      col[x] += 1;
    }
  }
  const rowMin = Math.max(8, Math.floor(width * 0.01));
  const colMin = Math.max(8, Math.floor(height * 0.01));
  let minY = 0;
  let maxY = height - 1;
  let minX = 0;
  let maxX = width - 1;
  while (minY < height && row[minY] < rowMin) minY += 1;
  while (maxY > minY && row[maxY] < rowMin) maxY -= 1;
  while (minX < width && col[minX] < colMin) minX += 1;
  while (maxX > minX && col[maxX] < colMin) maxX -= 1;
  if (maxX <= minX || maxY <= minY) return source;
  ctx.putImageData(image, 0, 0);
  const cut = document.createElement("canvas");
  cut.width = maxX - minX + 1;
  cut.height = maxY - minY + 1;
  const cutCtx = cut.getContext("2d");
  if (!cutCtx) return source;
  cutCtx.drawImage(source, minX, minY, cut.width, cut.height, 0, 0, cut.width, cut.height);
  return cut;
}

function fitArt(areaW: number, areaH: number, artW: number, artH: number) {
  const scale = Math.min(areaW / Math.max(1, artW), areaH / Math.max(1, artH));
  const w = Math.max(24, Math.round(artW * scale));
  const h = Math.max(24, Math.round(artH * scale));
  return {
    w,
    h,
    x: Math.round((areaW - w) / 2),
    y: Math.round((areaH - h) * 0.1),
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
      if (a < 0.28) continue;
      const px = ox + x;
      const py = oy + y;
      if (px < 0 || py < 0 || px >= pw || py >= photo.height) continue;
      const pi = (py * pw + px) * 4;
      const fr = pd[pi];
      const fg = pd[pi + 1];
      const fb = pd[pi + 2];
      const light = 0.64 + 0.36 * ((fr + fg + fb) / 765);
      const ia = Math.min(1, a * 0.95);
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
): Promise<string> {
  const photo = await loadImage(photoUrl);
  const art = tightInk(await prepareArt(artUrl, true, true));
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
  const area = printArea(mixed, productId, scale);
  const fitted = fitArt(area.w, area.h, art.width, art.height);

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
