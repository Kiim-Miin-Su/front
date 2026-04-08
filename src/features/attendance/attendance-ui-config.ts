import type { AttendanceOverview, AttendanceStatus, CalendarViewMode, StudentWorkspaceTab } from "@/types/attendance";

export const studentWorkspaceTabOptions: Array<{
  value: StudentWorkspaceTab;
  label: string;
}> = [
  { value: "attendance", label: "출석 탭" },
  { value: "calendar", label: "캘린더 탭" },
];

export const calendarViewModeOptions: Array<{
  value: CalendarViewMode;
  label: string;
}> = [
  { value: "month", label: "달력형" },
  { value: "agenda", label: "일정형" },
];

export const attendanceCalendarDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const attendanceCalendarWeekendIndexes = new Set<number>([5, 6]);

export const attendanceOverviewStatusLabelMap: Record<AttendanceOverview["status"], string> = {
  NOT_CHECKED_IN: "출석 전",
  CHECKED_IN: "출석 완료",
  LATE: "지각",
  ABSENT: "결석",
};

export const attendanceOverviewStatusToneClassMap: Record<AttendanceOverview["status"], string> = {
  NOT_CHECKED_IN: "bg-white/80 text-[#45631b]",
  CHECKED_IN: "bg-emerald-100 text-emerald-800",
  LATE: "bg-amber-100 text-amber-800",
  ABSENT: "bg-rose-100 text-rose-700",
};

export const attendanceScheduleStatusLabelMap: Record<AttendanceStatus, string> = {
  NOT_CHECKED_IN: "출석 전",
  CHECKED_IN: "출석 완료",
  LATE: "지각 처리",
  ABSENT: "결석 처리",
};

export const attendanceScheduleStatusToneClassMap: Record<AttendanceStatus, string> = {
  NOT_CHECKED_IN: "text-slate-500",
  CHECKED_IN: "text-emerald-700",
  LATE: "text-amber-700",
  ABSENT: "text-rose-600",
};

