import React, { useState, useEffect, useRef } from "react";
import "./AppSplashScreen.css";

export default function AppSplashScreen() {
  // Check if splash was already played in this browsing/app session (e.g. on page refresh)
  const isAlreadyShown =
    typeof window !== "undefined" &&
    sessionStorage.getItem("gita_splash_already_shown") === "true";

  const [showSplash, setShowSplash] = useState(!isAlreadyShown);
  const [isFadingBackdrop, setIsFadingBackdrop] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const logoRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // IF ALREADY SHOWN IN THIS SESSION (PAGE REFRESH):
    // Do NOT play splash screen again! Keep navbar logo visible immediately.
    if (isAlreadyShown) {
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.remove("logo-hidden-for-splash");
      }
      try {
        window.dispatchEvent(new CustomEvent("gita-splash-finished"));
      } catch (e) {}
      return;
    }

    // Mark as shown so refreshing the page NEVER shows the splash again!
    sessionStorage.setItem("gita_splash_already_shown", "true");

    // 1. Ensure target navbar logo is hidden until our splash logo docks into it
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

    // 2. Start smooth continuous flight into navbar (single smooth GPU curve)
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

        // Feed exact pixel trajectory to single-curve keyframe animation
        splashLogo.style.setProperty("--fly-x", `${deltaX}px`);
        splashLogo.style.setProperty("--fly-y", `${deltaY}px`);
        splashLogo.style.setProperty("--fly-scale", scale.toString());

        setIsFlying(true);
        setIsFadingBackdrop(true);
      }
    }, 40);

    // 3. Complete transition at 680ms (0.62s flight completes seamlessly)
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
    }, 680);

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
  }, [isAlreadyShown]);

  if (!showSplash) return null;

  return (
    <div className="app-splash-overlay" aria-hidden="true">
      {/* Seamless backdrop matching native phone splash background */}
      <div className={`app-splash-backdrop ${isFadingBackdrop ? "fade-out" : ""}`} />

      {/* Centered logo (single smooth GPU accelerated glide into navbar) */}
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
