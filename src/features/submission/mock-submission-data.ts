import { mockCourseCatalog } from "@/features/course/mock-course-data";
import type {
  AssignmentDefinition,
  AssignmentSubmission,
  AssignmentTemplate,
  InstructorUploadedVideo,
  SubmissionDashboardByStudent,
  SubmissionDashboardMetric,
  SubmissionTimelineEvent,
} from "@/types/submission";

export interface SubmissionStudentDirectory {
  id: string;
  name: string;
  enrolledCourseIds: string[];
}

export interface SubmissionLocalDatabase {
  students: SubmissionStudentDirectory[];
  assignments: AssignmentDefinition[];
  templates: AssignmentTemplate[];
  submissions: AssignmentSubmission[];
  timeline: SubmissionTimelineEvent[];
  videos: InstructorUploadedVideo[];
}

const seedStudents: SubmissionStudentDirectory[] = [
  {
    id: "student-demo-01",
    name: "데모 수강생",
    enrolledCourseIds: ["course-next-ai-lms", "course-llm-study-assistant"],
  },
  {
    id: "student-kim-hana",
    name: "김하나",
    enrolledCourseIds: ["course-next-ai-lms", "course-spring-lms-api"],
  },
  {
    id: "student-lee-jisoo",
    name: "이지수",
    enrolledCourseIds: ["course-llm-study-assistant"],
  },
];

const now = Date.now();
const hour = 60 * 60 * 1000;

const seedAssignments: AssignmentDefinition[] = [
  {
    id: "assignment-next-auth-flow",
    courseId: "course-next-ai-lms",
    courseTitle: resolveCourseTitle("course-next-ai-lms"),
    title: "인증 플로우 UI/상태 분리",
    prompt: "로그인-세션-권한 가드 흐름을 feature 단위로 분리하고 PR 설명을 작성하세요.",
    dueAt: new Date(now + 48 * hour).toISOString(),
    createdAt: new Date(now - 36 * hour).toISOString(),
    allowFileUpload: true,
    allowCodeEditor: true,
  },
  {
    id: "assignment-next-course-filter",
    courseId: "course-next-ai-lms",
    courseTitle: resolveCourseTitle("course-next-ai-lms"),
    title: "서버 필터 스키마 안정화",
    prompt: "검색/필터 응답 스키마를 고정하고 타입/정규화 로직을 정리하세요.",
    dueAt: new Date(now + 96 * hour).toISOString(),
    createdAt: new Date(now - 18 * hour).toISOString(),
    allowFileUpload: true,
    allowCodeEditor: true,
  },
  {
    id: "assignment-llm-study-assistant",
    courseId: "course-llm-study-assistant",
    courseTitle: resolveCourseTitle("course-llm-study-assistant"),
    title: "학습 도우미 패널 인터랙션 개선",
    prompt: "학습 요약/후속 질문 플로우를 개선하고 사용자 테스트 메모를 남기세요.",
    dueAt: new Date(now + 72 * hour).toISOString(),
    createdAt: new Date(now - 24 * hour).toISOString(),
    allowFileUpload: true,
    allowCodeEditor: true,
  },
  {
    id: "assignment-spring-api-contract",
    courseId: "course-spring-lms-api",
    courseTitle: resolveCourseTitle("course-spring-lms-api"),
    title: "출석 API 계약 문서화",
    prompt: "출석 인증 상태 코드와 요청/응답 스키마를 계약 문서로 정리하세요.",
    dueAt: new Date(now + 120 * hour).toISOString(),
    createdAt: new Date(now - 12 * hour).toISOString(),
    allowFileUpload: true,
    allowCodeEditor: false,
  },
];

