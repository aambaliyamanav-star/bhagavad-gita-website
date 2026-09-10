// ==========================================================================
// GITA READING TRACKER UTILITY & GAMIFICATION ENGINE
// ==========================================================================

export const API_TRACKER_URL = "https://bhagavad-gita-website.onrender.com/api/reading-tracker";

// All 18 chapters with names and traditional shloka counts (Total: 700)
export const CHAPTER_METADATA = [
  { chapter: 1, name: "અર્જુનવિષાદ યોગ", englishName: "Arjuna Vishada Yoga", shlokas: 47 },
  { chapter: 2, name: "સાંખ્ય યોગ", englishName: "Sankhya Yoga", shlokas: 72 },
  { chapter: 3, name: "કર્મ યોગ", englishName: "Karma Yoga", shlokas: 43 },
  { chapter: 4, name: "જ્ઞાનકર્મસંન્યાસ યોગ", englishName: "Jnana Karma Sanyasa Yoga", shlokas: 42 },
  { chapter: 5, name: "કર્મસંન્યાસ યોગ", englishName: "Karma Sanyasa Yoga", shlokas: 29 },
  { chapter: 6, name: "આત્મસંયમ યોગ", englishName: "Dhyana Yoga", shlokas: 47 },
  { chapter: 7, name: "જ્ઞાનવિજ્ઞાન યોગ", englishName: "Jnana Vijnana Yoga", shlokas: 30 },
  { chapter: 8, name: "અક્ષરબ્રહ્મ યોગ", englishName: "Akshara Brahma Yoga", shlokas: 28 },
  { chapter: 9, name: "રાજવિદ્યા રાજગુહ્ય યોગ", englishName: "Raja Vidya Raja Guhya Yoga", shlokas: 34 },
  { chapter: 10, name: "વિભૂતિ યોગ", englishName: "Vibhuti Yoga", shlokas: 42 },
  { chapter: 11, name: "વિશ્વરૂપદર્શન યોગ", englishName: "Vishwarupa Darshana Yoga", shlokas: 55 },
  { chapter: 12, name: "ભક્તિ યોગ", englishName: "Bhakti Yoga", shlokas: 20 },
  { chapter: 13, name: "ક્ષેત્રક્ષેત્રજ્ઞ વિભાગ યોગ", englishName: "Kshetra Kshetrajna Yoga", shlokas: 35 },
  { chapter: 14, name: "ગુણત્રયવિભાગ યોગ", englishName: "Gunatraya Vibhaga Yoga", shlokas: 27 },
  { chapter: 15, name: "પુરુષોત્તમ યોગ", englishName: "Purushottama Yoga", shlokas: 20 },
  { chapter: 16, name: "દૈવાસુરસંપદ્વિભાગ યોગ", englishName: "Daivasura Sampad Yoga", shlokas: 24 },
  { chapter: 17, name: "શ્રદ્ધાત્રયવિભાગ યોગ", englishName: "Shraddhatraya Vibhaga Yoga", shlokas: 28 },
  { chapter: 18, name: "મોક્ષસંન્યાસ યોગ", englishName: "Moksha Sanyasa Yoga", shlokas: 78 },
];

export const TOTAL_GITA_SHLOKAS = 700;

