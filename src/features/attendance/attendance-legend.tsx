import { scheduleToneMap } from "@/features/attendance/attendance-schedule-tone";

export function AttendanceLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">일정 구분</p>
      {Object.values(scheduleToneMap).map((tone) => (
        <div key={tone.label} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${tone.dotClassName}`} />
          <span className={`text-xs font-semibold ${tone.textClassName}`}>{tone.label}</span>
        </div>
      ))}
    </div>
  );
}
