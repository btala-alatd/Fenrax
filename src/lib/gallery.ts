import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idb";
import type { Still } from "@/lib/studio-data";

type GalleryState = {
  items: Still[];
  add: (still: Still) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useGallery = create<GalleryState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (still) => {
        set({
          items: [still, ...get().items.filter((item) => item.id !== still.id)],
        });
      },
      remove: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "fenrax-prints",
      skipHydration: true,
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
