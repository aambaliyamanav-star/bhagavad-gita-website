// Push Notification Utility for Bhagavad Gita Website

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://bhagavad-gita-website.onrender.com";

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

  // 1. Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("નોટિફિકેશનની પરવાનગી નકારી દેવામાં આવી છે.");
  }

  // 2. Ensure Service Worker is registered and ready
  await registerServiceWorker();
  const registration = await navigator.serviceWorker.ready;

  // 3. Fetch VAPID public key
  const res = await fetch(`${API_BASE}/api/notifications/public-key`);
  const data = await res.json();
  if (!data.publicKey) {
    throw new Error("VAPID કી ઉપલબ્ધ નથી.");
  }

  const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);

  // 4. Subscribe with PushManager
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

  // 5. Send to backend
  const role = user?.role === "admin" ? "admin" : "user";
  const userId = user?._id || user?.id || null;

  await fetch(`${API_BASE}/api/notifications/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint,
      keys,
      role,
      userId,
    }),
  });

  // Store in localStorage for rapid lookup
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

      await fetch(`${API_BASE}/api/notifications/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
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
      const res = await fetch(`${API_BASE}/api/notifications/record-open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, userId }),
      });

      if (res.ok) {
        sessionStorage.setItem(sessionRecordedKey, "true");
        console.log("✅ Website visit recorded. Daily push notifications suppressed for today.");
      }
    }
  } catch (err) {
    // Non-blocking
    console.debug("Could not record site open for push notifications:", err);
  }
}
