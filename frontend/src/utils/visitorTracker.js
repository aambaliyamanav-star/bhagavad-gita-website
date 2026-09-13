/**
 * Website Visitor Tracking Utility
 * Silently records pageviews and unique visitors
 */

const API_BASE = "https://bhagavad-gita-website.onrender.com";

// Retrieve or generate a persistent anonymous visitor ID
export function getVisitorId() {
  try {
    let vid = localStorage.getItem("gita_visitor_id");
    if (!vid) {
      vid =
        "v_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).substring(2, 10);
      localStorage.setItem("gita_visitor_id", vid);
    }
    return vid;
  } catch {
    return "v_anon_" + Math.random().toString(36).substring(2, 10);
  }
}

let lastTrackedPath = "";
let lastTrackedTime = 0;

/**
 * Record a page visit
 * @param {string} path - current location pathname
 */
export async function trackVisit(path) {
  try {
    if (!path || typeof path !== "string") return;

    // Do not track admin management paths to keep stats genuine
    if (path.startsWith("/admin")) return;

    const now = Date.now();
    // Throttle: don't track the exact same path if visited within 20 seconds
    if (path === lastTrackedPath && now - lastTrackedTime < 20000) {
      return;
    }

    lastTrackedPath = path;
    lastTrackedTime = now;

    const visitorId = getVisitorId();
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    // Check if the user is registered/logged in
    let isRegistered = false;
    let userId = null;
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed._id) {
          isRegistered = true;
          userId = parsed._id;
        }
      }
    } catch {
      // ignore JSON parse error
    }

    const payload = JSON.stringify({
      visitorId,
      path,
      referrer,
      isRegistered,
      userId,
    });

    // Use sendBeacon if available for non-blocking analytics
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(`${API_BASE}/api/visitors/track`, blob);
      if (sent) return;
    }

    // Fallback to fetch
    fetch(`${API_BASE}/api/visitors/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silently ignore network failures to never disrupt the user
    });
  } catch {
    // Ignore any tracking errors
  }
}
