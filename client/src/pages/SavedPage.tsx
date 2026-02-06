import { useSavedInsights } from "../hooks/useSavedInsights";
import InsightResult from "../components/InsightResult";

export default function SavedPage() {
  const { insights, remove } = useSavedInsights();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Saved Insights</h2>
        <span className="text-sm text-gray-500">
          {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">
            No saved insights yet. Ask a question and save the result.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-indigo-600">
                    {insight.question}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(insight.savedAt).toLocaleString()}
                    {insight.neighborhoodEnabled && (
                      <span className="ml-2 text-purple-500">
                        + Neighborhood Context
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => remove(insight.id)}
                  className="text-xs text-gray-400 hover:text-rose-500 transition-colors px-2 py-1"
                >
                  Remove
                </button>
              </div>

              {/* Result */}
              <InsightResult result={insight.result} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
