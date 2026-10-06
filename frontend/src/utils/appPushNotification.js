/* =========================================================
   BHAGAVAD GITA - APP-ONLY PUSH NOTIFICATION MANAGER
   STRICT REQUIREMENT: ONLY RUNS INSIDE THE INSTALLED APP (PWA)
   NEVER PROMPTS OR SENDS TO REGULAR WEB BROWSER VISITORS!
   ========================================================= */

import { checkIsInstalled } from "./pwaManager.js";

const FALLBACK_VAPID_PUBLIC =
  "BBZ0vGL3_MtwlA6Owet6dEptXpiUIKyYdzV9Zy9qeew50cNaYqlRjpeg2qKdJowEnZWQ7vhbWOE-f0xhfMe6EDQ";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getApiBase() {
  if (typeof window === "undefined") return "";
  return window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://bhagavad-gita-website.onrender.com";
}

// Check if push notifications are supported and running as App
export function isAppPushSupported() {
  if (typeof window === "undefined") return false;
  // STRICT: Only true if running inside installed standalone app!
  if (!checkIsInstalled()) return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// Request permission and subscribe (App Only)
export async function enableAppNotifications(user = null) {
  if (!isAppPushSupported()) {
    console.log("App notifications skipped: not running inside installed app or not supported.");
    return { success: false, reason: "not_app" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted in app:", permission);
      return { success: false, permission };
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      return { success: false, reason: "sw_not_ready" };
    }

    // Fetch VAPID key
    let publicKey = FALLBACK_VAPID_PUBLIC;
    try {
      const res = await fetch(`${getApiBase()}/api/notifications/public-key`);
      const data = await res.json();
      if (data?.publicKey) publicKey = data.publicKey;
    } catch (e) {
      // Use fallback
    }

    const convertedKey = urlBase64ToUint8Array(publicKey);
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const keys = {
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
    };

    const role = user?.role === "admin" ? "admin" : "user";
    const userId = user?._id || user?.id || null;

    // Send subscription to backend tagged as isApp: true
    await fetch(`${getApiBase()}/api/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint,
        keys,
        role,
        userId,
        isApp: true,
      }),
    });

    localStorage.setItem("app_push_endpoint", endpoint);
    console.log("🔔 Bhagavad Gita App Push Notifications registered (5/day)!");
    return { success: true };
  } catch (err) {
    console.error("Failed to enable app notifications:", err);
    return { success: false, error: err };
  }
}

// Auto-sync existing app subscription if permission already granted
export async function syncAppSubscription(user = null) {
  if (!isAppPushSupported()) return;
  if (Notification.permission !== "granted") return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      await enableAppNotifications(user);
      return;
    }

    const subJson = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const keys = {
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
    };

    const role = user?.role === "admin" ? "admin" : "user";
    const userId = user?._id || user?.id || null;

    await fetch(`${getApiBase()}/api/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint,
        keys,
        role,
        userId,
        isApp: true,
      }),
    });

    localStorage.setItem("app_push_endpoint", endpoint);
  } catch (err) {
    console.debug("App push sync error:", err);
  }
}

// Record open in App
export async function recordAppOpen(user = null) {
  if (!isAppPushSupported()) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  if (sessionStorage.getItem(`app_open_recorded_${todayKey}`)) return;

  try {
    const endpoint = localStorage.getItem("app_push_endpoint");
    const userId = user?._id || user?.id || null;
    if (endpoint || userId) {
      await fetch(`${getApiBase()}/api/notifications/record-open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, userId }),
      });
      sessionStorage.setItem(`app_open_recorded_${todayKey}`, "true");
    }
  } catch (err) {
    console.debug("Record app open error:", err);
  }
}

// Record action in App (shlok_read, quiz_played)
export async function recordAppAction(action, user = null) {
  if (!isAppPushSupported()) return;

  try {
    const endpoint = localStorage.getItem("app_push_endpoint");
    const userId = user?._id || user?.id || null;
    if (endpoint || userId) {
      await fetch(`${getApiBase()}/api/notifications/record-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, userId, action }),
      });
    }
  } catch (err) {
    console.debug("Record app action error:", err);
  }
}
