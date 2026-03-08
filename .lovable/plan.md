
## Comet Browser Clone — Full Plan

### What we're building
A pixel-faithful web app clone of Perplexity's Comet browser with real-time AI powered by the Perplexity API. Since this runs in a browser (not as a native app), we simulate the browser shell around an iframe web viewer, with a live Perplexity AI sidebar.

---

### Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│  TAB BAR  [+ New Tab]  [Tab 1] [Tab 2] [Tab 3]         [×]     │
├──────────────────────────────────────────────────────────────────┤
│  ← → ↻  [🔒 https://example.com ...]         [⚡ Comet]  [☰]  │  ← Address Bar
├─────────────────────────────────┬────────────────────────────────┤
│                                 │  AI SIDEBAR                    │
│                                 │  ┌──────────────────────────┐  │
│   WEB FRAME (iframe)            │  │  Perplexity Search       │  │
│                                 │  │  [Ask anything...]       │  │
│   Loads real websites           │  │                          │  │
│                                 │  │  ● Streaming response    │  │
│   CORS note: many major         │  │    with citations...     │  │
│   sites block iframes,          │  │                          │  │
│   so fallback page shown        │  │  Sources:                │  │
│   with Firecrawl content        │  │  [1] source.com          │  │
│                                 │  │  [2] source2.com         │  │
│                                 │  └──────────────────────────┘  │
│                                 │  [Analyze This Page]           │
│                                 │  [Summarize] [Research More]   │
└─────────────────────────────────┴────────────────────────────────┘
```

---

### Key Features to Build

**1. Browser Chrome UI**
- Tab bar with add/close/switch tabs
- Address bar with back/forward/refresh navigation
- Lock icon, loading spinner
- Comet branding (dark theme, teal/cyan accent — matching Perplexity's style)

**2. Web Frame**
- iframe that attempts to load any URL
- Graceful fallback when iframe is blocked (X-Frame-Options) — shows Firecrawl-scraped content instead
- URL normalizer (adds https:// if missing)
- New tab page with quick links + search bar

**3. AI Sidebar (Perplexity-powered)**
- Collapsible right panel (toggles with "Comet" button)
- Real-time streaming responses from Perplexity `sonar-pro` model
- Citations displayed as numbered source cards
- "Analyze This Page" — scrapes current page via Firecrawl and sends to Perplexity
- Quick action chips: Summarize, Research More, Explain Simply
- Chat history per tab

**4. New Tab Page**
- Comet-style home screen
- Search bar (queries Perplexity directly)
- Quick navigation cards (top sites)
- Daily briefing via Perplexity

**5. Command Palette**
- `Cmd+K` / search icon trigger
- Type commands like "summarize page", "find hotels...", "explain selection"

---

### Files to Create/Modify

**Frontend components:**
- `src/pages/Index.tsx` — Main browser layout
- `src/pages/NewTab.tsx` — New tab home page
- `src/components/browser/TabBar.tsx` — Tabs management
- `src/components/browser/AddressBar.tsx` — URL input + nav buttons
- `src/components/browser/WebFrame.tsx` — iframe + fallback renderer
- `src/components/browser/AISidebar.tsx` — Perplexity chat panel
- `src/components/browser/SearchResult.tsx` — Citation card
- `src/components/browser/CommandPalette.tsx` — Cmd+K overlay
- `src/components/browser/NewTabPage.tsx` — Home screen
- `src/hooks/useTabs.ts` — Tab state management
- `src/hooks/usePerplexity.ts` — Streaming search hook
- `src/lib/perplexity.ts` — API helper

**Backend (Lovable Cloud edge functions):**
- `supabase/functions/perplexity-chat/index.ts` — Streaming Perplexity search
- `supabase/functions/perplexity-analyze/index.ts` — Page analysis (takes scraped text)
- `supabase/functions/firecrawl-scrape/index.ts` — Scrape page for AI context

**Styling:**
- Dark theme matching Comet: deep navy/charcoal background, teal/cyan accent, clean sans-serif
- Update `src/index.css` with Comet color palette

---

### Design System (Comet-inspired)
- Background: `#0a0b0f` (near black)
- Surface: `#13141a` (dark cards)
- Border: `#1e2028`
- Accent: `#20d4aa` (teal — Perplexity brand)
- Text primary: `#f0f1f5`
- Text muted: `#6b7280`

---

### Connectors Required
1. **Perplexity** — for real-time AI search + page analysis streaming
2. **Firecrawl** — for scraping page content when iframe is blocked

Both will be connected via Lovable Cloud connectors (setup prompts during implementation).

---

### Technical Notes
- CORS limitation: Many popular sites (Google, Twitter, etc.) block iframes. We handle this gracefully with a "This site can't be displayed in frame" UI + offer to open in new tab + still let AI analyze via Firecrawl scraping.
- Streaming: Perplexity responses stream token-by-token via SSE through the edge function.
- Tab state: Kept in React context with per-tab URL, title, history stack, and AI conversation history.
- The address bar doubles as an AI query bar — if input doesn't look like a URL, it goes to Perplexity search instead.
