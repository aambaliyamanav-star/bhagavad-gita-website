import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  X,
  History,
  Copy,
  Check,
  ChevronDown,
  BookOpen,
  MessageSquareText
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  getAllConversations,
  saveConversation,
  getActiveConversationId,
  setActiveConversationId,
  getConversationById
} from "../utils/gitaAiHistory";
import "./GitaAIAssistant.css";

const API_BASE = "https://bhagavad-gita-website.onrender.com";

const INITIAL_GREETING = {
  id: "greeting",
  sender: "ai",
  text: "જય શ્રી કૃષ્ણ! 🙏 હું તમારો ગીતા AI માર્ગદર્શક છું.\n\nતમારા જીવનની કોઈપણ મુંઝવણ, ચિંતા, કર્મ કે અધ્યાત્મ વિશે પ્રશ્ન પૂછો. હું તમને શ્રીમદ્ ભગવદ્ ગીતાના પવિત્ર શ્લોકો અને ભગવાન શ્રીકૃષ્ણના ઉપદેશો દ્વારા સચોટ માર્ગદર્શન આપીશ.",
  timestamp: new Date().toISOString()
};

const SUGGESTIONS = [
  "મનને એકાગ્ર અને શાંત કેવી રીતે રાખવું?",
  "કર્મણ્યેવાધિકારસ્તે શ્લોકનો સાચો અર્થ શું છે?",
  "ચિંતા અને નિષ્ફળતાના ડરમાંથી મુક્તિ કેવી રીતે મેળવવી?",
  "સાચો અને ધર્મયુક્ત નિર્ણય કેવી રીતે લેવો?"
];

