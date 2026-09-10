import { createServerFn } from "@tanstack/react-start";
import {
  MAX_COMPOSED,
  MAX_SOURCE_BYTES,
  isAspectRatioId,
  isStyleId,
  type AspectRatioId,
  type StyleId,
} from "@/lib/studio-data";

export type ImagineResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: string };

type GenerateInput = {
  prompt: string;
  aspectRatio: AspectRatioId;
  styleId: StyleId;
  googleKey?: string;
  xaiKey?: string;
  recraftKey?: string;
};

type EditInput = {
  prompt: string;
  imageDataUrl: string;
  aspectRatio: AspectRatioId;
  styleId: StyleId;
  googleKey?: string;
  xaiKey?: string;
  recraftKey?: string;
};

type ImagineImage = {
  b64_json?: string;
  url?: string;
  mime_type?: string;
};

type ImagineResponse = {
  data?: ImagineImage[];
  error?: { message?: string; code?: string; type?: string };
};

function resolveXaiKey(client?: string) {
  const key = (client || process.env.XAI_API_KEY || "").trim();
  return key || undefined;
}

function parsePrompt(value: unknown): string {
  if (typeof value !== "string") throw new Error("Describe what to print.");
  const prompt = value.trim();
  if (prompt.length > MAX_COMPOSED) throw new Error("That description is too long.");
  return prompt || "Invent a flagship merch graphic. Full designer freedom.";
}

function parseAspect(value: unknown): AspectRatioId {
  if (typeof value !== "string" || !isAspectRatioId(value)) {
    throw new Error("Choose a valid frame.");
  }
  return value;
}

function parseStyle(value: unknown): StyleId {
  if (typeof value !== "string" || !isStyleId(value)) {
    throw new Error("Choose a valid finish.");
  }
  return value;
}

function parseDataUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("data:image/")) {
    throw new Error("Choose an image to edit.");
  }
  if (value.length > MAX_SOURCE_BYTES * 1.4) {
    throw new Error("That image is too large. Try a smaller file.");
  }
  return value;
}

function probeImageSize(dataUrl: string): { width: number; height: number } | null {
  try {
    const comma = dataUrl.indexOf(",");
    if (comma < 0) return null;
    const buf = Buffer.from(dataUrl.slice(comma + 1), "base64");
    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf.length > 16 && buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1]!;
        const len = buf.readUInt16BE(i + 2);
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function longEdge(dataUrl: string) {
  const size = probeImageSize(dataUrl);
  if (!size) return 0;
  return Math.max(size.width, size.height);
}

const MIN_PRINT_EDGE = 2000;

function parseRecraftKey(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const key = value.trim();
  if (!key) return undefined;
  if (key.length < 16 || key.length > 256) throw new Error("That Recraft key looks wrong.");
  return key;
}

function resolveRecraftKey(client?: string) {
  return (client || process.env.RECRAFT_API_KEY || "").trim() || undefined;
}

function parseXaiKey(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const key = value.trim();
  if (!key) return undefined;
  if (key.length < 20 || key.length > 256) throw new Error("That xAI key looks wrong.");
  return key;
}

function parseGoogleKey(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const key = value.trim();
  if (!key) return undefined;
  if (key.length < 20 || key.length > 200) throw new Error("That Google key looks wrong.");
  return key;
}

function resolveGoogleKey(client?: string) {
  return (
    client ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    undefined
  );
}

function isNetworkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /failed to fetch|networkerror|load failed|aborted|timeout|econnreset|etimedout|fetch failed/i.test(
    message,
  );
}

function friendlyError(status: number, body: ImagineResponse | null): string {
  const raw = body?.error?.message?.toLowerCase() ?? "";
  if (status === 400 && (raw.includes("moderat") || raw.includes("violat") || raw.includes("safety"))) {
    return "That prompt was blocked. Try a different description.";
  }
  if (status === 401 || status === 403) {
    if (raw.includes("credit") || raw.includes("spending") || raw.includes("subscription")) {
      return "The built-in printer is out of credits. Add a Google image key in Shop.";
    }
    return "The printer is closed right now. Try again in a moment.";
  }
  if (status === 429) return "The darkroom is busy. Wait a moment and try again.";
  if (status >= 500) return "The printer misfired. Try again in a moment.";
  if (body?.error?.message) return "The printer could not finish that plate.";
  return `Image generation failed (${status}).`;
}

