import { useEffect, useState } from "react";
import { Archive, FileCode2, Image, Save, Store, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadPng, downloadSvg, fileStem } from "@/lib/export";
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
  print: "Print-ready. 300 DPI on this canvas.",
  soft: "A bit soft on a full front. Fine for a smaller placement.",
  draft: "Below the DPI floor for a full front. Left-chest, or print anyway.",
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
  const [busy, setBusy] = useState<"png" | "svg" | "printify" | null>(null);
  const [pack, setPack] = useState<PrintifyBuild | null>(null);
  const slug = brandSlug(brand);
  const stem = fileStem(still.id, slug);
  const preset = printifyPreset(still.productId);
  const colors = [brand.ink, brand.paper, brand.accent];
  const base = `${slug}-${preset.id}-${preset.width}x${preset.height}`;
  const blocked = Boolean(busy) || packing;

  async function savePng() {
    if (blocked) return;
    setBusy("png");
    try {
      await downloadPng(still.dataUrl, `${stem}.png`);
      toast.success("PNG saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save PNG.");
    } finally {
      setBusy(null);
    }
  }

  async function saveSvg() {
    if (blocked) return;
    setBusy("svg");
    try {
      await downloadSvg(still.dataUrl, `${base}-art.svg`, colors, still.productId, true);
      toast.success("Vector SVG saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save vector.");
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
        still.lens !== "lookbook",
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
      await saveBlob(next.blob, `${base}.png`);
      await saveBlob(next.artBlob, `${base}-art.png`);
      await downloadSvg(still.dataUrl, `${base}-art.svg`, colors, still.productId, true);
      toast.success(
        next.grade === "print"
          ? "Saved Printify PNG, transparent art PNG, and SVG."
          : `Saved. ${GRADE_COPY[next.grade]}`,
      );
      setPack(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save Printify files.");
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
      title="Check transparency, then zip Printify files"
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
          <Button
            variant="outline"
            size={size}
            disabled={blocked}
            onClick={() => void saveSvg()}
            title="Printify vector"
          >
            <FileCode2 className="size-4" />
            {busy === "svg" ? "Tracing" : "Vector"}
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
            Check the clean file, then zip the pack.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </Button>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-4 overflow-y-auto px-4 pb-8 sm:px-6">
        <div className="checkerboard flex min-h-72 flex-1 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] p-6">
          <img
            src={pack.previewUrl}
            alt="Transparent Printify art"
            className="max-h-[min(70dvh,28rem)] max-w-full object-contain"
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {pack.artWidth}×{pack.artHeight} art → {pack.preset.width}×{pack.preset.height} · {pack.dpi} DPI · {pack.grade}
          </p>
          <p className="text-sm text-muted-foreground">{GRADE_COPY[pack.grade]}</p>
          <p className="text-sm text-muted-foreground">
            {pack.preset.label} · {pack.preset.inches} · {PRINTIFY_CATALOG[pack.preset.id]}
          </p>
          <p className="text-sm text-muted-foreground">
            Zip folders: brand / printify (art.png + art.svg + canvas) / listing / prompt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canZip ? (
            <Button className="flex-1" disabled={busy} onClick={onZip}>
              <Archive className="size-4" />
              {busy ? "Zipping" : "Zip pack"}
            </Button>
          ) : null}
          <Button variant="outline" disabled={busy} onClick={onFiles}>
            {busy ? "Saving" : "Loose files"}
          </Button>
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
