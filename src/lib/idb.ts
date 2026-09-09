const DB_NAME = "fenrax";
const STORE = "kv";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Storage timed out."));
    }, 1500);
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(request.error);
      };
    } catch (error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    }
  });
}

function idbOp<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = run(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export const idbStorage = {
  async getItem(name: string) {
    if (typeof indexedDB === "undefined") return null;
    try {
      const value = await idbOp("readonly", (store) => store.get(name));
      return typeof value === "string" ? value : null;
    } catch {
      return null;
    }
  },
  async setItem(name: string, value: string) {
    if (typeof indexedDB === "undefined") return;
    try {
      await idbOp("readwrite", (store) => store.put(value, name));
    } catch {
      /* private mode / blocked storage */
    }
  },
  async removeItem(name: string) {
    if (typeof indexedDB === "undefined") return;
    try {
      await idbOp("readwrite", (store) => store.delete(name));
    } catch {
      /* ignore */
    }
  },
};

export async function idbGet<T>(name: string): Promise<T | null> {
  if (typeof indexedDB === "undefined") return null;
  const value = await idbOp("readonly", (store) => store.get(name));
  return (value as T) ?? null;
}

export async function idbSet(name: string, value: unknown) {
  if (typeof indexedDB === "undefined") return;
  await idbOp("readwrite", (store) => store.put(value, name));
}

export async function idbDel(name: string) {
  if (typeof indexedDB === "undefined") return;
  await idbOp("readwrite", (store) => store.delete(name));
}
