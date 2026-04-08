export type CourseLevel = "입문" | "중급" | "심화";

export type EnrollmentStatus =
  | "NOT_ENROLLED"
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED";

export type CourseSortOption = "RECOMMENDED" | "LATEST" | "POPULAR";
export type CourseDurationRange = "UNDER_10_HOURS" | "BETWEEN_10_AND_15_HOURS" | "OVER_15_HOURS";
export type CoursePriceRange = "FREE" | "UNDER_50K" | "BETWEEN_50K_AND_80K" | "OVER_80K";

export interface CourseInstructor {
  name: string;
  title: string;
}

export interface CourseLessonPreview {
  id: string;
  title: string;
  durationLabel: string;
  isPreview?: boolean;
  summary?: string;
  headers?: string[];
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tags: string[];
  level: CourseLevel;
  durationLabel: string;
  lessonCount: number;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  thumbnailTone: string;
  instructor: CourseInstructor;
  enrollmentStatus: EnrollmentStatus;
  enrollmentStatusLabel?: string;
  isFeatured?: boolean;
}

export interface CourseDetail extends CourseSummary {
  learningPoints: string[];
  curriculumPreview: CourseLessonPreview[];
}

export interface CourseCatalog {
  featuredCourse: CourseDetail;
  courses: CourseDetail[];
  categories: string[];
}

export interface CourseSearchQuery {
  page: number;
  size: number;
  sort: CourseSortOption;
  keyword?: string;
  category?: string;
  durationRange?: CourseDurationRange;
  priceRange?: CoursePriceRange;
  freeOnly?: boolean;
  discountOnly?: boolean;
  roadmapOnly?: boolean;
}

export interface CourseSearchResult {
  items: CourseDetail[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
