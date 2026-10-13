import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import {
  promptInstallApp,
  isRunningInStandaloneApp,
  onInstallPromptChange,
} from "../utils/pwaManager.js";
import "./InstallPwaBanner.css";

function InstallPwaBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. STRICT: If already running inside installed standalone app, NEVER show install banner
    if (isRunningInStandaloneApp()) {
      setShowBanner(false);
      return;
    }

    // Clean up old legacy suppressions so refresh always brings it back
    try {
      localStorage.removeItem("pwa_banner_dismissed_until");
      sessionStorage.removeItem("pwa_banner_dismissed_session");
    } catch (e) {}

    // Check if iOS Safari
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIosDevice(isIos);

    // Show after a gentle 1.5s delay
    const timer = setTimeout(() => {
      if (!isRunningInStandaloneApp()) {
        setShowBanner(true);
      }
    }, 1500);

    // Listen for custom trigger from Navbar/menu (always shows even if previously closed)
    const handleOpenCustom = () => {
      setShowBanner(true);
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        setShowIosGuide(true);
      }
    };
    window.addEventListener("open-pwa-install-banner", handleOpenCustom);

    // Listen for install prompt readiness
    const unsubscribe = onInstallPromptChange((canInstall, isStandalone) => {
      if (isStandalone) {
        setShowBanner(false);
      } else if (canInstall || isIos) {
        setShowBanner(true);
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
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
    // Closes the banner now; upon refresh, it will reappear
    setShowBanner(false);
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
