const webpush = require("web-push");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const QuizResult = require("../models/QuizResult");

const DEFAULT_VAPID_PUBLIC =
  "BBZ0vGL3_MtwlA6Owet6dEptXpiUIKyYdzV9Zy9qeew50cNaYqlRjpeg2qKdJowEnZWQ7vhbWOE-f0xhfMe6EDQ";
const DEFAULT_VAPID_PRIVATE =
  "2PC7JJlWR5mb8hiEcmjlBkDKrJS907LjRxknH44mHzw";

// Lazy setup for VAPID details
let vapidConfigured = false;
function ensureVapidConfig() {
  if (vapidConfigured) return true;
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE;
  try {
    webpush.setVapidDetails(
      "mailto:admin@bhagavadgita.com",
      vapidPublicKey,
      vapidPrivateKey
    );
    vapidConfigured = true;
    return true;
  } catch (err) {
    console.error("Failed to configure VAPID details:", err.message);
    return false;
  }
}

// Helper to send push
async function sendPush(subscription, payload) {
  if (!ensureVapidConfig()) return;
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log(`Expired subscription ${subscription._id}, deleting from DB...`);
      await Subscription.deleteOne({ _id: subscription._id });
    } else {
      console.error(`WebPush send failed for ${subscription._id}:`, err.message);
    }
    throw err;
  }
}

