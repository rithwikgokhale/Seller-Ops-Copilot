import { z } from "zod";

const Trend = z.enum(["up", "down", "flat"]);
const Confidence = z.enum(["low", "med", "high"]);
const SourceType = z.enum(["table", "context", "rule"]);

export const MetricCardSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  unit: z.string().trim().min(1).optional(),
  trend: Trend.optional(),
  delta: z.string().trim().min(1).optional(),
  note: z.string().trim().min(1).optional(),
});

export const ActionCardSchema = z.object({
  title: z.string().trim().min(1),
  rationale: z.string().trim().min(1),
  expected_impact: z.string().trim().min(1),
  confidence: Confidence,
  assumptions: z
    .array(z.string().trim().min(1))
    .max(8)
    .default([]),
});

export const SourceSchema = z.object({
  type: SourceType,
  detail: z.string().trim().min(1),
});

export const OutputSchema = z.object({
  answer_markdown: z.string().trim().min(1).max(2500),
  metrics: z.array(MetricCardSchema).max(6).default([]),
  actions: z.array(ActionCardSchema).max(3).default([]),
  sources: z.array(SourceSchema).min(1),
  warnings: z
    .array(z.string().trim().min(1))
    .max(10)
    .default([]),
  followups: z
    .array(z.string().trim().min(1))
    .max(3)
    .default([]),
});

export type CopilotOutput = z.infer<typeof OutputSchema>;
export type MetricCard = z.infer<typeof MetricCardSchema>;
export type ActionCard = z.infer<typeof ActionCardSchema>;
export type Source = z.infer<typeof SourceSchema>;
