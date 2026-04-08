import {
  computeSubmissionDashboardByStudent,
  computeSubmissionDashboardMetric,
  createInitialSubmissionDatabase,
  filterAssignmentsByCourseIds,
  getLatestSubmissions,
  type SubmissionLocalDatabase,
} from "@/features/submission/mock-submission-data";
import { api } from "@/services/api";
import type {
  AddSubmissionFeedbackInput,
  AssignmentDefinition,
  AssignmentSubmission,
  AssignmentTemplate,
  CreateInstructorAssignmentInput,
  CreateInstructorAssignmentResult,
  CreateStudentSubmissionInput,
  InstructorSubmissionWorkspaceData,
  InstructorUploadedVideo,
  SubmissionDetailData,
  StudentSubmissionWorkspaceData,
  SubmissionCourseRef,
  SubmissionError,
  SubmissionTimelineEvent,
  UpdateInstructorAssignmentMetaInput,
  UpdateSubmissionReviewStatusInput,
  UpsertAssignmentTemplateInput,
  UploadInstructorVideoInput,
} from "@/types/submission";

const SUBMISSION_DB_STORAGE_KEY = "ai-edu-submission-db-v1";

export interface AssignmentTimelineData {
  timeline: SubmissionTimelineEvent[];
  submissionLabelById: Record<string, string>;
}

export async function fetchStudentSubmissionWorkspace({
  studentId,
  studentName,
  enrolledCourses,
}: {
  studentId: string;
  studentName: string;
  enrolledCourses: SubmissionCourseRef[];
}): Promise<StudentSubmissionWorkspaceData> {
  try {
    const { data } = await api.get<unknown>("/me/assignments/workspace");
    const normalized = normalizeStudentWorkspaceResponse(data);

    if (normalized) {
      return normalized;
    }

    throw new Error("INVALID_STUDENT_SUBMISSION_WORKSPACE_RESPONSE");
  } catch {
    const database = readSubmissionDatabase();
    const resolvedStudent = upsertStudentDirectory(database, {
      studentId,
      studentName,
      enrolledCourseIds: enrolledCourses.map((course) => course.courseId),
    });
    const assignments = filterAssignmentsByCourseIds(
      database.assignments,
      resolvedStudent.enrolledCourseIds,
    );
    const assignmentIdSet = new Set(assignments.map((assignment) => assignment.id));
    const templates = database.templates.filter((template) =>
      assignmentIdSet.has(template.assignmentId),
    );
    const submissions = database.submissions
      .filter((submission) => submission.studentId === resolvedStudent.id)
      .sort((a, b) => Number(new Date(b.submittedAt)) - Number(new Date(a.submittedAt)));

    writeSubmissionDatabase(database);

    return {
      studentId: resolvedStudent.id,
      studentName: resolvedStudent.name,
      enrolledCourses,
      assignments,
      templates,
      submissions,
    };
  }
}

