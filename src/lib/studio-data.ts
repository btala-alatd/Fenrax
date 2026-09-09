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
      " Isolated Printify DTG full-front graphic, 15×18 in canvas. Even #F2F3F5 field, huge empty margin, no garment, no shadow, no mockup.",
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
      " Isolated Printify left-chest mark, 6×6 in. Compact, thick strokes, even #F2F3F5 field, no hairlines, no garment.",
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
  { id: "wordmark", label: "Wordmark", hint: "Name as the art" },
  { id: "box", label: "Box", hint: "Centered mark" },
  { id: "tour", label: "Tour", hint: "Cities list" },
  { id: "coords", label: "Coords", hint: "Lat / long" },
  { id: "crest", label: "Crest", hint: "House emblem" },
  { id: "slogan", label: "Slogan", hint: "One line" },
  { id: "blueprint", label: "Blueprint", hint: "Technical plate" },
  { id: "trail", label: "Trail", hint: "Outdoor stamp" },
  { id: "issue", label: "Issue", hint: "Catalog number" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const DROP_SLOTS = [
    { categoryId: "lockup", leadId: "brand", note: "SKU 01 hero mark. Giant initials. The listing thumbnail." },
    { categoryId: "wordmark", leadId: "brand", note: "SKU 02 wordmark. The house name IS the graphic." },
    { categoryId: "box", leadId: "brand", note: "SKU 03 boxed mark. Centered bar, two colors." },
    { categoryId: "tour", leadId: "brand", note: "SKU 04 tour poster. Cities and camps from this house." },
    { categoryId: "coords", leadId: "art", note: "SKU 05 locale plate. Coordinates and compass ticks." },
    { categoryId: "crest", leadId: "brand", note: "SKU 06 crest. Invented heraldry for the house." },
    { categoryId: "slogan", leadId: "brand", note: "SKU 07 manifesto. One sentence as the graphic." },
    { categoryId: "blueprint", leadId: "art", note: "SKU 08 technical plate. Drafting-table graphic." },
    { categoryId: "trail", leadId: "art", note: "SKU 09 outdoor stamp. Ridge and topo." },
    { categoryId: "issue", leadId: "art", note: "SKU 10 catalog issue. Numbered drop energy." },
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
      return ` Hero merch drop. One giant ${world} idea, oversized ${initials}, billboard-simple, thumbnail-killer. ${theme.hook}.`;
    case "chrome":
      return ` 2026 Y2K chrome. Liquid metal, iridescent, inflatable 3D, cyber highlights, chrome ${initials}. Still clearly ${world}.`;
    case "vintage":
      return ` Vintage merch LAYOUT only: 90s boxy-tee scale, era type, bootleg-poster composition. Muted flat inks. No crackle, no speckle, no faded-wash texture, no noise overlay. ${world} motifs as clean screen print.`;
    case "type":
      return ` Oversized typography poster. Giant ${name.toUpperCase()} or ${initials} IS the design. Swiss, varsity, or brutal type. ${world} attitude in the lettering.`;
    case "line":
      return ` Trendy single-weight line art. Editorial, lots of negative space, one-line or fine tattoo line. ${initials} and ${world} motifs as clean contour.`;
    case "tattoo":
      return ` Traditional tattoo flash. Bold outlines, limited fills, flash-sheet composition, original ${world} flash — never copy Sailor Jerry or branded flash.`;
    case "floral":
      return ` Modern botanical fashion print. Trendy florals, leaves, celestial plants, scarf density, original species for this ${world} house.`;
    case "liquid":
      return ` 3D liquid blob and inflatable supershape. Toy-like volume, chrome drip, sticky 3D, very now. ${initials} as a 3D object in the ${world} world.`;
    case "grunge":
      return ` Skater graphic. Bold xerox SHAPES, torn-paper collage as big pieces, 90s zine layout. Fat halftone dots OK. No pixel grain, no dirt overlay. ${world} graphic, clean ink.`;
    case "vector":
      return ` Flat merch vector lockup, 2–4 hard fills, one accent slash, stacked wordmark. Screen-print separations. Hard edges, solid ink. No grain, no crackle, no distress, no gradients, no photo, no mockup. ${theme.hook}.`;
  }
}

