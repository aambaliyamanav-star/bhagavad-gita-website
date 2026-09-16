// Bhagavad Gita - Service Worker for Push Notifications

const API_BASE =
  self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://bhagavad-gita-website.onrender.com";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Event: Triggered when backend sends a push notification
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "🌸 શ્રીમદ્ ભગવદ્ ગીતા", body: event.data.text() };
    }
  }

  const title = data.title || "🌸 શ્રીમદ્ ભગવદ્ ગીતા";
  const options = {
    body: data.body || "આજનો દૈનિક શ્લોક વાંચવા માટે ક્લિક કરો.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
      dateOfArrival: Date.now(),
    },
    tag: data.tag || "bhagavad-gita-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Event: Opens the site and records the visit
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      // 1. Tell backend that site was opened via this subscription so no more reminders are sent today
      try {
        const sub = await self.registration.pushManager.getSubscription();
        if (sub && sub.endpoint) {
          await fetch(`${API_BASE}/api/notifications/record-open`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        }
      } catch (err) {
        console.error("Failed to record open from service worker:", err);
      }

      // 2. Focus existing tab or open new window
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clientList) {
        if ("focus" in client) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});
