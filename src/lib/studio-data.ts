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
    lookbook:
      " Photoreal heavyweight t-shirt. Real cotton grain, stitching, neck tape, drape. On-model, hanging, or flat as specified. Not a cheap mockup template.",
  },
  {
    id: "back",
    label: "Back",
    suffix:
      " Isolated Printify DTG full-back graphic, 15×18 in. Giant back print, even #F2F3F5 field, huge margin, no garment.",
    lookbook:
      " Photoreal tee or hoodie from behind. Large back print readable, model walking or standing.",
  },
  {
    id: "chest",
    label: "Chest",
    suffix:
      " Isolated Printify left-chest mark, 6×6 in. Compact, thick strokes, even #F2F3F5 field, no hairlines, no garment.",
    lookbook:
      " Photoreal left-chest embroidery or small print, three-quarter view, mark at heart.",
  },
  {
    id: "long",
    label: "Long",
    suffix:
      " Isolated Printify long-sleeve front graphic, 15×18 in. Even #F2F3F5 field, huge margin, no sleeve photo.",
    lookbook:
      " Photoreal long-sleeve tee. Cuffs, drape, print on the body. Campaign lookbook.",
  },
  {
    id: "tank",
    label: "Tank",
    suffix:
      " Isolated Printify tank-front graphic, 12×16 in. Even #F2F3F5 field, huge margin, no garment.",
    lookbook:
      " Photoreal tank top. Armholes, rib, print sitting on the chest. Summer lookbook.",
  },
  {
    id: "hoodie",
    label: "Hoodie",
    suffix:
      " Isolated Printify hoodie-front graphic, 15×18 in. Even #F2F3F5 field, huge margin, no pocket, no cords.",
    lookbook:
      " Photoreal heavyweight hoodie. Real fleece, cords, rib, kangaroo pocket, drape. Campaign lookbook.",
  },
  {
    id: "crew",
    label: "Crew",
    suffix:
      " Isolated Printify crewneck graphic, 15×18 in. Even #F2F3F5 field, huge margin, no garment photo.",
    lookbook:
      " Photoreal crewneck sweatshirt. Heavy fleece, rib collar, print on the chest.",
  },
  {
    id: "tote",
    label: "Tote",
    suffix:
      " Isolated Printify tote-bag graphic, 14×16 in. Even #F2F3F5 field, centered, no bag photo, no handles.",
    lookbook:
      " Photoreal canvas tote. Handles, weave, print on the face. Street still life.",
  },
  {
    id: "hat",
    label: "Hat",
    suffix:
      " Compact Printify cap mark, 6×4 in. Thick geometry, two or three colors, even #F2F3F5 field, no hairline detail.",
    lookbook:
      " Photoreal cap. Embroidery on real wool or cotton twill, worn or still life.",
  },
  {
    id: "mug",
    label: "Mug",
    suffix:
      " Printify 11oz mug-wrap graphic, 9×3.75 in landscape. Art in the center third, even #F2F3F5 field, no mug photo, keep sides empty for the handle.",
    lookbook:
      " Photoreal 11oz mug on a table. Ceramic, handle, printed wrap visible, product still life.",
  },
  {
    id: "tumbler",
    label: "Drink",
    suffix:
      " Printify tumbler wrap, wide landscape. Even #F2F3F5 field, art centered, no cup photo, wrap-safe.",
    lookbook:
      " Photoreal 20oz tumbler, printed wrap, product still life.",
  },
  {
    id: "sticker",
    label: "Sticker",
    suffix:
      " Printify die-cut sticker, 6×6 in. Bold silhouette, thick strokes, even #F2F3F5 field, clean edge.",
    lookbook:
      " Die-cut sticker pack shot on a real surface — slate, concrete, or packing table.",
  },
  {
    id: "poster",
    label: "Poster",
    suffix:
      " Isolated Printify poster art, 12×16 in. Even #F2F3F5 field, centered graphic, no frame, no wall.",
    lookbook:
      " Campaign poster in a real space — gallery wall, warehouse, or lookbook still life.",
  },
  {
    id: "pillow",
    label: "Pillow",
    suffix:
      " Isolated Printify throw-pillow graphic, 16×16 in square. Even #F2F3F5 field, centered, no pillow photo.",
    lookbook:
      " Photoreal throw pillow, print on the face, sofa or bed still life.",
  },
  {
    id: "phone",
    label: "Phone",
    suffix:
      " Isolated Printify phone-case graphic, tall portrait. Even #F2F3F5 field, centered, no case photo, no camera cutout.",
    lookbook:
      " Photoreal phone case on a real phone, product still life.",
  },
  {
    id: "baby",
    label: "Baby",
    suffix:
      " Isolated Printify baby-onesie graphic. Compact, thick fills, even #F2F3F5 field, no garment photo.",
    lookbook:
      " Photoreal baby onesie, small print on the chest, soft product still life.",
  },
  {
    id: "canvas",
    label: "Canvas",
    suffix:
      " Isolated Printify gallery-canvas art. Even #F2F3F5 field, centered, no frame, no wall.",
    lookbook:
      " Gallery canvas on a real wall, lookbook still life.",
  },
  {
    id: "repeat",
    label: "AOP",
    suffix:
      " Seamless tileable all-over print for Printify AOP. Edges match. Original house pattern. Even #F2F3F5 field.",
    lookbook:
      " All-over print on a real garment. Camp shirt or tee, fabric rolling with the body.",
  },
] as const;

