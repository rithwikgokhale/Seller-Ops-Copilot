import Markdown from "react-markdown";
import type { CopilotOutput } from "../types";
import MetricCard from "./MetricCard";
import ActionCard from "./ActionCard";
import SourceTag from "./SourceTag";

interface Props {
  result: CopilotOutput;
  onFollowup?: (question: string) => void;
  onSave?: () => void;
  saved?: boolean;
}

export default function InsightResult({
  result,
  onFollowup,
  onSave,
  saved,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Answer */}
      <div className="prose-answer text-sm text-gray-800 leading-relaxed">
        <Markdown>{result.answer_markdown}</Markdown>
      </div>

      {/* Metrics */}
      {result.metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {result.metrics.map((m, i) => (
            <MetricCard key={i} metric={m} />
          ))}
        </div>
      )}

      {/* Actions */}
      {result.actions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Recommended Actions
          </h3>
          {result.actions.map((a, i) => (
            <ActionCard key={i} action={a} />
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-amber-800 mb-1">
            Caveats
          </h4>
          <ul className="text-xs text-amber-700 list-disc ml-4 space-y-0.5">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {result.sources.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 font-medium">Sources:</span>
          {result.sources.map((s, i) => (
            <SourceTag key={i} source={s} />
          ))}
        </div>
      )}

      {/* Follow-ups + Save */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {result.followups.map((f, i) => (
          <button
            key={i}
            onClick={() => onFollowup?.(f)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors border border-gray-200"
          >
            {f}
          </button>
        ))}
        {onSave && (
          <button
            onClick={onSave}
            disabled={saved}
            className={`ml-auto text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              saved
                ? "bg-emerald-100 text-emerald-700 cursor-default"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
          >
            {saved ? "Saved" : "Save Insight"}
          </button>
        )}
      </div>
    </div>
  );
}
