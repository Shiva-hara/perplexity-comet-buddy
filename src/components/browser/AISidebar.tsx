import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, X, Zap, Globe, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { usePerplexity, PerplexityMessage } from "@/hooks/usePerplexity";
import { SearchResult } from "./SearchResult";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface AISidebarProps {
  currentUrl: string;
  messages: PerplexityMessage[];
  onMessagesChange: (messages: PerplexityMessage[]) => void;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: "Summarize page", prompt: "Summarize the content of the current page" },
  { label: "Key points", prompt: "What are the key points on this page?" },
  { label: "Research more", prompt: "What else should I know about the topics on this page?" },
  { label: "Explain simply", prompt: "Explain the main topic of this page in simple terms" },
];

export function AISidebar({ currentUrl, messages, onMessagesChange, onClose }: AISidebarProps) {
  const [input, setInput] = useState("");
  const [showCitations, setShowCitations] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { search, isLoading, error, cancel } = usePerplexity();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const query = text.trim();
    setInput("");

    const userMsg: PerplexityMessage = { role: "user", content: query };
    const assistantMsg: PerplexityMessage = { role: "assistant", content: "", isStreaming: true };
    const newMessages = [...messages, userMsg, assistantMsg];
    onMessagesChange(newMessages);

    let accumulated = "";
    let finalCitations: string[] = [];

    await search(
      query,
      messages,
      (delta) => {
        accumulated += delta;
        onMessagesChange([
          ...newMessages.slice(0, -1),
          { role: "assistant", content: accumulated, isStreaming: true, citations: finalCitations },
        ]);
      },
      (citations) => {
        finalCitations = citations;
      },
      () => {
        onMessagesChange([
          ...newMessages.slice(0, -1),
          { role: "assistant", content: accumulated, isStreaming: false, citations: finalCitations },
        ]);
      },
      currentUrl ? `The user is currently browsing: ${currentUrl}` : undefined
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => onMessagesChange([]);

  return (
    <div className="flex flex-col h-full w-[340px] bg-card border-l border-border animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-chrome shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Comet AI</span>
          <span className="text-[10px] text-muted-foreground bg-surface px-1.5 py-0.5 rounded border border-border">
            sonar-pro
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-surface transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current page context pill */}
      {currentUrl && (
        <div className="flex items-center gap-1.5 mx-3 mt-2 px-2.5 py-1.5 bg-surface rounded-lg border border-border">
          <Globe className="w-3 h-3 text-primary shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate">
            {(() => { try { return new URL(currentUrl).hostname; } catch { return currentUrl; } })()}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary fill-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Ask Comet anything</p>
            <p className="text-xs text-muted-foreground">
              Real-time answers with sources, powered by Perplexity
            </p>

            {/* Quick actions */}
            <div className="mt-6 w-full space-y-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-surface transition-all"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("space-y-2", msg.role === "user" ? "flex justify-end" : "")}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs text-foreground">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-foreground/90 leading-relaxed prose-comet">
                    {msg.isStreaming && !msg.content ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <div className="text-xs leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_code]:bg-surface [&_code]:px-1 [&_code]:rounded [&_ul]:ml-4 [&_ol]:ml-4">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-primary animate-pulse-teal rounded-sm" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && !msg.isStreaming && (
                    <div className="space-y-1">
                      <button
                        onClick={() => setShowCitations((prev) => ({ ...prev, [i]: !prev[i] }))}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCitations[i] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {msg.citations.length} source{msg.citations.length !== 1 ? "s" : ""}
                      </button>
                      {showCitations[i] && (
                        <div className="space-y-0.5 mt-1">
                          {msg.citations.map((url, j) => (
                            <SearchResult key={j} index={j + 1} url={url} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {error && (
          <div className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive/90">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions (when has messages) */}
      {messages.length > 0 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none border-t border-border shrink-0">
          {QUICK_ACTIONS.slice(0, 3).map((action) => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
              className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:border-primary/30 hover:bg-surface transition-all whitespace-nowrap"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-border shrink-0">
        <div className="flex items-end gap-2 bg-surface border border-border rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none resize-none max-h-24 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={() => isLoading ? cancel() : sendMessage(input)}
            disabled={!isLoading && !input.trim()}
            className={cn(
              "shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all",
              isLoading
                ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                : input.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-surface text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <X className="w-3 h-3" />
            ) : (
              <Send className="w-3 h-3" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 text-center">
          Powered by Perplexity · ⏎ to send · Shift+⏎ for newline
        </p>
      </div>
    </div>
  );
}