export type ProductId = (typeof PRODUCTS)[number]["id"];

export const PRODUCT_WEAR: Record<
  ProductId,
  { garment: string; place: string }
> = {
  tee: {
    garment: "heavyweight short-sleeve t-shirt",
    place: "full-front DTG print, centered on the chest",
  },
  back: {
    garment: "heavyweight t-shirt or hoodie, photographed from behind",
    place: "large full-back DTG print",
  },
  chest: {
    garment: "heavyweight t-shirt",
    place: "small left-chest print or embroidery",
  },
  long: {
    garment: "long-sleeve t-shirt",
    place: "full-front print on the body",
  },
  tank: {
    garment: "tank top",
    place: "front chest print",
  },
  hoodie: {
    garment: "heavyweight pullover hoodie with kangaroo pocket and cords",
    place: "front print above the pocket",
  },
  crew: {
    garment: "crewneck sweatshirt",
    place: "chest print",
  },
  tote: {
    garment: "canvas tote bag",
    place: "print on the face of the bag",
  },
  hat: {
    garment: "structured baseball cap",
    place: "front-panel embroidery",
  },
  mug: {
    garment: "11oz ceramic mug",
    place: "wrap print on the mug",
  },
  tumbler: {
    garment: "20oz tumbler",
    place: "wrap print on the tumbler",
  },
  sticker: {
    garment: "die-cut sticker on a real surface",
    place: "the sticker is the locked art, full size",
  },
  poster: {
    garment: "poster in a real interior",
    place: "the poster is the locked art on a wall or board",
  },
  pillow: {
    garment: "throw pillow",
    place: "print on the face of the pillow",
  },
  phone: {
    garment: "phone case on a real phone",
    place: "the case print is the locked art",
  },
  baby: {
    garment: "baby onesie",
    place: "small chest print",
  },
  canvas: {
    garment: "gallery canvas on a real wall",
    place: "the canvas is the locked art",
  },
  repeat: {
    garment: "all-over-print shirt or camp shirt",
    place: "the locked art as a repeating fabric print",
  },
};

export function productWear(id: ProductId) {
  return PRODUCT_WEAR[id] ?? PRODUCT_WEAR.tee;
}

export const LENSES = [
  { id: "lookbook", label: "Photo" },
  { id: "plate", label: "Graphic" },
] as const;

export type LensId = (typeof LENSES)[number]["id"];

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

