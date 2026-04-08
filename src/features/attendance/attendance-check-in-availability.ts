import type { StudentScheduleEvent } from "@/types/attendance";

export function resolveScheduleCheckInAvailability(
  schedule: StudentScheduleEvent,
  now: Date = new Date(),
) {
  if (!schedule.supportsCodeCheckIn) {
    return { canCheckInNow: false, reason: "코드 인증을 지원하지 않는 일정입니다." };
  }

  if (schedule.attendanceStatus === "CHECKED_IN") {
    return { canCheckInNow: false, reason: "이미 출석이 완료된 일정입니다." };
  }

  if (schedule.attendanceStatus === "LATE") {
    return { canCheckInNow: false, reason: "지각 처리 완료된 일정입니다." };
  }

  if (schedule.attendanceStatus === "ABSENT") {
    return { canCheckInNow: false, reason: "결석 처리된 일정입니다." };
  }

  const attendanceWindow = resolveScheduleAttendanceWindow(schedule);

  if (!attendanceWindow) {
    return { canCheckInNow: true, reason: undefined };
  }

  if (now < attendanceWindow.start || now > attendanceWindow.end) {
    return { canCheckInNow: false, reason: "출석 인증 가능 시간이 아닙니다." };
  }

  return { canCheckInNow: true, reason: undefined };
}

function resolveScheduleAttendanceWindow(schedule: StudentScheduleEvent) {
  if (schedule.attendanceWindowStartAt && schedule.attendanceWindowEndAt) {
    const start = new Date(schedule.attendanceWindowStartAt);
    const end = new Date(schedule.attendanceWindowEndAt);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return { start, end };
    }
  }

  const timeMatch = schedule.timeLabel.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);

  if (!timeMatch) {
    return null;
  }

  const start = buildLocalDateTime(schedule.dateKey, timeMatch[1]);
  const end = buildLocalDateTime(schedule.dateKey, timeMatch[2]);

  if (!start || !end) {
    return null;
  }

  return { start, end };
}

function buildLocalDateTime(dateKey: string, hhmm: string) {
  if (!dateKey || !hhmm) {
    return null;
  }

  const [hours, minutes] = hhmm.split(":").map(Number);
  const baseDate = new Date(dateKey);

  if (Number.isNaN(baseDate.getTime()) || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}
