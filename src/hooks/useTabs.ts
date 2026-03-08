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

const initialTab = createTab();

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([initialTab]);
  const [activeTabId, setActiveTabId] = useState<string>(initialTab.id);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  const addTab = useCallback((url = "") => {
    const tab = createTab(url);
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    return tab.id;
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      if (prev.length === 1) {
        const fresh = createTab();
        setActiveTabId(fresh.id);
        return [fresh];
      }
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      setActiveTabId((prevActive) => {
        if (prevActive !== id) return prevActive;
        const newIdx = Math.max(0, idx - 1);
        return next[newIdx]?.id ?? next[0]?.id ?? "";
      });
      return next;
    });
  }, []);

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const navigate = useCallback(
    (url: string, tabId?: string) => {
      const id = tabId ?? activeTab?.id;
      if (!id) return;
      const tab = tabs.find((t) => t.id === id) ?? activeTab;
      if (!tab) return;
      const normalizedUrl = normalizeUrl(url);
      const newHistory = tab.history.slice(0, tab.historyIndex + 1);
      newHistory.push(normalizedUrl);
      updateTab(id, {
        url: normalizedUrl,
        displayUrl: normalizedUrl,
        isLoading: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        title: "Loading…",
      });
    },
    [activeTab, tabs, updateTab]
  );

  const goBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIndex = activeTab.historyIndex - 1;
    const url = activeTab.history[newIndex];
    updateTab(activeTab.id, { url, displayUrl: url, historyIndex: newIndex, isLoading: true });
  }, [activeTab, updateTab]);

  const goForward = useCallback(() => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const newIndex = activeTab.historyIndex + 1;
    const url = activeTab.history[newIndex];
    updateTab(activeTab.id, { url, displayUrl: url, historyIndex: newIndex, isLoading: true });
  }, [activeTab, updateTab]);

  const refresh = useCallback(() => {
    if (!activeTab?.url) return;
    const url = activeTab.url;
    const id = activeTab.id;
    updateTab(id, { url: "", isLoading: true });
    setTimeout(() => updateTab(id, { url, isLoading: true }), 30);
  }, [activeTab, updateTab]);

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
    canGoBack: (activeTab?.historyIndex ?? 0) > 0,
    canGoForward: (activeTab?.historyIndex ?? 0) < (activeTab?.history.length ?? 0) - 1,
  };
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (/^[^\s]+\.[^\s]+$/.test(trimmed)) return `https://${trimmed}`;
  return `https://www.perplexity.ai/search?q=${encodeURIComponent(trimmed)}`;
}
