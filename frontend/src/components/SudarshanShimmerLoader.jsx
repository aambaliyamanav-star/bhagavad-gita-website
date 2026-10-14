import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import "./SudarshanShimmerLoader.css";

// =========================================================
// SUDARSHAN CHAKRA SVG COMPONENT
// =========================================================
export function SudarshanChakraIcon({ size = 72, className = "" }) {
  // Generate 16 divine teeth/blades around the perimeter
  const numTeeth = 16;
  const cx = 50;
  const cy = 50;
  const rBase = 38;
  const rTip = 49;
  const rValley = 37;

  // Build the outer serrated cutting flames path
  let bladesPath = "";
  for (let i = 0; i < numTeeth; i++) {
    const angleStart = (i * 2 * Math.PI) / numTeeth;
    const angleTip = ((i + 0.6) * 2 * Math.PI) / numTeeth;
    const angleEnd = ((i + 1) * 2 * Math.PI) / numTeeth;

    const x1 = cx + rBase * Math.cos(angleStart);
    const y1 = cy + rBase * Math.sin(angleStart);

    const xTip = cx + rTip * Math.cos(angleTip);
    const yTip = cy + rTip * Math.sin(angleTip);

    const x2 = cx + rValley * Math.cos(angleEnd);
    const y2 = cy + rValley * Math.sin(angleEnd);

    if (i === 0) {
      bladesPath += `M ${x1.toFixed(2)} ${y1.toFixed(2)} `;
    }
    // Curved cutting tooth
    bladesPath += `Q ${(cx + (rTip + 2) * Math.cos(angleStart + 0.2)).toFixed(2)} ${(
      cy +
      (rTip + 2) * Math.sin(angleStart + 0.2)
    ).toFixed(2)} ${xTip.toFixed(2)} ${yTip.toFixed(2)} `;
    bladesPath += `L ${x2.toFixed(2)} ${y2.toFixed(2)} `;
  }
  bladesPath += "Z";

  // 16 inner radiating golden spokes
  const spokes = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * 2 * Math.PI) / 16;
    const xHub = cx + 13 * Math.cos(angle);
    const yHub = cy + 13 * Math.sin(angle);
    const xRim = cx + 33 * Math.cos(angle);
    const yRim = cy + 33 * Math.sin(angle);
    spokes.push({ x1: xHub, y1: yHub, x2: xRim, y2: yRim });
  }

  return (
    <div className={`sudarshan-chakra-wrapper ${className}`} style={{ width: size, height: size }}>
      {/* Divine Breathing Aura Glow */}
      <div className="sudarshan-aura" />

      {/* Rotating Sacred Chakra */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sudarshan-chakra-svg"
      >
        <defs>
          {/* Gold Radiant Gradient */}
          <linearGradient id="sudarshanGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff2a8" />
            <stop offset="25%" stopColor="#ffd54f" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Core Central Glow */}
          <radialGradient id="sudarshanCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#ffd54f" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          {/* Spoke Stroke Gradient */}
          <linearGradient id="spokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* 1. Outer Serrated Cutting Flames (Blades) */}
        <path
          d={bladesPath}
          fill="url(#sudarshanGoldGrad)"
          stroke="#ffd54f"
          strokeWidth="0.8"
        />

        {/* 2. Outer Rim Ring */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="url(#sudarshanGoldGrad)"
          strokeWidth="2.5"
        />

        {/* 3. Ornamental Beaded Middle Ring */}
        <circle
          cx="50"
          cy="50"
          r="33"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />

        {/* 4. Radiating 16 Golden Spokes */}
        {spokes.map((spoke, idx) => (
          <line
            key={idx}
            x1={spoke.x1}
            y1={spoke.y1}
            x2={spoke.x2}
            y2={spoke.y2}
            stroke="url(#spokeGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ))}

        {/* 5. Inner Hub Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="14"
          fill="url(#sudarshanGoldGrad)"
          stroke="#fef08a"
          strokeWidth="1.5"
        />

        {/* 6. Central Divine Bindu */}
        <circle
          cx="50"
          cy="50"
          r="8.5"
          fill="url(#sudarshanCoreGrad)"
        />

        {/* 7. Center Radiant Eye */}
        <circle
          cx="50"
          cy="50"
          r="3.5"
          fill="#ffffff"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

// =========================================================
// MAIN DIVINE SHIMMER LOADER COMPONENT
// =========================================================
export default function SudarshanShimmerLoader({
  type = "reader", // "reader" | "cards" | "quiz" | "simple"
  title,
  subtitle,
  count = 3,
  chakraSize = 72,
  className = "",
}) {
  let currentTheme = "light";
  try {
    const themeCtx = useTheme();
    if (themeCtx?.theme) {
      currentTheme = themeCtx.theme;
    }
  } catch (e) {
    // Fallback gracefully to html data-theme
    if (typeof document !== "undefined") {
      currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    }
  }

  let isHindi = false;
  let isEnglish = false;
  try {
    const langCtx = useLanguage();
    if (langCtx) {
      isHindi = langCtx.isHindi;
      isEnglish = langCtx.isEnglish;
    }
  } catch (e) {}

  // Determine localized title and subtitle
  let displayTitle = title;
  if (!displayTitle || displayTitle === "દિવ્ય જ્ઞાન લોડ થઈ રહ્યું છે...") {
    displayTitle = isEnglish
      ? "Loading divine wisdom..."
      : isHindi
      ? "दिव्य ज्ञान लोड हो रहा है..."
      : "દિવ્ય જ્ઞાન લોડ થઈ રહ્યું છે...";
  } else if (isEnglish) {
    if (displayTitle === "ગીતા જ્ઞાન ક્વિઝ લોડ થઈ રહી છે..." || displayTitle === "गीता ज्ञान प्रश्नोत्तरी लोड हो रही है...") {
      displayTitle = "Loading Gita Knowledge Quiz...";
    } else if (displayTitle === "Quiz પરિણામ તૈયાર થઈ રહ્યું છે..." || displayTitle === "प्रश्नोत्तरी परिणाम तैयार हो रहा है...") {
      displayTitle = "Preparing Quiz Results...";
    } else if (displayTitle === "સિદ્ધિઓ લોડ થઈ રહી છે..." || displayTitle === "उपलब्धियां लोड हो रही हैं...") {
      displayTitle = "Loading Achievements...";
    } else if (typeof displayTitle === "string" && (displayTitle.includes("ના શ્લોક લોડ થઈ રહ્યા છે...") || displayTitle.includes("के श्लोक लोड हो रहे हैं..."))) {
      displayTitle = displayTitle
        .replace(/અધ્યાય|अध्याय/g, "Chapter ")
        .replace(/(ના શ્લોક લોડ થઈ રહ્યા છે\.\.\.|के श्लोक लोड हो रहे हैं\.\.\.)/g, " shlokas are loading...");
    }
  } else if (isHindi) {
    // Automatic translation mapping for common Gujarati loader titles
    if (displayTitle === "ગીતા જ્ઞાન ક્વિઝ લોડ થઈ રહી છે...") {
      displayTitle = "गीता ज्ञान प्रश्नोत्तरी लोड हो रही है...";
    } else if (displayTitle === "Quiz પરિણામ તૈયાર થઈ રહ્યું છે...") {
      displayTitle = "प्रश्नोत्तरी परिणाम तैयार हो रहा है...";
    } else if (displayTitle === "સિદ્ધિઓ લોડ થઈ રહી છે...") {
      displayTitle = "उपलब्धियां लोड हो रही हैं...";
    } else if (typeof displayTitle === "string" && displayTitle.includes("ના શ્લોક લોડ થઈ રહ્યા છે...")) {
      displayTitle = displayTitle
        .replace(/અધ્યાય/g, "अध्याय")
        .replace(/ના શ્લોક લોડ થઈ રહ્યા છે\.\.\./g, "के श्लोक लोड हो रहे हैं...");
    }
  }

  let displaySubtitle = subtitle;
  if (!displaySubtitle || displaySubtitle === "કૃપા કરીને થોડી ક્ષણ રાહ જુઓ ॥ શ્રીકૃષ્ણાર્પણમસ્તુ ॥") {
    displaySubtitle = isEnglish
      ? "Please wait a moment ॥ Shree Krishnarpanamastu ॥"
      : isHindi
      ? "कृपया कुछ क्षण प्रतीक्षा करें ॥ श्रीकृष्णार्पणमस्तु ॥"
      : "કૃપા કરીને થોડી ક્ષણ રાહ જુઓ ॥ શ્રીકૃષ્ણાર્પણમસ્તુ ॥";
  } else if (isEnglish) {
    if (displaySubtitle === "પ્રશ્નો અને આધ્યાત્મિક વિકલ્પો તૈયાર થઈ રહ્યા છે..." || displaySubtitle === "प्रश्न और आध्यात्मिक विकल्प तैयार हो रहे हैं...") {
      displaySubtitle = "Questions and spiritual options are being prepared...";
    } else if (displaySubtitle === "તમારી આધ્યાત્મિક પ્રગતિનું વિશ્લેષણ થઈ રહ્યું છે..." || displaySubtitle === "आपकी आध्यात्मिक प्रगति का विश्लेषण हो रहा है...") {
      displaySubtitle = "Analyzing your spiritual progress...";
    } else if (displaySubtitle === "પવિત્ર ગીતા વાણીનું સંકલન થઈ રહ્યું છે..." || displaySubtitle === "पवित्र गीता वाणी का संकलन हो रहा है...") {
      displaySubtitle = "Compiling sacred Gita teachings...";
    }
  } else if (isHindi) {
    if (displaySubtitle === "પ્રશ્નો અને આધ્યાત્મિક વિકલ્પો તૈયાર થઈ રહ્યા છે...") {
      displaySubtitle = "प्रश्न और आध्यात्मिक विकल्प तैयार हो रहे हैं...";
    } else if (displaySubtitle === "તમારી આધ્યાત્મિક પ્રગતિનું વિશ્લેષણ થઈ રહ્યું છે...") {
      displaySubtitle = "आपकी आध्यात्मिक प्रगति का विश्लेषण हो रहा है...";
    } else if (displaySubtitle === "પવિત્ર ગીતા વાણીનું સંકલન થઈ રહ્યું છે...") {
      displaySubtitle = "पवित्र गीता वाणी का संकलन हो रहा है...";
    }
  }

  return (
    <div className={`sudarshan-shimmer-container ${currentTheme} ${className}`}>
      {/* =====================================================
          1. SACRED SUDARSHAN CHAKRA & STATUS HEADER
      ===================================================== */}
      <div className="sudarshan-loader-header">
        <SudarshanChakraIcon size={chakraSize} />
        {displayTitle && <h3 className="sudarshan-loader-title">{displayTitle}</h3>}
        {displaySubtitle && <p className="sudarshan-loader-subtitle">{displaySubtitle}</p>}
      </div>

      {/* =====================================================
          2. MODERN SHIMMER SKELETON (VARIANT SPECIFIC)
      ===================================================== */}

      {/* VARIANT A: CHAPTER READER SKELETON */}
      {type === "reader" && (
        <div className="shimmer-skeleton-reader">
          {/* Top Badge & Audio Controls Skeleton */}
          <div className="shimmer-reader-top-bar">
            <div className="shimmer-pill w-32" />
            <div className="shimmer-circle" />
            <div className="shimmer-circle" />
          </div>

          {/* Shloka Sanskrit Card Skeleton */}
          <div className="shimmer-card shimmer-shloka-card">
            <div className="shimmer-om-badge" />
            <div className="shimmer-line shloka-sanskrit w-85" />
            <div className="shimmer-line shloka-sanskrit w-90" />
            <div className="shimmer-line shloka-sanskrit w-80" />
            <div className="shimmer-divider" />
            <div className="shimmer-line shloka-english w-70" />
          </div>

          {/* Gujarati Translation & Meaning Card Skeleton */}
          <div className="shimmer-card shimmer-meaning-card">
            <div className="shimmer-pill w-40" />
            <div className="shimmer-line w-95" />
            <div className="shimmer-line w-100" />
            <div className="shimmer-line w-88" />
            <div className="shimmer-line w-75" />
          </div>

          {/* Bottom Navigation Shimmer Buttons */}
          <div className="shimmer-reader-nav-bar">
            <div className="shimmer-pill nav-btn w-36" />
            <div className="shimmer-pill nav-btn w-36" />
          </div>
        </div>
      )}

      {/* VARIANT B: CARD GRID SKELETON (FOR FAVOURITES & CHAPTERS) */}
      {type === "cards" && (
        <div className="shimmer-skeleton-cards">
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="shimmer-card shimmer-grid-item">
              <div className="shimmer-card-header">
                <div className="shimmer-pill w-28" />
                <div className="shimmer-circle-small" />
              </div>
              <div className="shimmer-line w-90" />
              <div className="shimmer-line w-80" />
              <div className="shimmer-line w-60" />
              <div className="shimmer-card-footer">
                <div className="shimmer-pill w-24" />
                <div className="shimmer-pill w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VARIANT C: QUIZ SKELETON */}
      {type === "quiz" && (
        <div className="shimmer-skeleton-quiz">
          {/* Quiz Header & Progress Bar */}
          <div className="shimmer-quiz-progress-bar" />

          {/* Question Box */}
          <div className="shimmer-card shimmer-question-card">
            <div className="shimmer-pill w-32" />
            <div className="shimmer-line question-line w-95" />
            <div className="shimmer-line question-line w-85" />
          </div>

          {/* 4 Quiz Options */}
          <div className="shimmer-quiz-options">
            <div className="shimmer-quiz-option-pill" />
            <div className="shimmer-quiz-option-pill" />
            <div className="shimmer-quiz-option-pill" />
            <div className="shimmer-quiz-option-pill" />
          </div>
        </div>
      )}

      {/* VARIANT D: SIMPLE (JUST CHAKRA & DIVINE GLOW) */}
      {type === "simple" && (
        <div className="shimmer-skeleton-simple">
          <div className="shimmer-line w-60 mx-auto" />
        </div>
      )}
    </div>
  );
}

