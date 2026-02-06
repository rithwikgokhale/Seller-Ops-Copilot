import type { ActionCard as ActionCardType } from "../types";

const confidenceStyles = {
  high: "bg-emerald-100 text-emerald-800",
  med: "bg-amber-100 text-amber-800",
  low: "bg-rose-100 text-rose-800",
};

const confidenceLabels = {
  high: "High confidence",
  med: "Medium confidence",
  low: "Low confidence",
};

export default function ActionCard({ action }: { action: ActionCardType }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-900 text-sm">{action.title}</h4>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            confidenceStyles[action.confidence]
          }`}
        >
          {confidenceLabels[action.confidence]}
        </span>
      </div>
      <p className="text-sm text-gray-600">{action.rationale}</p>
      <div className="text-sm">
        <span className="font-medium text-gray-700">Expected impact: </span>
        <span className="text-gray-600">{action.expected_impact}</span>
      </div>
      {action.assumptions.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer font-medium text-gray-500 hover:text-gray-700">
            Assumptions ({action.assumptions.length})
          </summary>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            {action.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
