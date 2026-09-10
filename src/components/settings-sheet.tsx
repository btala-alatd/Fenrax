import { useEffect, useState } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InstallApp } from "@/components/install-app";
import { SaveToButton } from "@/components/save-to-sheet";
import { testPrinter } from "@/lib/imagine";
import { maskKey, usePrinter } from "@/lib/printer";

export function SettingsSheet({
  onClose,
  onStartOver,
}: {
  onClose: () => void;
  onStartOver?: () => void;
}) {
  const stored = usePrinter((state) => state.googleKey);
  const storedXai = usePrinter((state) => state.xaiKey);
  const setGoogleKey = usePrinter((state) => state.setGoogleKey);
  const setXaiKey = usePrinter((state) => state.setXaiKey);
  const [draft, setDraft] = useState(stored);
  const [xaiDraft, setXaiDraft] = useState(storedXai);
  const [testing, setTesting] = useState<"google" | "xai" | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save() {
    setGoogleKey(draft);
    setXaiKey(xaiDraft);
    toast.success("Printer keys saved on this device.");
    onClose();
  }

  async function testGoogle() {
    const key = draft.trim();
    if (key.length < 20) {
      toast.error("Paste a Google Gemini key first.");
      return;
    }
    setTesting("google");
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
      setTesting(null);
    }
  }

  async function testXai() {
    const key = xaiDraft.trim();
    if (key.length < 20) {
      toast.error("Paste an xAI key first.");
      return;
    }
    setTesting("xai");
    try {
      const result = await testPrinter({ data: { xaiKey: key } });
      if (result.ok) {
        setXaiKey(key);
        toast.success("xAI printer is live. It takes over when Google is busy.");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reach xAI.");
    } finally {
      setTesting(null);
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
                ? `Saved as ${maskKey(draft)}. First printer.`
                : "First printer. Get a Gemini key at aistudio.google.com → Get API key. Never share it in chat."}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Each print costs. Raise the monthly spend cap in AI Studio → Spend if you hit $50. Wait ~25s between prints.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void testGoogle()} disabled={testing !== null}>
                {testing === "google" ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Test Google
              </Button>
              {draft.trim() ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDraft("");
                    setGoogleKey("");
                    toast.success("Google key cleared.");
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </section>

          <section className="space-y-2">
            <span className="block text-[11px] font-medium tracking-[0.14em] text-ink-subtle uppercase">
              Second printer — xAI
            </span>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={xaiDraft}
              placeholder="xai-… from console.x.ai"
              onChange={(event) => setXaiDraft(event.target.value)}
              className="h-12 w-full rounded-full bg-card px-4 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {xaiDraft.trim()
                ? `Saved as ${maskKey(xaiDraft)}. Takes over when Google is busy.`
                : "Get a key at console.x.ai → API keys. Paste it here. Used when Google throttles."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void testXai()} disabled={testing !== null}>
                {testing === "xai" ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Test xAI
              </Button>
              {xaiDraft.trim() ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setXaiDraft("");
                    setXaiKey("");
                    toast.success("xAI key cleared.");
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
