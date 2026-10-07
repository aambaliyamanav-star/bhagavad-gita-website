const AppInstallation = require("../models/AppInstallation");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

// Helper to parse User Agent string
function parseUserAgent(uaString = "") {
  const ua = uaString.toLowerCase();

  let device = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = "Tablet";
  } else if (
    /mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|windows phone/i.test(ua) ||
    (/android/i.test(ua) && /mobi/i.test(ua))
  ) {
    device = "Mobile";
  }

  let browser = "Chrome";
  if (/edg([ea]|ios)?\//i.test(ua)) {
    browser = "Edge";
  } else if (/samsungbrowser/i.test(ua)) {
    browser = "Samsung Internet";
  } else if (/opr\/|opera/i.test(ua)) {
    browser = "Opera";
  } else if (/chrome|crios/i.test(ua)) {
    browser = "Chrome";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = "Safari";
  }

  let platform = "Android";
  if (/android/i.test(ua)) {
    platform = "Android";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    platform = "iOS";
  } else if (/windows/i.test(ua)) {
    platform = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    platform = "macOS";
  } else if (/linux/i.test(ua)) {
    platform = "Linux";
  }

  return { device, browser, platform };
}

// POST /api/app-analytics/record-install
const recordAppInstall = async (req, res) => {
  try {
    let data = req.body;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = {};
      }
    }
    const {
      deviceId,
      userId,
      platform: clientPlatform,
      browser: clientBrowser,
      device: clientDevice,
      hasNotification = false,
      notificationEndpoint = null,
      isNewInstall = false,
    } = data;

    if (!deviceId) {
      return res.status(400).json({ success: false, message: "deviceId is required" });
    }

    const ua = req.headers["user-agent"] || "";
    const parsed = parseUserAgent(ua);

    const platform = clientPlatform || parsed.platform;
    const browser = clientBrowser || parsed.browser;
    const device = clientDevice || parsed.device;

    const rawIp =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "Unknown";
    const ip = String(rawIp).split(",")[0].trim();

    let userName = null;
    let userEmail = null;
    if (userId) {
      try {
        const userDoc = await User.findById(userId).select("name email").lean();
        if (userDoc) {
          userName = userDoc.name || null;
          userEmail = userDoc.email || null;
        }
      } catch (e) {
        // ignore
      }
    }

    const existing = await AppInstallation.findOne({ deviceId });

    if (existing) {
      const updateData = {
        lastOpenedAt: new Date(),
        hasNotificationEnabled: Boolean(hasNotification),
        ip,
      };

      if (!existing.userId && userId) {
        updateData.userId = userId;
        updateData.userName = userName;
        updateData.userEmail = userEmail;
      }
      if (notificationEndpoint) {
        updateData.notificationEndpoint = notificationEndpoint;
      }
      if (platform) updateData.platform = platform;
      if (browser) updateData.browser = browser;

      const updated = await AppInstallation.findOneAndUpdate(
        { deviceId },
        {
          $set: updateData,
          $inc: { openCount: 1 },
        },
        { new: true }
      );

      return res.json({ success: true, message: "App activity updated", installation: updated });
    }

    const newInstallation = await AppInstallation.create({
      deviceId,
      userId: userId || null,
      userName,
      userEmail,
      device,
      platform,
      browser,
      installedAt: new Date(),
      lastOpenedAt: new Date(),
      openCount: 1,
      hasNotificationEnabled: Boolean(hasNotification),
      notificationEndpoint: notificationEndpoint || null,
      ip,
    });

    return res.status(201).json({
      success: true,
      message: "App installation registered successfully! 📱",
      installation: newInstallation,
    });
  } catch (error) {
    console.error("Record App Install Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/app-analytics/stats (Admin only)
const getAppStats = async (req, res) => {
  try {
    // Auto-sync any push subscriptions with isApp: true into AppInstallation
    try {
      const appSubs = await Subscription.find({
        $or: [{ isApp: true }, { isApp: { $exists: false } }, { isApp: null }],
      }).lean();
      for (const sub of appSubs) {
        const subDeviceId = "dev_sub_" + Buffer.from(sub.endpoint).toString("hex").substring(0, 16);
        const existing = await AppInstallation.findOne({
          $or: [
            { notificationEndpoint: sub.endpoint },
            { deviceId: subDeviceId },
          ],
        });
        if (!existing) {
          let userName = null;
          let userEmail = null;
          if (sub.userId) {
            try {
              const u = await User.findById(sub.userId).select("name email").lean();
              if (u) {
                userName = u.name;
                userEmail = u.email;
              }
            } catch (e) {}
          }
          await AppInstallation.create({
            deviceId: subDeviceId,
            userId: sub.userId || null,
            userName,
            userEmail,
            platform: "Android",
            browser: "Chrome",
            device: "Mobile",
            installedAt: sub.createdAt || new Date(),
            lastOpenedAt: sub.lastOpenedDate || sub.updatedAt || new Date(),
            hasNotificationEnabled: true,
            notificationEndpoint: sub.endpoint,
            openCount: 1,
          });
        }
      }
    } catch (syncErr) {
      console.warn("App subscription sync warning:", syncErr.message);
    }

    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
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

    const [
      totalInstalls,
      todayInstalls,
      todayActive,
      notifCount,
      registeredCount,
      guestCount,
      openAgg,
      platformAgg,
      browserAgg,
      recentList,
      totalSubscribers,
    ] = await Promise.all([
      AppInstallation.countDocuments(),
      AppInstallation.countDocuments({ installedAt: { $gte: startOfTodayIST } }),
      AppInstallation.countDocuments({ lastOpenedAt: { $gte: startOfTodayIST } }),
      AppInstallation.countDocuments({ hasNotificationEnabled: true }),
      AppInstallation.countDocuments({ userId: { $ne: null } }),
      AppInstallation.countDocuments({ userId: null }),
      AppInstallation.aggregate([
        { $group: { _id: null, totalOpens: { $sum: "$openCount" } } },
      ]),
      AppInstallation.aggregate([
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AppInstallation.aggregate([
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AppInstallation.find()
        .sort({ lastOpenedAt: -1, installedAt: -1 })
        .limit(25)
        .lean(),
      Subscription.countDocuments({
        $or: [{ isApp: true }, { isApp: { $exists: false } }, { isApp: null }],
      }),
    ]);

    const totalOpens = openAgg[0]?.totalOpens || 0;

    const platformStats = {};
    platformAgg.forEach((item) => {
      const name = item._id || "Other";
      platformStats[name] = item.count;
    });

    const browserStats = {};
    browserAgg.forEach((item) => {
      const name = item._id || "Other";
      browserStats[name] = item.count;
    });

    return res.json({
      success: true,
      stats: {
        totalInstalls,
        todayInstalls,
        todayActive,
        notificationSubscribers: Math.max(notifCount, totalSubscribers),
        registeredInstalls: registeredCount,
        guestInstalls: guestCount,
        totalOpens,
        platformStats,
        browserStats,
        recentInstallations: recentList,
      },
    });
  } catch (error) {
    console.error("Get App Stats Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  recordAppInstall,
  getAppStats,
};
