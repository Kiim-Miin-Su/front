import type {
  SubmissionEditorType,
  SubmissionFeedbackEntryType,
  SubmissionMessageFormat,
  SubmissionReviewStatus,
} from "@/types/submission";

export type InstructorTemplateTargetMode = "NEW_ASSIGNMENT" | "TEMPLATE_AUTHORING";

export const instructorTemplateTargetModeOptions: Array<{
  id: InstructorTemplateTargetMode;
  label: string;
}> = [
  { id: "NEW_ASSIGNMENT", label: "신규 과제" },
  { id: "TEMPLATE_AUTHORING", label: "템플릿 작성" },
];

export const submissionEditorTypeOptions: Array<{
  value: SubmissionEditorType;
  label: string;
}> = [
  { value: "IDE", label: "IDE 스타일" },
  { value: "NOTE", label: "노트 스타일" },
];

export const instructorSubmissionStatusFilterOptions: Array<{
  value: SubmissionReviewStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "전체" },
  { value: "SUBMITTED", label: "재검토" },
  { value: "NEEDS_REVISION", label: "수정 필요" },
  { value: "REVIEWED", label: "리뷰 완료" },
];

export const reviewStatusDecisionOptions: Array<{
  value: SubmissionReviewStatus;
  label: string;
}> = [
  { value: "REVIEWED", label: "완료" },
  { value: "NEEDS_REVISION", label: "보완 필요" },
  { value: "SUBMITTED", label: "재검토" },
];

export const reviewStatusDecisionLabelMap: Record<SubmissionReviewStatus, string> = {
  REVIEWED: "완료",
  NEEDS_REVISION: "보완 필요",
  SUBMITTED: "재검토",
};

export const submissionMessageFormatOptions: Array<{
  value: SubmissionMessageFormat;
  label: string;
}> = [
  { value: "TEXT", label: "Text" },
  { value: "MARKDOWN", label: "Markdown" },
];

export const submissionMessageFormatLabelMap: Record<SubmissionMessageFormat, string> = {
  TEXT: "Text",
  MARKDOWN: "Markdown",
};

export const submissionFeedbackEntryTypeLabelMap: Record<SubmissionFeedbackEntryType, string> = {
  GENERAL: "일반 피드백",
  CODE_SUGGESTION: "코드 수정안",
};
