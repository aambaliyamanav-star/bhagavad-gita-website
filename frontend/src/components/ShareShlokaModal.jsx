import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Palette,
  MessageCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./ShareShlokaModal.css";

const THEMES = [
  {
    id: "royal-blue",
    name: "રોયલ બ્લુ",
    nameHi: "रॉयल ब्लू",
    englishName: "Royal Blue",
    primaryGrad: ["#0f2b5c", "#18458b", "#0a1d40"],
    borderGold: "#f5c542",
    innerBorder: "rgba(245, 197, 66, 0.45)",
    headerColor: "#ffe484",
    sanskritColor: "#ffffff",
    sanskritAccent: "#ffd54f",
    sanskritBoxBg: "rgba(255, 255, 255, 0.07)",
    sanskritBoxBorder: "rgba(245, 197, 66, 0.35)",
    translationColor: "#f0f5ff",
    footerColor: "#9bc5fa",
    glowColor: "rgba(37, 99, 235, 0.55)",
    sampleColor: "#18458b"
  },
  {
    id: "saffron-gold",
    name: "દિવ્ય ભગવો",
    nameHi: "दिव्य भगवा",
    englishName: "Divine Saffron",
    primaryGrad: ["#8f2c00", "#b83d02", "#661f00"],
    borderGold: "#ffd54f",
    innerBorder: "rgba(255, 213, 79, 0.5)",
    headerColor: "#fff0a6",
    sanskritColor: "#ffffff",
    sanskritAccent: "#ffe082",
    sanskritBoxBg: "rgba(255, 255, 255, 0.08)",
    sanskritBoxBorder: "rgba(255, 213, 79, 0.4)",
    translationColor: "#fff9f0",
    footerColor: "#ffcc80",
    glowColor: "rgba(249, 115, 22, 0.6)",
    sampleColor: "#b83d02"
  },
  {
    id: "vedic-maroon",
    name: "વેદિક મરૂન",
    nameHi: "वैदिक महरून",
    englishName: "Vedic Maroon",
    primaryGrad: ["#5e0d1b", "#801627", "#420610"],
    borderGold: "#f7d070",
    innerBorder: "rgba(247, 208, 112, 0.45)",
    headerColor: "#ffeaa7",
    sanskritColor: "#ffffff",
    sanskritAccent: "#ffd369",
    sanskritBoxBg: "rgba(255, 255, 255, 0.07)",
    sanskritBoxBorder: "rgba(247, 208, 112, 0.35)",
    translationColor: "#fff0f3",
    footerColor: "#f8b4be",
    glowColor: "rgba(225, 29, 72, 0.5)",
    sampleColor: "#801627"
  },
  {
    id: "surya-gold",
    name: "સૂર્ય પીતાંબર",
    nameHi: "सूर्य पीतांबर",
    englishName: "Surya Pitambar",
    primaryGrad: ["#5e3a00", "#8a5700", "#422800"],
    borderGold: "#ffe57f",
    innerBorder: "rgba(255, 229, 127, 0.45)",
    headerColor: "#fff8d6",
    sanskritColor: "#ffffff",
    sanskritAccent: "#ffe082",
    sanskritBoxBg: "rgba(255, 255, 255, 0.08)",
    sanskritBoxBorder: "rgba(255, 229, 127, 0.35)",
    translationColor: "#fffdf2",
    footerColor: "#ffe57f",
    glowColor: "rgba(245, 158, 11, 0.55)",
    sampleColor: "#8a5700"
  },
  {
    id: "royal-purple",
    name: "રાજવી પર્પલ",
    nameHi: "शाही पर्पल",
    englishName: "Royal Purple",
    primaryGrad: ["#381150", "#541b77", "#240835"],
    borderGold: "#fde047",
    innerBorder: "rgba(253, 224, 71, 0.45)",
    headerColor: "#fae8ff",
    sanskritColor: "#ffffff",
    sanskritAccent: "#e9d5ff",
    sanskritBoxBg: "rgba(255, 255, 255, 0.07)",
    sanskritBoxBorder: "rgba(253, 224, 71, 0.35)",
    translationColor: "#faf5ff",
    footerColor: "#d8b4fe",
    glowColor: "rgba(168, 85, 247, 0.55)",
    sampleColor: "#541b77"
  },
  {
    id: "lotus-rose",
    name: "દિવ્ય પદ્મ",
    nameHi: "दिव्य पद्म",
    englishName: "Divine Lotus",
    primaryGrad: ["#570b28", "#7d133c", "#3b0519"],
    borderGold: "#f9d276",
    innerBorder: "rgba(249, 210, 118, 0.45)",
    headerColor: "#ffe4ec",
    sanskritColor: "#ffffff",
    sanskritAccent: "#fbcfe8",
    sanskritBoxBg: "rgba(255, 255, 255, 0.07)",
    sanskritBoxBorder: "rgba(249, 210, 118, 0.35)",
    translationColor: "#fff0f5",
    footerColor: "#f472b6",
    glowColor: "rgba(225, 29, 100, 0.55)",
    sampleColor: "#7d133c"
  },
  {
    id: "mystic-copper",
    name: "દિવ્ય તાંબ્ર",
    nameHi: "दिव्य ताम्र",
    englishName: "Mystic Copper",
    primaryGrad: ["#4e2810", "#6f3a18", "#381c09"],
    borderGold: "#ffd54f",
    innerBorder: "rgba(255, 213, 79, 0.45)",
    headerColor: "#fff2cd",
    sanskritColor: "#ffffff",
    sanskritAccent: "#f6c343",
    sanskritBoxBg: "rgba(255, 255, 255, 0.08)",
    sanskritBoxBorder: "rgba(255, 213, 79, 0.35)",
    translationColor: "#fef8f0",
    footerColor: "#fcd34d",
    glowColor: "rgba(234, 88, 12, 0.55)",
    sampleColor: "#6f3a18"
  }
];

