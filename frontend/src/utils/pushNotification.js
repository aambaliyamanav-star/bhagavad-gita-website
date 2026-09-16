// Push Notification Utility for Bhagavad Gita Website

const PROD_API_BASE = "https://bhagavad-gita-website.onrender.com";
const LOCAL_API_BASE = "http://localhost:5000";

// Fallback VAPID public key ensures push registration succeeds even during cold starts
const FALLBACK_VAPID_PUBLIC =
  "BBZ0vGL3_MtwlA6Owet6dEptXpiUIKyYdzV9Zy9qeew50cNaYqlRjpeg2qKdJowEnZWQ7vhbWOE-f0xhfMe6EDQ";

// Helper to make resilient API calls
async function apiCall(path, options = {}) {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Determine priority order: Render first (production DB matching rest of frontend), local as alternate
  const targets = isLocal
    ? [`${PROD_API_BASE}${path}`, `${LOCAL_API_BASE}${path}`]
    : [`${PROD_API_BASE}${path}`];

  let lastError = null;
  for (const url of targets) {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw (
    lastError ||
    new Error("સર્વર સાથે જોડાણ થઈ શક્યું નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.")
  );
}

// Utility to convert VAPID public key
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

// Check if browser supports push notifications
export function isPushNotificationSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Get current permission status
export function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

// Register service worker
export async function registerServiceWorker() {
  if (!isPushNotificationSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (err) {
    console.error("❌ Service Worker registration failed:", err);
    return null;
  }
}

// Check if user is currently subscribed
export async function getExistingSubscription() {
  if (!isPushNotificationSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error("Error getting existing push subscription:", err);
    return null;
  }
}

// Subscribe user to push notifications
export async function subscribeUserToPush(user = null) {
  if (!isPushNotificationSupported()) {
    throw new Error("તમારા બ્રાઉઝરમાં નોટિફિકેશન સપોર્ટ નથી.");
  }

  // 1. Request permission from user
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("નોટિફિકેશનની પરવાનગી નકારી દેવામાં આવી છે.");
  }

  // 2. Ensure Service Worker is registered and ready
  await registerServiceWorker();
  const registration = await navigator.serviceWorker.ready;

  // 3. Fetch VAPID public key with fallback
  let publicKey = FALLBACK_VAPID_PUBLIC;
  try {
    const res = await apiCall("/api/notifications/public-key");
    const data = await res.json();
    if (data && data.publicKey) {
      publicKey = data.publicKey;
    }
  } catch (err) {
    console.warn("Could not fetch remote VAPID key, using fallback key:", err);
  }

  const convertedVapidKey = urlBase64ToUint8Array(publicKey);

  // 4. Subscribe with browser PushManager
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }

  const subJson = subscription.toJSON();
  const endpoint = subscription.endpoint;
  const keys = {
    p256dh: subJson.keys?.p256dh,
    auth: subJson.keys?.auth,
  };

  // 5. Send subscription to backend
  const role = user?.role === "admin" ? "admin" : "user";
  const userId = user?._id || user?.id || null;

  try {
    await apiCall("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint,
        keys,
        role,
        userId,
      }),
    });
  } catch (err) {
    console.warn("Failed to sync subscription to backend immediately:", err);
  }

  // Store endpoint locally for direct visit suppression
  localStorage.setItem("push_subscription_endpoint", endpoint);

  return subscription;
}

// Unsubscribe user
export async function unsubscribeUserFromPush() {
  if (!isPushNotificationSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      try {
        await apiCall("/api/notifications/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      } catch (err) {
        console.warn("Could not send unsubscribe to backend:", err);
      }
    }

    localStorage.removeItem("push_subscription_endpoint");
  } catch (err) {
    console.error("❌ Error during unsubscribe:", err);
  }
}

// Record website visit (Called on App mount/visit)
// Ensures users who open the site directly without clicking a notification
// will NOT receive further daily reminders today!
export async function recordWebsiteVisit(user = null) {
  if (typeof window === "undefined") return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const sessionRecordedKey = `site_visit_recorded_${todayKey}`;

  // If already recorded today in this browser session, skip redundant API calls
  if (sessionStorage.getItem(sessionRecordedKey)) {
    return;
  }

  try {
    let endpoint = localStorage.getItem("push_subscription_endpoint");

    // If not in localStorage, check PushManager directly
    if (!endpoint && isPushNotificationSupported()) {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub && sub.endpoint) {
        endpoint = sub.endpoint;
        localStorage.setItem("push_subscription_endpoint", endpoint);
      }
    }

    const userId = user?._id || user?.id || null;

    if (endpoint || userId) {
      await apiCall("/api/notifications/record-open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, userId }),
      });

      sessionStorage.setItem(sessionRecordedKey, "true");
      console.log("✅ Website visit recorded. Daily push notifications suppressed for today.");
    }
  } catch (err) {
    console.debug("Could not record site open for push notifications:", err);
  }
}
