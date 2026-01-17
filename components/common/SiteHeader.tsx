import { ChevronDownIcon } from "@/components/common/icons";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          REALTEETH
        </span>
        <span className="text-sm font-medium text-slate-500">Weather</span>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
        aria-label="언어 선택"
      >
        KO
        <ChevronDownIcon className="h-4 w-4 text-slate-500" />
      </button>
    </header>
  );
}

