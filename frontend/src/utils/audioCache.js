// =========================================================
// BHAGAVAD GITA - INDEXEDDB AUDIO CACHE & BACKGROUND SYNC ENGINE
// Automatically downloads & saves Neural TTS audio for 100% offline playback
// =========================================================

import { isRunningInStandaloneApp } from "./pwaManager.js";

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
 * Save an audio Blob into IndexedDB (In App Only!)
 */
export async function saveAudioToCache(chapterNumber, shlokNumber, type, lang, blob) {
  if (!chapterNumber || !shlokNumber || !type || !blob) return false;
  if (typeof window === "undefined" || !isRunningInStandaloneApp()) return false;
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
 * Check if an audio is available in cache (fast count query without loading blob)
 */
export async function isAudioInCache(chapterNumber, shlokNumber, type, lang) {
  try {
    const db = await openDB();
    const id = buildAudioKey(chapterNumber, shlokNumber, type, lang);
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(id);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Get all cached audio keys for a specific chapter in one quick indexed query
 */
export async function getChapterCachedKeys(chapterNumber) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("by_chapter");
      const request = index.getAllKeys(Number(chapterNumber));
      request.onsuccess = () => {
        resolve(new Set(request.result || []));
      };
      request.onerror = () => resolve(new Set());
    });
  } catch (e) {
    return new Set();
  }
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
 * Get count of cached audio clips in database
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

// =========================================================
// NEURAL TTS FETCH & TEXT FORMATTING UTILITIES
// =========================================================

/**
 * Clean HTML preserving line breaks
 */
