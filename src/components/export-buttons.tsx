import { useEffect, useState } from "react";
import { Archive, Image, Save, Store, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  buildPrintifyPng,
  PRINTIFY_CATALOG,
  printifyPreset,
  type PrintifyBuild,
} from "@/lib/printify";
import { saveBlob } from "@/lib/save-to";
import { brandSlug, type Brand } from "@/lib/brand";
import type { Still } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

const GRADE_COPY = {
  print: "Print-ready. Full 300 DPI canvas for this product.",
  soft: "Scaled onto the Printify canvas. Fine for a full front if the lines stay clean.",
  draft: "Scaled onto the Printify canvas from a small plate. Print a new one if it looks soft on the shirt.",
} as const;

export function ExportButtons({
  still,
  brand,
  items = [],
  size = "default",
  dock = false,
  packing = false,
  onEtsy,
  onZip,
}: {
  still: Still;
  brand: Brand;
  items?: Still[];
  size?: "default" | "sm" | "lg";
  dock?: boolean;
  packing?: boolean;
  onEtsy?: () => void;
  onZip?: (stills: Still[], kind?: "images" | "printify") => void;
}) {
  const [busy, setBusy] = useState<"png" | "printify" | null>(null);
  const [pack, setPack] = useState<PrintifyBuild | null>(null);
  const slug = brandSlug(brand);
  const preset = printifyPreset(still.productId);
  const blocked = Boolean(busy) || packing;

  async function savePng() {
    if (blocked) return;
    setBusy("png");
    try {
      const next = await buildPrintifyPng(still.dataUrl, still.productId, false);
      await saveBlob(next.blob, `${slug}-${preset.id}-printify.png`);
      toast.success("Printify PNG saved — transparent graphic, drop it on the shirt.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save PNG.");
    } finally {
      setBusy(null);
    }
  }

  async function openPrintify() {
    if (blocked) return;
    setBusy("printify");
    try {
      const next = await buildPrintifyPng(
        still.dataUrl,
        still.productId,
        false,
      );
      setPack(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build the Printify file.");
    } finally {
      setBusy(null);
    }
  }

  async function confirmFiles(next: PrintifyBuild) {
    setBusy("printify");
    try {
      await saveBlob(next.blob, `${slug}-${preset.id}-printify.png`);
      toast.success("Printify PNG saved. Upload that file — not a shirt photo.");
      setPack(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save Printify file.");
    } finally {
      setBusy(null);
    }
  }

  function confirmZip() {
    setPack(null);
    onZip?.([still], "printify");
  }

  const saveButton = (
    <Button
      size={size}
      disabled={blocked}
      onClick={() => void openPrintify()}
      className={cn(dock && "h-11 min-w-0 px-3 text-sm lg:h-12 lg:px-6")}
      title="Download a transparent PNG for Printify"
    >
      <Save className="size-4" />
      {busy === "printify" ? "Cleaning" : "Printify"}
    </Button>
  );

  const zipImagesButton = onZip ? (
    <Button
      variant="outline"
      size={size}
      disabled={blocked}
      onClick={() => onZip(items.length ? items : [still], "images")}
      className={cn(dock && "h-11 min-w-0 px-3 text-sm lg:h-12 lg:px-6")}
      title="Download generated images as a zip"
    >
      <Archive className="size-4" />
      {packing ? "Zipping" : items.length > 1 ? "Zip" : "Zip"}
    </Button>
  ) : null;

  return (
    <>
      {dock ? (
        <>
          {zipImagesButton}
          {saveButton}
        </>
      ) : (
        <>
          {saveButton}
          {zipImagesButton}
          <Button
            variant="outline"
            size={size}
            disabled={blocked}
            onClick={() => void savePng()}
            title="Preview PNG"
          >
            <Image className="size-4" />
            {busy === "png" ? "Saving" : "PNG"}
          </Button>
          {onEtsy ? (
            <Button variant="outline" size={size} onClick={onEtsy} title="Etsy listing copy">
              <Store className="size-4" />
              Listing
            </Button>
          ) : null}
        </>
      )}
      {pack ? (
        <PrintifySheet
          pack={pack}
          busy={busy === "printify" || packing}
          canZip={Boolean(onZip)}
          canZipAll={Boolean(onZip) && items.length > 1}
          onZip={() => confirmZip()}
          onZipAll={() => {
            setPack(null);
            onZip?.(items, "printify");
          }}
          onFiles={() => void confirmFiles(pack)}
          onClose={() => setPack(null)}
        />
      ) : null}
    </>
  );
}

function PrintifySheet({
  pack,
  busy,
  canZip,
  canZipAll,
  onZip,
  onZipAll,
  onFiles,
  onClose,
}: {
  pack: PrintifyBuild;
  busy: boolean;
  canZip: boolean;
  canZipAll: boolean;
  onZip: () => void;
  onZipAll: () => void;
  onFiles: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/92 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Printify preview"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div>
          <p className="font-display text-xl font-extrabold tracking-[-0.04em]">
            Printify
          </p>
          <p className="text-sm text-muted-foreground">
            Transparent graphic only. Upload this in Printify Product Creator and place it on the shirt.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </Button>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-4 overflow-y-auto px-4 pb-8 sm:px-6">
        <div
          className={cn(
            "flex min-h-72 flex-1 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] p-6",
            pack.transparent && "checkerboard",
          )}
        >
          <img
            src={pack.previewUrl}
            alt="Transparent Printify art"
            className="max-h-[min(70dvh,28rem)] max-w-full object-contain"
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {pack.artWidth}×{pack.artHeight} PNG · {pack.dpi} DPI {pack.preset.label.toLowerCase()}
          </p>
          <p className="text-sm text-muted-foreground">{GRADE_COPY[pack.grade]}</p>
          <p className="text-sm text-muted-foreground">
            {PRINTIFY_CATALOG[pack.preset.id]}. Transparent graphic. Drop this on the shirt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="flex-1" disabled={busy} onClick={onFiles}>
            {busy ? "Saving" : "Download PNG"}
          </Button>
          {canZip ? (
            <Button variant="outline" disabled={busy} onClick={onZip}>
              <Archive className="size-4" />
              {busy ? "Zipping" : "Zip pack"}
            </Button>
          ) : null}
          {canZipAll ? (
            <Button variant="outline" disabled={busy} onClick={onZipAll}>
              Zip all
            </Button>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
