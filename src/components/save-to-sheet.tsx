import { useEffect, useState } from "react";
import { FolderOpen, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  canChooseFolder,
  pickSaveFolder,
  useDownloads,
  useSaveTo,
} from "@/lib/save-to";
import { cn } from "@/lib/utils";

export function SaveToButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const mode = useSaveTo((state) => state.mode);
  const folderName = useSaveTo((state) => state.folderName);
  const label = mode === "folder" && folderName ? folderName : "Downloads";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "text-left text-xs text-muted-foreground",
          className,
        )}
      >
        Save to <span className="font-semibold text-foreground">{label}</span>
      </button>
      {open ? <SaveToSheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function SaveToSheet({ onClose }: { onClose: () => void }) {
  const mode = useSaveTo((state) => state.mode);
  const folderName = useSaveTo((state) => state.folderName);
  const folderOk = canChooseFolder();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function chooseFolder() {
    try {
      await pickSaveFolder();
      toast.success("Folder set. Zips land there.");
      onClose();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "Could not open that folder.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/92 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Where to save"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div>
          <p className="font-display text-xl font-extrabold tracking-[-0.04em]">
            Where to save
          </p>
          <p className="text-sm text-muted-foreground">
            Zips and Printify files go here.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </Button>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-4 pb-8">
        <button
          type="button"
          onClick={() => {
            void useDownloads();
            toast.success("Saving to Downloads.");
            onClose();
          }}
          className={cn(
            "flex items-start gap-3 rounded-[var(--radius-lg)] p-4 text-left shadow-[var(--shadow-border)]",
            mode === "download" && "bg-primary text-primary-foreground",
          )}
        >
          <Smartphone className="mt-0.5 size-5 shrink-0" />
          <span>
            <span className="block text-sm font-semibold">This phone</span>
            <span className={cn("block text-xs", mode === "download" ? "opacity-80" : "text-muted-foreground")}>
              Browser Downloads folder. Works everywhere.
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => void chooseFolder()}
          className={cn(
            "flex items-start gap-3 rounded-[var(--radius-lg)] p-4 text-left shadow-[var(--shadow-border)]",
            mode === "folder" && "bg-primary text-primary-foreground",
          )}
        >
          <FolderOpen className="mt-0.5 size-5 shrink-0" />
          <span>
            <span className="block text-sm font-semibold">A folder I pick</span>
            <span className={cn("block text-xs", mode === "folder" ? "opacity-80" : "text-muted-foreground")}>
              {folderOk
                ? folderName
                  ? `Now: ${folderName}`
                  : "Desktop, Printify folder, Google Drive…"
                : "On a computer you can pick any folder. This phone uses Downloads."}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