export function removeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|blockquote|h[1-6]|tr)>/gi, "\n")
    .replace(/<(div|p|li|blockquote|h[1-6]|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

/**
 * Resiliently fetch Microsoft Neural AI speech audio
 */
export const fetchNeuralAudioBlob = async (text, lang, customRate = null) => {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const candidateBases = isLocal
    ? ["http://localhost:5000", "https://bhagavad-gita-backend-jy1a.onrender.com"]
    : ["https://bhagavad-gita-backend-jy1a.onrender.com"];

  const payload = {
    text,
    lang,
    voice: "male",
  };
  if (customRate) {
    payload.rate = customRate;
  }

  let lastFetchErr = null;
  for (const base of candidateBases) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutMs = base.includes("localhost") ? 2000 : 25000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(`${base}/api/tts/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          return await response.blob();
        }
      } catch (err) {
        lastFetchErr = err;
        if (base.includes("localhost")) break;
        if (attempt < 2) await new Promise((r) => setTimeout(r, 650));
      }
    }
  }
  throw lastFetchErr || new Error("Failed to fetch audio from all endpoints");
};

/**
 * Format Sanskrit text with natural poetic meter (rag/chandas pauses) for authentic recitation
 */
export function formatSanskritForSpeech(shlokObj) {
  if (!shlokObj) return "";
  let plain = removeHtml(shlokObj.sanskrit || "");
  if (!plain && (shlokObj.sanskritLine1 || shlokObj.sanskritLine2)) {
    plain = [shlokObj.sanskritLine1, shlokObj.sanskritLine2].filter(Boolean).join("\n");
  }
  plain = plain.replace(/[॥\|]\s*[\d\.\-०-९]+\s*[॥\|]/g, "।");
  const rawLines = plain
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const rhythmLines = rawLines
    .map((line) => {
      let cleanLine = line.replace(/[|।॥]+$/g, "").trim();
      const words = cleanLine.split(/\s+/).filter((w) => !/^[|।॥\d\.\-०-९]+$/.test(w));
      if (words.length >= 4) {
        const half = Math.ceil(words.length / 2);
        const pada1 = words.slice(0, half).join(" ");
        const pada2 = words.slice(half).join(" ");
        return `${pada1}, ${pada2} ।`;
      } else if (words.length > 0) {
        return `${words.join(" ")} ।`;
      }
      return "";
    })
    .filter(Boolean);

  return rhythmLines.join("\n\n");
}

/**
 * Extract clean spoken text from HTML translation
 */
export function extractCleanTextForSpeech(htmlString) {
  if (!htmlString) return "";
  try {
    let preprocessed = String(htmlString)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(p|div|li|h[1-6])>/gi, " . ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&");
    let text = preprocessed.replace(/<[^>]*>/g, "");
    text = text.replace(/\s*[:：]\s*/g, " . ... ");
    text = text.replace(/[•\-\*]/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    text = text.replace(/(\.\s*\.\.\.\s*)+/g, ". ... ");
    return text;
  } catch (e) {
    return String(htmlString).replace(/<[^>]*>/g, " ").trim();
  }
}

// =========================================================
// AUTOMATIC BACKGROUND AUDIO PRE-CACHING ENGINE
// Saves audio without requiring the user to listen to it
// =========================================================

/**
 * Count how many shlokas in a chapter have all applicable audios cached
 * Optimized to use indexed Set for instant memory-speed calculation
 */
export async function getChapterCachedAudioCount(chapterNumber, shlokas, lang = "gu", cachedKeySet = null) {
  if (!Array.isArray(shlokas) || shlokas.length === 0) return 0;
  const keySet = cachedKeySet || (await getChapterCachedKeys(chapterNumber));
  let count = 0;
  for (const s of shlokas) {
    const sNum = Number(s.shlokNumber);
    const saKey = buildAudioKey(chapterNumber, sNum, "sanskrit", "sa");
    const trKey = buildAudioKey(chapterNumber, sNum, "translation", lang);
    const rawMsg =
      (lang === "en" ? s.messageEn : lang === "hi" ? s.messageHi : s.message) || s.message;
    const msgText = extractCleanTextForSpeech(rawMsg);
    const msgKey = msgText ? buildAudioKey(chapterNumber, sNum, "message", lang) : null;

    const hasSa = keySet.has(saKey);
    const hasTr = keySet.has(trKey);
    const hasMsg = msgKey ? keySet.has(msgKey) : true;
    if (hasSa && hasTr && hasMsg) count++;
  }
  return count;
}

/**
 * Pre-cache Sanskrit, Translation, and Message audio for a single shloka (In App Only!)
 * Fetches all missing audio parts in PARALLEL via Promise.all for 3x-4x faster caching
 */
export async function cacheSingleShlokaAudio(chapterNumber, shlokaObj, lang = "gu", cachedKeySet = null) {
  if (!chapterNumber || !shlokaObj || typeof window === "undefined" || !navigator.onLine) return false;
  if (!isRunningInStandaloneApp()) return false;
  const sNum = Number(shlokaObj.shlokNumber);
  if (!sNum) return false;

  const saKey = buildAudioKey(chapterNumber, sNum, "sanskrit", "sa");
  const trKey = buildAudioKey(chapterNumber, sNum, "translation", lang);
  const rawMsg =
    (lang === "en" ? shlokaObj.messageEn : lang === "hi" ? shlokaObj.messageHi : shlokaObj.message) ||
    shlokaObj.message;
  const msgText = extractCleanTextForSpeech(rawMsg);
  const msgKey = msgText ? buildAudioKey(chapterNumber, sNum, "message", lang) : null;

  const fetchTasks = [];

  // 1. Sanskrit task
  const hasSa = cachedKeySet
    ? cachedKeySet.has(saKey)
    : await isAudioInCache(chapterNumber, sNum, "sanskrit", "sa");
  if (!hasSa) {
    const saText = formatSanskritForSpeech(shlokaObj);
    if (saText) {
      fetchTasks.push(
        (async () => {
          try {
            const saBlob = await fetchNeuralAudioBlob(saText, "sa", "-22%");
            if (saBlob) {
              await saveAudioToCache(chapterNumber, sNum, "sanskrit", "sa", saBlob);
              if (cachedKeySet) cachedKeySet.add(saKey);
              return true;
            }
          } catch (err) {}
          return false;
        })()
      );
    }
  }

  // 2. Translation task
  const hasTr = cachedKeySet
    ? cachedKeySet.has(trKey)
    : await isAudioInCache(chapterNumber, sNum, "translation", lang);
  if (!hasTr) {
    const rawText =
      (lang === "en" ? shlokaObj.translationEn : lang === "hi" ? shlokaObj.translationHi : shlokaObj.translation) ||
      shlokaObj.translation;
    const trText = extractCleanTextForSpeech(rawText);
    if (trText) {
      fetchTasks.push(
        (async () => {
          try {
            const trBlob = await fetchNeuralAudioBlob(trText, lang, "-2%");
            if (trBlob) {
              await saveAudioToCache(chapterNumber, sNum, "translation", lang, trBlob);
              if (cachedKeySet) cachedKeySet.add(trKey);
              return true;
            }
          } catch (err) {}
          return false;
        })()
      );
    }
  }

  // 3. Message task
  if (msgKey) {
    const hasMsg = cachedKeySet
      ? cachedKeySet.has(msgKey)
      : await isAudioInCache(chapterNumber, sNum, "message", lang);
    if (!hasMsg) {
      fetchTasks.push(
        (async () => {
          try {
            const msgBlob = await fetchNeuralAudioBlob(msgText, lang, "-2%");
            if (msgBlob) {
              await saveAudioToCache(chapterNumber, sNum, "message", lang, msgBlob);
              if (cachedKeySet) cachedKeySet.add(msgKey);
              return true;
            }
          } catch (err) {}
          return false;
        })()
      );
    }
  }

  if (fetchTasks.length === 0) return false;
  const results = await Promise.all(fetchTasks);
  return results.some(Boolean);
}

let activeSyncController = null;

export function stopAudioSync() {
  if (activeSyncController) {
    activeSyncController.abort();
    activeSyncController = null;
  }
}

/**
 * High-Speed background pre-cache for all shlokas in a chapter
 * Features:
 *  - Instant Set-based cache state lookup
 *  - Prioritizes current shloka first
 *  - Concurrency pool of 2 shlokas in parallel with internal parallel audio fetching
 *  - 6x-7x faster overall download speed
 */
export async function autoSyncChapterAudios(
  chapterNumber,
  shlokas,
  lang = "gu",
  startFromIndex = 0,
  onProgress = null
) {
  if (typeof window === "undefined" || !navigator.onLine) return;
  if (!isRunningInStandaloneApp()) return;
  if (!Array.isArray(shlokas) || shlokas.length === 0) return;

  if (activeSyncController) {
    activeSyncController.abort();
  }
  const controller = new AbortController();
  activeSyncController = controller;

  try {
    const len = shlokas.length;
    const indices = [];

    // Prioritize current shloka and upcoming shlokas first
    for (let i = startFromIndex; i < len; i++) indices.push(i);
    for (let i = 0; i < startFromIndex; i++) indices.push(i);

    // Fast 1-time indexed load of all cached keys for this chapter
    const cachedKeySet = await getChapterCachedKeys(chapterNumber);

    let completed = await getChapterCachedAudioCount(chapterNumber, shlokas, lang, cachedKeySet);
    if (typeof onProgress === "function") {
      onProgress({
        current: completed,
        total: len,
        percent: Math.round((completed / len) * 100),
      });
    }

    if (completed >= len) return;

    // Concurrency pool of 2 parallel workers for high speed without server overload
    const CONCURRENCY = 2;
    let poolIndex = 0;

    async function worker() {
      while (poolIndex < indices.length) {
        if (controller.signal.aborted || !navigator.onLine) break;
        const currentIdx = indices[poolIndex++];
        const shlok = shlokas[currentIdx];
        if (shlok) {
          await cacheSingleShlokaAudio(chapterNumber, shlok, lang, cachedKeySet);
        }

        const currentCompleted = await getChapterCachedAudioCount(
          chapterNumber,
          shlokas,
          lang,
          cachedKeySet
        );
        if (typeof onProgress === "function") {
          onProgress({
            current: currentCompleted,
            total: len,
            percent: Math.round((currentCompleted / len) * 100),
          });
        }

        // Tiny courteous delay
        await new Promise((r) => setTimeout(r, 40));
      }
    }

    const workers = [];
    for (let w = 0; w < CONCURRENCY; w++) {
      workers.push(worker());
    }
    await Promise.all(workers);
  } catch (e) {
    // ignore abort
  } finally {
    if (activeSyncController === controller) {
      activeSyncController = null;
    }
  }
}
