/* =========================================================
   BHAGAVAD GITA - PWA MANAGER (AUTO-UPDATE & 1-CLICK INSTALL)
   ========================================================= */

import { trackAppInstallOrOpen } from "./appAnalytics";

let deferredPrompt = null;
const promptListeners = new Set();
let isInstalled = false;

// Check if running in standalone mode (already running inside installed app)
export function isRunningInStandaloneApp() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true ||
    (document.referrer && document.referrer.includes("android-app://")) ||
    (window.location.search && window.location.search.includes("source=pwa"))
  );
}

// Backwards compatibility alias
export function checkIsInstalled() {
  return isRunningInStandaloneApp();
}

// Subscribe to install availability changes
export function onInstallPromptChange(callback) {
  promptListeners.add(callback);
  // Immediately call with current state
  callback(Boolean(deferredPrompt), isRunningInStandaloneApp());
  return () => promptListeners.delete(callback);
}

function notifyListeners() {
  const canInstall = Boolean(deferredPrompt);
  const isStandalone = isRunningInStandaloneApp();
  promptListeners.forEach((cb) => cb(canInstall, isStandalone));
}

// Check if already installed
export async function isAppAlreadyInstalled() {
  if (typeof window === "undefined") return false;
  if (isRunningInStandaloneApp()) return true;
  if ("getInstalledRelatedApps" in navigator) {
    try {
      const apps = await navigator.getInstalledRelatedApps();
      if (apps && apps.length > 0) {
        localStorage.setItem("gita_app_installed", "true");
        return true;
      }
    } catch (e) {}
  }
  if (deferredPrompt) {
    localStorage.removeItem("gita_app_installed");
    return false;
  }
  return localStorage.getItem("gita_app_installed") === "true";
}

// Trigger native browser install prompt
export async function promptInstallApp() {
  if (isRunningInStandaloneApp()) {
    return {
      success: false,
      alreadyInstalled: true,
      message: "આ એપ તમારા ડિવાઇસ પર પહેલેથી જ સફળતાપૂર્વક ઇન્સ્ટોલ કરેલી છે! 📱\nતમારા ફોનની હોમ સ્ક્રીન અથવા એપ લિસ્ટમાંથી 'ભગવદ્ ગીતા' એપ ખોલો.",
    };
  }

  // 1. Check if browser can confirm it is installed
  if ("getInstalledRelatedApps" in navigator) {
    try {
      const apps = await navigator.getInstalledRelatedApps();
      if (apps && apps.length > 0) {
        localStorage.setItem("gita_app_installed", "true");
        return {
          success: false,
          alreadyInstalled: true,
          message: "આ એપ તમારા ડિવાઇસ પર પહેલેથી જ સફળતાપૂર્વક ઇન્સ્ટોલ કરેલી છે! 📱\nતમારા ફોનની હોમ સ્ક્રીન અથવા એપ લિસ્ટમાંથી 'ભગવદ્ ગીતા' એપ ખોલો.",
        };
      }
    } catch (e) {}
  }

  // 2. If deferredPrompt is ready, trigger native browser install prompt
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      notifyListeners();
      if (outcome === "accepted") {
        localStorage.setItem("gita_app_installed", "true");
        localStorage.setItem("gita_app_installed_attempted", "true");
        trackAppInstallOrOpen(true);
        return { success: true, message: "એપ સફળતાપૂર્વક ઇન્સ્ટોલ થઈ ગઈ છે! 📱" };
      }
      return { success: false, dismissed: true };
    } catch (err) {
      console.error("Install prompt error:", err);
      return { success: false, error: err };
    }
  }

  // 3. If deferredPrompt is NOT ready, but localStorage says it was installed:
  if (localStorage.getItem("gita_app_installed") === "true") {
    return {
      success: false,
      alreadyInstalled: true,
      message: "આ એપ તમારા ડિવાઇસ પર પહેલેથી જ સફળતાપૂર્વક ઇન્સ્ટોલ કરેલી છે! 📱\nતમારા ફોનની હોમ સ્ક્રીન અથવા એપ લિસ્ટમાંથી 'ભગવદ્ ગીતા' એપ ખોલો.\n(જો તમે એપ અનઇન્સ્ટોલ કરી હોય, તો બ્રાઉઝર મેનૂમાંથી 'Add to Home screen' અથવા 'Install' પસંદ કરો.)",
    };
  }

  // 4. iOS Safari check
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIos) {
    return {
      success: false,
      isIos: true,
      message: "iOS પર Safari માં નીચે 'Share' (શેર) બટન દબાવો અને 'Add to Home Screen' પસંદ કરો.",
    };
  }

  // 5. Fallback for browsers that don't support beforeinstallprompt or prompt isn't fired yet
  return {
    success: false,
    message: "એપ ઇન્સ્ટોલ કરવા માટે બ્રાઉઝરના ઉપર/નીચે આપેલા 3-ડોટ (⋮) મેનૂમાંથી 'Install app' અથવા 'Add to Home screen' પસંદ કરો.",
  };
}

// Initialize PWA event listeners & Service Worker registration
export function registerPwa() {
  if (typeof window === "undefined") return;

  if (isRunningInStandaloneApp()) {
    trackAppInstallOrOpen(false);
  }

  // Listen for beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Browser allows install -> app is NOT currently installed!
    localStorage.removeItem("gita_app_installed");
    localStorage.removeItem("gita_app_installed_attempted");
    notifyListeners();
    // Dispatch custom event for React components
    window.dispatchEvent(new CustomEvent("pwa-can-install"));
  });

  // Listen for appinstalled event
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    localStorage.setItem("gita_app_installed", "true");
    notifyListeners();
    trackAppInstallOrOpen(true);
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

