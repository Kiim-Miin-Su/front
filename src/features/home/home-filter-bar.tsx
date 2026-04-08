"use client";

import { useState } from "react";

import {
  categoryShortcuts,
  durationOptions,
  type DurationOption,
  type HomeDropdownFilter,
  type HomeToggleState,
  priceOptions,
  type PriceOption,
  topFilters,
} from "@/features/home/home-filters";

export function HomeFilterBar({
  selectedCategory,
  selectedDuration,
  selectedPrice,
  activeTopToggles,
  onSelectedCategoryChange,
  onSelectedDurationChange,
  onSelectedPriceChange,
  onToggleChange,
}: {
  selectedCategory: string;
  selectedDuration: DurationOption;
  selectedPrice: PriceOption;
  activeTopToggles: HomeToggleState;
  onSelectedCategoryChange: (category: string) => void;
  onSelectedDurationChange: (duration: DurationOption) => void;
  onSelectedPriceChange: (price: PriceOption) => void;
  onToggleChange: (key: keyof HomeToggleState) => void;
}) {
  const [openTopFilter, setOpenTopFilter] = useState<HomeDropdownFilter | null>(null);

  return (
    <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {topFilters.map((pill) => {
            const isDropdown = pill === "수강 시간" || pill === "가격";
            const isActive =
              (pill === "수강 시간" && selectedDuration !== "전체") ||
              (pill === "가격" && selectedPrice !== "전체") ||
              (!isDropdown && activeTopToggles[pill as keyof HomeToggleState]);

            return (
              <button
                key={pill}
                type="button"
                onClick={() => {
                  if (pill === "수강 시간" || pill === "가격") {
                    setOpenTopFilter((prev) => (prev === pill ? null : pill));
                    return;
                  }

                  onToggleChange(pill as keyof HomeToggleState);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50 text-brand"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {pill}
                {pill === "수강 시간"
                  ? ` ${selectedDuration === "전체" ? "˅" : `· ${selectedDuration}`}`
                  : ""}
                {pill === "가격" ? ` ${selectedPrice === "전체" ? "˅" : `· ${selectedPrice}`}` : ""}
              </button>
            );
          })}
        </div>
        <p className="text-sm font-semibold text-slate-500">추천순</p>
      </div>

      {openTopFilter ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          {(openTopFilter === "수강 시간" ? durationOptions : priceOptions).map((option) => {
            const active =
              openTopFilter === "수강 시간"
                ? selectedDuration === option
                : selectedPrice === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  if (openTopFilter === "수강 시간") {
                    onSelectedDurationChange(option as DurationOption);
                  } else {
                    onSelectedPriceChange(option as PriceOption);
                  }

                  setOpenTopFilter(null);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-brand"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        {categoryShortcuts.map((shortcut) => {
          const active = selectedCategory === shortcut.label;

          return (
            <button
              key={shortcut.label}
              type="button"
              onClick={() =>
                onSelectedCategoryChange(
                  selectedCategory === shortcut.label ? "전체" : shortcut.label,
                )
              }
              className={`flex min-w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-center transition ${
                active
                  ? "border-emerald-300 bg-emerald-50 text-brand"
                  : "border-transparent bg-white text-slate-700"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-sm ${
                  active ? "bg-emerald-100 text-brand" : "bg-slate-50 text-slate-500"
                }`}
              >
                {shortcut.icon}
              </span>
              <span className="text-sm font-semibold text-slate-700">{shortcut.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => onSelectedCategoryChange("전체")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-brand"
          aria-label="카테고리 전체로 초기화"
        >
          ↻
        </button>
        <button
          type="button"
          onClick={() => onSelectedCategoryChange("전체")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            selectedCategory === "전체"
              ? "border-emerald-200 bg-emerald-50 text-brand"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          전체
        </button>
        {selectedCategory !== "전체" ? (
          <button
            type="button"
            onClick={() => onSelectedCategoryChange("전체")}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-brand"
          >
            {selectedCategory} ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