export async function createStudentAssignmentSubmission(
  input: CreateStudentSubmissionInput,
): Promise<AssignmentSubmission> {
  try {
    const { data } = await api.post<AssignmentSubmission>("/me/assignments/submissions", input);
    return data;
  } catch {
    const database = readSubmissionDatabase();
    const assignment = database.assignments.find((item) => item.id === input.assignmentId);

    if (!assignment) {
      throw createSubmissionError("ASSIGNMENT_NOT_FOUND", "선택한 과제를 찾을 수 없습니다.");
    }

    if (!input.enrolledCourseIds.includes(assignment.courseId)) {
      throw createSubmissionError(
        "NOT_ENROLLED_COURSE",
        "수강 중인 과정의 과제만 제출할 수 있습니다.",
      );
    }

    const sanitizedMessage = input.message.trim();
    const sanitizedCode = input.code.trim();

    if (sanitizedMessage.length === 0 && sanitizedCode.length === 0 && input.attachments.length === 0) {
      throw createSubmissionError(
        "INVALID_SUBMISSION",
        "메시지, 코드, 파일 중 하나 이상은 제출해야 합니다.",
      );
    }

    const latest = findLatestStudentSubmission(database.submissions, input.studentId, assignment.id);
    const revision = latest ? latest.revision + 1 : 1;
    const now = new Date().toISOString();
    const submission: AssignmentSubmission = {
      id: createRecordId("submission"),
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      courseId: assignment.courseId,
      courseTitle: assignment.courseTitle,
      studentId: input.studentId,
      studentName: input.studentName,
      message: input.message,
      code: input.code,
      codeLanguage: input.codeLanguage,
      editorType: input.editorType,
      attachments: input.attachments,
      submittedAt: now,
      updatedAt: now,
      reviewStatus: "SUBMITTED",
      revision,
      feedbackHistory: [],
    };

    database.submissions.unshift(submission);
    database.timeline.unshift({
      id: createRecordId("timeline"),
      submissionId: submission.id,
      type: revision > 1 ? "RESUBMITTED" : "SUBMITTED",
      actorId: input.studentId,
      actorName: input.studentName,
      createdAt: now,
      note: revision > 1 ? `${revision}차 재제출` : "초기 제출",
    });

    upsertStudentDirectory(database, {
      studentId: input.studentId,
      studentName: input.studentName,
      enrolledCourseIds: input.enrolledCourseIds,
    });
    writeSubmissionDatabase(database);

    return submission;
  }
}

export async function fetchInstructorSubmissionWorkspace(): Promise<InstructorSubmissionWorkspaceData> {
  try {
    const { data } = await api.get<unknown>("/instructor/assignments/workspace");
    const normalized = normalizeInstructorWorkspaceResponse(data);

    if (normalized) {
      return normalized;
    }

    throw new Error("INVALID_INSTRUCTOR_SUBMISSION_WORKSPACE_RESPONSE");
  } catch {
    const database = readSubmissionDatabase();
    const latestSubmissions = getLatestSubmissions(database.submissions).sort(
      (a, b) => Number(new Date(b.submittedAt)) - Number(new Date(a.submittedAt)),
    );

    return {
      assignments: database.assignments,
      templates: database.templates,
      submissions: latestSubmissions,
      timeline: database.timeline.sort(
        (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
      ),
      videos: database.videos.sort(
        (a, b) => Number(new Date(b.uploadedAt)) - Number(new Date(a.uploadedAt)),
      ),
      dashboard: computeSubmissionDashboardMetric(database),
      dashboardByStudent: computeSubmissionDashboardByStudent(database).sort(
        (a, b) => a.submissionRate - b.submissionRate,
      ),
    };
  }
}

export async function fetchSubmissionDetail(submissionId: string): Promise<SubmissionDetailData> {
  try {
    const { data } = await api.get<unknown>(`/submissions/${submissionId}`);
    const normalized = normalizeSubmissionDetailResponse(data);

    if (normalized) {
      return normalized;
    }

    throw new Error("INVALID_SUBMISSION_DETAIL_RESPONSE");
  } catch {
    const database = readSubmissionDatabase();
    const submission = database.submissions.find((item) => item.id === submissionId);

    if (!submission) {
      throw createSubmissionError("SUBMISSION_NOT_FOUND", "선택한 제출 이력을 찾을 수 없습니다.");
    }

    const revisionHistory = database.submissions
      .filter(
        (item) =>
          item.assignmentId === submission.assignmentId && item.studentId === submission.studentId,
      )
      .sort(
        (a, b) =>
          b.revision - a.revision ||
          Number(new Date(b.submittedAt)) - Number(new Date(a.submittedAt)),
      );
    const revisionIdSet = new Set(revisionHistory.map((item) => item.id));
    const assignment = database.assignments.find((item) => item.id === submission.assignmentId);
    const timeline = database.timeline
      .filter((event) => event.submissionId && revisionIdSet.has(event.submissionId))
      .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));

    return {
      submission,
      assignment,
      revisionHistory,
      timeline,
    };
  }
}

