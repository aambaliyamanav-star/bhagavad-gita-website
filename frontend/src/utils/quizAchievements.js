// ==========================================================================
// QUIZ ACHIEVEMENTS & GAMIFICATION ENGINE
// ==========================================================================

export const API_QUIZ_URL = "https://bhagavad-gita-website.onrender.com/api/quiz";

// ==========================================================================
// BADGE DEFINITIONS (TOTAL: 13 BADGES)
// 9 Multiplier Badges (કાઉન્ટ વાળા બેજ) + 4 Milestone Badges (માઈલસ્ટોન બેજ)
// ==========================================================================

export const QUIZ_BADGES = [
  // ------------------------------------------------------------------------
  // PART 1: કાઉન્ટ વાળા બેજ (MULTIPLIER / REPEATABLE BADGES - 9)
  // ------------------------------------------------------------------------
  {
    id: "arjuna_focus",
    type: "multiplier",
    title: "અર્જુન દ્રષ્ટિ",
    englishTitle: "Arjuna's Focus",
    description: "કોઈપણ ક્વિઝમાં ૧૦૦% સચોટ સ્કોર (પરફેક્ટ સ્કોર) મેળવવા બદલ.",
    conditionText: "કોઈપણ ક્વિઝમાં ૧૦૦% ગુણ",
    icon: "Target",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  {
    id: "quick_intellect",
    type: "multiplier",
    title: "ચપળ મતિ",
    englishTitle: "Speed Master",
    description: "અડધાથી ઓછા સમયમાં ૮૦% કે તેથી વધુ સ્કોર સાથે ક્વિઝ પૂર્ણ કરવા બદલ.",
    conditionText: "ઝડપી ગતિ અને ૮૦%+ સ્કોર",
    icon: "Zap",
    color: "#0284c7",
    gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
  },
  {
    id: "steadfast_mind",
    type: "multiplier",
    title: "સ્થિતપ્રજ્ઞ",
    englishTitle: "Steadfast Mind",
    description: "એકપણ ભૂલ વગર સતત ૩૦ પ્રશ્નોના સાચા જવાબો આપવા બદલ.",
    conditionText: "સતત ૩૦ સાચા જવાબોની શ્રેણી",
    icon: "ShieldCheck",
    color: "#1d4ed8",
    gradient: "linear-gradient(135deg, #2563eb, #1e40af)",
  },
  {
    id: "daily_devoted",
    type: "multiplier",
    title: "અભ્યાસ યોગી",
    englishTitle: "Daily Devoted",
    description: "એક જ દિવસમાં સફળતાપૂર્વક ૫ ક્વિઝ પૂર્ણ કરવા બદલ.",
    conditionText: "૧ જ દિવસમાં ૫ ક્વિઝ પૂર્ણ",
    icon: "Flame",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #60a5fa, #1d4ed8)",
  },
  {
    id: "chapter_victor",
    type: "multiplier",
    title: "વિજયી પંથ",
    englishTitle: "Chapter Victor",
    description: "કોઈપણ અધ્યાયની ક્વિઝમાં ૯૦% કે તેથી વધુ ગુણ મેળવવા બદલ.",
    conditionText: "અધ્યાય ક્વિઝમાં ૯૦%+ ગુણ",
    icon: "Award",
    color: "#0284c7",
    gradient: "linear-gradient(135deg, #0ea5e9, #0369a1)",
  },
  {
    id: "dawn_seeker",
    type: "multiplier",
    title: "બ્રહ્મ મુહૂર્ત સાધક",
    englishTitle: "Dawn Seeker",
    description: "સવારે ૫:૦૦ થી ૮:૩૦ વાગ્યા વચ્ચે ક્વિઝમાં ૮૦%+ સ્કોર મેળવવા બદલ.",
    conditionText: "સવારે ૫:૦૦ - ૮:૩૦ વચ્ચે ૮૦%+ સ્કોર",
    icon: "Sunrise",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #93c5fd, #2563eb)",
  },
  {
    id: "winning_streak",
    type: "multiplier",
    title: "ત્રિવેણી વિજય",
    englishTitle: "Winning Streak",
    description: "સતત ૩ ક્વિઝમાં ૮૫% કે તેથી વધુ ગુણ સાથે સળંગ વિજય મેળવવા બદલ.",
    conditionText: "સતત ૩ ક્વિઝમાં ૮૫%+ સ્કોર",
    icon: "TrendingUp",
    color: "#1e40af",
    gradient: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
  },
  {
    id: "mahabharata_champion",
    type: "multiplier",
    title: "મહાભારત મહારથી",
    englishTitle: "Epic Lore Champion",
    description: "મહાભારત વિશેષ ક્વિઝમાં ૮૫% કે તેથી વધુ ગુણ સાથે વિજયી બનવા બદલ.",
    conditionText: "મહાભારત ક્વિઝમાં ૮૫%+ ગુણ",
    icon: "Swords",
    color: "#1d4ed8",
    gradient: "linear-gradient(135deg, #2563eb, #1e3a8a)",
  },
  {
    id: "weekly_streak",
    type: "multiplier",
    title: "સપ્તાહ સાધક",
    englishTitle: "7-Day Quiz Streak",
    description: "સતત ૭ દિવસ સુધી દરરોજ નિયમિત ગીતા ક્વિઝ રમવાની સપ્તાહ સાધના બદલ.",
    conditionText: "સતત ૭ દિવસ ક્વિઝ રમવા પર",
    icon: "CalendarCheck",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
  },

  // ------------------------------------------------------------------------
  // PART 2: માઈલસ્ટોન બેજ (ONE-TIME MILESTONE BADGES - 4)
  // ------------------------------------------------------------------------
  {
    id: "first_quiz",
    type: "milestone",
    title: "જિજ્ઞાસુ",
    englishTitle: "The Inquirer",
    description: "ભગવદ્ ગીતા જ્ઞાન કસોટીમાં જીવનની પ્રથમ ક્વિઝ પૂર્ણ કરવા બદલ.",
    conditionText: "પ્રથમ ૧ ક્વિઝ પૂર્ણ કરો",
    icon: "Footprints",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
    target: 1,
    targetUnit: "ક્વિઝ",
  },
  {
    id: "nine_chapters",
    type: "milestone",
    title: "નવધા જ્ઞાન",
    englishTitle: "Halfway Master",
    description: "ભગવદ્ ગીતાના ૯ અલગ-અલગ અધ્યાયોની ક્વિઝ સફળતાપૂર્વક પાસ કરવા બદલ.",
    conditionText: "૯ અલગ અધ્યાયોની ક્વિઝ પાસ કરો",
    icon: "Compass",
    color: "#0284c7",
    gradient: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    target: 9,
    targetUnit: "અધ્યાય",
  },
  {
    id: "all_18_chapters",
    type: "milestone",
    title: "પૂર્ણ પુરુષાર્થ",
    englishTitle: "Gita Scholar",
    description: "શ્રીમદ્ ભગવદ્ ગીતાના તમામ ૧૮ અધ્યાયોની ક્વિઝ સફળતાપૂર્વક પૂર્ણ કરવા બદલ.",
    conditionText: "તમામ ૧૮ અધ્યાયોની ક્વિઝ પૂર્ણ કરો",
    icon: "Crown",
    color: "#1e3a8a",
    gradient: "linear-gradient(135deg, #2563eb, #0f172a)",
    target: 18,
    targetUnit: "અધ્યાય",
  },
  {
    id: "grandmaster",
    type: "milestone",
    title: "ગીતા મહાજ્ઞાની",
    englishTitle: "Grandmaster",
    description: "કુલ ૧,૦૦૦+ સાચા જવાબો અને ઓછામાં ઓછી ૭૫ ક્વિઝ પૂર્ણ કરવાનો સર્વોચ્ચ માઈલસ્ટોન.",
    conditionText: "૧,૦૦૦ સાચા જવાબ અને ૭૫ ક્વિઝ",
    icon: "Sparkles",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #60a5fa, #1d4ed8)",
    target: 1000,
    targetUnit: "સાચા જવાબ",
  },
];

// ==========================================================================
// HELPER: EXTRACT CHAPTER NUMBER FROM QUIZ RESULT
// ==========================================================================

export const extractChapterNumber = (result) => {
  if (!result) return null;

  if (result.chapterNumber !== undefined && result.chapterNumber !== null) {
    const parsed = Number(result.chapterNumber);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 18) {
      return parsed;
    }
  }

  if (typeof result.category === "string") {
    const cat = result.category.trim().toLowerCase();
    if (cat.startsWith("chapter-") || cat.startsWith("chapter_")) {
      const parsed = Number(cat.replace(/^chapter[-_]/, ""));
      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 18) {
        return parsed;
      }
    }
    const directNum = Number(cat);
    if (Number.isInteger(directNum) && directNum >= 1 && directNum <= 18) {
      return directNum;
    }
  }

  return null;
};

