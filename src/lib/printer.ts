import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idb";

export type PrinterState = {
  googleKey: string;
  setGoogleKey: (key: string) => void;
};

export const usePrinter = create<PrinterState>()(
  persist(
    (set) => ({
      googleKey: "",
      setGoogleKey: (key) => set({ googleKey: key.trim() }),
    }),
    {
      name: "fenrax-printer",
      storage: createJSONStorage(() => idbStorage),
      skipHydration: true,
      partialize: (state) => ({ googleKey: state.googleKey }),
    },
  ),
);

export function maskGoogleKey(key: string) {
  const trimmed = key.trim();
  if (trimmed.length < 12) return trimmed ? "Saved" : "";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}
