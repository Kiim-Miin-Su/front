import { getScheduleTone } from "@/features/attendance/attendance-schedule-tone";
import type { StudentScheduleEvent } from "@/types/attendance";

export function AttendanceAgendaList({
  schedules,
  onSelectDetail,
  onSelectAttendance,
}: {
  schedules: StudentScheduleEvent[];
  onSelectDetail: (dateKey: string) => void;
  onSelectAttendance: (scheduleId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <button
          key={schedule.id}
          type="button"
          onClick={() => {
            onSelectDetail(schedule.dateKey);
            onSelectAttendance(schedule.id);
          }}
          className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-left transition hover:border-slate-300 hover:bg-white"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    getScheduleTone(schedule.categoryLabel).bgClassName
                  } ${getScheduleTone(schedule.categoryLabel).textClassName}`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${getScheduleTone(schedule.categoryLabel).dotClassName}`}
                  />
                  {schedule.categoryLabel}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  {schedule.visibilityLabel}
                </span>
                {schedule.requiresAttendanceCheck ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    필수 출석
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-lg font-semibold text-ink">{schedule.title}</p>
              <p className="mt-1 text-sm text-slate-600">
                {schedule.dateLabel} · {schedule.timeLabel}
              </p>
              <p className="mt-1 text-sm text-slate-500">{schedule.locationLabel}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Scope</p>
              <p className="mt-1 text-sm font-semibold text-ink">{schedule.visibilityScope}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