async function fetchJson(url: string, init: RequestInit, attempt = 0): Promise<Response> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(120_000),
    });
    return res;
  } catch (error) {
    if (attempt < 1 && isNetworkError(error)) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return fetchJson(url, init, attempt + 1);
    }
    throw error;
  }
}

async function urlToDataUrl(url: string, mime = "image/jpeg"): Promise<string> {
  const downloaded = await fetchJson(url, { method: "GET" });
  if (!downloaded.ok) {
    throw new Error("The print arrived but could not be opened.");
  }
  const type = downloaded.headers.get("content-type") || mime;
  const buffer = Buffer.from(await downloaded.arrayBuffer());
  return `data:${type};base64,${buffer.toString("base64")}`;
}

function imagineAspect(aspect: AspectRatioId): string {
  if (aspect === "4:5") return "3:4";
  return aspect;
}

function googleAspect(aspect: AspectRatioId): string {
  if (aspect === "4:5") return "3:4";
  return aspect;
}

function splitDataUrl(dataUrl: string): { mime: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1]!, data: match[2]! };
}

function asDataUrl(b64: string, mime = "image/png") {
  const clean = b64.replace(/\s/g, "");
  return `data:${mime};base64,${clean}`;
}

function extractGoogleImage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;

  const candidates = Array.isArray(root.candidates) ? root.candidates : [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const content = (candidate as { content?: { parts?: unknown[] } }).content;
    const parts = content?.parts ?? [];
    for (const part of parts) {
      if (!part || typeof part !== "object") continue;
      const record = part as Record<string, unknown>;
      const inline = (record.inlineData ?? record.inline_data) as
        | { data?: string; mimeType?: string; mime_type?: string }
        | undefined;
      if (inline?.data) {
        return asDataUrl(inline.data, inline.mimeType || inline.mime_type || "image/png");
      }
    }
  }

  const walk = (value: unknown): string | null => {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = walk(item);
        if (found) return found;
      }
      return null;
    }
    const record = value as Record<string, unknown>;
    if (record.type === "image" && typeof record.data === "string" && record.data.length > 80) {
      const mime = typeof record.mime_type === "string" ? record.mime_type : "image/png";
      return asDataUrl(record.data, mime);
    }
    if (typeof record.b64_json === "string") return asDataUrl(record.b64_json, "image/png");
    for (const nested of Object.values(record)) {
      const found = walk(nested);
      if (found) return found;
    }
    return null;
  };

  return walk(root);
}

function googleFriendly(status: number, body: unknown): string {
  const text = JSON.stringify(body ?? {}).toLowerCase();
  if (status === 400 && (text.includes("api key") || text.includes("api_key"))) {
    return "That Google key was rejected. Check it in Shop.";
  }
  if (status === 403 || status === 401) {
    if (text.includes("permission") || text.includes("api_key") || text.includes("unauth")) {
      return "Google said no to that key. Turn on Gemini image in Google AI Studio.";
    }
    return "Google blocked that print. Try again, or check the key.";
  }
  if (status === 429) {
    return "Google is throttling this key. Wait a full minute, then tap 1 design once. Don’t spam Test or 3 HD.";
  }
  if (text.includes("safety") || text.includes("blocked") || text.includes("prohibit")) {
    return "Google blocked that prompt. Try a different description.";
  }
  if (status >= 500) return "Google misfired. Try again in a moment.";
  return "Google could not finish that plate.";
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function callGoogleOnce(
  apiKey: string,
  prompt: string,
  aspect: AspectRatioId,
  imageDataUrl?: string,
  backupReady = false,
): Promise<ImagineResult> {
  const models = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];
  const ratio = googleAspect(aspect);
  const source = imageDataUrl ? splitDataUrl(imageDataUrl) : null;
  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (source) {
    parts.unshift({
      inline_data: {
        mime_type: source.mime,
        data: source.data,
      },
    });
  }

  let lastError = "Google could not finish that plate.";

  const request = async (model: string, imageSize: string) => {
    const res = await fetchJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: { aspectRatio: ratio, imageSize },
          },
        }),
      },
    );
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { res, body };
  };

  const requestWithRetry = async (model: string, imageSize: string) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let res: Response;
      let body: unknown = null;
      try {
        const next = await request(model, imageSize);
        res = next.res;
        body = next.body;
      } catch (error) {
        lastError = isNetworkError(error)
          ? "Could not reach Google. Try again."
          : "Google misfired. Try again.";
        if (attempt < 1 && isNetworkError(error)) {
          await sleep(1500 * 2 ** attempt);
          continue;
        }
        return null;
      }
      if (res.status === 429) {
        lastError = googleFriendly(429, body);
        if (!backupReady && attempt < 1) {
          const retryAfter = Number(res.headers.get("retry-after"));
          const wait = Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter, 25) * 1000
            : 8000;
          await sleep(wait);
          continue;
        }
        return null;
      }
      if (!res.ok) {
        lastError = googleFriendly(res.status, body);
        return { ok: false as const, status: res.status };
      }
      const dataUrl = extractGoogleImage(body);
      if (!dataUrl) {
        lastError = "Google returned an empty plate.";
        return { ok: false as const, status: res.status };
      }
      return { ok: true as const, dataUrl };
    }
    return null;
  };

  for (const model of models) {
    const plate = await requestWithRetry(model, "2K");
    if (plate?.ok) return plate;
  }

  return { ok: false, error: lastError };
}

