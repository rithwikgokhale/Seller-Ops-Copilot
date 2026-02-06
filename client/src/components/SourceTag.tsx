import type { Source } from "../types";

const typeStyles = {
  table: "bg-blue-50 text-blue-700 border-blue-200",
  context: "bg-purple-50 text-purple-700 border-purple-200",
  rule: "bg-gray-100 text-gray-600 border-gray-200",
};

const typeLabels = {
  table: "Data",
  context: "Neighborhood",
  rule: "Rule",
};

export default function SourceTag({ source }: { source: Source }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${
        typeStyles[source.type]
      }`}
      title={source.detail}
    >
      <span className="font-medium">{typeLabels[source.type]}:</span>
      <span className="truncate max-w-[200px]">{source.detail}</span>
    </span>
  );
}
