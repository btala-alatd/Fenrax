import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowUp,
  ChevronDown,
  ImagePlus,
  Layers,
  LoaderCircle,
  Pencil,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BrandSheet } from "@/components/brand-sheet";
import { SettingsSheet } from "@/components/settings-sheet";
import { EtsySheet } from "@/components/etsy-sheet";
import { ExportButtons } from "@/components/export-buttons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { applyAudience, applyTheme, AUDIENCES, THEMES, themeOf, shopIsReady, useBrand, type Brand } from "@/lib/brand";
import { printifyPreset, finishPrintFile, looksLikePhoto } from "@/lib/printify";
import { letterPlate, plateCopy } from "@/lib/letter";
import { useGallery } from "@/lib/gallery";
import { idbClearPrefix } from "@/lib/idb";
import { readImageFile } from "@/lib/image-file";
import { zipGeneratedImages, zipPrintifyPack } from "@/lib/pack";
import { saveToLabel } from "@/lib/save-to";
import { usePrinter } from "@/lib/printer";
import { editStill, generateStill } from "@/lib/imagine";
import {
  ASPECT_RATIOS,
  CATEGORIES,
  MAX_PROMPT,
  PRODUCTS,
  STYLES,
  coerceAspectRatioId,
  coerceCategoryId,
  coerceLeadId,
  coerceLensId,
  coerceProductId,
  coerceStyleId,
  composePrompt,
  DROP_COUNT,
  dropSlots,
  type AspectRatioId,
  type CategoryId,
  type LeadId,
  type LensId,
  type ProductId,
  type Still,
  type StudioMode,
  type StyleId,
} from "@/lib/studio-data";
import { cn } from "@/lib/utils";

