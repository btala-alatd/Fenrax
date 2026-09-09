import { idbDel, idbGet, idbSet } from "@/lib/idb";
import type { ProductId } from "@/lib/studio-data";

const inflight = new Map<string, Promise<string>>();

export function blankKey(input: {
  audience: string;
  themeId: string;
  productId: ProductId;
  colorId: string;
}) {
  return `blank:2:${input.audience}:${input.themeId}:${input.productId}:${input.colorId}`;
}

export async function getBlank(key: string) {
  try {
    const value = await idbGet<string>(key);
    return typeof value === "string" && value.startsWith("data:image/") ? value : null;
  } catch {
    return null;
  }
}

export async function setBlank(key: string, dataUrl: string) {
  try {
    await idbSet(key, dataUrl);
  } catch {
    /* storage full or private */
  }
}

export async function clearBlank(key: string) {
  inflight.delete(key);
  try {
    await idbDel(key);
  } catch {
    /* ignore */
  }
}

export async function rememberBlank(
  key: string,
  reshoot: boolean,
  factory: () => Promise<string>,
) {
  if (reshoot) await clearBlank(key);
  else {
    const hit = await getBlank(key);
    if (hit) return hit;
    const pending = inflight.get(key);
    if (pending) return pending;
  }
  const job = factory()
    .then(async (url) => {
      await setBlank(key, url);
      return url;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}
