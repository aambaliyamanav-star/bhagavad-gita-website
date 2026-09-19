/**
 * Gita AI Chat History Manager
 * Stores and manages conversations in localStorage and syncs with backend database
 * so conversations are identical across mobile, laptop, and any device for the same account.
 */

const API_BASE = "https://bhagavad-gita-website.onrender.com";
const ACTIVE_CONV_KEY = "gita_ai_active_conv_id";

function getUserStorageKey() {
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u && (u._id || u.email)) {
        return `gita_ai_conversations_${u._id || u.email}`;
      }
    }
  } catch (e) {}
  return "gita_ai_conversations";
}

function sortConversations(list) {
  return list.sort((a, b) => {
    // Pinned conversations always come first
    if (Boolean(b.isPinned) !== Boolean(a.isPinned)) {
      return b.isPinned ? 1 : -1;
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

export function getAllConversations() {
  try {
    const key = getUserStorageKey();
    let raw = localStorage.getItem(key);
    // Fallback to general storage if migration needed
    if (!raw && key !== "gita_ai_conversations") {
      raw = localStorage.getItem("gita_ai_conversations");
    }
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? sortConversations(list) : [];
  } catch (err) {
    console.error("Error reading Gita AI history:", err);
    return [];
  }
}

export function getConversationById(id) {
  const list = getAllConversations();
  return list.find((c) => c.id === id) || null;
}

export async function syncHistoryWithServer() {
  const token = localStorage.getItem("token");
  if (!token) return getAllConversations();

  try {
    const res = await fetch(`${API_BASE}/api/gita-ai/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        const localList = getAllConversations();
        const map = new Map();

        // 1. Add local conversations
        localList.forEach((c) => map.set(c.id, c));

        // 2. Server conversations take precedence or merge
        data.conversations.forEach((c) => {
          const existing = map.get(c.id);
          if (!existing) {
            map.set(c.id, c);
          } else {
            // Keep the latest version, preserving flags
            const serverUpdated = new Date(c.updatedAt);
            const localUpdated = new Date(existing.updatedAt);
            const base = serverUpdated >= localUpdated ? c : existing;
            map.set(c.id, {
              ...base,
              isPinned: c.isPinned ?? existing.isPinned ?? false,
              isArchived: c.isArchived ?? existing.isArchived ?? false,
            });
          }
        });

        const merged = sortConversations(Array.from(map.values()));

        localStorage.setItem(getUserStorageKey(), JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
        return merged;
      }
    }
  } catch (err) {
    console.debug("Gita AI history server sync failed:", err);
  }
  return getAllConversations();
}

export function saveConversation(conv) {
  try {
    const key = getUserStorageKey();
    const list = getAllConversations();
    const existingIndex = list.findIndex((c) => c.id === conv.id);

    const updatedConv = {
      ...conv,
      isPinned: conv.isPinned ?? false,
      isArchived: conv.isArchived ?? false,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedConv;
    } else {
      list.unshift(updatedConv);
    }

    const sortedList = sortConversations(list);
    localStorage.setItem(key, JSON.stringify(sortedList));
    localStorage.setItem(ACTIVE_CONV_KEY, updatedConv.id);

    // Sync asynchronously to backend if logged in
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/gita-ai/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          convId: updatedConv.id,
          title: updatedConv.title,
          messages: updatedConv.messages,
          isPinned: !!updatedConv.isPinned,
          isArchived: !!updatedConv.isArchived,
        }),
      }).catch((err) => console.debug("Server save failed:", err));
    }

    window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
    return updatedConv;
  } catch (err) {
    console.error("Error saving conversation:", err);
    return conv;
  }
}

export function deleteConversation(id) {
  try {
    const key = getUserStorageKey();
    let list = getAllConversations();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(key, JSON.stringify(list));

    const activeId = localStorage.getItem(ACTIVE_CONV_KEY);
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }

    // Sync delete to backend if logged in
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/gita-ai/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => console.debug("Server delete failed:", err));
    }

    window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
    return true;
  } catch (err) {
    console.error("Error deleting conversation:", err);
    return false;
  }
}

export function clearAllConversations() {
  try {
    const key = getUserStorageKey();
    localStorage.removeItem(key);
    localStorage.removeItem(ACTIVE_CONV_KEY);

    // Sync clear to backend if logged in
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/gita-ai/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => console.debug("Server clear failed:", err));
    }

    window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
    return true;
  } catch (err) {
    console.error("Error clearing conversations:", err);
    return false;
  }
}

export function getActiveConversationId() {
  return localStorage.getItem(ACTIVE_CONV_KEY);
}

export function setActiveConversationId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_CONV_KEY);
  }
}

export function searchConversations(query) {
  const all = getAllConversations();
  if (!query || !query.trim()) return all;

  const q = query.trim().toLowerCase();
  return all.filter((conv) => {
    if (conv.title && conv.title.toLowerCase().includes(q)) return true;
    if (
      conv.messages &&
      conv.messages.some((m) => m.text && m.text.toLowerCase().includes(q))
    ) {
      return true;
    }
    return false;
  });
}

export function openConversationInAssistant(conversationId) {
  setActiveConversationId(conversationId);
  window.dispatchEvent(
    new CustomEvent("gita-ai-open-conversation", {
      detail: { conversationId },
    })
  );
}

export function renameConversation(id, newTitle) {
  try {
    const key = getUserStorageKey();
    const list = getAllConversations();
    const target = list.find((c) => c.id === id);
    if (!target) return false;

    target.title = newTitle.trim() || target.title;
    target.updatedAt = new Date().toISOString();

    const sortedList = sortConversations(list);
    localStorage.setItem(key, JSON.stringify(sortedList));

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/gita-ai/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          convId: target.id,
          title: target.title,
          messages: target.messages,
          isPinned: !!target.isPinned,
          isArchived: !!target.isArchived,
        }),
      }).catch((err) => console.debug("Server rename sync failed:", err));
    }

    window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
    return true;
  } catch (err) {
    console.error("Error renaming conversation:", err);
    return false;
  }
}

export function togglePinConversation(id) {
  try {
    const key = getUserStorageKey();
    const list = getAllConversations();
    const target = list.find((c) => c.id === id);
    if (!target) return false;

    target.isPinned = !target.isPinned;
    target.updatedAt = new Date().toISOString();

    const sortedList = sortConversations(list);
    localStorage.setItem(key, JSON.stringify(sortedList));

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/gita-ai/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          convId: target.id,
          title: target.title,
          messages: target.messages,
          isPinned: !!target.isPinned,
          isArchived: !!target.isArchived,
        }),
      }).catch((err) => console.debug("Server pin sync failed:", err));
    }

    window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
    return target.isPinned;
  } catch (err) {
    console.error("Error toggling pin conversation:", err);
    return false;
  }
}

export function toggleArchiveConversation(id) {
  try {
    const key = getUserStorageKey();
    const list = getAllConversations();
    const target = list.find((c) => c.id === id);
    if (!target) return false;

    target.isArchived = !target.isArchived;
    target.updatedAt = new Date().toISOString();

    const sortedList = sortConversations(list);
    localStorage.setItem(key, JSON.stringify(sortedList));

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/gita-ai/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          convId: target.id,
          title: target.title,
          messages: target.messages,
          isPinned: !!target.isPinned,
          isArchived: !!target.isArchived,
        }),
      }).catch((err) => console.debug("Server archive sync failed:", err));
    }

    window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
    return target.isArchived;
  } catch (err) {
    console.error("Error toggling archive conversation:", err);
    return false;
  }
}
