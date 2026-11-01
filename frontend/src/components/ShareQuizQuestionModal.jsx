import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Palette,
  Share2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./ShareQuizQuestionModal.css";

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
    titleAccent: "#ffd54f",
    boxBg: "rgba(255, 255, 255, 0.07)",
    boxBorder: "rgba(245, 197, 66, 0.35)",
    questionColor: "#ffffff",
    optionTextColor: "#f0f5ff",
    badgeBg: "rgba(245, 197, 66, 0.15)",
    badgeBorder: "#f5c542",
    badgeColor: "#ffe484",
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
    titleAccent: "#ffe082",
    boxBg: "rgba(255, 255, 255, 0.08)",
    boxBorder: "rgba(255, 213, 79, 0.4)",
    questionColor: "#ffffff",
    optionTextColor: "#fff9f0",
    badgeBg: "rgba(255, 213, 79, 0.16)",
    badgeBorder: "#ffd54f",
    badgeColor: "#fff0a6",
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
    titleAccent: "#ffd369",
    boxBg: "rgba(255, 255, 255, 0.07)",
    boxBorder: "rgba(247, 208, 112, 0.35)",
    questionColor: "#ffffff",
    optionTextColor: "#fff0f3",
    badgeBg: "rgba(247, 208, 112, 0.15)",
    badgeBorder: "#f7d070",
    badgeColor: "#ffeaa7",
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
    titleAccent: "#ffe082",
    boxBg: "rgba(255, 255, 255, 0.08)",
    boxBorder: "rgba(255, 229, 127, 0.35)",
    questionColor: "#ffffff",
    optionTextColor: "#fffdf2",
    badgeBg: "rgba(255, 229, 127, 0.16)",
    badgeBorder: "#ffe57f",
    badgeColor: "#fff8d6",
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
    titleAccent: "#e9d5ff",
    boxBg: "rgba(255, 255, 255, 0.07)",
    boxBorder: "rgba(253, 224, 71, 0.35)",
    questionColor: "#ffffff",
    optionTextColor: "#faf5ff",
    badgeBg: "rgba(253, 224, 71, 0.15)",
    badgeBorder: "#fde047",
    badgeColor: "#fae8ff",
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
    titleAccent: "#fbcfe8",
    boxBg: "rgba(255, 255, 255, 0.07)",
    boxBorder: "rgba(249, 210, 118, 0.35)",
    questionColor: "#ffffff",
    optionTextColor: "#fff0f5",
    badgeBg: "rgba(249, 210, 118, 0.15)",
    badgeBorder: "#f9d276",
    badgeColor: "#ffe4ec",
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
    titleAccent: "#f6c343",
    boxBg: "rgba(255, 255, 255, 0.08)",
    boxBorder: "rgba(255, 213, 79, 0.35)",
    questionColor: "#ffffff",
    optionTextColor: "#fef8f0",
    badgeBg: "rgba(255, 213, 79, 0.16)",
    badgeBorder: "#ffd54f",
    badgeColor: "#fff2cd",
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

  const converted = String(htmlString)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|blockquote|h[1-6]|tr)>/gi, "\n")
    .replace(/<(div|p|li|blockquote|h[1-6]|tr)[^>]*>/gi, "\n");

  const temp = document.createElement("div");
  temp.innerHTML = converted;

  let text = temp.textContent || temp.innerText || "";
  text = text.replace(/<[^>]*>/g, "");

  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\s+\n/g, "\n")
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

