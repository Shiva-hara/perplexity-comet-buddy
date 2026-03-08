import { ExternalLink } from "lucide-react";

interface SearchResultProps {
  index: number;
  url: string;
}

export function SearchResult({ index, url }: SearchResultProps) {
  let hostname = url;
  let pathname = "";
  try {
    const u = new URL(url);
    hostname = u.hostname.replace("www.", "");
    pathname = u.pathname !== "/" ? u.pathname.slice(1, 30) : "";
  } catch { /* */ }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 group py-1.5 px-2 -mx-2 rounded-lg hover:bg-surface transition-colors"
    >
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-mono text-primary">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-foreground/80 font-medium truncate group-hover:text-primary transition-colors">
          {hostname}
        </div>
        {pathname && (
          <div className="text-[10px] text-muted-foreground truncate">{pathname}</div>
        )}
      </div>
      <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60 shrink-0 transition-colors" />
    </a>
  );
}
