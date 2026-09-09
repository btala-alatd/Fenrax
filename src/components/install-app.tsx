import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone))
  );
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function InstallApp() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setDeferred(null);
        setOpen(false);
        toast.success("Fenrax is on your home screen.");
      }
      return;
    }
    setOpen(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      toast.success("Link copied. Open it in Chrome on your phone.");
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => void install()} title="Add to home screen">
        <Smartphone className="size-4" />
        Install
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background/92 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Install on phone"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="font-display text-xl font-extrabold tracking-[-0.04em]">
              Add to your phone
            </p>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-5" />
            </Button>
          </div>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-8 sm:px-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isAndroid()
                ? "In Chrome, tap the menu (⋮) → Add to Home screen / Install app. Fenrax opens full-screen like a native app."
                : "Open this studio in Chrome on your Android. Then tap the menu → Add to Home screen."}
            </p>
            <ol className="space-y-2 text-sm text-foreground">
              <li className="rounded-[var(--radius-md)] bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                1. Open the studio in <strong>Chrome</strong>
              </li>
              <li className="rounded-[var(--radius-md)] bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                2. Menu → <strong>Add to Home screen</strong>
              </li>
              <li className="rounded-[var(--radius-md)] bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                3. Tap the Fenrax icon on your home screen
              </li>
            </ol>
            <Button onClick={() => void copyLink()}>Copy link</Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
