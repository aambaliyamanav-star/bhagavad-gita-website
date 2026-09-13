const Visitor = require("../models/Visitor");

// Helper to parse User Agent string into device, browser, OS
function parseUserAgent(uaString = "") {
  const ua = uaString.toLowerCase();

  // 1. Device detection
  let device = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = "Tablet";
  } else if (
    /mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|windows phone/i.test(
      ua
    ) ||
    (/android/i.test(ua) && /mobi/i.test(ua))
  ) {
    device = "Mobile";
  }

  // 2. Browser detection
  let browser = "Other";
  if (/edg([ea]|ios)?\//i.test(ua)) {
    browser = "Edge";
  } else if (/samsungbrowser/i.test(ua)) {
    browser = "Samsung Internet";
  } else if (/opr\/|opera/i.test(ua)) {
    browser = "Opera";
  } else if (/chrome|crios/i.test(ua) && !/opr\/|opera/i.test(ua)) {
    browser = "Chrome";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = "Safari";
  } else if (/ucbrowser/i.test(ua)) {
    browser = "UC Browser";
  }

  // 3. OS detection
  let os = "Other";
  if (/windows nt 10/i.test(ua)) {
    os = "Windows 10/11";
  } else if (/windows nt/i.test(ua)) {
    os = "Windows";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  } else if (/cros/i.test(ua)) {
    os = "ChromeOS";
  }

  return { device, browser, os };
}

// POST /api/visitors/track - Public Endpoint to record a visit
const recordVisit = async (req, res) => {
  try {
    const { visitorId, path, referrer, isRegistered, userId } = req.body;

    if (!visitorId) {
      return res.status(400).json({ success: false, message: "visitorId is required" });
    }

    const currentPath = typeof path === "string" && path.trim() ? path.trim() : "/";

    // Don't track admin pages to avoid skewing real user metrics
    if (currentPath.startsWith("/admin")) {
      return res.json({ success: true, ignored: true });
    }

    const userAgent = req.headers["user-agent"] || "";
    const rawIp =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "";
    const ip = rawIp.split(",")[0].trim();

    const { device, browser, os } = parseUserAgent(userAgent);

    const newVisit = new Visitor({
      visitorId,
      ip,
      path: currentPath,
      referrer: typeof referrer === "string" ? referrer.slice(0, 500) : "",
      userAgent: userAgent.slice(0, 300),
      device,
      browser,
      os,
      isRegistered: Boolean(isRegistered),
      userId: isRegistered && userId ? String(userId) : null,
      visitedAt: new Date(),
    });

    await newVisit.save();

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error recording visitor:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/visitors/stats - Protected Admin Endpoint
const getVisitorStats = async (req, res) => {
  try {
    const now = new Date();

    // Start of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Total all visits (jetlivar ek j user aave te badhi vaar count thay - All Pageviews)
    const totalVisits = await Visitor.countDocuments();

    // 2. Today's all visits
    const todayVisits = await Visitor.countDocuments({
      visitedAt: { $gte: startOfToday },
    });

    // 3. New / Unregistered unique visitors (varmvar ek j user aave to pan 1 j vaar count thay)
    const uniqueUnregisteredIds = await Visitor.distinct("visitorId", {
      isRegistered: false,
    });
    const uniqueUnregisteredVisitors = uniqueUnregisteredIds.length;

    // 4. Today's new / unregistered unique visitors
    const todayUniqueUnregisteredIds = await Visitor.distinct("visitorId", {
      isRegistered: false,
      visitedAt: { $gte: startOfToday },
    });
    const todayUniqueUnregisteredVisitors = todayUniqueUnregisteredIds.length;

    // 5. Total visits made by registered users (jetli var aave te badhi var nu count thay)
    const registeredVisits = await Visitor.countDocuments({
      isRegistered: true,
    });
    const uniqueRegisteredVisitors = registeredVisits;

    // 6. Overall unique visitors (distinct visitorId across all)
    const allUniqueVisitorIds = await Visitor.distinct("visitorId");
    const totalUniqueVisitors = allUniqueVisitorIds.length;

    // 7. Today's overall unique visitors
    const todayAllUniqueIds = await Visitor.distinct("visitorId", {
      visitedAt: { $gte: startOfToday },
    });
    const todayUniqueVisitors = todayAllUniqueIds.length;

    // 8. Device distribution
    const deviceAggregation = await Visitor.aggregate([
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const deviceStats = {
      Desktop: 0,
      Mobile: 0,
      Tablet: 0,
      Unknown: 0,
    };
    deviceAggregation.forEach((item) => {
      if (item._id) deviceStats[item._id] = item.count;
    });

    // 9. Browser distribution (top 6)
    const browserStats = await Visitor.aggregate([
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // 10. OS distribution (top 6)
    const osStats = await Visitor.aggregate([
      { $group: { _id: "$os", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // 11. Top visited pages (top 10)
    const topPages = await Visitor.aggregate([
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 12. Recent 15 visitors with registration status
    const recentVisitors = await Visitor.find()
      .select("path device browser os isRegistered visitedAt")
      .sort({ visitedAt: -1 })
      .limit(15)
      .lean();

    // 13. Last 7 days trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyVisitsAgg = await Visitor.aggregate([
      { $match: { visitedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" },
          },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" },
        },
      },
      {
        $project: {
          date: "$_id",
          visits: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalVisits, // Jetlivar aave te badhi vaar count
        todayVisits, // Aajna badha visits
        uniqueUnregisteredVisitors, // New not register user (varmvar aave to no count thay, 1 j var)
        todayUniqueUnregisteredVisitors, // Aajna new not register unique user
        uniqueRegisteredVisitors, // Register user na badha visits (jetli var aave te badhi var)
        registeredVisits, // Register user na badha visits
        totalUniqueVisitors, // Badha unique visitors
        todayUniqueVisitors, // Aajna badha unique visitors
        deviceStats,
        browserStats,
        osStats,
        topPages,
        recentVisitors,
        dailyTrend: dailyVisitsAgg,
      },
    });
  } catch (error) {
    console.error("Error fetching visitor stats:", error);
    res.status(500).json({
      success: false,
      message: "Visitor statistics મેળવવામાં error આવ્યો.",
      error: error.message,
    });
  }
};

module.exports = {
  recordVisit,
  getVisitorStats,
};
