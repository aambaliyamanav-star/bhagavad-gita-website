import { getValidToken, clearAuthSession } from "./authHelper.js";
// ==========================================================================
// GITA READING TRACKER UTILITY & GAMIFICATION ENGINE
// ==========================================================================

export const API_TRACKER_URL = "https://bhagavad-gita-website.onrender.com/api/reading-tracker";

// All 18 chapters with names and traditional shloka counts (Total: 700)
export const CHAPTER_METADATA = [
  { chapter: 1, name: "અર્જુનવિષાદ યોગ", nameHi: "अर्जुनविषाद योग", nameHindi: "अर्जुन विषाद योग", englishName: "Arjuna Vishada Yoga", shlokas: 47 },
  { chapter: 2, name: "સાંખ્ય યોગ", nameHi: "सांख्य योग", nameHindi: "सांख्य योग", englishName: "Sankhya Yoga", shlokas: 72 },
  { chapter: 3, name: "કર્મ યોગ", nameHi: "कर्म योग", nameHindi: "कर्म योग", englishName: "Karma Yoga", shlokas: 43 },
  { chapter: 4, name: "જ્ઞાનકર્મસંન્યાસ યોગ", nameHi: "ज्ञानकर्मसंन्यास योग", nameHindi: "ज्ञानकर्मसंन्यास योग", englishName: "Jnana Karma Sanyasa Yoga", shlokas: 42 },
  { chapter: 5, name: "કર્મસંન્યાસ યોગ", nameHi: "कर्मसंन्यास योग", nameHindi: "कर्मसंन्यास योग", englishName: "Karma Sanyasa Yoga", shlokas: 29 },
  { chapter: 6, name: "આત્મસંયમ યોગ", nameHi: "आत्मसंयम योग", nameHindi: "आत्मसंयम योग", englishName: "Dhyana Yoga", shlokas: 47 },
  { chapter: 7, name: "જ્ઞાનવિજ્ઞાન યોગ", nameHi: "ज्ञानविज्ञान योग", nameHindi: "ज्ञानविज्ञान योग", englishName: "Jnana Vijnana Yoga", shlokas: 30 },
  { chapter: 8, name: "અક્ષરબ્રહ્મ યોગ", nameHi: "अक्षरब्रह्म योग", nameHindi: "अक्षरब्रह्म योग", englishName: "Akshara Brahma Yoga", shlokas: 28 },
  { chapter: 9, name: "રાજવિદ્યા રાજગુહ્ય યોગ", nameHi: "राजविद्या राजगुह्य योग", nameHindi: "राजविद्या राजगुह्य योग", englishName: "Raja Vidya Raja Guhya Yoga", shlokas: 34 },
  { chapter: 10, name: "વિભૂતિ યોગ", nameHi: "विभूति योग", nameHindi: "विभूति योग", englishName: "Vibhuti Yoga", shlokas: 42 },
  { chapter: 11, name: "વિશ્વરૂપદર્શન યોગ", nameHi: "विश्वरूपदर्शन योग", nameHindi: "विश्वरूपदर्शन योग", englishName: "Vishwarupa Darshana Yoga", shlokas: 55 },
  { chapter: 12, name: "ભક્તિ યોગ", nameHi: "भक्ति योग", nameHindi: "भक्ति योग", englishName: "Bhakti Yoga", shlokas: 20 },
  { chapter: 13, name: "ક્ષેત્રક્ષેત્રજ્ઞ વિભાગ યોગ", nameHi: "क्षेत्र-क्षेत्रज्ञ विभाग योग", nameHindi: "क्षेत्र-क्षेत्रज्ञ विभाग योग", englishName: "Kshetra Kshetrajna Yoga", shlokas: 35 },
  { chapter: 14, name: "ગુણત્રયવિભાગ યોગ", nameHi: "गुणत्रयविभाग योग", nameHindi: "गुणत्रयविभाग योग", englishName: "Gunatraya Vibhaga Yoga", shlokas: 27 },
  { chapter: 15, name: "પુરુષોત્તમ યોગ", nameHi: "पुरुषोत्तम योग", nameHindi: "पुरुषोत्तम योग", englishName: "Purushottama Yoga", shlokas: 20 },
  { chapter: 16, name: "દૈવાસુરસંપદ્વિભાગ યોગ", nameHi: "दैवासुरसम्पद्विभाग योग", nameHindi: "दैवासुरसम्पद्विभाग योग", englishName: "Daivasura Sampad Yoga", shlokas: 24 },
  { chapter: 17, name: "શ્રદ્ધાત્રયવિભાગ યોગ", nameHi: "श्रद्धात्रयविभाग योग", nameHindi: "श्रद्धात्रयविभाग योग", englishName: "Shraddhatraya Vibhaga Yoga", shlokas: 28 },
  { chapter: 18, name: "મોક્ષસંન્યાસ યોગ", nameHi: "मोक्षसंन्यास योग", nameHindi: "मोक्षसंन्यास योग", englishName: "Moksha Sanyasa Yoga", shlokas: 78 },
];