export async function fetchAssignmentTimelineByAssignmentId(
  assignmentId: string,
): Promise<AssignmentTimelineData> {
  try {
    const { data } = await api.get<unknown>(`/instructor/assignments/${assignmentId}/timeline`);
    const normalized = normalizeAssignmentTimelineResponse(data);

    if (normalized) {
      return normalized;
    }

    throw new Error("INVALID_ASSIGNMENT_TIMELINE_RESPONSE");
  } catch {
    const database = readSubmissionDatabase();
    const assignmentSubmissions = database.submissions
      .filter((submission) => submission.assignmentId === assignmentId)
      .sort((a, b) => Number(new Date(b.submittedAt)) - Number(new Date(a.submittedAt)));
    const submissionIdSet = new Set(assignmentSubmissions.map((item) => item.id));
    const timeline = database.timeline
      .filter((event) => event.submissionId && submissionIdSet.has(event.submissionId))
      .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
    const submissionLabelById = assignmentSubmissions.reduce<Record<string, string>>((acc, item) => {
      acc[item.id] = `${item.studentName} · ${item.assignmentTitle}`;
      return acc;
    }, {});

    return {
      timeline,
      submissionLabelById,
    };
  }
}

export async function updateInstructorAssignmentMeta(
  input: UpdateInstructorAssignmentMetaInput,
): Promise<AssignmentDefinition> {
  try {
    const { data } = await api.patch<AssignmentDefinition>(
      `/instructor/assignments/${input.assignmentId}`,
      {
        title: input.title,
        prompt: input.prompt,
        dueAt: input.dueAt,
        allowFileUpload: input.allowFileUpload,
        allowCodeEditor: input.allowCodeEditor,
      },
    );
    return data;
  } catch {
    const database = readSubmissionDatabase();
    const target = database.assignments.find((assignment) => assignment.id === input.assignmentId);

    if (!target) {
      throw createSubmissionError("ASSIGNMENT_NOT_FOUND", "선택한 과제를 찾을 수 없습니다.");
    }

    const updatedAssignment: AssignmentDefinition = {
      ...target,
      title: input.title.trim() || target.title,
      prompt:
        input.prompt === undefined
          ? target.prompt
          : input.prompt.trim().length > 0
            ? input.prompt.trim()
            : target.prompt,
      dueAt: input.dueAt,
      allowFileUpload: input.allowFileUpload ?? target.allowFileUpload,
      allowCodeEditor: input.allowCodeEditor ?? target.allowCodeEditor,
    };
    const assignmentIndex = database.assignments.findIndex(
      (assignment) => assignment.id === updatedAssignment.id,
    );
    database.assignments[assignmentIndex] = updatedAssignment;

    // 과제 제목이 바뀌면 해당 과제 제출/템플릿 표시값도 동기화한다.
    database.submissions = database.submissions.map((submission) =>
      submission.assignmentId === updatedAssignment.id
        ? {
            ...submission,
            assignmentTitle: updatedAssignment.title,
          }
        : submission,
    );
    database.templates = database.templates.map((template) =>
      template.assignmentId === updatedAssignment.id
        ? {
            ...template,
            assignmentTitle: updatedAssignment.title,
          }
        : template,
    );
    database.timeline.unshift({
      id: createRecordId("timeline"),
      type: "COMMENTED",
      actorId: input.actorId,
      actorName: input.actorName,
      createdAt: new Date().toISOString(),
      note: `과제 수정: ${updatedAssignment.courseTitle} · ${updatedAssignment.title}`,
    });
    writeSubmissionDatabase(database);

    return updatedAssignment;
  }
}

