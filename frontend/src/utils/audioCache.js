// =========================================================
// BHAGAVAD GITA - INDEXEDDB AUDIO CACHE ENGINE
// Stores high-quality Neural TTS audio for 100% offline playback
// =========================================================

const DB_NAME = "GitaAudioCacheDB";
const DB_VERSION = 1;
const STORE_NAME = "audio_blobs";

let dbInstance = null;

/**
 * Open or create the IndexedDB database
 */
function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by_chapter", "chapterNumber", { unique: false });
        store.createIndex("by_chapter_shloka", ["chapterNumber", "shlokNumber"], { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.warn("Failed to open Gita Audio IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Generate unique cache key
 */
export function buildAudioKey(chapterNumber, shlokNumber, type, lang) {
  return `ch_${Number(chapterNumber)}_sh_${Number(shlokNumber)}_${type}_${lang || "gu"}`;
}

/**
 * Save an audio Blob into IndexedDB
 */
export async function saveAudioToCache(chapterNumber, shlokNumber, type, lang, blob) {
  if (!chapterNumber || !shlokNumber || !type || !blob) return false;
  try {
    const db = await openDB();
    const id = buildAudioKey(chapterNumber, shlokNumber, type, lang);

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id,
        chapterNumber: Number(chapterNumber),
        shlokNumber: Number(shlokNumber),
        type,
        lang: lang || "gu",
        blob,
        savedAt: Date.now(),
      };

      const putRequest = store.put(record);
      putRequest.onsuccess = () => resolve(true);
      putRequest.onerror = (err) => {
        console.warn(`Could not save audio ${id} to cache:`, err);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn("saveAudioToCache error:", err);
    return false;
  }
}

/**
 * Retrieve an audio Blob from IndexedDB
 */
export async function getAudioFromCache(chapterNumber, shlokNumber, type, lang) {
  if (!chapterNumber || !shlokNumber || !type) return null;
  try {
    const db = await openDB();
    const id = buildAudioKey(chapterNumber, shlokNumber, type, lang);

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        if (result && result.blob) {
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    return null;
  }
}

/**
 * Check if an audio is available in cache
 */
export async function isAudioInCache(chapterNumber, shlokNumber, type, lang) {
  const blob = await getAudioFromCache(chapterNumber, shlokNumber, type, lang);
  return Boolean(blob);
}

/**
 * Clear all cached audio (called on logout)
 */
export async function clearAudioCache() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve(true);
      clearRequest.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

/**
 * Get count of cached audio clips
 */
export async function getCachedAudioCount() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result || 0);
      countReq.onerror = () => resolve(0);
    });
  } catch (e) {
    return 0;
  }
}
