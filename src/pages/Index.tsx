import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { useTabs } from "@/hooks/useTabs";
import { TabBar } from "@/components/browser/TabBar";
import { AddressBar } from "@/components/browser/AddressBar";
import { WebFrame } from "@/components/browser/WebFrame";
import { ChatAssistant } from "@/components/browser/ChatAssistant";
import { CommandPalette } from "@/components/browser/CommandPalette";
import { normalizeUrl } from "@/hooks/useTabs";

const Index = () => {
  const {
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
    canGoBack,
    canGoForward,
  } = useTabs();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [tabMessages, setTabMessages] = useState<Record<string, PerplexityMessage[]>>({});

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === "k") { e.preventDefault(); setCommandOpen(true); }
      if (mod && e.key === "t") { e.preventDefault(); addTab(); }
      if (mod && e.key === "w") { e.preventDefault(); if (activeTab) closeTab(activeTab.id); }
      if (mod && e.shiftKey && e.key === "a") { e.preventDefault(); setSidebarOpen((v) => !v); }
      if (e.key === "F5" || (mod && e.key === "r")) { e.preventDefault(); refresh(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, addTab, closeTab, refresh]);

  const handleNavigate = useCallback(
    (url: string) => {
      const normalized = normalizeUrl(url);
      navigate(normalized);
      // If it's a Perplexity search, also open the AI sidebar
      if (!normalized.startsWith("http") || normalized.includes("perplexity.ai/search")) {
        setSidebarOpen(true);
      }
    },
    [navigate]
  );

  const handleAISearch = useCallback((query: string) => {
    setSidebarOpen(true);
    const id = activeTab?.id;
    if (!id) return;
    // Inject the query as a pre-filled message prompt  
    setTabMessages((prev) => {
      const msgs = prev[id] ?? [];
      return { ...prev, [id]: [...msgs, { role: "user" as const, content: query }] };
    });
  }, [activeTab]);

  const currentMessages: PerplexityMessage[] = (activeTab ? tabMessages[activeTab.id] : undefined) ?? [];

  const setCurrentMessages = useCallback(
    (msgs: PerplexityMessage[]) => {
      if (!activeTab) return;
      setTabMessages((prev) => ({ ...prev, [activeTab.id]: msgs }));
    },
    [activeTab]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTabId}
        onTabClose={closeTab}
        onNewTab={() => addTab()}
      />

      {/* Address Bar */}
      <AddressBar
        url={activeTab?.url ?? ""}
        isLoading={activeTab?.isLoading ?? false}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        sidebarOpen={sidebarOpen}
        onNavigate={handleNavigate}
        onBack={goBack}
        onForward={goForward}
        onRefresh={refresh}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Web Frame */}
        <div className="flex flex-1 overflow-hidden">
          {activeTab && (
            <WebFrame
              key={activeTab.id}
              url={activeTab.url}
              onTitleChange={(title) => updateTab(activeTab.id, { title })}
              onLoadingChange={(loading) => updateTab(activeTab.id, { isLoading: loading })}
              onNavigate={handleNavigate}
            />
          )}
        </div>

        {/* AI Sidebar */}
        {sidebarOpen && activeTab && (
          <AISidebar
            currentUrl={activeTab.url}
            messages={currentMessages}
            onMessagesChange={setCurrentMessages}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={handleNavigate}
        onAISearch={(query) => {
          setCommandOpen(false);
          handleAISearch(query);
        }}
        currentUrl={activeTab?.url ?? ""}
      />
    </div>
  );
};

export default Index;
