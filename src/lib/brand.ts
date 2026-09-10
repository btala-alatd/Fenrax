import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idb";

export const THEMES = [
  {
    id: "street",
    label: "Street",
    font: "Anton",
    ink: "#2a2d32",
    paper: "#f4efe6",
    accent: "#c6ff00",
    motifs: "sharp intersecting axis, fractured F, architectural lines",
    vibe: "precision, motion, architecture, premium performance streetwear",
    hook: "intersecting axis mark, architectural line, motion, precision",
    world:
      "Premium performance streetwear. Charcoal, bone, deep navy, one accent. Sharp intersecting axis / fractured-F. Tone: precision, motion, architecture.",
    schools:
      "Gucci, Balenciaga, Off-White, Supreme, Stone Island, Casablanca as composition schools. Never copy their logos, GG, LV flowers, horsebit, arrows, or box-logo.",
    tags: ["streetwear tshirt", "graphic tee", "urban shirt"],
  },
  {
    id: "resort",
    label: "Resort",
    font: "Baloo 2",
    ink: "#1a2e28",
    paper: "#f7efd8",
    accent: "#e07a3d",
    motifs: "palm fronds, hibiscus, island map, camp-collar print",
    vibe: "relaxed island luxury, linen hour, sunset deck",
    hook: "tropical resort print, silk-camp density, palms and florals drawn original",
    world:
      "Island resort lifestyle brand. Soft luxury, camp-collar energy, botanical repeats, sunset palette, vacation ease — like a house that owns the veranda, not a nightclub.",
    schools:
      "Tommy Bahama, Reyn Spooner, Tori Richard, Howler Brothers as resort composition schools. Never use their names, parrots, or trademarks. Invent this house.",
    tags: ["tropical shirt", "resort tee", "palm tree shirt"],
  },
  {
    id: "fishing",
    label: "Fishing",
    font: "Oswald",
    ink: "#0b1c24",
    paper: "#f3ead4",
    accent: "#3aa6a0",
    motifs: "leaping tarpon, antique lure, tide rings, nautical chart",
    vibe: "saltwater lodge, dawn patrol, lived-in luxury",
    hook: "lodge fishing graphic, species crest, lure and tide, clean ink",
    world:
      "Fishing lifestyle brand. Saltwater and freshwater lodge culture: fish species as heraldry, vintage lures, tide charts, topographic water, rod-and-reel geometry, dock-house stamps. Feels like a charter captain's shirt, not a fashion week mark.",
    schools:
      "Orvis, Simms, Patagonia, Columbia PFG, Howler Brothers, Filson as outdoor composition schools. Never copy their logos, fish marks, or names.",
    tags: ["fishing shirt", "bass fishing tee", "saltwater tee", "fly fishing"],
  },
  {
    id: "hunt",
    label: "Hunt",
    font: "Bebas Neue",
    ink: "#16110c",
    paper: "#efe6d4",
    accent: "#b4542a",
    motifs: "stag crest, ridge line, shotgun steel, pine",
    vibe: "upland lodge, frost morning, quiet luxury",
    hook: "heritage hunt lodge, animal crest, timber and steel",
    world:
      "Hunt and field brand. Upland and big-game lodge graphics, crest animals, ridge maps, wool-and-waxed-canvas attitude.",
    schools:
      "Filson, Orvis, Beretta lifestyle, Barbour as field composition schools. Never copy their logos or names.",
    tags: ["hunting shirt", "outdoors tee", "lodge shirt"],
  },
  {
    id: "western",
    label: "Western",
    font: "Rye",
    ink: "#1c120c",
    paper: "#f3e6d0",
    accent: "#c45c2a",
    motifs: "longhorn, tooled leather, desert mesa, spur",
    vibe: "ranch dusty, rodeo night, honest swagger",
    hook: "western ranch graphic, tooled-leather line, desert silhouette",
    world:
      "Western and ranch brand. Longhorn and mesa, tooled-leather ornament, rodeo type, desert dusk. Original ranch heraldry.",
    schools:
      "Wrangler, RRL, Stetson as western composition schools. Never copy their logos or names.",
    tags: ["western shirt", "cowboy tee", "ranch shirt"],
  },
  {
    id: "coastal",
    label: "Coastal",
    font: "Poppins",
    ink: "#102436",
    paper: "#eef4f6",
    accent: "#d9a441",
    motifs: "lighthouse, swell lines, marina rope, compass rose",
    vibe: "harbor morning, yacht-club casual, salt on the rail",
    hook: "marina and swell, nautical chart, coastal crest",
    world:
      "Coastal and marina brand. Swell geometry, lighthouse, rope and compass, New England harbor to Gulf coast. Clean nautical, not cartoon pirate.",
    schools:
      "Vineyard Vines, Kiel James Patrick, Helly Hansen as coastal composition schools. Never copy their logos or names.",
    tags: ["nautical shirt", "coastal tee", "beach shirt"],
  },
  {
    id: "heritage",
    label: "Heritage",
    font: "Abril Fatface",
    ink: "#1a1c28",
    paper: "#f4efe4",
    accent: "#6b1d2a",
    motifs: "shield crest, serif wordmark, laurel, varsity number",
    vibe: "collegiate archive, old money quiet, clubhouse",
    hook: "varsity crest, laurel, heritage serif, club stamp",
    world:
      "Heritage and collegiate brand. Crests, laurel, varsity numbers, archive serif. Clubhouse, not costume.",
    schools:
      "Ralph Lauren, Rowing Blazers, J.Press as heritage composition schools. Never copy their logos, polo players, or names.",
    tags: ["varsity tee", "crest shirt", "collegiate tee"],
  },
  {
    id: "work",
    label: "Work",
    font: "Archivo Black",
    ink: "#141414",
    paper: "#e8e2d6",
    accent: "#c9a227",
    motifs: "stencil lockup, wrench, railroad type, utility badge",
    vibe: "shop floor, union stamp, honest grit",
    hook: "utility stencil, workwear badge, industrial type",
    world:
      "Workwear and shop brand. Stencil type, utility badges, mechanic and mill graphics, railroad ink. Tough and clear at thumbnail size.",
    schools:
      "Carhartt, Dickies, Filson work as utility composition schools. Never copy their logos or names.",
    tags: ["workwear tee", "mechanic shirt", "utility tee"],
  },
  {
    id: "celestial",
    label: "Celestial",
    font: "Cinzel",
    ink: "#0c0a14",
    paper: "#f4eef8",
    accent: "#c9a8ff",
    motifs: "crescent moon, moth, star map, thin rings",
    vibe: "night-market mystic, soft goth, trendy celestial",
    hook: "moon and moth, star chart, trendy mystical linework",
    world:
      "Celestial lifestyle brand. Moons, moths, star maps, thin gold rings. Soft-goth and cottage-mystic merch that sells on Etsy — original astronomy, not generic clipart.",
    schools:
      "Spiritually-adjacent fashion and modern witch-aesthetic merch as composition schools. Never copy branded tarot decks or trademarked moon logos.",
    tags: ["celestial shirt", "moon tee", "moth shirt"],
  },
  {
    id: "skate",
    label: "Skate",
    font: "Permanent Marker",
    ink: "#111111",
    paper: "#f2f2f0",
    accent: "#ff3b1f",
    motifs: "broken type, board outline, thrashed sun, scratch marks",
    vibe: "DIY skate shop, 90s zine, loud and cheap-looking on purpose",
    hook: "skater graphic, xerox grit, loud type, board culture",
    world:
      "Skate and punk merch house. Zine type, xerox grit, anti-logo energy, board-shop posters. Loud, now, not costume pirate.",
    schools:
      "Thrasher, Supreme skate, Alien Workshop, Girl as skate composition schools. Never copy their logos, flame type, or names.",
    tags: ["skate shirt", "skater tee", "punk graphic tee"],
  },
  {
    id: "luxe",
    label: "Luxe",
    font: "Prata",
    ink: "#111111",
    paper: "#f6f1e8",
    accent: "#c2a36b",
    motifs: "thin serif wordmark, quiet crest, silk grain, one gold rule",
    vibe: "quiet luxury, old money, one perfect object",
    hook: "quiet luxury lockup, thin gold, editorial negative space",
    world:
      "Quiet-luxury fashion house. One perfect mark, silk grain, editorial space, no screaming graphics. The expensive kind of simple.",
    schools:
      "The Row, Loro Piana, Bottega, old Celine as quiet-luxury composition schools. Never copy their logos, names, or hardware.",
    tags: ["luxury tee", "minimal shirt", "quiet luxury"],
  },
  {
    id: "bloom",
    label: "Bloom",
    font: "Italiana",
    ink: "#2a1c22",
    paper: "#f7efe8",
    accent: "#e8a0b0",
    motifs: "wild rose, silk ribbon, thin script, garden line",
    vibe: "feminine fashion house, romantic, editorial",
    hook: "botanical fashion print, ribbon and rose, original garden line",
    world:
      "Feminine garden house. Roses, ribbon, thin script, editorial florals. Soft but sharp enough for a thumbnail. Invented botanicals, never stock clipart.",
    schools:
      "Zimmermann, Reformation, LoveShackFancy as feminine composition schools. Never copy their logos or names.",
    tags: ["floral shirt", "womens graphic tee", "rose tee"],
  },
  {
    id: "muse",
    label: "Muse",
    font: "Unbounded",
    ink: "#1c1820",
    paper: "#f4eef2",
    accent: "#ff4d8d",
    motifs: "crescent monogram, city night line, fine fashion mark",
    vibe: "girls streetwear, night-out graphic, bold and pretty",
    hook: "feminine street lockup, night type, original muse mark",
    world:
      "Women's streetwear house. Night-out energy, crescent monogram, city line, bold type with pretty edges. Club-to-street, not costume.",
    schools:
      "Off-White womens, Acne, Coperni as composition schools. Never copy their logos or names.",
    tags: ["womens streetwear", "graphic tee women", "y2k shirt"],
  },
  {
    id: "mini",
    label: "Mini",
    font: "Fredoka",
    ink: "#1d2430",
    paper: "#f6f1e6",
    accent: "#ff6a3d",
    motifs: "chunky animal line, color-block, rounded house mark",
    vibe: "kids streetwear, European mini-fashion, playful and sharp",
    hook: "mini street graphic, color-block animal, original kids drop",
    world:
      "Kids streetwear house. 2023–2026 mini-fashion: oversized boxy tees, color-block, original animal line, chunky type. Looks like a small adult drop, still clearly for kids. Invented house only.",
    schools:
      "Mini Rodini, Bobo Choses, The Animals Observatory, Zara Kids, Mini Boden as kids composition schools. Never copy their animals, logos, or names.",
    tags: ["kids streetwear", "kids graphic tee", "toddler shirt"],
  },
  {
    id: "play",
    label: "Play",
    font: "Nunito",
    ink: "#1a2330",
    paper: "#fff6e8",
    accent: "#3d8bfd",
    motifs: "original dino, rocket, truck, house creature",
    vibe: "playground, Saturday morning, bright and simple",
    hook: "play graphic, original dino or rocket, thumbnail-bold kids art",
    world:
      "Kids playhouse. Dinosaurs, rockets, trucks, planets, invented creatures — drawn original for this house. One giant idea a four-year-old can read from across a room. Not baby-clipart, not a movie character.",
    schools:
      "Primary, Hanna Andersson, Cat & Jack, Gap Kids as kids composition schools. Never copy Disney, Pixar, Pokémon, Marvel, Paw Patrol, or any existing character.",
    tags: ["dinosaur shirt", "kids space tee", "toddler graphic tee"],
  },
  {
    id: "cub",
    label: "Cub",
    font: "Chewy",
    ink: "#1c2418",
    paper: "#efe6d2",
    accent: "#e07a3d",
    motifs: "junior ranger badge, ridge pup, camp stamp, topo",
    vibe: "kids outdoor, trail family, camp weekend",
    hook: "junior ranger stamp, cub crest, kids trail graphic",
    world:
      "Kids outdoor house. Junior-ranger energy, trail stamps, camp badges, ridge animals drawn as cubs. Family trail merch, not hunting. Tough enough for dirt, still cute.",
    schools:
      "Patagonia Kids, The North Face Youth, REI kids, Columbia kids as outdoor composition schools. Never copy their logos, p-6, or names.",
    tags: ["kids outdoor shirt", "camp tee kids", "ranger kids tee"],
  },
  {
    id: "buddy",
    label: "Buddy",
    font: "Baloo 2",
    ink: "#241820",
    paper: "#fff4ea",
    accent: "#ff5a7a",
    motifs: "original house mascot, round body, tiny mark",
    vibe: "collector cute, mascot as the brand, hug-shaped",
    hook: "original mascot merch, cute collector graphic, house buddy",
    world:
      "Kids mascot house. One invented creature that belongs only to this shop — round, hug-shaped, two or three colors. 2024–2026 collector-cute energy without copying Labubu, Sonny Angel, Squishmallow, Hello Kitty, or Jellycat. The buddy IS the drop.",
    schools:
      "Cute-collector merch as a composition school (simple mascot, vinyl-figure clarity). Never copy those toys or characters.",
    tags: ["kids mascot tee", "cute graphic tee", "toddler character shirt"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type AudienceId = "men" | "women" | "kids";

export const AUDIENCES = [
  { id: "men" as const, label: "Men", hint: "Men's clothing shop" },
  { id: "women" as const, label: "Women", hint: "Women's clothing shop" },
  { id: "kids" as const, label: "Kids", hint: "Kids clothing shop" },
];

export function themesFor(_audience?: AudienceId) {
  return THEMES;
}

export function coerceAudience(value: unknown): AudienceId {
  if (value === "women" || value === "kids") return value;
  return "men";
}

export type Brand = {
  name: string;
  initials: string;
  themeId: ThemeId;
  audience: AudienceId;
  ink: string;
  paper: string;
  accent: string;
  motifs: string;
  vibe: string;
  notes: string;
  ready: boolean;
};

export const DEFAULT_BRAND: Brand = {
  name: "Fenrax",
  initials: "FR",
  themeId: "street",
  audience: "men",
  ink: "#2a2d32",
  paper: "#f4efe6",
  accent: "#c6ff00",
  motifs: "sharp intersecting axis, fractured F, architectural lines",
  vibe: "precision, motion, architecture, premium performance streetwear",
  notes: "",
  ready: false,
};

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((item) => item.id === value);
}

export function coerceThemeId(value: unknown): ThemeId {
  return typeof value === "string" && isThemeId(value) ? value : "street";
}

export function themeOf(brand: Pick<Brand, "themeId">) {
  return THEMES.find((item) => item.id === brand.themeId) ?? THEMES[0];
}

export function applyTheme(themeId: ThemeId): Partial<Brand> {
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  return {
    themeId: theme.id,
    ink: theme.ink,
    paper: theme.paper,
    accent: theme.accent,
    motifs: theme.motifs,
    vibe: theme.vibe,
  };
}

export function suggestInitials(name: string) {
  const words = name
    .trim()
    .split(/[\s&+/._-]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]!.slice(0, 1)}${words[1]!.slice(0, 1)}`.toUpperCase();
  }
  return (words[0] ?? "").slice(0, 2).toUpperCase();
}

export function applyAudience(audience: AudienceId, _brand: Brand): Partial<Brand> {
  return { audience };
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function coerceHex(value: string, fallback: string) {
  const trimmed = value.trim();
  if (HEX.test(trimmed)) return trimmed;
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return `#${trimmed}`;
  return fallback;
}

function keepHex(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (HEX.test(trimmed)) return trimmed;
  if (/^#?[0-9a-f]{0,6}$/i.test(trimmed)) {
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  }
  return coerceHex(trimmed, fallback);
}

export function normalizeBrand(value: Partial<Brand> | null | undefined): Brand {
  const audience = coerceAudience(value?.audience);
  const themeId = coerceThemeId(value?.themeId);
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const name = (value?.name ?? DEFAULT_BRAND.name).slice(0, 40);
  const initialsRaw = (value?.initials ?? "").slice(0, 6);
  return {
    name,
    initials: initialsRaw || suggestInitials(name),
    themeId,
    audience,
    ink: keepHex(value?.ink, theme.ink),
    paper: keepHex(value?.paper, theme.paper),
    accent: keepHex(value?.accent, theme.accent),
    motifs: (value?.motifs ?? theme.motifs).slice(0, 180),
    vibe: (value?.vibe ?? theme.vibe).slice(0, 140),
    notes: (value?.notes ?? "").slice(0, 400),
    ready:
      value?.ready === true ||
      (name.trim().length >= 2 && name.trim().toLowerCase() !== "fenrax"),
  };
}

export function shopIsReady(brand: Brand) {
  return Boolean(brand.ready);
}

export function brandSlug(brand: Brand) {
  const slug = brand.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return slug || "print";
}

export function fillBrand(template: string, brand: Brand) {
  const name = brand.name.trim() || "the house";
  const initials = brand.initials.trim() || name.slice(0, 2).toUpperCase();
  const theme = themeOf(brand);
  return template
    .replaceAll("{name}", name)
    .replaceAll("{NAME}", name.toUpperCase())
    .replaceAll("{initials}", initials)
    .replaceAll("{motifs}", brand.motifs.trim() || theme.motifs)
    .replaceAll("{vibe}", brand.vibe.trim() || theme.vibe)
    .replaceAll("{theme}", theme.label.toLowerCase())
    .replaceAll("{hook}", theme.hook)
    .replaceAll("{ink}", brand.ink)
    .replaceAll("{paper}", brand.paper)
    .replaceAll("{accent}", brand.accent);
}

type BrandState = {
  brand: Brand;
  setBrand: (brand: Brand) => void;
  patchBrand: (partial: Partial<Brand>) => void;
};

export const useBrand = create<BrandState>()(
  persist(
    (set, get) => ({
      brand: DEFAULT_BRAND,
      setBrand: (brand) => set({ brand: normalizeBrand(brand) }),
      patchBrand: (partial) => set({ brand: normalizeBrand({ ...get().brand, ...partial }) }),
    }),
    {
      name: "fenrax-brand",
      skipHydration: true,
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ brand: state.brand }),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === "object"
            ? (persisted as { brand?: Partial<Brand> }).brand
            : undefined;
        return { ...current, brand: normalizeBrand(raw ?? current.brand) };
      },
    },
  ),
);
