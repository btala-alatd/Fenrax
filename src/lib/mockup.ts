import { loadImage } from "@/lib/image-file";
import { prepareArt, printifyPreset } from "@/lib/printify";
import type { ProductId } from "@/lib/studio-data";

type Place = {
  cx: number;
  taper: number;
  collar: number;
  hem: number;
  width: number;
};

const PLACE: Record<ProductId, Place> = {
  tee: { cx: 0.5, taper: 0.94, collar: 0.38, hem: 0.82, width: 0.72 },
  long: { cx: 0.5, taper: 0.94, collar: 0.38, hem: 0.82, width: 0.7 },
  tank: { cx: 0.5, taper: 0.95, collar: 0.4, hem: 0.8, width: 0.68 },
  hoodie: { cx: 0.5, taper: 0.93, collar: 0.4, hem: 0.68, width: 0.7 },
  crew: { cx: 0.5, taper: 0.94, collar: 0.4, hem: 0.78, width: 0.7 },
  chest: { cx: 0.28, taper: 0.98, collar: 0.4, hem: 0.62, width: 0.22 },
  back: { cx: 0.5, taper: 0.94, collar: 0.32, hem: 0.84, width: 0.76 },
  baby: { cx: 0.5, taper: 0.96, collar: 0.42, hem: 0.8, width: 0.64 },
  tote: { cx: 0.5, taper: 1, collar: 0.22, hem: 0.86, width: 0.78 },
  hat: { cx: 0.5, taper: 0.86, collar: 0.28, hem: 0.7, width: 0.55 },
  mug: { cx: 0.48, taper: 0.9, collar: 0.28, hem: 0.78, width: 0.62 },
  tumbler: { cx: 0.5, taper: 0.92, collar: 0.2, hem: 0.84, width: 0.5 },
  sticker: { cx: 0.5, taper: 1, collar: 0.16, hem: 0.86, width: 0.7 },
  poster: { cx: 0.5, taper: 1, collar: 0.12, hem: 0.9, width: 0.72 },
  pillow: { cx: 0.5, taper: 1, collar: 0.18, hem: 0.86, width: 0.74 },
  phone: { cx: 0.5, taper: 0.98, collar: 0.16, hem: 0.86, width: 0.7 },
  canvas: { cx: 0.5, taper: 1, collar: 0.12, hem: 0.9, width: 0.78 },
  repeat: { cx: 0.5, taper: 0.96, collar: 0.18, hem: 0.88, width: 0.84 },
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

function pixel(data: Uint8ClampedArray, width: number, x: number, y: number) {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]] as const;
}

function isSkin(r: number, g: number, b: number) {
  return r > 88 && r > g + 8 && r > b + 10 && g > 36 && g + 18 > b;
}

function similar(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  tol = 34,
) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < tol * 3;
}

function garmentRegion(image: ImageData) {
  const { width, height, data } = image;
  const cx0 = Math.floor(width / 2);
  const at = (x: number, y: number) =>
    pixel(data, width, Math.max(0, Math.min(width - 1, x)), Math.max(0, Math.min(height - 1, y)));

  const runAt = (y: number, key: readonly [number, number, number]) => {
    let left = cx0;
    let right = cx0;
    while (left > 2) {
      const p = at(left - 1, y);
      if (isSkin(p[0], p[1], p[2]) || !similar(p, key, 36)) break;
      left -= 1;
    }
    while (right < width - 3) {
      const p = at(right + 1, y);
      if (isSkin(p[0], p[1], p[2]) || !similar(p, key, 36)) break;
      right += 1;
    }
    return { left, right, w: right - left };
  };

  let fabricY = Math.floor(height * 0.55);
  let fabric = at(cx0, fabricY);
  if (isSkin(fabric[0], fabric[1], fabric[2])) {
    fabricY = Math.floor(height * 0.64);
    fabric = at(cx0, fabricY);
  }

  let best = { y: fabricY, left: 0, right: 0, w: 0 };
  const step = Math.max(1, Math.floor(height / 140));
  for (let y = Math.floor(height * 0.32); y < height * 0.8; y += step) {
    const p = at(cx0, y);
    if (isSkin(p[0], p[1], p[2]) || !similar(p, fabric, 40)) continue;
    const run = runAt(y, fabric);
    if (run.w > best.w && run.w > width * 0.2 && run.w < width * 0.9) {
      best = { y, ...run };
    }
  }
  if (best.w < width * 0.2) return null;

  let collar = best.y;
  for (let y = best.y; y > height * 0.1; y -= step) {
    const p = at(cx0, y);
    if (isSkin(p[0], p[1], p[2])) {
      collar = Math.min(best.y, y + step * 2);
      break;
    }
    const run = runAt(y, fabric);
    if (run.w < best.w * 0.4) {
      collar = Math.min(best.y, y + step);
      break;
    }
    collar = y;
  }

  let hem = best.y;
  for (let y = best.y; y < height * 0.96; y += step) {
    const p = at(cx0, y);
    if (isSkin(p[0], p[1], p[2])) {
      hem = y - step;
      break;
    }
    const run = runAt(y, fabric);
    if (run.w < best.w * 0.48) {
      hem = y - step;
      break;
    }
    hem = y;
  }

  const top = Math.max(0, collar);
  const bottom = Math.max(top + 24, hem);
  return {
    x: best.left,
    y: top,
    w: best.w,
    h: bottom - top,
  };
}

