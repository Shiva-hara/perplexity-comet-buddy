import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Search, Briefcase, Mic, MicOff } from "lucide-react";
import { normalizeUrl } from "@/hooks/useTabs";
import { cn } from "@/lib/utils";

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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const latestQueryRef = useRef("");

  // Keep ref in sync so onend closure can read latest value
  const updateQuery = (val: string) => {
    setQuery(val);
    latestQueryRef.current = val;
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    onNavigate(normalizeUrl(query));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const stopMic = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleMic = useCallback(() => {
    // Stop if already running
    if (isListening) {
      stopMic();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search requires Chrome or Edge browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";        // Indian English
    recognition.interimResults = true; // Show words as you speak
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      const text = final || interim;
      updateQuery(text);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      const captured = latestQueryRef.current.trim();
      if (captured) {
        setTimeout(() => onNavigate(normalizeUrl(captured)), 200);
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start mic:", err);
      setIsListening(false);
    }
  }, [isListening, stopMic, onNavigate]);

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
        <div className="flex items-stretch gap-2 h-12">
          {/* Search input */}
          <div className={cn(
            "relative flex flex-1 items-center border rounded-xl bg-surface transition-all",
            isListening
              ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]"
              : "border-border focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
          )}>
            <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "🎙 Listening..." : "Search jobs, companies, or enter a URL..."}
              autoFocus
              className="w-full h-full pl-10 pr-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
          </div>

          {/* Mic button */}
          <button
            onClick={toggleMic}
            title={isListening ? "Stop listening" : "Search by voice"}
            className={cn(
              "flex-shrink-0 w-12 flex items-center justify-center rounded-xl border transition-all",
              isListening
                ? "bg-primary border-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.5)] animate-pulse"
                : "bg-surface border-border text-muted-foreground hover:text-primary hover:border-primary/50"
            )}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="flex-shrink-0 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </div>

        {isListening && (
          <p className="text-center text-xs text-primary mt-2 animate-pulse">
            🎙 Speak now — auto-searches when you stop
          </p>
        )}
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
