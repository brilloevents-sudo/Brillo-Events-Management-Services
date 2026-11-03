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
 * Get all talent overrides stored in IndexedDB.
 */
export async function getIndexedDBTalents(): Promise<any[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Save a single talent record into IndexedDB and update LocalStorage safely.
 */
export async function saveTalentToStorage(talent: any): Promise<void> {
  if (!talent || !talent.id) return;

  // 1. Save full record (including large Base64 photos & videos) to IndexedDB
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

  // 2. Also save to LocalStorage with safe truncation if payload is too big
  if (typeof localStorage !== "undefined") {
    try {
      const currentRaw = localStorage.getItem(LOCAL_STORAGE_EDITS_KEY);
      const editsMap: Record<string, any> = currentRaw ? JSON.parse(currentRaw) : {};
      
      // Index by both ID and Canonical ID for foolproof matching
      editsMap[talent.id] = talent;
      if (talent.canonicalId) {
        editsMap[talent.canonicalId] = talent;
      }

      localStorage.setItem(LOCAL_STORAGE_EDITS_KEY, JSON.stringify(editsMap));
    } catch (err) {
      // If full payload exceeds 5MB localStorage quota, save a lightweight version in localStorage
      try {
        const currentRaw = localStorage.getItem(LOCAL_STORAGE_EDITS_KEY);
        const editsMap: Record<string, any> = currentRaw ? JSON.parse(currentRaw) : {};
        
        // Strip heavy base64 from images in localStorage while IndexedDB retains full quality
        const lightweightTalent = {
          ...talent,
          images: Array.isArray(talent.images)
            ? talent.images.map((img: any) => ({
                ...img,
                publicUrl:
                  img.publicUrl && img.publicUrl.length > 50000
                    ? img.publicUrl.slice(0, 100) + "...[stored_in_idb]"
                    : img.publicUrl,
              }))
            : [],
        };

        editsMap[talent.id] = lightweightTalent;
        if (talent.canonicalId) {
          editsMap[talent.canonicalId] = lightweightTalent;
        }

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
