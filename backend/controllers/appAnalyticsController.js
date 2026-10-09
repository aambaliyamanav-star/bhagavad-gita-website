const crypto = require("crypto");
const webpush = require("web-push");
const AppInstallation = require("../models/AppInstallation");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

// Helper to ensure webpush VAPID details are set
function initWebpushVapid() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "mailto:admin@bhagavadgita.com",
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } catch (e) {}
  }
}
initWebpushVapid();

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
        isInstalled: true,
        uninstalledAt: null,
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
      isInstalled: true,
      uninstalledAt: null,
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

// POST /api/app-analytics/record-uninstall (Triggered when app is uninstalled or subscription revoked)
const recordAppUninstall = async (req, res) => {
  try {
    const { deviceId, endpoint } = req.body;
    if (!deviceId && !endpoint) {
      return res.status(400).json({ success: false, message: "deviceId or endpoint is required" });
    }

    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (endpoint) filter.notificationEndpoint = endpoint;

    const updated = await AppInstallation.findOneAndUpdate(
      filter,
      {
        $set: {
          isInstalled: false,
          uninstalledAt: new Date(),
          hasNotificationEnabled: false,
        },
      },
      { new: true }
    );

    if (endpoint) {
      await Subscription.deleteOne({ endpoint });
    }

    return res.json({
      success: true,
      message: "App marked as uninstalled",
      installation: updated,
    });
  } catch (error) {
    console.error("Record App Uninstall Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/app-analytics/installation/:id (Admin delete device record)
const deleteAppInstallation = async (req, res) => {
  try {
    const { id } = req.params;
    const install = await AppInstallation.findById(id);
    if (!install) {
      return res.status(404).json({ success: false, message: "Installation not found" });
    }

    if (install.notificationEndpoint) {
      await Subscription.deleteOne({ endpoint: install.notificationEndpoint });
    }

    await AppInstallation.findByIdAndDelete(id);

    return res.json({ success: true, message: "Installation deleted successfully" });
  } catch (error) {
    console.error("Delete App Installation Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/app-analytics/stats (Admin only)
const getAppStats = async (req, res) => {
  try {
    // 1. Clean legacy buggy dummy record if any
    try {
      await AppInstallation.deleteMany({ deviceId: "dev_sub_68747470733a2f2f" });
    } catch (e) {}

    // 2. Auto-sync any push subscriptions into AppInstallation with unique hashes
    try {
      const appSubs = await Subscription.find({
        $or: [{ isApp: true }, { isApp: { $exists: false } }, { isApp: null }],
      }).lean();

      for (const sub of appSubs) {
        const subHash = crypto.createHash("md5").update(sub.endpoint).digest("hex").substring(0, 16);
        const subDeviceId = sub.deviceId || ("dev_sub_" + subHash);

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
            isInstalled: true,
            openCount: 1,
          });
        } else {
          // If already in AppInstallation, ensure notificationEndpoint and notification flag are synced
          if (!existing.notificationEndpoint || !existing.hasNotificationEnabled) {
            await AppInstallation.updateOne(
              { _id: existing._id },
              { $set: { notificationEndpoint: sub.endpoint, hasNotificationEnabled: true, isInstalled: true } }
            );
          }
        }
      }
    } catch (syncErr) {
      console.warn("App subscription sync warning:", syncErr.message);
    }

    // 3. Ping active push subscriptions to detect uninstalled devices via FCM 410/404
    try {
      initWebpushVapid();
      const activeSubs = await Subscription.find().lean();
      for (const sub of activeSubs) {
        if (sub.endpoint && sub.keys) {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              JSON.stringify({ type: "silent-ping" }),
              { TTL: 0 }
            );
          } catch (pingErr) {
            if (pingErr.statusCode === 404 || pingErr.statusCode === 410) {
              console.log("Device uninstalled via 410/404:", sub.deviceId || sub.endpoint);
              await Subscription.deleteOne({ _id: sub._id });
              await AppInstallation.updateMany(
                {
                  $or: [
                    { notificationEndpoint: sub.endpoint },
                    { deviceId: sub.deviceId },
                  ],
                },
                {
                  $set: {
                    isInstalled: false,
                    uninstalledAt: new Date(),
                    hasNotificationEnabled: false,
                  },
                }
              );
            }
          }
        }
      }
    } catch (pingCheckErr) {
      // non-blocking
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

    // Active installed filter (installed = true, not uninstalled)
    const activeFilter = { isInstalled: { $ne: false } };

    const [
      totalInstalls,
      todayInstalls,
      todayActive,
      notifCount,
      registeredCount,
      guestCount,
      uninstalledCount,
      openAgg,
      platformAgg,
      browserAgg,
      recentList,
      totalSubscribers,
    ] = await Promise.all([
      AppInstallation.countDocuments(activeFilter),
      AppInstallation.countDocuments({ ...activeFilter, installedAt: { $gte: startOfTodayIST } }),
      AppInstallation.countDocuments({ ...activeFilter, lastOpenedAt: { $gte: startOfTodayIST } }),
      AppInstallation.countDocuments({ ...activeFilter, hasNotificationEnabled: true }),
      AppInstallation.countDocuments({ ...activeFilter, userId: { $ne: null } }),
      AppInstallation.countDocuments({ ...activeFilter, userId: null }),
      AppInstallation.countDocuments({ isInstalled: false }),
      AppInstallation.aggregate([
        { $match: activeFilter },
        { $group: { _id: null, totalOpens: { $sum: "$openCount" } } },
      ]),
      AppInstallation.aggregate([
        { $match: activeFilter },
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AppInstallation.aggregate([
        { $match: activeFilter },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AppInstallation.find()
        .sort({ lastOpenedAt: -1, installedAt: -1 })
        .limit(50)
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
        uninstalledInstalls: uninstalledCount,
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
  recordAppUninstall,
  deleteAppInstallation,
  getAppStats,
};
