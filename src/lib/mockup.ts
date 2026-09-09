import { loadImage } from "@/lib/image-file";
import { prepareArt } from "@/lib/printify";
import type { ProductId } from "@/lib/studio-data";

type Place = {
  cx: number;
  cy: number;
  width: number;
  taper: number;
};

const PLACE: Record<ProductId, Place> = {
  tee: { cx: 0.5, cy: 0.445, width: 0.36, taper: 0.94 },
  long: { cx: 0.5, cy: 0.445, width: 0.34, taper: 0.94 },
  tank: { cx: 0.5, cy: 0.42, width: 0.32, taper: 0.95 },
  hoodie: { cx: 0.5, cy: 0.4, width: 0.33, taper: 0.93 },
  crew: { cx: 0.5, cy: 0.43, width: 0.34, taper: 0.94 },
  chest: { cx: 0.385, cy: 0.385, width: 0.125, taper: 0.97 },
  back: { cx: 0.5, cy: 0.44, width: 0.4, taper: 0.94 },
  baby: { cx: 0.5, cy: 0.46, width: 0.28, taper: 0.96 },
  tote: { cx: 0.5, cy: 0.52, width: 0.38, taper: 1 },
  hat: { cx: 0.5, cy: 0.42, width: 0.22, taper: 0.88 },
  mug: { cx: 0.48, cy: 0.48, width: 0.28, taper: 0.9 },
  tumbler: { cx: 0.5, cy: 0.48, width: 0.22, taper: 0.92 },
  sticker: { cx: 0.5, cy: 0.5, width: 0.42, taper: 1 },
  poster: { cx: 0.5, cy: 0.48, width: 0.36, taper: 1 },
  pillow: { cx: 0.5, cy: 0.5, width: 0.4, taper: 1 },
  phone: { cx: 0.5, cy: 0.5, width: 0.28, taper: 0.98 },
  canvas: { cx: 0.5, cy: 0.48, width: 0.4, taper: 1 },
  repeat: { cx: 0.5, cy: 0.46, width: 0.5, taper: 0.96 },
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

function drawTapered(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  taper: number,
) {
  const strips = 32;
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
      const light = 0.58 + 0.42 * ((fr + fg + fb) / 765);
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
): Promise<string> {
  const photo = await loadImage(photoUrl);
  const art = await prepareArt(artUrl, true, true);
  const place = placeOf(productId);
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

  const destW = Math.max(32, Math.round(width * place.width));
  const destH = Math.max(32, Math.round(destW * (art.height / Math.max(1, art.width))));
  const x = Math.round(width * place.cx - destW / 2);
  const y = Math.round(height * place.cy - destH / 2);

  const overlay = document.createElement("canvas");
  overlay.width = destW;
  overlay.height = destH;
  const octx = overlay.getContext("2d");
  if (!octx) throw new Error("Could not stamp the print.");
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  drawTapered(octx, art, 0, 0, destW, destH, place.taper);

  const mixed = ctx.getImageData(0, 0, width, height);
  const ink = octx.getImageData(0, 0, destW, destH);
  sitInFabric(mixed, ink, x, y);
  ctx.putImageData(mixed, 0, 0);

  return canvasToPng(canvas);
}
