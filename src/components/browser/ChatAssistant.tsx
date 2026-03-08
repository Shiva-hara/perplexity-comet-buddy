import { useState, useRef, useEffect, KeyboardEvent, useCallback } from "react";
import { Send, X, Bot, Loader2, Trash2, Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface ChatAssistantProps {
  onClose: () => void;
  currentUrl?: string;
  onNavigate?: (url: string) => void;
}

const QUICK_PROMPTS = [
  "Open LinkedIn and search React jobs",
  "Analyze this job posting",
  "Fill my profile on Naukri",
  "Find remote jobs for freshers",
];

export function ChatAssistant({ onClose, currentUrl, onNavigate }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract URL from Step 1 navigation instruction
  const extractNavUrl = (text: string): string | null => {
    const step1Match = text.match(/[Ss]tep\s*1[^:]*[:：][^\n]*(?:navigate|open|go to)[^\n]*(https?:\/\/[^\s\n,)]+)/i);
    if (step1Match) return step1Match[1].replace(/[.,)]+$/, "");
    // Fallback: any https URL in the first line
    const firstLine = text.split("\n")[0];
    const urlMatch = firstLine.match(/https?:\/\/[^\s\n,)]+/);
    return urlMatch ? urlMatch[0].replace(/[.,)]+$/, "") : null;
  };

  // Execute steps sequentially with delays like a human
  const executeSteps = async (response: string) => {
    if (!onNavigate) return;
    const navUrl = extractNavUrl(response);
    if (navUrl) {
      // Simulate reading Step 1 then navigating (1.2s delay feels natural)
      await new Promise((r) => setTimeout(r, 1200));
      onNavigate(navUrl);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const query = text.trim();
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: query };
    const assistantMsg: ChatMessage = { role: "assistant", content: "", isStreaming: true };
    const newMessages = [...messages, userMsg, assistantMsg];
    setMessages(newMessages);
    setIsLoading(true);

    abortRef.current = new AbortController();

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const contextualQuery = currentUrl
        ? `[Browsing: ${currentUrl}] ${query}`
        : query;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/job-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              ...history,
              { role: "user", content: contextualQuery },
            ],
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newline: number;
        while ((newline = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              accumulated += delta;
              setMessages([
                ...newMessages.slice(0, -1),
                { role: "assistant", content: accumulated, isStreaming: true },
              ]);
            }
          } catch { /* partial chunk */ }
        }
      }

      setMessages([
        ...newMessages.slice(0, -1),
        { role: "assistant", content: accumulated, isStreaming: false },
      ]);

      // Execute browser actions after response is complete
      executeSteps(accumulated);
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") return;
      setMessages([
        ...newMessages.slice(0, -1),
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          isStreaming: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full w-[320px] bg-card border-l border-border animate-slide-in-right shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-chrome shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Comet</span>
          <span className="text-[10px] text-muted-foreground bg-surface px-1.5 py-0.5 rounded border border-border">
            Agent
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Comet — Autonomous Browser Agent</p>
            <p className="text-xs text-muted-foreground mb-6">
              Give me any task and I'll execute it step-by-step like a human
            </p>
            <div className="w-full space-y-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-surface transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("space-y-1", msg.role === "user" ? "flex justify-end" : "")}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs text-foreground">
                  {msg.content}
                </div>
              ) : (
                <div className="text-xs text-foreground/90 leading-relaxed">
                  {msg.isStreaming && !msg.content ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className="[&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_code]:bg-surface [&_code]:px-1 [&_code]:rounded [&_ul]:ml-4 [&_ol]:ml-4 [&_li]:mb-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-primary animate-pulse rounded-sm" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts when chatting */}
      {messages.length > 0 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none border-t border-border shrink-0">
          {QUICK_PROMPTS.slice(0, 3).map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={isLoading}
              className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:border-primary/30 hover:bg-surface transition-all whitespace-nowrap disabled:opacity-40"
            >
              {p}
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
            placeholder="Give Comet a task to execute..."
            rows={1}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none resize-none max-h-24 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={() => {
              if (isLoading) {
                abortRef.current?.abort();
                setIsLoading(false);
              } else {
                sendMessage(input);
              }
            }}
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
            {isLoading ? <X className="w-3 h-3" /> : <Send className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 text-center">
          ⏎ to send · Shift+⏎ newline
        </p>
      </div>
    </div>
  );
}