export async function createInstructorAssignment(
  input: CreateInstructorAssignmentInput,
): Promise<CreateInstructorAssignmentResult> {
  try {
    const { data } = await api.post<unknown>("/instructor/assignments", input);
    const normalized = normalizeCreateInstructorAssignmentResponse(data);

    if (normalized) {
      return normalized;
    }

    throw new Error("INVALID_CREATE_INSTRUCTOR_ASSIGNMENT_RESPONSE");
  } catch {
    const database = readSubmissionDatabase();
    const now = new Date().toISOString();
    const title = input.title.trim();
    const prompt = input.prompt.trim();

    if (title.length === 0 || prompt.length === 0) {
      throw createSubmissionError("INVALID_SUBMISSION", "과제 제목과 설명을 입력하세요.");
    }

    const assignment: AssignmentDefinition = {
      id: createRecordId("assignment"),
      courseId: input.courseId,
      courseTitle: input.courseTitle,
      title,
      prompt,
      dueAt: input.dueAt,
      createdAt: now,
      allowFileUpload: input.allowFileUpload,
      allowCodeEditor: input.allowCodeEditor,
    };
    database.assignments.unshift(assignment);

    let template: AssignmentTemplate | undefined;
    const initialTemplate = input.initialTemplate;

    if (initialTemplate && initialTemplate.content.trim().length > 0) {
      template = {
        id: createRecordId("template"),
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        courseId: assignment.courseId,
        courseTitle: assignment.courseTitle,
        editorType: initialTemplate.editorType,
        codeLanguage: initialTemplate.codeLanguage,
        title: initialTemplate.title.trim() || `${assignment.title} 템플릿`,
        content: initialTemplate.content,
        updatedAt: now,
        updatedById: input.actorId,
        updatedByName: input.actorName,
      };
      database.templates.unshift(template);
    }

    database.timeline.unshift({
      id: createRecordId("timeline"),
      type: "COMMENTED",
      actorId: input.actorId,
      actorName: input.actorName,
      createdAt: now,
      note: `과제 등록: ${assignment.courseTitle} · ${assignment.title}`,
    });

    if (template) {
      database.timeline.unshift({
        id: createRecordId("timeline"),
        type: "COMMENTED",
        actorId: input.actorId,
        actorName: input.actorName,
        createdAt: now,
        note: `초기 템플릿 등록: ${template.title} (${template.editorType}/${template.codeLanguage})`,
      });
    }

    writeSubmissionDatabase(database);

    return {
      assignment,
      template,
    };
  }
}

export async function updateSubmissionReviewStatus(
  input: UpdateSubmissionReviewStatusInput,
): Promise<AssignmentSubmission> {
  try {
    const { data } = await api.patch<AssignmentSubmission>(
      `/instructor/assignments/submissions/${input.submissionId}`,
      {
        reviewStatus: input.reviewStatus,
        comment: input.comment,
      },
    );
    return data;
  } catch {
    const database = readSubmissionDatabase();
    const target = database.submissions.find((submission) => submission.id === input.submissionId);

    if (!target) {
      throw createSubmissionError("SUBMISSION_NOT_FOUND", "선택한 제출 이력을 찾을 수 없습니다.");
    }

    const updatedAt = new Date().toISOString();
    const updated: AssignmentSubmission = {
      ...target,
      reviewStatus: input.reviewStatus,
      updatedAt,
    };
    const index = database.submissions.findIndex((submission) => submission.id === input.submissionId);
    database.submissions[index] = updated;
    database.timeline.unshift({
      id: createRecordId("timeline"),
      submissionId: updated.id,
      type: "REVIEW_STATUS_CHANGED",
      actorId: input.actorId,
      actorName: input.actorName,
      createdAt: updatedAt,
      note: input.comment ?? statusLabelByReviewState(input.reviewStatus),
    });
    writeSubmissionDatabase(database);

    return updated;
  }
}

