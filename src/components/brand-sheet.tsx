import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  applyAudience,
  applyTheme,
  AUDIENCES,
  normalizeBrand,
  suggestInitials,
  THEMES,
  type Brand,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandSheet({
  brand,
  onSave,
  onClose,
}: {
  brand: Brand;
  onSave: (brand: Brand) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => normalizeBrand(brand));
  const [error, setError] = useState("");
  const looksDefault = draft.name.trim().toLowerCase() === "fenrax";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch(partial: Partial<Brand>) {
    setError("");
    setDraft((current) => normalizeBrand({ ...current, ...partial }));
  }

  function save() {
    const name = draft.name.trim();
    if (name.length < 2) {
      setError("Type your shop name. That’s the brand on the shirts.");
      return;
    }
    onSave(draft);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-background pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Your shop"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl font-extrabold tracking-[-0.04em]">Your shop</p>
            <p className="text-sm text-muted-foreground">
              Name it, pick Men, Women, or Kids, pick a look.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="size-11" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        <form
          className="flex flex-1 flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
        <div className="grid grid-cols-3 gap-3">
          <Field label="Shop name" className="col-span-2">
            <input
              value={draft.name}
              maxLength={40}
              placeholder="Your brand"
              enterKeyHint="done"
              onFocus={(event) => {
                if (looksDefault) event.currentTarget.select();
              }}
              onChange={(event) => {
                const name = event.target.value;
                const nextMark = suggestInitials(name);
                const markLocked =
                  draft.initials.length > 0 &&
                  draft.initials !== suggestInitials(draft.name);
                patch(markLocked ? { name } : { name, initials: nextMark });
              }}
              className={fieldClass}
            />
          </Field>
          <Field label="Mark">
            <input
              value={draft.initials}
              maxLength={6}
              placeholder="FR"
              onChange={(event) => patch({ initials: event.target.value.toUpperCase() })}
              className={fieldClass}
            />
          </Field>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {looksDefault ? (
          <p className="text-xs text-muted-foreground">
            Fenrax is the studio. Replace it with the brand you sell.
          </p>
        ) : null}

        <div className="space-y-1.5">
          <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
            Who is this for
          </span>
          <div className="flex rounded-full bg-background p-1 shadow-[var(--shadow-border)]">
            {AUDIENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={draft.audience === item.id}
                onClick={() => patch(applyAudience(item.id, draft))}
                className={cn(
                  "h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  draft.audience === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
            Direction
          </span>
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                aria-pressed={draft.themeId === theme.id}
                onClick={() => patch(applyTheme(theme.id))}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-[background-color,color,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
                  draft.themeId === theme.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground shadow-[var(--shadow-border)] hover:text-foreground",
                )}
              >
                {theme.label}
              </button>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {THEMES.find((item) => item.id === draft.themeId)?.world} A starting world — the designer still invents.
          </p>
        </div>

        <Field label="Colors">
          <div className="grid grid-cols-3 gap-2">
            <Swatch label="Ink" value={draft.ink} onChange={(ink) => patch({ ink })} />
            <Swatch label="Paper" value={draft.paper} onChange={(paper) => patch({ paper })} />
            <Swatch label="Accent" value={draft.accent} onChange={(accent) => patch({ accent })} />
          </div>
        </Field>

        <Field label="Motifs">
          <input
            value={draft.motifs}
            maxLength={180}
            placeholder="What always shows up in the art"
            onChange={(event) => patch({ motifs: event.target.value })}
            className={fieldClass}
          />
        </Field>

        <Field label="Vibe">
          <input
            value={draft.vibe}
            maxLength={140}
            placeholder="How the brand should feel"
            onChange={(event) => patch({ vibe: event.target.value })}
            className={fieldClass}
          />
        </Field>

        <Field label="Notes">
          <Textarea
            value={draft.notes}
            maxLength={400}
            rows={3}
            placeholder="Anything to always keep — a crest, a banned color…"
            onChange={(event) => patch({ notes: event.target.value })}
            className="min-h-24 rounded-[var(--radius-md)] px-3 py-3 shadow-[var(--shadow-border)]"
          />
        </Field>

        <div className="mt-2 flex items-center justify-between gap-3 pb-4">
          <Button
            type="button"
            variant="ghost"
            className="min-h-12"
            onClick={() => {
              const theme = THEMES.find((item) => item.id === draft.themeId) ?? THEMES[0];
              patch({
                name: "",
                initials: "",
                notes: "",
                audience: draft.audience,
                ...applyTheme(theme.id),
              });
            }}
          >
            New shop
          </Button>
          <Button type="submit" className="min-h-12 min-w-36 shrink-0">
            Use this shop
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}

const fieldClass =
  "h-11 w-full rounded-full bg-card px-4 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-ring/70";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function Swatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-card py-1.5 pr-3 pl-1.5 shadow-[var(--shadow-border)]">
      <input
        type="color"
        aria-label={label}
        value={/^#([0-9a-f]{6})$/i.test(value) ? value : "#000000"}
        onChange={(event) => onChange(event.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
      />
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-[0.12em] text-ink-subtle uppercase">
          {label}
        </p>
        <input
          value={value}
          maxLength={7}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        />
      </div>
    </div>
  );
}
