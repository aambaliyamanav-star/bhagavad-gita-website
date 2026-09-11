/**
 * Gita AI Chat History Manager
 * Stores and manages conversations in localStorage with search, delete, and resume capabilities.
 */

const STORAGE_KEY = "gita_ai_conversations";
const ACTIVE_CONV_KEY = "gita_ai_active_conv_id";

export function getAllConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list)
      ? list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      : [];
  } catch (err) {
    console.error("Error reading Gita AI history:", err);
    return [];
  }
}

export function getConversationById(id) {
  const list = getAllConversations();
  return list.find((c) => c.id === id) || null;
}

export function saveConversation(conv) {
  try {
    const list = getAllConversations();
    const existingIndex = list.findIndex((c) => c.id === conv.id);

    const updatedConv = {
      ...conv,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedConv;
    } else {
      list.unshift(updatedConv);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(ACTIVE_CONV_KEY, updatedConv.id);

    window.dispatchEvent(new CustomEvent("gita-ai-history-updated"));
    return updatedConv;
  } catch (err) {
    console.error("Error saving conversation:", err);
    return conv;
  }
}

export function deleteConversation(id) {
  try {
    let list = getAllConversations();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    const activeId = localStorage.getItem(ACTIVE_CONV_KEY);
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_CONV_KEY);
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CONV_KEY);
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
      detail: { conversationId }
    })
  );
}

