// =========================================================
// BHAGAVAD GITA - OFFLINE STORAGE & PRE-CACHE ENGINE
// Enables 100% offline reading and device-speech playback
// =========================================================

const API_BASE = "https://bhagavad-gita-backend-jy1a.onrender.com/api/shloks";

/**
 * Save a single chapter and its shlokas to offline storage
 */
export function saveChapterOffline(chapterNumber, shlokas, chapterName = "") {
  if (!chapterNumber || !Array.isArray(shlokas) || shlokas.length === 0) return false;
  try {
    const key = `gita_offline_ch_${chapterNumber}`;
    const payload = {
      chapterNumber: Number(chapterNumber),
      chapterName: chapterName || `અધ્યાય ${chapterNumber}`,
      shlokas,
      count: shlokas.length,
      savedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(payload));

    // Update index catalog
    updateOfflineCatalog(Number(chapterNumber), shlokas.length);
    return true;
  } catch (err) {
    console.warn(`Could not save Chapter ${chapterNumber} offline:`, err);
    return false;
  }
}

/**
 * Get a cached chapter from offline storage
 */
export function getChapterOffline(chapterNumber) {
  if (!chapterNumber) return null;
  try {
    const key = `gita_offline_ch_${chapterNumber}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.shlokas) && parsed.shlokas.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn(`Error reading offline Chapter ${chapterNumber}:`, err);
  }
  return null;
}

/**
 * Check if a chapter is available offline
 */
export function isChapterOfflineAvailable(chapterNumber) {
  const data = getChapterOffline(chapterNumber);
  return Boolean(data && data.shlokas && data.shlokas.length > 0);
}

/**
 * Update offline catalog registry
 */
function updateOfflineCatalog(chapterNumber, count) {
  try {
    const raw = localStorage.getItem("gita_offline_catalog");
    const catalog = raw ? JSON.parse(raw) : {};
    catalog[chapterNumber] = {
      chapterNumber,
      count,
      savedAt: Date.now(),
    };
    localStorage.setItem("gita_offline_catalog", JSON.stringify(catalog));
  } catch (e) {}
}

/**
 * Get offline status summary
 */
export function getOfflineStatusSummary() {
  try {
    const raw = localStorage.getItem("gita_offline_catalog");
    const catalog = raw ? JSON.parse(raw) : {};
    const cachedChapters = Object.keys(catalog).map(Number).sort((a, b) => a - b);
    let totalShlokas = 0;
    cachedChapters.forEach((ch) => {
      totalShlokas += catalog[ch]?.count || 0;
    });

    return {
      cachedChapters,
      cachedCount: cachedChapters.length,
      isFullyCached: cachedChapters.length >= 18,
      totalShlokas,
    };
  } catch (e) {
    return {
      cachedChapters: [],
      cachedCount: 0,
      isFullyCached: false,
      totalShlokas: 0,
    };
  }
}

/**
 * Download and cache all 18 chapters with progress callbacks
 */
export async function downloadAllChaptersOffline(onProgress = null) {
  if (typeof window === "undefined" || !navigator.onLine) {
    return {
      success: false,
      error: "No internet connection. Please connect to internet to download.",
    };
  }

  const results = [];
  let totalSavedShlokas = 0;

  for (let ch = 1; ch <= 18; ch++) {
    try {
      const res = await fetch(`${API_BASE}/chapter/${ch}`);
      if (res.ok) {
        const data = await res.json();
        const shlokas = data.shlokas || [];
        if (shlokas.length > 0) {
          shlokas.sort((a, b) => Number(a.shlokNumber) - Number(b.shlokNumber));
          const chapterName = shlokas[0]?.chapterName || `અધ્યાય ${ch}`;
          saveChapterOffline(ch, shlokas, chapterName);
          totalSavedShlokas += shlokas.length;
          results.push(ch);
        }
      }
    } catch (err) {
      console.warn(`Failed to pre-cache Chapter ${ch}:`, err);
    }

    if (typeof onProgress === "function") {
      onProgress({
        current: ch,
        total: 18,
        percent: Math.round((ch / 18) * 100),
      });
    }

    // Small delay to prevent network congestion
    await new Promise((r) => setTimeout(r, 60));
  }

  return {
    success: results.length > 0,
    downloadedChapters: results,
    totalShlokas: totalSavedShlokas,
  };
}

/**
 * Quietly pre-cache missing chapters in background when online and idle
 */
let isAutoSyncing = false;
export async function autoSyncOfflineChaptersQuietly() {
  if (isAutoSyncing) return;
  if (typeof window === "undefined" || !navigator.onLine) return;

  isAutoSyncing = true;
  try {
    for (let ch = 1; ch <= 18; ch++) {
      if (!isChapterOfflineAvailable(ch)) {
        try {
          const res = await fetch(`${API_BASE}/chapter/${ch}`);
          if (res.ok) {
            const data = await res.json();
            const shlokas = data.shlokas || [];
            if (shlokas.length > 0) {
              shlokas.sort((a, b) => Number(a.shlokNumber) - Number(b.shlokNumber));
              const chapterName = shlokas[0]?.chapterName || `અધ્યાય ${ch}`;
              saveChapterOffline(ch, shlokas, chapterName);
            }
          }
        } catch (e) {
          // ignore background errors
        }
        // Polite delay
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  } finally {
    isAutoSyncing = false;
  }
}
