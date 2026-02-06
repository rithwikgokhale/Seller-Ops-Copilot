import { useState, useCallback, useEffect } from "react";
import type { SavedInsight, CopilotOutput } from "../types";

const STORAGE_KEY = "seller-ops-copilot-saved";

function load(): SavedInsight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(insights: SavedInsight[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(insights));
}

export function useSavedInsights() {
  const [insights, setInsights] = useState<SavedInsight[]>(load);

  // Keep in sync if another tab modifies storage
  useEffect(() => {
    const handler = () => setInsights(load());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const save = useCallback(
    (
      question: string,
      result: CopilotOutput,
      neighborhoodEnabled: boolean
    ) => {
      const next: SavedInsight = {
        id: crypto.randomUUID(),
        question,
        result,
        neighborhoodEnabled,
        savedAt: Date.now(),
      };
      const updated = [next, ...insights];
      setInsights(updated);
      persist(updated);
    },
    [insights]
  );

  const remove = useCallback(
    (id: string) => {
      const updated = insights.filter((i) => i.id !== id);
      setInsights(updated);
      persist(updated);
    },
    [insights]
  );

  return { insights, save, remove };
}
