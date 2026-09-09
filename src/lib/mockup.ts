import { loadImage } from "@/lib/image-file";
import { prepareArt } from "@/lib/printify";
import type { ProductId } from "@/lib/studio-data";

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

function placeOf(id: ProductId): Place {
  return PLACE[id] ?? PLACE.tee;
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
    return Math.floor(height * 0.18);
  }
  const x0 = Math.floor(width * 0.34);
  const x1 = Math.floor(width * 0.66);
  let last = Math.floor(height * 0.32);
  let found = false;
  for (let y = Math.floor(height * 0.06); y < height * 0.55; y += 2) {
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
  return found ? last : Math.floor(height * 0.34);
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
    return { left: Math.floor(width * 0.29), right: Math.floor(width * 0.71) };
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
    return { left: Math.floor(width * 0.29), right: Math.floor(width * 0.71) };
  }
  return { left, right };
}

function printArea(image: ImageData, productId: ProductId, scale = 1) {
  const place = placeOf(productId);
  const grow = Math.min(1.12, Math.max(0.85, scale));
  const { width, height } = image;
  const neck = neckFloor(image, productId);
  const sampleY = Math.min(height - 2, neck + Math.round(height * 0.08));
  const run = chestRun(image, sampleY);
  const chest = Math.max(48, run.right - run.left);
  const pxPerIn = chest / 20;
  const gap = Math.round(place.gapIn * pxPerIn);
  const top = Math.min(Math.floor(height * 0.7), neck + gap);
  let w = place.widthIn * pxPerIn * grow;
  let h = place.maxHIn * pxPerIn * grow;
  const hem = productId === "hoodie" || productId === "crew"
    ? Math.floor(top + 12.5 * pxPerIn)
    : Math.floor(height * 0.88);
  const maxH = Math.max(32, hem - top);
  if (h > maxH) {
    const s = maxH / h;
    h = maxH;
    w *= s;
  }
  let x = run.left + chest * place.cx - w / 2;
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
    if (!keep[gy * gw + gx] || data[i + 3] < 64) {
      data[i + 3] = 0;
    }
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

function fitArt(areaW: number, areaH: number, artW: number, artH: number) {
  const scale = Math.min(areaW / Math.max(1, artW), areaH / Math.max(1, artH));
  const w = Math.max(24, Math.round(artW * scale));
  const h = Math.max(24, Math.round(artH * scale));
  return {
    w,
    h,
    x: Math.round((areaW - w) / 2),
    y: Math.round(Math.max(0, (areaH - h) * 0.04)),
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
): Promise<string> {
  const photo = await loadImage(photoUrl);
  const art = keepDenseInk(await prepareArt(artUrl, true, true));
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
