import type { CourseDetail, CourseLessonPreview } from "@/types/course";

export function LearningMetrics({
  course,
  selectedLesson,
}: {
  course: CourseDetail;
  selectedLesson: CourseLessonPreview;
}) {
  const statusLabel = course.enrollmentStatus === "PENDING" ? "신청 대기" : "수강 중";
  const statusDescription =
    course.enrollmentStatus === "PENDING"
      ? "승인 대기 강의는 미리보기만, 승인 후 전체 학습이 가능합니다."
      : "수강 중 강의는 전체 레슨 학습과 진도 반영이 가능합니다.";

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="현재 강의"
        value={course.lessonCount.toString()}
        description="선택한 강의의 레슨 수"
      />
      <MetricCard
        label="현재 레슨"
        value={selectedLesson.durationLabel}
        description="지금 재생 중인 레슨 길이"
      />
      <MetricCard label="수강 상태" value={statusLabel} description={statusDescription} />
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