export async function upsertInstructorAssignmentTemplate(
  input: UpsertAssignmentTemplateInput,
): Promise<AssignmentTemplate> {
  try {
    const { data } = await api.put<AssignmentTemplate>(
      `/instructor/assignments/${input.assignmentId}/template`,
      {
        editorType: input.editorType,
        codeLanguage: input.codeLanguage,
        title: input.title,
        content: input.content,
      },
    );
    return data;
  } catch {
    const database = readSubmissionDatabase();
    const assignment = database.assignments.find((item) => item.id === input.assignmentId);

    if (!assignment) {
      throw createSubmissionError("ASSIGNMENT_NOT_FOUND", "선택한 과제를 찾을 수 없습니다.");
    }

    const updatedAt = new Date().toISOString();
    const existingIndex = database.templates.findIndex(
      (template) =>
        template.assignmentId === input.assignmentId &&
        template.editorType === input.editorType &&
        template.codeLanguage === input.codeLanguage,
    );

    const upserted: AssignmentTemplate = {
      id: existingIndex >= 0 ? database.templates[existingIndex].id : createRecordId("template"),
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      courseId: assignment.courseId,
      courseTitle: assignment.courseTitle,
      editorType: input.editorType,
      codeLanguage: input.codeLanguage,
      title: input.title.trim() || `${assignment.title} 템플릿`,
      content: input.content,
      updatedAt,
      updatedById: input.actorId,
      updatedByName: input.actorName,
    };

    if (existingIndex >= 0) {
      database.templates[existingIndex] = upserted;
    } else {
      database.templates.unshift(upserted);
    }

    database.timeline.unshift({
      id: createRecordId("timeline"),
      type: "COMMENTED",
      actorId: input.actorId,
      actorName: input.actorName,
      createdAt: updatedAt,
      note: `템플릿 업데이트: ${assignment.title} (${input.editorType}/${input.codeLanguage})`,
    });
    writeSubmissionDatabase(database);

    return upserted;
  }
}

export async function addSubmissionFeedback(
  input: AddSubmissionFeedbackInput,
): Promise<AssignmentSubmission> {
  try {
    const { data } = await api.post<AssignmentSubmission>(
      `/instructor/assignments/submissions/${input.submissionId}/feedback`,
      {
        messageFormat: input.messageFormat,
        entryType: input.entryType,
        message: input.message,
        code: input.code,
        codeLanguage: input.codeLanguage,
        attachments: input.attachments,
        reviewStatus: input.reviewStatus,
      },
    );
    return data;
  } catch {
    const database = readSubmissionDatabase();
    const target = database.submissions.find((submission) => submission.id === input.submissionId);

    if (!target) {
      throw createSubmissionError("SUBMISSION_NOT_FOUND", "선택한 제출 이력을 찾을 수 없습니다.");
    }

    const now = new Date().toISOString();
    const feedbackEntry = {
      id: createRecordId("feedback"),
      reviewerId: input.reviewerId,
      reviewerName: input.reviewerName,
      messageFormat: input.messageFormat ?? "TEXT",
      entryType: input.entryType ?? "GENERAL",
      message: input.message,
      code: input.code,
      codeLanguage: input.codeLanguage,
      attachments: input.attachments,
      createdAt: now,
    };
    const updated: AssignmentSubmission = {
      ...target,
      feedbackHistory: [feedbackEntry, ...(target.feedbackHistory ?? [])],
      updatedAt: now,
      reviewStatus: input.reviewStatus ?? target.reviewStatus,
    };
    const index = database.submissions.findIndex((submission) => submission.id === target.id);
    database.submissions[index] = updated;
    database.timeline.unshift({
      id: createRecordId("timeline"),
      submissionId: updated.id,
      type: "COMMENTED",
      actorId: input.reviewerId,
      actorName: input.reviewerName,
      createdAt: now,
      note: input.message.trim().slice(0, 120) || "피드백 등록",
    });

    if (input.reviewStatus) {
      database.timeline.unshift({
        id: createRecordId("timeline"),
        submissionId: updated.id,
        type: "REVIEW_STATUS_CHANGED",
        actorId: input.reviewerId,
        actorName: input.reviewerName,
        createdAt: now,
        note: statusLabelByReviewState(input.reviewStatus),
      });
    }

    writeSubmissionDatabase(database);

    return updated;
  }
}

