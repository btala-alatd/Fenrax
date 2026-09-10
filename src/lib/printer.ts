import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idb";

export type PrinterState = {
  googleKey: string;
  xaiKey: string;
  recraftKey: string;
  setGoogleKey: (key: string) => void;
  setXaiKey: (key: string) => void;
  setRecraftKey: (key: string) => void;
};

export const usePrinter = create<PrinterState>()(
  persist(
    (set) => ({
      googleKey: "",
      xaiKey: "",
      recraftKey: "",
      setGoogleKey: (key) => set({ googleKey: key.trim() }),
      setXaiKey: (key) => set({ xaiKey: key.trim() }),
      setRecraftKey: (key) => set({ recraftKey: key.trim() }),
    }),
    {
      name: "fenrax-printer",
      storage: createJSONStorage(() => idbStorage),
      skipHydration: true,
      partialize: (state) => ({
        googleKey: state.googleKey,
        xaiKey: state.xaiKey,
        recraftKey: state.recraftKey,
      }),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === "object"
            ? (persisted as Partial<PrinterState>)
            : {};
        return {
          ...current,
          googleKey: typeof raw.googleKey === "string" ? raw.googleKey : current.googleKey,
          xaiKey: typeof raw.xaiKey === "string" ? raw.xaiKey : current.xaiKey,
          recraftKey: typeof raw.recraftKey === "string" ? raw.recraftKey : current.recraftKey,
        };
      },
    },
  ),
);

export function maskKey(key: string) {
  const trimmed = key.trim();
  if (trimmed.length < 12) return trimmed ? "Saved" : "";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

export const maskGoogleKey = maskKey;
