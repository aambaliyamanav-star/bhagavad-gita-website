import React, { useState, useEffect } from "react";
import "./LittleKrishnaArt.css";

/**
 * LittleKrishnaArt Component
 * 
 * Renders an animated SVG illustration of Little Krishna (બાળ કૃષ્ણ):
 * Phase 1: Golden line drawing / sketching animation (strokes draw themselves)
 * Phase 2: Vibrant, spiritual colors bloom and fill in (peacock feather, flute, butter pot, aura)
 * Phase 3: Gentle divine floating and shimmering aura
 */
export default function LittleKrishnaArt() {
  const [isColored, setIsColored] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    // Start drawing, then bloom colors after stroke animation completes (approx 2.4s)
    setIsColored(false);
    const timer = setTimeout(() => {
      setIsColored(true);
    }, 2400);

    return () => clearTimeout(timer);
  }, [replayKey]);

  const handleReplay = (e) => {
    e.stopPropagation();
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div
      key={replayKey}
      className={`little-krishna-container ${isColored ? "is-colored" : "is-drawing"}`}
      aria-hidden="true"
    >
      <div className="little-krishna-halo" />

      <svg
        className="little-krishna-svg"
        viewBox="0 0 500 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Gradient for Divine Aura */}
          <radialGradient id="krishnaHaloGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#fde047" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
          </radialGradient>

          {/* Skin Gradient - Celestial Shyamal Blue */}
          <linearGradient id="krishnaSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c7e8ff" />
            <stop offset="60%" stopColor="#a5d8ff" />
            <stop offset="100%" stopColor="#80c2f8" />
          </linearGradient>

          {/* Golden Jewelry Gradient */}
          <linearGradient id="krishnaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Hair Gradient */}
          <linearGradient id="krishnaHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e384d" />
            <stop offset="70%" stopColor="#171e2e" />
            <stop offset="100%" stopColor="#0b0f19" />
          </linearGradient>

          {/* Peacock Feather - Outer Green */}
          <linearGradient id="featherGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Peacock Feather - Royal Blue Eye */}
          <radialGradient id="featherBlueEye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>

          {/* Terracotta Matki Gradient */}
          <linearGradient id="matkiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          {/* Butter Cream Gradient */}
          <linearGradient id="butterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
        </defs>

        {/* 1. DIVINE AURA / PRABHA MANDAL */}
        <g className="art-layer aura-layer">
          <circle cx="250" cy="235" r="190" fill="url(#krishnaHaloGrad)" className="aura-disc" />
          <circle cx="250" cy="235" r="165" className="stroke-elem aura-ring" strokeDasharray="10 8" />
          <circle cx="250" cy="235" r="185" className="stroke-elem aura-ring-outer" strokeDasharray="4 12" />
        </g>

        {/* 2. PEACOCK FEATHER (મોરપીંછ) */}
        <g className="art-layer feather-layer">
          {/* Feather Stem */}
          <path
            d="M 258 105 Q 285 65 315 25"
            className="stroke-elem feather-stem"
          />
          {/* Feather Outer Plume */}
          <path
            d="M 315 25 C 290 35 280 60 295 80 C 310 100 335 90 345 70 C 355 50 340 20 315 25 Z"
            className="color-fill feather-outer"
            fill="url(#featherGreenGrad)"
          />
          {/* Feather Delicate Fronds */}
          <path d="M 305 35 Q 280 30 270 45" className="stroke-elem feather-frond" />
          <path d="M 315 45 Q 285 45 278 62" className="stroke-elem feather-frond" />
          <path d="M 325 55 Q 300 65 290 85" className="stroke-elem feather-frond" />
          <path d="M 325 28 Q 350 25 365 38" className="stroke-elem feather-frond" />
          <path d="M 335 40 Q 360 42 368 58" className="stroke-elem feather-frond" />
          <path d="M 340 55 Q 365 65 358 82" className="stroke-elem feather-frond" />

          {/* Feather Middle Cyan Ring */}
          <path
            d="M 315 38 C 302 45 298 60 308 70 C 318 80 330 75 334 62 C 338 50 328 35 315 38 Z"
            className="color-fill feather-cyan"
            fill="#38bdf8"
          />
          {/* Feather Deep Blue Eye */}
          <path
            d="M 316 45 C 308 50 306 60 313 65 C 320 70 326 66 328 58 C 330 50 324 43 316 45 Z"
            className="color-fill feather-eye"
            fill="url(#featherBlueEye)"
          />
          {/* Feather Golden Crescent/Sun at Center */}
          <circle cx="318" cy="54" r="4.5" className="color-fill feather-gold" fill="#fbbf24" />
        </g>

        {/* 3. HAIR TOPKNOT (જૂડો) & JEWELS */}
        <g className="art-layer hair-topknot-layer">
          {/* Main Top Hair Bun */}
          <path
            d="M 215 125 C 215 85 285 85 285 125 C 285 145 215 145 215 125 Z"
            className="color-fill hair-fill"
            fill="url(#krishnaHairGrad)"
          />
          {/* Hair Bun Strands */}
          <path d="M 225 120 Q 250 100 275 120" className="stroke-elem hair-strand" />
          <path d="M 230 130 Q 250 110 270 130" className="stroke-elem hair-strand" />

          {/* Pearl Garland around Topknot */}
          <g className="pearl-necklace color-fill" fill="#ffffff">
            <circle cx="228" cy="132" r="3.5" className="color-fill pearl" />
            <circle cx="236" cy="134" r="3.5" className="color-fill pearl" />
            <circle cx="244" cy="135" r="3.8" className="color-fill pearl" />
            <circle cx="252" cy="135" r="3.8" className="color-fill pearl" />
            <circle cx="260" cy="134" r="3.5" className="color-fill pearl" />
            <circle cx="268" cy="132" r="3.5" className="color-fill pearl" />
          </g>

          {/* Center Gem on Hair Brooch */}
          <circle cx="248" cy="122" r="6" className="color-fill jewel-gold" fill="url(#krishnaGoldGrad)" />
          <circle cx="248" cy="122" r="3" className="color-fill jewel-ruby" fill="#ef4444" />
        </g>

        {/* 4. LITTLE KRISHNA'S FACE & HEAD */}
        <g className="art-layer face-layer">
          {/* Back of Head / Hair base */}
          <path
            d="M 165 195 C 155 140 210 120 250 120 C 290 120 345 140 335 195 C 342 225 330 255 315 270 C 285 305 215 305 185 270 C 170 255 158 225 165 195 Z"
            className="color-fill hair-fill"
            fill="url(#krishnaHairGrad)"
          />

          {/* Chubby Baby Face Contour */}
          <path
            d="M 178 185 C 172 230 188 285 250 285 C 312 285 328 230 322 185 C 322 145 178 145 178 185 Z"
            className="color-fill skin-fill"
            fill="url(#krishnaSkinGrad)"
          />
          {/* Face Outline Stroke */}
          <path
            d="M 178 185 C 172 230 188 285 250 285 C 312 285 328 230 322 185"
            className="stroke-elem face-outline"
          />

          {/* Cute Curly Sideburns / Locks */}
          <path d="M 175 165 Q 165 180 174 195" className="stroke-elem hair-curl" />
          <path d="M 172 185 Q 160 200 172 215" className="stroke-elem hair-curl" />
          <path d="M 325 165 Q 335 180 326 195" className="stroke-elem hair-curl" />
          <path d="M 328 185 Q 340 200 328 215" className="stroke-elem hair-curl" />

          {/* Cute Little Ears */}
          {/* Left Ear */}
          <path
            d="M 175 195 C 160 195 160 225 175 225"
            className="color-fill skin-fill stroke-elem"
            fill="url(#krishnaSkinGrad)"
          />
          {/* Right Ear */}
          <path
            d="M 325 195 C 340 195 340 225 325 225"
            className="color-fill skin-fill stroke-elem"
            fill="url(#krishnaSkinGrad)"
          />

          {/* Gold Earrings (Kundal) with Pearl Drops */}
          {/* Left Kundal */}
          <circle cx="166" cy="226" r="4.5" className="color-fill jewel-gold" fill="url(#krishnaGoldGrad)" />
          <circle cx="166" cy="234" r="3" className="color-fill pearl" fill="#ffffff" />
          {/* Right Kundal */}
          <circle cx="334" cy="226" r="4.5" className="color-fill jewel-gold" fill="url(#krishnaGoldGrad)" />
          <circle cx="334" cy="234" r="3" className="color-fill pearl" fill="#ffffff" />
        </g>

        {/* 5. SACRED TILAK (ચંદન અને કંકુ તિલક) */}
        <g className="art-layer tilak-layer">
          {/* Chandan U-Shape */}
          <path
            d="M 242 142 L 242 166 C 242 173 258 173 258 166 L 258 142"
            className="stroke-elem tilak-chandan"
            stroke="#fde047"
            strokeWidth="3.2"
          />
          {/* Red Kumkum / Kasturi Center Line */}
          <path
            d="M 250 148 L 250 176"
            className="stroke-elem tilak-kumkum"
            stroke="#ef4444"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Center Red Bindi */}
          <circle cx="250" cy="180" r="2.2" className="color-fill tilak-dot" fill="#ef4444" />
        </g>

        {/* 6. FACIAL FEATURES (કમળ જેવાં નયન, સ્મિત અને નાક) */}
        <g className="art-layer features-layer">
          {/* Gentle Arched Eyebrows */}
          <path d="M 205 186 Q 220 180 234 186" className="stroke-elem eyebrow" />
          <path d="M 266 186 Q 280 180 295 186" className="stroke-elem eyebrow" />

          {/* Serene Smiling Lotus Petal Eyes */}
          <path d="M 205 198 Q 220 208 235 198" className="stroke-elem eye" />
          <path d="M 265 198 Q 280 208 295 198" className="stroke-elem eye" />

          {/* Cute Baby Button Nose */}
          <path d="M 247 212 Q 250 219 253 212" className="stroke-elem nose" />

          {/* Rosy Smiling Baby Cheeks */}
          <circle cx="204" cy="226" r="12" className="color-fill cheek-blush" fill="#f43f5e" opacity="0.22" />
          <circle cx="296" cy="226" r="12" className="color-fill cheek-blush" fill="#f43f5e" opacity="0.22" />

          {/* Sweet Smiling Lips */}
          <path
            d="M 235 242 Q 250 240 265 242 Q 250 256 235 242 Z"
            className="color-fill lips-fill stroke-elem"
            fill="#f43f5e"
          />
          {/* Smile line */}
          <path d="M 232 242 Q 250 252 268 242" className="stroke-elem smile-line" />
        </g>

        {/* 7. PEARL NECKLACE (વૈજયંતી માળા) */}
        <g className="art-layer necklace-layer color-fill" fill="#ffffff">
          <circle cx="225" cy="295" r="4" className="color-fill pearl" />
          <circle cx="235" cy="301" r="4.2" className="color-fill pearl" />
          <circle cx="245" cy="304" r="4.5" className="color-fill pearl" />
          <circle cx="255" cy="304" r="4.5" className="color-fill pearl" />
          <circle cx="265" cy="301" r="4.2" className="color-fill pearl" />
          <circle cx="275" cy="295" r="4" className="color-fill pearl" />

          {/* Gold Locket with Red Gem */}
          <path
            d="M 250 306 L 256 316 L 250 324 L 244 316 Z"
            className="color-fill jewel-gold"
            fill="url(#krishnaGoldGrad)"
          />
          <circle cx="250" cy="315" r="3" className="color-fill jewel-ruby" fill="#ef4444" />
        </g>

        {/* 8. GOLDEN BANSURI (વાંસળી) & LITTLE HANDS */}
        <g className="art-layer flute-layer">
          {/* Flute Body (Golden Bamboo) */}
          <rect
            x="130"
            y="255"
            width="250"
            height="14"
            rx="7"
            transform="rotate(-8 255 262)"
            className="color-fill flute-body stroke-elem"
            fill="url(#krishnaGoldGrad)"
          />
          {/* Flute Golden Bands & Holes */}
          <circle cx="205" cy="265" r="2.5" className="color-fill flute-hole" fill="#78350f" />
          <circle cx="225" cy="262" r="2.5" className="color-fill flute-hole" fill="#78350f" />
          <circle cx="245" cy="259" r="2.5" className="color-fill flute-hole" fill="#78350f" />
          <circle cx="265" cy="256" r="2.5" className="color-fill flute-hole" fill="#78350f" />

          {/* Hanging Flute Silk Tassels & Pearls */}
          <path d="M 370 248 Q 380 268 375 295" className="stroke-elem tassel-string" />
          <circle cx="375" cy="298" r="4" className="color-fill pearl" fill="#ffffff" />
          {/* Silk Tassel Cone */}
          <path
            d="M 371 300 L 379 300 L 383 322 L 367 322 Z"
            className="color-fill tassel-silk"
            fill="#ef4444"
          />

          {/* Little Baby Hands holding Flute */}
          {/* Left Hand Fingers & Wrist */}
          <path
            d="M 195 272 C 190 260 210 252 218 262 C 220 274 205 282 195 272 Z"
            className="color-fill skin-fill stroke-elem"
            fill="url(#krishnaSkinGrad)"
          />
          {/* Gold Bangle on Left Wrist */}
          <ellipse cx="192" cy="275" rx="4" ry="7" className="color-fill jewel-gold" fill="url(#krishnaGoldGrad)" />

          {/* Right Hand Fingers & Wrist */}
          <path
            d="M 285 260 C 280 248 300 240 308 250 C 310 262 295 270 285 260 Z"
            className="color-fill skin-fill stroke-elem"
            fill="url(#krishnaSkinGrad)"
          />
          {/* Gold Bangle on Right Wrist */}
          <ellipse cx="308" cy="255" rx="4" ry="7" className="color-fill jewel-gold" fill="url(#krishnaGoldGrad)" />
        </g>

        {/* 9. MAKHAN MATKI (માખણની મટકી) */}
        <g className="art-layer matki-layer">
          {/* Main Earthen Pot Body */}
          <path
            d="M 210 395 C 170 425 185 495 250 495 C 315 495 330 425 290 395 C 275 385 225 385 210 395 Z"
            className="color-fill matki-body stroke-elem"
            fill="url(#matkiGrad)"
          />

          {/* Matki Rim / Neck */}
          <ellipse
            cx="250"
            cy="392"
            rx="42"
            ry="11"
            className="color-fill matki-rim stroke-elem"
            fill="#9a3412"
          />

          {/* Traditional Geometric Pattern on Pot */}
          <path
            d="M 188 440 Q 250 460 312 440"
            className="stroke-elem matki-line"
            stroke="#fbbf24"
            strokeDasharray="5 5"
          />

          {/* Creamy White Fluffy Butter (માખણ) Overflowing */}
          <path
            d="M 216 392 C 222 376 240 372 250 376 C 260 372 278 376 284 392 C 290 405 270 415 250 412 C 230 415 210 405 216 392 Z"
            className="color-fill butter-top stroke-elem"
            fill="url(#butterGrad)"
          />

          {/* Butter Dripping Down the Pot */}
          <path
            d="M 240 408 C 240 428 248 438 248 444 C 248 448 243 451 240 448 C 237 444 235 432 235 410 Z"
            className="color-fill butter-drip"
            fill="#ffffff"
          />
          <path
            d="M 262 408 C 262 422 268 428 266 432 C 264 435 260 435 258 430 C 257 425 258 418 258 409 Z"
            className="color-fill butter-drip"
            fill="#ffffff"
          />
        </g>

        {/* 10. FLOATING SPIRITUAL SPARKLES & STARS */}
        <g className="art-layer sparkles-layer">
          <path d="M 140 120 L 143 130 L 153 133 L 143 136 L 140 146 L 137 136 L 127 133 L 137 130 Z" className="color-fill sparkle" fill="#fde047" />
          <path d="M 370 140 L 372 147 L 379 149 L 372 151 L 370 158 L 368 151 L 361 149 L 368 147 Z" className="color-fill sparkle s-delay-1" fill="#fde047" />
          <path d="M 125 320 L 127 325 L 132 327 L 127 329 L 125 334 L 123 329 L 118 327 L 123 325 Z" className="color-fill sparkle s-delay-2" fill="#38bdf8" />
          <path d="M 385 360 L 387 366 L 393 368 L 387 370 L 385 376 L 383 370 L 377 368 L 383 366 Z" className="color-fill sparkle s-delay-3" fill="#fde047" />
          <circle cx="150" cy="220" r="2.5" className="color-fill sparkle-dot" fill="#fde047" />
          <circle cx="365" cy="210" r="2.5" className="color-fill sparkle-dot" fill="#fde047" />
          <circle cx="190" cy="80" r="2" className="color-fill sparkle-dot" fill="#ffffff" />
          <circle cx="330" cy="100" r="2" className="color-fill sparkle-dot" fill="#ffffff" />
        </g>
      </svg>

      {/* Discrete Replay Button for user to experience drawing again */}
      <button
        type="button"
        className="krishna-replay-btn"
        onClick={handleReplay}
        title="ફરીથી ડ્રોઇંગ એનિમેશન જુઓ (Replay Animation)"
        aria-label="Replay Little Krishna Drawing"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
        <span>Replay</span>
      </button>
    </div>
  );
}
