import { useEffect, useRef, useState } from "react";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Palette,
  MessageCircle
} from "lucide-react";
import "./ShareShlokaModal.css";

const THEMES = [
  {
    id: "royal-blue",
    name: "રોયલ બ્લુ",
    englishName: "Royal Blue",
    primaryGrad: ["#103264", "#1b52a4", "#0c244d"],
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
    sampleColor: "#1b52a4"
  },
  {
    id: "saffron-gold",
    name: "દિવ્ય ભગવો",
    englishName: "Divine Saffron",
    primaryGrad: ["#9e3400", "#cb4903", "#7e2800"],
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
    sampleColor: "#cb4903"
  },
  {
    id: "vedic-maroon",
    name: "વેદિક મરૂન",
    englishName: "Vedic Maroon",
    primaryGrad: ["#6b1120", "#911a2d", "#520915"],
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
    sampleColor: "#911a2d"
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
  const temp = document.createElement("div");
  temp.innerHTML = String(htmlString);

  // Replace <br> tags with newline
  temp.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));

  // Add newline after block elements
  temp.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6").forEach((el) => {
    el.insertAdjacentText("afterend", "\n");
  });

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

  const temp = document.createElement("div");
  temp.innerHTML = String(htmlOrText);

  // Check if there are multiple <p>, <li>
  const blocks = temp.querySelectorAll("p, li");
  const extracted = [];
  if (blocks.length > 1) {
    blocks.forEach((el) => {
      const txt = cleanHtmlText(el.innerHTML);
      if (txt && txt.length > 5 && !extracted.includes(txt)) {
        extracted.push(txt);
      }
    });
  }

  if (extracted.length > 1) {
    return extracted;
  }

  // Split by double newline or single newline
  const clean = cleanHtmlText(htmlOrText);
  const byNewlines = clean
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  if (byNewlines.length > 1) {
    return byNewlines;
  }

  // Look for topic breaks like "1. ", "2. ", or "Title : " following sentence end
  const byTopic = clean.split(/(?<=[.!?।॥])\s+(?=[^.:?!]{2,30}\s*:\s*)/g);
  if (byTopic.length > 1) {
    return byTopic.map((s) => s.trim()).filter(Boolean);
  }

  return clean ? [clean] : [];
}

