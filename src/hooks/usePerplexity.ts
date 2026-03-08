import { useState, useCallback, useRef } from "react";

export interface Citation {
  url: string;
  title?: string;
}

export interface PerplexityMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  isStreaming?: boolean;
}

export function usePerplexity() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (
      query: string,
      history: PerplexityMessage[],
      onDelta: (text: string) => void,
      onCitations: (citations: string[]) => void,
      onDone: () => void,
      pageContext?: string
    ) => {
      setIsLoading(true);
      setError(null);
      abortRef.current = new AbortController();

      try {
        const messages: Array<{ role: "user" | "assistant"; content: string }> = history.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        if (pageContext) {
          // prepend context as first user message (no system role in this typed array)
          messages.unshift({
            role: "user" as const,
            content: `[Context: ${pageContext}] Now answer: ${messages[0]?.content ?? ""}`,
          });
        }
        messages.push({ role: "user", content: query });

        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/perplexity-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages }),
          signal: abortRef.current.signal,
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed: ${resp.status}`);
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") { streamDone = true; break; }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) onDelta(content);
              // citations come in the final chunk
              if (parsed.citations) onCitations(parsed.citations);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        onDone();
      } catch (e: unknown) {
        if ((e as Error).name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        onDone();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { search, cancel, isLoading, error };
}
