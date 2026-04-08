export type AttendanceStatus = "NOT_CHECKED_IN" | "CHECKED_IN" | "LATE" | "ABSENT";

export type StudentWorkspaceTab = "attendance" | "calendar";
export type CalendarViewMode = "month" | "agenda";
export type ScheduleVisibilityType = "global" | "class";
export type HolidaySourceType = "NATIONAL" | "CUSTOM";

export interface StudentScheduleEvent {
  id: string;
  title: string;
  categoryLabel: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  visibilityType: ScheduleVisibilityType;
  visibilityScope: string;
  visibilityLabel: string;
  requiresAttendanceCheck: boolean;
  attendanceWindowLabel?: string;
  attendanceWindowStartAt?: string;
  attendanceWindowEndAt?: string;
  attendanceStatus?: AttendanceStatus;
  checkedAt?: string;
  supportsCodeCheckIn?: boolean;
}

export interface StudentAttendanceProfile {
  programName: string;
  className: string;
  classScope: string;
  allowedScheduleScopes: string[];
  allowedScheduleLabels: string[];
  expectedCodeLength: number;
  schedules: StudentScheduleEvent[];
}

export interface AttendanceOverview {
  scheduleId?: string;
  programName: string;
  className: string;
  sessionLabel: string;
  scheduleLabel: string;
  dateLabel: string;
  locationLabel: string;
  windowLabel: string;
  status: AttendanceStatus;
  checkedAtLabel?: string;
  supportsCodeCheckIn: boolean;
  canCheckInNow: boolean;
  checkInDisabledReason?: string;
  expectedCodeLength: number;
  calendarTabHref: string;
  visibleScopeLabels: string[];
}

export type AttendanceCheckInErrorCode =
  | "SCHEDULE_NOT_FOUND"
  | "NOT_REQUIRED"
  | "UNSUPPORTED"
  | "OUTSIDE_ATTENDANCE_WINDOW"
  | "INVALID_CODE_LENGTH"
  | "INVALID_CODE"
  | "ALREADY_CHECKED_IN"
  | "ALREADY_ABSENT";

export interface AttendanceCheckInResult {
  scheduleId: string;
  attendanceStatus: AttendanceStatus;
  checkedAt: string;
  isLate: boolean;
}

export interface AttendanceCheckInError {
  code: AttendanceCheckInErrorCode;
  message: string;
}

export type AttendanceRuntimeState = Record<
  string,
  {
    attendanceStatus: AttendanceStatus;
    checkedAt?: string;
  }
>;

export interface CalendarHoliday {
  id: string;
  dateKey: string;
  name: string;
  sourceType: HolidaySourceType;
}
