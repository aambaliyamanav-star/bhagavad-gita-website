import React, { useState, useEffect, useRef } from "react";
import { isRunningInStandaloneApp } from "../utils/pwaManager.js";
import "./AppSplashScreen.css";

export default function AppSplashScreen() {
  // STRICT: Only run in installed standalone App (PWA)! Never on regular Web browser.
  // Evaluate once on initial mount and store in ref so re-renders don't cancel/reset the splash flow.
  const shouldShowRef = useRef(null);
  if (shouldShowRef.current === null) {
    const isApp = typeof window !== "undefined" && isRunningInStandaloneApp();
    const isAlreadyShown =
      typeof window !== "undefined" &&
      sessionStorage.getItem("gita_splash_already_shown") === "true";
    shouldShowRef.current = isApp && !isAlreadyShown;
  }
  const shouldShow = shouldShowRef.current;

  const [showSplash, setShowSplash] = useState(shouldShow);
  const [isFadingBackdrop, setIsFadingBackdrop] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const logoRef = useRef(null);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // IF NOT RUNNING IN APP OR ALREADY SHOWN IN THIS SESSION:
    // Do NOT play splash screen! Keep navbar logo visible immediately.
    if (!shouldShow) {
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.remove("logo-hidden-for-splash");
      }
      try {
        window.dispatchEvent(new CustomEvent("gita-splash-finished"));
      } catch (e) {}
      setShowSplash(false);
      return;
    }

    // Mark as shown so refreshing the app or future renders NEVER show the splash again!
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

    // Complete transition handler (called either via onAnimationEnd or finishTimer fallback)
    const completeSplash = () => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;

      clearInterval(safetyCheck);
      clearTimeout(flightTimer);
      clearTimeout(finishTimer);

      // 1. Reveal navbar logo immediately so it takes over seamlessly
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.remove("logo-hidden-for-splash");
        target.classList.add("logo-landed-pulse");
        setTimeout(() => {
          target.classList.remove("logo-landed-pulse");
        }, 400);
      }

      // 2. Hide splash logo directly so no phantom logo remains even for 1 frame
      if (logoRef.current) {
        logoRef.current.style.opacity = "0";
        logoRef.current.style.display = "none";
      }

      // 3. Restore scrolling
      document.body.style.overflow = originalOverflow;

      // 4. Signal completion to onboarding flow (Language modal, etc.)
      try {
        window.dispatchEvent(new CustomEvent("gita-splash-finished"));
      } catch (e) {}

      // 5. Completely unmount splash overlay component from React tree
      setShowSplash(false);
    };

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
      } else {
        // Target or splash not found, complete gracefully
        completeSplash();
      }
    }, 40);

    // 3. Complete transition fallback at 680ms (0.62s flight completes seamlessly)
    const finishTimer = setTimeout(() => {
      completeSplash();
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
  }, []); // Run only once on mount!

  if (!showSplash) return null;

  return (
    <div className="app-splash-overlay" aria-hidden="true">
      {/* Seamless backdrop matching native phone splash background */}
      <div className={`app-splash-backdrop ${isFadingBackdrop ? "fade-out" : ""}`} />

      {/* Centered logo (single smooth GPU accelerated glide into navbar) */}
      <div
        ref={logoRef}
        className={`app-splash-logo-box ${isFlying ? "is-flying" : ""}`}
        onAnimationEnd={() => {
          if (isFlying && !hasFinishedRef.current) {
            // When CSS animation finishes docking, complete instantly
            const target = document.getElementById("navbar-gita-logo");
            if (target) {
              target.classList.remove("logo-hidden-for-splash");
              target.classList.add("logo-landed-pulse");
              setTimeout(() => {
                target.classList.remove("logo-landed-pulse");
              }, 400);
            }
            if (logoRef.current) {
              logoRef.current.style.opacity = "0";
              logoRef.current.style.display = "none";
            }
            hasFinishedRef.current = true;
            try {
              window.dispatchEvent(new CustomEvent("gita-splash-finished"));
            } catch (e) {}
            setShowSplash(false);
          }
        }}
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
