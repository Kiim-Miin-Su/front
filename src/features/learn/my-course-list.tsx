import Link from "next/link";

import { EnrollmentStatusBadge } from "@/features/course/enrollment-status-badge";
import type { CourseDetail } from "@/types/course";

export function MyCourseList({
  learningCourses,
  selectedCourseId,
}: {
  learningCourses: CourseDetail[];
  selectedCourseId: string;
}) {
  const pendingCourses = learningCourses.filter((item) => item.enrollmentStatus === "PENDING");
  const activeCourses = learningCourses.filter((item) => item.enrollmentStatus === "ACTIVE");

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">My Courses</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            신청 대기 강의와 수강 중 강의를 먼저 고르고, 바로 아래에서 학습을 이어갑니다.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {learningCourses.length}개
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <CourseGroup
          title="수강 중"
          emptyLabel="수강 중인 강의가 없습니다."
          courses={activeCourses}
          selectedCourseId={selectedCourseId}
        />
        <CourseGroup
          title="신청 대기"
          emptyLabel="대기 중인 강의가 없습니다."
          courses={pendingCourses}
          selectedCourseId={selectedCourseId}
        />
      </div>
    </section>
  );
}

function CourseGroup({
  title,
  emptyLabel,
  courses,
  selectedCourseId,
}: {
  title: string;
  emptyLabel: string;
  courses: CourseDetail[];
  selectedCourseId: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      {courses.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">{emptyLabel}</div>
      ) : (
        courses.map((item) => {
          const active = item.id === selectedCourseId;

          return (
            <Link
              key={item.id}
              href={`/learn?courseSlug=${item.slug}`}
              className={`block rounded-2xl border px-4 py-4 transition ${
                active ? "border-brand bg-brand/5" : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.lessonCount}개 강의 · {item.durationLabel}
                  </p>
                </div>
                <EnrollmentStatusBadge status={item.enrollmentStatus} />
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