export async function uploadInstructorVideo(
  input: UploadInstructorVideoInput,
): Promise<InstructorUploadedVideo> {
  try {
    const { data } = await api.post<InstructorUploadedVideo>("/instructor/videos/upload", input);
    return data;
  } catch {
    const database = readSubmissionDatabase();
    const uploadedAt = new Date().toISOString();
    const video: InstructorUploadedVideo = {
      id: createRecordId("video"),
      ...input,
      uploadedAt,
    };

    database.videos.unshift(video);
    database.timeline.unshift({
      id: createRecordId("timeline"),
      type: "VIDEO_UPLOADED",
      actorId: input.uploadedById,
      actorName: input.uploadedByName,
      createdAt: uploadedAt,
      note: `${input.courseTitle} · ${input.title}`,
    });
    writeSubmissionDatabase(database);

    return video;
  }
}

function readSubmissionDatabase(): SubmissionLocalDatabase {
  if (typeof window === "undefined") {
    return normalizeSubmissionDatabase(createInitialSubmissionDatabase());
  }

  const raw = window.localStorage.getItem(SUBMISSION_DB_STORAGE_KEY);

  if (!raw) {
    const initial = normalizeSubmissionDatabase(createInitialSubmissionDatabase());
    writeSubmissionDatabase(initial);
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as SubmissionLocalDatabase;

    if (!isValidSubmissionDatabase(parsed)) {
      const initial = normalizeSubmissionDatabase(createInitialSubmissionDatabase());
      writeSubmissionDatabase(initial);
      return initial;
    }

    const normalized = normalizeSubmissionDatabase(parsed);
    writeSubmissionDatabase(normalized);
    return normalized;
  } catch {
    const initial = normalizeSubmissionDatabase(createInitialSubmissionDatabase());
    writeSubmissionDatabase(initial);
    return initial;
  }
}

function writeSubmissionDatabase(database: SubmissionLocalDatabase) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUBMISSION_DB_STORAGE_KEY, JSON.stringify(database));
}

function upsertStudentDirectory(
  database: SubmissionLocalDatabase,
  student: {
    studentId: string;
    studentName: string;
    enrolledCourseIds: string[];
  },
) {
  const existing = database.students.find((item) => item.id === student.studentId);

  if (!existing) {
    const inserted = {
      id: student.studentId,
      name: student.studentName,
      enrolledCourseIds: [...new Set(student.enrolledCourseIds)],
    };
    database.students.push(inserted);
    return inserted;
  }

  existing.name = student.studentName;
  existing.enrolledCourseIds = [...new Set(student.enrolledCourseIds)];
  return existing;
}

function findLatestStudentSubmission(
  submissions: AssignmentSubmission[],
  studentId: string,
  assignmentId: string,
) {
  return submissions
    .filter((submission) => submission.studentId === studentId && submission.assignmentId === assignmentId)
    .sort((a, b) => b.revision - a.revision || Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))[0];
}

function createRecordId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

