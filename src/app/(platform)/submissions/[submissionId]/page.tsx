import { PageIntro } from "@/components/layout/page-intro";
import { SubmissionDetailWorkspace } from "@/features/submission/submission-detail-workspace";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Submission"
        title="제출 상세 리뷰"
        description="제출 원본, 리비전 이력, 강사 피드백, 타임라인 전체를 확인합니다."
      />
      <SubmissionDetailWorkspace submissionId={submissionId} />
    </div>
  );
}
