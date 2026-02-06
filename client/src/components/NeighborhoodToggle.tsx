interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function NeighborhoodToggle({ enabled, onChange }: Props) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <span className="text-sm text-gray-600 font-medium">
        Neighborhood Context
      </span>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {enabled && (
        <span className="text-xs text-indigo-600 font-medium">ON</span>
      )}
    </label>
  );
}
