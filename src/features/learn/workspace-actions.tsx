import Link from "next/link";

import { AttendanceCheckCard } from "@/features/attendance/attendance-check-card";
import type { AttendanceOverview } from "@/types/attendance";
import type { CourseDetail } from "@/types/course";

export function WorkspaceActions({
  course,
  attendanceOverview,
}: {
  course: CourseDetail;
  attendanceOverview: AttendanceOverview;
}) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
      <AttendanceCheckCard attendance={attendanceOverview} />

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Workspace</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          학습 여정과 운영 흐름을 한 번에 보도록 묶었습니다. 출석 체크, 강의 상세 확인, 다른 강의
          이동까지 여기서 정리합니다.
        </p>
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              학습 여정
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              내 강의 선택, 플레이어 확인, 커리큘럼 이동을 한 화면에서 이어갑니다.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">운영</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              학생 대시보드의 출석 흐름과 강의 상세 이동까지 운영 시나리오를 같이 봅니다.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Link
            href="/student?tab=attendance"
            className="block rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white"
          >
            출석 체크로 이동
          </Link>
          <Link
            href={`/courses/${course.slug}`}
            className="block rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            강의 상세 보기
          </Link>
          <Link
            href="/courses"
            className="block rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            다른 강의 둘러보기
          </Link>
        </div>
      </section>
    </aside>
  );
}
