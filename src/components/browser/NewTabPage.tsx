import { useState, KeyboardEvent } from "react";
import { Search, Briefcase } from "lucide-react";
import { normalizeUrl } from "@/hooks/useTabs";

interface NewTabPageProps {
  onNavigate: (url: string) => void;
}

const quickLinks = [
  { label: "LinkedIn", url: "https://www.linkedin.com/jobs", icon: "💼" },
  { label: "Naukri", url: "https://www.naukri.com", icon: "🏢" },
  { label: "Indeed", url: "https://www.indeed.com", icon: "🔎" },
  { label: "Internshala", url: "https://internshala.com", icon: "🎓" },
  { label: "Glassdoor", url: "https://www.glassdoor.com", icon: "⭐" },
  { label: "Wellfound", url: "https://wellfound.com/jobs", icon: "🚀" },
  { label: "Monster", url: "https://www.monsterindia.com", icon: "👾" },
  { label: "Shine", url: "https://www.shine.com", icon: "✨" },
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

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-background px-6 py-12 select-none">

      {/* Branding */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xl font-semibold text-foreground">Job Search</span>
      </div>
      <p className="text-xs text-muted-foreground mb-8">Find your next opportunity</p>

      {/* Search bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search jobs, companies, or enter a URL..."
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
        <p className="text-xs text-muted-foreground mb-3 text-center">Top Job Sites</p>
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
    </div>
  );
}
