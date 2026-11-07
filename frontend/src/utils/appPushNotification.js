/* =========================================================
   BHAGAVAD GITA - PUSH NOTIFICATION MANAGER
   Reliable push notifications every 2 hours for all subscribed devices
   ========================================================= */

import { trackAppInstallOrOpen, getOrCreateDeviceId } from "./appAnalytics.js";

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
    : "https://bhagavad-gita-backend-jy1a.onrender.com";
}

// Check if push notifications are supported on this device/browser
export function isAppPushSupported() {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Check if notifications are currently enabled
export function isAppNotificationEnabled() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (localStorage.getItem("app_notif_disabled_by_user") === "true") return false;
  return Notification.permission === "granted";
}

// Request permission and subscribe device to 2-hour push notifications
export async function enableAppNotifications(user = null) {
  if (!isAppPushSupported()) {
    console.warn("Push notifications are not supported on this device/browser.");
    return { success: false, reason: "not_supported" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission was not granted:", permission);
      return { success: false, permission };
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      return { success: false, reason: "sw_not_ready" };
    }

    // Fetch VAPID public key from backend (with safe fallback)
    let publicKey = FALLBACK_VAPID_PUBLIC;
    try {
      const res = await fetch(`${getApiBase()}/api/notifications/public-key`);
      if (res.ok) {
        const data = await res.json();
        if (data?.publicKey) publicKey = data.publicKey;
      }
    } catch (e) {
      // Use fallback key
    }

    const convertedKey = urlBase64ToUint8Array(publicKey);
    let subscription = await registration.pushManager.getSubscription();

    // If no existing subscription, create a new one
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

    // Send subscription to backend
    await fetch(`${getApiBase()}/api/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint,
        keys,
        role,
        userId,
        isApp: true,
        deviceId: getOrCreateDeviceId(),
      }),
    });

    localStorage.setItem("app_push_endpoint", endpoint);
    localStorage.setItem("app_push_notifications_enabled", "true");
    localStorage.removeItem("app_notif_disabled_by_user");

    // Track analytics
    try {
      trackAppInstallOrOpen(true);
    } catch (e) {}

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app-notification-status-changed", { detail: { enabled: true } })
      );
    }

    console.log("🔔 Gita 2-Hour Push Notifications successfully enabled on this device!");
    return { success: true };
  } catch (err) {
    console.error("Failed to enable notifications:", err);
    return { success: false, error: err };
  }
}

// Auto-sync existing subscription on page load if permission is already granted
export async function syncAppSubscription(user = null) {
  if (!isAppPushSupported()) return;
  if (Notification.permission !== "granted") return;
  if (localStorage.getItem("app_notif_disabled_by_user") === "true") return;

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
        deviceId: getOrCreateDeviceId(),
      }),
    });

    localStorage.setItem("app_push_endpoint", endpoint);
    localStorage.setItem("app_push_notifications_enabled", "true");
  } catch (err) {
    console.debug("Subscription sync:", err.message);
  }
}

// Record open
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
    console.debug("Record open error:", err);
  }
}

// Record action (shlok_read, quiz_played)
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
    console.debug("Record action error:", err);
  }
}

// Unsubscribe from push notifications
export async function unsubscribeAppNotifications() {
  try {
    const endpoint = localStorage.getItem("app_push_endpoint");
    if (endpoint) {
      await fetch(`${getApiBase()}/api/notifications/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    }

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }

    localStorage.removeItem("app_push_endpoint");
    localStorage.removeItem("app_push_notifications_enabled");
    localStorage.setItem("app_notif_disabled_by_user", "true");

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app-notification-status-changed", { detail: { enabled: false } })
      );
    }
    return { success: true };
  } catch (err) {
    console.error("Failed to unsubscribe:", err);
    return { success: false, error: err };
  }
}
