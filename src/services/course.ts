import { mockCourseCatalog } from "@/features/course/mock-course-data";
import { api } from "@/services/api";
import type {
  CourseCatalog,
  CourseDetail,
  CourseDurationRange,
  CoursePriceRange,
  CourseSearchQuery,
  CourseSearchResult,
} from "@/types/course";

export async function fetchCourseCatalog() {
  try {
    const { data } = await api.get<CourseCatalog>("/courses");
    return data;
  } catch {
    return mockCourseCatalog;
  }
}

export async function fetchCourseBySlug(slug: string) {
  try {
    const { data } = await api.get<CourseDetail>(`/courses/${slug}`);
    return data;
  } catch {
    return mockCourseCatalog.courses.find((course) => course.slug === slug)
      ?? (mockCourseCatalog.featuredCourse.slug === slug
        ? mockCourseCatalog.featuredCourse
        : null);
  }
}

export async function fetchLearnCourse(slug?: string | null) {
  if (slug) {
    const course = await fetchCourseBySlug(slug);

    if (course) {
      return course;
    }
  }

  return (
    mockCourseCatalog.courses.find((course) => course.enrollmentStatus === "ACTIVE") ??
    mockCourseCatalog.featuredCourse
  );
}

export async function fetchMyLearningCourses() {
  try {
    const { data } = await api.get<CourseDetail[]>("/me/courses");
    return data.filter(
      (course) => course.enrollmentStatus === "ACTIVE" || course.enrollmentStatus === "PENDING",
    );
  } catch {
    return [
      mockCourseCatalog.featuredCourse,
      ...mockCourseCatalog.courses.filter(
        (course) => course.enrollmentStatus === "ACTIVE" || course.enrollmentStatus === "PENDING",
      ),
    ];
  }
}

export async function searchCourses(query: CourseSearchQuery): Promise<CourseSearchResult> {
  try {
    const { data } = await api.get<unknown>("/courses", {
      params: buildCourseSearchParams(query),
    });
    const normalized = normalizeCourseSearchResponse(data, query);

    if (normalized) {
      return normalized;
    }

    throw new Error("INVALID_COURSE_SEARCH_RESPONSE");
  } catch {
    const filtered = buildExpandedCoursesFromMock().filter((course) => matchesCourseQuery(course, query));
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / query.size));
    const page = Math.min(Math.max(query.page, 1), totalPages);
    const startIndex = (page - 1) * query.size;

    return {
      items: filtered.slice(startIndex, startIndex + query.size),
      page,
      size: query.size,
      totalPages,
      totalElements,
    };
  }
}

function buildCourseSearchParams(query: CourseSearchQuery) {
  return {
    page: query.page,
    size: query.size,
    sort: query.sort,
    keyword: query.keyword,
    category: query.category,
    durationRange: query.durationRange,
    priceRange: query.priceRange,
    freeOnly: query.freeOnly,
    discountOnly: query.discountOnly,
    roadmapOnly: query.roadmapOnly,
  };
}

function normalizeCourseSearchResponse(
  data: unknown,
  query: CourseSearchQuery,
): CourseSearchResult | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  if ("items" in data && Array.isArray((data as { items?: unknown }).items)) {
    const items = (data as { items: CourseDetail[] }).items;
    const totalElements = Number((data as { totalElements?: unknown }).totalElements) || items.length;
    const totalPages = Math.max(
      1,
      Number((data as { totalPages?: unknown }).totalPages) || Math.ceil(totalElements / query.size),
    );
    const page = Math.min(
      Math.max(1, Number((data as { page?: unknown }).page) || query.page),
      totalPages,
    );

    return {
      items,
      page,
      size: Number((data as { size?: unknown }).size) || query.size,
      totalPages,
      totalElements,
    };
  }

  if ("courses" in data && Array.isArray((data as { courses?: unknown }).courses)) {
    const maybeCatalog = data as {
      featuredCourse?: CourseDetail;
      courses: CourseDetail[];
    };
    const catalogCourses = maybeCatalog.featuredCourse
      ? [maybeCatalog.featuredCourse, ...maybeCatalog.courses]
      : maybeCatalog.courses;
    const filtered = catalogCourses.filter((course) => matchesCourseQuery(course, query));
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / query.size));
    const page = Math.min(Math.max(1, query.page), totalPages);
    const startIndex = (page - 1) * query.size;

    return {
      items: filtered.slice(startIndex, startIndex + query.size),
      page,
      size: query.size,
      totalPages,
      totalElements,
    };
  }

  if (Array.isArray(data)) {
    const filtered = (data as CourseDetail[]).filter((course) => matchesCourseQuery(course, query));
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / query.size));
    const page = Math.min(Math.max(1, query.page), totalPages);
    const startIndex = (page - 1) * query.size;

    return {
      items: filtered.slice(startIndex, startIndex + query.size),
      page,
      size: query.size,
      totalPages,
      totalElements,
    };
  }

  return null;
}

