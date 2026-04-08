export function HomeSearch({
  searchQuery,
  onSearchQueryChange,
  onSearchApply,
}: {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchApply: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
          ⌕
        </span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">강의 검색</span>
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearchApply();
              }
            }}
            placeholder="Next.js, Spring, SQL, AI 활용, 디자인 시스템"
            className="w-full border-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-slate-400"
          />
        </label>
        <button
          type="button"
          onClick={onSearchApply}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-base font-semibold text-white"
          aria-label="검색 적용"
        >
          →
        </button>
      </div>
    </div>
  );
}
