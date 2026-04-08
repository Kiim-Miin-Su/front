export type SubmissionEditorType = "IDE" | "NOTE";
export type SubmissionReviewStatus = "SUBMITTED" | "REVIEWED" | "NEEDS_REVISION";
export type SubmissionMessageFormat = "TEXT" | "MARKDOWN";
export type SubmissionFeedbackEntryType = "GENERAL" | "CODE_SUGGESTION";
export type SubmissionCodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "sql"
  | "markdown"
  | "plaintext";

export interface SubmissionCourseRef {
  courseId: string;
  courseTitle: string;
}

export interface SubmissionStudentProfile {
  studentId: string;
  studentName: string;
  enrolledCourseIds: string[];
}

export interface AssignmentDefinition {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  prompt: string;
  dueAt: string;
  createdAt: string;
  allowFileUpload: boolean;
  allowCodeEditor: boolean;
}

export interface AssignmentTemplate {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseTitle: string;
  editorType: SubmissionEditorType;
  codeLanguage: SubmissionCodeLanguage;
  title: string;
  content: string;
  updatedAt: string;
  updatedById: string;
  updatedByName: string;
}

export interface SubmissionAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface SubmissionFeedbackEntry {
  id: string;
  reviewerId: string;
  reviewerName: string;
  messageFormat?: SubmissionMessageFormat;
  entryType?: SubmissionFeedbackEntryType;
  message: string;
  code: string;
  codeLanguage: SubmissionCodeLanguage;
  attachments: SubmissionAttachment[];
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  message: string;
  code: string;
  codeLanguage: SubmissionCodeLanguage;
  editorType: SubmissionEditorType;
  attachments: SubmissionAttachment[];
  submittedAt: string;
  updatedAt: string;
  reviewStatus: SubmissionReviewStatus;
  revision: number;
  feedbackHistory: SubmissionFeedbackEntry[];
}

export type SubmissionTimelineEventType =
  | "SUBMITTED"
  | "RESUBMITTED"
  | "REVIEW_STATUS_CHANGED"
  | "COMMENTED"
  | "VIDEO_UPLOADED";

export interface SubmissionTimelineEvent {
  id: string;
  submissionId?: string;
  type: SubmissionTimelineEventType;
  actorId: string;
  actorName: string;
  createdAt: string;
  note?: string;
}

export interface InstructorUploadedVideo {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedById: string;
  uploadedByName: string;
}

export interface SubmissionDashboardMetric {
  expectedSubmissionCount: number;
  submittedCount: number;
  submissionRate: number;
  reviewedCount: number;
  needsRevisionCount: number;
  pendingReviewCount: number;
}

export interface SubmissionDashboardByStudent {
  studentId: string;
  studentName: string;
  expectedSubmissionCount: number;
  submittedCount: number;
  submissionRate: number;
  latestSubmittedAt?: string;
}

export interface StudentSubmissionWorkspaceData {
  studentId: string;
  studentName: string;
  enrolledCourses: SubmissionCourseRef[];
  assignments: AssignmentDefinition[];
  templates: AssignmentTemplate[];
  submissions: AssignmentSubmission[];
}

export interface InstructorSubmissionWorkspaceData {
  assignments: AssignmentDefinition[];
  templates: AssignmentTemplate[];
  submissions: AssignmentSubmission[];
  timeline: SubmissionTimelineEvent[];
  videos: InstructorUploadedVideo[];
  dashboard: SubmissionDashboardMetric;
  dashboardByStudent: SubmissionDashboardByStudent[];
}

export interface SubmissionDetailData {
  submission: AssignmentSubmission;
  assignment?: AssignmentDefinition;
  revisionHistory: AssignmentSubmission[];
  timeline: SubmissionTimelineEvent[];
}

export interface CreateStudentSubmissionInput {
  studentId: string;
  studentName: string;
  assignmentId: string;
  editorType: SubmissionEditorType;
  message: string;
  code: string;
  codeLanguage: SubmissionCodeLanguage;
  attachments: SubmissionAttachment[];
  enrolledCourseIds: string[];
}

export interface UpdateSubmissionReviewStatusInput {
  submissionId: string;
  reviewStatus: SubmissionReviewStatus;
  actorId: string;
  actorName: string;
  comment?: string;
}

export interface AddSubmissionFeedbackInput {
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  messageFormat?: SubmissionMessageFormat;
  entryType?: SubmissionFeedbackEntryType;
  message: string;
  code: string;
  codeLanguage: SubmissionCodeLanguage;
  attachments: SubmissionAttachment[];
  reviewStatus?: SubmissionReviewStatus;
}

export interface UpdateInstructorAssignmentMetaInput {
  assignmentId: string;
  title: string;
  prompt?: string;
  dueAt: string;
  allowFileUpload?: boolean;
  allowCodeEditor?: boolean;
  actorId: string;
  actorName: string;
}

export interface UpsertAssignmentTemplateInput {
  assignmentId: string;
  editorType: SubmissionEditorType;
  codeLanguage: SubmissionCodeLanguage;
  title: string;
  content: string;
  actorId: string;
  actorName: string;
}

export interface CreateInstructorAssignmentInput {
  courseId: string;
  courseTitle: string;
  title: string;
  prompt: string;
  dueAt: string;
  allowFileUpload: boolean;
  allowCodeEditor: boolean;
  actorId: string;
  actorName: string;
  initialTemplate?: {
    editorType: SubmissionEditorType;
    codeLanguage: SubmissionCodeLanguage;
    title: string;
    content: string;
  };
}

export interface CreateInstructorAssignmentResult {
  assignment: AssignmentDefinition;
  template?: AssignmentTemplate;
}

export interface UploadInstructorVideoInput {
  courseId: string;
  courseTitle: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  uploadedByName: string;
}

export type SubmissionErrorCode =
  | "ASSIGNMENT_NOT_FOUND"
  | "NOT_ENROLLED_COURSE"
  | "INVALID_SUBMISSION"
  | "SUBMISSION_NOT_FOUND";

export interface SubmissionError {
  code: SubmissionErrorCode;
  message: string;
}
