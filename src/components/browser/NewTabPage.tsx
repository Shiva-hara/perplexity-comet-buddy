import { useState, KeyboardEvent } from "react";
import { Search, Zap } from "lucide-react";
import { normalizeUrl } from "@/hooks/useTabs";

interface NewTabPageProps {
  onNavigate: (url: string) => void;
}

const quickLinks = [
  { label: "Perplexity", url: "https://www.perplexity.ai", icon: "🔍" },
  { label: "GitHub", url: "https://github.com", icon: "🐙" },
  { label: "YouTube", url: "https://www.youtube.com", icon: "▶️" },
  { label: "Wikipedia", url: "https://www.wikipedia.org", icon: "📚" },
  { label: "Reddit", url: "https://www.reddit.com", icon: "🤖" },
  { label: "Hacker News", url: "https://news.ycombinator.com", icon: "🟧" },
  { label: "Stack Overflow", url: "https://stackoverflow.com", icon: "💬" },
  { label: "MDN", url: "https://developer.mozilla.org", icon: "🦊" },
];

export function NewTabPage({ onNavigate }: NewTabPageProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    onNavigate(normalizeUrl(query));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-background px-6 py-12 select-none">
      {/* Time & Date */}
      <div className="text-center mb-10">
        <div className="text-6xl font-extralight text-foreground tabular-nums tracking-tight">
          {timeStr}
        </div>
        <div className="text-muted-foreground text-sm mt-1">{dateStr}</div>
      </div>

      {/* Comet branding */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary fill-primary" />
        </div>
        <span className="text-xl font-semibold text-foreground">Comet</span>
        <span className="text-xs text-muted-foreground bg-surface border border-border px-2 py-0.5 rounded-full">
          by Perplexity
        </span>
      </div>

      {/* Search bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or enter a URL..."
            autoFocus
            className="w-full h-12 pl-10 pr-24 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="absolute right-2 h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-xl">
        <p className="text-xs text-muted-foreground mb-3 text-center">Quick Access</p>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.url}
              onClick={() => onNavigate(link.url)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface border border-border hover:border-primary/30 hover:bg-surface/80 transition-all group"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI hint */}
      <p className="mt-10 text-xs text-muted-foreground/50 text-center">
        Click <span className="text-primary">⚡ Comet</span> in the toolbar to open the AI sidebar
      </p>
    </div>
  );
}
