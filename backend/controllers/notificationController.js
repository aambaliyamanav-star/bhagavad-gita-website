const webpush = require("web-push");
const Subscription = require("../models/Subscription");
const AppInstallation = require("../models/AppInstallation");
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

// Helper to send push with high priority and 24-hr TTL
async function sendPush(subscription, payload) {
  if (!ensureVapidConfig()) return;

  const pushOptions = {
    TTL: 24 * 60 * 60, // 24 hours: delivers when device reconnects
    urgency: "high",   // Wakes up device in doze mode
    topic: "gita-reminder",
  };

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      pushOptions
    );
    return true;
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log(`Expired/Uninstalled subscription ${subscription._id}, removing from DB and updating app analytics...`);
      await Subscription.deleteOne({ _id: subscription._id });
      try {
        await AppInstallation.updateMany(
          { notificationEndpoint: subscription.endpoint },
          { $set: { isInstalled: false, uninstalledAt: new Date(), hasNotificationEnabled: false } }
        );
      } catch (appErr) {
        console.warn("Could not mark AppInstallation as uninstalled:", appErr.message);
      }
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

  // POST /api/notifications/subscribe (Called ONLY from Installed App)
  subscribe: async (req, res) => {
    try {
      const { endpoint, keys, role, userId, isApp = true, deviceId: clientDeviceId } = req.body;
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ error: "અમાન્ય સબસ્ક્રિપ્શન વિગતો." });
      }

      const userRole = role === "admin" ? "admin" : "user";
      const validUserId = userId || null;

      const crypto = require("crypto");
      const fallbackDeviceId =
        "dev_sub_" + crypto.createHash("md5").update(endpoint).digest("hex").substring(0, 16);
      const targetDeviceId = clientDeviceId || fallbackDeviceId;

      const existingSub = await Subscription.findOne({ endpoint });
      const isBrandNew = !existingSub;

      const subscription = await Subscription.findOneAndUpdate(
        { endpoint },
        {
          endpoint,
          keys,
          role: userRole,
          userId: validUserId,
          deviceId: targetDeviceId,
          isApp: Boolean(isApp),
          lastOpenedDate: new Date(),
          reminderCount: 0,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Auto-register/sync in AppInstallation analytics
      try {
        let userName = null;
        let userEmail = null;
        if (validUserId) {
          const u = await User.findById(validUserId).select("name email").lean();
          if (u) {
            userName = u.name;
            userEmail = u.email;
          }
        }
        await AppInstallation.findOneAndUpdate(
          {
            $or: [{ notificationEndpoint: endpoint }, { deviceId: targetDeviceId }],
          },
          {
            $set: {
              deviceId: targetDeviceId,
              userId: validUserId,
              userName,
              userEmail,
              platform: "Android",
              browser: "Chrome",
              device: "Mobile",
              lastOpenedAt: new Date(),
              hasNotificationEnabled: true,
              notificationEndpoint: endpoint,
              isInstalled: true,
              uninstalledAt: null,
            },
            $setOnInsert: {
              installedAt: new Date(),
            },
            $inc: { openCount: 1 },
          },
          { upsert: true, new: true }
        );
      } catch (appErr) {
        console.warn("AppInstallation auto-sync error in subscribe:", appErr.message);
      }

      // Send initial welcome notification ONLY on first-time subscription
      if (isBrandNew) {
        const siteUrl = process.env.SITE_URL || "https://bhagavad-gita-website-rk1v.vercel.app";
        const welcomePayload = {
          title: "શ્રીમદ્ ભગવદ્ ગીતા APP | સ્વાગત છે",
          body: "દૈનિક ૫ પવિત્ર ગીતા શ્લોક અને પ્રેરણાદાયી નોટિફિકેશન સફળતાપૂર્વક સક્રિય થઈ ગયા છે.",
          icon: `${siteUrl}/icons/icon-192x192.png`,
          badge: `${siteUrl}/icons/icon-192x192.png`,
          url: siteUrl,
          tag: "welcome-notification",
        };

        try {
          await sendPush(subscription, welcomePayload);
        } catch (err) {
          console.warn("Welcome push notification delivery warning:", err.message);
        }
      }

      return res.status(201).json({
        success: true,
        message: "એપ નોટિફિકેશન સબસ્ક્રિપ્શન સફળતાપૂર્વક નોંધાઈ ગયું છે.",
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
  recordOpen: async (req, res) => {
    try {
      const { endpoint, userId } = req.body;
      if (!endpoint && !userId) {
        return res.status(400).json({ error: "Endpoint અથવા UserId જરૂરી છે" });
      }

      const updateData = { lastOpenedDate: new Date() };
      if (userId) {
        await Subscription.updateMany({ userId }, { $set: updateData });
      }
      if (endpoint) {
        await Subscription.updateOne({ endpoint }, { $set: updateData });
      }

      return res.json({ success: true, message: "App open recorded" });
    } catch (err) {
      console.error("Record open error:", err);
      return res.status(500).json({ error: "Record open failed" });
    }
  },

  // POST /api/notifications/record-action (shlok_read or quiz_played)
  recordAction: async (req, res) => {
    try {
      const { endpoint, userId, action } = req.body;
      const updateData = { lastOpenedDate: new Date() };

      if (action === "shlok_read") {
        updateData.lastShlokReadDate = new Date();
      } else if (action === "quiz_played") {
        updateData.lastQuizPlayedDate = new Date();
      }

      if (userId) {
        await Subscription.updateMany({ userId }, { $set: updateData });
      }
      if (endpoint) {
        await Subscription.updateOne({ endpoint }, { $set: updateData });
      }

      return res.json({ success: true, message: `Action ${action} recorded` });
    } catch (err) {
      console.error("Record action error:", err);
      return res.status(500).json({ error: "Record action failed" });
    }
  },

  // Send Daily Reminder (5 times a day: Morning 8 AM, Noon 12 PM, Afternoon 4 PM, Evening 7 PM, Night 10 PM IST)
  sendDailyReminder: async (customMsg = null, force = false) => {
    try {
      const subscribers = await Subscription.find({});
      if (!subscribers || subscribers.length === 0) {
        console.log("No push notification subscribers registered yet.");
        return { success: true, message: "No subscribers found", sent: 0 };
      }

      const now = new Date();
      // Calculate current IST time
      const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const istHours = istTime.getUTCHours();

      const startOfTodayIST = new Date(
        Date.UTC(
          istTime.getUTCFullYear(),
          istTime.getUTCMonth(),
          istTime.getUTCDate(),
          0,
          0,
          0
        ) - 5.5 * 60 * 60 * 1000
      );
      const todayStringIST = istTime.toISOString().slice(0, 10);

      const targetUrl = process.env.SITE_URL || "https://bhagavad-gita-website-rk1v.vercel.app";

      // 5-Slot Inspiration Templates (Morning, Noon, Afternoon, Evening, Night)
      const messageTemplates = {
        neither: {
          morning: [
            {
              title: "🌅 શ્રીમદ્ ભગવદ્ ગીતા | પ્રભાત ચિંતન",
              body: "કર્મણ્યેવાધિકારસ્તે મા ફલેષુ કદાચન। આજના શુભ દિવસની શરૂઆત દિવ્ય શ્લોક વાંચનથી કરો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "☀️ પ્રભાત વંદના | ભગવદ્ ગીતા",
              body: "આજના દિવસનું મંગલ ગીતા વાંચન બાકી છે. મનની શાંતિ અને સદ્બુદ્ધિ માટે એક શ્લોક વાંચો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          noon: [
            {
              title: "🌞 મધ્યાહ્ન પ્રેરણા | શ્રીમદ્ ભગવદ્ ગીતા",
              body: "દોડધામ ભરેલા દિવસ વચ્ચે મનને સ્થિર કરો. ભગવાન શ્રીકૃષ્ણનો આજનો દિવ્ય સંદેશ વાંચો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "📖 ગીતા જ્ઞાન યોગ | મધ્યાહ્ન ચિંતન",
              body: "શ્રદ્ધાવાન લભતે જ્ઞાનમ્। આજના દિવસનું ગીતા વાંચન કરી તમારું દૈનિક લક્ષ્ય પૂર્ણ કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          afternoon: [
            {
              title: "🌿 અપરાહ્ન માર્ગદર્શન | ભગવદ્ ગીતા",
              body: "જ્યારે પણ મન અશાંત થાય, ગીતાના શબ્દો જીવનનો સાચો માર્ગ બતાવે છે. વાંચો આજનો શ્લોક.",
              url: `${targetUrl}/chapters`,
            },
          ],
          evening: [
            {
              title: "🌆 સંધ્યા ધ્યાન | શ્રીમદ્ ભગવદ્ ગીતા",
              body: "દિવસભરના પરિશ્રમ પછી મનને પરમ શાંતિ આપો. આજનો પવિત્ર શ્લોક અને તેનો અર્થ વાંચો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          night: [
            {
              title: "🌙 રાત્રિ મનન | ભગવદ્ ગીતા",
              body: "સુતા પહેલાં અંતરમનની શાંતિ માટે એક શ્લોક વાંચો અને આજની ગીતા ક્વિઝ પૂર્ણ કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
        },
        shlokPending: {
          morning: [
            {
              title: "🌅 શ્રીમદ્ ભગવદ્ ગીતા | આજનો શ્લોક બાકી છે",
              body: "આપનું ક્વિઝ લક્ષ્ય પૂરું થયું છે! હવે આજનો ૧ પવિત્ર શ્લોક વાંચીને દૈનિક ધ્યેય સિદ્ધ કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          noon: [
            {
              title: "📖 ભગવદ્ ગીતા | શ્લોક વાંચન સ્મરણ",
              body: "બપોરના સમયે ગીતાનો એક શ્લોક વાંચીને દિવસને સાર્થક બનાવો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          afternoon: [
            {
              title: "🌿 દૈનિક ગીતા વાંચન | અપરાહ્ન સંદેશ",
              body: "આજનું શ્લોક વાંચન હજી બાકી છે. થોડો સમય કાઢીને આધ્યાત્મિક જ્ઞાન મેળવો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          evening: [
            {
              title: "🌆 સાંજનું ગીતા વાંચન",
              body: "સંધ્યાકાળે મનની એકાગ્રતા માટે આજનો શ્લોક અર્થ સહિત વાંચો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          night: [
            {
              title: "🌙 રાત્રિ ગીતા પાઠ",
              body: "આજનું શ્લોક વાંચન પૂરું કરી શાંત ચિત્તે નિદ્રાધીન થાઓ.",
              url: `${targetUrl}/chapters`,
            },
          ],
        },
        quizPending: {
          morning: [
            {
              title: "🧠 શ્રીમદ્ ભગવદ્ ગીતા | દૈનિક ક્વિઝ ચેલેન્જ",
              body: "આજનું શ્લોક વાંચન પૂર્ણ થયું છે! હવે દૈનિક ક્વિઝ રમીને તમારા જ્ઞાનની કસોટી કરો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          noon: [
            {
              title: "🎯 ભગવદ્ ગીતા | ક્વિઝ રમો",
              body: "ગીતા ક્વિઝ રમીને નવા બેજ અને પોઈન્ટ્સ અનલૉક કરો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          afternoon: [
            {
              title: "🏆 અપરાહ્ન ક્વિઝ | ભગવદ્ ગીતા",
              body: "આજના પ્રશ્નોના ઉત્તર આપીને ગીતા જ્ઞાન ચકાસો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          evening: [
            {
              title: "🌆 સાંજની ક્વિઝ સ્પર્ધા | ગીતા જ્ઞાન",
              body: "આજની દૈનિક ક્વિઝ હજુ બાકી છે! પ્રશ્નોના સાચા જવાબ આપી આગળ વધો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          night: [
            {
              title: "🌙 દિવસની અંતિમ ક્વિઝ | ભગવદ્ ગીતા",
              body: "દિવસ પૂર્ણ કરતાં પહેલાં ગીતા ક્વિઝ રમો અને તમારો આજનો સ્કોર નોંધાવો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
        },
      };

      // Determine 5-slot time of day
      let timeOfDay = "night";
      if (istHours >= 5 && istHours < 11) timeOfDay = "morning";      // 5:00 - 11:00 AM
      else if (istHours >= 11 && istHours < 15) timeOfDay = "noon";   // 11:00 AM - 3:00 PM
      else if (istHours >= 15 && istHours < 18) timeOfDay = "afternoon"; // 3:00 - 6:00 PM
      else if (istHours >= 18 && istHours < 21) timeOfDay = "evening";  // 6:00 - 9:00 PM
      else timeOfDay = "night";                                         // 9:00 PM - 5:00 AM

      let sentCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let lastSentPayload = null;

      for (const sub of subscribers) {
        // Prevent duplicate notifications within 35 minutes on the same device unless force
        if (
          !customMsg &&
          !force &&
          sub.lastReminderSentDate &&
          Date.now() - new Date(sub.lastReminderSentDate).getTime() < 35 * 60 * 1000
        ) {
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
        if (hasReadShlokToday && hasPlayedQuizToday && !customMsg && !force) {
          skippedCount++;
          continue;
        }

        // 4. Select the appropriate message
        let payload;
        if (customMsg) {
          payload = {
            title: customMsg.title,
            body: customMsg.body,
            icon: `${targetUrl}/icons/icon-192x192.png`,
            badge: `${targetUrl}/icons/icon-192x192.png`,
            url: customMsg.url || targetUrl,
            tag: `custom-${Date.now()}`,
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
            icon: `${targetUrl}/icons/icon-192x192.png`,
            badge: `${targetUrl}/icons/icon-192x192.png`,
            url: selected.url || targetUrl,
            tag: `gita-${poolKey}-${Date.now()}`,
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
        `Daily Gita Reminders (5/day): ${sentCount} sent, ${skippedCount} skipped, ${failedCount} failed.`
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

  // Test to specific endpoint
  sendTestToEndpoint: async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ error: "Endpoint required" });

      const sub = await Subscription.findOne({ endpoint });
      if (!sub) return res.status(404).json({ error: "Subscription not found" });

      const siteUrl = process.env.SITE_URL || "https://bhagavad-gita-website-rk1v.vercel.app";
      const payload = {
        title: "શ્રીમદ્ ભગવદ્ ગીતા APP | ટેસ્ટ નોટિફિકેશન",
        body: "તમારા મોબાઈલમાં ગીતા એપ નોટિફિકેશન સફળતાપૂર્વક કામ કરી રહ્યું છે! 🙏",
        icon: `${siteUrl}/icons/icon-192x192.png`,
        badge: `${siteUrl}/icons/icon-192x192.png`,
        url: siteUrl,
        tag: `test-${Date.now()}`,
      };

      await sendPush(sub, payload);
      return res.json({ success: true, message: "Test notification sent" });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
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
