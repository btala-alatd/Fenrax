import { type Brand } from "@/lib/brand";
import { loadImage } from "@/lib/image-file";
import type { CategoryId } from "@/lib/studio-data";

function isShortCopy(value: string) {
  const text = value.trim();
  if (text.length < 4 || text.length > 48) return false;
  if (text.split(/\s+/).length > 8) return false;
  if (/^(draw|make|create|design|a |an |the |otter|bear|lion|dove)/i.test(text)) return false;
  return true;
}

export function plateCopy(
  brand: Brand,
  prompt: string,
  categoryId: CategoryId,
): { name: string; lines: string[] } {
  const name = brand.name.trim().toUpperCase();
  const showName = categoryId !== "wordmark";
  const lines: string[] = [];
  const user = prompt.trim();
  if (isShortCopy(user)) lines.push(user.toUpperCase());
  return { name: showName ? name : "", lines };
}

export async function letterPlate(
  dataUrl: string,
  copy: { name: string; lines: string[] },
  ink: string,
  accent: string,
) {
  if (!copy.name && copy.lines.length === 0) return dataUrl;
  const image = await loadImage(dataUrl);
  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  const gap = Math.max(16, Math.round(srcW * 0.055));
  const nameSize = Math.max(42, Math.round(srcW * 0.13));
  const lineSize = Math.max(22, Math.round(srcW * 0.052));
  const block =
    gap +
    (copy.name ? nameSize + Math.round(gap * 0.35) : 0) +
    copy.lines.length * (lineSize + Math.round(gap * 0.32)) +
    gap;
  const canvas = document.createElement("canvas");
  canvas.width = srcW;
  canvas.height = srcH + block;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let y = srcH + Math.round(gap * 0.25);
  if (copy.name) {
    ctx.fillStyle = accent;
    ctx.font = `900 ${nameSize}px Impact, "Arial Black", system-ui, sans-serif`;
    ctx.fillText(copy.name, srcW / 2, y, srcW * 0.92);
    y += nameSize + Math.round(gap * 0.28);
  }
  ctx.fillStyle = ink;
  ctx.font = `800 ${lineSize}px Impact, "Arial Black", system-ui, sans-serif`;
  for (const line of copy.lines) {
    ctx.fillText(line, srcW / 2, y, srcW * 0.92);
    y += lineSize + Math.round(gap * 0.3);
  }
  return canvas.toDataURL("image/png");
}
