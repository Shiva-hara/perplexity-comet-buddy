import { useState, useCallback } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export interface Tab {
  id: string;
  url: string;
  displayUrl: string;
  title: string;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
  messages: Message[];
  favicon?: string;
}

function createTab(url = ""): Tab {
  return {
    id: crypto.randomUUID(),
    url,
    displayUrl: url,
    title: url ? url : "New Tab",
    isLoading: false,
    history: url ? [url] : [],
    historyIndex: url ? 0 : -1,
    messages: [],
  };
}

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([createTab()]);
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const tab = createTab();
    return tab.id;
  });

  // Initialize properly
  const [initialized] = useState(() => {
    const initialTab = createTab();
    setTabs([initialTab]);
    setActiveTabId(initialTab.id);
    return true;
  });

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  const addTab = useCallback((url = "") => {
    const tab = createTab(url);
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    return tab.id;
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length === 1) return [createTab()];
        const next = prev.filter((t) => t.id !== id);
        return next;
      });
      setActiveTabId((prev) => {
        if (prev !== id) return prev;
        const remaining = tabs.filter((t) => t.id !== id);
        return remaining[remaining.length - 1]?.id ?? tabs[0]?.id ?? "";
      });
    },
    [tabs]
  );

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const navigate = useCallback(
    (url: string) => {
      if (!activeTab) return;
      const normalizedUrl = normalizeUrl(url);
      const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
      newHistory.push(normalizedUrl);
      updateTab(activeTab.id, {
        url: normalizedUrl,
        displayUrl: normalizedUrl,
        isLoading: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        title: "Loading...",
      });
    },
    [activeTab, updateTab]
  );

  const goBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIndex = activeTab.historyIndex - 1;
    const url = activeTab.history[newIndex];
    updateTab(activeTab.id, {
      url,
      displayUrl: url,
      historyIndex: newIndex,
      isLoading: true,
    });
  }, [activeTab, updateTab]);

  const goForward = useCallback(() => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const newIndex = activeTab.historyIndex + 1;
    const url = activeTab.history[newIndex];
    updateTab(activeTab.id, {
      url,
      displayUrl: url,
      historyIndex: newIndex,
      isLoading: true,
    });
  }, [activeTab, updateTab]);

  const refresh = useCallback(() => {
    if (!activeTab || !activeTab.url) return;
    updateTab(activeTab.id, { isLoading: true });
    // Force iframe reload by temporarily changing URL
    const url = activeTab.url;
    updateTab(activeTab.id, { url: "", isLoading: true });
    setTimeout(() => updateTab(activeTab.id, { url, isLoading: true }), 50);
  }, [activeTab, updateTab]);

  const addMessage = useCallback(
    (message: Message) => {
      if (!activeTab) return;
      updateTab(activeTab.id, {
        messages: [...activeTab.messages, message],
      });
    },
    [activeTab, updateTab]
  );

  const updateLastMessage = useCallback(
    (content: string, citations?: string[]) => {
      if (!activeTab) return;
      const msgs = [...activeTab.messages];
      if (msgs.length === 0) return;
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content, citations };
      updateTab(activeTab.id, { messages: msgs });
    },
    [activeTab, updateTab]
  );

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    updateTab,
    navigate,
    goBack,
    goForward,
    refresh,
    addMessage,
    updateLastMessage,
    canGoBack: (activeTab?.historyIndex ?? 0) > 0,
    canGoForward: (activeTab?.historyIndex ?? 0) < (activeTab?.history.length ?? 0) - 1,
  };
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  // If it looks like a URL (has dots and no spaces, or starts with http)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  // Has a dot and no spaces — treat as domain
  if (/^[^\\s]+\.[^\\s]+$/.test(trimmed)) return `https://${trimmed}`;
  // Otherwise treat as a Perplexity search
  return `https://www.perplexity.ai/search?q=${encodeURIComponent(trimmed)}`;
}
