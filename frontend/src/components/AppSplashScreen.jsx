import React, { useState, useEffect, useRef } from "react";
import "./AppSplashScreen.css";

export default function AppSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingBackdrop, setIsFadingBackdrop] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
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
    const safetyCheck = setInterval(hideNavLogo, 30);

    // Lock body scroll during the brief transition
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. Start flight and shrinking in parallel across the flight path
    const flightTimer = setTimeout(() => {
      clearInterval(safetyCheck);

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

        // Feed exact pixel trajectory to keyframe animation
        splashLogo.style.setProperty("--fly-x", `${deltaX}px`);
        splashLogo.style.setProperty("--fly-y", `${deltaY}px`);
        splashLogo.style.setProperty("--fly-scale", scale.toString());

        setIsFlying(true);
        setIsFadingBackdrop(true);
      }
    }, 50);

    // 3. Complete transition at 740ms (0.68s flight finishes, perfectly docks into navbar)
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
    }, 740);

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

      {/* Centered logo (moves towards navbar and shrinks simultaneously) */}
      <div
        ref={logoRef}
        className={`app-splash-logo-box ${isFlying ? "is-flying" : ""}`}
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
