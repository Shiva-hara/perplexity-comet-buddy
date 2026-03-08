import { useEffect, useRef, useState, useCallback } from "react";
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { NewTabPage } from "./NewTabPage";

interface WebFrameProps {
  url: string;
  onTitleChange: (title: string) => void;
  onLoadingChange: (loading: boolean) => void;
  onNavigate: (url: string) => void;
}

export function WebFrame({ url, onTitleChange, onLoadingChange, onNavigate }: WebFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const isNewTab = !url;

  const handleLoad = useCallback(() => {
    clearTimeout(loadTimerRef.current);
    setBlocked(false);
    setLoadError(false);
    onLoadingChange(false);
    try {
      const title = iframeRef.current?.contentDocument?.title;
      if (title) onTitleChange(title);
      else {
        const hostname = new URL(url).hostname.replace("www.", "");
        onTitleChange(hostname);
      }
    } catch {
      try {
        const hostname = new URL(url).hostname.replace("www.", "");
        onTitleChange(hostname);
      } catch {
        onTitleChange(url);
      }
    }
  }, [url, onLoadingChange, onTitleChange]);

  const handleError = useCallback(() => {
    clearTimeout(loadTimerRef.current);
    setLoadError(true);
    onLoadingChange(false);
    onTitleChange("Error");
  }, [onLoadingChange, onTitleChange]);

  useEffect(() => {
    if (!url) {
      onLoadingChange(false);
      onTitleChange("New Tab");
      setBlocked(false);
      setLoadError(false);
      return;
    }

    setBlocked(false);
    setLoadError(false);
    onLoadingChange(true);

    // Detect blocked iframes via a timing heuristic
    // If the iframe doesn't load within 8s and shows no content, it's likely blocked
    loadTimerRef.current = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        // If we can't access document at all, it loaded cross-origin (may be fine)
        // If we get an empty document, it's likely blocked
        if (doc && doc.body && doc.body.innerHTML === "") {
          setBlocked(true);
          onLoadingChange(false);
          try {
            const hostname = new URL(url).hostname.replace("www.", "");
            onTitleChange(hostname + " (blocked)");
          } catch { onTitleChange("Blocked"); }
        }
      } catch {
        // Cross-origin, likely loaded fine
        onLoadingChange(false);
      }
    }, 5000);

    return () => clearTimeout(loadTimerRef.current);
  }, [url]);

  if (isNewTab) {
    return (
      <div className="flex-1 overflow-auto">
        <NewTabPage onNavigate={onNavigate} />
      </div>
    );
  }

  if (blocked || loadError) {
    return (
      <BlockedPage
        url={url}
        reason={loadError ? "error" : "blocked"}
        onOpenExternal={() => window.open(url, "_blank")}
        onRetry={() => { setBlocked(false); setLoadError(false); onNavigate(url); }}
      />
    );
  }

  return (
    <div className="flex-1 relative">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-none bg-white"
        onLoad={handleLoad}
        onError={handleError}
        title="Browser frame"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function BlockedPage({
  url,
  reason,
  onOpenExternal,
  onRetry,
}: {
  url: string;
  reason: "blocked" | "error";
  onOpenExternal: () => void;
  onRetry: () => void;
}) {
  let hostname = url;
  try { hostname = new URL(url).hostname; } catch { /* */ }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-2">
        {reason === "blocked" ? `${hostname} can't be displayed here` : "Failed to load"}
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {reason === "blocked"
          ? "This site has security policies that prevent it from loading inside another page. You can still open it in a new window or ask the AI to research it."
          : "The page couldn't be loaded. Check your connection or try again."}
      </p>

      <div className="flex gap-3">
        <button
          onClick={onOpenExternal}
          className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in new window
        </button>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 h-9 px-4 bg-surface border border-border text-foreground rounded-lg text-sm font-medium hover:bg-surface/80 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    </div>
  );
}
