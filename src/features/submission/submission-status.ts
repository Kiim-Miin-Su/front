import type { SubmissionCodeLanguage, SubmissionReviewStatus } from "@/types/submission";

export const submissionReviewStatusLabelMap: Record<SubmissionReviewStatus, string> = {
  SUBMITTED: "재검토",
  REVIEWED: "리뷰 완료",
  NEEDS_REVISION: "수정 필요",
};

export const submissionReviewStatusToneMap: Record<SubmissionReviewStatus, string> = {
  SUBMITTED: "bg-slate-100 text-slate-700",
  REVIEWED: "bg-emerald-100 text-emerald-700",
  NEEDS_REVISION: "bg-amber-100 text-amber-700",
};

export const submissionLanguageLabelMap: Record<SubmissionCodeLanguage, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  sql: "SQL",
  markdown: "Markdown",
  plaintext: "Plain Text",
};

export const submissionLanguageOptions = Object.keys(
  submissionLanguageLabelMap,
) as SubmissionCodeLanguage[];