function drawRoundRect(ctx, x, y, w, h, radius, fillStyle, strokeStyle, lineWidth = 1) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function cleanHtmlText(htmlString) {
  if (!htmlString) return "";

  // Replace <br> and block elements with newlines first so lines are never merged together
  const converted = String(htmlString)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|blockquote|h[1-6]|tr)>/gi, "\n")
    .replace(/<(div|p|li|blockquote|h[1-6]|tr)[^>]*>/gi, "\n");

  const temp = document.createElement("div");
  temp.innerHTML = converted;

  let text = temp.textContent || temp.innerText || "";

  // Strip any remaining HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Unescape standard HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  // Normalize line endings and duplicate whitespace
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const paragraphs = String(text).split("\n");
  const allLines = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const words = trimmed.split(" ");
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + " " + word : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && currentLine) {
        allLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

function extractMessagePoints(htmlOrText) {
  if (!htmlOrText) return [];

  // Convert HTML cleanly with cleanHtmlText which converts <p>, <div>, <li>, <br> to \n
  const clean = cleanHtmlText(htmlOrText);
  if (!clean) return [];

  // 1. Split by newlines from paragraphs, lists, divs, or breaks
  const byNewlines = clean
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  if (byNewlines.length > 1) {
    return byNewlines;
  }

  // 2. Look for topic breaks like "1. ", "2. ", "•", "✦", or "Title : " following sentence end
  const byTopic = clean.split(/(?<=[.!?।॥])\s+(?=[^.:?!]{2,30}\s*:\s*)/g);
  if (byTopic.length > 1) {
    return byTopic.map((s) => s.trim()).filter((s) => s.length > 3);
  }

  return [clean];
}

export default function ShareShlokaModal({
  isOpen,
  onClose,
  shlokaData
}) {
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();
  const canvasRef = useRef(null);
  const logoImageRef = useRef(null);
  const [selectedThemeId, setSelectedThemeId] = useState("royal-blue");
  const [previewUrl, setPreviewUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-load App Logo for Background Watermark
  useEffect(() => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = "/icons/icon-512x512.png";
    img.onload = () => {
      logoImageRef.current = img;
      if (isOpen && shlokaData) {
        renderCanvasCard();
      }
    };
    if (img.complete && img.naturalWidth > 0) {
      logoImageRef.current = img;
    }
  }, [isOpen, shlokaData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const currentTheme =
    THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];

  useEffect(() => {
    if (!isOpen || !shlokaData) return;

    const timer = setTimeout(() => {
      renderCanvasCard();
    }, 16);

    return () => clearTimeout(timer);
  }, [isOpen, shlokaData, selectedThemeId]);

  const renderCanvasCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      const ctx = canvas.getContext("2d");
      const width = 1080;

      // 1. Prepare Text & Measurements
      const chNum = shlokaData.chapterNumber || 1;
      const chName = shlokaData.chapterName ? cleanHtmlText(shlokaData.chapterName) : "";
      const shlokNum = shlokaData.shlokNumber || 1;
      const cleanSpeaker = cleanHtmlText(shlokaData.speaker || "");

      // Measure Translation & Message FIRST so hasMessage is available everywhere
      const cleanTranslation = cleanHtmlText(
        shlokaData.translation ||
        shlokaData.gujaratiSummary ||
        shlokaData.meaning ||
        ""
      );
      const messagePoints = extractMessagePoints(shlokaData.message);
      const hasMessage = messagePoints.length > 0;

      const cleanSanskrit = cleanHtmlText(
        shlokaData.sanskrit || shlokaData.sanskritExcerpt || ""
      );
      let rawSanskritLines = cleanSanskrit
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (
        rawSanskritLines.length === 1 &&
        (rawSanskritLines[0].includes("।") || rawSanskritLines[0].includes("|"))
      ) {
        const parts = rawSanskritLines[0]
          .split(/(?<=[।|]+)/g)
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length > 1) {
          rawSanskritLines = parts;
        }
      }

      // 2. Pre-calculate Layout and Auto-Scale to Fit Within Card Borders
      const cardHeight = 1920;
      canvas.width = width;
      canvas.height = cardHeight;

      const outerMargin = 38;
      const innerMargin = 52;

      // Header Block vertical coordinates
      const headingCenterY = innerMargin + 66; // 118px (Comfortably below top inner border at y=52)
      const badgeH = 54;
      const badgeCenterY = headingCenterY + 74; // 192px
      const speakerH = cleanSpeaker ? 40 : 0;
      const speakerCenterY = cleanSpeaker ? badgeCenterY + badgeH / 2 + 36 : badgeCenterY + badgeH / 2;
      const headerDividerY = cleanSpeaker ? speakerCenterY + 22 + 30 : badgeCenterY + badgeH / 2 + 32;

      // Footer Block vertical limits (Firm boundary strictly above bottom inner border and footer branding)
      const footerDividerY = cardHeight - innerMargin - 66; // 1802px
      const maxContentBottom = footerDividerY - 26; // 1776px
      const availableH = maxContentBottom - headerDividerY; // ~1460px

      const sanskritBoxW = width - 110; // 970px
      const sanskritMaxW = sanskritBoxW - 50; // 920px
      const mainTextMaxW = width - 140; // 940px

      // Simulation evaluator to find exact height at any scale
      const evaluateLayout = (scale) => {
        // Sanskrit sizing
        let sFontSize = Math.max(28, Math.round((hasMessage ? 42 : 48) * Math.min(1.0, scale + 0.08)));
        ctx.font = `bold ${sFontSize}px "Noto Sans Devanagari", "Noto Sans Gujarati", serif`;
        if (rawSanskritLines.length > 0) {
          let maxLineW = Math.max(...rawSanskritLines.map((l) => ctx.measureText(l).width));
          while (maxLineW > sanskritMaxW && sFontSize > 24) {
            sFontSize -= 1;
            ctx.font = `bold ${sFontSize}px "Noto Sans Devanagari", "Noto Sans Gujarati", serif`;
            maxLineW = Math.max(...rawSanskritLines.map((l) => ctx.measureText(l).width));
          }
        }
        const sLineH = Math.round(sFontSize * 1.62);
        const sVertPad = Math.round(sFontSize * (hasMessage ? 0.68 : 0.88));

        const wrappedS = [];
        if (rawSanskritLines.length > 0) {
          rawSanskritLines.forEach((line) => {
            wrappedS.push(...wrapText(ctx, line, sanskritMaxW));
          });
        } else {
          wrappedS.push(...wrapText(ctx, cleanSanskrit, sanskritMaxW));
        }
        const sToDisplay = wrappedS.length <= 3 ? wrappedS : wrappedS.slice(0, 2);
        const totalSLinesH = (sToDisplay.length - 1) * sLineH;
        const sBoxH = totalSLinesH + sVertPad * 2;
        const totalSH = sBoxH + 16;

        // Translation sizing
        const tFontSize = Math.max(20, Math.round((hasMessage ? 38 : 46) * scale));
        const tLineH = Math.round(tFontSize * 1.65);
        const tTitleH = Math.max(34, Math.round(52 * scale));
        ctx.font = `bold ${tFontSize}px "Noto Sans Gujarati", sans-serif`;
        const wrappedTrans = wrapText(ctx, cleanTranslation, mainTextMaxW);
        const totalTransH = tTitleH + wrappedTrans.length * tLineH;

        // Message sizing
        let totalMsgH = 0;
        let mFontSize = Math.max(18, Math.round(35 * scale));
        let mLineH = Math.round(mFontSize * 1.60);
        let mPointGap = Math.max(12, Math.round(22 * scale));
        let mTitleH = Math.max(34, Math.round(48 * scale));
        let wrappedMsgPoints = [];

        if (hasMessage) {
          ctx.font = `bold ${mFontSize}px "Noto Sans Gujarati", sans-serif`;
          messagePoints.forEach((point) => {
            let prefix = "✦ ";
            if (/^[\d+.)•✦\-\*]/.test(point)) {
              prefix = "";
            }
            const pointText = `${prefix}${point}`;
            const lines = wrapText(ctx, pointText, mainTextMaxW);
            if (lines.length > 0) {
              wrappedMsgPoints.push(lines);
            }
          });

          let totalMLines = 0;
          wrappedMsgPoints.forEach((lines) => {
            totalMLines += lines.length;
          });
          const pointsGaps = Math.max(0, wrappedMsgPoints.length - 1) * mPointGap;
          totalMsgH = 16 + mTitleH + (totalMLines * mLineH) + pointsGaps;
        }

        const numGaps = hasMessage ? 3 : 2;
        const baseGap = Math.max(16, Math.round(30 * scale));
        const totalRequiredH = totalSH + totalTransH + (hasMessage ? totalMsgH : 0) + (numGaps * baseGap);

        return {
          scale,
          totalRequiredH,
          baseGap,
          numGaps,
          sFontSize,
          sLineH,
          sVertPad,
          sBoxH,
          sToDisplay,
          totalSH,
          tFontSize,
          tLineH,
          tTitleH,
          wrappedTrans,
          totalTransH,
          mFontSize,
          mLineH,
          mPointGap,
          mTitleH,
          wrappedMsgPoints,
          totalMsgH,
        };
      };

      // Search for the LARGEST scale factor where all text fits with zero overflow
      let bestLayout = null;
      for (let s = 1.0; s >= 0.46; s -= 0.02) {
        const layout = evaluateLayout(Number(s.toFixed(2)));
        if (layout.totalRequiredH <= availableH || s <= 0.48) {
          bestLayout = layout;
          break;
        }
      }
      if (!bestLayout) {
        bestLayout = evaluateLayout(0.48);
      }

      // Distribute slack evenly so content fills the card proportionally and beautifully
      const totalSlack = Math.max(0, availableH - bestLayout.totalRequiredH);
      const extraPerGap = Math.floor(totalSlack / (bestLayout.numGaps + 1));
      const sectionGap = Math.min(54, bestLayout.baseGap + extraPerGap);

    // 3. Render Background & Frames
    // Radial Gradient
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      cardHeight / 2,
      60,
      width / 2,
      cardHeight / 2,
      Math.max(width, cardHeight) * 0.75
    );
    bgGrad.addColorStop(0, currentTheme.primaryGrad[1]);
    bgGrad.addColorStop(0.55, currentTheme.primaryGrad[0]);
    bgGrad.addColorStop(1, currentTheme.primaryGrad[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, cardHeight);

    // Celestial Ambient Glow (Top Center)
    const topGlow = ctx.createRadialGradient(
      width / 2,
      110,
      10,
      width / 2,
      110,
      width * 0.45
    );
    topGlow.addColorStop(0, currentTheme.glowColor);
    topGlow.addColorStop(1, "transparent");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, cardHeight);

    // Subtle App Logo Background Watermark (Ensures crystal-clear font readability)
    const logoImg = logoImageRef.current;
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.save();
      // Gentle opacity ensuring fonts remain 100% crisp, sharp and high-contrast
      ctx.globalAlpha = 0.085;
      const logoSize = 650;
      const logoX = (width - logoSize) / 2;
      const logoY = (cardHeight - logoSize) / 2 + 40;
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }

    // Ornamental Borders
    // Outer gold border
    ctx.strokeStyle = currentTheme.borderGold;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(
      outerMargin,
      outerMargin,
      width - outerMargin * 2,
      cardHeight - outerMargin * 2
    );

    // Inner hairline gold border
    ctx.strokeStyle = currentTheme.innerBorder;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(
      innerMargin,
      innerMargin,
      width - innerMargin * 2,
      cardHeight - innerMargin * 2
    );

    // Corner Ornaments
    const cornerSize = 22;
    const drawCornerOrnament = (cx, cy) => {
      ctx.fillStyle = currentTheme.borderGold;
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = currentTheme.borderGold;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - cornerSize, cy);
      ctx.lineTo(cx + cornerSize, cy);
      ctx.moveTo(cx, cy - cornerSize);
      ctx.lineTo(cx, cy + cornerSize);
      ctx.stroke();
    };

    drawCornerOrnament(innerMargin, innerMargin);
    drawCornerOrnament(width - innerMargin, innerMargin);
    drawCornerOrnament(innerMargin, cardHeight - innerMargin);
    drawCornerOrnament(width - innerMargin, cardHeight - innerMargin);

    // Ornamental Divider Helper
    const drawDivider = (yPos, widthSpan = 420) => {
      ctx.strokeStyle = currentTheme.innerBorder;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - widthSpan / 2, yPos);
      ctx.lineTo(width / 2 + widthSpan / 2, yPos);
      ctx.stroke();

      // Diamond ornament at center
      ctx.fillStyle = currentTheme.borderGold;
      ctx.beginPath();
      ctx.moveTo(width / 2, yPos - 4.5);
      ctx.lineTo(width / 2 + 5, yPos);
      ctx.lineTo(width / 2, yPos + 4.5);
      ctx.lineTo(width / 2 - 5, yPos);
      ctx.closePath();
      ctx.fill();
    };

    // 4. Render Sacred Header Block (Title + Badge + Speaker at top)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Sacred Heading (Comfortably below top inner border)
    ctx.font = 'bold 62px "Noto Sans Devanagari", "Noto Sans Gujarati", serif';
    ctx.fillStyle = currentTheme.headerColor;
    ctx.fillText(txt("॥ શ્રીમદ્ભગવદ્ગીતા ॥", "॥ श्रीमद्भगवद्गीता ॥", "॥ Shrimad Bhagavad Gita ॥"), width / 2, headingCenterY);

    // Chapter & Shlok Badge Pill (Spaced cleanly below heading)
    const badgeText = chName
      ? txt(`અધ્યાય ${chNum} (${chName}) • શ્લોક ${shlokNum}`, `अध्याय ${chNum} (${chName}) • श्लोक ${shlokNum}`, `Chapter ${chNum} (${chName}) • Shloka ${shlokNum}`)
      : txt(`અધ્યાય ${chNum} • શ્લોક ${shlokNum}`, `अध्याय ${chNum} • श्लोक ${shlokNum}`, `Chapter ${chNum} • Shloka ${shlokNum}`);
    ctx.font = 'bold 30px "Noto Sans Gujarati", sans-serif';
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = Math.min(width - 140, Math.max(340, badgeMetrics.width + 60));

    drawRoundRect(
      ctx,
      width / 2 - badgeW / 2,
      badgeCenterY - badgeH / 2,
      badgeW,
      badgeH,
      29,
      "rgba(0, 0, 0, 0.40)",
      currentTheme.innerBorder,
      1.5
    );

    ctx.fillStyle = currentTheme.footerColor;
    ctx.fillText(badgeText, width / 2, badgeCenterY);

    // Speaker Name (Spaced cleanly below badge)
    if (cleanSpeaker) {
      ctx.font = 'italic 700 42px "Noto Sans Devanagari", "Noto Sans Gujarati", sans-serif';
      ctx.fillStyle = currentTheme.sanskritAccent;
      ctx.fillText(`~ ${cleanSpeaker} ~`, width / 2, speakerCenterY);
    }

    // Header Divider below Header & Speaker Block
    drawDivider(headerDividerY, 520);
    let currY = headerDividerY + sectionGap;

    // 5. Sanskrit Shloka Box (Right below Speaker/Header)
    const boxX = (width - sanskritBoxW) / 2;
    const boxY = currY;

    drawRoundRect(
      ctx,
      boxX,
      boxY,
      sanskritBoxW,
      bestLayout.sBoxH,
      22,
      currentTheme.sanskritBoxBg || "rgba(255, 255, 255, 0.08)",
      currentTheme.sanskritBoxBorder || "rgba(245, 197, 66, 0.40)",
      1.8
    );

    ctx.font = `bold ${bestLayout.sFontSize}px "Noto Sans Devanagari", "Noto Sans Gujarati", serif`;
    ctx.fillStyle = currentTheme.sanskritColor;

    let sLineY = boxY + bestLayout.sVertPad;
    bestLayout.sToDisplay.forEach((line) => {
      ctx.fillText(line, width / 2, sLineY);
      sLineY += bestLayout.sLineH;
    });

    currY = boxY + bestLayout.sBoxH + 16;
    drawDivider(currY, 500);
    currY += sectionGap;

    // 6. Translation Section (Right below Sanskrit)
    const transHeadingSize = Math.max(26, Math.round(36 * (bestLayout.tFontSize / 38)));
    ctx.font = `bold ${transHeadingSize}px "Noto Sans Gujarati", sans-serif`;
    ctx.fillStyle = currentTheme.headerColor;
    ctx.fillText(txt("• ગુજરાતી ભાવાર્થ •", "• हिन्दी भावार्थ •", "• English Translation •"), width / 2, currY + 12);
    currY += bestLayout.tTitleH;

    ctx.font = `bold ${bestLayout.tFontSize}px "Noto Sans Gujarati", sans-serif`;
    ctx.fillStyle = currentTheme.translationColor;

    bestLayout.wrappedTrans.forEach((line) => {
      ctx.fillText(line, width / 2, currY + 10);
      currY += bestLayout.tLineH;
    });

    // 7. Divine Message / Understanding (Right below Translation)
    if (hasMessage && bestLayout.wrappedMsgPoints.length > 0) {
      currY += 16;
      drawDivider(currY, 480);
      currY += sectionGap;

      const msgHeadingSize = Math.max(26, Math.round(34 * (bestLayout.mFontSize / 35)));
      ctx.font = `bold ${msgHeadingSize}px "Noto Sans Gujarati", sans-serif`;
      ctx.fillStyle = currentTheme.sanskritAccent;
      ctx.fillText(txt("✨ દિવ્ય સંદેશ / જીવન બોધ ✨", "✨ दिव्य संदेश / जीवन बोध ✨", "✨ Divine Message / Life Wisdom ✨"), width / 2, currY + 10);
      currY += bestLayout.mTitleH;

      ctx.font = `bold ${bestLayout.mFontSize}px "Noto Sans Gujarati", sans-serif`;
      ctx.fillStyle = currentTheme.translationColor;

      bestLayout.wrappedMsgPoints.forEach((lines, pIdx) => {
        lines.forEach((line) => {
          ctx.fillText(line, width / 2, currY + 8);
          currY += bestLayout.mLineH;
        });
        if (pIdx < bestLayout.wrappedMsgPoints.length - 1) {
          currY += bestLayout.mPointGap;
        }
      });
    }

    // 8. Footer Branding & Website Watermark (Firmly Anchored at Bottom)
    drawDivider(footerDividerY, 480);

    // Sleek Website Link Pill (Professional & Prominent)
    const siteUrl = "gita-gyan-m.vercel.app";
    const pillText = `🔗 ${siteUrl}`;
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const pillMetrics = ctx.measureText(pillText);
    const pillW = Math.min(width - 220, pillMetrics.width + 48);
    const pillH = 38;
    const pillY = footerDividerY + 34;

    drawRoundRect(
      ctx,
      width / 2 - pillW / 2,
      pillY - pillH / 2,
      pillW,
      pillH,
      19,
      "rgba(0, 0, 0, 0.35)",
      currentTheme.innerBorder,
      1.2
    );

    ctx.fillStyle = currentTheme.headerColor;
    ctx.fillText(pillText, width / 2, pillY);

    // Generate preview data URL
    const dataUrl = canvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
  } catch (err) {
    console.error("Error generating canvas card:", err);
    setIsGenerating(false);
  }
};

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    const ch = shlokaData.chapterNumber || 1;
    const shl = shlokaData.shlokNumber || 1;
    link.download = `Bhagavad_Gita_Adhyay_${ch}_Shlok_${shl}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleShareWhatsApp = async () => {
    const canvas = canvasRef.current;
    const websiteUrl = "https://gita-gyan-m.vercel.app";
    const shareTitle = txt("શ્રીમદ્ભગવદ્ગીતા", "श्रीमद्भगवद्गीता", "Shrimad Bhagavad Gita");
    const shareText = websiteUrl;

    if (canvas && navigator.canShare) {
      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        const ch = shlokaData.chapterNumber || 1;
        const shl = shlokaData.shlokNumber || 1;
        const file = new File(
          [blob],
          `Bhagavad_Gita_Ch${ch}_Shlok${shl}.png`,
          { type: "image/png" }
        );

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText
          });
          return;
        }
      } catch (err) {
        console.log("Web Share API fallback:", err);
      }
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyText = () => {
    const ch = shlokaData.chapterNumber || 1;
    const shl = shlokaData.shlokNumber || 1;
    const chName = shlokaData.chapterName ? ` (${cleanHtmlText(shlokaData.chapterName)})` : "";
    const cleanSpeaker = cleanHtmlText(shlokaData.speaker || "");
    const cleanSanskrit = cleanHtmlText(shlokaData.sanskrit || shlokaData.sanskritExcerpt || "");
    const cleanTranslation = cleanHtmlText(
      shlokaData.translation ||
      shlokaData.gujaratiSummary ||
      shlokaData.meaning ||
      ""
    );
    const messagePoints = extractMessagePoints(shlokaData.message);

    let copyText = txt(
      `॥ શ્રીમદ્ભગવદ્ગીતા ॥\n📌 અધ્યાય ${ch}${chName} • શ્લોક ${shl}\n\n`,
      `॥ श्रीमद्भगवद्गीता ॥\n📌 अध्याय ${ch}${chName} • श्लोक ${shl}\n\n`,
      `॥ Shrimad Bhagavad Gita ॥\n📌 Chapter ${ch}${chName} • Shloka ${shl}\n\n`
    );
    if (cleanSpeaker) {
      copyText += `🎙️ ~ ${cleanSpeaker} ~\n\n`;
    }
    if (cleanSanskrit) {
      copyText += txt(
        `🕉️ સંસ્કૃત શ્લોક:\n${cleanSanskrit}\n\n`,
        `🕉️ संस्कृत श्लोक:\n${cleanSanskrit}\n\n`,
        `🕉️ Sanskrit Shloka:\n${cleanSanskrit}\n\n`
      );
    }
    if (cleanTranslation) {
      copyText += txt(
        `📖 ગુજરાતી ભાવાર્થ:\n${cleanTranslation}\n\n`,
        `📖 हिन्दी भावार्थ:\n${cleanTranslation}\n\n`,
        `📖 Translation:\n${cleanTranslation}\n\n`
      );
    }
    if (messagePoints && messagePoints.length > 0) {
      copyText += txt(
        `✨ દિવ્ય સંદેશ / જીવન બોધ:\n`,
        `✨ दिव्य संदेश / जीवन बोध:\n`,
        `✨ Divine Message / Life Wisdom:\n`
      );
      messagePoints.forEach((point) => {
        let prefix = "• ";
        if (/^\d+[.)]/.test(point) || /^•/.test(point) || /^✦/.test(point)) {
          prefix = "";
        }
        copyText += `${prefix}${point}\n`;
      });
      copyText += `\n`;
    }
    copyText += `🔗 https://gita-gyan-m.vercel.app`;

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !shlokaData || typeof document === "undefined") return null;

  return createPortal(
    <div className="share-modal-overlay" onClick={onClose}>
      <div
        className="share-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="share-modal-header">
          <div className="modal-header-title">
            <Sparkles className="header-sparkle-icon" size={20} />
            <h2>{txt("શ્લોક કાર્ડ શેર કરો", "श्लोक कार्ड शेयर करें", "Share Shloka Card")}</h2>
          </div>
          <button
            type="button"
            className="share-modal-close-btn"
            onClick={onClose}
            aria-label={txt("બંધ કરો", "बंद करें", "Close")}
            title={txt("બંધ કરો", "बंद करें", "Close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* HIDDEN WORKING CANVAS */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* MODAL BODY */}
        <div className="share-modal-body">
          {/* THEME PICKER */}
          <div className="theme-picker-section">
            <label className="picker-label">
              <Palette size={16} />
              <span>{txt("કાર્ડની થીમ પસંદ કરો:", "कार्ड की थीम चुनें:", "Select Card Theme:")}</span>
            </label>
            <div className="theme-options-grid">
              {THEMES.map((theme) => {
                const isActive = selectedThemeId === theme.id;
                const localizedThemeName = isEnglish ? theme.englishName : (isHindi ? theme.nameHi : theme.name);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-color-btn ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedThemeId(theme.id)}
                    title={localizedThemeName}
                    aria-label={localizedThemeName}
                    style={{
                      "--btn-bg": `linear-gradient(135deg, ${theme.primaryGrad[0]}, ${theme.primaryGrad[1]})`,
                      "--border-gold": theme.borderGold,
                      "--glow-color": theme.glowColor
                    }}
                  >
                    {isActive && (
                      <Check size={14} strokeWidth={3} className="theme-btn-check" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD PREVIEW */}
          <div className="share-card-preview-wrapper">
            {previewUrl ? (
              <a
                href="https://gita-gyan-m.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="share-card-preview-link"
                title={txt("વેબસાઇટ ખોલવા ક્લિક કરો", "वेबसाइट खोलने के लिए क्लिक करें", "Click to open website")}
              >
                <img
                  src={previewUrl}
                  alt="Bhagavad Gita Shloka Card Preview"
                  className="share-card-preview-img"
                />
              </a>
            ) : (
              <div className="preview-loading">
                <span>{txt("કાર્ડ તૈયાર થઈ રહ્યું છે...", "कार्ड तैयार हो रहा है...", "Generating card...")}</span>
              </div>
            )}
          </div>

          {/* CLICKABLE LINK BAR */}
          <div className="share-preview-link-bar">
            <a
              href="https://gita-gyan-m.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="share-preview-clickable-link"
              title={txt("વેબસાઇટ પર સીધા જવા અહીં ક્લિક કરો", "वेबसाइट खोलने के लिए क्लिक करें", "Click to visit website")}
            >
              <span>🔗 gita-gyan-m.vercel.app</span>
            </a>
          </div>

          {/* ACTION BUTTONS */}
          <div className="share-modal-actions">
            {/* DOWNLOAD BUTTON */}
            <button
              type="button"
              className="action-btn download-btn"
              onClick={handleDownload}
              disabled={isGenerating || !previewUrl}
              title={txt("હાઈ-ક્વોલિટી PNG ઈમેજ ડાઉનલોડ કરો", "हाई-क्वालिटी PNG इमेज डाउनलोड करें", "Download high-quality PNG image")}
            >
              <Download size={18} />
              <span>{txt("ઈમેજ ડાઉનલોડ", "इमेज डाउनलोड", "Download Image")}</span>
            </button>

            {/* WHATSAPP SHARE */}
            <button
              type="button"
              className="action-btn whatsapp-btn"
              onClick={handleShareWhatsApp}
              disabled={isGenerating || !previewUrl}
              title={txt("WhatsApp પર શેર કરો", "WhatsApp पर शेयर करें", "Share on WhatsApp")}
            >
              <MessageCircle size={18} />
              <span>{txt("WhatsApp શેર", "WhatsApp शेयर", "WhatsApp Share")}</span>
            </button>

            {/* COPY TEXT */}
            <button
              type="button"
              className="action-btn copy-btn"
              onClick={handleCopyText}
              title={txt("શ્લોક અને ભાવાર્થ કોપી કરો", "श्लोक और अर्थ कॉपी करें", "Copy Shloka and Meaning")}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? txt("કોપી થઈ ગયું!", "कॉपी हो गया!", "Copied!") : txt("ટેક્સ્ટ કોપી", "टेक्स्ट कॉपी", "Copy Text")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