export default function ShareShlokaModal({
  isOpen,
  onClose,
  shlokaData
}) {
  const canvasRef = useRef(null);
  const [selectedThemeId, setSelectedThemeId] = useState("royal-blue");
  const [previewUrl, setPreviewUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

      // Measure Sanskrit (Maximum prominent size)
      const sanskritBoxW = width - 160; // 920px
      const sanskritMaxW = sanskritBoxW - 64; // 856px
      const sanskritFontSize = hasMessage ? 36 : 40;
      const sanskritLineH = hasMessage ? 66 : 72;
      const sanskritVerticalPadding = hasMessage ? 46 : 54;
      ctx.font = `bold ${sanskritFontSize}px "Noto Sans Devanagari", "Noto Sans Gujarati", serif`;

      const wrappedSanskrit = [];
      if (rawSanskritLines.length > 0) {
        rawSanskritLines.forEach((line) => {
          wrappedSanskrit.push(...wrapText(ctx, line, sanskritMaxW));
        });
      } else {
        wrappedSanskrit.push(...wrapText(ctx, cleanSanskrit, sanskritMaxW));
      }
      const sanskritToDisplay = wrappedSanskrit.slice(0, 4);

      // Measure Translation (Maximum large reading font)
      const mainTextMaxW = width - 200; // 880px
      const transFontSize = hasMessage ? 34 : 38;
      const transLineH = hasMessage ? 60 : 66;
      ctx.font = `600 ${transFontSize}px "Noto Sans Gujarati", sans-serif`;
      const wrappedTranslation = wrapText(ctx, cleanTranslation, mainTextMaxW);
      const maxTransLines = hasMessage ? 8 : 12;
      const translationToDisplay = wrappedTranslation.slice(0, maxTransLines);

      // Measure Message Points (Maximum large font)
      const msgFontSize = 28;
      const msgLineH = 50;
      const msgPointGap = 26;
      ctx.font = `500 ${msgFontSize}px "Noto Sans Gujarati", sans-serif`;
      const wrappedMessagePoints = [];
      if (hasMessage) {
        messagePoints.slice(0, 3).forEach((point) => {
          let prefix = "✦ ";
          if (/^\d+[.)]/.test(point) || /^•/.test(point) || /^✦/.test(point)) {
            prefix = "";
          }
          const pointText = `${prefix}${point}`;
          const lines = wrapText(ctx, pointText, mainTextMaxW).slice(0, 5);
          if (lines.length > 0) {
            wrappedMessagePoints.push(lines);
          }
        });
      }

      // 2. Pre-calculate Heights for 9:16 Aspect Ratio (1080 x 1920)
      const cardHeight = 1920;
      canvas.width = width;
      canvas.height = cardHeight;

      const outerMargin = 38;
      const innerMargin = 52;

      const headerTitleH = 58;
      const chapterBadgeH = 48;
      const totalHeaderH = headerTitleH + chapterBadgeH + 20; // ~126px

      const speakerH = cleanSpeaker ? 54 : 0;

      const totalSanskritLinesH = (sanskritToDisplay.length - 1) * sanskritLineH;
      const sanskritBoxH = totalSanskritLinesH + sanskritVerticalPadding * 2;
      const sanskritDividerH = 20;
      const totalSanskritH = sanskritBoxH + sanskritDividerH;

      const transTitleH = 54;
      const transContentH = translationToDisplay.length * transLineH;
      const totalTranslationH = transTitleH + transContentH;

      let totalMessageH = 0;
      const msgTitleH = 52;
      if (wrappedMessagePoints.length > 0) {
        let totalMsgLines = 0;
        wrappedMessagePoints.forEach((lines) => {
          totalMsgLines += lines.length;
        });
        const pointsGaps = (wrappedMessagePoints.length - 1) * msgPointGap;
        const msgDividerH = 20;
        totalMessageH = msgDividerH + msgTitleH + (totalMsgLines * msgLineH) + pointsGaps;
      }

      const footerDividerY = cardHeight - innerMargin - 66; // 1802px
      const availableTop = innerMargin + 32; // 84px (near very top of card)
      const availableBottom = footerDividerY - 26; // 1776px
      const totalAvailableH = availableBottom - availableTop; // 1692px

      const totalContentH = totalHeaderH + speakerH + totalSanskritH + totalTranslationH + totalMessageH;
      const totalSlack = Math.max(0, totalAvailableH - totalContentH);
      const numGaps = (hasMessage ? 3 : 2) + (cleanSpeaker ? 1 : 0);

      // Distribute evenly so content stretches from top to footer divider
      const sectionGap = Math.floor(totalSlack / numGaps);
      const topOffset = availableTop;

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

    // 4. Render Sacred Header
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let currY = topOffset;

    // Sacred Heading (Maximum prominent size at top)
    ctx.font = 'bold 50px "Noto Sans Devanagari", "Noto Sans Gujarati", serif';
    ctx.fillStyle = currentTheme.headerColor;
    ctx.fillText("॥ શ્રીમદ્ભગવદ્ગીતા ॥", width / 2, currY);
    currY += headerTitleH;

    // Chapter & Shlok Badge Pill
    const badgeText = chName
      ? `અધ્યાય ${chNum} (${chName}) • શ્લોક ${shlokNum}`
      : `અધ્યાય ${chNum} • શ્લોક ${shlokNum}`;
    ctx.font = 'bold 25px "Noto Sans Gujarati", sans-serif';
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = Math.min(width - 180, Math.max(300, badgeMetrics.width + 52));
    const badgeH = chapterBadgeH;

    drawRoundRect(
      ctx,
      width / 2 - badgeW / 2,
      currY - badgeH / 2,
      badgeW,
      badgeH,
      24,
      "rgba(0, 0, 0, 0.35)",
      currentTheme.innerBorder,
      1.4
    );

    ctx.fillStyle = currentTheme.footerColor;
    ctx.fillText(badgeText, width / 2, currY);
    currY += badgeH / 2 + 18;

    // Header Divider
    drawDivider(currY, 480);
    currY += sectionGap;

    // 5. Speaker (if present)
    if (cleanSpeaker) {
      ctx.font = 'italic 700 30px "Noto Sans Devanagari", "Noto Sans Gujarati", sans-serif';
      ctx.fillStyle = currentTheme.sanskritAccent;
      ctx.fillText(`~ ${cleanSpeaker} ~`, width / 2, currY + 12);
      currY += speakerH + sectionGap;
    }

    // 6. Sanskrit Shloka Box (Luminous Sacred Frame)
    const boxX = (width - sanskritBoxW) / 2;
    const boxY = currY;

    drawRoundRect(
      ctx,
      boxX,
      boxY,
      sanskritBoxW,
      sanskritBoxH,
      20,
      currentTheme.sanskritBoxBg || "rgba(255, 255, 255, 0.08)",
      currentTheme.sanskritBoxBorder || "rgba(245, 197, 66, 0.38)",
      1.6
    );

    ctx.font = `bold ${sanskritFontSize}px "Noto Sans Devanagari", "Noto Sans Gujarati", serif`;
    ctx.fillStyle = currentTheme.sanskritColor;

    let sLineY = boxY + sanskritVerticalPadding;
    sanskritToDisplay.forEach((line) => {
      ctx.fillText(line, width / 2, sLineY);
      sLineY += sanskritLineH;
    });

    currY = boxY + sanskritBoxH + 16;
    drawDivider(currY, 460);
    currY += sectionGap;

    // 7. Gujarati Translation / Meaning Section
    ctx.font = 'bold 32px "Noto Sans Gujarati", sans-serif';
    ctx.fillStyle = currentTheme.headerColor;
    ctx.fillText("• ગુજરાતી ભાવાર્થ •", width / 2, currY + 12);
    currY += transTitleH;

    ctx.font = `600 ${transFontSize}px "Noto Sans Gujarati", sans-serif`;
    ctx.fillStyle = currentTheme.translationColor;

    translationToDisplay.forEach((line) => {
      ctx.fillText(line, width / 2, currY + 12);
      currY += transLineH;
    });

    // 8. Divine Message / Understanding (if present)
    if (hasMessage && wrappedMessagePoints.length > 0) {
      currY += 14;
      drawDivider(currY, 440);
      currY += sectionGap;

      ctx.font = 'bold 30px "Noto Sans Gujarati", sans-serif';
      ctx.fillStyle = currentTheme.sanskritAccent;
      ctx.fillText("✨ દિવ્ય સંદેશ / જીવન બોધ ✨", width / 2, currY + 12);
      currY += msgTitleH;

      ctx.font = `500 ${msgFontSize}px "Noto Sans Gujarati", sans-serif`;
      ctx.fillStyle = currentTheme.translationColor;

      wrappedMessagePoints.forEach((lines, pIdx) => {
        lines.forEach((line) => {
          ctx.fillText(line, width / 2, currY + 10);
          currY += msgLineH;
        });
        if (pIdx < wrappedMessagePoints.length - 1) {
          currY += msgPointGap;
        }
      });
    }

    // 9. Footer Branding & Website Watermark (Firmly Anchored at Bottom)
    drawDivider(footerDividerY, 460);

    // Sleek Website Link Pill (Professional & Prominent)
    const siteUrl = "bhagavad-gita-website-rk1v.vercel.app";
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
    const websiteUrl = "https://bhagavad-gita-website-rk1v.vercel.app";
    const shareTitle = "શ્રીમદ્ભગવદ્ગીતા";
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

    let copyText = `॥ શ્રીમદ્ભગવદ્ગીતા ॥\n📌 અધ્યાય ${ch}${chName} • શ્લોક ${shl}\n\n`;
    if (cleanSpeaker) {
      copyText += `🎙️ ~ ${cleanSpeaker} ~\n\n`;
    }
    if (cleanSanskrit) {
      copyText += `🕉️ સંસ્કૃત શ્લોક:\n${cleanSanskrit}\n\n`;
    }
    if (cleanTranslation) {
      copyText += `📖 ગુજરાતી ભાવાર્થ:\n${cleanTranslation}\n\n`;
    }
    if (messagePoints && messagePoints.length > 0) {
      copyText += `✨ દિવ્ય સંદેશ / જીવન બોધ:\n`;
      messagePoints.forEach((point) => {
        let prefix = "• ";
        if (/^\d+[.)]/.test(point) || /^•/.test(point) || /^✦/.test(point)) {
          prefix = "";
        }
        copyText += `${prefix}${point}\n`;
      });
      copyText += `\n`;
    }
    copyText += `🔗 https://bhagavad-gita-website-rk1v.vercel.app`;

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!isOpen || !shlokaData) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div
        className="share-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="share-modal-header">
          <div className="modal-header-title">
            <Sparkles className="header-sparkle-icon" size={20} />
            <h2>શ્લોક કાર્ડ શેર કરો</h2>
          </div>
          <button
            type="button"
            className="share-modal-close-btn"
            onClick={onClose}
            aria-label="બંધ કરો"
            title="બંધ કરો"
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
              <span>કાર્ડની થીમ પસંદ કરો:</span>
            </label>
            <div className="theme-options-grid">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-option-pill ${
                    selectedThemeId === theme.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedThemeId(theme.id)}
                  style={{
                    "--grad-sample": theme.primaryGrad[1],
                    "--border-gold": theme.borderGold
                  }}
                >
                  <span className="theme-color-dot" />
                  <span className="theme-pill-name">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CARD PREVIEW */}
          <div className="share-card-preview-wrapper">
            {previewUrl ? (
              <a
                href="https://bhagavad-gita-website-rk1v.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="share-card-preview-link"
                title="વેબસાઇટ ખોલવા ક્લિક કરો"
              >
                <img
                  src={previewUrl}
                  alt="Bhagavad Gita Shloka Card Preview"
                  className="share-card-preview-img"
                />
              </a>
            ) : (
              <div className="preview-loading">
                <span>કાર્ડ તૈયાર થઈ રહ્યું છે...</span>
              </div>
            )}
          </div>

          {/* CLICKABLE LINK BAR */}
          <div className="share-preview-link-bar">
            <a
              href="https://bhagavad-gita-website-rk1v.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="share-preview-clickable-link"
              title="વેબસાઇટ પર સીધા જવા અહીં ક્લિક કરો"
            >
              <span>🔗 bhagavad-gita-website-rk1v.vercel.app</span>
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
              title="હાઈ-ક્વોલિટી PNG ઈમેજ ડાઉનલોડ કરો"
            >
              <Download size={18} />
              <span>ઈમેજ ડાઉનલોડ</span>
            </button>

            {/* WHATSAPP SHARE */}
            <button
              type="button"
              className="action-btn whatsapp-btn"
              onClick={handleShareWhatsApp}
              disabled={isGenerating || !previewUrl}
              title="WhatsApp પર શેર કરો"
            >
              <MessageCircle size={18} />
              <span>WhatsApp શેર</span>
            </button>

            {/* COPY TEXT */}
            <button
              type="button"
              className="action-btn copy-btn"
              onClick={handleCopyText}
              title="શ્લોક અને ભાવાર્થ કોપી કરો"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? "કોપી થઈ ગયું!" : "ટેક્સ્ટ કોપી"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

