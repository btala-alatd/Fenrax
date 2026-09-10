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
  const theme = themeOf(brand);
  const world = theme.label.toLowerCase();
  switch (styleId) {
    case "drop":
      return ` Hero merch PICTURE. One giant ${world} image, oversized ${initials} as a mark, billboard-simple. Almost no type. ${theme.hook}.`;
    case "chrome":
      return ` 2026 Y2K chrome PICTURE. Liquid metal, iridescent, inflatable 3D, chrome ${initials}. No slogans. Still ${world}.`;
    case "vintage":
      return ` Vintage merch LAYOUT: 90s boxy-tee scale, clean era poster. Muted flat inks. No crackle, no speckle, no faded wash, no noise, no engraving lines, no crosshatch shading, no fine stipple — flat screen-print shapes only. ${world} as a clean screen-print picture. Almost no type.`;
    case "type":
      return ` Typography plate. The ONLY words are ${name.toUpperCase()} or ${initials}, spelled perfectly. No other letters. Swiss / varsity / brutal. ${world} attitude.`;
    case "line":
      return ` Single-weight line PICTURE. Editorial negative space, contour of ${world} motifs. ${initials} small. No slogans.`;
    case "tattoo":
      return ` Traditional tattoo flash PICTURE. Bold outlines, limited fills. Original ${world} flash. ${initials} as a tiny flash mark. No sentences. Never copy Sailor Jerry.`;
    case "floral":
      return ` Botanical fashion PICTURE. Florals, leaves, scarf density, original ${world} plants. No words except a tiny ${initials}.`;
    case "liquid":
      return ` 3D liquid blob PICTURE. Inflatable volume, chrome drip. ${initials} as a 3D object. No slogans.`;
    case "grunge":
      return ` Skater PICTURE. Bold xerox SHAPES, big collage pieces, 90s zine layout. Fat halftone OK. No dirt overlay, no fake lyrics, no fake band names.`;
    case "vector":
      return ` Flat merch vector PICTURE, 2–4 hard fills, one accent slash. Screen-print separations. Hard edges, solid ink. No grain, no crackle, no distress, no gradients, no photo, no mockup. Almost no type. ${theme.hook}.`;
  }
}

function categorySuffix(categoryId: CategoryId, brand: Brand): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  const upper = name.toUpperCase();
  const kids = brand.audience === "kids";
  const picture = kids
    ? "Kids picture: chunky, round, two or three colors, original house creature OK."
    : "Adult merch picture: bold, thumbnail-simple, two or three colors.";
  switch (categoryId) {
    case "lockup":
      return ` LOCKUP. Giant ${initials} as geometry is the whole design — the ONLY shape in frame, painted once. ${picture} No extra words, no slogan, no verse, no banner, no props resting beside or crossed behind the letters.`;
    case "wordmark":
      return ` WORDMARK. Paint ONLY the letters ${upper}. Every letter, in order, none missing, none extra, none cropped. No icons, no slogan, no second line.`;
    case "box":
      return ` BOX. ${initials} inside an invented heavy box or bar. Centered. ${picture} No extra words.`;
    case "tour":
      return ` TOUR. A map, route, or ticket-stub PICTURE for ${upper}. Abstract places, no city names (names get misspelled). Tiny ${initials}. No slogans.`;
    case "coords":
      return ` COORDS. Compass, ticks, and invented numbers as a locale PICTURE. Tiny ${initials}. No sentences.`;
    case "crest":
      return ` CREST. Invented emblem for ${name}. Shield or seal with ONE motif as the charge — not a collage of motifs, not a display case of separate objects. ${initials} inside, painted once. ${picture} No slogans, no mottos, no fake latin, no ribbons or banners with lettering, no objects floating outside the shield.`;
    case "slogan":
      return ` SLOGAN plate. Paint a PICTURE for ${name}. Leave the lower third empty for real type. Do not invent a sentence. Do not paint a slogan.`;
    case "blueprint":
      return ` BLUEPRINT. Technical diagram PICTURE of an invented ${initials} object. Drafting lines, exploded view. Tiny ${initials}. No sentences.`;
    case "trail":
      return ` TRAIL. Outdoor stamp PICTURE: ridge, topo, trail mark. Small ${initials}. No slogans.`;
    case "issue":
      return ` ISSUE. Catalog drop PICTURE. One giant motif, a small number like 01, tiny ${initials}. No sentences.`;
  }
}

function animeSuffix(brand: Brand): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  return ` ANIME MODE. Original anime / manga PICTURE for ${name}. Cel-shaded, bold ink, invented character or scene. Tiny ${initials}. No copied IP. No slogans. Isolated 2D graphic.`;
}