export function Studio() {
  const items = useGallery((state) => state.items);
  const addStill = useGallery((state) => state.add);
  const removeStill = useGallery((state) => state.remove);
  const clearGallery = useGallery((state) => state.clear);
  const brand = useBrand((state) => state.brand);
  const patchBrand = useBrand((state) => state.patchBrand);
  const [hydrated, setHydrated] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [styleId, setStyleId] = useState<StyleId>("vector");
  const [productId, setProductId] = useState<ProductId>("tee");
  const [categoryId, setCategoryId] = useState<CategoryId>("lockup");
  const [leadId, setLeadId] = useState<LeadId>("brand");
  const [anime, setAnime] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("3:4");
  const [lens, setLens] = useState<LensId>("plate");
  const [mode, setMode] = useState<StudioMode>("create");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [current, setCurrent] = useState<Still | null>(null);
  const [lightbox, setLightbox] = useState<Still | null>(null);
  const [brandOpen, setBrandOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listing, setListing] = useState<Still | null>(null);
  const [pending, setPending] = useState(false);
  const [packing, setPacking] = useState(false);
  const [packStep, setPackStep] = useState(0);
  const [dropStep, setDropStep] = useState(0);
  const [dropTotal, setDropTotal] = useState<number>(DROP_COUNT);
  const [elapsed, setElapsed] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const restoredRef = useRef(false);
  const lastPrintAt = useRef(0);

  useEffect(() => {
    let alive = true;
    const failSafe = window.setTimeout(() => {
      if (alive) setHydrated(true);
    }, 1200);
    void Promise.all([
      useGallery.persist.rehydrate(),
      useBrand.persist.rehydrate(),
      usePrinter.persist.rehydrate(),
    ])
      .catch(() => undefined)
      .finally(() => {
        window.clearTimeout(failSafe);
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
      window.clearTimeout(failSafe);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || restoredRef.current) return;
    restoredRef.current = true;
    const latest = useGallery.getState().items[0];
    if (!latest) return;
    setCurrent(latest);
    setPrompt(latest.prompt);
    setStyleId(coerceStyleId(latest.styleId));
    setProductId(coerceProductId(latest.productId));
    setCategoryId(coerceCategoryId(latest.categoryId));
    setLeadId(coerceLeadId(latest.leadId));
    setAnime(Boolean(latest.anime));
    setAspectRatio(coerceAspectRatioId(latest.aspectRatio));
    setLens(coerceLensId(latest.lens));
  }, [hydrated]);

  useEffect(() => {
    if (!pending) {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [pending]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const visibleItems = hydrated ? items : [];
  const selectedId = current?.id ?? null;
  const stageImage = current?.dataUrl ?? sourceImage;
  const houseName = brand.name.trim() || "the house";
  const theme = themeOf(brand);
  const ready = shopIsReady(brand);
  const frame = useMemo(
    () => ASPECT_RATIOS.find((item) => item.id === aspectRatio) ?? ASPECT_RATIOS[1],
    [aspectRatio],
  );

  async function acceptFile(file: File) {
    try {
      const dataUrl = await readImageFile(file);
      setSourceImage(dataUrl);
      setMode("edit");
      setCurrent(null);
      promptRef.current?.focus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open that image.");
    }
  }

  function printerCooling(): boolean {
    const cool = 25_000 - (Date.now() - lastPrintAt.current);
    if (cool > 0) {
      toast.message(`Printer cooling down. ${Math.ceil(cool / 1000)}s so Google doesn’t throttle.`);
      return true;
    }
    lastPrintAt.current = Date.now();
    return false;
  }

  async function printPlate() {
    if (pending) return;
    if (printerCooling()) return;
    const nextPrompt = prompt.trim();
    if (brand.name.trim().length < 2) {
      toast.error("Name your shop first.");
      setBrandOpen(true);
      return;
    }
    if (mode === "edit" && !sourceImage) {
      toast.error("Choose an image to edit, or switch back to Create.");
      return;
    }
    const nextProduct = coerceProductId(productId);
    const preset = printifyPreset(nextProduct);
    setPending(true);
    try {
      const still = await runPrint({
        prompt: nextPrompt,
        styleId: coerceStyleId(styleId),
        productId: nextProduct,
        categoryId: coerceCategoryId(categoryId),
        leadId: coerceLeadId(leadId),
        aspectRatio: preset.aspect,
        anime,
        note: "",
        edit: mode === "edit",
        source: sourceImage,
      });
      if (!still) return;
      setCurrent(still);
      setAspectRatio(preset.aspect);
      setSourceImage(mode === "edit" ? still.dataUrl : null);
      toast.success(mode === "edit" ? "Edited." : "Print file ready.", {
        action: {
          label: "Printify zip",
          onClick: () => void zipPack([still], "printify"),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        /failed to fetch|networkerror|load failed/i.test(message)
          ? "Could not reach the printer. Try again."
          : message || "The printer misfired.",
      );
    } finally {
      setPending(false);
    }
  }

  async function printDrop() {
    if (pending) return;
    if (printerCooling()) return;
    const nextPrompt = prompt.trim();
    if (brand.name.trim().length < 2) {
      toast.error("Name your shop first.");
      setBrandOpen(true);
      return;
    }
    if (mode === "edit") {
      toast.error("Switch to New to print a drop.");
      return;
    }
    const nextProduct = coerceProductId(productId);
    const preset = printifyPreset(nextProduct);
    const jobs = dropSlots();
    setPending(true);
    setDropTotal(jobs.length);
    let printed = 0;
    let last: Still | null = null;
    try {
      for (let i = 0; i < jobs.length; i += 1) {
        const job = jobs[i]!;
        setDropStep(i + 1);
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 15000));
        }
        const still = await runPrint({
          prompt: nextPrompt,
          styleId: coerceStyleId(styleId),
          productId: nextProduct,
          categoryId: job.categoryId,
          leadId: job.leadId,
          aspectRatio: preset.aspect,
          anime,
          note: job.note,
          edit: false,
          source: null,
        });
        if (still) {
          printed += 1;
          last = still;
          setCurrent(still);
        }
      }
      if (last) {
        setCurrent(last);
        setCategoryId(last.categoryId);
        setLeadId(last.leadId);
        setAspectRatio(preset.aspect);
      }
      if (printed === 0) toast.error("Drop missed.");
      else {
        const pack = useGallery.getState().items.slice(0, printed);
        toast.success(`Drop printed. ${printed} Printify files. Zipping…`);
        await zipPack(pack, "printify");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        /failed to fetch|networkerror|load failed/i.test(message)
          ? "Could not reach the printer. Try again."
          : message || "The drop misfired.",
      );
    } finally {
      setDropStep(0);
      setPending(false);
    }
  }

  async function runPrint({
    prompt: nextPrompt,
    styleId: nextStyle,
    productId: nextProduct,
    categoryId: nextCategory,
    leadId: nextLead,
    aspectRatio: nextRatio,
    anime: nextAnime,
    note,
    edit,
    source,
  }: {
    prompt: string;
    styleId: StyleId;
    productId: ProductId;
    categoryId: CategoryId;
    leadId: LeadId;
    aspectRatio: AspectRatioId;
    anime: boolean;
    note: string;
    edit: boolean;
    source?: string | null;
  }): Promise<Still | null> {
    const seed = [nextPrompt.trim(), note.trim()].filter(Boolean).join(". ");
    const composedPrompt = composePrompt(
      seed,
      nextStyle,
      nextProduct,
      brand,
      "plate",
      crypto.randomUUID().slice(0, 8),
      nextCategory,
      nextLead,
      nextAnime,
    );

    try {
      await usePrinter.persist.rehydrate();
    } catch {
      /* storage still empty is fine */
    }
    const googleKey = usePrinter.getState().googleKey.trim() || undefined;
    const request = async () =>
      edit && source
        ? editStill({
            data: {
              prompt: composedPrompt,
              imageDataUrl: source,
              aspectRatio: nextRatio,
              styleId: nextStyle,
              googleKey,
            },
          })
        : generateStill({
            data: {
              prompt: composedPrompt,
              aspectRatio: nextRatio,
              styleId: nextStyle,
              googleKey,
            },
          });

    const pull = async () => {
      try {
        return await request();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!/failed to fetch|networkerror|load failed/i.test(message)) {
          toast.error(message || "The printer misfired.");
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 900));
        try {
          return await request();
        } catch {
          toast.error("Could not reach the printer. Try again.");
          return null;
        }
      }
    };

    let result = await pull();
    if (!result) return null;
    if (!result.ok) {
      toast.error(result.error);
      return null;
    }
    if (await looksLikePhoto(result.dataUrl)) {
      const retry = await pull();
      if (retry?.ok && !(await looksLikePhoto(retry.dataUrl))) result = retry;
    }
    const pngUrl = await finishPrintFile(result.dataUrl).catch(() => result!.dataUrl);
    const copy = plateCopy(brand, nextPrompt, nextCategory);
    const lettered = await letterPlate(pngUrl, copy, brand.ink, brand.accent, theme.font).catch(() => pngUrl);
    const still: Still = {
      id: crypto.randomUUID(),
      prompt: nextPrompt || "Designer pick",
      composedPrompt,
      aspectRatio: nextRatio,
      styleId: nextStyle,
      productId: nextProduct,
      categoryId: nextCategory,
      leadId: nextLead,
      lens: "plate",
      anime: nextAnime,
      dataUrl: lettered,
      createdAt: Date.now(),
      mode: edit ? "edit" : "create",
    };
    addStill(still);
    return still;
  }

  async function zipPack(stills: Still[], kind: "images" | "printify" = "images") {
    if (packing || stills.length === 0) return;
    setPacking(true);
    setPackStep(0);
    try {
      const run = kind === "printify" ? zipPrintifyPack : zipGeneratedImages;
      await run(stills, brand, (done, total) => setPackStep(total > 1 ? done : 0));
      toast.success(`Saved to ${saveToLabel()}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not zip.");
    } finally {
      setPacking(false);
      setPackStep(0);
    }
  }

  function loadStill(still: Still, asEdit = false) {
    setCurrent(still);
    setPrompt(still.prompt);
    setStyleId(coerceStyleId(still.styleId));
    setProductId(coerceProductId(still.productId));
    setCategoryId(coerceCategoryId(still.categoryId));
    setLeadId(coerceLeadId(still.leadId));
    setAnime(Boolean(still.anime));
    setAspectRatio(coerceAspectRatioId(still.aspectRatio));
    setLens(coerceLensId(still.lens));
    if (asEdit) {
      setMode("edit");
      setSourceImage(still.dataUrl);
    } else {
      setMode("create");
      setSourceImage(null);
    }
  }

  async function startOver() {
    if (pending || packing) return;
    if (items.length === 0 && !current && !sourceImage) {
      toast.message("Already empty.");
      return;
    }
    if (!window.confirm("Delete every print on this device and start over? Shop name stays.")) return;
    clearGallery();
    setCurrent(null);
    setLightbox(null);
    setListing(null);
    setSourceImage(null);
    setMode("create");
    setPrompt("");
    setLens("plate");
    await idbClearPrefix("blank:");
    toast.success("Cleared. Fresh start.");
  }

  return (
    <div className="app-shell flex min-h-dvh flex-col text-foreground">
      <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => setBrandOpen(true)}
          className="min-w-0 rounded-[var(--radius-md)] text-left transition-[opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:opacity-80"
        >
          <p className="font-display truncate text-2xl leading-none font-extrabold tracking-[-0.04em] text-foreground sm:text-3xl">
            {houseName}
          </p>
          <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {brand.audience === "kids" ? "Kids" : brand.audience === "women" ? "Women's" : "Men's"} {theme.label}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex" aria-hidden="true">
            {[brand.ink, brand.paper, brand.accent].map((hex) => (
              <span
                key={hex}
                className="size-4 rounded-full shadow-[var(--shadow-border)]"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="relative z-10 min-h-11 px-4"
            onClick={() => setBrandOpen(true)}
            title="Shop name, who it's for, look"
          >
            {ready ? "Shop" : "Set up"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="relative z-10 min-h-11 px-3"
            disabled={pending || packing}
            onClick={() => void startOver()}
            title="Delete all prints on this device and start over"
          >
            <Trash2 className="size-4" />
            Start over
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="relative z-10 size-11"
            onClick={() => setSettingsOpen(true)}
            title="Printer key and save location"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
          <p className="rounded-full bg-card px-2.5 py-2 text-sm text-muted-foreground tabular-nums shadow-[var(--shadow-border)] sm:px-3">
            {visibleItems.length}
            <span className="hidden text-ink-subtle sm:inline"> prints</span>
          </p>
        </div>
      </header>

      <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-5">
        <section
          className={cn(
            "glass-panel relative flex min-h-56 shrink-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-xl)] sm:min-h-96",
            dragging && "bg-raised",
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">
              {pending ? "Printing" : packing ? "Packing" : stageImage ? "Printed" : "Press"}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {pending
                ? `${dropStep ? `${dropStep}/${dropTotal} · ` : ""}${elapsed}s`
                : packing
                  ? packStep
                    ? `Zip ${packStep}`
                    : "Zipping"
                  : visibleItems.length
                    ? `${visibleItems.length} on this phone`
                    : ready
                      ? "Ready"
                      : "Set up shop first"}
            </p>
          </div>
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) void acceptFile(file);
            }}
          >
          {stageImage ? (
            <button
              type="button"
              className={cn(
                "flex size-full items-center justify-center p-3 sm:p-6 checkerboard",
              )}
              onClick={() => current && setLightbox(current)}
              disabled={!current}
            >
              <img
                src={stageImage}
                alt={current?.prompt ?? "Source image"}
                className={cn(
                  "max-h-full max-w-full object-contain shadow-[var(--shadow-print)] outline outline-1 -outline-offset-1 outline-foreground/10",
                  pending && "opacity-40",
                )}
                style={{
                  aspectRatio: current
                    ? current.aspectRatio.replace(":", " / ")
                    : `${frame.w} / ${frame.h}`,
                  borderRadius: "var(--radius-md)",
                }}
              />
            </button>
          ) : (
            <EmptyStage
              brandName={houseName}
              audience={brand.audience}
              ready={ready}
              onEditBrand={() => setBrandOpen(true)}
            />
          )}

          {pending || packing ? (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-4 sm:p-5">
              <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          </div>
        </section>

        {visibleItems.length > 0 ? (
          <section className="glass-panel rounded-[var(--radius-xl)] px-3 py-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">
                Printed
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">{visibleItems.length}</p>
            </div>
            <FilmStrip
              items={visibleItems}
              selectedId={selectedId}
              onSelect={(still) => loadStill(still)}
              onOpen={(still) => setLightbox(still)}
            />
          </section>
        ) : null}

        <PromptDock
          prompt={prompt}
          setPrompt={setPrompt}
          styleId={styleId}
          setStyleId={setStyleId}
          productId={productId}
          setProductId={setProductId}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          leadId={leadId}
          setLeadId={setLeadId}
          anime={anime}
          setAnime={setAnime}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          mode={mode}
          setMode={(next) => {
            setMode(next);
            if (next === "create") setSourceImage(null);
          }}
          sourceImage={sourceImage}
          pending={pending}
          promptRef={promptRef}
          placeholder={
            mode === "edit"
              ? "What should change? A cleaner lighthouse, thicker lines…"
              : "What to draw. Example: a leaping tarpon, a lighthouse, a skull. Leave blank and the shop invents it."
          }
          onSubmit={() => void printPlate()}
          onDropPack={() => void printDrop()}
          onClearSource={() => {
            setSourceImage(null);
            if (!current) setMode("create");
          }}
          onPickFile={() => fileRef.current?.click()}
          still={current}
          brand={brand}
          ready={ready}
          items={visibleItems}
          packing={packing}
          onAudience={(id) => patchBrand(applyAudience(id, brand))}
          onTheme={(id) => patchBrand(applyTheme(id))}
          onZip={(pack, kind) => void zipPack(pack, kind)}
          onEtsy={() => {
            if (current) setListing(current);
          }}
        />
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void acceptFile(file);
        }}
      />

      {brandOpen ? (
        <BrandSheet
          brand={brand}
          onSave={(next) => useBrand.getState().setBrand(next)}
          onClose={() => setBrandOpen(false)}
        />
      ) : null}

      {settingsOpen ? (
        <SettingsSheet
          onClose={() => setSettingsOpen(false)}
          onStartOver={() => {
            setSettingsOpen(false);
            void startOver();
          }}
        />
      ) : null}

      {listing ? (
        <EtsySheet
          still={listing}
          brand={brand}
          onClose={() => setListing(null)}
        />
      ) : null}

      {lightbox ? (
        <Lightbox
          still={lightbox}
          brand={brand}
          onClose={() => setLightbox(null)}
          onZip={(stills, kind) => void zipPack(stills, kind ?? "images")}
          packing={packing}
          onEtsy={() => {
            setListing(lightbox);
            setLightbox(null);
          }}
          onEdit={() => {
            loadStill(lightbox, true);
            setLightbox(null);
            promptRef.current?.focus();
          }}
          onUsePrompt={() => {
            loadStill(lightbox);
            setLightbox(null);
            promptRef.current?.focus();
          }}
          onDelete={() => {
            removeStill(lightbox.id);
            if (current?.id === lightbox.id) setCurrent(null);
            setLightbox(null);
          }}
        />
      ) : null}
    </div>
  );
}

function EmptyStage({
  brandName,
  audience,
  ready,
  onEditBrand,
}: {
  brandName: string;
  audience: Brand["audience"];
  ready: boolean;
  onEditBrand: () => void;
}) {
  if (ready) {
    return (
      <div className="flex max-w-lg flex-col items-start gap-4 px-5 py-6 sm:px-10 sm:py-10">
        <div className="stage-enter">
          <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl">
            Press is clear.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            {audience === "kids"
              ? "Kids clothing shop."
              : audience === "women"
                ? "Women's clothing shop."
                : "Men's clothing shop."}{" "}
            Tap 1 design for one Printify file, or 3 HD for a zip.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex max-w-lg flex-col items-start gap-5 px-5 py-6 sm:px-10 sm:py-10">
      <div className="stage-enter">
        <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl">
          Start {brandName}.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
          {audience === "kids"
            ? "Kids clothing shop."
            : audience === "women"
              ? "Women's clothing shop."
              : "Men's clothing shop."}{" "}
          Name the shop once. After that this window is only for printing.
        </p>
      </div>
      <ol className="stage-enter w-full space-y-2.5 text-sm text-muted-foreground">
        <li>
          <span className="font-semibold text-foreground">1. Shop</span>
          {" — "}name your brand and pick Men, Women, or Kids.
        </li>
        <li>
          <span className="font-semibold text-foreground">2. 1 design</span>
          {" — "}one transparent print file for Printify.
        </li>
        <li>
          <span className="font-semibold text-foreground">3. 3 HD</span>
          {" — "}three high-resolution print files, zipped for Printify.
        </li>
      </ol>
      <button
        type="button"
        onClick={onEditBrand}
        className="stage-enter inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        Set up shop
      </button>
    </div>
  );
}

function FilmStrip({
  items,
  selectedId,
  onSelect,
  onOpen,
}: {
  items: Still[];
  selectedId: string | null;
  onSelect: (still: Still) => void;
  onOpen: (still: Still) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
      {items.map((still, index) => {
        const selected = still.id === selectedId;
        return (
          <button
            key={still.id}
            type="button"
            onClick={() => onSelect(still)}
            onDoubleClick={() => onOpen(still)}
            className={cn(
              "relative shrink-0 overflow-hidden rounded-[var(--radius-md)] checkerboard transition-[box-shadow,opacity,transform] duration-[var(--motion-fast)] ease-[var(--ease-out)] active:scale-[0.96]",
              selected
                ? "shadow-[0_0_0_1px_var(--color-primary)]"
                : "opacity-80 shadow-[var(--shadow-border)] hover:opacity-100",
            )}
            aria-label={`Open still ${index + 1}`}
          >
            <img
              src={still.dataUrl}
              alt=""
              className="h-16 w-auto object-cover sm:h-[4.5rem]"
              style={{ aspectRatio: still.aspectRatio.replace(":", " / ") }}
            />
            <span className="pointer-events-none absolute bottom-1 left-1 text-[10px] font-medium tabular-nums text-background/90">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PromptDock({
  prompt,
  setPrompt,
  styleId,
  setStyleId,
  productId,
  setProductId,
  categoryId,
  setCategoryId,
  leadId,
  setLeadId,
  anime,
  setAnime,
  aspectRatio,
  setAspectRatio,
  mode,
  setMode,
  sourceImage,
  pending,
  promptRef,
  placeholder,
  onSubmit,
  onDropPack,
  onClearSource,
  onPickFile,
  still,
  brand,
  ready,
  items,
  packing,
  onAudience,
  onTheme,
  onZip,
  onEtsy,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  styleId: StyleId;
  setStyleId: (value: StyleId) => void;
  productId: ProductId;
  setProductId: (value: ProductId) => void;
  categoryId: CategoryId;
  setCategoryId: (value: CategoryId) => void;
  leadId: LeadId;
  setLeadId: (value: LeadId) => void;
  anime: boolean;
  setAnime: (value: boolean) => void;
  aspectRatio: AspectRatioId;
  setAspectRatio: (value: AspectRatioId) => void;
  mode: StudioMode;
  setMode: (value: StudioMode) => void;
  sourceImage: string | null;
  pending: boolean;
  promptRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
  onSubmit: () => void;
  onDropPack: () => void;
  onClearSource: () => void;
  onPickFile: () => void;
  still: Still | null;
  brand: Brand;
  ready: boolean;
  items: Still[];
  packing: boolean;
  onAudience: (id: Brand["audience"]) => void;
  onTheme: (id: Brand["themeId"]) => void;
  onZip: (stills: Still[], kind?: "images" | "printify") => void;
  onEtsy: () => void;
}) {
  const [more, setMore] = useState(false);
  return (
    <section className="glass-panel w-full min-w-0 rounded-[var(--radius-xl)] p-3 sm:p-4">
      {ready ? null : (
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex w-full rounded-full bg-background p-1 shadow-[var(--shadow-border)] sm:w-auto">
          {AUDIENCES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onAudience(item.id)}
              title={item.hint}
              className={cn(
                "h-10 flex-1 rounded-full px-3 text-sm font-semibold transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] sm:flex-none sm:px-5",
                brand.audience === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      )}

      <Textarea
        ref={promptRef}
        value={prompt}
        maxLength={MAX_PROMPT}
        rows={3}
        placeholder={placeholder}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSubmit();
          }
        }}
        className="min-h-24 px-1 py-1 sm:min-h-28"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Type the picture you want. The shop name is added as the brand — don’t type slogans.
      </p>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setMore((open) => !open)}
          aria-expanded={more}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-full px-4 text-sm font-semibold transition-[background-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
            more
              ? "bg-primary text-primary-foreground"
              : "bg-raised text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
          )}
        >
          {more ? "Hide extra" : "More options"}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)]",
              more && "rotate-180",
            )}
          />
        </button>
        {more ? (
          <div className="mt-2 space-y-2">
          {ready ? (
          <div className="flex w-full rounded-full bg-background p-1 shadow-[var(--shadow-border)]">
            {AUDIENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onAudience(item.id)}
                title={item.hint}
                className={cn(
                  "h-10 flex-1 rounded-full px-3 text-sm font-semibold transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  brand.audience === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          ) : null}
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.hook}
                onClick={() => onTheme(item.id)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-[background-color,color,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
                  brand.themeId === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground shadow-[var(--shadow-border)] hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <ChipRow label="Product">
            {PRODUCTS.map((item) => {
              const preset = printifyPreset(item.id);
              return (
                <Chip
                  key={item.id}
                  pressed={productId === item.id}
                  title={`${preset.label} · ${preset.inches} in · ${preset.note}`}
                  onClick={() => {
                    setProductId(item.id);
                    setAspectRatio(preset.aspect);
                  }}
                >
                  {item.label}
                  <span className="ml-1.5 text-[10px] font-medium opacity-70">
                    {preset.inches}
                  </span>
                </Chip>
              );
            })}
          </ChipRow>
          <ChipRow label="Kind of design">
            {CATEGORIES.map((item) => (
              <Chip
                key={item.id}
                pressed={categoryId === item.id}
                onClick={() => setCategoryId(item.id)}
              >
                {item.label}
              </Chip>
            ))}
          </ChipRow>
          <ChipRow label="Look">
            {STYLES.map((item) => (
              <Chip
                key={item.id}
                pressed={styleId === item.id}
                onClick={() => setStyleId(item.id)}
              >
                {item.label}
              </Chip>
            ))}
          </ChipRow>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAnime(!anime)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold",
                anime
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground shadow-[var(--shadow-border)]",
              )}
            >
              <Sparkles className="size-3.5" />
              Anime
            </button>
            <Button variant="ghost" size="sm" onClick={onPickFile}>
              <ImagePlus className="size-4" />
              Upload to edit
            </Button>
          </div>
          </div>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:justify-end">
            <Button
              size="lg"
              disabled={pending || packing}
              onClick={onSubmit}
              title="Make one Printify print file"
              className="h-11 min-w-0 px-3 text-sm lg:h-12 lg:px-6"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
              {mode === "edit" ? "Apply" : "1 design"}
            </Button>
            {mode === "create" ? (
              <Button
                variant="outline"
                size="lg"
                disabled={pending || packing}
                onClick={onDropPack}
                title={`Make ${DROP_COUNT} high-resolution Printify files`}
                className="h-11 min-w-0 px-3 text-sm lg:h-12 lg:px-6"
              >
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Layers className="size-4" />
                )}
                3 HD
              </Button>
            ) : null}
            {still ? (
              <ExportButtons
                still={still}
                brand={brand}
                items={items}
                size="lg"
                dock
                packing={packing}
                onZip={onZip}
                onEtsy={onEtsy}
              />
            ) : items.length > 0 ? (
              <Button
                variant="outline"
                size="lg"
                disabled={packing}
                onClick={() => onZip(items, "images")}
                title="Download generated images as a zip"
                className="min-w-0"
              >
                {packing ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}
                Zip
              </Button>
            ) : null}
          </div>
    </section>
  );
}

function ChipRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
        {label}
      </span>
      <div className="chip-scroller">
        {children}
      </div>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  title,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--ease-out)] active:scale-[0.96] sm:h-10 sm:gap-2 sm:px-3.5 sm:text-sm",
        pressed
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground shadow-[var(--shadow-border)] hover:text-foreground hover:shadow-[var(--shadow-border-hover)]",
      )}
    >
      {children}
    </button>
  );
}

function Lightbox({
  still,
  brand,
  packing,
  onClose,
  onZip,
  onEtsy,
  onEdit,
  onUsePrompt,
  onDelete,
}: {
  still: Still;
  brand: Brand;
  packing?: boolean;
  onClose: () => void;
  onZip: (stills: Still[], kind?: "images" | "printify") => void;
  onEtsy: () => void;
  onEdit: () => void;
  onUsePrompt: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/92 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Still"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="min-w-0 truncate text-sm text-muted-foreground">
          {still.prompt}
        </p>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </Button>
      </div>
      <div
        className={cn(
          "mx-4 mb-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] px-4 py-4 checkerboard",
        )}
      >
        <img
          src={still.dataUrl}
          alt={still.prompt}
          className="max-h-full max-w-full object-contain"
          style={{ borderRadius: "var(--radius-md)" }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-4">
        <ExportButtons still={still} brand={brand} packing={packing} onZip={(pack, kind) => onZip(pack, kind)} onEtsy={onEtsy} />
        <Button variant="outline" onClick={onUsePrompt}>
          Use prompt
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button variant="danger" onClick={onDelete}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}
