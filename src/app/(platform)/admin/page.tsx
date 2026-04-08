import { PageIntro } from "@/components/layout/page-intro";
import { AdminHolidayManager } from "@/features/admin/admin-holiday-manager";
import { AdminInstructorCourseManager } from "@/features/admin/admin-instructor-course-manager";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Admin"
        title="관리자 운영 페이지"
        description="강사 담당 과정과 공휴일 데이터를 함께 관리합니다."
      />
      <AdminInstructorCourseManager />
      <AdminHolidayManager />
    </div>
  );
}