function printArea(
  image: ImageData,
  productId: ProductId,
  scale = 1,
) {
  const place = placeOf(productId);
  const inches = printInches(productId);
  const ratio = inches.h / Math.max(0.1, inches.w);
  const grow = Math.min(1.2, Math.max(0.75, scale));
  const shirt = garmentRegion(image);
  const box = shirt ?? {
    x: 0,
    y: 0,
    w: image.width,
    h: image.height,
  };
  const relative = !shirt;
  const widthFrac = relative ? Math.min(0.42, place.width) : place.width;
  const collarFrac = relative ? 0.4 : 0;
  let w = box.w * widthFrac * grow;
  let h = w * ratio;
  const collar = box.y + box.h * (shirt ? 0.1 : place.collar || collarFrac);
  const hem = box.y + box.h * (shirt ? place.hem : place.hem);
  const maxH = Math.max(24, hem - collar);
  if (h > maxH) {
    h = maxH;
    w = h / ratio;
  }
  let x = box.x + box.w * place.cx - w / 2;
  let y = collar;
  if (y + h > hem) y = Math.max(collar, hem - h);
  x = Math.max(0, Math.min(x, image.width - w));
  y = Math.max(0, Math.min(y, image.height - h));
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(Math.max(24, w)),
    h: Math.round(Math.max(24, h)),
    taper: place.taper,
  };
}

function hardenInk(source: HTMLCanvasElement) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  const image = ctx.getImageData(0, 0, source.width, source.height);
  const { data, width, height } = image;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 48) {
      data[i + 3] = 0;
      continue;
    }
    const maxc = Math.max(data[i], data[i + 1], data[i + 2]);
    const minc = Math.min(data[i], data[i + 1], data[i + 2]);
    if (maxc > 220 && minc > 200 && data[i + 3] < 140) data[i + 3] = 0;
  }
  ctx.putImageData(image, 0, 0);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 48) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
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
    y: Math.round((areaH - h) / 2),
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
  const strips = 36;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  for (let i = 0; i < strips; i += 1) {
    const t = i / Math.max(1, strips - 1);
    const sy = (i / strips) * source.height;
    const sh = source.height / strips;
    const width = w * (taper + (1 - taper) * t);
    const dx = x + (w - width) / 2;
    const dy = y + (i / strips) * h;
    const dh = h / strips + 0.75;
    ctx.drawImage(source, 0, sy, source.width, sh, dx, dy, width, dh);
  }
}

function sitInFabric(
  photo: ImageData,
  overlay: ImageData,
  ox: number,
  oy: number,
) {
  const pw = photo.width;
  const ow = overlay.width;
  const oh = overlay.height;
  const pd = photo.data;
  const od = overlay.data;
  for (let y = 0; y < oh; y += 1) {
    for (let x = 0; x < ow; x += 1) {
      const oi = (y * ow + x) * 4;
      const a = od[oi + 3] / 255;
      if (a < 0.2) continue;
      const px = ox + x;
      const py = oy + y;
      if (px < 0 || py < 0 || px >= pw || py >= photo.height) continue;
      const pi = (py * pw + px) * 4;
      const fr = pd[pi];
      const fg = pd[pi + 1];
      const fb = pd[pi + 2];
      const light = 0.62 + 0.38 * ((fr + fg + fb) / 765);
      const ia = Math.min(1, a * 0.96);
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
  const art = hardenInk(await prepareArt(artUrl, true, true));
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
  overlay.width = area.w;
  overlay.height = area.h;
  const octx = overlay.getContext("2d");
  if (!octx) throw new Error("Could not stamp the print.");
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  drawTapered(octx, art, fitted.x, fitted.y, fitted.w, fitted.h, area.taper);

  const ink = octx.getImageData(0, 0, area.w, area.h);
  sitInFabric(mixed, ink, area.x, area.y);
  ctx.putImageData(mixed, 0, 0);

  return canvasToPng(canvas);
}