export const DROP_SLOTS = {
  plate: [
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
  ],
  lookbook: [
    { categoryId: "lockup", leadId: "brand", note: "Three-quarter on-model, campaign studio light." },
    { categoryId: "wordmark", leadId: "brand", note: "Straight-on hero, garment filling the frame." },
    { categoryId: "box", leadId: "brand", note: "Hanging garment on a rail, print readable." },
    { categoryId: "tour", leadId: "brand", note: "Model walking, side light, print in motion." },
    { categoryId: "coords", leadId: "art", note: "Overhead flat lay on a real surface." },
    { categoryId: "crest", leadId: "brand", note: "Cropped three-quarter, print at the heart." },
    { categoryId: "slogan", leadId: "brand", note: "Turned away or from behind if the print can read." },
    { categoryId: "blueprint", leadId: "art", note: "Window light, model on a stool." },
    { categoryId: "trail", leadId: "art", note: "In motion outdoors or on stairs." },
    { categoryId: "issue", leadId: "art", note: "Lifestyle still life or paired campaign frame." },
  ],
} as const;

export const DROP_COUNT = DROP_SLOTS.plate.length;

export function dropSlots(lens: LensId) {
  return lens === "lookbook" ? DROP_SLOTS.lookbook : DROP_SLOTS.plate;
}

const STYLE_ALIASES: Record<string, StyleId> = {
  street: "drop",
  house: "type",
  mark: "line",
  sport: "liquid",
  scarf: "floral",
};

function styleSuffix(styleId: StyleId, brand: Brand, lens: LensId): string {
  const initials = brand.initials.trim() || brand.name.trim().slice(0, 2).toUpperCase() || "mark";
  const name = brand.name.trim() || "the house";
  const theme = themeOf(brand);
  const world = theme.label.toLowerCase();
  if (lens === "lookbook") {
    switch (styleId) {
      case "drop":
        return ` Campaign hero light, catalog-sharp. Blank garment.`;
      case "chrome":
        return ` Futuristic campaign light, metallic hardware. Blank garment, no graphic.`;
      case "vintage":
        return ` Vintage-wash cotton, lived-in garment, blank chest.`;
      case "type":
        return ` Editorial catalog light. Blank garment.`;
      case "line":
        return ` Quiet editorial light, lots of fabric showing, blank chest.`;
      case "tattoo":
        return ` Warehouse grit, bold merch photo, blank garment.`;
      case "floral":
        return ` Soft fashion light, blank garment.`;
      case "liquid":
        return ` Sculptural fashion light, blank garment.`;
      case "grunge":
        return ` Skater lookbook, warehouse grit, blank garment.`;
      case "vector":
        return ` Clean studio light, sharp cotton, blank chest.`;
    }
  }
  switch (styleId) {
    case "drop":
      return ` Hero merch drop. One giant ${world} idea, oversized ${initials}, billboard-simple, thumbnail-killer. ${theme.hook}.`;
    case "chrome":
      return ` 2026 Y2K chrome. Liquid metal, iridescent, inflatable 3D, cyber highlights, chrome ${initials}. Still clearly ${world}.`;
    case "vintage":
      return ` Distressed vintage merch print. 90s boxy-tee energy, cracked ink, faded wash, bootleg-poster grit. ${world} motifs aged, not a photo of a shirt.`;
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
      return ` Skater grunge. Halftone, xerox, torn edges, 90s zine, dirty on purpose. ${world} graphic with photocopy energy.`;
    case "vector":
      return ` Flat merch vector lockup, 2–4 hard fills, cracked stone or bone in the mark, lime slash, technical hairlines, stacked wordmark. Screen-print separations. No gradients, no photo, no mockup. ${theme.hook}.`;
  }
}

function categorySuffix(categoryId: CategoryId, brand: Brand, lens: LensId): string {
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
        return ` Category LOCKUP — giant ${initials} monogram is the whole design. Cracked bone/stone fills, one accent slash cutting the letters, hairline registration ticks, stacked ${upper} under the mark, tiny catalog line. Flagship merch. Original house only.`;
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
  if (lens === "lookbook") {
    return ` Photo only. Blank garment. Do not draw any ${categoryId} graphic.`;
  }
  return graphic;
}