const seedSubmissions: AssignmentSubmission[] = [
  {
    id: "submission-1",
    assignmentId: "assignment-next-auth-flow",
    assignmentTitle: "인증 플로우 UI/상태 분리",
    courseId: "course-next-ai-lms",
    courseTitle: resolveCourseTitle("course-next-ai-lms"),
    studentId: "student-kim-hana",
    studentName: "김하나",
    message: "라우트 가드 컴포넌트와 auth-store 연동 초안을 작성했습니다.",
    code: "export function useRoleGuard() {\n  // TODO: strict role validation\n}\n",
    codeLanguage: "typescript",
    editorType: "IDE",
    attachments: [
      {
        id: "attachment-1",
        fileName: "auth-flow-notes.md",
        mimeType: "text/markdown",
        sizeBytes: 2389,
      },
    ],
    submittedAt: new Date(now - 20 * hour).toISOString(),
    updatedAt: new Date(now - 20 * hour).toISOString(),
    reviewStatus: "SUBMITTED",
    revision: 1,
    feedbackHistory: [],
  },
  {
    id: "submission-2",
    assignmentId: "assignment-llm-study-assistant",
    assignmentTitle: "학습 도우미 패널 인터랙션 개선",
    courseId: "course-llm-study-assistant",
    courseTitle: resolveCourseTitle("course-llm-study-assistant"),
    studentId: "student-demo-01",
    studentName: "데모 수강생",
    message: "패널 상태 전환과 QA 메모를 첨부합니다.",
    code: "const panelState = {\n  summaryOpen: true,\n  followUpEnabled: true,\n};\n",
    codeLanguage: "typescript",
    editorType: "IDE",
    attachments: [
      {
        id: "attachment-2",
        fileName: "panel-qa-checklist.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        sizeBytes: 11822,
      },
    ],
    submittedAt: new Date(now - 8 * hour).toISOString(),
    updatedAt: new Date(now - 8 * hour).toISOString(),
    reviewStatus: "NEEDS_REVISION",
    revision: 1,
    feedbackHistory: [
      {
        id: "feedback-1",
        reviewerId: "instructor-seed-01",
        reviewerName: "민수 김",
        message: "상태 전환 조건 분기를 함수로 분리하고 테스트 케이스를 추가해 주세요.",
        code: "function shouldShowFollowUp(state: PanelState) {\n  return state.summaryOpen && state.followUpEnabled;\n}\n",
        codeLanguage: "typescript",
        attachments: [
          {
            id: "feedback-file-1",
            fileName: "review-checklist.md",
            mimeType: "text/markdown",
            sizeBytes: 1466,
          },
        ],
        createdAt: new Date(now - 3 * hour).toISOString(),
      },
    ],
  },
  {
    id: "submission-2-r2",
    assignmentId: "assignment-llm-study-assistant",
    assignmentTitle: "학습 도우미 패널 인터랙션 개선",
    courseId: "course-llm-study-assistant",
    courseTitle: resolveCourseTitle("course-llm-study-assistant"),
    studentId: "student-demo-01",
    studentName: "데모 수강생",
    message: "피드백 반영 2차 제출입니다. 상태 분기와 에러 메시지 처리를 보완했습니다.",
    code: [
      "const panelState = {",
      "  summaryOpen: true,",
      "  followUpEnabled: true,",
      "  errorMessage: '',",
      "};",
      "",
      "export function normalizePanelError(error: unknown) {",
      "  if (typeof error === 'object' && error !== null && 'message' in error) {",
      "    return String((error as { message: unknown }).message);",
      "  }",
      "  return '알 수 없는 오류';",
      "}",
    ].join("\n"),
    codeLanguage: "typescript",
    editorType: "IDE",
    attachments: [
      {
        id: "attachment-2-r2",
        fileName: "panel-error-flow-v2.md",
        mimeType: "text/markdown",
        sizeBytes: 2214,
      },
    ],
    submittedAt: new Date(now - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 90 * 60 * 1000).toISOString(),
    reviewStatus: "NEEDS_REVISION",
    revision: 2,
    feedbackHistory: [
      {
        id: "feedback-2-r2-general",
        reviewerId: "instructor-seed-01",
        reviewerName: "민수 김",
        entryType: "GENERAL",
        messageFormat: "MARKDOWN",
        message: [
          "좋아요. 2차 제출에서 분기 처리가 정리됐습니다.",
          "",
          "- `normalizePanelError`의 반환 일관성은 좋아졌습니다.",
          "- 다음 라운드에서 API 레이어 에러 타입을 한 번 더 고정해 주세요.",
        ].join("\n"),
        code: "",
        codeLanguage: "typescript",
        attachments: [],
        createdAt: new Date(now - 70 * 60 * 1000).toISOString(),
      },
      {
        id: "feedback-2-r2-code",
        reviewerId: "instructor-seed-01",
        reviewerName: "민수 김",
        entryType: "CODE_SUGGESTION",
        messageFormat: "TEXT",
        message: "타입 가드를 분리해 재사용성을 높인 코드 수정안입니다.",
        code: [
          "function hasMessage(error: unknown): error is { message: unknown } {",
          "  return typeof error === 'object' && error !== null && 'message' in error;",
          "}",
          "",
          "export function normalizePanelError(error: unknown) {",
          "  if (hasMessage(error)) {",
          "    return String(error.message);",
          "  }",
          "  return '알 수 없는 오류';",
          "}",
        ].join("\n"),
        codeLanguage: "typescript",
        attachments: [],
        createdAt: new Date(now - 68 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "submission-2-r3",
    assignmentId: "assignment-llm-study-assistant",
    assignmentTitle: "학습 도우미 패널 인터랙션 개선",
    courseId: "course-llm-study-assistant",
    courseTitle: resolveCourseTitle("course-llm-study-assistant"),
    studentId: "student-demo-01",
    studentName: "데모 수강생",
    message: "3차 제출입니다. 제안해주신 타입 가드를 반영하고 테스트 케이스를 추가했습니다.",
    code: [
      "function hasMessage(error: unknown): error is { message: unknown } {",
      "  return typeof error === 'object' && error !== null && 'message' in error;",
      "}",
      "",
      "export function normalizePanelError(error: unknown) {",
      "  if (hasMessage(error)) {",
      "    return String(error.message);",
      "  }",
      "  return '알 수 없는 오류';",
      "}",
      "",
      "export function canShowFollowUp(summaryOpen: boolean, followUpEnabled: boolean) {",
      "  return summaryOpen && followUpEnabled;",
      "}",
    ].join("\n"),
    codeLanguage: "typescript",
    editorType: "IDE",
    attachments: [
      {
        id: "attachment-2-r3",
        fileName: "panel-tests-v3.md",
        mimeType: "text/markdown",
        sizeBytes: 2491,
      },
    ],
    submittedAt: new Date(now - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
    reviewStatus: "REVIEWED",
    revision: 3,
    feedbackHistory: [
      {
        id: "feedback-2-r3-general",
        reviewerId: "instructor-seed-01",
        reviewerName: "민수 김",
        entryType: "GENERAL",
        messageFormat: "TEXT",
        message: "반영 완료 확인했습니다. 현재 라운드는 리뷰 완료 처리합니다.",
        code: "",
        codeLanguage: "typescript",
        attachments: [],
        createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "submission-3",
    assignmentId: "assignment-next-course-filter",
    assignmentTitle: "서버 필터 스키마 안정화",
    courseId: "course-next-ai-lms",
    courseTitle: resolveCourseTitle("course-next-ai-lms"),
    studentId: "student-demo-01",
    studentName: "데모 수강생",
    message: "필터 응답 스키마 초안과 정규화 함수 구조를 정리해 제출합니다.",
    code: [
      "interface FilterResponse {",
      "  items: unknown[];",
      "  page: number;",
      "  totalPages: number;",
      "}",
      "",
      "export function normalizeFilterResponse(input: unknown): FilterResponse | null {",
      "  if (!input || typeof input !== 'object') return null;",
      "  return input as FilterResponse;",
      "}",
    ].join("\n"),
    codeLanguage: "typescript",
    editorType: "IDE",
    attachments: [
      {
        id: "attachment-3",
        fileName: "filter-contract-v1.md",
        mimeType: "text/markdown",
        sizeBytes: 1820,
      },
    ],
    submittedAt: new Date(now - 6 * hour).toISOString(),
    updatedAt: new Date(now - 6 * hour).toISOString(),
    reviewStatus: "SUBMITTED",
    revision: 1,
    feedbackHistory: [],
  },
  {
    id: "submission-4",
    assignmentId: "assignment-spring-api-contract",
    assignmentTitle: "출석 API 계약 문서화",
    courseId: "course-spring-lms-api",
    courseTitle: resolveCourseTitle("course-spring-lms-api"),
    studentId: "student-kim-hana",
    studentName: "김하나",
    message: "요청/응답 DTO와 상태 코드 표를 정리했습니다.",
    code: "attendance_check_in.md 문서 기반 계약 정리 제출",
    codeLanguage: "markdown",
    editorType: "NOTE",
    attachments: [
      {
        id: "attachment-4",
        fileName: "attendance-api-contract.md",
        mimeType: "text/markdown",
        sizeBytes: 3275,
      },
    ],
    submittedAt: new Date(now - 5 * hour).toISOString(),
    updatedAt: new Date(now - 5 * hour).toISOString(),
    reviewStatus: "REVIEWED",
    revision: 1,
    feedbackHistory: [
      {
        id: "feedback-4-general",
        reviewerId: "instructor-seed-01",
        reviewerName: "민수 김",
        entryType: "GENERAL",
        messageFormat: "TEXT",
        message: "DTO 필드 정의가 명확합니다. 에러코드 예시를 2개만 추가하면 운영에 충분합니다.",
        code: "",
        codeLanguage: "markdown",
        attachments: [],
        createdAt: new Date(now - 4 * hour).toISOString(),
      },
    ],
  },
];

const seedTemplates: AssignmentTemplate[] = [
  {
    id: "template-next-auth-ts",
    assignmentId: "assignment-next-auth-flow",
    assignmentTitle: "인증 플로우 UI/상태 분리",
    courseId: "course-next-ai-lms",
    courseTitle: resolveCourseTitle("course-next-ai-lms"),
    editorType: "IDE",
    codeLanguage: "typescript",
    title: "강사 제공 템플릿 - 권한 가드 스캐폴드",
    content: [
      "type Role = 'guest' | 'student' | 'instructor' | 'admin';",
      "",
      "interface GuardInput {",
      "  role: Role;",
      "  allowedRoles: Role[];",
      "}",
      "",
      "export function canAccess({ role, allowedRoles }: GuardInput) {",
      "  return allowedRoles.includes(role);",
      "}",
      "",
      "// TODO: 테스트 케이스를 추가하세요.",
    ].join("\n"),
    updatedAt: new Date(now - 10 * hour).toISOString(),
    updatedById: "instructor-seed-01",
    updatedByName: "민수 김",
  },
];

const seedTimeline: SubmissionTimelineEvent[] = [
  {
    id: "timeline-1",
    submissionId: "submission-1",
    type: "SUBMITTED",
    actorId: "student-kim-hana",
    actorName: "김하나",
    createdAt: new Date(now - 20 * hour).toISOString(),
    note: "초기 제출",
  },
  {
    id: "timeline-2",
    submissionId: "submission-2",
    type: "SUBMITTED",
    actorId: "student-demo-01",
    actorName: "데모 수강생",
    createdAt: new Date(now - 8 * hour).toISOString(),
    note: "초기 제출",
  },
  {
    id: "timeline-3",
    submissionId: "submission-2",
    type: "COMMENTED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 3 * hour).toISOString(),
    note: "코드 리팩터링 포인트 피드백 등록",
  },
  {
    id: "timeline-4",
    submissionId: "submission-2",
    type: "REVIEW_STATUS_CHANGED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 2 * hour).toISOString(),
    note: "리팩터링 가이드 보강 필요",
  },
  {
    id: "timeline-5",
    submissionId: "submission-2",
    type: "REVIEW_STATUS_CHANGED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 1 * hour).toISOString(),
    note: "수정 요청 상태 유지",
  },
  {
    id: "timeline-6",
    submissionId: "submission-2-r2",
    type: "RESUBMITTED",
    actorId: "student-demo-01",
    actorName: "데모 수강생",
    createdAt: new Date(now - 90 * 60 * 1000).toISOString(),
    note: "2차 재제출",
  },
  {
    id: "timeline-7",
    submissionId: "submission-2-r2",
    type: "COMMENTED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 70 * 60 * 1000).toISOString(),
    note: "2차 제출 일반 피드백 등록",
  },
  {
    id: "timeline-8",
    submissionId: "submission-2-r2",
    type: "COMMENTED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 68 * 60 * 1000).toISOString(),
    note: "2차 제출 코드 수정안 등록",
  },
  {
    id: "timeline-9",
    submissionId: "submission-2-r2",
    type: "REVIEW_STATUS_CHANGED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 66 * 60 * 1000).toISOString(),
    note: "보완 필요",
  },
  {
    id: "timeline-10",
    submissionId: "submission-2-r3",
    type: "RESUBMITTED",
    actorId: "student-demo-01",
    actorName: "데모 수강생",
    createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
    note: "3차 재제출",
  },
  {
    id: "timeline-11",
    submissionId: "submission-2-r3",
    type: "COMMENTED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    note: "3차 제출 리뷰 완료 코멘트",
  },
  {
    id: "timeline-12",
    submissionId: "submission-2-r3",
    type: "REVIEW_STATUS_CHANGED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 28 * 60 * 1000).toISOString(),
    note: "리뷰 완료",
  },
  {
    id: "timeline-13",
    submissionId: "submission-3",
    type: "SUBMITTED",
    actorId: "student-demo-01",
    actorName: "데모 수강생",
    createdAt: new Date(now - 6 * hour).toISOString(),
    note: "필터 스키마 과제 1차 제출",
  },
  {
    id: "timeline-14",
    submissionId: "submission-4",
    type: "SUBMITTED",
    actorId: "student-kim-hana",
    actorName: "김하나",
    createdAt: new Date(now - 5 * hour).toISOString(),
    note: "출석 API 계약 문서 과제 제출",
  },
  {
    id: "timeline-15",
    submissionId: "submission-4",
    type: "COMMENTED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 4 * hour).toISOString(),
    note: "문서 품질 양호, 에러코드 예시만 보강 권장",
  },
  {
    id: "timeline-16",
    submissionId: "submission-4",
    type: "REVIEW_STATUS_CHANGED",
    actorId: "instructor-seed-01",
    actorName: "민수 김",
    createdAt: new Date(now - 230 * 60 * 1000).toISOString(),
    note: "리뷰 완료",
  },
];

const seedVideos: InstructorUploadedVideo[] = [
  {
    id: "video-1",
    courseId: "course-next-ai-lms",
    courseTitle: resolveCourseTitle("course-next-ai-lms"),
    title: "강사 피드백 라이브 1회차",
    fileName: "feedback-session-1.mp4",
    mimeType: "video/mp4",
    sizeBytes: 128_440_221,
    uploadedAt: new Date(now - 30 * hour).toISOString(),
    uploadedById: "instructor-seed-01",
    uploadedByName: "민수 김",
  },
];

export function createInitialSubmissionDatabase(): SubmissionLocalDatabase {
  return {
    students: clone(seedStudents),
    assignments: clone(seedAssignments),
    templates: clone(seedTemplates),
    submissions: clone(seedSubmissions),
    timeline: clone(seedTimeline),
    videos: clone(seedVideos),
  };
}

export function computeSubmissionDashboardMetric(
  database: SubmissionLocalDatabase,
): SubmissionDashboardMetric {
  const expectedSubmissionCount = database.students.reduce((count, student) => {
    const assignmentCount = filterAssignmentsByCourseIds(
      database.assignments,
      student.enrolledCourseIds,
    ).length;
    return count + assignmentCount;
  }, 0);

  const latestSubmissions = getLatestSubmissions(database.submissions);
  const reviewedCount = latestSubmissions.filter(
    (submission) => submission.reviewStatus === "REVIEWED",
  ).length;
  const needsRevisionCount = latestSubmissions.filter(
    (submission) => submission.reviewStatus === "NEEDS_REVISION",
  ).length;
  const pendingReviewCount = latestSubmissions.filter(
    (submission) => submission.reviewStatus === "SUBMITTED",
  ).length;
  const submittedCount = latestSubmissions.length;

  return {
    expectedSubmissionCount,
    submittedCount,
    submissionRate: calculateRate(submittedCount, expectedSubmissionCount),
    reviewedCount,
    needsRevisionCount,
    pendingReviewCount,
  };
}

export function computeSubmissionDashboardByStudent(
  database: SubmissionLocalDatabase,
): SubmissionDashboardByStudent[] {
  const latestSubmissions = getLatestSubmissions(database.submissions);

  return database.students.map((student) => {
    const expectedSubmissionCount = filterAssignmentsByCourseIds(
      database.assignments,
      student.enrolledCourseIds,
    ).length;
    const studentSubmissions = latestSubmissions
      .filter((submission) => submission.studentId === student.id)
      .sort((a, b) => Number(new Date(b.submittedAt)) - Number(new Date(a.submittedAt)));

    return {
      studentId: student.id,
      studentName: student.name,
      expectedSubmissionCount,
      submittedCount: studentSubmissions.length,
      submissionRate: calculateRate(studentSubmissions.length, expectedSubmissionCount),
      latestSubmittedAt: studentSubmissions[0]?.submittedAt,
    };
  });
}

export function filterAssignmentsByCourseIds(
  assignments: AssignmentDefinition[],
  courseIds: string[],
) {
  const courseIdSet = new Set(courseIds);

  return assignments.filter((assignment) => courseIdSet.has(assignment.courseId));
}

export function getLatestSubmissions(submissions: AssignmentSubmission[]) {
  const latestByKey = new Map<string, AssignmentSubmission>();

  for (const submission of submissions) {
    const key = `${submission.studentId}:${submission.assignmentId}`;
    const current = latestByKey.get(key);

    if (
      !current ||
      submission.revision > current.revision ||
      Number(new Date(submission.updatedAt)) > Number(new Date(current.updatedAt))
    ) {
      latestByKey.set(key, submission);
    }
  }

  return Array.from(latestByKey.values());
}

function calculateRate(submittedCount: number, expectedCount: number) {
  if (expectedCount <= 0) {
    return 0;
  }

  return Number(((submittedCount / expectedCount) * 100).toFixed(1));
}

function resolveCourseTitle(courseId: string) {
  if (mockCourseCatalog.featuredCourse.id === courseId) {
    return mockCourseCatalog.featuredCourse.title;
  }

  return (
    mockCourseCatalog.courses.find((course) => course.id === courseId)?.title ?? "미정 과정"
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
