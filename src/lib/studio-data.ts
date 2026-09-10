import {
  DEFAULT_BRAND,
  coerceHex,
  fillBrand,
  themeOf,
  type Brand,
} from "@/lib/brand";

export const ASPECT_RATIOS = [
  { id: "1:1", label: "Square", w: 1, h: 1 },
  { id: "3:4", label: "Tall", w: 3, h: 4 },
  { id: "9:16", label: "Story", w: 9, h: 16 },
  { id: "16:9", label: "Wide", w: 16, h: 9 },
  { id: "4:3", label: "Board", w: 4, h: 3 },
  { id: "4:5", label: "Canvas", w: 4, h: 5 },
  { id: "3:2", label: "Spread", w: 3, h: 2 },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

export const PRODUCTS = [
  {
    id: "tee",
    label: "Tee",
    suffix:
      " Isolated Printify DTG full-front graphic, 15×18 in canvas at maximum resolution. Even #F2F3F5 field, art fills 85–92% of the frame, no garment, no shadow, no mockup.",
  },
  {
    id: "back",
    label: "Back",
    suffix:
      " Isolated Printify DTG full-back graphic, 15×18 in. Giant back print, even #F2F3F5 field, huge margin, no garment.",
  },
  {
    id: "chest",
    label: "Chest",
    suffix:
      " Isolated Printify left-chest mark, 6×6 in. ONE single compact mark only — no secondary objects, no separate props, no second illustration beside it. Thick strokes, even #F2F3F5 field, no hairlines, no garment.",
  },
  {
    id: "long",
    label: "Long",
    suffix:
      " Isolated Printify long-sleeve front graphic, 15×18 in. Even #F2F3F5 field, huge margin, no sleeve photo.",
  },
  {
    id: "tank",
    label: "Tank",
    suffix:
      " Isolated Printify tank-front graphic, 12×16 in. Even #F2F3F5 field, huge margin, no garment.",
  },
  {
    id: "hoodie",
    label: "Hoodie",
    suffix:
      " Isolated Printify hoodie-front graphic, 15×18 in. Even #F2F3F5 field, huge margin, no pocket, no cords.",
  },
  {
    id: "crew",
    label: "Crew",
    suffix:
      " Isolated Printify crewneck graphic, 15×18 in. Even #F2F3F5 field, huge margin, no garment photo.",
  },
  {
    id: "tote",
    label: "Tote",
    suffix:
      " Isolated Printify tote-bag graphic, 14×16 in. Even #F2F3F5 field, centered, no bag photo, no handles.",
  },
  {
    id: "hat",
    label: "Hat",
    suffix:
      " Compact Printify cap mark, 6×4 in. Thick geometry, two or three colors, even #F2F3F5 field, no hairline detail.",
  },
  {
    id: "mug",
    label: "Mug",
    suffix:
      " Printify 11oz mug-wrap graphic, 9×3.75 in landscape. Art in the center third, even #F2F3F5 field, no mug photo, keep sides empty for the handle.",
  },
  {
    id: "tumbler",
    label: "Drink",
    suffix:
      " Printify tumbler wrap, wide landscape. Even #F2F3F5 field, art centered, no cup photo, wrap-safe.",
  },
  {
    id: "sticker",
    label: "Sticker",
    suffix:
      " Printify die-cut sticker, 6×6 in. Bold silhouette, thick strokes, even #F2F3F5 field, clean edge.",
  },
  {
    id: "poster",
    label: "Poster",
    suffix:
      " Isolated Printify poster art, 12×16 in. Even #F2F3F5 field, centered graphic, no frame, no wall.",
  },
  {
    id: "pillow",
    label: "Pillow",
    suffix:
      " Isolated Printify throw-pillow graphic, 16×16 in square. Even #F2F3F5 field, centered, no pillow photo.",
  },
  {
    id: "phone",
    label: "Phone",
    suffix:
      " Isolated Printify phone-case graphic, tall portrait. Even #F2F3F5 field, centered, no case photo, no camera cutout.",
  },
  {
    id: "baby",
    label: "Baby",
    suffix:
      " Isolated Printify baby-onesie graphic. Compact, thick fills, even #F2F3F5 field, no garment photo.",
  },
  {
    id: "canvas",
    label: "Canvas",
    suffix:
      " Isolated Printify gallery-canvas art. Even #F2F3F5 field, centered, no frame, no wall.",
  },
  {
    id: "repeat",
    label: "AOP",
    suffix:
      " Seamless tileable all-over print for Printify AOP. Edges match. Original house pattern. Even #F2F3F5 field.",
  },
] as const;

export type ProductId = (typeof PRODUCTS)[number]["id"];

export const LENSES = [
  { id: "plate", label: "Graphic" },
] as const;

export type LensId = "plate" | "lookbook";

export const LEADS = [
  { id: "brand", label: "Brand", hint: "Mark leads" },
  { id: "art", label: "Art", hint: "Design leads" },
] as const;

export type LeadId = (typeof LEADS)[number]["id"];

export const STYLES = [
  { id: "drop", label: "Drop" },
  { id: "chrome", label: "Chrome" },
  { id: "vintage", label: "Vintage" },
  { id: "type", label: "Type" },
  { id: "line", label: "Line" },
  { id: "tattoo", label: "Tattoo" },
  { id: "floral", label: "Floral" },
  { id: "liquid", label: "Liquid" },
  { id: "grunge", label: "Grunge" },
  { id: "vector", label: "Vector" },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];

export const CATEGORIES = [
  { id: "lockup", label: "Lockup", hint: "Giant initials" },
  { id: "wordmark", label: "Wordmark", hint: "Name only" },
  { id: "box", label: "Box", hint: "Boxed mark" },
  { id: "tour", label: "Tour", hint: "Map graphic" },
  { id: "coords", label: "Coords", hint: "Compass" },
  { id: "crest", label: "Crest", hint: "Emblem" },
  { id: "slogan", label: "Slogan", hint: "Your line" },
  { id: "blueprint", label: "Blueprint", hint: "Diagram" },
  { id: "trail", label: "Trail", hint: "Stamp" },
  { id: "issue", label: "Issue", hint: "Numbered" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const DROP_SLOTS = [
    { categoryId: "lockup", leadId: "brand", note: "Hero mark. Giant initials as geometry. Picture first. No extra words." },
    { categoryId: "wordmark", leadId: "brand", note: "The house name only, spelled perfectly. No extra words." },
    { categoryId: "crest", leadId: "brand", note: "Invented emblem. Initials inside. No slogans." },
] as const;

export const DROP_COUNT = DROP_SLOTS.length;

export function dropSlots() {
  return DROP_SLOTS;
}

const STYLE_ALIASES: Record<string, StyleId> = {
  street: "drop",
  house: "type",
  mark: "line",
  sport: "liquid",
  scarf: "floral",
};

function styleSuffix(styleId: StyleId, brand: Brand): string {
  const initials = brand.initials.trim() || brand.name.trim().slice(0, 2).toUpperCase() || "mark";
  const name = brand.name.trim() || "the house";
  switch (styleId) {
    case "drop":
      return ` Billboard merch, one giant simple shape, oversized ${initials}.`;
    case "chrome":
      return ` Y2K chrome, liquid metal, inflatable 3D, iridescent ${initials}.`;
    case "vintage":
      return ` 90s boxy merch poster, muted flat screen-print inks, no crackle, no grain.`;
    case "type":
      return ` Typography plate. Only ${name.toUpperCase()} or ${initials}, spelled correctly.`;
    case "line":
      return ` Single-weight line drawing, editorial negative space. Tiny ${initials}.`;
    case "tattoo":
      return ` Traditional tattoo flash, bold outline, two fills. Tiny ${initials}. Original, not Sailor Jerry.`;
    case "floral":
      return ` Botanical fashion print, original plants. Tiny ${initials}.`;
    case "liquid":
      return ` 3D liquid blob, chrome drip. ${initials} as a 3D object.`;
    case "grunge":
      return ` Skater xerox SHAPES, fat halftone OK, no dirt overlay, no fake lyrics.`;
    case "vector":
      return ` Flat vector merch, 2–4 solid fills, hard edges, screen-print separations.`;
  }
}

function categorySuffix(categoryId: CategoryId, brand: Brand, hasSubject: boolean): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  const upper = name.toUpperCase();
  if (hasSubject) {
    switch (categoryId) {
      case "lockup":
        return ` Layout: that subject locked with giant ${initials} as one mark.`;
      case "wordmark":
        return ` Layout: ignore the subject — paint only the letters ${upper}.`;
      case "box":
        return ` Layout: that subject inside one heavy box with ${initials}.`;
      case "crest":
        return ` Layout: one crest. That subject is the only charge. Small ${initials} inside.`;
      case "slogan":
        return ` Layout: that picture, lower third empty. No painted sentence.`;
      case "tour":
        return ` Layout: that subject as a map or ticket graphic. Tiny ${initials}. No city names.`;
      case "coords":
        return ` Layout: that subject as a compass/locale mark. Tiny ${initials}.`;
      case "blueprint":
        return ` Layout: that subject as a technical diagram. Tiny ${initials}.`;
      case "trail":
        return ` Layout: that subject as an outdoor stamp. Tiny ${initials}.`;
      case "issue":
        return ` Layout: that subject giant, a small 01, tiny ${initials}.`;
    }
  }
  const kids = brand.audience === "kids";
  const picture = kids
    ? "Chunky kids merch, two or three colors."
    : "Bold adult merch, two or three colors.";
  switch (categoryId) {
    case "lockup":
      return ` LOCKUP: giant ${initials} as geometry is the whole design. ${picture}`;
    case "wordmark":
      return ` WORDMARK: paint only ${upper}, every letter in order, no icons.`;
    case "box":
      return ` BOX: ${initials} inside one heavy box. ${picture}`;
    case "tour":
      return ` TOUR: invented map or ticket picture. Tiny ${initials}. No city names.`;
    case "coords":
      return ` COORDS: compass picture, invented ticks. Tiny ${initials}.`;
    case "crest":
      return ` CREST: one emblem, one motif, ${initials} inside once. Never paint ${upper}. ${picture}`;
    case "slogan":
      return ` Picture for ${name}, lower third empty. Do not paint a slogan.`;
    case "blueprint":
      return ` BLUEPRINT of an invented ${initials} object. Tiny ${initials}.`;
    case "trail":
      return ` Trail stamp: ridge or topo. Small ${initials}.`;
    case "issue":
      return ` One giant motif, small 01, tiny ${initials}.`;
  }
}

function animeSuffix(brand: Brand): string {
  const initials = brand.initials.trim() || brand.name.trim().slice(0, 2).toUpperCase() || "FR";
  return ` Anime/manga cel-shade, original character only. Tiny ${initials}. No copied IP.`;
}

function leadSuffix(leadId: LeadId, brand: Brand): string {
  const initials = brand.initials.trim() || brand.name.trim().slice(0, 2).toUpperCase() || "FR";
  if (leadId === "art") {
    return ` Art leads. Tiny ${initials} like a neck label.`;
  }
  return ` Brand leads. ${initials} is large and readable.`;
}

export const EXAMPLE_TEMPLATES = [
  {
    title: "Chrome drop",
    styleId: "chrome" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "1:1" as AspectRatioId,
    prompt:
      "{name} chrome {theme} tee: liquid-metal {initials}, {motifs}, Y2K iridescent, thumbnail-bold",
  },
  {
    title: "Vintage tee",
    styleId: "vintage" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "1:1" as AspectRatioId,
    prompt:
      "{name} vintage {theme} tee: era {initials} lockup, flat {motifs}, 90s merch poster, no distress",
  },
  {
    title: "Type lockup",
    styleId: "type" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "1:1" as AspectRatioId,
    prompt:
      "{NAME} typography tee: giant wordmark, {theme} type, {initials} as letter, one accent",
  },
  {
    title: "Tattoo flash",
    styleId: "tattoo" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "1:1" as AspectRatioId,
    prompt:
      "{name} tattoo-flash {theme} tee: bold {motifs}, traditional outlines, {initials} crest",
  },
] as const;

export function examplesFor(brand: Brand) {
  return EXAMPLE_TEMPLATES.map((example) => ({
    ...example,
    prompt: fillBrand(example.prompt, brand),
  }));
}

export const MAX_PROMPT = 2000;
export const MAX_COMPOSED = 4000;
export const MAX_SOURCE_BYTES = 16 * 1024 * 1024;

export type StudioMode = "create" | "edit";

export type Still = {
  id: string;
  prompt: string;
  composedPrompt: string;
  aspectRatio: AspectRatioId;
  styleId: StyleId;
  productId: ProductId;
  categoryId: CategoryId;
  leadId: LeadId;
  lens: LensId;
  anime: boolean;
  dataUrl: string;
  createdAt: number;
  mode: StudioMode;
};

export function composePrompt(
  prompt: string,
  styleId: StyleId,
  productId: ProductId,
  brand: Brand,
  _lens: LensId = "plate",
  salt = "",
  categoryId: CategoryId = "lockup",
  leadId: LeadId = "brand",
  anime = false,
): string {
  const trimmed = prompt.trim();
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase();
  const ink = coerceHex(brand.ink, DEFAULT_BRAND.ink);
  const paper = coerceHex(brand.paper, DEFAULT_BRAND.paper);
  const accent = coerceHex(brand.accent, DEFAULT_BRAND.accent);
  const product = PRODUCTS.find((item) => item.id === productId);
  const theme = themeOf(brand);
  const kids = brand.audience === "kids";
  const women = brand.audience === "women";
  const who = kids ? "kids" : women ? "women's" : "men's";
  const motif = (brand.motifs.trim() || theme.motifs).split(",")[0]?.trim() || theme.hook;
  const subject = trimmed
    ? `DRAW THIS, highest priority: ${trimmed}. That is the only subject. One object, no extra props, no collage.`
    : `Invent one ${theme.label.toLowerCase()} merch graphic of ${motif}.`;
  const mark =
    categoryId === "wordmark"
      ? `The only letters in the image are ${name.toUpperCase()}, spelled correctly once.`
      : `The only letters in the image are ${initials}, painted once. Do not write ${name.toUpperCase()} or any other word.`;
  const lines = [
    `Isolated Printify DTG print file for ${name}, a ${who} ${theme.label} shop. 2D graphic only — no shirt, no photo, no mockup, no person.`,
    subject,
    trimmed ? "" : leadSuffix(leadId, brand),
    categorySuffix(categoryId, brand, Boolean(trimmed)),
    styleSuffix(styleId, brand),
    anime ? animeSuffix(brand) : "",
    mark,
    `Inks: ${ink} and ${accent} on even matte #F2F3F5 (RGB 242,243,245). Paper hex ${paper} is the shop paper, not a drawn background. Two or three flat colors. No black canvas.`,
    `Look: ${theme.hook}.`,
    kids
      ? "Kids merch: chunky, round, original house creature OK. Never copy Disney, Pokémon, Marvel, Paw Patrol, Hello Kitty, or Labubu."
      : "",
    brand.notes.trim(),
    "Centered, fills 85–92% of the frame, thick strokes, hard edges, sticker-like isolation. No distress, grain, gradient, drop shadow, or fine engraving.",
    product?.suffix ?? "",
    salt ? `Variation ${salt}. New composition.` : "",
  ];
  return lines.filter(Boolean).join(" ").replace(/\s+/g, " ").trim().slice(0, MAX_COMPOSED);
}

export function isAspectRatioId(value: string): value is AspectRatioId {
  return ASPECT_RATIOS.some((item) => item.id === value);
}

export function isStyleId(value: string): value is StyleId {
  return STYLES.some((item) => item.id === value);
}

export function isProductId(value: string): value is ProductId {
  return PRODUCTS.some((item) => item.id === value);
}

export function coerceStyleId(value: string): StyleId {
  if (isStyleId(value)) return value;
  return STYLE_ALIASES[value] ?? "drop";
}

export function coerceAspectRatioId(value: string): AspectRatioId {
  return isAspectRatioId(value) ? value : "1:1";
}

export function coerceProductId(value: unknown): ProductId {
  return typeof value === "string" && isProductId(value) ? value : "tee";
}

export function isLensId(value: string): value is LensId {
  return value === "plate" || value === "lookbook";
}

export function coerceLensId(_value: unknown): LensId {
  return "plate";
}

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORIES.some((item) => item.id === value);
}

export function coerceCategoryId(value: unknown): CategoryId {
  return typeof value === "string" && isCategoryId(value) ? value : "lockup";
}

export function isLeadId(value: string): value is LeadId {
  return LEADS.some((item) => item.id === value);
}

export function coerceLeadId(value: unknown): LeadId {
  return typeof value === "string" && isLeadId(value) ? value : "brand";
}
