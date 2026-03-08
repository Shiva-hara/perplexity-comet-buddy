import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Lock, Globe, X, Bot, Briefcase, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  sidebarOpen: boolean;
  trackerOpen: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  onToggleTracker: () => void;
}

export function AddressBar({
  url,
  isLoading,
  canGoBack,
  canGoForward,
  sidebarOpen,
  trackerOpen,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onToggleSidebar,
  onToggleTracker,
}: AddressBarProps) {
  const [inputValue, setInputValue] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) setInputValue(url);
  }, [url, isFocused]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
      onNavigate(inputValue);
    }
    if (e.key === "Escape") {
      setInputValue(url);
      inputRef.current?.blur();
    }
  };

  const isSecure = url.startsWith("https://");
  const isEmpty = !url;

  return (
    <div className="flex items-center gap-1 h-11 px-3 bg-chrome border-b border-border">
      {/* Nav controls */}
      <div className="flex items-center gap-0.5">
        <NavButton onClick={onBack} disabled={!canGoBack} title="Go back">
          <ChevronLeft className="w-4 h-4" />
        </NavButton>
        <NavButton onClick={onForward} disabled={!canGoForward} title="Go forward">
          <ChevronRight className="w-4 h-4" />
        </NavButton>
        <NavButton onClick={onRefresh} disabled={isEmpty} title="Refresh">
          <RotateCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-primary")} />
        </NavButton>
      </div>

      {/* Address bar */}
      <div
        className={cn(
          "flex items-center gap-2 flex-1 h-7 px-3 rounded-lg bg-surface border transition-all duration-150",
          isFocused ? "border-primary/50 shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]" : "border-border"
        )}
      >
        <div className="shrink-0 text-muted-foreground">
          {isEmpty ? (
            <Globe className="w-3 h-3" />
          ) : isSecure ? (
            <Lock className="w-3 h-3 text-primary/70" />
          ) : (
            <Globe className="w-3 h-3 text-[hsl(40_80%_55%/0.7)]" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={isFocused ? inputValue : formatDisplayUrl(url)}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setInputValue(url);
            setTimeout(() => inputRef.current?.select(), 0);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter URL..."
          className={cn(
            "flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50",
            !isFocused && "text-muted-foreground"
          )}
          spellCheck={false}
          autoComplete="off"
        />

        {isFocused && inputValue && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setInputValue("");
            }}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Job Tracker toggle */}
      <button
        onClick={onToggleTracker}
        title="Job Pipeline Tracker"
        className={cn(
          "flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all duration-150 shrink-0",
          trackerOpen
            ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
            : "bg-surface border border-border text-muted-foreground hover:text-primary hover:border-primary/50"
        )}
      >
        <Briefcase className="w-3.5 h-3.5" />
        <span>Jobs</span>
      </button>

      {/* Chat Assistant toggle */}
      <button
        onClick={onToggleSidebar}
        title="AI Job Assistant"
        className={cn(
          "flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all duration-150 shrink-0",
          sidebarOpen
            ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
            : "bg-surface border border-border text-muted-foreground hover:text-primary hover:border-primary/50"
        )}
      >
        <Bot className="w-3.5 h-3.5" />
        <span>Assistant</span>
      </button>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-7 h-7 rounded flex items-center justify-center transition-colors",
        disabled
          ? "text-muted-foreground/30 cursor-not-allowed"
          : "text-muted-foreground hover:text-foreground hover:bg-surface"
      )}
    >
      {children}
    </button>
  );
}

function formatDisplayUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
}