async function callImagineOnce(
  path: "/v1/images/generations" | "/v1/images/edits",
  payload: Record<string, unknown>,
  apiKey?: string,
): Promise<ImagineResult> {
  const key = resolveXaiKey(apiKey);
  if (!key) {
    return { ok: false, error: "xAI printer needs a key. Paste it in Settings." };
  }

  let res: Response;
  try {
    res = await fetchJson(`https://api.x.ai${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return {
      ok: false,
      error: isNetworkError(error)
        ? "Could not reach the printer. Try again."
        : "The printer misfired. Try again.",
    };
  }

  let body: ImagineResponse | null = null;
  try {
    body = (await res.json()) as ImagineResponse;
  } catch {
    body = null;
  }

  if (!res.ok) {
    return { ok: false, error: friendlyError(res.status, body) };
  }

  const image = body?.data?.[0];
  try {
    if (image?.b64_json) {
      const mime = image.mime_type || "image/jpeg";
      return { ok: true, dataUrl: `data:${mime};base64,${image.b64_json}` };
    }
    if (image?.url) {
      return { ok: true, dataUrl: await urlToDataUrl(image.url, image.mime_type || "image/jpeg") };
    }
  } catch (error) {
    return {
      ok: false,
      error: isNetworkError(error)
        ? "Could not reach the printer. Try again."
        : "The print arrived but could not be opened.",
    };
  }

  return { ok: false, error: "The printer returned an empty plate." };
}

async function callImagine(
  path: "/v1/images/generations" | "/v1/images/edits",
  payload: Record<string, unknown>,
  apiKey?: string,
): Promise<ImagineResult> {
  const first = await callImagineOnce(path, payload, apiKey);
  if (first.ok) return first;
  const retryable = /misfired|busy|could not reach/i.test(first.error);
  if (!retryable) return first;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return callImagineOnce(path, payload, apiKey);
}

const GENERATE_BODY = {
  model: "grok-imagine-image-2.0",
  n: 1 as const,
  resolution: "2k",
  quality: "medium",
  response_format: "url",
};

function recraftSize(aspect: AspectRatioId): string {
  if (aspect === "4:5") return "4:5";
  if (aspect === "3:2") return "3:2";
  if (aspect === "4:3") return "4:3";
  if (aspect === "9:16") return "9:16";
  if (aspect === "16:9") return "16:9";
  if (aspect === "1:1") return "1:1";
  return "3:4";
}

function recraftFriendly(status: number, body: unknown): string {
  const text = JSON.stringify(body ?? {}).toLowerCase();
  if (status === 401 || status === 403) {
    return "Recraft said no to that key. Generate a new API token in Recraft → Profile.";
  }
  if (status === 402 || text.includes("balance") || text.includes("credit") || text.includes("unit")) {
    return "Recraft is out of units. Top up in Recraft.";
  }
  if (status === 429) return "Recraft is busy. Wait a moment and try again.";
  if (status >= 500) return "Recraft misfired. Try again in a moment.";
  return "Recraft could not finish that plate.";
}

function extractRecraftImage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as { data?: ImagineImage[] }).data;
  const image = Array.isArray(data) ? data[0] : undefined;
  if (image?.b64_json) {
    const mime = image.mime_type || "image/png";
    return asDataUrl(image.b64_json, mime);
  }
  return null;
}

async function callRecraftOnce(
  apiKey: string,
  prompt: string,
  aspect: AspectRatioId,
  imageDataUrl?: string,
): Promise<ImagineResult> {
  const size = recraftSize(aspect);
  const body: Record<string, unknown> = {
    prompt,
    model: "recraftv4_1_pro",
    size,
    n: 1,
    response_format: "b64_json",
    controls: {
      background_color: { rgb: [242, 243, 245] },
    },
  };
  const path = imageDataUrl
    ? "https://external.api.recraft.ai/v1/images/imageToImage"
    : "https://external.api.recraft.ai/v1/images/generations";
  if (imageDataUrl) {
    body.image_url = imageDataUrl;
    body.strength = 0.4;
  }

  let res: Response;
  try {
    res = await fetchJson(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return {
      ok: false,
      error: isNetworkError(error) ? "Could not reach Recraft. Try again." : "Recraft misfired. Try again.",
    };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    return { ok: false, error: recraftFriendly(res.status, json) };
  }
  const dataUrl = extractRecraftImage(json);
  if (dataUrl) return { ok: true, dataUrl };
  const url = Array.isArray((json as { data?: { url?: string }[] })?.data)
    ? (json as { data: { url?: string }[] }).data[0]?.url
    : undefined;
  if (url) {
    try {
      return { ok: true, dataUrl: await urlToDataUrl(url, "image/png") };
    } catch {
      return { ok: false, error: "Recraft returned a file that could not be opened." };
    }
  }
  return { ok: false, error: "Recraft returned an empty plate." };
}

async function printWith(
  keys: { google?: string; xai?: string; recraft?: string },
  path: "/v1/images/generations" | "/v1/images/edits",
  payload: Record<string, unknown>,
  prompt: string,
  aspectRatio: AspectRatioId,
  imageDataUrl?: string,
): Promise<ImagineResult> {
  const recraft = resolveRecraftKey(keys.recraft);
  const google = resolveGoogleKey(keys.google);
  const xai = resolveXaiKey(keys.xai);
  if (!recraft && !google && !xai) {
    return {
      ok: false,
      error: "The printer needs a key. Open Settings and paste a Recraft, Google, or xAI key.",
    };
  }

  let best: ImagineResult | null = null;
  let bestEdge = 0;

  if (recraft) {
    const fromRecraft = await callRecraftOnce(recraft, prompt, aspectRatio, imageDataUrl);
    if (fromRecraft.ok) {
      const edge = longEdge(fromRecraft.dataUrl);
      if (edge >= MIN_PRINT_EDGE) return fromRecraft;
      best = fromRecraft;
      bestEdge = edge;
    }
  }

  if (google) {
    const fromGoogle = await callGoogleOnce(google, prompt, aspectRatio, imageDataUrl, Boolean(xai || recraft));
    if (fromGoogle.ok) {
      const edge = longEdge(fromGoogle.dataUrl);
      if (edge >= MIN_PRINT_EDGE) return fromGoogle;
      if (edge > bestEdge) {
        best = fromGoogle;
        bestEdge = edge;
      }
    }
  }

  if (xai) {
    const fromXai = await callImagine(path, payload, xai);
    if (fromXai.ok) {
      const edge = longEdge(fromXai.dataUrl);
      if (edge >= bestEdge) return fromXai;
    }
    if (best) return best;
    return fromXai;
  }

  if (best) return best;
  return {
    ok: false,
    error: recraft
      ? "Recraft could not finish that plate. Google/xAI will try if those keys are saved."
      : "The printer could not finish that plate.",
  };
}

export const generateStill = createServerFn({ method: "POST" })
  .validator((input: unknown): GenerateInput => {
    if (typeof input !== "object" || input === null) {
      throw new Error("Invalid request.");
    }
    const data = input as Record<string, unknown>;
    return {
      prompt: parsePrompt(data.prompt),
      aspectRatio: parseAspect(data.aspectRatio),
      styleId: parseStyle(data.styleId),
      googleKey: parseGoogleKey(data.googleKey),
      xaiKey: parseXaiKey(data.xaiKey),
      recraftKey: parseRecraftKey(data.recraftKey),
    };
  })
  .handler(async ({ data }): Promise<ImagineResult> => {
    try {
      return await printWith(
        { google: data.googleKey, xai: data.xaiKey, recraft: data.recraftKey },
        "/v1/images/generations",
        {
          ...GENERATE_BODY,
          prompt: data.prompt,
          aspect_ratio: imagineAspect(data.aspectRatio),
        },
        data.prompt,
        data.aspectRatio,
      );
    } catch {
      return { ok: false, error: "The printer misfired. Try again." };
    }
  });

export const editStill = createServerFn({ method: "POST" })
  .validator((input: unknown): EditInput => {
    if (typeof input !== "object" || input === null) {
      throw new Error("Invalid request.");
    }
    const data = input as Record<string, unknown>;
    return {
      prompt: parsePrompt(data.prompt),
      imageDataUrl: parseDataUrl(data.imageDataUrl),
      aspectRatio: parseAspect(data.aspectRatio),
      styleId: parseStyle(data.styleId),
      googleKey: parseGoogleKey(data.googleKey),
      xaiKey: parseXaiKey(data.xaiKey),
      recraftKey: parseRecraftKey(data.recraftKey),
    };
  })
  .handler(async ({ data }): Promise<ImagineResult> => {
    try {
      return await printWith(
        { google: data.googleKey, xai: data.xaiKey, recraft: data.recraftKey },
        "/v1/images/edits",
        {
          ...GENERATE_BODY,
          prompt: data.prompt,
          aspect_ratio: imagineAspect(data.aspectRatio),
          image: {
            url: data.imageDataUrl,
            type: "image_url",
          },
        },
        data.prompt,
        data.aspectRatio,
        data.imageDataUrl,
      );
    } catch {
      return { ok: false, error: "The printer misfired. Try again." };
    }
  });

export const testPrinter = createServerFn({ method: "POST" })
  .validator((input: unknown): { googleKey?: string; xaiKey?: string; recraftKey?: string } => {
    if (typeof input !== "object" || input === null) return {};
    const data = input as Record<string, unknown>;
    return {
      googleKey: parseGoogleKey(data.googleKey),
      xaiKey: parseXaiKey(data.xaiKey),
      recraftKey: parseRecraftKey(data.recraftKey),
    };
  })
  .handler(async ({ data }): Promise<ImagineResult> => {
    if (data.recraftKey) {
      const key = resolveRecraftKey(data.recraftKey);
      if (!key) return { ok: false, error: "Paste a Recraft key first." };
      try {
        return await callRecraftOnce(
          key,
          "Isolated two-color merch lockup on even #F2F3F5 field, huge margin, no garment.",
          "1:1",
        );
      } catch {
        return { ok: false, error: "Could not reach Recraft." };
      }
    }
    if (data.xaiKey) {
      const key = resolveXaiKey(data.xaiKey);
      if (!key) return { ok: false, error: "Paste an xAI key first." };
      try {
        return await callImagine(
          "/v1/images/generations",
          {
            ...GENERATE_BODY,
            prompt: "Isolated two-color merch lockup on even #F2F3F5 field, huge margin, no garment.",
            aspect_ratio: "1:1",
          },
          key,
        );
      } catch {
        return { ok: false, error: "Could not reach xAI." };
      }
    }
    const key = resolveGoogleKey(data.googleKey);
    if (!key) {
      return { ok: false, error: "Paste a Google Gemini key first." };
    }
    try {
      return await callGoogleOnce(
        key,
        "Isolated two-color merch lockup BT on even #F2F3F5 field, huge margin, no garment.",
        "1:1",
      );
    } catch {
      return { ok: false, error: "Could not reach Google." };
    }
  });
