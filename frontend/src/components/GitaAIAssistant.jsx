import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  X,
  History,
  Copy,
  Check,
  Mic,
  MicOff,
  Undo2,
  Search,
  Trash2,
  MessageSquareText,
  MessageSquare,
  Clock,
  PanelLeft,
  MoreHorizontal,
  Share2,
  Pencil,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  Plus,
  BookOpen,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getAllConversations,
  saveConversation,
  getActiveConversationId,
  setActiveConversationId,
  getConversationById,
  syncHistoryWithServer,
  deleteConversation,
  clearAllConversations,
  renameConversation,
  togglePinConversation,
  toggleArchiveConversation,
} from "../utils/gitaAiHistory";
import "./GitaAIAssistant.css";

const API_BASE = "https://bhagavad-gita-website.onrender.com";

const SUGGESTIONS = [
  "મનને એકાગ્ર અને શાંત કેવી રીતે રાખવું?",
  "કર્મણ્યેવાધિકારસ્તે શ્લોકનો સાચો અર્થ શું છે?",
  "ચિંતા અને નિષ્ફળતાના ડરમાંથી મુક્તિ કેવી રીતે મેળવવી?",
  "સાચો અને ધર્મયુક્ત નિર્ણય કેવી રીતે લેવો?"
];

// Helper to format inline markdown tokens into bold / highlighted words without raw symbols
function formatInlineText(text) {
  if (!text) return null;

  // Match bold/highlight/italic/code:
  // ***word***, **word**, __word__, ==word==, `word`, *word*, _word_
  const tokenRegex = /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|__[^_]+?__|==[^=]+?==|`[^`]+?`|\*[^*\s][^*]*?[^*\s]\*|(?<!\w)_[^_\s][^_]*?[^_\s]_(?!\w))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold + Italic: ***text***
    if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
      return (
        <strong key={index} className="gita-inline-highlight">
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="gita-inline-highlight">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Underscore bold: __text__
    if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
      return (
        <strong key={index} className="gita-inline-highlight">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Highlight: ==text==
    if (part.startsWith("==") && part.endsWith("==") && part.length > 4) {
      return (
        <strong key={index} className="gita-inline-highlight">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Code/Pill: `text`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <strong key={index} className="gita-inline-highlight">
          {part.slice(1, -1)}
        </strong>
      );
    }

    // Italic / single asterisk: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <strong key={index} className="gita-inline-highlight">
          {part.slice(1, -1)}
        </strong>
      );
    }

    // Italic / single underscore: _text_
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return (
        <strong key={index} className="gita-inline-highlight">
          {part.slice(1, -1)}
        </strong>
      );
    }

    // Strip any remaining unclosed asterisks or markdown artifacts
    const cleaned = part.replace(/\*\*/g, "").replace(/\*/g, "");
    return cleaned;
  });
}

// Helper to render entire AI/User message with clean lists, headings, quotes, and highlighted inline words
function renderMessageContent(rawText) {
  if (!rawText) return null;
  const lines = rawText.split("\n");

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={idx} className="gita-msg-spacer" />;
    }

    // Heading: ### Heading or ## Heading
    if (/^#{1,4}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{1,4}\s+/, "");
      return (
        <h5 key={idx} className="gita-msg-heading">
          {formatInlineText(headingText)}
        </h5>
      );
    }

    // Full bold line: **Heading/Important line**
    if (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.length > 4) {
      return (
        <strong key={idx} className="gita-highlight-line">
          {formatInlineText(trimmed.slice(2, -2))}
        </strong>
      );
    }

    // Quote / Shloka: > *શ્લોક* or > શ્લોક
    if (trimmed.startsWith(">")) {
      const quoteText = trimmed
        .replace(/^>\s*/, "")
        .replace(/^\*+|\*+$/g, "");
      return (
        <blockquote key={idx} className="gita-shloka-quote">
          {formatInlineText(quoteText)}
        </blockquote>
      );
    }

    // Numbered list item: 1. or 1)
    const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)$/);
    if (numMatch) {
      return (
        <div key={idx} className="gita-msg-list-item">
          <span className="gita-list-num">{numMatch[1]}</span>
          <span className="gita-list-content">
            {formatInlineText(numMatch[2])}
          </span>
        </div>
      );
    }

    // Bullet list item: * or - or •
    if (/^[-*•]\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[-*•]\s+/, "");
      return (
        <div key={idx} className="gita-msg-list-item">
          <span className="gita-list-bullet">•</span>
          <span className="gita-list-content">
            {formatInlineText(bulletContent)}
          </span>
        </div>
      );
    }

    // Regular paragraph
    return (
      <p key={idx} className="gita-msg-para">
        {formatInlineText(line)}
      </p>
    );
  });
}

export default function GitaAIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeConvId, setActiveConvId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [menuOpenConvId, setMenuOpenConvId] = useState(null);
  const [editingConvId, setEditingConvId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const hasUserMessages = messages.some((m) => m.sender === "user");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2500);
  };

  // Load and listen for history updates
  useEffect(() => {
    const updateHistoryList = () => {
      setHistoryList(getAllConversations());
    };
    updateHistoryList();

    if (user) {
      syncHistoryWithServer().then((list) => {
        if (list) setHistoryList(list);
      });
    }

    window.addEventListener("gita-ai-history-updated", updateHistoryList);
    return () => {
      window.removeEventListener("gita-ai-history-updated", updateHistoryList);
    };
  }, [user]);

  // Listen for open-history event from other pages
  useEffect(() => {
    const handleOpenHistory = () => {
      setIsOpen(true);
      setIsHistoryOpen(true);
      setHistoryList(getAllConversations());
    };
    window.addEventListener("gita-ai-open-history", handleOpenHistory);
    return () => {
      window.removeEventListener("gita-ai-open-history", handleOpenHistory);
    };
  }, []);

  // Close 3-dots dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".gita-sidebar-menu-wrapper")) {
        setMenuOpenConvId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Stop voice recognition if chat window closes
  useEffect(() => {
    if (!isOpen && isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    }
  }, [isOpen, isListening]);

  // Voice Input Toggle using Web Speech API
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "તમારા બ્રાઉઝરમાં વોઇસ ઇનપુટ સપોર્ટ નથી. કૃપા કરીને Google Chrome અથવા Microsoft Edge નો ઉપયોગ કરો."
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "gu-IN"; // Gujarati speech recognition
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        inputRef.current?.focus();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Voice input start failed:", err);
      setIsListening(false);
    }
  };

  // Auto-close if user logs out or if user enters quiz or auth page
  useEffect(() => {
    const isRestrictedPage =
      location.pathname === "/login" ||
      location.pathname === "/register" ||
      location.pathname.startsWith("/quiz");

    if ((!user || isRestrictedPage) && isOpen) {
      setIsOpen(false);
    }
  }, [user, location.pathname, isOpen]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [messages, isOpen]);

  // Sync user conversations across all devices from cloud
  useEffect(() => {
    if (user) {
      syncHistoryWithServer();
    }
  }, [user]);

  // Auto-resize input textarea up to 6-7 lines before scrolling
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      // Cap at 165px (approx 6-7 lines of text)
      inputRef.current.style.height = `${Math.min(scrollHeight, 165)}px`;
    }
  }, [inputText]);

  // Start with a clean new chat by default
  useEffect(() => {
    // Default welcome prompt for new chat
    setMessages([
      {
        id: `greeting_${Date.now()}`,
        sender: "ai",
        text: "જય શ્રી કૃષ્ણ. નવી વાતચીત માટે હું તૈયાર છું. તમારો નવો પ્રશ્ન પૂછો.",
        timestamp: new Date().toISOString(),
        isGreetingPrompt: true,
      },
    ]);

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


  // Save conversation automatically whenever messages change (excluding temporary greeting)
  useEffect(() => {
    const realMessages = messages.filter(
      (m) =>
        !m.isGreetingPrompt &&
        !m.id?.startsWith("greeting_") &&
        !m.text?.includes("નવી વાતચીત માટે હું તૈયાર છું")
    );

    if (realMessages.length > 0) {
      const firstUserMsg = realMessages.find((m) => m.sender === "user");
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
        messages: realMessages
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
        text: "જય શ્રી કૃષ્ણ. નવી વાતચીત માટે હું તૈયાર છું. તમારો નવો પ્રશ્ન પૂછો.",
        timestamp: new Date().toISOString(),
        isGreetingPrompt: true
      }
    ]);
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const query = (typeof textToSend === "string" ? textToSend : inputText).trim();
    if (!query || isLoading) return;

    if (!user) {
      setIsOpen(false);
      const targetPath = location.pathname + location.search;
      const redirectMsg = "ગીતા AI માર્ગદર્શકનો ઉપયોગ કરવા માટે Login કરવું જરૂરી છે.";

      sessionStorage.setItem(
        "authRedirect",
        JSON.stringify({
          from: targetPath,
          message: redirectMsg,
        })
      );

      navigate("/login", {
        state: {
          from: targetPath,
          message: redirectMsg,
        },
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    }

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toISOString()
    };

    // Remove any initial greeting so it vanishes from the top when user asks a question
    const activeMessages = messages.filter(
      (m) =>
        !m.isGreetingPrompt &&
        !m.id?.startsWith("greeting_") &&
        !m.text?.includes("નવી વાતચીત માટે હું તૈયાર છું")
    );

    const newMessages = [...activeMessages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/gita-ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
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
    const cleanText = text
      .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/==(.*?)==/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/^#{1,4}\s+/gm, "")
      .replace(/^>\s*/gm, "");

    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Undo changes up to this point and edit
  const handleUndoMessage = (targetIndex, text) => {
    if (isLoading) {
      setIsLoading(false);
    }
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    // Roll back conversation messages up to (and excluding) this user message
    const previousMessages = messages.slice(0, targetIndex);
    if (previousMessages.length === 0) {
      setMessages([
        {
          id: `greeting_${Date.now()}`,
          sender: "ai",
          text: "જય શ્રી કૃષ્ણ. નવી વાતચીત માટે હું તૈયાર છું. તમારો નવો પ્રશ્ન પૂછો.",
          timestamp: new Date().toISOString(),
          isGreetingPrompt: true,
        },
      ]);
    } else {
      setMessages(previousMessages);
    }

    // Populate the input box with the user's question and focus
    setInputText(text);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(text.length, text.length);
      }
    }, 50);
  };

  // Filter history conversations based on search
  const filteredHistory = historyList.filter((conv) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.trim().toLowerCase();
    const titleMatch = conv.title && conv.title.toLowerCase().includes(q);
    const msgMatch =
      conv.messages &&
      conv.messages.some((m) => m.text && m.text.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  // Date formatting for history list
  const formatHistoryDate = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return d.toLocaleTimeString("gu-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return d.toLocaleDateString("gu-IN", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  // Toggle ChatGPT style History Sidebar
  const handleToggleHistory = () => {
    if (!isHistoryOpen) {
      setHistoryList(getAllConversations());
      if (user) {
        syncHistoryWithServer().then((list) => {
          if (list) setHistoryList(list);
        });
      }
    }
    setIsHistoryOpen((prev) => !prev);
  };

  // Switch to a previous conversation
  const handleSelectConversation = (convId) => {
    const conv =
      getConversationById(convId) || historyList.find((c) => c.id === convId);
    if (conv && conv.messages) {
      setMessages(conv.messages);
      setActiveConvId(conv.id);
      setActiveConversationId(conv.id);
    }
    setIsHistoryOpen(false);
  };

  // Toggle 3-dots dropdown menu
  const handleToggleMenu = (e, convId) => {
    e.stopPropagation();
    setMenuOpenConvId((prev) => (prev === convId ? null : convId));
  };

  // Share conversation (native share or copy text to clipboard)
  const handleShareConversation = async (e, conv) => {
    e.stopPropagation();
    setMenuOpenConvId(null);
    try {
      const summary =
        conv.messages && conv.messages.length > 0
          ? conv.messages
              .filter((m) => !m.isGreetingPrompt && !m.id?.startsWith("greeting_"))
              .map(
                (m) =>
                  `${m.sender === "user" ? "પ્રશ્ન:" : "ગીતા AI:"} ${m.text}`
              )
              .join("\n\n")
          : "";

      const shareText = `॥ શ્રીમદ્ ભગવદ્ ગીતા સંવાદ ॥\n\nવિષય: ${
        conv.title || "આધ્યાત્મિક માર્ગદર્શન"
      }\n\n${summary}\n\nસંપૂર્ણ ગીતા વાંચો અને જાણો: ${window.location.origin}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: conv.title || "ગીતા AI સંવાદ",
            text: shareText,
            url: window.location.origin,
          });
          return;
        } catch (err) {}
      }

      await navigator.clipboard.writeText(shareText);
      showToast("સંવાદ ક્લિપબોર્ડ પર કોપી થયો!");
    } catch (err) {
      console.error("Share error:", err);
      showToast("શેર કરવામાં સમસ્યા આવી.");
    }
  };

  // Rename handlers
  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setMenuOpenConvId(null);
    setEditingConvId(conv.id);
    setEditingTitle(conv.title || "");
  };

  const handleSaveRename = (e, convId) => {
    if (e) e.stopPropagation();
    if (editingTitle && editingTitle.trim()) {
      renameConversation(convId, editingTitle.trim());
      showToast("નામ અપડેટ થઈ ગયું.");
    }
    setEditingConvId(null);
    setEditingTitle("");
  };

  const handleCancelRename = (e) => {
    if (e) e.stopPropagation();
    setEditingConvId(null);
    setEditingTitle("");
  };

  // Pin / Unpin toggle
  const handleTogglePin = (e, convId) => {
    e.stopPropagation();
    setMenuOpenConvId(null);
    const newPinned = togglePinConversation(convId);
    showToast(newPinned ? "સંવાદ પિન કર્યો." : "સંવાદ અનપિન કર્યો.");
  };

  // Archive / Unarchive toggle
  const handleToggleArchive = (e, convId) => {
    e.stopPropagation();
    setMenuOpenConvId(null);
    const newArchived = toggleArchiveConversation(convId);
    showToast(newArchived ? "સંવાદ આર્કાઇવ કર્યો." : "સંવાદ અન-આર્કાઇવ કર્યો.");
  };

  // Delete single conversation
  const handleDeleteHistoryItem = (e, convId) => {
    e.stopPropagation();
    setMenuOpenConvId(null);
    deleteConversation(convId);
    setHistoryList((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) {
      handleNewConversation();
    }
    showToast("સંવાદ ડીલીટ કર્યો.");
  };

  // Clear all conversations
  const handleClearAllHistory = () => {
    if (window.confirm("શું તમે તમામ AI સંવાદો હંમેશ માટે ડીલીટ કરવા માંગો છો?")) {
      clearAllConversations();
      setHistoryList([]);
      handleNewConversation();
      showToast("તમામ ઇતિહાસ સાફ કર્યો.");
    }
  };

  // Start fresh chat from history sidebar
  const handleStartNewFromHistory = () => {
    handleNewConversation();
    setIsHistoryOpen(false);
  };

  const handleGoToLogin = () => {
    setIsOpen(false);
    setIsHistoryOpen(false);
    const targetPath = location.pathname + location.search;
    const redirectMsg = "તમારી AI History સાચવવા માટે Login કરવું જરૂરી છે.";

    sessionStorage.setItem(
      "authRedirect",
      JSON.stringify({
        from: targetPath,
        message: redirectMsg,
      })
    );

    navigate("/login", {
      state: {
        from: targetPath,
        message: redirectMsg,
      },
    });
  };

  // Render single history item in sidebar with 3-dots dropdown menu
  const renderHistoryItem = (conv) => {
    const isActive = conv.id === activeConvId;
    const isEditing = editingConvId === conv.id;
    const isMenuOpen = menuOpenConvId === conv.id;

    return (
      <div
        key={conv.id}
        className={`gita-sidebar-item ${isActive ? "active" : ""} ${
          conv.isPinned ? "is-pinned" : ""
        }`}
        onClick={() => {
          if (!isEditing) handleSelectConversation(conv.id);
        }}
        role="button"
        tabIndex={0}
      >
        <div className="gita-sidebar-item-icon">
          {conv.isPinned ? (
            <Pin size={14} className="gita-sidebar-pin-badge" />
          ) : (
            <MessageSquareText size={15} />
          )}
        </div>

        <div className="gita-sidebar-item-info">
          {isEditing ? (
            <div
              className="gita-sidebar-rename-form"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editingTitle}
                autoFocus
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename(e, conv.id);
                  if (e.key === "Escape") handleCancelRename(e);
                }}
              />
              <button
                type="button"
                className="rename-action-btn save"
                onClick={(e) => handleSaveRename(e, conv.id)}
                title="સાચવો"
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                className="rename-action-btn cancel"
                onClick={handleCancelRename}
                title="રદ કરો"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <>
              <h5 className="gita-sidebar-item-title" title={conv.title}>
                {conv.title || "આધ્યાત્મિક સંવાદ"}
              </h5>
              <div className="gita-sidebar-item-meta">
                <Clock size={11} />
                <span>{formatHistoryDate(conv.updatedAt)}</span>
                {conv.messages?.length > 0 && (
                  <span className="gita-sidebar-item-count">
                    • {conv.messages.length} મેસેજ
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* 3-Dots Action Button & Floating Menu */}
        {!isEditing && (
          <div className="gita-sidebar-menu-wrapper">
            <button
              type="button"
              className={`gita-sidebar-item-more-btn ${
                isMenuOpen ? "active" : ""
              }`}
              onClick={(e) => handleToggleMenu(e, conv.id)}
              title="વિકલ્પો"
              aria-label="વધુ વિકલ્પો"
            >
              <MoreHorizontal size={15} />
            </button>

            {isMenuOpen && (
              <div
                className="gita-sidebar-menu-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Share */}
                <button
                  type="button"
                  className="gita-sidebar-menu-item"
                  onClick={(e) => handleShareConversation(e, conv)}
                >
                  <Share2 size={13} />
                  <span>શેર કરો</span>
                </button>

                {/* 2. Rename */}
                <button
                  type="button"
                  className="gita-sidebar-menu-item"
                  onClick={(e) => handleStartRename(e, conv)}
                >
                  <Pencil size={13} />
                  <span>નામ બદલો</span>
                </button>

                {/* 3. Pin / Unpin */}
                <button
                  type="button"
                  className="gita-sidebar-menu-item"
                  onClick={(e) => handleTogglePin(e, conv.id)}
                >
                  {conv.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                  <span>{conv.isPinned ? "અનપિન કરો" : "પિન કરો"}</span>
                </button>

                {/* 4. Archive / Unarchive */}
                <button
                  type="button"
                  className="gita-sidebar-menu-item"
                  onClick={(e) => handleToggleArchive(e, conv.id)}
                >
                  {conv.isArchived ? (
                    <ArchiveRestore size={13} />
                  ) : (
                    <Archive size={13} />
                  )}
                  <span>
                    {conv.isArchived ? "અન-આર્કાઇવ કરો" : "આર્કાઇવ કરો"}
                  </span>
                </button>

                <div className="gita-sidebar-menu-divider" />

                {/* 5. Delete */}
                <button
                  type="button"
                  className="gita-sidebar-menu-item danger"
                  onClick={(e) => handleDeleteHistoryItem(e, conv.id)}
                >
                  <Trash2 size={13} />
                  <span>ડીલીટ કરો</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleFabClick = () => {
    if (!user) {
      const targetPath = location.pathname + location.search;
      const redirectMsg = "ગીતા AI માર્ગદર્શકનો ઉપયોગ કરવા માટે Login કરવું જરૂરી છે.";

      sessionStorage.setItem(
        "authRedirect",
        JSON.stringify({
          from: targetPath,
          message: redirectMsg,
        })
      );

      navigate("/login", {
        state: {
          from: targetPath,
          message: redirectMsg,
        },
      });
      return;
    }
    // Always open a fresh new chat session
    handleNewConversation();
    setIsOpen(true);
  };


  // Login, Register અથવા Quiz રમતી વખતે Floating AI બટન બતાવવાની જરૂર નથી
  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/quiz")
  ) {
    return null;
  }

  return (
    <aside
      className={`gita-ai-wrapper ${theme} ${isOpen ? "is-open" : ""}`}
      aria-label="Gita AI Assistant"
    >
      {/* =================================================
          FLOATING TRIGGER BUTTON (BOTTOM RIGHT CORNER)
      ================================================= */}
      {!isOpen && (
        <button
          type="button"
          className="gita-ai-fab"
          onClick={handleFabClick}
          title="ગીતા AI માર્ગદર્શક સાથે વાત કરો"
          aria-label="ગીતા AI ખોલો"
        >
          <div className="gita-ai-fab-glow" />
          <div className="gita-ai-fab-icon-box">
            <Bot size={24} className="gita-fab-bot-icon" />
          </div>
        </button>
      )}

      {/* =================================================
          CHAT WINDOW MODAL & BLURRED BACKDROP
      ================================================= */}
      {isOpen && (
        <div className="gita-ai-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="gita-ai-window"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* =========================================================
                CHATGPT STYLE SIDEBAR DRAWER (HISTORY PANEL)
                ========================================================= */}
            <div className={`gita-sidebar-drawer ${isHistoryOpen ? "is-open" : ""}`}>
              {/* Dimmed backdrop to close sidebar on click */}
              <div
                className="gita-sidebar-backdrop"
                onClick={() => setIsHistoryOpen(false)}
                title="ચેટ પર પાછા જાઓ"
              />

              {/* Sliding Sidebar Panel */}
              <aside className="gita-sidebar-panel" aria-label="સંવાદ ઇતિહાસ">
                {/* Panel Header */}
                <div className="gita-sidebar-header">
                  <div className="gita-sidebar-header-left">
                    <History size={18} className="gita-sidebar-header-icon" />
                    <span>સંવાદ ઇતિહાસ</span>
                  </div>
                  <button
                    type="button"
                    className="gita-sidebar-close-btn"
                    onClick={() => setIsHistoryOpen(false)}
                    title="ઇતિહાસ બંધ કરો"
                    aria-label="બંધ કરો"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* New Chat Action Button */}
                <div className="gita-sidebar-new-chat-box">
                  <button
                    type="button"
                    className="gita-sidebar-new-chat-btn"
                    onClick={handleStartNewFromHistory}
                  >
                    <Plus size={16} />
                    <span>+ નવી વાતચીત</span>
                  </button>
                </div>

                {/* Archived Conversations Box (Top, below New Chat) */}
                {historyList.filter((c) => c.isArchived).length > 0 && (
                  <div className="gita-sidebar-archived-top-box">
                    <button
                      type="button"
                      className={`gita-sidebar-archived-toggle ${showArchived ? "expanded" : ""}`}
                      onClick={() => setShowArchived((prev) => !prev)}
                    >
                      <div className="gita-sidebar-archived-toggle-left">
                        <Archive size={14} />
                        <span>
                          આર્કાઇવ કરેલ સંવાદો ({historyList.filter((c) => c.isArchived).length})
                        </span>
                      </div>
                      {showArchived ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>
                    {showArchived && (
                      <div className="gita-sidebar-archived-list">
                        {historyList
                          .filter((c) => c.isArchived)
                          .map((conv) => renderHistoryItem(conv))}
                      </div>
                    )}
                  </div>
                )}

                {/* Search Bar (shows when user has 2+ chats) */}
                {historyList.length > 2 && (
                  <div className="gita-sidebar-search-box">
                    <Search size={14} className="gita-sidebar-search-icon" />
                    <input
                      type="text"
                      placeholder="ઇતિહાસમાં શોધો..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                    {historySearch && (
                      <button
                        type="button"
                        className="gita-sidebar-search-clear"
                        onClick={() => setHistorySearch("")}
                        title="સાફ કરો"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Toast Notification in Sidebar */}
                {toastMessage && (
                  <div className="gita-sidebar-toast">
                    <span>{toastMessage}</span>
                  </div>
                )}

                {/* Conversations List */}
                <div className="gita-sidebar-list">
                  {filteredHistory.length === 0 ? (
                    <div className="gita-sidebar-empty">
                      <div className="gita-sidebar-empty-icon">
                        <MessageSquareText size={26} />
                      </div>
                      <p>
                        {historySearch
                          ? "કોઈ મેળ ખાતો સંવાદ નથી મળ્યો"
                          : "કોઈ જૂનો સંવાદ નથી"}
                      </p>
                      <span>
                        {historySearch
                          ? "અન્ય શબ્દોથી શોધો."
                          : "તમારો પ્રશ્ન પૂછો, તે આપમેળે અહીં સંગ્રહિત થશે."}
                      </span>
                    </div>
                  ) : historySearch.trim() ? (
                    filteredHistory.map((conv) => renderHistoryItem(conv))
                  ) : (
                    <>
                      {/* Pinned Conversations */}
                      {historyList.filter((c) => c.isPinned && !c.isArchived).length > 0 && (
                        <div className="gita-sidebar-group">
                          <div className="gita-sidebar-group-title">
                            <Pin size={12} />
                            <span>પિન કરેલા સંવાદો</span>
                          </div>
                          {historyList
                            .filter((c) => c.isPinned && !c.isArchived)
                            .map((conv) => renderHistoryItem(conv))}
                        </div>
                      )}

                      {/* Recent Unpinned Conversations */}
                      {historyList.filter((c) => !c.isPinned && !c.isArchived).length > 0 && (
                        <div className="gita-sidebar-group">
                          {historyList.filter((c) => c.isPinned && !c.isArchived).length > 0 && (
                            <div className="gita-sidebar-group-title">
                              <span>તાજેતરના સંવાદો</span>
                            </div>
                          )}
                          {historyList
                            .filter((c) => !c.isPinned && !c.isArchived)
                            .map((conv) => renderHistoryItem(conv))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Sidebar Footer */}
                <div className="gita-sidebar-footer">
                  {!user ? (
                    <div className="gita-sidebar-auth-card">
                      <p>બધા ડીવાઈસમાં હિસ્ટ્રી મેળવવા માટે</p>
                      <button
                        type="button"
                        className="gita-sidebar-login-btn"
                        onClick={handleGoToLogin}
                      >
                        Login કરો →
                      </button>
                    </div>
                  ) : (
                    historyList.length > 0 && (
                      <button
                        type="button"
                        className="gita-sidebar-clear-all"
                        onClick={handleClearAllHistory}
                      >
                        <Trash2 size={13} />
                        <span>તમામ ઇતિહાસ સાફ કરો</span>
                      </button>
                    )
                  )}
                </div>
              </aside>
            </div>

            {/* WINDOW HEADER (ChatGPT Style with History on the LEFT) */}
            <header className="gita-ai-header">
              <div className="gita-ai-header-left">
                {/* ChatGPT style sidebar drawer toggle button on the LEFT */}
                <button
                  type="button"
                  className={`gita-ai-icon-btn sidebar-toggle-btn ${isHistoryOpen ? "active" : ""}`}
                  onClick={handleToggleHistory}
                  title={isHistoryOpen ? "ઇતિહાસ સાઇડબાર બંધ કરો" : "સંવાદ ઇતિહાસ જુઓ (Sidebar)"}
                  aria-label="સાઇડબાર"
                >
                  <PanelLeft size={18} />
                </button>

                <div className="gita-ai-avatar">
                  <Bot size={19} />
                  <span className="gita-ai-online-dot" />
                </div>
                <div className="gita-ai-header-titles">
                  <h3>ગીતા AI</h3>
                  <span>॥ श्रीकृष्णः शरणं मम ॥</span>
                </div>
              </div>

              <div className="gita-ai-header-actions">
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
                  title="ચેટ બંધ કરો"
                  aria-label="ચેટ બંધ કરો"
                >
                  <X size={19} />
                </button>
              </div>
            </header>

          {/* CHAT MESSAGES BODY */}
          <div className="gita-ai-body">
            {messages.length === 0 && !isLoading && (
              <div className="gita-empty-chat-state">
                <div className="gita-empty-chat-icon">
                  <Bot size={28} />
                </div>
                <h4>ગીતા AI માર્ગદર્શક</h4>
                <p>તમારો કોઈપણ પ્રશ્ન પૂછો અથવા નીચે આપેલા પ્રશ્નોમાંથી પસંદ કરો</p>
              </div>
            )}

            {messages.map((msg, index) => (
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
                    {renderMessageContent(msg.text)}
                  </div>

                  {msg.sender === "ai" && (
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

                  {msg.sender === "user" && (
                    <div className="gita-user-msg-actions">
                      <button
                        type="button"
                        className="gita-user-icon-btn"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title={copiedId === msg.id ? "કોપી થયું!" : "પ્રશ્ન કોપી કરો"}
                        aria-label="પ્રશ્ન કોપી કરો"
                      >
                        {copiedId === msg.id ? (
                          <Check size={13} strokeWidth={2.5} />
                        ) : (
                          <Copy size={13} strokeWidth={2.2} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="gita-user-icon-btn"
                        onClick={() => handleUndoMessage(index, msg.text)}
                        title="આ પ્રશ્ન સુધી Undo કરો અને સુધારો"
                        aria-label="આ પ્રશ્ન સુધી Undo કરો અને સુધારો"
                      >
                        <Undo2 size={13} strokeWidth={2.2} />
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
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK SUGGESTIONS */}
          {!hasUserMessages && !isLoading && (
            <div className="gita-suggestions-bar">
              <div className="gita-suggestions-scroll">
                {SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    className="gita-suggestion-chip"
                    onClick={() => handleSendMessage(sug)}
                  >
                    <MessageSquare size={13} className="gita-suggestion-icon" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CHAT INPUT FORM */}
          <footer className="gita-ai-footer">
            {isListening && (
              <div className="gita-listening-bar">
                <span className="gita-listening-wave" />
                <span>માઇક ચાલુ છે... બોલો (તમારો અવાજ લખાશે)</span>
              </div>
            )}
            <div
              className={`gita-input-wrapper ${
                isListening ? "listening-active" : ""
              }`}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? "સાંભળી રહ્યું છે... બોલો..."
                    : "તમારો આધ્યાત્મિક પ્રશ્ન કે સમસ્યા પૂછો..."
                }
                className="gita-ai-textarea"
                disabled={isLoading}
              />

              {/* VOICE INPUT (MIC) BUTTON */}
              <button
                type="button"
                className={`gita-ai-mic-btn ${
                  isListening ? "active-recording" : ""
                }`}
                onClick={toggleVoiceInput}
                disabled={isLoading}
                title={
                  isListening
                    ? "સાંભળવાનું બંધ કરવા ક્લિક કરો"
                    : "વોઇસ દ્વારા બોલીને પૂછો (માઇક)"
                }
                aria-label="વોઇસ ઇનપુટ"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

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
      </div>
      )}
    </aside>
  );
}

