import { useEffect, useState } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InstallApp } from "@/components/install-app";
import { SaveToButton } from "@/components/save-to-sheet";
import { testPrinter } from "@/lib/imagine";
import { maskGoogleKey, usePrinter } from "@/lib/printer";

export function SettingsSheet({
  onClose,
  onStartOver,
}: {
  onClose: () => void;
  onStartOver?: () => void;
}) {
  const stored = usePrinter((state) => state.googleKey);
  const setGoogleKey = usePrinter((state) => state.setGoogleKey);
  const [draft, setDraft] = useState(stored);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save() {
    setGoogleKey(draft);
    toast.success(draft.trim() ? "Printer key saved on this device." : "Printer key cleared.");
    onClose();
  }

  async function test() {
    const key = draft.trim();
    if (key.length < 20) {
      toast.error("Paste a Google Gemini key first.");
      return;
    }
    setTesting(true);
    try {
      const result = await testPrinter({ data: { googleKey: key } });
      if (result.ok) {
        setGoogleKey(key);
        toast.success("Google printer is live.");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reach Google.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-background pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl font-extrabold tracking-[-0.04em]">Settings</p>
            <p className="text-sm text-muted-foreground">Private studio. Keys stay on this phone.</p>
          </div>
          <Button variant="ghost" size="icon" className="size-11" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <section className="space-y-2">
            <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
              Google image key
            </span>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              placeholder="AIza… from Google AI Studio"
              onChange={(event) => setDraft(event.target.value)}
              className="h-12 w-full rounded-full bg-card px-4 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {draft.trim()
                ? `Saved as ${maskGoogleKey(draft)}. Google draws the shirts.`
                : "The live printer needs a Google Gemini key. Get one at aistudio.google.com → Get API key, paste it here, tap Test printer. You can also set GEMINI_API_KEY on Render. Never share it in chat."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void test()} disabled={testing}>
                {testing ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Test printer
              </Button>
              {draft.trim() ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDraft("");
                    setGoogleKey("");
                    toast.success("Key cleared.");
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </section>

          <section className="space-y-2">
            <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
              Save files
            </span>
            <SaveToButton />
          </section>

          <section className="space-y-2">
            <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
              Phone
            </span>
            <InstallApp />
          </section>

          <section className="space-y-2">
            <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
              This phone
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Wipe every print stored here. Shop name stays.
            </p>
            <Button type="button" variant="danger" className="h-12 w-full" onClick={onStartOver}>
              <Trash2 className="size-4" />
              Start over
            </Button>
          </section>

          <Button type="button" className="h-12 w-full" onClick={save}>
            Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}
