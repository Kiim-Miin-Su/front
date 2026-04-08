import Link from "next/link";

import type { CourseDetail } from "@/types/course";

export function HomeCourseGrid({
  courses,
  isLoading,
}: {
  courses?: CourseDetail[];
  isLoading: boolean;
}) {
  const safeCourses = courses ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {safeCourses.map((course) => (
        <article
          key={course.id}
          className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className={`h-32 bg-gradient-to-br ${course.thumbnailTone} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {course.category}
              </span>
              <span className="rounded-full bg-slate-950/20 px-3 py-1 text-xs font-semibold">
                {course.level}
              </span>
            </div>
            <div className="mt-7">
              <p className="min-h-[48px] text-[17px] font-semibold leading-6">{course.title}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <p className="min-h-[44px] text-sm leading-6 text-slate-600">{course.subtitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
              <span>{course.rating.toFixed(1)}</span>
              <span>·</span>
              <span>후기 {course.reviewCount}개</span>
              <span>·</span>
              <span>{course.priceLabel}</span>
            </div>
            <div className="mt-auto pt-4">
              <div className="flex min-h-[38px] flex-wrap gap-2">
                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex h-9 items-center rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white"
                >
                  상세
                </Link>
                <Link
                  href={`/learn?courseSlug=${course.slug}`}
                  className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-ink"
                >
                  학습
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
      {!isLoading && safeCourses.length === 0 ? (
        <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          조건에 맞는 강의가 없습니다. 필터를 완화해 주세요.
        </div>
      ) : null}
    </div>
  );
}
