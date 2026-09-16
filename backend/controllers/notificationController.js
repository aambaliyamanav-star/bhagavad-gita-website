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

  // Triggered by Cron (3-4 times a day: 8:00 AM, 1:00 PM, 5:00 PM, 8:30 PM)
  sendDailyReminder: async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // Find subscribers who have NOT opened the site today and received < 4 reminders today
      const eligibleUsers = await Subscription.find({
        role: "user",
        $or: [
          { lastOpenedDate: null },
          { lastOpenedDate: { $lt: startOfToday } },
        ],
        reminderCount: { $lt: 4 },
      });

      if (eligibleUsers.length === 0) {
        console.log("ℹ️ No eligible users for daily reminder at this time.");
        return;
      }

      const reminders = [
        {
          title: "🌸 શ્રીમદ્ ભગવદ્ ગીતા - પ્રભાત ચિંતન",
          body: "કર્મ કરો, ફળની ચિંતા ન કરો. આજનો દૈનિક શ્લોક વાંચવા અહીં ક્લિક કરો.",
        },
        {
          title: "✨ ભગવદ્ ગીતા - બપોરનું માર્ગદર્શન",
          body: "મન શાંત રાખો અને સાચા માર્ગે ચાલો. આજનો પવિત્ર શ્લોક વાંચો.",
        },
        {
          title: "🕉️ શ્રીમદ્ ભગવદ્ ગીતા - સંધ્યા સંદેશ",
          body: "શ્રદ્ધાવાન મનુષ્ય જ પરમ શાંતિ અને જ્ઞાન પ્રાપ્ત કરે છે. આજનો શ્લોક વાંચો.",
        },
        {
          title: "🌙 શ્રીમદ્ ભગવદ્ ગીતા - રાત્રિ વિચાર",
          body: "આજનો દિવસ પૂર્ણ કરતાં પહેલાં ગીતાનો એક પવિત્ર શ્લોક વાંચીને મન શાંત કરો.",
        },
      ];

      console.log(`📢 Sending daily reminder to ${eligibleUsers.length} subscribers...`);

      for (const sub of eligibleUsers) {
        const reminderIndex = Math.min(sub.reminderCount || 0, reminders.length - 1);
        const reminder = reminders[reminderIndex];

        const payload = {
          title: reminder.title,
          body: reminder.body,
          url: process.env.SITE_URL || "http://localhost:3000",
          tag: "daily-shloka-reminder",
        };

        await sendPush(sub, payload);

        // Increment reminder count
        await Subscription.updateOne(
          { _id: sub._id },
          { $inc: { reminderCount: 1 } }
        );
      }
    } catch (err) {
      console.error("❌ Send daily reminder error:", err);
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
        title: "🎉 નવો વપરાશકર્તા જોડાયો!",
        body: `${userName} (${userEmail}) એ ભગવદ્ ગીતા વેબસાઇટ પર સફળતાપૂર્વક રજીસ્ટ્રેશન કર્યું.`,
        url: process.env.ADMIN_DASHBOARD_URL || "http://localhost:3000/admin",
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