module.exports = {
  // GET /api/notifications/public-key
  getPublicKey: (req, res) => {
    const key = process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
    return res.json({ publicKey: key });
  },

  // POST /api/notifications/subscribe
  subscribe: async (req, res) => {
    try {
      const { endpoint, keys, role, userId } = req.body;
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ error: "અમાન્ય સબસ્ક્રિપ્શન વિગતો." });
      }

      const userRole = role === "admin" ? "admin" : "user";
      const validUserId = userId || null;

      const subscription = await Subscription.findOneAndUpdate(
        { endpoint },
        {
          endpoint,
          keys,
          role: userRole,
          userId: validUserId,
          lastOpenedDate: new Date(),
          reminderCount: 0,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Send initial welcome notification
      const welcomePayload = {
        title: "શ્રીમદ્ ભગવદ્ ગીતા | સ્વાગત છે",
        body: "દૈનિક પ્રેરણા સૂચનાઓ સફળતાપૂર્વક સક્રિય થઈ ગઈ છે.",
        url: process.env.SITE_URL || "https://bhagavad-gita-website-rk1v.vercel.app",
        tag: "welcome-notification",
      };

      try {
        await sendPush(subscription, welcomePayload);
      } catch (err) {
        console.warn("Welcome push notification delivery warning:", err.message);
      }

      return res.status(201).json({
        success: true,
        message: "સબસ્ક્રિપ્શન સફળતાપૂર્વક નોંધાઈ ગયું છે.",
      });
    } catch (err) {
      console.error("Subscription save error:", err);
      return res.status(500).json({ error: "સબસ્ક્રિપ્શન સેવ કરવામાં સમસ્યા આવી." });
    }
  },

  // POST /api/notifications/unsubscribe
  unsubscribe: async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ error: "Endpoint જરૂરી છે" });
      }
      await Subscription.deleteOne({ endpoint });
      return res.json({ success: true, message: "સફળતાપૂર્વક અનસબસ્ક્રાઇબ થયું" });
    } catch (err) {
      console.error("Unsubscribe error:", err);
      return res.status(500).json({ error: "Unsubscribe કરવામાં સમસ્યા આવી" });
    }
  },

  // POST /api/notifications/record-open
  // Called whenever user opens the website directly OR via notification click
  recordOpen: async (req, res) => {
    try {
      const { endpoint, userId } = req.body;
      if (!endpoint && !userId) {
        return res.status(400).json({ error: "Endpoint અથવા UserId જરૂરી છે" });
      }

      const filter = endpoint ? { endpoint } : { userId };
      await Subscription.updateMany(filter, {
        $set: {
          lastOpenedDate: new Date(),
        },
      });

      return res.json({
        success: true,
        message: "વેબસાઇટ મુલાકાત સફળતાપૂર્વક નોંધાઈ ગઈ છે.",
      });
    } catch (err) {
      console.error("Record open error:", err);
      return res.status(500).json({ error: "મુલાકાત નોંધવામાં સમસ્યા આવી" });
    }
  },

  // POST /api/notifications/record-action
  // Called whenever user reads a shloka or plays a quiz
  recordAction: async (req, res) => {
    try {
      const { endpoint, userId, action } = req.body;
      if (!endpoint && !userId) {
        return res.status(400).json({ error: "Endpoint અથવા UserId જરૂરી છે" });
      }

      const filter = endpoint ? { endpoint } : { userId };
      const updateData = {};
      if (action === "read_shlok") {
        updateData.lastShlokReadDate = new Date();
      } else if (action === "play_quiz") {
        updateData.lastQuizPlayedDate = new Date();
      }

      if (Object.keys(updateData).length > 0) {
        await Subscription.updateMany(filter, { $set: updateData });
      }

      return res.json({
        success: true,
        action,
        message: "ક્રિયા સફળતાપૂર્વક નોંધાઈ ગઈ છે.",
      });
    } catch (err) {
      console.error("Record action error:", err);
      return res.status(500).json({ error: "ક્રિયા નોંધવામાં સમસ્યા આવી" });
    }
  },

  // Dynamic smart notifications based on user's daily activity
  // If user has read shlok & played quiz today: STOP reminders for today!
  // If user hasn't read shlok: send shlok reading reminder to protect streak
  // If user hasn't played quiz: send quiz challenge reminder
  // If neither done: send streak / daily goals reminder
  sendDailyReminder: async (customMsg = null) => {
    try {
      const subscribers = await Subscription.find({});

      if (!subscribers || subscribers.length === 0) {
        console.log("No subscribers found for daily reminder.");
        return { success: true, total: 0, sent: 0, skipped: 0 };
      }

      // Calculate start of today in Indian Standard Time (IST = UTC + 5:30)
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(Date.now() + istOffsetMs);
      const istHours = istDate.getUTCHours();
      const startOfTodayIST = new Date(
        Date.UTC(
          istDate.getUTCFullYear(),
          istDate.getUTCMonth(),
          istDate.getUTCDate(),
          0, 0, 0, 0
        ) - istOffsetMs
      );
      const todayStringIST = `${istDate.getUTCFullYear()}-${String(
        istDate.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(istDate.getUTCDate()).padStart(2, "0")}`;

      const targetUrl =
        process.env.SITE_URL || "https://bhagavad-gita-website-rk1v.vercel.app";

      // Message templates by situation
      const messageTemplates = {
        // ૧. શ્લોક પણ નથી વાંચ્યો અને ક્વિઝ પણ નથી રમી (Neither Done)
        neither: {
          morning: [
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | Daily Streak લક્ષ્ય",
              body: "તમે આજે હજુ ૧ પણ શ્લોક વાંચ્યો નથી! તમારી દૈનિક વાંચન સ્ટ્રીક જાળવવા ૧ શ્લોક વાંચો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "ભગવદ્ ગીતા | પ્રભાત પ્રેરણા",
              body: "આજના દિવસની શુભ શરૂઆત કરવા માટે ૧ શ્લોક વાંચો અને દૈનિક ક્વિઝ રમો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          afternoon: [
            {
              title: "ભગવદ્ ગીતા | દૈનિક વાંચન અને ક્વિઝ",
              body: "દિવસની વ્યસ્તતા વચ્ચે ૨ મિનિટ ફાળવો: આજનો શ્લોક વાંચો અને નવી ક્વિઝ રમો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | પ્રગતિ રિમાઇન્ડર",
              body: "તમારો આજનો શ્લોક વાંચવાનો અને ક્વિઝ રમવાનો ટાર્ગેટ હજુ બાકી છે, હમણાં પૂર્ણ કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          evening: [
            {
              title: "ભગવદ્ ગીતા | Daily Streak ચેતવણી",
              body: "ધ્યાન રાખો! આજનો દિવસ પૂર્ણ થતાં પહેલાં ૧ શ્લોક વાંચીને તમારી સ્ટ્રીક સુરક્ષિત કરો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | આજના લક્ષ્યો બાકી છે",
              body: "સાંજનો સમય છે! આજનો શ્લોક વાંચો અને ક્વિઝ રમીને તમારા પોઈન્ટ્સ વધારો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          night: [
            {
              title: "ભગવદ્ ગીતા | છેલ્લી તક",
              body: "આજનો દિવસ ગીતા વાંચ્યા વિના પૂરો ન થવા દો. હમણાં જ ૧ શ્લોક પૂર્ણ કરી સ્ટ્રીક સાચવો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | દિવસનું સમાપન",
              body: "ઊંઘતા પહેલાં તમારી Daily Streak સુરક્ષિત કરો અને આજની ક્વિઝ પૂર્ણ કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
        },

        // ૨. ક્વિઝ રમી લીધી છે, પણ શ્લોક નથી વાંચ્યો (Quiz Done, Shlok Pending)
        shlokPending: {
          morning: [
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | Daily Streak રિમાઇન્ડર",
              body: "તમે ક્વિઝ રમી લીધી છે! હવે તમારી દૈનિક વાંચન સ્ટ્રીક જાળવવા માટે ૧ શ્લોક વાંચો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          afternoon: [
            {
              title: "ભગવદ્ ગીતા | શ્લોક વાંચન બાકી છે",
              body: "ક્વિઝ પછી હવે આજનો શ્લોક વાંચીને તમારું દૈનિક વાંચન લક્ષ્ય પૂર્ણ કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          evening: [
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | સ્ટ્રીક સુરક્ષિત કરો",
              body: "આજનો દિવસ પૂર્ણ થતાં પહેલાં ૧ શ્લોક વાંચીને તમારી દૈનિક સ્ટ્રીક સાચવો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          night: [
            {
              title: "ભગવદ્ ગીતા | શ્લોક વાંચન પૂર્ણ કરો",
              body: "દિવસ પૂરો થાય તે પહેલાં માત્ર ૧ શ્લોક વાંચીને આજનું અધ્યાય લક્ષ્ય પૂરું કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
        },

        // ૩. શ્લોક વાંચી લીધો છે, પણ ક્વિઝ રમવાની બાકી છે (Shlok Done, Quiz Pending)
        quizPending: {
          morning: [
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | દૈનિક ક્વિઝ ચેલેન્જ",
              body: "આજનું શ્લોક વાંચન પૂર્ણ થઈ ગયું છે! હવે દૈનિક ક્વિઝ રમીને તમારા જ્ઞાનની કસોટી કરો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          afternoon: [
            {
              title: "ભગવદ્ ગીતા | ક્વિઝ રમો અને પોઈન્ટ્સ મેળવો",
              body: "તમારું આજના દિવસનું વાંચન પૂરું છે. હવે ગીતા ક્વિઝ રમીને નવા બેજ અનલૉક કરો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          evening: [
            {
              title: "શ્રીમદ્ ભગવદ્ ગીતા | સાંજની ક્વિઝ સ્પર્ધા",
              body: "આજની દૈનિક ક્વિઝ હજુ બાકી છે! પ્રશ્નોના સાચા જવાબ આપીને તમારી ક્ષમતા ચકાસો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          night: [
            {
              title: "ભગવદ્ ગીતા | દિવસની અંતિમ ક્વિઝ",
              body: "દિવસ પૂર્ણ કરતાં પહેલાં ગીતા ક્વિઝ રમો અને તમારો આજનો સ્કોર નોંધાવો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
        },
      };

      let timeOfDay = "night";
      if (istHours >= 5 && istHours < 12) timeOfDay = "morning";
      else if (istHours >= 12 && istHours < 16) timeOfDay = "afternoon";
      else if (istHours >= 16 && istHours < 20) timeOfDay = "evening";

      let sentCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let lastSentPayload = null;

      for (const sub of subscribers) {
        // Automatically reset reminder count if last reminder was sent before today
        let currentReminderCount = sub.reminderCount || 0;
        if (
          sub.lastReminderSentDate &&
          new Date(sub.lastReminderSentDate) < startOfTodayIST
        ) {
          currentReminderCount = 0;
          await Subscription.updateOne(
            { _id: sub._id },
            { $set: { reminderCount: 0 } }
          );
        }

        // Cap max reminders per day to 5 (8 AM, 12 PM, 4 PM, 8 PM, 10 PM)
        if (currentReminderCount >= 5 && !customMsg) {
          skippedCount++;
          continue;
        }

        // 1. Check if subscriber has read a shloka today
        let hasReadShlokToday = false;
        if (sub.lastShlokReadDate && new Date(sub.lastShlokReadDate) >= startOfTodayIST) {
          hasReadShlokToday = true;
        }

        let userDoc = null;
        if (sub.userId && !hasReadShlokToday) {
          try {
            userDoc = await User.findById(sub.userId)
              .select("readingProgress")
              .lean();
            if (userDoc?.readingProgress) {
              if (userDoc.readingProgress.lastReadDate === todayStringIST) {
                hasReadShlokToday = true;
              } else if (
                Array.isArray(userDoc.readingProgress.readShlokas) &&
                userDoc.readingProgress.readShlokas.some(
                  (s) => s.readAt && new Date(s.readAt) >= startOfTodayIST
                )
              ) {
                hasReadShlokToday = true;
              }
            }
          } catch (e) {
            // ignore
          }
        }

        // 2. Check if subscriber has played a quiz today
        let hasPlayedQuizToday = false;
        if (sub.lastQuizPlayedDate && new Date(sub.lastQuizPlayedDate) >= startOfTodayIST) {
          hasPlayedQuizToday = true;
        }

        if (sub.userId && !hasPlayedQuizToday) {
          try {
            const quizExists = await QuizResult.exists({
              user: sub.userId,
              createdAt: { $gte: startOfTodayIST },
            });
            if (quizExists) {
              hasPlayedQuizToday = true;
            }
          } catch (e) {
            // ignore
          }
        }

        // 3. If user completed BOTH tasks today: STOP reminders for today!
        if (hasReadShlokToday && hasPlayedQuizToday && !customMsg) {
          skippedCount++;
          continue;
        }

        // 4. Select the appropriate message
        let payload;
        if (customMsg) {
          payload = {
            title: customMsg.title,
            body: customMsg.body,
            url: customMsg.url || targetUrl,
            tag: "custom-notification",
          };
        } else {
          let poolKey = "neither";
          if (!hasReadShlokToday && hasPlayedQuizToday) {
            poolKey = "shlokPending";
          } else if (hasReadShlokToday && !hasPlayedQuizToday) {
            poolKey = "quizPending";
          } else {
            poolKey = "neither";
          }

          const slotOptions =
            messageTemplates[poolKey][timeOfDay] ||
            messageTemplates[poolKey]["morning"];
          const selected =
            slotOptions[Math.floor(Math.random() * slotOptions.length)];

          payload = {
            title: selected.title,
            body: selected.body,
            url: selected.url || targetUrl,
            tag: "daily-smart-reminder",
          };
        }

        lastSentPayload = payload;

        try {
          await sendPush(sub, payload);
          sentCount++;
          await Subscription.updateOne(
            { _id: sub._id },
            {
              $inc: { reminderCount: 1 },
              $set: { lastReminderSentDate: new Date() },
            }
          );
        } catch (err) {
          failedCount++;
        }
      }

      console.log(
        `Smart Reminders completed: ${sentCount} sent, ${skippedCount} skipped (goals completed or max limit), ${failedCount} failed.`
      );

      return {
        success: true,
        total: subscribers.length,
        sent: sentCount,
        skipped: skippedCount,
        failed: failedCount,
        reminder: lastSentPayload,
      };
    } catch (err) {
      console.error("Send daily reminder error:", err);
      return { success: false, error: err.message };
    }
  },

  // Notify Admin when a new user registers
  notifyAdminNewUser: async (newUser) => {
    try {
      const admins = await Subscription.find({ role: "admin" });
      if (!admins || admins.length === 0) return;

      const userName = newUser.name || "નવો ભક્ત";
      const userEmail = newUser.email || "";

      const payload = {
        title: "નવો વપરાશકર્તા જોડાયો",
        body: `${userName} (${userEmail}) એ ભગવદ્ ગીતા વેબસાઇટ પર સફળતાપૂર્વક રજીસ્ટ્રેશન કર્યું.`,
        url: process.env.ADMIN_DASHBOARD_URL || "https://bhagavad-gita-website-rk1v.vercel.app/admin",
        tag: "new-user-registered",
      };

      console.log(`Notifying ${admins.length} admins about new user registration...`);
      for (const admin of admins) {
        await sendPush(admin, payload);
      }
    } catch (err) {
      console.error("Notify admin error:", err);
    }
  },

  // Midnight reset (00:00)
  resetDailyCounters: async () => {
    try {
      console.log("Resetting daily notification counters at midnight...");
      await Subscription.updateMany({}, { $set: { reminderCount: 0 } });
    } catch (err) {
      console.error("Reset daily counters error:", err);
    }
  },
};
