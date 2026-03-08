import { useState, useEffect, useCallback } from "react";
import { useTabs } from "@/hooks/useTabs";
import { TabBar } from "@/components/browser/TabBar";
import { AddressBar } from "@/components/browser/AddressBar";
import { WebFrame } from "@/components/browser/WebFrame";
import { ChatAssistant } from "@/components/browser/ChatAssistant";
import { JobTracker } from "@/components/browser/JobTracker";
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
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === "k") { e.preventDefault(); setCommandOpen(true); }
      if (mod && e.key === "t") { e.preventDefault(); addTab(); }
      if (mod && e.key === "w") { e.preventDefault(); if (activeTab) closeTab(activeTab.id); }
      if (mod && e.shiftKey && e.key === "a") { e.preventDefault(); setSidebarOpen((v) => !v); }
      if (mod && e.shiftKey && e.key === "j") { e.preventDefault(); setTrackerOpen((v) => !v); }
      if (e.key === "F5" || (mod && e.key === "r")) { e.preventDefault(); refresh(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, addTab, closeTab, refresh]);

  const handleNavigate = useCallback(
    (url: string) => {
      const normalized = normalizeUrl(url);
      navigate(normalized);
      setTrackerOpen(false);
    },
    [navigate]
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
        trackerOpen={trackerOpen}
        onNavigate={handleNavigate}
        onBack={goBack}
        onForward={goForward}
        onRefresh={refresh}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleTracker={() => setTrackerOpen((v) => !v)}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Web Frame */}
        <div className="flex flex-1 min-w-0 overflow-hidden">
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

        {/* Chat Assistant Sidebar */}
        {sidebarOpen && (
          <ChatAssistant
            currentUrl={activeTab?.url}
            onNavigate={handleNavigate}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Job Tracker overlay */}
        {trackerOpen && (
          <JobTracker
            onClose={() => setTrackerOpen(false)}
            onOpenUrl={(url) => {
              handleNavigate(url);
              setTrackerOpen(false);
            }}
          />
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={handleNavigate}
        onAISearch={() => {
          setCommandOpen(false);
          setSidebarOpen(true);
        }}
        currentUrl={activeTab?.url ?? ""}
      />
    </div>
  );
};

export default Index;