export const TOTAL_GITA_SHLOKAS = 700;

// 10 Spiritual Badges
export const SPIRITUAL_BADGES = [
  {
    id: "first_step",
    title: "પ્રથમ પગલું",
    titleHi: "पहला कदम",
    description: "ભગવદ્ ગીતાનો પ્રથમ શ્લોક વાંચીને દિવ્ય યાત્રા શરૂ કરી.",
    descriptionHi: "भगवद् गीता का प्रथम श्लोक पढ़कर दिव्य यात्रा आरम्भ की।",
    icon: "Sparkles",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    criteriaText: "કોઈપણ ૧ શ્લોક વાંચો",
    criteriaTextHi: "कोई भी 1 श्लोक पढ़ें",
    check: (progress) => (progress.readShlokas || []).length >= 1,
  },
  {
    id: "streak_3",
    title: "નિષ્ઠાવાન સાધક",
    titleHi: "निष्ठावान साधक",
    description: "સતત ૩ દિવસ સુધી ગીતા વાંચનનો નિયમ જાળવી રાખ્યો.",
    descriptionHi: "लगातार 3 दिनों तक गीता पठन का नियम बनाए रखा।",
    icon: "Flame",
    color: "#1d4ed8",
    gradient: "linear-gradient(135deg, #2563eb, #1e40af)",
    criteriaText: "સતત ૩ દિવસની સ્ટ્રીક",
    criteriaTextHi: "लगातार 3 दिन की स्ट्रीक",
    check: (progress) => (progress.currentStreak || 0) >= 3 || (progress.longestStreak || 0) >= 3,
  },
  {
    id: "streak_7",
    title: "અભ્યાસી યોગી",
    titleHi: "अभ्यासी योगी",
    description: "સતત ૧ સપ્તાહ (૭ દિવસ) નિયમિત ગીતા સ્વાધ્યાય પૂર્ણ કર્યો.",
    descriptionHi: "लगातार 1 सप्ताह (7 दिन) नियमित गीता स्वाध्याय पूर्ण किया।",
    icon: "Zap",
    color: "#0284c7",
    gradient: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    criteriaText: "સતત ૭ દિવસની સ્ટ્રીક",
    criteriaTextHi: "लगातार 7 दिन की स्ट્રીक",
    check: (progress) => (progress.currentStreak || 0) >= 7 || (progress.longestStreak || 0) >= 7,
  },
  {
    id: "chapter_1",
    title: "અર્જુન વિષાદ મુક્ત",
    titleHi: "अर्जुन विषाद मुक्त",
    description: "અધ્યાય ૧ ના તમામ ૪૭ શ્લોક વાંચીને જીવનના સંશયો દૂર કરવાનો આરંભ કર્યો.",
    descriptionHi: "अध्याय 1 के सभी 47 श्लोक पढ़कर जीवन के संशय दूर करने का आरम्भ किया।",
    icon: "Shield",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
    criteriaText: "અધ્યાય ૧ સંપૂર્ણ વાંચો (૪૭ શ્લોક)",
    criteriaTextHi: "अध्याय 1 पूरा पढ़ें (47 श्लोक)",
    check: (progress) => countChapterRead(progress.readShlokas, 1) >= 47,
  },
  {
    id: "chapter_3",
    title: "કર્મયોગી બેજ",
    titleHi: "कर्मयोगी बैज",
    description: "અધ્યાય ૩ પૂર્ણ કરી નિષ્કામ કર્મનો દિવ્ય ઉપદેશ આત્મસાત કર્યો.",
    descriptionHi: "अध्याय 3 पूर्ण कर निष्काम कर्म का दिव्य उपदेश आत्मसात किया।",
    icon: "Compass",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
    criteriaText: "અધ્યાય ૩ સંપૂર્ણ વાંચો (૪૩ શ્લોક)",
    criteriaTextHi: "अध्याय 3 पूरा पढ़ें (43 श्लोक)",
    check: (progress) => countChapterRead(progress.readShlokas, 3) >= 43,
  },
  {
    id: "chapter_4",
    title: "જ્ઞાનયોગી બેજ",
    titleHi: "ज्ञानयोगी बैज",
    description: "અધ્યાય ૪ પૂર્ણ કરી જ્ઞાનરૂપી અગ્નિથી પાપો ભસ્મ કરવાનો માર્ગ સમજ્યા.",
    descriptionHi: "अध्याय 4 पूर्ण कर ज्ञानरूपी अग्नि से पाप भस्म करने का मार्ग समझा।",
    icon: "Brain",
    color: "#4f46e5",
    gradient: "linear-gradient(135deg, #6366f1, #3730a3)",
    criteriaText: "અધ્યાય ૪ સંપૂર્ણ વાંચો (૪૨ શ્લોક)",
    criteriaTextHi: "अध्याय 4 पूरा पढ़ें (42 श्लोक)",
    check: (progress) => countChapterRead(progress.readShlokas, 4) >= 42,
  },
  {
    id: "chapter_12",
    title: "ભક્તિયોગી બેજ",
    titleHi: "भक्तियोगी बैज",
    description: "અધ્યાય ૧૨ પૂર્ણ કરી ભગવાન શ્રીકૃષ્ણના પરમ ભક્ત બનવાનો માર્ગ જાણ્યો.",
    descriptionHi: "अध्याय 12 पूर्ण कर भगवान श्रीकृष्ण के परम भक्त बनने का मार्ग जाना।",
    icon: "Heart",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #60a5fa, #1d4ed8)",
    criteriaText: "અધ્યાય ૧૨ સંપૂર્ણ વાંચો (૨૦ શ્લોક)",
    criteriaTextHi: "अध्याय 12 पूरा पढ़ें (20 श्लोक)",
    check: (progress) => countChapterRead(progress.readShlokas, 12) >= 20,
  },
  {
    id: "century",
    title: "શતક સાધક",
    titleHi: "शतक साधक",
    description: "ગીતાના ૧૦૦ થી વધુ દિવ્ય શ્લોકોનું સફળતાપૂર્વક વાંચન પૂર્ણ કર્યું.",
    descriptionHi: "गीता के 100 से अधिक दिव्य श्लोकों का सफलतापूर्वक पठन पूर्ण किया।",
    icon: "Award",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #06b6d4, #0e7490)",
    criteriaText: "૧૦૦ શ્લોક પૂર્ણ વાંચો",
    criteriaTextHi: "100 श्लोक पूरे पढ़ें",
    check: (progress) => (progress.readShlokas || []).length >= 100,
  },
  {
    id: "halfway",
    title: "ગીતા પારંગત",
    titleHi: "गीता पारंगत",
    description: "ગીતાનો અડધો ભાગ (૩૫૦+ શ્લોક - ૫૦%) પૂર્ણ વાંચીને આધ્યાત્મિક પરિપક્વતા મેળવી.",
    descriptionHi: "गीता का आधा भाग (350+ श्लोक - 50%) पूर्ण पढ़कर आध्यात्मिक परिपक्वता प्राप्त की।",
    icon: "Star",
    color: "#1e40af",
    gradient: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
    criteriaText: "૩૫૦ શ્લોક પૂર્ણ વાંચો (૫૦%)",
    criteriaTextHi: "350 श्लोक पूरे पढ़ें (50%)",
    check: (progress) => (progress.readShlokas || []).length >= 350,
  },
  {
    id: "gita_siddha",
    title: "ગીતા સિદ્ધ શિરોમણી",
    titleHi: "गीता सिद्ध शिरोमणि",
    description: "અદ્ભુત! આપે શ્રીમદ્ભગવદ્ગીતાના તમામ ૧૮ અધ્યાય અને ૭૦૦ શ્લોક સંપૂર્ણ વાંચ્યા છે.",
    descriptionHi: "अद्भुत! आपने श्रीमद्भगवद्गीता के सभी 18 अध्याय और 700 श्लोक पूर्ण पढ़े हैं।",
    icon: "Crown",
    color: "#1e3a8a",
    gradient: "linear-gradient(135deg, #3b82f6, #172554)",
    criteriaText: "તમામ ૭૦૦ શ્લોક પૂર્ણ વાંચો",
    criteriaTextHi: "सभी 700 श्लोक पूरे पढ़ें",
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
  const validToken = token ? (getValidToken() || token) : null;

  if (!validToken) {
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
        Authorization: `Bearer ${validToken}`,
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
    } else if (res.status === 401) {
      clearAuthSession();
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
  const validToken = token ? (getValidToken() || token) : getValidToken();
  if (!validToken) return { success: false, message: "No token" };

  const local = getLocalProgress();
  try {
    const res = await fetch(`${API_TRACKER_URL}/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validToken}`,
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
    if (res.status === 401 || (data.message && data.message.toLowerCase().includes("token"))) {
      clearAuthSession();
      return { success: false, isAuthError: true, message: "Session expired. Please log in again." };
    }
    return { success: false, message: data.message || "Sync failed" };
  } catch (err) {
    console.error("syncLocalToCloud error:", err);
    return { success: false, message: err.message };
  }
}