function categorySuffix(categoryId: CategoryId, brand: Brand): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  const upper = name.toUpperCase();
  const kids = brand.audience === "kids";
  const graphic = (() => {
    if (kids) {
      switch (categoryId) {
        case "lockup":
          return ` Category LOCKUP — giant playful ${initials}. Chunky rounded letters, original house creature may perch on a letter. Two or three colors. Flagship kids merch.`;
        case "wordmark":
          return ` Category WORDMARK — the word ${upper} IS the graphic. Chunky kids type, toy-like letters. No extra clipart.`;
        case "box":
          return ` Category BOX — color-block boxed ${initials}. Centered, bold, like a mini drop. Invented box.`;
        case "tour":
          return ` Category TOUR — ${upper} summer-camp / playground tour. Original camps, parks, or cities from this house.`;
        case "coords":
          return ` Category COORDS — treehouse / backyard locale plate. Coordinates, compass ticks, ${upper} EST.`;
        case "crest":
          return ` Category CREST — cub crest for ${name}. House animal as arms, two or three colors. Junior badge, not a stolen scout mark.`;
        case "slogan":
          return ` Category SLOGAN — one short kids line in huge type. ${upper} small. Playful, not mean.`;
        case "blueprint":
          return ` Category BLUEPRINT — exploded toy diagram. Technical but cute. ${initials} as the invention.`;
        case "trail":
          return ` Category TRAIL — junior ranger stamp. Ridge, cub, topo, small ${upper}.`;
        case "issue":
          return ` Category ISSUE — numbered playground drop. “${upper.slice(0, 8)} / 01”. Catalog energy for kids.`;
      }
    }
    switch (categoryId) {
      case "lockup":
        return ` Category LOCKUP — giant ${initials} monogram is the whole design. Solid two-color fills, one accent slash cutting the letters, hairline registration ticks, stacked ${upper} under the mark, tiny catalog line. Flagship merch. Original house only.`;
      case "wordmark":
        return ` Category WORDMARK — the word ${upper} IS the graphic. Custom condensed or brutal type, one accent, kerning as craft. No clipart, no extra icons.`;
      case "box":
        return ` Category BOX — centered boxed ${initials} or ${upper} on a heavy bar. Perfect centering, two colors. Invented box, never a stolen logo.`;
      case "tour":
        return ` Category TOUR — ${upper} world-tour poster. Giant mark plus a list of original cities, camps, or peaks from this house. Small type, drop energy.`;
      case "coords":
        return ` Category COORDS — locale merch. Coordinates, compass ticks, ${upper} EST. Trail-house precision. Original numbers.`;
      case "crest":
        return ` Category CREST — invented heraldry for ${name}. Shield or seal, motifs as arms, two or three colors. Badge that outranks a college seal.`;
      case "slogan":
        return ` Category SLOGAN — one house line in huge type. ${upper} small. The sentence is the design.`;
      case "blueprint":
        return ` Category BLUEPRINT — technical plate. Architectural lines, exploded ${initials}, topo, grid. Drafting-table graphic.`;
      case "trail":
        return ` Category TRAIL — outdoor performance stamp. Ridge, topo, trail mark, small ${upper}. Built to beat a mountain-house drop.`;
      case "issue":
        return ` Category ISSUE — numbered catalog drop. “${upper.slice(0, 8)} / 01” and EST. 2026. Editorial grid, one giant motif.`;
    }
  })();
  return graphic;
}

function animeSuffix(brand: Brand): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  return ` ANIME MODE. Original anime / manga merch for ${name}. Cel-shaded, bold ink line, fashion-forward 2026 J-streetwear. Invented character, creature, or scene that belongs to this house — ${initials} as a quiet mark. Never copy Naruto, Dragon Ball, One Piece, Ghibli, Demon Slayer, or any existing IP. Thumbnail-bold. Limited house palette. Isolated 2D anime graphic, print-ready, huge margin.`;
}

