interface CategoryFilterOption {
  label: string;
  value: string;
}

interface CategoryFilterProps {
  options: CategoryFilterOption[];
  activeValue: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ options, activeValue, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category filters">
      {options.map((option) => {
        const isActive = option.value === activeValue;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isActive ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
