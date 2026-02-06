import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatTurn } from "../types";
import { askCopilot } from "../api";
import ChatInput from "../components/ChatInput";
import InsightResult from "../components/InsightResult";
import NeighborhoodToggle from "../components/NeighborhoodToggle";
import { useSavedInsights } from "../hooks/useSavedInsights";

const EXAMPLE_QUESTIONS = [
  "How were sales this week?",
  "What are my top-selling items?",
  "Do I have any inventory issues?",
  "Am I staffed properly for peak hours?",
  "How is foot traffic affected by nearby events?",
];

export default function ChatPage() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [neighborhoodEnabled, setNeighborhoodEnabled] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { save } = useSavedInsights();

  const isLoading = turns.some((t) => t.loading);

  // Auto-scroll to bottom when new turns appear
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  const handleSend = useCallback(
    async (question: string) => {
      const id = crypto.randomUUID();
      const turn: ChatTurn = {
        id,
        question,
        result: null,
        loading: true,
        error: null,
        neighborhoodEnabled,
        timestamp: Date.now(),
      };

      setTurns((prev) => [...prev, turn]);

      try {
        const result = await askCopilot(question, neighborhoodEnabled);
        setTurns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, result, loading: false } : t))
        );
      } catch (err: any) {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, error: err.message, loading: false }
              : t
          )
        );
      }
    },
    [neighborhoodEnabled]
  );

  const handleSave = useCallback(
    (turnId: string) => {
      const turn = turns.find((t) => t.id === turnId);
      if (turn?.result) {
        save(turn.question, turn.result, turn.neighborhoodEnabled);
        setSavedIds((prev) => new Set(prev).add(turnId));
      }
    },
    [turns, save]
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar: toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <NeighborhoodToggle
          enabled={neighborhoodEnabled}
          onChange={setNeighborhoodEnabled}
        />
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 chat-scroll"
      >
        {turns.length === 0 && (
          <EmptyState onSelect={handleSend} />
        )}

        {turns.map((turn) => (
          <div key={turn.id} className="space-y-3">
            {/* User question */}
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-2xl rounded-tr-md max-w-md">
                {turn.question}
              </div>
            </div>

            {/* Assistant response */}
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 shadow-sm">
              {turn.loading && <LoadingDots />}
              {turn.error && (
                <div className="text-sm text-rose-600">
                  <span className="font-medium">Error:</span> {turn.error}
                </div>
              )}
              {turn.result && (
                <InsightResult
                  result={turn.result}
                  onFollowup={handleSend}
                  onSave={() => handleSave(turn.id)}
                  saved={savedIds.has(turn.id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function EmptyState({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-16">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Seller Ops Copilot
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-md">
          Ask anything about your sales, inventory, staffing, or neighborhood
          context. Powered by AI with tool-verified data.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}
