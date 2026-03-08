import { Plus, X } from "lucide-react";
import { Tab } from "@/hooks/useTabs";
import { cn } from "@/lib/utils";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }: TabBarProps) {
  return (
    <div className="flex items-end h-9 bg-chrome border-b border-border select-none overflow-x-auto overflow-y-hidden scrollbar-none">
      {/* macOS traffic lights placeholder */}
      <div className="flex items-center gap-1.5 px-4 pb-1 shrink-0">
        <div className="w-3 h-3 rounded-full bg-[hsl(0,72%,51%)] opacity-70" />
        <div className="w-3 h-3 rounded-full bg-[hsl(40,80%,55%)] opacity-70" />
        <div className="w-3 h-3 rounded-full bg-[hsl(120,50%,45%)] opacity-70" />
      </div>

      <div className="flex items-end gap-0.5 flex-1 overflow-x-auto overflow-y-hidden pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              "group relative flex items-center gap-2 h-8 px-3 min-w-[120px] max-w-[200px] rounded-t-lg text-xs transition-all duration-150 shrink-0",
              tab.id === activeTabId
                ? "bg-background text-foreground border-t border-l border-r border-border"
                : "bg-transparent text-muted-foreground hover:bg-surface/60 hover:text-foreground"
            )}
          >
            {/* Favicon */}
            {tab.url && !tab.url.includes("perplexity.ai/search") ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${tab.url}&sz=16`}
                alt=""
                className="w-3.5 h-3.5 shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-3.5 h-3.5 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            )}

            <span className="truncate flex-1 text-left">
              {tab.isLoading ? "Loading…" : (tab.title || "New Tab")}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
              className={cn(
                "shrink-0 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-border transition-opacity",
                tab.id === activeTabId && "opacity-60 group-hover:opacity-100"
              )}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </button>
        ))}

        <button
          onClick={onNewTab}
          className="flex items-center justify-center w-7 h-7 mb-0.5 ml-1 rounded hover:bg-surface text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="New tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