// 10 Spiritual Badges
export const SPIRITUAL_BADGES = [
  {
    id: "first_step",
    title: "પ્રથમ પગલું",
    subtitle: "First Step",
    description: "ભગવદ્ ગીતાનો પ્રથમ શ્લોક વાંચીને દિવ્ય યાત્રા શરૂ કરી.",
    icon: "Sparkles",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    criteriaText: "કોઈપણ ૧ શ્લોક વાંચો",
    check: (progress) => (progress.readShlokas || []).length >= 1,
  },
  {
    id: "streak_3",
    title: "નિષ્ઠાવાન સાધક",
    subtitle: "3-Day Devotee",
    description: "સતત ૩ દિવસ સુધી ગીતા વાંચનનો નિયમ જાળવી રાખ્યો.",
    icon: "Flame",
    color: "#1d4ed8",
    gradient: "linear-gradient(135deg, #2563eb, #1e40af)",
    criteriaText: "સતત ૩ દિવસની સ્ટ્રીક",
    check: (progress) => (progress.currentStreak || 0) >= 3 || (progress.longestStreak || 0) >= 3,
  },
  {
    id: "streak_7",
    title: "અભ્યાસી યોગી",
    subtitle: "7-Day Yogi",
    description: "સતત ૧ સપ્તાહ (૭ દિવસ) નિયમિત ગીતા સ્વાધ્યાય પૂર્ણ કર્યો.",
    icon: "Zap",
    color: "#0284c7",
    gradient: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    criteriaText: "સતત ૭ દિવસની સ્ટ્રીક",
    check: (progress) => (progress.currentStreak || 0) >= 7 || (progress.longestStreak || 0) >= 7,
  },
  {
    id: "chapter_1",
    title: "અર્જુન વિષાદ મુક્ત",
    subtitle: "Arjuna's Awakening",
    description: "અધ્યાય ૧ ના તમામ ૪૭ શ્લોક વાંચીને જીવનના સંશયો દૂર કરવાનો આરંભ કર્યો.",
    icon: "Shield",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
    criteriaText: "અધ્યાય ૧ સંપૂર્ણ વાંચો (૪૭ શ્લોક)",
    check: (progress) => countChapterRead(progress.readShlokas, 1) >= 47,
  },
  {
    id: "chapter_3",
    title: "કર્મયોગી બેજ",
    subtitle: "True Karmayogi",
    description: "અધ્યાય ૩ પૂર્ણ કરી નિષ્કામ કર્મનો દિવ્ય ઉપદેશ આત્મસાત કર્યો.",
    icon: "Compass",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
    criteriaText: "અધ્યાય ૩ સંપૂર્ણ વાંચો (૪૩ શ્લોક)",
    check: (progress) => countChapterRead(progress.readShlokas, 3) >= 43,
  },
  {
    id: "chapter_4",
    title: "જ્ઞાનયોગી બેજ",
    subtitle: "Jnana Seeker",
    description: "અધ્યાય ૪ પૂર્ણ કરી જ્ઞાનરૂપી અગ્નિથી પાપો ભસ્મ કરવાનો માર્ગ સમજ્યા.",
    icon: "Brain",
    color: "#4f46e5",
    gradient: "linear-gradient(135deg, #6366f1, #3730a3)",
    criteriaText: "અધ્યાય ૪ સંપૂર્ણ વાંચો (૪૨ શ્લોક)",
    check: (progress) => countChapterRead(progress.readShlokas, 4) >= 42,
  },
  {
    id: "chapter_12",
    title: "ભક્તિયોગી બેજ",
    subtitle: "Supreme Devotion",
    description: "અધ્યાય ૧૨ પૂર્ણ કરી ભગવાન શ્રીકૃષ્ણના પરમ ભક્ત બનવાનો માર્ગ જાણ્યો.",
    icon: "Heart",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #60a5fa, #1d4ed8)",
    criteriaText: "અધ્યાય ૧૨ સંપૂર્ણ વાંચો (૨૦ શ્લોક)",
    check: (progress) => countChapterRead(progress.readShlokas, 12) >= 20,
  },
  {
    id: "century",
    title: "શતક સાધક",
    subtitle: "Century Reader",
    description: "ગીતાના ૧૦૦ થી વધુ દિવ્ય શ્લોકોનું સફળતાપૂર્વક વાંચન પૂર્ણ કર્યું.",
    icon: "Award",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #06b6d4, #0e7490)",
    criteriaText: "૧૦૦ શ્લોક પૂર્ણ વાંચો",
    check: (progress) => (progress.readShlokas || []).length >= 100,
  },
  {
    id: "halfway",
    title: "ગીતા પારંગત",
    subtitle: "Halfway Scholar",
    description: "ગીતાનો અડધો ભાગ (૩૫૦+ શ્લોક - ૫૦%) પૂર્ણ વાંચીને આધ્યાત્મિક પરિપક્વતા મેળવી.",
    icon: "Star",
    color: "#1e40af",
    gradient: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
    criteriaText: "૩૫૦ શ્લોક પૂર્ણ વાંચો (૫૦%)",
    check: (progress) => (progress.readShlokas || []).length >= 350,
  },
  {
    id: "gita_siddha",
    title: "ગીતા સિદ્ધ શિરોમણી",
    subtitle: "Gita Master (Complete)",
    description: "અદ્ભુત! આપે શ્રીમદ્ભગવદ્ગીતાના તમામ ૧૮ અધ્યાય અને ૭૦૦ શ્લોક સંપૂર્ણ વાંચ્યા છે.",
    icon: "Crown",
    color: "#1e3a8a",
    gradient: "linear-gradient(135deg, #3b82f6, #172554)",
    criteriaText: "તમામ ૭૦૦ શ્લોક પૂર્ણ વાંચો",
    check: (progress) => (progress.readShlokas || []).length >= TOTAL_GITA_SHLOKAS,
  },
];

export function countChapterRead(readShlokas = [], chapterNum) {
  return (readShlokas || []).filter((s) => Number(s.chapterNumber) === Number(chapterNum)).length;
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ==========================================================================
// LOCAL STORAGE MANAGEMENT (For Guest Mode / Offline Resilience)
// ==========================================================================
const STORAGE_KEY = "gita_reading_progress_v2";

export function getLocalProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        readShlokas: [],
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null,
        unlockedBadges: [],
      };
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading local reading progress:", err);
    return {
      readShlokas: [],
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      unlockedBadges: [],
    };
  }
}

export function saveLocalProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving local reading progress:", err);
  }
}

