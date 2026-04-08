import type {
  CourseDurationRange,
  CoursePriceRange,
  CourseSearchQuery,
} from "@/types/course";

export const topFilters = ["수강 시간", "할인", "가격", "무료", "로드맵"] as const;
export type HomeTopFilter = (typeof topFilters)[number];
export type HomeDropdownFilter = "수강 시간" | "가격";

export const categoryShortcuts = [
  { label: "전체", icon: "◫" },
  { label: "개발 · 프로그래밍", icon: "⌘" },
  { label: "데이터 사이언스", icon: "◈" },
  { label: "AI 기술", icon: "✦" },
  { label: "AI 활용", icon: "◎" },
  { label: "게임 개발", icon: "✸" },
  { label: "보안 · 네트워크", icon: "◌" },
  { label: "하드웨어", icon: "▣" },
  { label: "디자인 · 아트", icon: "◍" },
  { label: "업무 생산성", icon: "◪" },
  { label: "커리어 · 자기계발", icon: "◉" },
] as const;

export const durationOptions = ["전체", "10시간 미만", "10시간~15시간", "15시간 이상"] as const;
export const priceOptions = ["전체", "무료", "5만원 이하", "5만원~8만원", "8만원 이상"] as const;

export type DurationOption = (typeof durationOptions)[number];
export type PriceOption = (typeof priceOptions)[number];

export interface HomeToggleState {
  할인: boolean;
  무료: boolean;
  로드맵: boolean;
}

export function toDurationRange(option: DurationOption): CourseDurationRange | undefined {
  if (option === "10시간 미만") {
    return "UNDER_10_HOURS";
  }

  if (option === "10시간~15시간") {
    return "BETWEEN_10_AND_15_HOURS";
  }

  if (option === "15시간 이상") {
    return "OVER_15_HOURS";
  }

  return undefined;
}

export function toPriceRange(option: PriceOption): CoursePriceRange | undefined {
  if (option === "무료") {
    return "FREE";
  }

  if (option === "5만원 이하") {
    return "UNDER_50K";
  }

  if (option === "5만원~8만원") {
    return "BETWEEN_50K_AND_80K";
  }

  if (option === "8만원 이상") {
    return "OVER_80K";
  }

  return undefined;
}

export function buildCourseSearchQuery({
  page,
  size,
  keyword,
  category,
  selectedDuration,
  selectedPrice,
  activeTopToggles,
}: {
  page: number;
  size: number;
  keyword: string;
  category: string;
  selectedDuration: DurationOption;
  selectedPrice: PriceOption;
  activeTopToggles: HomeToggleState;
}): CourseSearchQuery {
  return {
    page,
    size,
    sort: "RECOMMENDED",
    keyword: keyword.trim() || undefined,
    category: category === "전체" ? undefined : category,
    durationRange: toDurationRange(selectedDuration),
    priceRange: toPriceRange(selectedPrice),
    freeOnly: activeTopToggles.무료 || undefined,
    discountOnly: activeTopToggles.할인 || undefined,
    roadmapOnly: activeTopToggles.로드맵 || undefined,
  };
}