export default function GitaAIAssistant() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeConvId, setActiveConvId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Load existing active conversation or create initial
  useEffect(() => {
    const savedActiveId = getActiveConversationId();
    if (savedActiveId) {
      const conv = getConversationById(savedActiveId);
      if (conv && conv.messages && conv.messages.length > 0) {
        setMessages(conv.messages);
        setActiveConvId(conv.id);
      }
    }

    // Listen for custom event from History page to resume specific conversation
    const handleOpenConversation = (e) => {
      const targetId = e.detail?.conversationId;
      if (targetId) {
        const targetConv = getConversationById(targetId);
        if (targetConv && targetConv.messages) {
          setMessages(targetConv.messages);
          setActiveConvId(targetConv.id);
        }
      }
      setIsOpen(true);
    };

    window.addEventListener("gita-ai-open-conversation", handleOpenConversation);
    return () => {
      window.removeEventListener("gita-ai-open-conversation", handleOpenConversation);
    };
  }, []);

  // Save conversation automatically whenever messages change (after greeting)
  useEffect(() => {
    if (messages.length > 1) {
      const firstUserMsg = messages.find((m) => m.sender === "user");
      const title = firstUserMsg
        ? firstUserMsg.text.slice(0, 45) + (firstUserMsg.text.length > 45 ? "..." : "")
        : "આધ્યાત્મિક સંવાદ";

      const convId = activeConvId || `gita_chat_${Date.now()}`;
      if (!activeConvId) {
        setActiveConvId(convId);
      }

      saveConversation({
        id: convId,
        title,
        messages
      });
    }
  }, [messages, activeConvId]);

  // Start new conversation
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setActiveConvId(null);
    setMessages([
      {
        id: `greeting_${Date.now()}`,
        sender: "ai",
        text: "જય શ્રી કૃષ્ણ! 🙏 નવી વાતચીત માટે હું તૈયાર છું. તમારો નવો પ્રશ્ન પૂછો.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/gita-ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6)
        })
      });

      const data = await response.json();

      if (data.success && data.answer) {
        const aiMessage = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: data.answer,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || "ઉત્તર મેળવવામાં સમસ્યા આવી.");
      }
    } catch (error) {
      console.error("Gita AI Request Error:", error);
      const errorMessage = {
        id: `err_${Date.now()}`,
        sender: "ai",
        text: "ક્ષમા કરશો, પ્રશ્નનો ઉત્તર મેળવવામાં ટેક્નિકલ સમસ્યા આવી છે. કૃપા કરીને થોડી ક્ષણો પછી ફરી પૂછો.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenHistory = () => {
    setIsOpen(false);
    navigate("/gita-ai-history");
  };

  return (
    <aside className={`gita-ai-wrapper ${theme}`} aria-label="Gita AI Assistant">
      {/* =================================================
          FLOATING TRIGGER BUTTON (BOTTOM RIGHT CORNER)
      ================================================= */}
      {!isOpen && (
        <button
          type="button"
          className="gita-ai-fab"
          onClick={() => setIsOpen(true)}
          title="ગીતા AI માર્ગદર્શક સાથે વાત કરો"
          aria-label="ગીતા AI ખોલો"
        >
          <div className="gita-ai-fab-glow" />
          <div className="gita-ai-fab-icon-box">
            <Sparkles size={22} className="gita-fab-sparkle" />
          </div>
          <span className="gita-ai-fab-label">ગીતા AI</span>
        </button>
      )}

      {/* =================================================
          CHAT WINDOW MODAL
      ================================================= */}
      {isOpen && (
        <div className="gita-ai-window" role="dialog" aria-modal="true">
          {/* WINDOW HEADER */}
          <header className="gita-ai-header">
            <div className="gita-ai-header-left">
              <div className="gita-ai-avatar">
                <Bot size={20} />
                <span className="gita-ai-online-dot" />
              </div>
              <div className="gita-ai-header-titles">
                <h3>ગીતા AI માર્ગદર્શક</h3>
                <span>॥ श्रीकृष्णः शरणं मम ॥</span>
              </div>
            </div>

            <div className="gita-ai-header-actions">
              {/* History Button */}
              <button
                type="button"
                className="gita-ai-icon-btn"
                onClick={handleOpenHistory}
                title="સંવાદ ઇતિહાસ જુઓ"
                aria-label="ઇતિહાસ"
              >
                <History size={17} />
              </button>

              {/* New Conversation Button */}
              <button
                type="button"
                className="gita-ai-icon-btn"
                onClick={handleNewConversation}
                title="નવી વાતચીત શરૂ કરો"
                aria-label="નવી વાતચીત"
              >
                <RotateCcw size={17} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                className="gita-ai-icon-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="બંધ કરો"
                aria-label="ચેટ બંધ કરો"
              >
                <X size={19} />
              </button>
            </div>
          </header>

          {/* CHAT MESSAGES BODY */}
          <div className="gita-ai-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`gita-msg-row ${
                  msg.sender === "user" ? "user-row" : "ai-row"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="gita-msg-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <div className="gita-msg-bubble">
                  <div className="gita-msg-text">
                    {msg.text.split("\n").map((line, idx) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <strong key={idx} className="gita-highlight-line">
                            {line.replace(/\*\*/g, "")}
                          </strong>
                        );
                      }
                      if (line.startsWith("> *") || line.startsWith(">*")) {
                        return (
                          <blockquote key={idx} className="gita-shloka-quote">
                            {line.replace(/^>\s*\*/, "").replace(/\*$/, "")}
                          </blockquote>
                        );
                      }
                      return (
                        <p key={idx} className="gita-msg-para">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {msg.sender === "ai" && msg.id !== "greeting" && (
                    <div className="gita-msg-actions">
                      <button
                        type="button"
                        className="gita-copy-btn"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="ઉત્તર કોપી કરો"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} />
                            <span>કોપી થયું</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>કોપી</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isLoading && (
              <div className="gita-msg-row ai-row">
                <div className="gita-msg-avatar">
                  <Bot size={16} />
                </div>
                <div className="gita-msg-bubble typing-bubble">
                  <div className="gita-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="gita-typing-label">
                    ગીતામાંથી દિવ્ય માર્ગદર્શન મેળવી રહ્યા છીએ...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK SUGGESTIONS */}
          {messages.length <= 2 && !isLoading && (
            <div className="gita-suggestions-bar">
              <div className="gita-suggestions-scroll">
                {SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    className="gita-suggestion-chip"
                    onClick={() => handleSendMessage(sug)}
                  >
                    <Sparkles size={12} />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CHAT INPUT FORM */}
          <footer className="gita-ai-footer">
            <div className="gita-input-wrapper">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="તમારો આધ્યાત્મિક પ્રશ્ન કે સમસ્યા પૂછો..."
                className="gita-ai-textarea"
                disabled={isLoading}
              />

              <button
                type="button"
                className="gita-ai-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                title="સવાલ મોકલો"
                aria-label="સવાલ મોકલો"
              >
                <Send size={16} />
              </button>
            </div>
          </footer>
        </div>
      )}
    </aside>
  );
}