function normalizeSubmissionDatabase(database: SubmissionLocalDatabase): SubmissionLocalDatabase {
  const seeded = createInitialSubmissionDatabase();
  const merged = {
    ...database,
    // 신규 mock 데이터가 추가되어도 기존 localStorage 사용자에게 보이도록 id 기준 병합한다.
    students: mergeById(seeded.students, database.students ?? []),
    assignments: mergeById(seeded.assignments, database.assignments ?? []),
    templates: mergeById(seeded.templates, database.templates ?? []),
    submissions: mergeById(seeded.submissions, database.submissions ?? []),
    timeline: mergeById(seeded.timeline, database.timeline ?? []),
    videos: mergeById(seeded.videos, database.videos ?? []),
  };

  return {
    ...merged,
    templates: (merged.templates ?? []).map((template) => ({
      ...template,
      ...normalizeLegacyInstructorActor(template.updatedById, template.updatedByName, {
        idKey: "updatedById",
        nameKey: "updatedByName",
      }),
      codeLanguage: template.codeLanguage ?? "plaintext",
      title: template.title ?? `${template.assignmentTitle ?? "과제"} 템플릿`,
      content: template.content ?? "",
    })),
    submissions: merged.submissions.map((submission) => ({
      ...submission,
      codeLanguage:
        submission.codeLanguage ??
        (submission.editorType === "IDE" ? "typescript" : "plaintext"),
      feedbackHistory: (submission.feedbackHistory ?? []).map((feedback) => ({
        ...feedback,
        ...normalizeLegacyInstructorActor(feedback.reviewerId, feedback.reviewerName, {
          idKey: "reviewerId",
          nameKey: "reviewerName",
        }),
        messageFormat: feedback.messageFormat ?? "TEXT",
        entryType: feedback.entryType ?? "GENERAL",
        codeLanguage: feedback.codeLanguage ?? "plaintext",
        attachments: feedback.attachments ?? [],
      })),
    })),
    timeline: (merged.timeline ?? []).map((event) => ({
      ...event,
      ...normalizeLegacyInstructorActor(event.actorId, event.actorName, {
        idKey: "actorId",
        nameKey: "actorName",
      }),
    })),
    videos: (merged.videos ?? []).map((video) => ({
      ...video,
      ...normalizeLegacyInstructorActor(video.uploadedById, video.uploadedByName, {
        idKey: "uploadedById",
        nameKey: "uploadedByName",
      }),
    })),
  };
}

function normalizeLegacyInstructorActor<
  TIdKey extends string = "id",
  TNameKey extends string = "name",
>(
  actorId: string,
  actorName: string,
  keys?: { idKey: TIdKey; nameKey: TNameKey },
) {
  const shouldNormalize =
    actorId === "instructor-seed-01" ||
    actorName === "민수 김" ||
    actorName === "개발 강사" ||
    actorName === "개발용 강사";

  const resolvedId = shouldNormalize ? "instructor-dev-01" : actorId;
  const resolvedName = shouldNormalize ? "개발용 강사" : actorName;
  const idKey = keys?.idKey ?? ("id" as TIdKey);
  const nameKey = keys?.nameKey ?? ("name" as TNameKey);

  return {
    [idKey]: resolvedId,
    [nameKey]: resolvedName,
  } as Record<TIdKey | TNameKey, string>;
}

function mergeById<T extends { id: string }>(seedItems: T[], currentItems: T[]) {
  const map = new Map<string, T>();

  seedItems.forEach((item) => {
    map.set(item.id, item);
  });
  currentItems.forEach((item) => {
    map.set(item.id, item);
  });

  return Array.from(map.values());
}

function statusLabelByReviewState(status: AssignmentSubmission["reviewStatus"]) {
  if (status === "REVIEWED") {
    return "리뷰 완료";
  }

  if (status === "NEEDS_REVISION") {
    return "수정 요청";
  }

  return "재검토";
}

function createSubmissionError(code: SubmissionError["code"], message: string) {
  return {
    code,
    message,
  } satisfies SubmissionError;
}

function isValidSubmissionDatabase(value: unknown): value is SubmissionLocalDatabase {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as SubmissionLocalDatabase;

  return (
    Array.isArray(candidate.students) &&
    Array.isArray(candidate.assignments) &&
    Array.isArray(candidate.templates) &&
    Array.isArray(candidate.submissions) &&
    Array.isArray(candidate.timeline) &&
    Array.isArray(candidate.videos)
  );
}

