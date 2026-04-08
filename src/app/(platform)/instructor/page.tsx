import { RoleGate } from "@/components/auth/role-gate";
import { PageIntro } from "@/components/layout/page-intro";
import { InstructorConsoleWorkspace } from "@/features/submission/instructor-console-workspace";

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Instructor"
        title="강사 과제/업로드 콘솔"
        description="제출 이력, 학생별 제출율, 리뷰 상태 관리, 영상 업로드를 한 화면에서 운영합니다."
      />
      <RoleGate allowedRoles={["instructor", "assistant"]}>
        <InstructorConsoleWorkspace />
      </RoleGate>
    </div>
  );
}
