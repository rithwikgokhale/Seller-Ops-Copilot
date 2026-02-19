# Neighborhood-Aware Seller Ops Copilot

An AI-powered insights and recommendations app for small-business sellers.
Ask questions in plain English, get data-verified answers with actionable recommendations — never hallucinated numbers.

Built as a work-sample for Block/Square's AI-native APM program.

> **[Live Documentation Site](https://rithwikgokhale.github.io/Seller-Ops-Copilot/)** — full technical deep-dive, business case, and roadmap.

---

## Quickstart

**Prerequisites:** Node.js ≥ 18, an OpenAI API key with GPT-4o access.

```bash
git clone https://github.com/rithwikgokhale/Seller-Ops-Copilot.git
cd Seller-Ops-Copilot
npm install                  # installs root + server + client
cp .env.example .env         # add your OPENAI_API_KEY
npm run dev                  # Express :3001 + Vite :5173
```

Open **http://localhost:5173** and ask your first question.

---

## What It Does

A seller (e.g., a coffee-shop owner) can:

1. **Ask natural-language questions** about sales, inventory, staffing, or business performance.
2. **Get structured, data-grounded answers:**
   - Plain-English summary
   - Key metric cards (revenue, order count, AOV, etc.)
   - 1–3 actionable recommendations with confidence levels and assumptions
3. **Toggle Neighborhood Context** to incorporate weather, local events, and review sentiment.
4. **Save insights** for later reference on a dedicated Saved page.

---

## Architecture

```
┌─────────────────────────┐
│     React + Vite UI     │  Port 5173
│  Chat, Metric & Action  │  Tailwind CSS
│  cards, Save & Review   │
└───────────┬─────────────┘
            │  POST /api/chat
            │  { message, neighborhoodContextEnabled }
            ▼
┌─────────────────────────┐
│   Express API Server    │  Port 3001
│                         │
│  ┌───────────────────┐  │
│  │   LLM Agent Loop  │  │  GPT-4o · tool_choice: auto
│  │   System Prompt +  │  │  Max 8 rounds · Temp 0.2
│  │   Zod Validation   │  │
│  └────────┬──────────┘  │
│           │              │
│  ┌────────▼──────────┐  │
│  │  Tool Exec Layer  │  │  6 typed functions
│  │  (deterministic)  │  │  ├─ 5 internal data tools
│  └────────┬──────────┘  │  └─ 1 neighborhood tool (gated)
│           │              │
│  ┌────────▼──────────┐  │
│  │   Stub Data       │  │  30 days of deterministic
│  │   (JSON files)    │  │  coffee-shop data
│  └───────────────────┘  │
└─────────────────────────┘
```

**Data flow:** User question → LLM decides which tools to call → tools compute metrics from real data → LLM synthesizes a structured JSON response → Zod validates → UI renders.

---

## AI Guardrails

Every design choice reinforces data integrity. The model is a reasoning layer, not a data source.

| Guardrail | How It Works |
|-----------|--------------|
| **Tool-calling, not generation** | The model calls typed functions (`getSalesSummary`, `getTopItems`, etc.) rather than generating numbers. Every figure traces to a tool output. |
| **Zod schema validation** | The final JSON response is parsed and validated at runtime against a strict Zod schema. Malformed output throws immediately — never reaches the UI. |
| **Source citation** | The schema requires `sources.min(1)`. Every tool called must appear in the sources array with its parameters. |
| **Gated neighborhood context** | When the toggle is off, `getNeighborhoodContext` is physically removed from the tool list. The model can't call what it can't see. |
| **Low temperature (0.2)** | Reduces creative drift while allowing natural synthesis of tool results. |
| **Max 8 tool rounds** | Circuit breaker prevents infinite loops if the model keeps requesting tools. Most queries resolve in 1–2 rounds. |
| **Markdown fence stripping** | Defensive parser strips code fences even when the model is told to output raw JSON. |
| **Explicit confidence levels** | Every recommendation carries `high`, `med`, or `low` confidence plus an `assumptions` array — the seller knows what the copilot is certain about and what it's guessing. |

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS | Fast iteration, type safety, modern DX |
| Backend | Express, TypeScript, tsx | Minimal footprint, easy to extend |
| AI | OpenAI GPT-4o (function calling) | Best-in-class tool use and structured output |
| Validation | Zod | Runtime schema enforcement on LLM output |
| Data | Stubbed JSON + deterministic seed | Offline-first, reproducible demos |

---

## Available Tools

Implemented in `server/src/tools.ts`:

| Tool | Description |
|------|-------------|
| `getSalesSummary(start, end)` | Revenue, orders, AOV for a date range |
| `getHourlySales(start, end)` | Hourly breakdown with peak identification |
| `getTopItems(start, end, limit, sortBy)` | Top items by revenue or quantity |
| `getInventoryStatus()` | Current stock levels and low-stock alerts |
| `getStaffingSignals(start, end)` | Staff coverage vs. peak traffic analysis |
| `getNeighborhoodContext(start, end)` | Weather, events, review sentiment (gated) |

---

## Demo Script

Try these questions to exercise all capabilities:

| # | Question | What It Shows |
|---|----------|---------------|
| 1 | "How were my sales this past week?" | Revenue, order count, AOV metrics + trend recommendations |
| 2 | "What are my top 5 best-selling items by revenue?" | Ranked item list with quantities and revenue |
| 3 | "Do I have any inventory issues?" | Low-stock alerts, days-until-stockout, reorder suggestions |
| 4 | "Am I properly staffed during peak hours?" | Under/overstaffing analysis, orders-per-staff at peaks |
| 5 | *(toggle Neighborhood Context on)* "How might weather and events affect my business?" | Weather-adjusted demand, event traffic, review sentiment |
| 6 | Click **Save Insight** on any result | Persists to Saved tab via localStorage |

---

## Project Structure

```
├── package.json                # Root scripts (dev, seed, install)
├── .env.example                # Environment template
├── docs/                       # GitHub Pages documentation site
├── server/
│   ├── src/
│   │   ├── index.ts            # Express entry point
│   │   ├── agent.ts            # LLM agent loop (tool calling)
│   │   ├── tools.ts            # Tool implementations
│   │   ├── toolDefs.ts         # OpenAI function definitions
│   │   ├── systemPrompt.ts     # System prompt
│   │   ├── outputSchema.ts     # Zod output schema + types
│   │   └── data/               # Stub JSON + seed script
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.tsx             # Router + layout
│   │   ├── pages/              # ChatPage, SavedPage
│   │   ├── components/         # UI components
│   │   ├── hooks/              # useSavedInsights
│   │   ├── api.ts              # API client
│   │   └── types.ts            # Shared TypeScript types
│   └── package.json
└── README.md
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Tool-calling over raw SQL** | Model calls typed tools instead of writing SQL. Every number is traceable — eliminates hallucination. |
| **Zod output schema** | LLM output is parsed and validated against a strict schema. Invalid responses throw immediately. |
| **Stubbed JSON data** | Runs fully offline for demos. Deterministic seed script (`seed.cjs`) produces identical data every run. |
| **Neighborhood context as a toggle** | Cleanly separates internal analytics from external signals. Tool is removed from the tool list when off. |

---

## Non-Goals (MVP)

- Real database / real Square API integration
- Multi-turn conversation memory (each question is independent)
- User authentication
- Production deployment

These are deliberate scope decisions. The architecture supports all of them — see the [roadmap on the docs site](https://rithwikgokhale.github.io/Seller-Ops-Copilot/#roadmap).

---

## Roadmap

- [ ] Real Square API integration behind a feature flag
- [ ] Evaluation harness: golden-answer test suite for tool-calling accuracy
- [ ] Streaming responses (SSE) for perceived latency improvement
- [ ] Multi-turn conversation with context window management
- [ ] Export insights as PDF/email
- [ ] Real neighborhood APIs (OpenWeather, Yelp Fusion, PredictHQ)

---

## License

MIT