function normalizeStudentWorkspaceResponse(data: unknown): StudentSubmissionWorkspaceData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    studentId?: unknown;
    studentName?: unknown;
    enrolledCourses?: unknown;
    assignments?: unknown;
    templates?: unknown;
    submissions?: unknown;
  };

  if (
    typeof raw.studentId !== "string" ||
    typeof raw.studentName !== "string" ||
    !Array.isArray(raw.enrolledCourses) ||
    !Array.isArray(raw.assignments) ||
    !Array.isArray(raw.templates) ||
    !Array.isArray(raw.submissions)
  ) {
    return null;
  }

  return {
    studentId: raw.studentId,
    studentName: raw.studentName,
    enrolledCourses: raw.enrolledCourses as SubmissionCourseRef[],
    assignments: raw.assignments as AssignmentDefinition[],
    templates: raw.templates as AssignmentTemplate[],
    submissions: raw.submissions as AssignmentSubmission[],
  };
}

function normalizeInstructorWorkspaceResponse(data: unknown): InstructorSubmissionWorkspaceData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    assignments?: unknown;
    templates?: unknown;
    submissions?: unknown;
    timeline?: unknown;
    videos?: unknown;
    dashboard?: unknown;
    dashboardByStudent?: unknown;
  };

  if (
    !Array.isArray(raw.assignments) ||
    !Array.isArray(raw.templates) ||
    !Array.isArray(raw.submissions) ||
    !Array.isArray(raw.timeline) ||
    !Array.isArray(raw.videos) ||
    !raw.dashboard ||
    !Array.isArray(raw.dashboardByStudent)
  ) {
    return null;
  }

  return {
    assignments: raw.assignments as AssignmentDefinition[],
    templates: raw.templates as AssignmentTemplate[],
    submissions: raw.submissions as AssignmentSubmission[],
    timeline: raw.timeline as SubmissionTimelineEvent[],
    videos: raw.videos as InstructorUploadedVideo[],
    dashboard: raw.dashboard as InstructorSubmissionWorkspaceData["dashboard"],
    dashboardByStudent: raw.dashboardByStudent as InstructorSubmissionWorkspaceData["dashboardByStudent"],
  };
}

function normalizeSubmissionDetailResponse(data: unknown): SubmissionDetailData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    submission?: unknown;
    assignment?: unknown;
    revisionHistory?: unknown;
    timeline?: unknown;
  };

  if (!raw.submission || !Array.isArray(raw.revisionHistory) || !Array.isArray(raw.timeline)) {
    return null;
  }

  return {
    submission: raw.submission as AssignmentSubmission,
    assignment: raw.assignment as AssignmentDefinition | undefined,
    revisionHistory: raw.revisionHistory as AssignmentSubmission[],
    timeline: raw.timeline as SubmissionTimelineEvent[],
  };
}

function normalizeAssignmentTimelineResponse(data: unknown): AssignmentTimelineData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    timeline?: unknown;
    submissionLabelById?: unknown;
  };

  if (!Array.isArray(raw.timeline)) {
    return null;
  }

  const submissionLabelById =
    raw.submissionLabelById && typeof raw.submissionLabelById === "object"
      ? Object.entries(raw.submissionLabelById as Record<string, unknown>).reduce<Record<string, string>>(
          (acc, [submissionId, label]) => {
            if (typeof label === "string") {
              acc[submissionId] = label;
            }
            return acc;
          },
          {},
        )
      : {};

  return {
    timeline: raw.timeline as SubmissionTimelineEvent[],
    submissionLabelById,
  };
}

function normalizeCreateInstructorAssignmentResponse(
  data: unknown,
): CreateInstructorAssignmentResult | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    assignment?: unknown;
    template?: unknown;
    id?: unknown;
    courseId?: unknown;
    courseTitle?: unknown;
    title?: unknown;
    prompt?: unknown;
  };

  if (raw.assignment && typeof raw.assignment === "object") {
    return {
      assignment: raw.assignment as AssignmentDefinition,
      template: (raw.template as AssignmentTemplate | undefined) ?? undefined,
    };
  }

  if (
    typeof raw.id === "string" &&
    typeof raw.courseId === "string" &&
    typeof raw.courseTitle === "string" &&
    typeof raw.title === "string" &&
    typeof raw.prompt === "string"
  ) {
    return {
      assignment: raw as AssignmentDefinition,
      template: undefined,
    };
  }

  return null;
}
