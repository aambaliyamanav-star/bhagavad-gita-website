import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import {
  promptInstallApp,
  checkIsInstalled,
  onInstallPromptChange,
} from "../utils/pwaManager.js";
import "./InstallPwaBanner.css";

function InstallPwaBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    if (checkIsInstalled()) {
      setShowBanner(false);
      return;
    }

    // Check if dismissed in the last 3 days
    const dismissedUntil = localStorage.getItem("pwa_banner_dismissed_until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // Check if iOS Safari
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIosDevice(isIos);

    // Listen for custom trigger from Navbar/menu
    const handleOpenCustom = () => {
      setShowBanner(true);
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        setShowIosGuide(true);
      }
    };
    window.addEventListener("open-pwa-install-banner", handleOpenCustom);

    // Listen for install prompt readiness
    const unsubscribe = onInstallPromptChange((canInstall, isAlreadyInstalled) => {
      if (isAlreadyInstalled) {
        setShowBanner(false);
      } else if (canInstall || isIos) {
        // Show after a gentle 3-second delay so it doesn't pop up immediately on first second
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("open-pwa-install-banner", handleOpenCustom);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIosDevice) {
      setShowIosGuide(true);
      return;
    }

    const res = await promptInstallApp();
    if (res.alreadyInstalled) {
      alert(res.message);
      setShowBanner(false);
      return;
    }
    if (res.success) {
      setShowBanner(false);
    } else if (res.message) {
      alert(res.message);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Dismiss for 3 days
    localStorage.setItem(
      "pwa_banner_dismissed_until",
      String(Date.now() + 3 * 24 * 60 * 60 * 1000)
    );
  };

  if (!showBanner) return null;

  return (
    <>
      <aside className="pwa-install-banner" aria-label="Install App Prompt">
        <div className="pwa-banner-inner">
          <div className="pwa-app-icon-wrap">
            <img
              src="/icons/icon-192x192.png"
              alt="Bhagavad Gita App Icon"
              className="pwa-app-icon"
              width="44"
              height="44"
            />
            <div className="pwa-pulse-dot" />
          </div>

          <div className="pwa-banner-text">
            <span className="pwa-app-name">શ્રીમદ્ ભગવદ્ ગીતા APP</span>
          </div>

          <div className="pwa-banner-actions">
            <button
              type="button"
              className="pwa-install-btn"
              onClick={handleInstallClick}
            >
              <Download size={16} />
              <span>ઇન્સ્ટોલ કરો</span>
            </button>

            <button
              type="button"
              className="pwa-close-btn"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div
          className="ios-guide-backdrop"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="ios-guide-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ios-guide-header">
              <Smartphone size={24} className="ios-icon" />
              <h3>iPhone / iPad પર એપ ઉમેરો</h3>
              <button
                type="button"
                className="ios-close-btn"
                onClick={() => setShowIosGuide(false)}
              >
                <X size={18} />
              </button>
            </div>

            <ol className="ios-steps">
              <li>
                સફારી બ્રાઉઝરમાં નીચે <strong>Share (📤)</strong> બટન દબાવો.
              </li>
              <li>
                મેનૂને થોડું નીચે સ્ક્રોલ કરી <strong>&ldquo;Add to Home Screen (પ્લસ +)&rdquo;</strong> પસંદ કરો.
              </li>
              <li>
                ઉપર જમણી બાજુ <strong>&ldquo;Add&rdquo;</strong> પર ક્લિક કરો.
              </li>
            </ol>

            <button
              type="button"
              className="ios-done-btn"
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
            >
              સમજાઈ ગયું
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default InstallPwaBanner;