function animeSuffix(brand: Brand, lens: LensId): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  const core =
    ` ANIME MODE. Original anime / manga merch for ${name}. Cel-shaded, bold ink line, fashion-forward 2026 J-streetwear. Invented character, creature, or scene that belongs to this house — ${initials} as a quiet mark. Never copy Naruto, Dragon Ball, One Piece, Ghibli, Demon Slayer, or any existing IP. Thumbnail-bold. Limited house palette.`;
  if (lens === "lookbook") {
    return `${core} Photoreal blank garment, no graphic. The print will be composited later.`;
  }
  return `${core} Isolated 2D anime graphic, print-ready, huge margin.`;
}

function leadSuffix(leadId: LeadId, brand: Brand, lens: LensId = "plate"): string {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase() || "FR";
  if (lens === "lookbook") {
    return ` Blank garment. No graphic.`;
  }
  if (leadId === "art") {
    return ` LEAD ART. The design is the hero — illustration, motif, scene, texture — 90% of the frame. Branding is a whisper: tiny ${initials} or 8pt ${name}, like a woven neck label. No giant wordmark, no chest-spanning name. Genius pass: invent a new image. Risk. One unforgettable idea. Unlimited original invention, never a template.`;
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
      "{name} vintage {theme} tee: cracked-ink {initials}, faded {motifs}, 90s merch poster",
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

export const LOOKBOOK_TEMPLATES = [
  {
    title: "Cyclorama",
    styleId: "drop" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "Photorealistic studio product shot of a heavyweight {ink} {NAME} t-shirt, small embroidered {motifs} mark at left chest, {paper} interior neck tape, worn by a lean male model three-quarter view, white cyclorama, hard directional light, 8k fashion campaign",
  },
  {
    title: "Back graphic",
    styleId: "drop" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "Oversized {paper} {NAME} tee, large tonal {ink} back graphic of {motifs} dissolving into motion lines, small {accent} mark on the front left chest, model walking, side light, high-end streetwear lookbook",
  },
  {
    title: "Type flat lay",
    styleId: "type" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "1:1" as AspectRatioId,
    prompt:
      "Deep {ink} {NAME} t-shirt, centered front typography in condensed custom sans with the {initials} mark cutting the first letter, subtle reflective ink, flat lay on raw concrete, overhead lighting",
  },
  {
    title: "Studio woman",
    styleId: "line" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "{ink} {NAME} long-sleeve, {accent} contrast stitching at seams and cuff, small repeated {motifs} pattern down the left sleeve, worn by a female model arms crossed, dark studio, rim light",
  },
  {
    title: "Hanging vintage",
    styleId: "vintage" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "Vintage-wash {paper} {NAME} tee, cracked {ink} print of {motifs}, distressed collar, hanging on a metal hanger against white brick",
  },
  {
    title: "Warehouse rear",
    styleId: "drop" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "Black {NAME} boxy tee, full-back abstract graphic in {accent} and {paper} lines forming {motifs}, tiny front mark, model from behind, warehouse location, cinematic lighting",
  },
  {
    title: "Window light",
    styleId: "type" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "{ink} {NAME} oversized tee, large outlined {paper} mark on the back with “{NAME} / EST.” stacked underneath in small type, model sitting on a stool, soft window light",
  },
  {
    title: "High-key mark",
    styleId: "line" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "{paper} {NAME} t-shirt, front chest print of {motifs} forming the {NAME} mark, {accent} on one line only, worn by a male model looking off-camera, high-key studio",
  },
  {
    title: "Motion stairs",
    styleId: "drop" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:4" as AspectRatioId,
    prompt:
      "Deep {ink} {NAME} shirt, front graphic of {motifs} over a topographic map in {paper} and {accent}, high-density print, model in motion on outdoor concrete stairs",
  },
  {
    title: "Campaign pair",
    styleId: "type" as StyleId,
    productId: "tee" as ProductId,
    aspectRatio: "3:2" as AspectRatioId,
    prompt:
      "{ink} {NAME} campaign tee, large back print in outlined type with the mark cutting through the letters, small matching front mark, two models standing together, desaturated warehouse set, cinematic grade",
  },
] as const;

export function examplesFor(brand: Brand, lens: LensId = "lookbook") {
  const pack = lens === "lookbook" ? LOOKBOOK_TEMPLATES : EXAMPLE_TEMPLATES;
  return pack.map((example) => ({
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
  lens: LensId = "lookbook",
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
  const lookbook = lens === "lookbook";
  const audienceLine = lookbook
    ? kids
      ? "KIDSWEAR collection. Age-appropriate children's fashion, ages 4–12. Child in an everyday pose, or hanging / flat garment. Kids fit, playful, family brand. Never adult styling, never provocative."
      : women
        ? "WOMENSWEAR collection. Female model, women's fit (relaxed, cropped, or oversized fashion). Shot for a women's clothing brand."
        : "MENSWEAR collection. Male model, men's fit (boxy, oversized, dropped shoulder). Shot for a men's clothing brand."
    : kids
      ? "Designed for a KIDS clothing shop. Playful, thumbnail-bold, original house only. Age-appropriate. Never copy Disney, Pokémon, Marvel, Paw Patrol, Hello Kitty, Labubu, or any existing character."
      : women
        ? "Designed for a WOMEN'S clothing shop. Feminine merch energy, thumbnail-bold, original house only."
        : "Designed for a MEN'S clothing shop. Masculine merch energy, thumbnail-bold, original house only.";
  const kidsCraft = kids
    ? "Kids merch craft 2023–2026: chunky type, rounded geometry, color-block, original animal or mascot, one giant idea. Study Mini Rodini / Bobo Choses / TAO / Primary / Patagonia Kids as composition only. Never copy their marks. No movie characters."
    : "";
  const church = theme.id === "church";
  const churchCraft = church
    ? kids
      ? "CHURCH / KIDS. Original Sunday-school merch, never a gift-shop cartoon. One short true line plus citation that is NOT the usual Amazon kids-faith tropes. Invented dove, stained-glass creature, or house mascot — cute and reverent. Never scary, never crucifixion, never sarcasm, never Disney, never a smiling clipart Jesus."
      : women
        ? "CHURCH / WOMEN. Original women's faith fashion. Accurate Scripture plus citation, set like a fashion house — not a boutique rack of the same five verses. Ban: Jeremiah 29:11, Phil 4:13, John 3:16, 'coffee and Jesus', rhinestone crosses, 'faith over fear' in that lockup. Find a true, less-printed line (or a distinctive setting of a known one if the user named it). Editorial, feminine, gold and bone. Would wear it without needing the verse to excuse the design."
        : "CHURCH / MEN. Original men's gospel merch. Accurate Scripture plus citation as a concert poster only this house could have printed. Ban: John 3:16 as the whole idea, Phil 4:13, Jeremiah 29:11, clipart crosses, 'faith over fear', WWJD. Pick a true, less-worn line (Micah 6:8, Isaiah 43:1, Psalm 121, Habakkuk 2:2, 2 Timothy 1:7 — or better, one that fits this house). Heavy type, revival ink, invented geometry. If the user named a verse, use that verse accurately."
    : "";
  const originalLock =
    "ORIGINALITY LOCK: Nothing generic. If it looks like Amazon bulk merch, a mall kiosk, or a clipart pack, throw it away. No EST. year badges, no leaping-bass cliché, no 'I'd rather be fishing', no barbed-wire stamps, no glowing clipart cross, no stock mountain-sun, no generic dino smile. Specific object, specific sentence, specific composition that could only belong to this house. Invented. Unrepeatable.";
  const churchSet = church
    ? kids
      ? "Photoreal church courtyard or Sunday steps. Child-appropriate, bright, joyful. Real place, not a drawing."
      : women
        ? "Photoreal Sunday after service — chapel light, garden, or quiet sanctuary exterior. Women's styling. Real place, not a drawing."
        : "Photoreal church steps, brick sanctuary, or gospel-night street. Men's styling. Real place, not a drawing."
    : `Photoreal ${theme.label.toLowerCase()} location only — real street, lodge, studio, or interior. Use that as place and wardrobe, never as a drawing style.`;
  const who = kids ? "kids" : women ? "women's" : "men's";
  const wear = productWear(productId);
  if (lookbook) {
    const shot = [
      "REAL PHOTOGRAPH of a real human. Catalog fashion photo, 85mm lens, f/2.8, 8k, visible skin pores, cotton weave, stitching, neck tape. Shot on a camera.",
      "NOT illustration, NOT anime, NOT manga, NOT cartoon, NOT comic, NOT 3D render, NOT digital painting, NOT cel-shading, NOT a drawing.",
      `PRODUCT: a real blank ${wear.garment}. ${audienceLine}`,
      "BLANK GARMENT: empty chest and back. No graphic, no logo, no letters, no fake print, no illustration on the fabric. Unmarked cloth. A real print file will be composited after.",
      "POSE: standing square to camera, torso facing camera, arms relaxed at the sides, garment front flat and fully visible.",
      `SET: ${churchSet}`,
      `Garment color close to ${paper}. Attitude: ${brand.vibe.trim() || theme.vibe}.`,
      notes,
      salt ? `New pose and set ${salt}. Still a real photo, still a blank garment.` : "",
      trimmed
        ? trimmed
        : `Photograph a real person in a blank ${wear.garment}. Empty chest.`,
    ]
      .filter(Boolean)
      .join(" ");
    return shot.slice(0, MAX_COMPOSED);
  }
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
        originalLock,
        "PRINT FILE, not a photo. No model, no body, no fabric, no hanger, no wrinkles, no cyclorama, no mockup, no watermark, no UI chrome.",
        "Isolated 2D graphic centered on a perfectly even matte #F2F3F5 field. The field is empty studio, not part of the design. Uniform RGB 242,243,245 — no gradient, no vignette, no floor, no drop shadow.",
        "Huge empty margin. Art occupies 60–75% of the frame. Billboard-simple. Readable as a 200px thumbnail.",
        "Solid fills, thick strokes. No hairlines. No drop shadow under the art. No paper grain behind it.",
        "The gray field will be deleted to a transparent PNG. Letter holes (O, A, R) must be the same even gray so they knock out.",
        "Ultra-sharp merch illustration. Crisp ink edges, clean fills, high-frequency linework, no blur, no muddy gradients, no JPEG mush. Print-ready.",
        "Registration ticks or crosshairs only if they are inked as part of the graphic, never as a gray canvas.",
        `Invent original ${name} merch in that ${theme.label.toLowerCase()} ${who} feeling. Full designer freedom. Never copy a known logo or trademark.`,
        church
          ? "Craft bar: the best original church tee in the shop. Fashion-first. Scripture true. Nothing you have seen on a rack."
          : "Craft bar: flagship original drop. Sharper than a mall tee. Nothing generic.",
        salt ? `Genius print ${salt}. New composition, not a repeat.` : "",
      ];
  const productBit = product?.suffix ?? "";
  const suffix = `${anime ? animeSuffix(brand, lens) : ""}${leadSuffix(leadId, brand, lens)}${categorySuffix(categoryId, brand, lens)}${styleSuffix(styleId, brand, lens)}${productBit}`;
  const idea = trimmed
    ? trimmed
    : church
      ? kids
        ? `Invent an original kids church graphic for ${name}. True Bible line plus citation that is not the usual gift-shop verse. Joyful, specific, this house only. Do not ask. Just draw.`
        : women
          ? `Invent an original women's church tee for ${name}. Accurate Scripture plus citation, editorial, not the five verses every shop prints. Fashion-first. Do not ask. Just draw.`
          : `Invent an original men's church tee for ${name}. Accurate Scripture plus citation, heavy type, a line that is not the Amazon default. Do not ask. Just draw.`
      : `Invent an original ${theme.label.toLowerCase()} ${who} merch graphic for ${name} now. Specific, unrepeatable, this house only. If it looks generic, invent again. Do not ask. Just draw.`;
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
  return LENSES.some((item) => item.id === value);
}

export function coerceLensId(value: unknown): LensId {
  return typeof value === "string" && isLensId(value) ? value : "lookbook";
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