export default function ShareQuizQuestionModal({
  isOpen,
  onClose,
  questionData
}) {
  const { txt } = useLanguage();
  const canvasRef = useRef(null);
  const logoImageRef = useRef(null);
  const [selectedThemeId, setSelectedThemeId] = useState("royal-blue");
  const [previewUrl, setPreviewUrl] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-load App Logo for Background Watermark
  useEffect(() => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = "/icons/icon-512x512.png";
    img.onload = () => {
      logoImageRef.current = img;
      if (isOpen && questionData) {
        renderCanvasCard();
      }
    };
    if (img.complete && img.naturalWidth > 0) {
      logoImageRef.current = img;
    }
  }, [isOpen, questionData]);

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
    if (!isOpen || !questionData) return;

    const timer = setTimeout(() => {
      renderCanvasCard();
    }, 16);

    return () => clearTimeout(timer);
  }, [isOpen, questionData, selectedThemeId]);

  const renderCanvasCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !questionData) return;

    setIsGenerating(true);
    try {
      const ctx = canvas.getContext("2d");
      const width = 1080;
      const cardHeight = 1920;
      canvas.width = width;
      canvas.height = cardHeight;

      const outerMargin = 38;
      const innerMargin = 52;

      // 1. Prepare Question & Options Data
      const cleanGuQuestion = cleanHtmlText(questionData.question || "");
      const rawGuOptions = (questionData.options || []).map((o) => cleanHtmlText(o));
      while (rawGuOptions.length < 4) rawGuOptions.push("");

      const cleanEnQuestion = cleanHtmlText(questionData.questionEn || questionData.question || "");
      const rawEnOptions = (questionData.optionsEn && questionData.optionsEn.some(Boolean))
        ? questionData.optionsEn.map((o) => cleanHtmlText(o))
        : rawGuOptions;
      while (rawEnOptions.length < 4) rawEnOptions.push("");

      const chNum = questionData.chapterNumber;
      const shlNum = questionData.shlokaNumber;
      const qNum = questionData.shlokaQuestionNumber || 1;
      let badgeLabel = "શ્રીમદ્ભગવદ્ગીતા ક્વિઝ";
      if (chNum) {
        badgeLabel = `અધ્યાય ${chNum}${shlNum ? ` • શ્લોક ${shlNum}` : ""} • પ્રશ્ન ${qNum}`;
      } else if (questionData.category === "mahabharata") {
        badgeLabel = `સમગ્ર મહાભારત ક્વિઝ • પ્રશ્ન ${qNum}`;
      } else if (questionData.category) {
        badgeLabel = `${questionData.category} • પ્રશ્ન ${qNum}`;
      } else {
        badgeLabel = `શ્રીમદ્ભગવદ્ગીતા ક્વિઝ • પ્રશ્ન ${qNum}`;
      }

      // Vertical layout boundaries
      const headingCenterY = innerMargin + 64; // ~116px
      const badgeCenterY = headingCenterY + 68; // ~184px
      const headerDividerY = badgeCenterY + 44; // ~228px

      const footerDividerY = cardHeight - innerMargin - 66; // 1802px
      const availableH = footerDividerY - headerDividerY - 24; // ~1550px

      const contentMaxW = width - 140; // 940px
      const optionBoxW = width - 130; // 950px
      const optionTextMaxW = optionBoxW - 100; // 850px

      // Simulation evaluator to find optimum scale factor so both sections fit perfectly
      const evaluateLayout = (scale) => {
        const sectionHeaderH = Math.round(36 * scale);
        const qFontSize = Math.max(22, Math.round(34 * scale));
        const qLineH = Math.round(qFontSize * 1.55);
        const optFontSize = Math.max(19, Math.round(27 * scale));
        const optLineH = Math.round(optFontSize * 1.45);
        const optPadY = Math.round(14 * scale);
        const optBoxGap = Math.round(13 * scale);
        const qBoxPad = Math.round(18 * scale);

        // Gujarati Measurements
        ctx.font = `bold ${qFontSize}px "Noto Sans Gujarati", sans-serif`;
        const wrappedGuQ = wrapText(ctx, cleanGuQuestion, contentMaxW - qBoxPad * 2);
        const guQBoxH = wrappedGuQ.length * qLineH + qBoxPad * 2;

        ctx.font = `600 ${optFontSize}px "Noto Sans Gujarati", sans-serif`;
        const guOptBoxes = rawGuOptions.map((opt) => {
          const lines = wrapText(ctx, opt, optionTextMaxW);
          const h = Math.max(Math.round(58 * scale), lines.length * optLineH + optPadY * 2);
          return { lines, h };
        });
        const totalGuOptH = guOptBoxes.reduce((acc, o) => acc + o.h, 0) + (guOptBoxes.length - 1) * optBoxGap;
        const totalGuSectionH = sectionHeaderH + 12 + guQBoxH + 16 + totalGuOptH;

        // English Measurements
        ctx.font = `bold ${qFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const wrappedEnQ = wrapText(ctx, cleanEnQuestion, contentMaxW - qBoxPad * 2);
        const enQBoxH = wrappedEnQ.length * qLineH + qBoxPad * 2;

        ctx.font = `600 ${optFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const enOptBoxes = rawEnOptions.map((opt) => {
          const lines = wrapText(ctx, opt, optionTextMaxW);
          const h = Math.max(Math.round(58 * scale), lines.length * optLineH + optPadY * 2);
          return { lines, h };
        });
        const totalEnOptH = enOptBoxes.reduce((acc, o) => acc + o.h, 0) + (enOptBoxes.length - 1) * optBoxGap;
        const totalEnSectionH = sectionHeaderH + 12 + enQBoxH + 16 + totalEnOptH;

        const dividerGap = Math.round(30 * scale);
        const totalRequiredH = totalGuSectionH + dividerGap + totalEnSectionH;

        return {
          scale,
          totalRequiredH,
          sectionHeaderH,
          qFontSize,
          qLineH,
          qBoxPad,
          optFontSize,
          optLineH,
          optPadY,
          optBoxGap,
          wrappedGuQ,
          guQBoxH,
          guOptBoxes,
          totalGuSectionH,
          wrappedEnQ,
          enQBoxH,
          enOptBoxes,
          totalEnSectionH,
          dividerGap
        };
      };

      // Search for largest scale where all content fits inside available height
      let bestLayout = null;
      for (let s = 1.0; s >= 0.52; s -= 0.02) {
        const layout = evaluateLayout(Number(s.toFixed(2)));
        if (layout.totalRequiredH <= availableH || s <= 0.54) {
          bestLayout = layout;
          break;
        }
      }
      if (!bestLayout) bestLayout = evaluateLayout(0.54);

      // Distribute slack evenly between sections
      const totalSlack = Math.max(0, availableH - bestLayout.totalRequiredH);
      const topSpacing = Math.min(26, Math.floor(totalSlack * 0.25));
      const midSpacing = Math.min(48, Math.floor(totalSlack * 0.5));

      // 2. Render Background & Frames
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

      // Top Ambient Glow
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

      // 3. Subtle Website Link Repeating Background Watermark
      const logoImg = logoImageRef.current;
      const hasLogo = logoImg && logoImg.complete && logoImg.naturalWidth > 0;
      const logoSize = 650;
      const logoCenterX = width / 2;
      const logoCenterY = (cardHeight - logoSize) / 2 + 40 + logoSize / 2;
      const exclusionRadius = 355;

      ctx.save();
      ctx.beginPath();
      ctx.rect(
        outerMargin + 2,
        outerMargin + 2,
        width - (outerMargin + 2) * 2,
        cardHeight - (outerMargin + 2) * 2
      );
      ctx.arc(logoCenterX, logoCenterY, exclusionRadius, 0, Math.PI * 2);
      ctx.clip("evenodd");

      const watermarkText = "gita-gyan-m.vercel.app";
      const angle = -24 * (Math.PI / 180);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = currentTheme.borderGold || "#f5c542";
      ctx.globalAlpha = 0.08;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.translate(width / 2, cardHeight / 2);
      ctx.rotate(angle);

      const stepX = 370;
      const stepY = 72;
      const bounds = 1500;

      for (let yRot = -bounds; yRot <= bounds; yRot += stepY) {
        const rowIndex = Math.round((yRot + bounds) / stepY);
        const xOffset = rowIndex % 2 === 1 ? stepX / 2 : 0;

        for (let xRot = -bounds; xRot <= bounds; xRot += stepX) {
          const curXRot = xRot + xOffset;
          const worldX = width / 2 + curXRot * cosA - yRot * sinA;
          const worldY = cardHeight / 2 + curXRot * sinA + yRot * cosA;

          const distToLogo = Math.hypot(worldX - logoCenterX, worldY - logoCenterY);
          if (distToLogo < exclusionRadius + 65) {
            continue;
          }
          ctx.fillText(watermarkText, curXRot, yRot);
        }
      }
      ctx.restore();

      // Subtle App Logo in center
      if (hasLogo) {
        ctx.save();
        ctx.globalAlpha = 0.085;
        const logoX = (width - logoSize) / 2;
        const logoY = (cardHeight - logoSize) / 2 + 40;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      }

      // Ornamental Gold Borders
      ctx.strokeStyle = currentTheme.borderGold;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(
        outerMargin,
        outerMargin,
        width - outerMargin * 2,
        cardHeight - outerMargin * 2
      );

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
      const drawCorner = (cx, cy) => {
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
      drawCorner(innerMargin, innerMargin);
      drawCorner(width - innerMargin, innerMargin);
      drawCorner(innerMargin, cardHeight - innerMargin);
      drawCorner(width - innerMargin, cardHeight - innerMargin);

      // Divider Helper
      const drawDivider = (yPos, divW = 540) => {
        ctx.save();
        const half = divW / 2;
        const divGrad = ctx.createLinearGradient(width / 2 - half, yPos, width / 2 + half, yPos);
        divGrad.addColorStop(0, "transparent");
        divGrad.addColorStop(0.35, currentTheme.innerBorder);
        divGrad.addColorStop(0.5, currentTheme.borderGold);
        divGrad.addColorStop(0.65, currentTheme.innerBorder);
        divGrad.addColorStop(1, "transparent");

        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(width / 2 - half, yPos);
        ctx.lineTo(width / 2 + half, yPos);
        ctx.stroke();

        ctx.fillStyle = currentTheme.borderGold;
        ctx.beginPath();
        ctx.arc(width / 2, yPos, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // 4. Header: Top Title & Chapter/Category Badge
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = 'bold 44px "Noto Sans Devanagari", "Noto Sans Gujarati", serif';
      ctx.fillStyle = currentTheme.headerColor;
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 10;
      ctx.fillText("॥ શ્રીમદ્ભગવદ્ગીતા ક્વિઝ ॥", width / 2, headingCenterY);
      ctx.shadowBlur = 0;

      // Chapter / Category Badge Pill
      ctx.font = 'bold 24px "Noto Sans Gujarati", sans-serif';
      const bMetrics = ctx.measureText(badgeLabel);
      const bPadX = 32;
      const bW = Math.min(width - 240, bMetrics.width + bPadX * 2);
      const bH = 46;

      drawRoundRect(
        ctx,
        width / 2 - bW / 2,
        badgeCenterY - bH / 2,
        bW,
        bH,
        23,
        "rgba(0, 0, 0, 0.42)",
        currentTheme.innerBorder,
        1.3
      );
      ctx.fillStyle = currentTheme.titleAccent;
      ctx.fillText(badgeLabel, width / 2, badgeCenterY);

      drawDivider(headerDividerY, 560);

      // 5. Section 1: Gujarati Question & Options
      let currY = headerDividerY + 20 + topSpacing;
      const optLetters = ["A", "B", "C", "D"];

      // Section Header (Gujarati)
      ctx.font = `bold ${bestLayout.sectionHeaderH}px "Noto Sans Gujarati", sans-serif`;
      ctx.fillStyle = currentTheme.titleAccent;
      ctx.fillText(`✦ પ્રશ્ન ${qNum} (ગુજરાતી) ✦`, width / 2, currY + bestLayout.sectionHeaderH / 2);
      currY += bestLayout.sectionHeaderH + 12;

      // Gujarati Question Box
      const qBoxX = (width - optionBoxW) / 2;
      drawRoundRect(
        ctx,
        qBoxX,
        currY,
        optionBoxW,
        bestLayout.guQBoxH,
        16,
        "rgba(255, 255, 255, 0.06)",
        currentTheme.boxBorder,
        1.2
      );

      ctx.font = `bold ${bestLayout.qFontSize}px "Noto Sans Gujarati", sans-serif`;
      ctx.fillStyle = currentTheme.questionColor;
      ctx.textAlign = "center";
      let qTextY = currY + bestLayout.qBoxPad + bestLayout.qLineH / 2;
      bestLayout.wrappedGuQ.forEach((line) => {
        ctx.fillText(line, width / 2, qTextY);
        qTextY += bestLayout.qLineH;
      });
      currY += bestLayout.guQBoxH + 16;

      // Gujarati Options (A, B, C, D)
      bestLayout.guOptBoxes.forEach((optBox, idx) => {
        drawRoundRect(
          ctx,
          qBoxX,
          currY,
          optionBoxW,
          optBox.h,
          14,
          currentTheme.boxBg,
          currentTheme.boxBorder,
          1
        );

        // Letter Badge on left
        const badgeR = Math.max(16, Math.round(18 * bestLayout.scale));
        const badgeX = qBoxX + 40;
        const badgeY = currY + optBox.h / 2;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme.badgeBg;
        ctx.fill();
        ctx.strokeStyle = currentTheme.badgeBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `bold ${Math.round(bestLayout.optFontSize * 0.95)}px -apple-system, sans-serif`;
        ctx.fillStyle = currentTheme.badgeColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(optLetters[idx], badgeX, badgeY);

        // Option text
        ctx.font = `600 ${bestLayout.optFontSize}px "Noto Sans Gujarati", sans-serif`;
        ctx.fillStyle = currentTheme.optionTextColor;
        ctx.textAlign = "left";
        const optTextStartX = badgeX + badgeR + 20;
        let optTextY = currY + (optBox.h - (optBox.lines.length - 1) * bestLayout.optLineH) / 2;
        optBox.lines.forEach((line) => {
          ctx.fillText(line, optTextStartX, optTextY);
          optTextY += bestLayout.optLineH;
        });

        currY += optBox.h + bestLayout.optBoxGap;
      });

      // 6. Central Divider between Gujarati and English
      currY += 6 + midSpacing / 2;
      drawDivider(currY, 680);
      currY += 20 + midSpacing / 2;

      // 7. Section 2: English Question & Options
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Section Header (English)
      ctx.font = `bold ${bestLayout.sectionHeaderH}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = currentTheme.titleAccent;
      ctx.fillText(`✦ Question ${qNum} (English) ✦`, width / 2, currY + bestLayout.sectionHeaderH / 2);
      currY += bestLayout.sectionHeaderH + 12;

      // English Question Box
      drawRoundRect(
        ctx,
        qBoxX,
        currY,
        optionBoxW,
        bestLayout.enQBoxH,
        16,
        "rgba(255, 255, 255, 0.06)",
        currentTheme.boxBorder,
        1.2
      );

      ctx.font = `bold ${bestLayout.qFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = currentTheme.questionColor;
      ctx.textAlign = "center";
      let enQTextY = currY + bestLayout.qBoxPad + bestLayout.qLineH / 2;
      bestLayout.wrappedEnQ.forEach((line) => {
        ctx.fillText(line, width / 2, enQTextY);
        enQTextY += bestLayout.qLineH;
      });
      currY += bestLayout.enQBoxH + 16;

      // English Options (A, B, C, D)
      bestLayout.enOptBoxes.forEach((optBox, idx) => {
        drawRoundRect(
          ctx,
          qBoxX,
          currY,
          optionBoxW,
          optBox.h,
          14,
          currentTheme.boxBg,
          currentTheme.boxBorder,
          1
        );

        // Letter Badge on left
        const badgeR = Math.max(16, Math.round(18 * bestLayout.scale));
        const badgeX = qBoxX + 40;
        const badgeY = currY + optBox.h / 2;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme.badgeBg;
        ctx.fill();
        ctx.strokeStyle = currentTheme.badgeBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `bold ${Math.round(bestLayout.optFontSize * 0.95)}px -apple-system, sans-serif`;
        ctx.fillStyle = currentTheme.badgeColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(optLetters[idx], badgeX, badgeY);

        // Option text
        ctx.font = `600 ${bestLayout.optFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = currentTheme.optionTextColor;
        ctx.textAlign = "left";
        const optTextStartX = badgeX + badgeR + 20;
        let optTextY = currY + (optBox.h - (optBox.lines.length - 1) * bestLayout.optLineH) / 2;
        optBox.lines.forEach((line) => {
          ctx.fillText(line, optTextStartX, optTextY);
          optTextY += bestLayout.optLineH;
        });

        currY += optBox.h + bestLayout.optBoxGap;
      });

      // 8. Footer: Divider & Website Pill
      drawDivider(footerDividerY, 520);

      const siteUrl = "gita-gyan-m.vercel.app";
      const pillText = `🔗 ${siteUrl}`;
      ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const pillMetrics = ctx.measureText(pillText);
      const pillW = Math.min(width - 200, pillMetrics.width + 56);
      const pillH = 46;
      const pillY = footerDividerY + 36;

      drawRoundRect(
        ctx,
        width / 2 - pillW / 2,
        pillY - pillH / 2,
        pillW,
        pillH,
        23,
        "rgba(0, 0, 0, 0.48)",
        currentTheme.innerBorder,
        1.4
      );

      ctx.fillStyle = currentTheme.headerColor;
      ctx.fillText(pillText, width / 2, pillY);

      // Export preview
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);
      setIsGenerating(false);
    } catch (err) {
      console.error("Error generating quiz question canvas:", err);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    const ch = questionData.chapterNumber || "general";
    const shl = questionData.shlokaNumber ? `_Shl${questionData.shlokaNumber}` : "";
    const qNum = questionData.shlokaQuestionNumber || 1;
    link.download = `Gita_Quiz_Question_Ch${ch}${shl}_Q${qNum}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleShareWhatsApp = async () => {
    const canvas = canvasRef.current;
    const qNum = questionData.shlokaQuestionNumber || 1;
    const shareText = `શ્રીમદ્ભગવદ્ગીતા ક્વિઝ - પ્રશ્ન ${qNum}\nસાચો ઉત્તર આપવા માટે વેબસાઇટની મુલાકાત લો:\nhttps://gita-gyan-m.vercel.app`;

    if (canvas && navigator.canShare) {
      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        const ch = questionData.chapterNumber || "general";
        const shl = questionData.shlokaNumber ? `_Shl${questionData.shlokaNumber}` : "";
        const file = new File(
          [blob],
          `Gita_Quiz_Question_Ch${ch}${shl}_Q${qNum}.png`,
          { type: "image/png" }
        );

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `શ્રીમદ્ભગવદ્ગીતા ક્વિઝ - પ્રશ્ન ${qNum}`,
            text: shareText
          });
          return;
        }
      } catch (err) {
        console.log("Web Share API fallback:", err);
      }
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyText = () => {
    const qNum = questionData.shlokaQuestionNumber || 1;
    const qGu = cleanHtmlText(questionData.question || "");
    const qEn = cleanHtmlText(questionData.questionEn || questionData.question || "");
    const optsGu = (questionData.options || []).map((o, i) => `(${String.fromCharCode(65 + i)}) ${cleanHtmlText(o)}`).join("\n");
    const optsEn = (questionData.optionsEn && questionData.optionsEn.some(Boolean))
      ? questionData.optionsEn.map((o, i) => `(${String.fromCharCode(65 + i)}) ${cleanHtmlText(o)}`).join("\n")
      : optsGu;

    const chStr = questionData.chapterNumber
      ? `📌 અધ્યાય ${questionData.chapterNumber}${questionData.shlokaNumber ? ` • શ્લોક ${questionData.shlokaNumber}` : ""} • પ્રશ્ન ${qNum}\n`
      : `📌 પ્રશ્ન ${qNum}\n`;

    const textToCopy = `॥ શ્રીમદ્ભગવદ્ગીતા ક્વિઝ ॥\n${chStr}\n❓ પ્રશ્ન ${qNum} (ગુજરાતી):\n${qGu}\n\n${optsGu}\n\n━━━━━━━━━━━━━━━━━━━━\n\n❓ Question ${qNum} (English):\n${qEn}\n\n${optsEn}\n\n🌐 સાચો ઉત્તર આપવા માટે વેબસાઇટ જુઓ:\nhttps://gita-gyan-m.vercel.app`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  if (!isOpen || !questionData) return null;

  return createPortal(
    <div className="share-quiz-modal-overlay" onClick={onClose}>
      <div
        className="share-quiz-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Share Quiz Question Card"
      >
        {/* Hidden Canvas for High-Resolution Export */}
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width={1080}
          height={1920}
        />

        {/* Modal Header */}
        <div className="share-quiz-modal-header">
          <div className="share-quiz-modal-title">
            <Sparkles size={18} className="share-quiz-sparkle-icon" />
            <h3>Share Question Card</h3>
            {questionData.shlokaQuestionNumber && (
              <span className="share-quiz-admin-tag" style={{ background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}>
                {questionData.shlokaNumber ? `શ્લોક ${questionData.shlokaNumber} • Q#${questionData.shlokaQuestionNumber}` : `Q#${questionData.shlokaQuestionNumber}`}
              </span>
            )}
            <span className="share-quiz-admin-tag">Admin Only</span>
          </div>

          <button
            type="button"
            className="share-quiz-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="share-quiz-modal-body">
          {/* Live Card Preview */}
          <div className="share-quiz-preview-wrapper">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Quiz Question Card Preview"
                className="share-quiz-card-img"
              />
            ) : (
              <div className="share-quiz-preview-loading">
                <Sparkles size={24} className="animate-spin" />
                <span>કાર્ડ તૈયાર થઈ રહ્યું છે...</span>
              </div>
            )}
          </div>

          {/* Theme Color Selector */}
          <div className="share-quiz-theme-section">
            <div className="share-quiz-theme-header">
              <Palette size={15} color="#ffd54f" />
              <span>થીમ પસંદ કરો (Theme Color):</span>
            </div>

            <div className="share-quiz-theme-grid">
              {THEMES.map((theme) => {
                const isActive = theme.id === selectedThemeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`share-quiz-theme-circle-btn ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedThemeId(theme.id)}
                    title={theme.name}
                    aria-label={theme.name}
                  >
                    <span
                      className="share-quiz-theme-color-dot"
                      style={{ background: theme.sampleColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: 3 options in 1 single row */}
          <div className="share-quiz-actions">
            <div className="share-quiz-btn-row">
              <button
                type="button"
                className="share-quiz-action-btn share-quiz-download-btn"
                onClick={handleDownload}
                disabled={isGenerating || !previewUrl}
                title="ડાઉનલોડ કાર્ડ (PNG)"
              >
                <Download size={15} />
                <span>ડાઉનલોડ</span>
              </button>

              <button
                type="button"
                className="share-quiz-action-btn share-quiz-whatsapp-btn"
                onClick={handleShareWhatsApp}
                disabled={isGenerating || !previewUrl}
                title="શેર કરો (WhatsApp / Social Share)"
              >
                <Share2 size={15} />
                <span>શેર</span>
              </button>

              <button
                type="button"
                className="share-quiz-action-btn share-quiz-copy-btn"
                onClick={handleCopyText}
                title="પ્રશ્નનું લખાણ કોપી કરો"
              >
                {copiedText ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                <span>{copiedText ? "કોપી થયું!" : "લખાણ કોપી"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

