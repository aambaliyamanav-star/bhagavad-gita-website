const webpush = require("web-push");
const Subscription = require("../models/Subscription");

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
    console.error("❌ Failed to configure VAPID details:", err.message);
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
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      // Subscription expired or unsubscribed on browser side
      console.log("🧹 Removing expired subscription:", subscription.endpoint);
      await Subscription.deleteOne({ endpoint: subscription.endpoint });
    } else {
      console.error("❌ Push error:", err.message || err);
    }
  }
}

module.exports = {
  // GET /api/notifications/public-key
  getPublicKey: (req, res) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
    return res.json({ publicKey });
  },

  // POST /api/notifications/subscribe
  subscribe: async (req, res) => {
    try {
      const { endpoint, keys, role, userId } = req.body;
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ error: "અમાન્ય subscription ડેટા" });
      }

      const updateData = {
        endpoint,
        keys,
        role: role || "user",
      };
      if (userId) {
        updateData.userId = userId;
      }

      const sub = await Subscription.findOneAndUpdate(
        { endpoint },
        { $set: updateData },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, subscription: sub });
    } catch (err) {
      console.error("❌ Subscribe error:", err);
      return res.status(500).json({ error: "સબ્સ્ક્રિપ્શન સાચવવામાં સમસ્યા આવી" });
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
      return res.json({ success: true, message: "સફળતાપૂર્વક unsubscribe થયું" });
    } catch (err) {
      console.error("❌ Unsubscribe error:", err);
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
          reminderCount: 0,
        },
      });

      return res.json({
        success: true,
        message: "વેબસાઇટ મુલાકાત સફળતાપૂર્વક નોંધાઈ ગઈ છે. આજના બાકીના નોટિફિકેશન બંધ રહેશે.",
      });
    } catch (err) {
      console.error("❌ Record open error:", err);
      return res.status(500).json({ error: "મુલાકાત નોંધવામાં સમસ્યા આવી" });
    }
  },

  // Dynamic engaging notification messages pool without shloks or raw translations
  sendDailyReminder: async (customMsg = null) => {
    try {
      // Find all active subscribers (Both users and admins so dev/admin also gets notifications!)
      const subscribers = await Subscription.find({});

      if (!subscribers || subscribers.length === 0) {
        console.log("ℹ️ No subscribers found for daily reminder.");
        return { success: true, count: 0, sent: 0 };
      }

      // Determine time-appropriate message based on current Indian Standard Time (IST = UTC + 5:30)
      const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
      const istHours = istDate.getUTCHours();

      const messagePools = {
        morning: [
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | Daily Streak",
            body: "તમારી દૈનિક સ્ટ્રીક જાળવી રાખવા માટે દિવસની શરૂઆતમાં ૧ શ્લોક વાંચો.",
          },
          {
            title: "ભગવદ્ ગીતા | પ્રભાત પ્રેરણા",
            body: "આજના દિવસની શુભ શરૂઆત સકારાત્મક વિચાર અને સ્પષ્ટ માર્ગદર્શન સાથે કરો.",
          },
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | દૈનિક લક્ષ્ય",
            body: "તમારું આજના દિવસનું પ્રથમ વાંચન લક્ષ્ય પૂર્ણ કરવા માટે આગળ વધો.",
          },
          {
            title: "ભગવદ્ ગીતા | એકાગ્રતા અને કર્મ",
            body: "આજના કાર્યમાં સફળતા અને સ્થિરતા મેળવવા ગીતાજીનું માર્ગદર્શન મેળવો.",
          },
        ],
        afternoon: [
          {
            title: "ભગવદ્ ગીતા | દૈનિક વિરામ",
            body: "દિવસની વ્યસ્તતા વચ્ચે ૨ મિનિટ મનને શાંત કરો અને વાંચન પ્રગતિ આગળ વધારો.",
          },
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | ક્વિઝ ચેલેન્જ",
            body: "આજે નવી ક્વિઝ રમીને તમારા જ્ઞાનની કસોટી કરો અને પોઈન્ટ્સ મેળવો.",
          },
          {
            title: "ભગવદ્ ગીતા | મનની શાંતિ",
            body: "કોઈપણ મૂંઝવણ કે તણાવ હોય તો ગીતા AI સાથે માર્ગદર્શન મેળવો અથવા નવો શ્લોક વાંચો.",
          },
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | દૈનિક પ્રગતિ",
            body: "તમારી વાંચન સફર ચાલુ રાખો અને આજના ટાર્ગેટ તરફ આગળ વધો.",
          },
        ],
        evening: [
          {
            title: "ભગવદ્ ગીતા | Daily Streak રિમાઇન્ડર",
            body: "ધ્યાન રાખો! તમારી આજની વાંચન સ્ટ્રીક તૂટી ન જાય તે માટે ૧ શ્લોક પૂર્ણ કરો.",
          },
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | સંધ્યા ચિંતન",
            body: "દિવસના થાક પછી આંતરિક શાંતિ અને માનસિક સ્થિરતા માટે થોડો સમય ફાળવો.",
          },
          {
            title: "ભગવદ્ ગીતા | લક્ષ્ય પૂર્તિ",
            body: "તમારો આજનો દૈનિક વાંચન ટાર્ગેટ હજુ બાકી છે, હમણાં જ પૂર્ણ કરો.",
          },
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | આત્મ-વિશ્વાસ",
            body: "સાચા નિર્ણયો લેવા અને મનોબળ મજબૂત બનાવવા ગીતાજીનું માર્ગદર્શન વાંચો.",
          },
        ],
        night: [
          {
            title: "ભગવદ્ ગીતા | દિવસનું સમાપન",
            body: "આજનો દિવસ પૂર્ણ કરતાં પહેલાં તમારી Daily Streak સુરક્ષિત કરો.",
          },
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | રાત્રિ શાંતિ",
            body: "દિવસના તમામ વિચારો શાંત કરીને સંતોષપૂર્વક ઊંઘ મેળવવા માટે ગીતા વાંચો.",
          },
          {
            title: "ભગવદ્ ગીતા | આત્મ-મંથન",
            body: "આજના દિવસનું મૂલ્યાંકન કરો અને આવતીકાલ માટે નવી ઊર્જા મેળવો.",
          },
          {
            title: "શ્રીમદ્ ભગવદ્ ગીતા | દૈનિક સ્ટ્રીક",
            body: "આજનો દિવસ ગીતા વાંચ્યા વિના પૂરો ન થવા દો. હમણાં જ વાંચન પૂર્ણ કરો.",
          },
        ],
      };

      let currentSlot = "night";
      if (istHours >= 5 && istHours < 12) currentSlot = "morning";
      else if (istHours >= 12 && istHours < 16) currentSlot = "afternoon";
      else if (istHours >= 16 && istHours < 20) currentSlot = "evening";

      const slotPool = messagePools[currentSlot];
      // Randomly select one message from the appropriate slot to ensure variety
      const selectedMessage = slotPool[Math.floor(Math.random() * slotPool.length)];

      const reminder = customMsg || selectedMessage;
      const targetUrl =
        process.env.SITE_URL || "https://bhagavad-gita-website-rk1v.vercel.app";

      const payload = {
        title: reminder.title,
        body: reminder.body,
        url: targetUrl,
        tag: "daily-shloka-reminder",
      };

      console.log(`📢 Sending reminder to ${subscribers.length} subscribers...`);
      let sentCount = 0;
      let failedCount = 0;

      for (const sub of subscribers) {
        try {
          await sendPush(sub, payload);
          sentCount++;
          await Subscription.updateOne(
            { _id: sub._id },
            { $inc: { reminderCount: 1 } }
          );
        } catch {
          failedCount++;
        }
      }

      return {
        success: true,
        total: subscribers.length,
        sent: sentCount,
        failed: failedCount,
        reminder,
      };
    } catch (err) {
      console.error("❌ Send daily reminder error:", err);
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

      console.log(`📢 Notifying ${admins.length} admins about new user registration...`);
      for (const admin of admins) {
        await sendPush(admin, payload);
      }
    } catch (err) {
      console.error("❌ Notify admin error:", err);
    }
  },

  // Midnight reset (00:00)
  resetDailyCounters: async () => {
    try {
      console.log("🔄 Resetting daily notification counters at midnight...");
      await Subscription.updateMany({}, { $set: { reminderCount: 0 } });
    } catch (err) {
      console.error("❌ Reset daily counters error:", err);
    }
  },
};

