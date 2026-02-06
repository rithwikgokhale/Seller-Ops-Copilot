import type { MetricCard as MetricCardType } from "../types";

const trendColors = {
  up: "text-emerald-600",
  down: "text-rose-600",
  flat: "text-gray-500",
};

const trendArrows = {
  up: "\u2191",
  down: "\u2193",
  flat: "\u2192",
};

export default function MetricCard({ metric }: { metric: MetricCardType }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-1 min-w-[140px]">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {metric.label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {metric.unit === "$" ? "$" : ""}
          {metric.value}
        </span>
        {metric.unit && metric.unit !== "$" && (
          <span className="text-sm text-gray-500">{metric.unit}</span>
        )}
      </div>
      {(metric.trend || metric.delta) && (
        <div
          className={`text-xs font-medium flex items-center gap-1 ${
            metric.trend ? trendColors[metric.trend] : "text-gray-500"
          }`}
        >
          {metric.trend && <span>{trendArrows[metric.trend]}</span>}
          {metric.delta && <span>{metric.delta}</span>}
        </div>
      )}
      {metric.note && (
        <span className="text-xs text-gray-400 mt-1">{metric.note}</span>
      )}
    </div>
  );
}
