import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbDel, idbGet, idbSet } from "@/lib/idb";
import { downloadBlob } from "@/lib/image-file";

const HANDLE_KEY = "fenrax-save-folder";

export type SaveMode = "download" | "folder";

type SaveState = {
  mode: SaveMode;
  folderName: string;
  setMode: (mode: SaveMode) => void;
  setFolderName: (name: string) => void;
};

export const useSaveTo = create<SaveState>()(
  persist(
    (set) => ({
      mode: "download",
      folderName: "",
      setMode: (mode) => set({ mode }),
      setFolderName: (folderName) => set({ folderName }),
    }),
    { name: "fenrax-save-to" },
  ),
);

function canPickFolder() {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function saveToLabel() {
  const { mode, folderName } = useSaveTo.getState();
  if (mode === "folder" && folderName) return folderName;
  return "Downloads";
}

export function canChooseFolder() {
  return canPickFolder();
}

async function queryPermission(handle: FileSystemDirectoryHandle) {
  const withPerm = handle as FileSystemDirectoryHandle & {
    queryPermission?: (opts: { mode: "readwrite" }) => Promise<PermissionState>;
    requestPermission?: (opts: { mode: "readwrite" }) => Promise<PermissionState>;
  };
  if (withPerm.queryPermission) {
    const state = await withPerm.queryPermission({ mode: "readwrite" });
    if (state === "granted") return true;
    if (withPerm.requestPermission) {
      return (await withPerm.requestPermission({ mode: "readwrite" })) === "granted";
    }
  }
  return true;
}

export async function pickSaveFolder() {
  if (!canPickFolder()) {
    throw new Error("This phone saves to Downloads. Pick a folder on a computer.");
  }
  const picker = window as unknown as {
    showDirectoryPicker: (opts?: { mode?: "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  };
  const handle = await picker.showDirectoryPicker({ mode: "readwrite" });
  await idbSet(HANDLE_KEY, handle);
  useSaveTo.getState().setFolderName(handle.name);
  useSaveTo.getState().setMode("folder");
  return handle;
}

export async function useDownloads() {
  await idbDel(HANDLE_KEY);
  useSaveTo.getState().setMode("download");
  useSaveTo.getState().setFolderName("");
}

async function folderHandle() {
  const handle = await idbGet<FileSystemDirectoryHandle>(HANDLE_KEY);
  if (!handle) return null;
  const ok = await queryPermission(handle).catch(() => false);
  if (!ok) return null;
  return handle;
}

async function writeInFolder(
  root: FileSystemDirectoryHandle,
  filename: string,
  blob: Blob,
) {
  const file = await root.getFileHandle(filename, { create: true });
  const writable = await file.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function saveBlob(blob: Blob, filename: string) {
  const { mode } = useSaveTo.getState();
  if (mode === "folder") {
    const handle = await folderHandle();
    if (handle) {
      await writeInFolder(handle, filename, blob);
      return { where: handle.name };
    }
  }
  downloadBlob(blob, filename);
  return { where: "Downloads" };
}