// ==========================================================================
// CORE CALCULATION ENGINE
// Computes badge states, multiplier counts, and milestone progress from history
// ==========================================================================

export const calculateQuizAchievements = (rawResults = []) => {
  const results = Array.isArray(rawResults) ? [...rawResults] : [];

  // Sort chronologically ascending by createdAt (oldest to newest)
  results.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  // Overall Statistics
  const totalQuizzes = results.length;
  let totalQuestionsAnswered = 0;
  let totalCorrect = 0;
  let totalWrong = 0;

  // Track unique chapters passed (>= 50% score)
  const passedChaptersSet = new Set();

  // Multiplier Counters
  let arjunaFocusCount = 0;
  let quickIntellectCount = 0;
  let steadfastMindCount = 0;
  let chapterVictorCount = 0;
  let dawnSeekerCount = 0;
  let winningStreakCount = 0;
  let mahabharataCount = 0;

  // State tracking across quizzes
  let currentCorrectStreak = 0;
  let consecutiveWinCount = 0; // for winning streak (>= 85%)

  // Day grouping for "daily_devoted" and "weekly_streak"
  const dayCountMap = {};
  const playedDatesSet = new Set();

  results.forEach((r) => {
    const correct = Number(r.correctAnswers || r.score || 0);
    const total = Number(r.totalQuestions || 0);
    const percentage =
      total > 0
        ? Math.round((correct / total) * 100)
        : Number(r.percentage || 0);

    totalCorrect += correct;
    totalWrong += Number(r.wrongAnswers || 0);
    totalQuestionsAnswered += total;

    const chapterNum = extractChapterNumber(r);
    if (chapterNum && percentage >= 50) {
      passedChaptersSet.add(chapterNum);
    }

    // 1. Arjuna's Focus (100% score)
    if (percentage === 100 && total > 0) {
      arjunaFocusCount += 1;
    }

    // 2. Quick Intellect (Speed Master)
    const timeTaken = Number(r.timeTaken || r.timeSpent || 0);
    const allowedHalfTime = Math.max(15, total * 15);
    if (percentage >= 80 && timeTaken > 0 && timeTaken <= allowedHalfTime) {
      quickIntellectCount += 1;
    }

    // 3. Chapter Victor (Chapter quiz >= 90%)
    if (chapterNum && percentage >= 90) {
      chapterVictorCount += 1;
    }

    // 4. Mahabharata Champion (Mahabharata quiz >= 85%)
    const catStr = String(r.category || "").trim().toLowerCase();
    if (catStr === "mahabharata" && percentage >= 85) {
      mahabharataCount += 1;
    }

    // 5. Dawn Seeker (05:00 - 08:30 AM with >= 80%)
    if (r.createdAt && percentage >= 80) {
      const dt = new Date(r.createdAt);
      const hours = dt.getHours();
      const mins = dt.getMinutes();
      const timeInMins = hours * 60 + mins;
      // 5:00 AM (300 mins) to 8:30 AM (510 mins)
      if (timeInMins >= 300 && timeInMins <= 510) {
        dawnSeekerCount += 1;
      }
    }

    // 6. Winning Streak (3 consecutive quizzes with >= 85%)
    if (percentage >= 85) {
      consecutiveWinCount += 1;
      if (consecutiveWinCount >= 3) {
        winningStreakCount += 1;
        consecutiveWinCount = 0; // reset for next 3 wins
      }
    } else {
      consecutiveWinCount = 0;
    }

    // 7. Day grouping for Daily Devoted and date collection for 7-day streak
    if (r.createdAt) {
      const dt = new Date(r.createdAt);
      const dayKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
        dt.getDate()
      ).padStart(2, "0")}`;
      dayCountMap[dayKey] = (dayCountMap[dayKey] || 0) + 1;
      playedDatesSet.add(dayKey);
    }

    // 8. Steadfast Mind (30 consecutive correct answers streak)
    if (Array.isArray(r.answers) && r.answers.length > 0) {
      r.answers.forEach((ans) => {
        if (ans && ans.isCorrect) {
          currentCorrectStreak += 1;
          if (currentCorrectStreak >= 30) {
            steadfastMindCount += 1;
            currentCorrectStreak = 0; // reset for next 30
          }
        } else {
          currentCorrectStreak = 0;
        }
      });
    } else {
      if (percentage === 100 && total >= 30) {
        steadfastMindCount += 1;
      }
    }
  });

  // Calculate Daily Devoted count (days with >= 5 quizzes)
  let dailyDevotedCount = 0;
  Object.values(dayCountMap).forEach((cnt) => {
    if (cnt >= 5) {
      dailyDevotedCount += Math.floor(cnt / 5);
    }
  });

  // Calculate 7-Day Quiz Streak count (weekly_streak)
  let weeklyStreakCount = 0;
  const uniqueDates = Array.from(playedDatesSet).sort();
  if (uniqueDates.length >= 7) {
    let streakDays = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streakDays += 1;
        if (streakDays >= 7) {
          weeklyStreakCount += 1;
          streakDays = 0; // reset for next 7-day cycle
        }
      } else {
        streakDays = 1;
      }
    }
  }

  // Distinct passed chapters count
  const uniqueChaptersPassed = passedChaptersSet.size;

  // Build badge status objects
  const evaluatedBadges = QUIZ_BADGES.map((badge) => {
    if (badge.type === "multiplier") {
      let count = 0;
      if (badge.id === "arjuna_focus") count = arjunaFocusCount;
      else if (badge.id === "quick_intellect") count = quickIntellectCount;
      else if (badge.id === "steadfast_mind") count = steadfastMindCount;
      else if (badge.id === "daily_devoted") count = dailyDevotedCount;
      else if (badge.id === "chapter_victor") count = chapterVictorCount;
      else if (badge.id === "dawn_seeker") count = dawnSeekerCount;
      else if (badge.id === "winning_streak") count = winningStreakCount;
      else if (badge.id === "mahabharata_champion") count = mahabharataCount;
      else if (badge.id === "weekly_streak") count = weeklyStreakCount;

      const unlocked = count > 0;
      return {
        ...badge,
        unlocked,
        count,
        displayMultiplier: count > 0 ? `×${count}` : null,
      };
    } else {
      // Milestone badge (Only 4)
      let currentProgress = 0;
      let target = badge.target || 1;
      let unlocked = false;

      if (badge.id === "first_quiz") {
        currentProgress = totalQuizzes;
        unlocked = totalQuizzes >= 1;
      } else if (badge.id === "nine_chapters") {
        currentProgress = uniqueChaptersPassed;
        unlocked = uniqueChaptersPassed >= 9;
      } else if (badge.id === "all_18_chapters") {
        currentProgress = uniqueChaptersPassed;
        unlocked = uniqueChaptersPassed >= 18;
      } else if (badge.id === "grandmaster") {
        currentProgress = totalCorrect;
        unlocked = totalCorrect >= 1000 && totalQuizzes >= 75;
      }

      const progressPercentage = Math.min(
        100,
        Math.round((currentProgress / target) * 100)
      );

      return {
        ...badge,
        unlocked,
        currentProgress: Math.min(currentProgress, target),
        target,
        progressPercentage,
      };
    }
  });

  const totalBadgesUnlocked = evaluatedBadges.filter((b) => b.unlocked).length;
  const totalMultipliersEarned = evaluatedBadges
    .filter((b) => b.type === "multiplier")
    .reduce((sum, b) => sum + (b.count || 0), 0);

  return {
    badges: evaluatedBadges,
    stats: {
      totalBadgesUnlocked,
      totalBadgesCount: QUIZ_BADGES.length,
      totalMultipliersEarned,
      totalQuizzes,
      totalCorrect,
      totalWrong,
      totalQuestionsAnswered,
      uniqueChaptersPassed,
    },
  };
};

// ==========================================================================
// CHECK RECENTLY EARNED BADGES AFTER COMPLETING A QUIZ
// ==========================================================================

export const getNewlyEarnedQuizBadges = (oldResults = [], newResults = []) => {
  const oldEngine = calculateQuizAchievements(oldResults);
  const newEngine = calculateQuizAchievements(newResults);

  const newlyEarned = [];

  newEngine.badges.forEach((newBadge) => {
    const oldBadge = oldEngine.badges.find((b) => b.id === newBadge.id);

    if (newBadge.type === "multiplier") {
      const oldCount = oldBadge ? oldBadge.count : 0;
      if (newBadge.count > oldCount) {
        newlyEarned.push({
          badge: newBadge,
          isNewUnlock: oldCount === 0,
          previousCount: oldCount,
          newCount: newBadge.count,
          gainedCount: newBadge.count - oldCount,
        });
      }
    } else {
      const wasUnlocked = oldBadge ? oldBadge.unlocked : false;
      if (newBadge.unlocked && !wasUnlocked) {
        newlyEarned.push({
          badge: newBadge,
          isNewUnlock: true,
          previousCount: 0,
          newCount: 1,
          gainedCount: 1,
        });
      }
    }
  });

  return newlyEarned;
};