// ==========================================================================
// MARK SHLOKA AS READ (Dual Engine: Local + Cloud API)
// ==========================================================================
export async function trackShlokaRead(chapterNumber, shlokNumber, token = null) {
  const ch = Number(chapterNumber);
  const shl = Number(shlokNumber);
  if (!ch || !shl) return null;

  // 1. Update Local Storage First (Instant responsiveness)
  const local = getLocalProgress();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  const isAlreadyRead = (local.readShlokas || []).some(
    (s) => s.chapterNumber === ch && s.shlokNumber === shl
  );

  if (!isAlreadyRead) {
    local.readShlokas.push({
      chapterNumber: ch,
      shlokNumber: shl,
      readAt: new Date().toISOString(),
    });
  }

  // Update Streak
  let curStreak = local.currentStreak || 0;
  let lngStreak = local.longestStreak || 0;
  const lastRead = local.lastReadDate;

  if (!lastRead) {
    curStreak = 1;
  } else if (lastRead === today) {
    // Already read today
  } else if (lastRead === yesterday) {
    curStreak += 1;
  } else {
    curStreak = 1;
  }

  if (curStreak > lngStreak) {
    lngStreak = curStreak;
  }

  local.currentStreak = curStreak;
  local.longestStreak = lngStreak;
  local.lastReadDate = today;

  // Check Badges locally
  const currentBadgeIds = new Set((local.unlockedBadges || []).map((b) => b.badgeId));
  const newlyUnlocked = [];

  SPIRITUAL_BADGES.forEach((badge) => {
    if (!currentBadgeIds.has(badge.id) && badge.check(local)) {
      newlyUnlocked.push(badge);
      local.unlockedBadges.push({
        badgeId: badge.id,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  saveLocalProgress(local);

  // 2. If User is logged in, sync with Backend API asynchronously
  if (token) {
    try {
      fetch(`${API_TRACKER_URL}/mark-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chapterNumber: ch, shlokNumber: shl }),
      }).catch((e) => console.log("Background API track error:", e));
    } catch (e) {
      // ignore
    }
  }

  return {
    progress: local,
    newlyUnlocked,
  };
}

// ==========================================================================
// FETCH READING PROGRESS (From Backend if logged in, else Local)
// ==========================================================================
export async function getCombinedReadingProgress(token = null) {
  const local = getLocalProgress();

  if (!token) {
    // Calculate chapter breakdown from local
    const chapterBreakdown = {};
    CHAPTER_METADATA.forEach((meta) => {
      chapterBreakdown[meta.chapter] = {
        total: meta.shlokas,
        read: countChapterRead(local.readShlokas, meta.chapter),
      };
    });

    return {
      totalShlokas: TOTAL_GITA_SHLOKAS,
      readCount: (local.readShlokas || []).length,
      currentStreak: local.currentStreak || 0,
      longestStreak: local.longestStreak || 0,
      lastReadDate: local.lastReadDate,
      chapterBreakdown,
      readShlokas: local.readShlokas || [],
      unlockedBadges: local.unlockedBadges || [],
    };
  }

  try {
    const res = await fetch(`${API_TRACKER_URL}/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        // Also cache to local storage
        saveLocalProgress({
          readShlokas: data.data.readShlokas || [],
          currentStreak: data.data.currentStreak || 0,
          longestStreak: data.data.longestStreak || 0,
          lastReadDate: data.data.lastReadDate || null,
          unlockedBadges: data.data.unlockedBadges || [],
        });
        return data.data;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote progress, falling back to local:", err);
  }

  // Fallback to local
  const chapterBreakdown = {};
  CHAPTER_METADATA.forEach((meta) => {
    chapterBreakdown[meta.chapter] = {
      total: meta.shlokas,
      read: countChapterRead(local.readShlokas, meta.chapter),
    };
  });

  return {
    totalShlokas: TOTAL_GITA_SHLOKAS,
    readCount: (local.readShlokas || []).length,
    currentStreak: local.currentStreak || 0,
    longestStreak: local.longestStreak || 0,
    lastReadDate: local.lastReadDate,
    chapterBreakdown,
    readShlokas: local.readShlokas || [],
    unlockedBadges: local.unlockedBadges || [],
  };
}

// ==========================================================================
// SYNC LOCAL PROGRESS TO CLOUD
// ==========================================================================
export async function syncLocalToCloud(token) {
  if (!token) return { success: false, message: "No token" };

  const local = getLocalProgress();
  try {
    const res = await fetch(`${API_TRACKER_URL}/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        localShlokas: local.readShlokas || [],
        localStreak: local.currentStreak || 0,
        localBadges: local.unlockedBadges || [],
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.data) {
      saveLocalProgress({
        readShlokas: data.data.readShlokas || [],
        currentStreak: data.data.currentStreak || 0,
        longestStreak: data.data.longestStreak || 0,
        lastReadDate: data.data.lastReadDate || null,
        unlockedBadges: data.data.unlockedBadges || [],
      });
      return { success: true, data: data.data };
    }
    return { success: false, message: data.message || "Sync failed" };
  } catch (err) {
    console.error("syncLocalToCloud error:", err);
    return { success: false, message: err.message };
  }
}
