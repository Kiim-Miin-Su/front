import Link from "next/link";

import type { CourseDetail, CourseLessonPreview } from "@/types/course";

export function CurriculumGrid({
  course,
  selectedLesson,
}: {
  course: CourseDetail;
  selectedLesson: CourseLessonPreview;
}) {
  const isPending = course.enrollmentStatus === "PENDING";

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Curriculum</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            선택한 강의의 커리큘럼을 메인 영역에서 크게 보고 바로 다음 레슨으로 이동합니다.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {course.lessonCount}개 강의
        </span>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {course.curriculumPreview.map((lesson, index) => {
          const active = lesson.id === selectedLesson.id;
          const canOpen = !isPending || lesson.isPreview;

          return (
            <div
              key={lesson.id}
              className={`rounded-[24px] border p-5 transition ${
                active
                  ? "border-brand bg-brand/5 shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Lesson {index + 1}
                  </p>
                  <p className="mt-2 text-[15px] font-semibold leading-6 text-ink">{lesson.title}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                  {lesson.durationLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {lesson.summary ??
                  "선택한 강의 안에서 현재 레슨의 핵심 주제와 구현 포인트를 확인할 수 있습니다."}
              </p>
              {lesson.headers?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {lesson.headers.map((header) => (
                    <span
                      key={header}
                      className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {canOpen ? (
                  <Link
                    href={`/learn?courseSlug=${course.slug}&previewLessonId=${lesson.id}`}
                    className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold ${
                      active
                        ? "bg-brand text-white"
                        : lesson.isPreview
                          ? "bg-emerald-100 text-emerald-800"
                          : "border border-slate-200 bg-white text-ink"
                    }`}
                  >
                    {active ? "현재 재생 중" : lesson.isPreview ? "미리보기 열기" : "이 레슨 보기"}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 cursor-not-allowed items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400"
                  >
                    승인 후 시청 가능
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
