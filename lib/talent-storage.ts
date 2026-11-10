/**
 * Client-side high-capacity persistence layer for Santa talents, media, and roster edits.
 * Uses IndexedDB for multi-megabyte photo & video persistence (preventing localStorage QuotaExceededError)
 * with a synchronized fallback in LocalStorage for instant bootstrap and cross-tab communication.
 */

const DB_NAME = "brillo_santa_hub_v1";
const STORE_NAME = "talents";
const DB_VERSION = 1;

const LOCAL_STORAGE_EDITS_KEY = "brillo_talent_edits_v3";
const LOCAL_STORAGE_CUSTOM_KEY = "brillo_custom_talents_v3";
const BROADCAST_EVENT_KEY = "brillo_talents_updated";

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Sanitize talent images to eliminate corrupted pseudo-URLs like "...[stored_in_idb]" or dead blob: URLs
 */
export function sanitizeTalentMedia(talent: any): any {
  if (!talent) return talent;
  const sanitized = { ...talent };
  if (Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images
      .filter((img: any) => {
        if (!img) return false;
        const url = String(img.publicUrl || img.originalPath || "").trim();
        if (!url) return false;
        if (url.includes("[stored_in_idb]")) return false;
        return true;
      })
      .map((img: any) => {
        const cleanUrl = String(img.publicUrl || img.originalPath || "").trim();
        return {
          ...img,
          publicUrl: cleanUrl,
          originalPath: cleanUrl,
        };
      });
  }
  return sanitized;
}

/**
 * Clean up legacy corrupted storage keys from localStorage on startup
 */
export function cleanCorruptedStorage(): void {
  if (typeof localStorage === "undefined") return;
  const keys = [LOCAL_STORAGE_EDITS_KEY, "brillo_talent_edits_v2", "brillo_talent_edits"];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw && raw.includes("[stored_in_idb]")) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          const cleaned: Record<string, any> = {};
          for (const [id, t] of Object.entries(parsed)) {
            cleaned[id] = sanitizeTalentMedia(t);
          }
          localStorage.setItem(k, JSON.stringify(cleaned));
        }
      }
    } catch {}
  }
}

/**
 * Get all talent overrides stored in IndexedDB, sanitized of any corrupted data.
 */
export async function getIndexedDBTalents(): Promise<any[]> {
  cleanCorruptedStorage();
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const list = req.result || [];
        resolve(list.map((t: any) => sanitizeTalentMedia(t)));
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Save a single talent record into IndexedDB and update LocalStorage metadata safely.
 * IndexedDB holds the full multi-megabyte base64 photos & videos for all Santas without a 5MB cap.
 */
export async function saveTalentToStorage(talentInput: any): Promise<void> {
  if (!talentInput || !talentInput.id) return;
  const talent = sanitizeTalentMedia(talentInput);

  // 1. Save full record (with all base64 photos & videos) into IndexedDB
  const db = await openDB();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(talent);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // 2. Also save non-bloated metadata to LocalStorage (keyed only by talent.id to avoid 2x duplication)
  if (typeof localStorage !== "undefined") {
    try {
      const currentRaw = localStorage.getItem(LOCAL_STORAGE_EDITS_KEY);
      const editsMap: Record<string, any> = currentRaw ? JSON.parse(currentRaw) : {};

      // Remove duplicate canonicalId keys to save 50% space
      if (talent.canonicalId && editsMap[talent.canonicalId] && talent.canonicalId !== talent.id) {
        delete editsMap[talent.canonicalId];
      }

      editsMap[talent.id] = talent;
      localStorage.setItem(LOCAL_STORAGE_EDITS_KEY, JSON.stringify(editsMap));
    } catch {
      // If localStorage hits 5MB quota because of many base64 photos, store profile metadata in localStorage
      // and mark `_imagesInIdbOnly: true` so readers know to use IndexedDB for the images array!
      try {
        const currentRaw = localStorage.getItem(LOCAL_STORAGE_EDITS_KEY);
        const editsMap: Record<string, any> = currentRaw ? JSON.parse(currentRaw) : {};
        if (talent.canonicalId && editsMap[talent.canonicalId] && talent.canonicalId !== talent.id) {
          delete editsMap[talent.canonicalId];
        }
        const { images: _omittedImages, ...metadataOnly } = talent;
        editsMap[talent.id] = {
          ...metadataOnly,
          _imagesInIdbOnly: true,
        };
        localStorage.setItem(LOCAL_STORAGE_EDITS_KEY, JSON.stringify(editsMap));
      } catch {}
    }
  }

  // 3. Broadcast updates across window tabs and components
  broadcastTalentUpdate(talent.id);
}

/**
 * Broadcast event across current window and cross-tab storage
 */
export function broadcastTalentUpdate(talentId?: string) {
  if (typeof window === "undefined") return;

  // Dispatch custom in-page event
  window.dispatchEvent(
    new CustomEvent(BROADCAST_EVENT_KEY, {
      detail: { talentId, timestamp: Date.now() },
    })
  );

  // Trigger cross-tab storage event
  try {
    localStorage.setItem("brillo_talent_ping", String(Date.now()));
  } catch {}
}

/**
 * Subscribe to talent updates across current window and other tabs.
 */
export function subscribeToTalentUpdates(callback: (talentId?: string) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: any) => {
    callback(e?.detail?.talentId);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (
      e.key === "brillo_talent_ping" ||
      e.key === LOCAL_STORAGE_EDITS_KEY ||
      e.key === LOCAL_STORAGE_CUSTOM_KEY
    ) {
      callback();
    }
  };

  window.addEventListener(BROADCAST_EVENT_KEY, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(BROADCAST_EVENT_KEY, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
