import type { CourseDetail, CourseLessonPreview } from "@/types/course";

export function PlayerStage({
  course,
  selectedLesson,
  isPreviewMode,
}: {
  course: CourseDetail;
  selectedLesson: CourseLessonPreview;
  isPreviewMode: boolean;
}) {
  const isPending = course.enrollmentStatus === "PENDING";

  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-br ${course.thumbnailTone} p-6 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              {course.category}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{course.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/80">{selectedLesson.title}</p>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            {selectedLesson.durationLabel}
          </div>
        </div>
        <div className="mt-6 aspect-[16/8] rounded-[28px] border border-white/10 bg-slate-950/25 p-6 backdrop-blur">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                Mock Lesson
              </p>
              <p className="mt-3 max-w-2xl text-2xl font-semibold leading-tight">
                {isPending
                  ? "승인 대기 강의는 미리보기만 재생됩니다. 승인 완료 시 전체 레슨이 활성화됩니다."
                  : "강의 선택, 플레이어 재생, 커리큘럼 이동이 학습 탭 안에서 바로 이어집니다."}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-white/75">
              <span>{course.instructor.name}</span>
              <span>{isPreviewMode ? "Preview Access" : "Active Enrollment"}</span>
            </div>
          </div>
        </div>
      </div>
      {isPending ? (
        <div className="border-t border-slate-200 bg-amber-50 px-6 py-4">
          <p className="text-sm font-semibold text-amber-900">승인 대기 상태</p>
          <p className="mt-1 text-sm text-amber-700">
            이 강의는 승인 처리 전까지 미리보기 레슨만 시청할 수 있습니다.
          </p>
        </div>
      ) : null}
    </section>
  );
}
