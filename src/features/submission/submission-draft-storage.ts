import type {
  SubmissionCodeLanguage,
  SubmissionEditorType,
} from "@/types/submission";

const SUBMISSION_DRAFT_STORAGE_KEY = "ai-edu-submission-drafts-v1";

export interface SubmissionDraftPayload {
  studentId: string;
  assignmentId: string;
  editorType: SubmissionEditorType;
  codeLanguage: SubmissionCodeLanguage;
  message: string;
  code: string;
  updatedAt: string;
}

type SubmissionDraftStore = Record<string, SubmissionDraftPayload>;

export function readSubmissionDraft({
  studentId,
  assignmentId,
}: {
  studentId: string;
  assignmentId: string;
}) {
  const store = readDraftStore();
  const key = createDraftKey(studentId, assignmentId);
  return store[key];
}

export function writeSubmissionDraft(draft: SubmissionDraftPayload) {
  const store = readDraftStore();
  const key = createDraftKey(draft.studentId, draft.assignmentId);
  store[key] = draft;
  writeDraftStore(store);
}

export function removeSubmissionDraft({
  studentId,
  assignmentId,
}: {
  studentId: string;
  assignmentId: string;
}) {
  const store = readDraftStore();
  const key = createDraftKey(studentId, assignmentId);
  delete store[key];
  writeDraftStore(store);
}

function createDraftKey(studentId: string, assignmentId: string) {
  return `${studentId}:${assignmentId}`;
}

function readDraftStore(): SubmissionDraftStore {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(SUBMISSION_DRAFT_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as SubmissionDraftStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDraftStore(store: SubmissionDraftStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUBMISSION_DRAFT_STORAGE_KEY, JSON.stringify(store));
}
