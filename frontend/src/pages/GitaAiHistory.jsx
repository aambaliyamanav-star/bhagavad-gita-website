import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Sparkles,
  MessageSquareText,
  Clock,
  X,
  Bot,
  Compass
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  getAllConversations,
  deleteConversation,
  clearAllConversations,
  openConversationInAssistant
} from "../utils/gitaAiHistory";
import "./GitaAiHistory.css";

export default function GitaAiHistory() {
  const { theme } = useTheme();

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const loadData = () => {
    setConversations(getAllConversations());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("gita-ai-history-updated", handleUpdate);
    return () => {
      window.removeEventListener("gita-ai-history-updated", handleUpdate);
    };
  }, []);

  const handleDeleteOne = (e, id) => {
    e.stopPropagation();
    if (window.confirm("શું તમે આ સંવાદ ડીલીટ કરવા માંગો છો?")) {
      deleteConversation(id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("શું તમે તમામ AI સંવાદો હંમેશ માટે ડીલીટ કરવા માંગો છો?")) {
      clearAllConversations();
      setConfirmClearAll(false);
    }
  };

  const handleResumeChat = (id) => {
    openConversationInAssistant(id);
    // Open the widget directly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const titleMatch = c.title && c.title.toLowerCase().includes(q);
    const msgMatch =
      c.messages &&
      c.messages.some((m) => m.text && m.text.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("gu-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  return (
    <main className={`gita-ai-history-page ${theme}`}>
      {/* Main Header */}
      <section className="gah-header">
        <div className="gah-header-icon-box">
          <Bot size={34} />
        </div>
        <p className="gah-sacred-subtitle">॥ श्रीमद्भगवद्गीता संवाद ॥</p>
        <h1>ગીતા AI સંવાદ ઇતિહાસ</h1>
      </section>

      {/* Search & Actions Toolbar */}
      <section className="gah-toolbar">
        <div className="gah-search-box">
          <Search size={18} className="gah-search-icon" />
          <input
            type="text"
            placeholder="કોઈપણ સવાલ કે શ્લોક શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gah-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="gah-search-clear"
              onClick={() => setSearchQuery("")}
              title="સર્ચ ક્લિયર કરો"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {conversations.length > 0 && (
          <button
            type="button"
            className="gah-clear-all-btn"
            onClick={handleClearAll}
            title="તમામ સંવાદો ડીલીટ કરો"
          >
            <Trash2 size={16} />
            <span>બધું સાફ કરો</span>
          </button>
        )}
      </section>

      {/* Conversation List */}
      <section className="gah-list-section">
        {filteredConversations.length > 0 ? (
          <div className="gah-grid">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="gah-card"
                onClick={() => handleResumeChat(conv.id)}
                title="આ સંવાદમાં આગળ વાતચીત ચાલુ કરો"
              >
                <div className="gah-card-header">
                  <div className="gah-card-icon">
                    <MessageSquareText size={20} />
                  </div>

                  <div className="gah-card-meta">
                    <span className="gah-card-time">
                      <Clock size={13} />
                      <span>{formatDate(conv.updatedAt)}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="gah-card-del-btn"
                    onClick={(e) => handleDeleteOne(e, conv.id)}
                    title="આ સંવાદ ડીલીટ કરો"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="gah-card-title">
                  {conv.title || "આધ્યાત્મિક માર્ગદર્શન"}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="gah-empty-state">
            <div className="gah-empty-icon">
              <Compass size={44} />
            </div>
            {searchQuery ? (
              <>
                <h3>કોઈ મેળ ખાતો સંવાદ મળ્યો નથી</h3>
                <p>"{searchQuery}" માટે કોઈ સવાલ કે જવાબ મળ્યા નથી.</p>
                <button
                  type="button"
                  className="gah-action-btn"
                  onClick={() => setSearchQuery("")}
                >
                  તમામ સંવાદો જુઓ
                </button>
              </>
            ) : (
              <>
                <h3>હજુ સુધી કોઈ AI સંવાદ થયેલ નથી</h3>
                <p>
                  જીવનની સમસ્યાઓ, ચિંતા, કર્મ કે કોઈપણ પ્રશ્ન માટે ગીતા AI
                  માર્ગદર્શક સાથે વાતચીત શરૂ કરો.
                </p>
                <button
                  type="button"
                  className="gah-action-btn"
                  onClick={() => {
                    openConversationInAssistant(null);
                  }}
                >
                  <Sparkles size={16} />
                  <span>ગીતા AI સાથે સંવાદ શરૂ કરો</span>
                </button>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

