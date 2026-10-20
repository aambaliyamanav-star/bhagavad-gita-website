import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./AppSplashScreen.css";

export default function AppSplashScreen() {
  const { txt } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingText, setIsFadingText] = useState(false);
  const [isFadingBackdrop, setIsFadingBackdrop] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flyStyle, setFlyStyle] = useState({
    borderRadius: "24px",
  });

  const logoRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initially hide the target logo in Navbar until our splash logo flies into it
    const hideNavLogo = () => {
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.add("logo-hidden-for-splash");
        target.classList.remove("logo-landed-pulse");
      }
    };

    hideNavLogo();
    // Safety interval to ensure it stays hidden until flight
    const safetyCheck = setInterval(hideNavLogo, 80);

    // Lock body scroll while splash is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. At 650ms, start the flight and fade-out transition
    const flightTimer = setTimeout(() => {
      clearInterval(safetyCheck);
      setIsFadingText(true);
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

        setIsFlying(true);
        setFlyStyle({
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
          borderRadius: "8px",
          transition: "transform 0.72s cubic-bezier(0.2, 0.9, 0.28, 1), border-radius 0.72s ease, box-shadow 0.72s ease",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
        });
      } else {
        // Fallback if target navbar logo not found
        setIsFlying(true);
      }
    }, 650);

    // 3. At 1400ms (750ms flight duration), the logo has perfectly landed in the navbar!
    const finishTimer = setTimeout(() => {
      // Reveal the target logo in the Navbar with divine landing pulse
      const target = document.getElementById("navbar-gita-logo");
      if (target) {
        target.classList.remove("logo-hidden-for-splash");
        target.classList.add("logo-landed-pulse");
        setTimeout(() => {
          target.classList.remove("logo-landed-pulse");
        }, 600);
      }

      // Signal completion to onboarding flow (Language modal, etc.)
      try {
        window.dispatchEvent(new CustomEvent("gita-splash-finished"));
      } catch (e) {}

      // Clean up body scroll and unmount splash
      document.body.style.overflow = originalOverflow;
      setShowSplash(false);
    }, 1400);

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
      {/* Background with fading animation */}
      <div className={`app-splash-backdrop ${isFadingBackdrop ? "fade-out" : ""}`} />

      {/* Decorative spinning sacred mandala */}
      <div className="app-splash-mandala" />

      {/* Splash Center */}
      <div className="app-splash-content">
        {/* Animated Flying Logo Box */}
        <div
          ref={logoRef}
          className="app-splash-logo-box"
          style={flyStyle}
        >
          <div className={`app-splash-logo-glow ${isFlying ? "glow-hidden" : ""}`} />
          <img
            src="/icons/icon-192x192.png"
            alt="Bhagavad Gita Logo"
            className="app-splash-logo-img"
          />
        </div>

        {/* Text Group Beneath Logo (Fades out when flight starts) */}
        <div className={`app-splash-text-group ${isFadingText ? "text-fade-out" : ""}`}>
          <span className="app-splash-om">ॐ</span>
          <h1 className="app-splash-title">॥ શ્રીમદ્ભગવદ્ગીતા ॥</h1>
          <p className="app-splash-subtitle">
            {txt("યતો ધર્મસ્તતો જયઃ", "यतो धर्मस्ततो जयः", "Where Dharma is, Victory is")}
          </p>
        </div>
      </div>
    </div>
  );
}
