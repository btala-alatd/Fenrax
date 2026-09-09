import { loadImage } from "@/lib/image-file";
import { prepareArt, PRINTIFY_PRESETS } from "@/lib/printify";
import type { ProductId } from "@/lib/studio-data";

type Place = {
  cx: number;
  cy: number;
  width: number;
  taper: number;
  collar: number;
  hem: number;
};

const PLACE: Record<ProductId, Place> = {
  tee: { cx: 0.5, cy: 0.51, width: 0.54, taper: 0.93, collar: 0.24, hem: 0.84 },
  long: { cx: 0.5, cy: 0.51, width: 0.52, taper: 0.93, collar: 0.24, hem: 0.84 },
  tank: { cx: 0.5, cy: 0.5, width: 0.48, taper: 0.94, collar: 0.26, hem: 0.82 },
  hoodie: { cx: 0.5, cy: 0.46, width: 0.5, taper: 0.92, collar: 0.26, hem: 0.7 },
  crew: { cx: 0.5, cy: 0.5, width: 0.52, taper: 0.93, collar: 0.25, hem: 0.8 },
  chest: { cx: 0.37, cy: 0.4, width: 0.18, taper: 0.97, collar: 0.28, hem: 0.55 },
  back: { cx: 0.5, cy: 0.5, width: 0.56, taper: 0.93, collar: 0.22, hem: 0.84 },
  baby: { cx: 0.5, cy: 0.52, width: 0.42, taper: 0.95, collar: 0.28, hem: 0.82 },
  tote: { cx: 0.5, cy: 0.54, width: 0.5, taper: 1, collar: 0.22, hem: 0.88 },
  hat: { cx: 0.5, cy: 0.42, width: 0.28, taper: 0.86, collar: 0.28, hem: 0.62 },
  mug: { cx: 0.48, cy: 0.5, width: 0.34, taper: 0.9, collar: 0.28, hem: 0.78 },
  tumbler: { cx: 0.5, cy: 0.5, width: 0.28, taper: 0.92, collar: 0.22, hem: 0.82 },
  sticker: { cx: 0.5, cy: 0.5, width: 0.55, taper: 1, collar: 0.12, hem: 0.9 },
  poster: { cx: 0.5, cy: 0.5, width: 0.48, taper: 1, collar: 0.12, hem: 0.9 },
  pillow: { cx: 0.5, cy: 0.52, width: 0.52, taper: 1, collar: 0.18, hem: 0.88 },
  phone: { cx: 0.5, cy: 0.5, width: 0.34, taper: 0.98, collar: 0.18, hem: 0.86 },
  canvas: { cx: 0.5, cy: 0.5, width: 0.52, taper: 1, collar: 0.12, hem: 0.9 },
  repeat: { cx: 0.5, cy: 0.5, width: 0.62, taper: 0.96, collar: 0.2, hem: 0.86 },
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

function contentBox(image: ImageData) {
  const { width, height, data } = image;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 360));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 246 && g > 246 && b > 246) continue;
      if (r < 10 && g < 10 && b < 10) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX - minX < width * 0.4 || maxY - minY < height * 0.4) {
    return { x: 0, y: 0, w: width, h: height };
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function printArea(
  box: { x: number; y: number; w: number; h: number },
  productId: ProductId,
) {
  const place = placeOf(productId);
  const preset = PRINTIFY_PRESETS[productId];
  const ratio = preset.height / Math.max(1, preset.width);
  let w = box.w * place.width;
  let h = w * ratio;
  const maxH = box.h * (place.hem - place.collar);
  if (h > maxH) {
    h = maxH;
    w = h / ratio;
  }
  let x = box.x + box.w * place.cx - w / 2;
  let y = box.y + box.h * place.cy - h / 2;
  const collar = box.y + box.h * place.collar;
  const hem = box.y + box.h * place.hem;
  if (y < collar) y = collar;
  if (y + h > hem) y = Math.max(collar, hem - h);
  x = Math.max(box.x, Math.min(x, box.x + box.w - w));
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), taper: place.taper };
}

function fitArt(
  areaW: number,
  areaH: number,
  artW: number,
  artH: number,
) {
  const scale = Math.min(areaW / Math.max(1, artW), areaH / Math.max(1, artH));
  const w = Math.max(32, Math.round(artW * scale));
  const h = Math.max(32, Math.round(artH * scale));
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
      if (a < 0.02) continue;
      const px = ox + x;
      const py = oy + y;
      if (px < 0 || py < 0 || px >= pw || py >= photo.height) continue;
      const pi = (py * pw + px) * 4;
      const fr = pd[pi];
      const fg = pd[pi + 1];
      const fb = pd[pi + 2];
      const light = 0.62 + 0.38 * ((fr + fg + fb) / 765);
      const ia = Math.min(1, a * 0.97);
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
): Promise<string> {
  const photo = await loadImage(photoUrl);
  const art = await prepareArt(artUrl, true, true);
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
  const area = printArea(contentBox(mixed), productId);
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
