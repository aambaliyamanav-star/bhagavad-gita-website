/* =========================================================
   BHAGAVAD GITA - APP INSTALLATION & USAGE ANALYTICS
   Tracks app installs, device platforms, and active usage
   ========================================================= */

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get or generate persistent unique device ID
export function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "server_device";
  let deviceId = localStorage.getItem("gita_app_device_id");
  if (!deviceId) {
    deviceId =
      "gita_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substring(2, 10);
    localStorage.setItem("gita_app_device_id", deviceId);
  }
  return deviceId;
}

// Detect client platform
export function detectPlatform() {
  if (typeof window === "undefined") return "Android";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "Android";
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return "iOS";
  if (/Win/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Android";
}

// Detect client browser
export function detectBrowser() {
  if (typeof window === "undefined") return "Chrome";
  const ua = navigator.userAgent || "";
  if (/edg/i.test(ua)) return "Edge";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  return "Chrome";
}

// Detect device form factor
export function detectDevice() {
  if (typeof window === "undefined") return "Mobile";
  const ua = navigator.userAgent || "";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (
    /mobile|iphone|ipod|android/i.test(ua) ||
    window.innerWidth <= 768
  ) {
    return "Mobile";
  }
  return "Desktop";
}

/**
 * Record an app install or app open event to backend
 * @param {boolean} isNewInstall - true if triggered right upon user clicking Install / appinstalled event
 */
export async function trackAppInstallOrOpen(isNewInstall = false) {
  if (typeof window === "undefined") return;

  try {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    // Only record if installed or if explicitly marking a new install
    if (!isStandalone && !isNewInstall) {
      return;
    }

    // Debounce non-new-install events to once per session
    if (!isNewInstall) {
      const sessionKey = "gita_app_tracked_session";
      if (sessionStorage.getItem(sessionKey)) {
        return; // Already tracked for this open session
      }
      sessionStorage.setItem(sessionKey, "1");
    }

    const deviceId = getOrCreateDeviceId();
    const platform = detectPlatform();
    const browser = detectBrowser();
    const device = detectDevice();

    // Check if user is logged in
    let userId = null;
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        userId = parsed._id || parsed.id || null;
      }
    } catch (e) {
      // ignore
    }

    // Check notification permission
    const hasNotification =
      typeof Notification !== "undefined" &&
      Notification.permission === "granted";

    const payload = {
      deviceId,
      userId,
      platform,
      browser,
      device,
      hasNotification,
      isNewInstall,
    };

    const endpoint = `${API_BASE}/app-analytics/record-install`;

    // Try sendBeacon for reliability, fallback to fetch
    const bodyStr = JSON.stringify(payload);
    if (navigator.sendBeacon && isNewInstall) {
      const blob = new Blob([bodyStr], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    } else {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyStr,
      });
    }
  } catch (err) {
    console.debug("App tracking log failed:", err);
  }
}
