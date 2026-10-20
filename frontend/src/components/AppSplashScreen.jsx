import React, { useState, useEffect, useRef } from "react";
import "./AppSplashScreen.css";

export default function AppSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingBackdrop, setIsFadingBackdrop] = useState(false);
  const [flyStyle, setFlyStyle] = useState({});
  const logoRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Ensure target navbar logo is completely hidden before splash logo arrives
    const hideNavLogo = () => {
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.add("logo-hidden-for-splash");
        target.classList.remove("logo-landed-pulse");
      }
    };
    hideNavLogo();

    // Safety check for target element
    const safetyCheck = setInterval(hideNavLogo, 40);

    // Lock body scroll during the brief transition
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. Start flight immediately after initial paint (tiny 60ms delay)
    // Seamlessly connects the first opening logo straight into navbar!
    const flightTimer = setTimeout(() => {
      clearInterval(safetyCheck);
      setIsFadingBackdrop(true);

      const target = document.getElementById("navbar-gita-logo");
      const splashLogo = logoRef.current;

      if (target && splashLogo) {
        const targetRect = target.getBoundingClientRect();
        const splashRect = splashLogo.getBoundingClientRect();

        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const splashCenterX = splashRect.left + splashRect.width / 2;
        const splashCenterY = splashRect.top + splashRect.height / 2;

        const deltaX = targetCenterX - splashCenterX;
        const deltaY = targetCenterY - splashCenterY;
        const scale = targetRect.width / splashRect.width;

        setFlyStyle({
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
          borderRadius: "8px",
          transition: "transform 0.65s cubic-bezier(0.2, 0.95, 0.3, 1), border-radius 0.65s ease",
        });
      }
    }, 60);

    // 3. Complete transition at 720ms (flight finished, perfectly dock into navbar)
    const finishTimer = setTimeout(() => {
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.remove("logo-hidden-for-splash");
        target.classList.add("logo-landed-pulse");
        setTimeout(() => {
          target.classList.remove("logo-landed-pulse");
        }, 400);
      }

      // Signal completion to onboarding flow (Language modal, etc.)
      try {
        window.dispatchEvent(new CustomEvent("gita-splash-finished"));
      } catch (e) {}

      document.body.style.overflow = originalOverflow;
      setShowSplash(false);
    }, 720);

    return () => {
      clearInterval(safetyCheck);
      clearTimeout(flightTimer);
      clearTimeout(finishTimer);
      document.body.style.overflow = originalOverflow;
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.remove("logo-hidden-for-splash");
      }
    };
  }, []);

  if (!showSplash) return null;

  return (
    <div className="app-splash-overlay" aria-hidden="true">
      {/* Seamless backdrop matching native phone splash background */}
      <div className={`app-splash-backdrop ${isFadingBackdrop ? "fade-out" : ""}`} />

      {/* Centered logo (identical in size and position to native splash icon) */}
      <div
        ref={logoRef}
        className="app-splash-logo-box"
        style={flyStyle}
      >
        <img
          src="/icons/icon-192x192.png"
          alt="Bhagavad Gita Logo"
          className="app-splash-logo-img"
        />
      </div>
    </div>
  );
}