function buildExpandedCoursesFromMock() {
  const seeds = [mockCourseCatalog.featuredCourse, ...mockCourseCatalog.courses];
  const suffixes = [
    { key: "starter", label: "Starter" },
    { key: "bootcamp", label: "Bootcamp" },
    { key: "intensive", label: "Intensive" },
  ];

  return seeds.flatMap((course, seedIndex) =>
    suffixes.map((suffix, suffixIndex) => ({
      ...course,
      id: `${course.id}-${suffix.key}`,
      slug: `${course.slug}-${suffix.key}`,
      title: `${course.title} ${suffix.label}`,
      subtitle: `${course.subtitle} ${suffix.label} 트랙`,
      reviewCount: course.reviewCount + suffixIndex * 11 + seedIndex * 3,
      enrollmentCount: course.enrollmentCount + suffixIndex * 140 + seedIndex * 60,
      rating: Math.max(4.3, Number((course.rating - suffixIndex * 0.1).toFixed(1))),
      priceLabel:
        suffixIndex === 0
          ? course.priceLabel
          : suffixIndex === 1
            ? "₩44,000"
            : "₩79,000",
      isFeatured: suffixIndex === 1 ? true : course.isFeatured,
    })),
  );
}

function matchesCourseQuery(course: CourseDetail, query: CourseSearchQuery) {
  const normalizedKeyword = query.keyword?.trim().toLowerCase() ?? "";
  const matchesKeyword =
    normalizedKeyword.length === 0 ||
    [course.title, course.subtitle, course.category, course.instructor.name, ...course.tags]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword);
  const matchesCategory =
    !query.category ||
    query.category === "전체" ||
    mapCourseCategoryToShortcut(course.category) === query.category;
  const durationMinutes = parseDurationLabel(course.durationLabel);
  const priceValue = parsePriceLabel(course.priceLabel);
  const matchesDuration = matchesDurationRange(query.durationRange, durationMinutes);
  const matchesPrice = matchesPriceRange(query.priceRange, priceValue);
  const matchesFree = !query.freeOnly || priceValue === 0;
  const matchesDiscount = !query.discountOnly || course.reviewCount >= 80;
  const matchesRoadmap = !query.roadmapOnly || Boolean(course.isFeatured || course.enrollmentStatus === "ACTIVE");

  return (
    matchesKeyword &&
    matchesCategory &&
    matchesDuration &&
    matchesPrice &&
    matchesFree &&
    matchesDiscount &&
    matchesRoadmap
  );
}

function matchesDurationRange(range: CourseDurationRange | undefined, durationMinutes: number) {
  if (!range) {
    return true;
  }

  if (range === "UNDER_10_HOURS") {
    return durationMinutes < 600;
  }

  if (range === "BETWEEN_10_AND_15_HOURS") {
    return durationMinutes >= 600 && durationMinutes < 900;
  }

  return durationMinutes >= 900;
}

function matchesPriceRange(range: CoursePriceRange | undefined, priceValue: number) {
  if (!range) {
    return true;
  }

  if (range === "FREE") {
    return priceValue === 0;
  }

  if (range === "UNDER_50K") {
    return priceValue > 0 && priceValue <= 50000;
  }

  if (range === "BETWEEN_50K_AND_80K") {
    return priceValue > 50000 && priceValue <= 80000;
  }

  return priceValue > 80000;
}

function mapCourseCategoryToShortcut(category: string) {
  if (category === "프론트엔드" || category === "백엔드") {
    return "개발 · 프로그래밍";
  }

  if (category === "데이터") {
    return "데이터 사이언스";
  }

  if (category === "AI 활용") {
    return "AI 활용";
  }

  if (category === "디자인 시스템") {
    return "디자인 · 아트";
  }

  return "전체";
}

function parseDurationLabel(label: string) {
  const hourMatch = label.match(/(\d+)시간/);
  const minuteMatch = label.match(/(\d+)분/);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
}

function parsePriceLabel(label: string) {
  if (label.includes("무료") || label.includes("구독")) {
    return 0;
  }

  return Number(label.replace(/[^\d]/g, ""));
}
