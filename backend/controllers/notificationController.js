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
      console.log(`Expired/Uninstalled subscription ${subscription._id}, removing from DB...`);
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

      // STRICT: App Only!
      if (!isApp) {
        return res.status(403).json({ error: "નોટિફિકેશન માત્ર એપ માટે જ ઉપલબ્ધ છે." });
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
          isApp: true,
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
        const siteUrl = process.env.SITE_URL || "https://gita-gyan-m.vercel.app";
        const welcomePayload = {
          title: "શ્રીમદ્ ભગવદ્ ગીતા APP",
          body: "ગીતા અધ્યાય વાંચન અને ક્વિઝ માટે રિમાઇન્ડર સફળતાપૂર્વક સક્રિય થઈ ગયા છે. 🙏",
          icon: `${siteUrl}/icons/icon-192x192.png`,
          badge: `${siteUrl}/icons/icon-192x192.png`,
          url: `${siteUrl}/chapters`,
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

  // =========================================================================
  // SEND DAILY REMINDER (EVERY 3 HOURS THROUGHOUT THE DAY: 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM IST)
  // Reminders ONLY encourage:
  // 1) Shloka / Chapter reading (URL: /chapters)
  // 2) Playing the Quiz (URL: /quiz-category)
  // NO actual shlokas or verses are inside notifications!
  // App Only! Web subscriptions are strictly excluded.
  // =========================================================================
  sendDailyReminder: async (customMsg = null, force = false) => {
    try {
      // 1. STRICT: Only subscribers from installed App!
      const subscribers = await Subscription.find({ isApp: true });
      if (!subscribers || subscribers.length === 0) {
        console.log("No installed app push notification subscribers found.");
        return { success: true, message: "No app subscribers found", sent: 0 };
      }

      const now = new Date();
      // Calculate current IST time (UTC + 5:30)
      const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const istHours = istTime.getUTCHours();
      const istMinutes = istTime.getUTCMinutes();

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
      const targetUrl = process.env.SITE_URL || "https://gita-gyan-m.vercel.app";

      // 2. Identify 3-hour time slot
      // 06:00 AM, 09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM, 09:00 PM IST
      let slotKey = "slot_6am";
      let primaryType = "shlokReading"; // alternates between reading and quiz

      if (istHours >= 5 && istHours < 8) {
        slotKey = "slot_6am";  // 6:00 AM IST
        primaryType = "shlokReading";
      } else if (istHours >= 8 && istHours < 11) {
        slotKey = "slot_9am";  // 9:00 AM IST
        primaryType = "quizPlaying";
      } else if (istHours >= 11 && istHours < 14) {
        slotKey = "slot_12pm"; // 12:00 PM IST
        primaryType = "shlokReading";
      } else if (istHours >= 14 && istHours < 17) {
        slotKey = "slot_3pm";  // 3:00 PM IST
        primaryType = "quizPlaying";
      } else if (istHours >= 17 && istHours < 20) {
        slotKey = "slot_6pm";  // 6:00 PM IST
        primaryType = "shlokReading";
      } else if (istHours >= 20 && istHours < 23) {
        slotKey = "slot_9pm";  // 9:00 PM IST
        primaryType = "quizPlaying";
      } else {
        // Deep sleep hours (11:00 PM - 5:00 AM IST) - Do not disturb!
        if (!force && !customMsg) {
          console.log(`🌙 [IST ${istHours}:${istMinutes}] Night sleep hours (11 PM - 5 AM). Skipping notifications.`);
          return { success: true, message: "Night sleep hours - skipped", sent: 0 };
        }
        slotKey = "slot_9pm";
        primaryType = "quizPlaying";
      }

      // 3. Message Templates: Focused strictly on Reading Shlokas & Playing Quiz (NO raw shlokas)
      const messageTemplates = {
        // SHLOKA & CHAPTER READING REMINDERS
        shlokReading: {
          slot_6am: [
            {
              title: "🌅 શ્રીમદ્ ભગવદ્ ગીતા | પ્રભાત વાંચન",
              body: "આજના પવિત્ર દિવસની શુભ શરૂઆત ગીતાજીના અધ્યાય વાંચનથી કરો. મનને શાંતિ મળશે.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "☀️ શુભ સવાર | દૈનિક ગીતા વાંચન",
              body: "આજનો ગીતા અધ્યાય વાંચવાનો સમય થઈ ગયો છે. એપ ખોલીને અધ્યાય વાંચો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          slot_9am: [
            {
              title: "📖 સવારનું ગીતા વાંચન | ભગવદ્ ગીતા",
              body: "દિવસના કાર્યો શરૂ કરતાં પહેલાં ગીતાજીનો એક અધ્યાય વાંચી સકારાત્મક ઉર્જા મેળવો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "🌸 ગીતા અધ્યાય વાંચન સ્મરણ",
              body: "મનની એકાગ્રતા અને સદ્બુદ્ધિ માટે આજનો પવિત્ર ગીતા અધ્યાય વાંચો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          slot_12pm: [
            {
              title: "🌞 મધ્યાહ્ન શાંતિ | શ્રીમદ્ ભગવદ્ ગીતા",
              body: "દોડધામ ભરેલા દિવસ વચ્ચે થોડો સમય કાઢીને ગીતાજીનો અધ્યાય વાંચો અને શાંતિ અનુભવો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "📖 બપોરનું ગીતા અધ્યાય વાંચન",
              body: "આજનો ગીતા અધ્યાય વાંચી તમારા મનને સ્થિર અને તણાવમુક્ત બનાવો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          slot_3pm: [
            {
              title: "🌿 અપરાહ્ન માર્ગદર્શન | ભગવદ્ ગીતા",
              body: "જીવનમાં સાચો માર્ગ અને પ્રેરણા મેળવવા માટે ગીતાજીના અધ્યાયનું વાંચન કરો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "✨ ગીતા વાંચન પ્રેરણા",
              body: "થોડી ક્ષણો ફાળવીને ગીતાજીનો અધ્યાય વાંચો અને આધ્યાત્મિક જ્ઞાન પ્રાપ્ત કરો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          slot_6pm: [
            {
              title: "🌆 સંધ્યા સમય | શ્રીમદ્ ભગવદ્ ગીતા વાંચન",
              body: "દિવસભરના પરિશ્રમ પછી મનને પરમ શાંતિ આપવા ગીતાજીના પવિત્ર અધ્યાયનું વાંચન કરો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "🕉️ સાંજનું ગીતા વાંચન સ્મરણ",
              body: "સંધ્યાકાળે ગીતાજીનો અધ્યાય વાંચી દિવસને સાર્થક અને પવિત્ર બનાવો.",
              url: `${targetUrl}/chapters`,
            },
          ],
          slot_9pm: [
            {
              title: "🌟 રાત્રિ મનન | ભગવદ્ ગીતા પાઠ",
              body: "સુતા પહેલાં મનની પરમ શાંતિ માટે ગીતાજીનો એક અધ્યાય વાંચી આજના દિવસને પૂર્ણ કરો.",
              url: `${targetUrl}/chapters`,
            },
            {
              title: "🌙 શાંત નિદ્રા માટે ગીતા વાંચન",
              body: "આજનું અધ્યાય વાંચન પૂરું કરી શાંત અને સકારાત્મક ચિત્તે નિદ્રાધીન થાઓ.",
              url: `${targetUrl}/chapters`,
            },
          ],
        },

        // QUIZ PLAYING REMINDERS
        quizPlaying: {
          slot_6am: [
            {
              title: "🧠 પ્રભાત ગીતા ક્વિઝ ચેલેન્જ",
              body: "આજના પવિત્ર દિવસની શરૂઆત ગીતા ક્વિઝ રમીને તમારા જ્ઞાનની કસોટી સાથે કરો!",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          slot_9am: [
            {
              title: "🎯 ગીતા જ્ઞાન ક્વિઝ | નવી ચેલેન્જ",
              body: "શું તમે આજના પ્રશ્નોના સાચા ઉત્તર આપી શકો છો? હમણાં જ ક્વિઝ રમીને સ્કોર વધારો!",
              url: `${targetUrl}/quiz-category`,
            },
            {
              title: "⚡ સવારની ગીતા ક્વિઝ સ્પર્ધા",
              body: "આજે નવી ગીતા ક્વિઝ રમો અને તમારા આધ્યાત્મિક જ્ઞાનને ચકાસો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          slot_12pm: [
            {
              title: "🏆 બપોરની ગીતા ક્વિઝ રમો",
              body: "થોડો સમય ફાળવીને ગીતા ક્વિઝ રમો અને તમારા જ્ઞાનને વધુ સમૃદ્ધ બનાવો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          slot_3pm: [
            {
              title: "⚡ ગીતા ક્વિઝ ચેલેન્જ | આજનો સ્કોર",
              body: "ગીતા ક્વિઝ રમીને નવા બેજ અને પોઈન્ટ્સ મેળવો. હમણાં જ ક્વિઝ શરૂ કરો!",
              url: `${targetUrl}/quiz-category`,
            },
            {
              title: "🧠 અપરાહ્ન ગીતા ક્વિઝ",
              body: "આજના ગીતા પ્રશ્નોના સાચા જવાબ આપીને તમારા સ્કોરને વધુ બહેતર બનાવો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          slot_6pm: [
            {
              title: "🌆 સાંજની ક્વિઝ સ્પર્ધા | ગીતા જ્ઞાન",
              body: "સાંજનો સમય ગીતા ક્વિઝ રમવા માટે ઉત્તમ છે! પ્રશ્નોના સાચા જવાબ આપી જ્ઞાન ચકાસો.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
          slot_9pm: [
            {
              title: "🌙 આજની અંતિમ ગીતા ક્વિઝ",
              body: "સુતા પહેલાં ગીતા ક્વિઝ રમો અને આજનું તમારું ક્વિઝ લક્ષ્ય પૂર્ણ કરો!",
              url: `${targetUrl}/quiz-category`,
            },
            {
              title: "🏆 રાત્રિ ગીતા ક્વિઝ ચેલેન્જ",
              body: "દિવસ પૂર્ણ કરતાં પહેલાં ગીતા ક્વિઝ રમીને તમારા આજના સ્કોરને ટોપ પર લઈ જાઓ.",
              url: `${targetUrl}/quiz-category`,
            },
          ],
        },
      };

      let sentCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let lastSentPayload = null;

      const TWO_AND_HALF_HOURS_MS = 2.5 * 60 * 60 * 1000;

      for (const sub of subscribers) {
        // STRICT: 2.5 hours cooldown prevents duplicate notifications on the same device
        if (
          !customMsg &&
          !force &&
          sub.lastReminderSentDate &&
          Date.now() - new Date(sub.lastReminderSentDate).getTime() < TWO_AND_HALF_HOURS_MS
        ) {
          skippedCount++;
          continue;
        }

        // Check if user has read shlokas or played quiz today
        let hasReadShlokToday = false;
        if (sub.lastShlokReadDate && new Date(sub.lastShlokReadDate) >= startOfTodayIST) {
          hasReadShlokToday = true;
        }

        if (sub.userId && !hasReadShlokToday) {
          try {
            const userDoc = await User.findById(sub.userId).select("readingProgress").lean();
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
          } catch (e) {}
        }

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
          } catch (e) {}
        }

        // Choose message type intelligently:
        // - If haven't read shloka today: prioritize shlokReading
        // - If haven't played quiz today: prioritize quizPlaying
        // - Otherwise: alternate based on primaryType of the 3-hour slot!
        let chosenType = primaryType;
        if (!hasReadShlokToday && hasPlayedQuizToday) {
          chosenType = "shlokReading";
        } else if (hasReadShlokToday && !hasPlayedQuizToday) {
          chosenType = "quizPlaying";
        }

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
          const typeOptions =
            messageTemplates[chosenType][slotKey] ||
            messageTemplates[chosenType]["slot_6am"];
          const selected =
            typeOptions[Math.floor(Math.random() * typeOptions.length)];

          payload = {
            title: selected.title,
            body: selected.body,
            icon: `${targetUrl}/icons/icon-192x192.png`,
            badge: `${targetUrl}/icons/icon-192x192.png`,
            url: selected.url || targetUrl,
            tag: `gita-${chosenType}-${Date.now()}`,
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
        `🔔 [3-Hour Reminder IST ${istHours}:${istMinutes} - ${slotKey}] Sent: ${sentCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`
      );

      return {
        success: true,
        slot: slotKey,
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

      const siteUrl = process.env.SITE_URL || "https://gita-gyan-m.vercel.app";
      const payload = {
        title: "શ્રીમદ્ ભગવદ્ ગીતા APP | ટેસ્ટ નોટિફિકેશન",
        body: "તમારા મોબાઈલમાં ગીતા એપ નોટિફિકેશન સફળતાપૂર્વક કામ કરી રહ્યું છે! 🙏",
        icon: `${siteUrl}/icons/icon-192x192.png`,
        badge: `${siteUrl}/icons/icon-192x192.png`,
        url: `${siteUrl}/chapters`,
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
      // Clean up any non-app subscriptions
      await Subscription.deleteMany({ isApp: false });
    } catch (err) {
      console.error("Reset daily counters error:", err);
    }
  },
};
