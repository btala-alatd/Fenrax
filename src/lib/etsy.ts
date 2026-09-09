import { brandSlug, themeOf, type Brand } from "@/lib/brand";
import type { ProductId, Still } from "@/lib/studio-data";

const TITLE_MAX = 140;
const TAG_MAX = 20;
const TAG_COUNT = 13;

const PRODUCT_NOUN: Record<ProductId, { title: string; short: string; category: string }> = {
  tee: {
    title: "Graphic T-Shirt",
    short: "graphic tee",
    category: "Clothing > Unisex Adult T-shirts",
  },
  back: {
    title: "Back Print T-Shirt",
    short: "back print tee",
    category: "Clothing > Unisex Adult T-shirts",
  },
  chest: {
    title: "Left Chest Logo Tee",
    short: "left chest tee",
    category: "Clothing > Unisex Adult T-shirts",
  },
  long: {
    title: "Long Sleeve Graphic Tee",
    short: "long sleeve tee",
    category: "Clothing > Unisex Adult T-shirts",
  },
  tank: {
    title: "Graphic Tank Top",
    short: "graphic tank",
    category: "Clothing > Unisex Tank Tops",
  },
  hoodie: {
    title: "Graphic Hoodie",
    short: "graphic hoodie",
    category: "Clothing > Unisex Hoodies",
  },
  crew: {
    title: "Graphic Crewneck Sweatshirt",
    short: "crewneck sweatshirt",
    category: "Clothing > Unisex Sweatshirts",
  },
  tote: {
    title: "Canvas Tote Bag",
    short: "canvas tote",
    category: "Bags & Purses > Totes",
  },
  hat: {
    title: "Printed Cap Graphic",
    short: "hat graphic",
    category: "Clothing > Hats & Caps",
  },
  mug: {
    title: "Printed Mug",
    short: "coffee mug",
    category: "Home & Living > Mugs",
  },
  tumbler: {
    title: "Printed Tumbler",
    short: "tumbler wrap",
    category: "Home & Living > Drinkware",
  },
  sticker: {
    title: "Die Cut Sticker",
    short: "vinyl sticker",
    category: "Craft Supplies > Stickers",
  },
  poster: {
    title: "Art Print Poster",
    short: "wall art print",
    category: "Art & Collectibles > Prints",
  },
  pillow: {
    title: "Throw Pillow Cover",
    short: "throw pillow",
    category: "Home & Living > Pillows",
  },
  phone: {
    title: "Phone Case",
    short: "phone case",
    category: "Electronics > Phone Cases",
  },
  baby: {
    title: "Baby Onesie",
    short: "baby onesie",
    category: "Clothing > Baby Onesies",
  },
  canvas: {
    title: "Gallery Canvas Print",
    short: "canvas print",
    category: "Art & Collectibles > Prints",
  },
  repeat: {
    title: "Seamless Pattern PNG",
    short: "digital pattern",
    category: "Craft Supplies > Digital",
  },
};

function cleanWords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clipTitle(value: string) {
  if (value.length <= TITLE_MAX) return value;
  const cut = value.slice(0, TITLE_MAX);
  const space = cut.lastIndexOf(" ");
  return (space > 80 ? cut.slice(0, space) : cut).trim();
}

function asTag(value: string) {
  const tag = cleanWords(value).slice(0, TAG_MAX).trim();
  return tag.length >= 2 ? tag : "";
}

function uniqueTags(candidates: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const tag = asTag(candidate);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length === TAG_COUNT) break;
  }
  return out;
}

function motifHead(brand: Brand) {
  const first = brand.motifs.split(",")[0]?.trim() ?? "";
  const words = cleanWords(first).split(" ").slice(0, 3).join(" ");
  return words || "graphic";
}

export type EtsyListing = {
  title: string;
  tags: string[];
  description: string;
  category: string;
  filename: string;
};

export function buildEtsyListing(still: Still, brand: Brand): EtsyListing {
  const name = brand.name.trim() || "Studio";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase();
  const product = PRODUCT_NOUN[still.productId] ?? PRODUCT_NOUN.tee;
  const theme = themeOf(brand);
  const style = theme.label.toLowerCase();
  const motif = motifHead(brand);
  const vibe = cleanWords(brand.vibe).split(" ").slice(0, 3).join(" ") || style;

  const kids = brand.audience === "kids";
  const category = kids
    ? product.category.replace("Unisex Adult T-shirts", "Kids' Clothing").replace("Unisex Hoodies", "Kids' Hoodies").replace("Unisex Sweatshirts", "Kids' Sweatshirts").replace("Unisex Tank Tops", "Kids' Tanks")
    : product.category;

  const title = clipTitle(
    kids
      ? `${name} Kids ${product.title} - ${initials} ${motif} ${style}`
      : `${name} ${product.title} - ${initials} ${motif} ${style}, unisex`,
  );

  const tags = uniqueTags([
    product.short,
    ...theme.tags,
    kids ? "kids graphic tee" : "",
    kids ? "toddler shirt" : "",
    kids ? "youth tshirt" : "",
    `${name} ${product.short}`.slice(0, TAG_MAX),
    `${style} shirt`,
    kids ? "kids tshirt" : "unisex tshirt",
    `${motif} tee`,
    `${name.toLowerCase()} shirt`,
    `${initials.toLowerCase()} graphic tee`,
    kids ? "gift for kids" : "gift for him",
    kids ? "birthday shirt kids" : "gift for her",
    "vintage graphic tee",
    "aesthetic tshirt",
    vibe,
    "statement tee",
  ]);

  const description = [
    `${name} ${product.short} with ${brand.motifs.trim() || "an original graphic"}. ${vibe} ${kids ? "kids" : "unisex"} ${product.short} designed to read in an Etsy thumbnail and print clean on DTG.`,
    "",
    "WHY IT RANKS",
    `Primary keywords sit up front: ${name.toLowerCase()} ${product.short}, ${style} shirt, ${motif} tee. First photo should be this square graphic — no mockup clutter in image 1.`,
    "",
    "THE DESIGN",
    `- Original ${name} artwork (${initials} mark)`,
    `- Attitude: ${brand.vibe.trim() || style}`,
    `- Palette: ink ${brand.ink}, paper ${brand.paper}, accent ${brand.accent}`,
    still.prompt.trim() ? `- Motif: ${still.prompt.trim()}` : null,
    "",
    "FOR YOUR SHOP",
    "Use the PNG on Printify / Printful / Gooten as the print file. Upload SVG if you need vector. Listing photo 1 = this graphic on a square crop. Photos 2–10 can be lifestyle mockups.",
    "",
    "SUGGESTED ETSY DETAILS",
    `Category: ${category}`,
    "Who made it: Designed by you (use Printify to fulfill)",
    "When: Made to order",
    "",
    "TAGS",
    tags.join(", "),
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const filename = `${brandSlug(brand)}-${still.productId}-graphic-${still.id.slice(0, 8)}`;

  return { title, tags, description, category, filename };
}

export function listingText(listing: EtsyListing) {
  return [
    `TITLE (${listing.title.length}/140)`,
    listing.title,
    "",
    `TAGS (${listing.tags.length}/13)`,
    listing.tags.join(", "),
    "",
    "CATEGORY",
    listing.category,
    "",
    "DESCRIPTION",
    listing.description,
    "",
    "FILE STEM",
    listing.filename,
  ].join("\n");
}
