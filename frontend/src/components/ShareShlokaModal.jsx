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
    primaryGrad: ["#071936", "#0d3c7c", "#092247"],
    borderGold: "#d4af37",
    innerBorder: "rgba(212, 175, 55, 0.40)",
    headerColor: "#f7d274",
    sanskritColor: "#ffffff",
    sanskritAccent: "#ffe699",
    translationColor: "#e6f0ff",
    footerColor: "#a3c8f7",
    glowColor: "rgba(21, 101, 192, 0.45)"
  },
  {
    id: "saffron-gold",
    name: "દિવ્ય ભગવો",
    englishName: "Divine Saffron",
    primaryGrad: ["#2d1104", "#702b00", "#381604"],
    borderGold: "#ffb74d",
    innerBorder: "rgba(255, 183, 77, 0.40)",
    headerColor: "#ffe082",
    sanskritColor: "#ffffff",
    sanskritAccent: "#ffd54f",
    translationColor: "#fff3e0",
    footerColor: "#ffcc80",
    glowColor: "rgba(230, 81, 0, 0.45)"
  },
  {
    id: "midnight-dark",
    name: "મિડનાઇટ ગોલ્ડ",
    englishName: "Midnight Gold",
    primaryGrad: ["#090d14", "#121a29", "#090d14"],
    borderGold: "#e0b06b",
    innerBorder: "rgba(224, 176, 107, 0.35)",
    headerColor: "#eed1a1",
    sanskritColor: "#ffffff",
    sanskritAccent: "#f3deba",
    translationColor: "#eceff4",
    footerColor: "#a2b4cd",
    glowColor: "rgba(100, 150, 240, 0.25)"
  }
];

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

    renderCanvasCard();
  }, [isOpen, shlokaData, selectedThemeId]);

  const renderCanvasCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext("2d");
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      100,
      width / 2,
      height / 2,
      width * 0.72
    );
    bgGrad.addColorStop(0, currentTheme.primaryGrad[1]);
    bgGrad.addColorStop(0.7, currentTheme.primaryGrad[0]);
    bgGrad.addColorStop(1, currentTheme.primaryGrad[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle corner glows
    const cornerGlow = ctx.createRadialGradient(
      width / 2,
      110,
      20,
      width / 2,
      110,
      380
    );
    cornerGlow.addColorStop(0, currentTheme.glowColor);
    cornerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = cornerGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Ornamental Borders
    const margin = 40;
    const innerMargin = 54;

    // Outer border
    ctx.strokeStyle = currentTheme.borderGold;
    ctx.lineWidth = 4;
    ctx.strokeRect(
      margin,
      margin,
      width - margin * 2,
      height - margin * 2
    );

    // Inner hairline border
    ctx.strokeStyle = currentTheme.innerBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      innerMargin,
      innerMargin,
      width - innerMargin * 2,
      height - innerMargin * 2
    );

    // Corner Ornaments
    const cornerSize = 20;
    const drawCornerOrnament = (cx, cy) => {
      ctx.fillStyle = currentTheme.borderGold;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = currentTheme.borderGold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - cornerSize, cy);
      ctx.lineTo(cx + cornerSize, cy);
      ctx.moveTo(cx, cy - cornerSize);
      ctx.lineTo(cx, cy + cornerSize);
      ctx.stroke();
    };

    drawCornerOrnament(innerMargin, innerMargin);
    drawCornerOrnament(width - innerMargin, innerMargin);
    drawCornerOrnament(innerMargin, height - innerMargin);
    drawCornerOrnament(width - innerMargin, height - innerMargin);

    // 3. Sacred Top Emblem
    // 3. Sacred Top Emblem (Heading Line 1)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = 'bold 36px "Noto Sans Devanagari", "Noto Sans Gujarati", serif';
    ctx.fillStyle = currentTheme.headerColor;
    ctx.fillText("॥ શ્રીમદ્ભગવદ્ગીતા ॥", width / 2, 88);

    // Chapter & Shlok Banner (Heading Line 2)
    const chNum = shlokaData.chapterNumber || 1;
    const chName = shlokaData.chapterName ? ` • ${cleanHtmlText(shlokaData.chapterName)}` : "";
    const shlokNum = shlokaData.shlokNumber || 1;

    ctx.font = '600 22px "Noto Sans Gujarati", sans-serif';
    ctx.fillStyle = currentTheme.footerColor;
    ctx.fillText(
      `અધ્યાય ${chNum}${chName} • શ્લોક ${shlokNum}`,
      width / 2,
      130
    );

    // Divider helper
    const drawDivider = (yPos, widthSpan = 400) => {
      ctx.strokeStyle = currentTheme.innerBorder;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - widthSpan / 2, yPos);
      ctx.lineTo(width / 2 + widthSpan / 2, yPos);
      ctx.stroke();

      ctx.fillStyle = currentTheme.borderGold;
      ctx.beginPath();
      ctx.arc(width / 2, yPos, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    // Divider directly below the 2-line heading
    drawDivider(166, 440);

    // GENEROUS SPACE BELOW THE 2-LINE HEADING BEFORE CONTENT STARTS
    let currentY = 222;

    const cleanSpeaker = cleanHtmlText(shlokaData.speaker || "");

    // Speaker (e.g. ~ ધૃતરાષ્ટ્ર ઉવાચ ~) starts the recitation content
    if (cleanSpeaker) {
      ctx.font = 'italic 700 22px "Noto Sans Devanagari", "Noto Sans Gujarati", sans-serif';
      ctx.fillStyle = currentTheme.sanskritAccent;
      ctx.fillText(`~ ${cleanSpeaker} ~`, width / 2, currentY);
      currentY += 42;
    }

    // 4. Sanskrit Shloka (Pure, clean Sanskrit lines)
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

    const maxTextWidth = width - 160;
    ctx.font = 'bold 26px "Noto Sans Devanagari", "Noto Sans Gujarati", serif';
    ctx.fillStyle = currentTheme.sanskritColor;

    const wrappedSanskrit = [];
    if (rawSanskritLines.length > 0) {
      rawSanskritLines.forEach((line) => {
        wrappedSanskrit.push(...wrapText(ctx, line, maxTextWidth));
      });
    } else {
      wrappedSanskrit.push(...wrapText(ctx, cleanSanskrit, maxTextWidth));
    }

    const sanskritToDisplay = wrappedSanskrit.slice(0, 3);
    sanskritToDisplay.forEach((line) => {
      ctx.fillText(line, width / 2, currentY);
      currentY += 38;
    });

    // Divider after Sanskrit
    currentY += 10;
    drawDivider(currentY);
    currentY += 30;

    // 5. Gujarati Translation / Meaning Section
    const cleanTranslation = cleanHtmlText(
      shlokaData.translation ||
      shlokaData.gujaratiSummary ||
      shlokaData.meaning ||
      ""
    );

    const messagePoints = extractMessagePoints(shlokaData.message);
    const hasMessage = messagePoints.length > 0;

    ctx.font = 'bold 20px "Noto Sans Gujarati", sans-serif';
    ctx.fillStyle = currentTheme.headerColor;
    ctx.fillText("• ગુજરાતી અનુવાદ •", width / 2, currentY);
    currentY += 32;

    ctx.font = '500 21px "Noto Sans Gujarati", sans-serif';
    ctx.fillStyle = currentTheme.translationColor;

    const wrappedTranslation = wrapText(ctx, cleanTranslation, maxTextWidth);
    const maxTransLines = hasMessage ? 3 : 7;
    const translationToDisplay = wrappedTranslation.slice(0, maxTransLines);

    translationToDisplay.forEach((line) => {
      ctx.fillText(line, width / 2, currentY);
      currentY += 32;
    });

    // 6. Divine Message / Understanding Section (સંદેશ / સમજણ)
    if (hasMessage) {
      currentY += 8;
      drawDivider(currentY);
      currentY += 28;

      ctx.font = 'bold 20px "Noto Sans Gujarati", sans-serif';
      ctx.fillStyle = currentTheme.sanskritAccent;
      ctx.fillText("✨ સંદેશ / સમજણ ✨", width / 2, currentY);
      currentY += 34;

      ctx.font = '400 19px "Noto Sans Gujarati", sans-serif';
      ctx.fillStyle = currentTheme.translationColor;

      messagePoints.forEach((point, pIdx) => {
        let prefix = "• ";
        if (/^\d+[.)]/.test(point) || /^•/.test(point)) {
          prefix = "";
        }
        const pointText = `${prefix}${point}`;
        const wrappedPt = wrapText(ctx, pointText, maxTextWidth);

        const linesToDraw = wrappedPt.slice(0, 3);
        linesToDraw.forEach((line) => {
          if (currentY < 960) {
            ctx.fillText(line, width / 2, currentY);
            currentY += 29;
          }
        });

        // Add clear spacing between point 1 and point 2!
        if (pIdx < messagePoints.length - 1) {
          currentY += 14;
        }
      });
    }

    // 7. Footer Branding & Watermark
    drawDivider(980, 420);

    ctx.font = '600 19px "Noto Sans Gujarati", sans-serif';
    ctx.fillStyle = currentTheme.footerColor;
    ctx.fillText("॥ ૐ તત્સત્ ॥ • શ્રીમદ્ભગવદ્ગીતા", width / 2, 1012);

    ctx.font = '500 15px sans-serif';
    ctx.fillStyle = currentTheme.innerBorder;
    ctx.fillText("bhagavad-gita-website.onrender.com", width / 2, 1038);

    // Generate preview data URL
    const dataUrl = canvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
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
    const ch = shlokaData.chapterNumber || 1;
    const shl = shlokaData.shlokNumber || 1;
    const chName = shlokaData.chapterName ? ` (${cleanHtmlText(shlokaData.chapterName)})` : "";
    const cleanSanskrit = cleanHtmlText(
      shlokaData.sanskrit || shlokaData.sanskritExcerpt || ""
    );
    const cleanTranslation = cleanHtmlText(
      shlokaData.translation || shlokaData.gujaratiSummary || shlokaData.meaning || ""
    );
    const messagePoints = extractMessagePoints(shlokaData.message);
    const cleanSpeaker = cleanHtmlText(shlokaData.speaker || "");

    const shareTitle = `શ્રીમદ્ભગવદ્ગીતા • અધ્યાય ${ch}${chName} • શ્લોક ${shl}`;
    let shareText = `॥ श्रीमद्भगवद्गीता ॥\n\n📌 અધ્યાય ${ch}${chName} • શ્લોક ${shl}\n`;
    if (cleanSpeaker) {
      shareText += `🎙️ ${cleanSpeaker}\n\n`;
    }
    shareText += `🕉️ સંસ્કૃત શ્લોક:\n${cleanSanskrit}\n\n📖 ગુજરાતી અનુવાદ:\n${cleanTranslation}\n`;
    if (messagePoints.length > 0) {
      shareText += `\n✨ સંદેશ / સમજણ:\n`;
      messagePoints.forEach((pt) => {
        let prefix = "• ";
        if (/^\d+[.)]/.test(pt) || /^•/.test(pt)) prefix = "";
        shareText += `${prefix}${pt}\n\n`;
      });
    }
    shareText += `🌐 સંપૂર્ણ અધ્યાય વાંચો:\nhttps://bhagavad-gita-website.onrender.com/chapter/${ch}?shloka=${shl}`;

    if (canvas && navigator.canShare) {
      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
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
    const cleanSanskrit = cleanHtmlText(
      shlokaData.sanskrit || shlokaData.sanskritExcerpt || ""
    );
    const cleanTranslation = cleanHtmlText(
      shlokaData.translation || shlokaData.gujaratiSummary || shlokaData.meaning || ""
    );
    const messagePoints = extractMessagePoints(shlokaData.message);
    const cleanSpeaker = cleanHtmlText(shlokaData.speaker || "");

    let shareText = `॥ श्रीमद्भगवद्गीता ॥\n\n📌 અધ્યાય ${ch}${chName} • શ્લોક ${shl}\n`;
    if (cleanSpeaker) {
      shareText += `🎙️ ${cleanSpeaker}\n\n`;
    }
    shareText += `🕉️ સંસ્કૃત શ્લોક:\n${cleanSanskrit}\n\n📖 ગુજરાતી અનુવાદ:\n${cleanTranslation}\n`;
    if (messagePoints.length > 0) {
      shareText += `\n✨ સંદેશ / સમજણ:\n`;
      messagePoints.forEach((pt) => {
        let prefix = "• ";
        if (/^\d+[.)]/.test(pt) || /^•/.test(pt)) prefix = "";
        shareText += `${prefix}${pt}\n\n`;
      });
    }
    shareText += `🌐 સંપૂર્ણ અધ્યાય વાંચો:\nhttps://bhagavad-gita-website.onrender.com/chapter/${ch}?shloka=${shl}`;

    navigator.clipboard.writeText(shareText);
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
              <img
                src={previewUrl}
                alt="Bhagavad Gita Shloka Card Preview"
                className="share-card-preview-img"
              />
            ) : (
              <div className="preview-loading">
                <span>કાર્ડ તૈયાર થઈ રહ્યું છે...</span>
              </div>
            )}
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

