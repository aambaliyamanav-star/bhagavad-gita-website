/* =========================================================
   BHAGAVAD GITA - PWA MANAGER (AUTO-UPDATE & 1-CLICK INSTALL)
   ========================================================= */

let deferredPrompt = null;
const promptListeners = new Set();
let isInstalled = false;

// Check if running in standalone mode (already installed app)
export function checkIsInstalled() {
  if (typeof window === "undefined") return false;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://");
  isInstalled = isStandalone;
  return isStandalone;
}

// Subscribe to install availability changes
export function onInstallPromptChange(callback) {
  promptListeners.add(callback);
  // Immediately call with current state
  callback(Boolean(deferredPrompt), isInstalled);
  return () => promptListeners.delete(callback);
}

function notifyListeners() {
  const canInstall = Boolean(deferredPrompt);
  promptListeners.forEach((cb) => cb(canInstall, isInstalled));
}

// Trigger native browser install prompt
export async function promptInstallApp() {
  if (!deferredPrompt) {
    // If iOS Safari or unsupported, return instructions
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return {
      success: false,
      isIos,
      message: isIos
        ? "iOS પર Safari માં 'Share' બટન દબાવો અને 'Add to Home Screen' પસંદ કરો."
        : "એપ ઇન્સ્ટોલ કરવા માટે બ્રાઉઝર મેનૂમાંથી 'Install App' અથવા 'Add to Home screen' પસંદ કરો.",
    };
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyListeners();
    return { success: outcome === "accepted" };
  } catch (err) {
    console.error("Install prompt error:", err);
    return { success: false, error: err };
  }
}

// Initialize PWA event listeners & Service Worker registration
export function registerPwa() {
  if (typeof window === "undefined") return;

  checkIsInstalled();

  // Listen for beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notifyListeners();
    // Dispatch custom event for React components
    window.dispatchEvent(new CustomEvent("pwa-can-install"));
  });

  // Listen for appinstalled event
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    isInstalled = true;
    notifyListeners();
    console.log("શ્રીમદ્ ભગવદ્ ગીતા એપ સફળતાપૂર્વક ઇન્સ્ટોલ થઈ ગઈ છે.");
  });

  // Register Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("PWA Service Worker registered with scope:", registration.scope);

          // Check for service worker updates periodically (every 15 mins)
          setInterval(() => {
            registration.update().catch(() => {});
          }, 15 * 60 * 1000);

          // Check for update when user re-focuses the tab/app
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              registration.update().catch(() => {});
            }
          });

          // Detect when a new service worker is waiting or updating
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New update available! Notify user or auto-claim
                  console.log("New version of Bhagavad Gita app installed. Auto-activating...");
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("PWA ServiceWorker registration failed:", err);
        });

      // Reload page automatically when new service worker takes control (live update)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

