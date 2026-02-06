/** Mirrors the server's OutputSchema – kept in sync manually for MVP. */

export type Trend = "up" | "down" | "flat";
export type Confidence = "low" | "med" | "high";
export type SourceType = "table" | "context" | "rule";

export interface MetricCard {
  label: string;
  value: string;
  unit?: string;
  trend?: Trend;
  delta?: string;
  note?: string;
}

export interface ActionCard {
  title: string;
  rationale: string;
  expected_impact: string;
  confidence: Confidence;
  assumptions: string[];
}

export interface Source {
  type: SourceType;
  detail: string;
}

export interface CopilotOutput {
  answer_markdown: string;
  metrics: MetricCard[];
  actions: ActionCard[];
  sources: Source[];
  warnings: string[];
  followups: string[];
}

/** A single Q&A turn in the chat history. */
export interface ChatTurn {
  id: string;
  question: string;
  result: CopilotOutput | null;
  loading: boolean;
  error: string | null;
  neighborhoodEnabled: boolean;
  timestamp: number;
}

/** A saved insight stored in localStorage. */
export interface SavedInsight {
  id: string;
  question: string;
  result: CopilotOutput;
  neighborhoodEnabled: boolean;
  savedAt: number;
}
