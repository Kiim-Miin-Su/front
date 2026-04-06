import { getEnrollmentStatusMeta } from "@/features/course/enrollment-status";
import type { EnrollmentStatus } from "@/types/course";

export function EnrollmentStatusBadge({
  status,
  label,
}: {
  status: EnrollmentStatus;
  label?: string;
}) {
  const content = getEnrollmentStatusMeta(status, label);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${content.className}`}
    >
      {content.label}
    </span>
  );
}
