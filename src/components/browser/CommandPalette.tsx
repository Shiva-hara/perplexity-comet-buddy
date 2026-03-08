import { useEffect, useRef, useState } from "react";
import { Search, ArrowRight, Globe, Zap, X } from "lucide-react";
import { normalizeUrl } from "@/hooks/useTabs";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  onAISearch: (query: string) => void;
  currentUrl: string;
}

const SUGGESTIONS = [
  { type: "ai" as const, label: "Summarize this page", prompt: "Summarize the current page" },
  { type: "ai" as const, label: "Find key insights", prompt: "What are the key insights on this page?" },
  { type: "ai" as const, label: "Explain simply", prompt: "Explain the main topic of this page simply" },
  { type: "nav" as const, label: "New Tab", url: "" },
  { type: "nav" as const, label: "Perplexity", url: "https://perplexity.ai" },
  { type: "nav" as const, label: "GitHub", url: "https://github.com" },
];

export function CommandPalette({ isOpen, onClose, onNavigate, onAISearch, currentUrl }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); handleSelect(filtered[selectedIndex]); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const filtered = query
    ? [
        { type: "search" as const, label: `Search: ${query}`, url: query, prompt: query },
        { type: "ai" as const, label: `Ask AI: ${query}`, prompt: query, url: "" },
        ...SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase())),
      ]
    : SUGGESTIONS;

  function handleSelect(item: (typeof filtered)[0]) {
    if (!item) return;
    if (item.type === "ai") {
      onAISearch(item.prompt ?? item.label);
    } else {
      onNavigate(normalizeUrl(item.url ?? query));
    }
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search, navigate, or ask AI..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                i === selectedIndex ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0",
                item.type === "ai" ? "bg-primary/10 border-primary/20" : "bg-surface border-border"
              )}>
                {item.type === "ai" ? (
                  <Zap className="w-3.5 h-3.5 text-primary" />
                ) : item.type === "search" ? (
                  <Search className="w-3.5 h-3.5" />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="flex-1 truncate">{item.label}</span>
              {i === selectedIndex && <ArrowRight className="w-3.5 h-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="bg-surface border border-border px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-surface border border-border px-1 rounded">↵</kbd> select</span>
          <span><kbd className="bg-surface border border-border px-1 rounded">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