function leadSuffix(leadId: LeadId, brand: Brand): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  if (leadId === "art") {
    return ` LEAD ART. The design is the hero — illustration, motif, scene — 90% of the frame. Branding is a whisper: tiny ${initials} or 8pt ${name}, like a woven neck label. No giant wordmark, no chest-spanning name. Genius pass: invent a new image. Risk. One unforgettable idea. Unlimited original invention, never a template.`;
  }
  return ` LEAD BRAND. ${name} and ${initials} are the hero. The mark is large, owned, readable at a glance.`;
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
    ? "Kids merch craft 2023–2026: chunky type, rounded geometry, color-block, original animal or mascot, one giant idea. Study Mini Rodini / Bobo Choses / TAO / Primary / Patagonia Kids as composition only. Never copy their marks. No movie characters, no clipart, no kawaii anime, no Disney proportions."
    : "";
  const church = theme.id === "church";
  const churchCraft = church
    ? kids
      ? "CHURCH is direction, not a cage. Kids Sunday merch: joyful, age-appropriate, a true Bible line plus citation if type is the idea — or an invented faithful picture. Reverent and fun. Never scary, never sarcasm about God."
      : women
        ? "CHURCH is direction, not a cage. Women's shop: Scripture and faith as fashion. Accurate verse plus citation if you set type, or invented stained-glass / dove / house mark. Editorial, feminine, joyful, reverent. You pick the line and the picture."
        : "CHURCH is direction, not a cage. Men's shop: Scripture and faith as merch. Accurate verse plus citation if you set type, or invented revival geometry. Masculine, joyful, reverent. You pick the line and the picture."
    : "";
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
    churchCraft,
    "Original house only — not generic, not clipart, not a copy. Theme and audience are a compass. Full designer freedom inside that compass.",
    "PRINT FILE for Printify Product Creator. Isolated 2D graphic only.",
    "Never a photo. Never a model. Never a body. Never a garment. Never fabric texture. Never a hanger. Never wrinkles. Never a mockup. Never a lifestyle shot. Never a watermark. Never UI chrome.",
    "Centered on a perfectly even matte #F2F3F5 field. Uniform RGB 242,243,245 — no gradient, no vignette, no floor, no drop shadow. The field is empty studio, not part of the design.",
    "Huge empty margin. Art occupies 60–75% of the frame. Billboard-simple. Readable as a 200px thumbnail.",
    "Solid fills, thick strokes. No hairlines. No drop shadow under the art. No paper grain behind it.",
    "FAIL if the studio field is black or dark. FAIL if you add distress, crackle, speckle, noise, photocopy grain, worn paper, or a faded-wash texture. Ink is flat and opaque. Two or three solid colors only.",
    "The gray field will be deleted to a transparent PNG. Letter holes (O, A, R) must be the same even gray so they knock out.",
    "Ultra-sharp merch illustration. Crisp ink edges, clean fills, high-frequency linework, no blur, no muddy gradients, no JPEG mush. Print-ready.",
    "Registration ticks or crosshairs only if they are inked as part of the graphic, never as a gray canvas.",
    `Invent original ${name} merch. Compass: ${theme.label} × ${who}. Full designer freedom inside that. Never copy a known logo or trademark.`,
    "Craft bar: flagship Printify art, original, sharper than a mall tee.",
    salt ? `Genius print ${salt}. New composition, not a repeat.` : "",
  ];
  const productBit = product?.suffix ?? "";
  const suffix = `${anime ? animeSuffix(brand) : ""}${leadSuffix(leadId, brand)}${categorySuffix(categoryId, brand)}${styleSuffix(styleId, brand)}${productBit}`;
  const idea = trimmed
    ? trimmed
    : `You are the designer. Compass: ${theme.label} for ${who}. Full freedom. One unforgettable original idea. Do not ask. Just draw.`;
  const composed = `${direction.filter(Boolean).join(" ")} ${idea}${suffix}`;
  return composed.slice(0, MAX_COMPOSED);
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