function leadSuffix(leadId: LeadId, brand: Brand): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  if (leadId === "art") {
    return ` LEAD ART. The design is the hero — illustration, motif, scene — 90% of the frame. Branding is a whisper: tiny ${initials} mark only, like a woven neck label. Do not spell ${name} — only the mark, added afterward. No giant wordmark, no chest-spanning name. Genius pass: invent a new image. Risk. One unforgettable idea. Unlimited original invention, never a template.`;
  }
  return ` LEAD BRAND. The ${initials} mark is the hero — large, owned, readable at a glance. Do not spell ${name} — paint the mark only, the full name is added afterward.`;
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
  const notes = brand.notes.trim();
  const product = PRODUCTS.find((item) => item.id === productId);
  const theme = themeOf(brand);
  const women = brand.audience === "women";
  const kids = brand.audience === "kids";
  const who = kids ? "kids" : women ? "women's" : "men's";
  const audienceLine = kids
    ? "Designed for a KIDS clothing shop. Playful, thumbnail-bold, original house only. Age-appropriate. Never copy Disney, Pokémon, Marvel, Paw Patrol, Hello Kitty, Labubu, or any existing character."
    : women
      ? "Designed for a WOMEN'S clothing shop. Feminine merch energy, thumbnail-bold, original house only."
      : "Designed for a MEN'S clothing shop. Masculine merch energy, thumbnail-bold, original house only.";
  const kidsCraft = kids
    ? "Kids merch craft: chunky picture, rounded geometry, color-block, original animal or mascot, one giant idea. No movie characters, no clipart, no Disney. Almost no type."
    : "";
  const spelled = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .split("")
    .join("-");
  const typeLaw = `COPY LOCK. Allowed letters in the image: ${initials} — painted once, only once — and ${name.toUpperCase()} (${spelled || initials}) only if this is a wordmark. Never spell the house name any other way: no letter-by-letter spelling, no dots, dashes, or spaces between the letters, no ribbon, banner, plaque, or plate carrying the name. No other words. No slogans. No verses. No mottos. No fake latin. No city names. No lyrics. No psalm. No sentences. Never paint the mark twice in the same image. If you need a caption, leave the bottom empty. Picture first.`;
  const direction = [
    `You are a professional merch art director designing a Printify print FILE for ${name}.`,
    `House: ${name}. Mark: ${initials}. Motifs: ${brand.motifs.trim() || theme.motifs}.`,
    `Direction: ${theme.label} for ${who}. ${theme.world} Use that as a starting world, not a cage.`,
    `${theme.hook}.`,
    audienceLine,
    `Palette only — ink ${ink}, paper ${paper}, accent ${accent}. Two or three colors. No extra hues.`,
    `Attitude: ${brand.vibe.trim() || theme.vibe}.`,
    notes,
    kidsCraft,
    typeLaw,
    "Original house only — not generic, not clipart, not a copy. Theme and audience are a compass. Full designer freedom inside that compass.",
    "PRINT FILE for Printify Product Creator. Isolated 2D graphic only.",
    "Never a photo. Never a model. Never a body. Never a garment. Never fabric texture. Never a hanger. Never wrinkles. Never a mockup. Never a lifestyle shot. Never a watermark. Never UI chrome.",
    "Centered on a perfectly even matte #F2F3F5 field. Uniform RGB 242,243,245 — no gradient, no vignette, no floor, no drop shadow. The field is empty studio, not part of the design.",
    "The graphic fills 85–92% of the frame. Tight crop. Billboard-simple. Readable as a 200px thumbnail.",
    "Solid fills, thick strokes. No hairlines. No chips in letters. No broken outlines. No stray dots. No drop shadow under the art. No paper grain behind it.",
    "FAIL if the studio field is black or dark. Never fill the canvas with black. Dark ink is only allowed inside the mark. FAIL if you add distress, crackle, speckle, noise, photocopy grain, worn paper, or a faded-wash texture. Ink is flat and opaque. Two or three solid colors only.",
    "The gray field will be deleted to a transparent PNG. Letter holes (O, A, R) must be the same even gray so they knock out.",
    "Ultra-sharp merch illustration. Maximum resolution 4K print file. Crisp ink edges, clean fills, high-frequency linework, no blur, no muddy gradients, no JPEG mush. Print-ready.",
    "Registration ticks or crosshairs only if they are inked as part of the graphic, never as a gray canvas.",
    `Invent original ${name} merch. Compass: ${theme.label} × ${who}. Full designer freedom inside that. Never copy a known logo or trademark.`,
    "Craft bar: flagship Printify art, original, sharper than a mall tee.",
    salt ? `Genius print ${salt}. New composition, not a repeat.` : "",
  ];
  const productBit = product?.suffix ?? "";
  const suffix = `${anime ? animeSuffix(brand) : ""}${leadSuffix(leadId, brand)}${categorySuffix(categoryId, brand)}${styleSuffix(styleId, brand)}${productBit}`;
  const idea = trimmed
    ? `PICTURE direction only — do not paint these words: ${trimmed}`
    : `Draw one unforgettable ${theme.label.toLowerCase()} PICTURE for ${who}. No words except the mark. Do not ask. Just draw.`;
  const finalCompliance =
    " FINAL CHECK before you draw — banned no matter what: any extra text, a second copy of the mark, letters spelled with dots or dashes between them, ribbons, banners, plaques, coins, stamps, crossed rods, reels, loose hooks or lures beside the mark, gradients, distress. ONE clean mark, nothing else in frame.";
  const body = `${direction.filter(Boolean).join(" ")} ${idea}${suffix}`;
  const budget = Math.max(0, MAX_COMPOSED - finalCompliance.length);
  return `${body.slice(0, budget)}${finalCompliance}`;
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
