import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/image-file";
import { buildEtsyListing, listingText } from "@/lib/etsy";
import type { Brand } from "@/lib/brand";
import type { Still } from "@/lib/studio-data";

export function EtsySheet({
  still,
  brand,
  onClose,
}: {
  still: Still;
  brand: Brand;
  onClose: () => void;
}) {
  const listing = useMemo(() => buildEtsyListing(still, brand), [still, brand]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`${label} copied.`);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Could not copy. Select the text instead.");
    }
  }

  function downloadTxt() {
    downloadBlob(
      new Blob([listingText(listing)], { type: "text/plain;charset=utf-8" }),
      `${listing.filename}-etsy.txt`,
    );
    toast.success("Etsy listing saved.");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/92 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Etsy listing"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div>
          <p className="font-display text-xl font-extrabold tracking-[-0.04em]">
            Etsy listing
          </p>
          <p className="text-sm text-muted-foreground">
            Title, tags, description — paste into your shop.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </Button>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 sm:px-6">
        <Block
          label={`Title  ${listing.title.length}/140`}
          copied={copied === "Title"}
          onCopy={() => void copy("Title", listing.title)}
        >
          <p className="text-sm leading-relaxed text-foreground">{listing.title}</p>
        </Block>

        <Block
          label={`Tags  ${listing.tags.length}/13`}
          copied={copied === "Tags"}
          onCopy={() => void copy("Tags", listing.tags.join(", "))}
        >
          <ul className="flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-medium text-foreground shadow-[var(--shadow-border)]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </Block>

        <p className="text-xs text-muted-foreground">{listing.category}</p>

        <Block
          label="Description"
          copied={copied === "Description"}
          onCopy={() => void copy("Description", listing.description)}
        >
          <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {listing.description}
          </pre>
        </Block>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => void copy("Listing", listingText(listing))}
          >
            {copied === "Listing" ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy all
          </Button>
          <Button onClick={downloadTxt}>Download .txt</Button>
        </div>
      </div>
    </div>
  );
}

function Block({
  label,
  copied,
  onCopy,
  children,
}: {
  label: string;
  copied: boolean;
  onCopy: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-[var(--radius-lg)] bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
          {label}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground transition-[color] duration-[var(--motion-quick)] hover:text-foreground"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          Copy
        </button>
      </div>
      {children}
    </section>
  );
}
