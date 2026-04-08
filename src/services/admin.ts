import { fetchCourseCatalog } from "@/services/course";
import { api } from "@/services/api";
import type {
  AdminInstructorCourseAssignment,
  AdminInstructorCourseRef,
  AdminInstructorCourseWorkspace,
} from "@/types/admin";

const INSTRUCTOR_COURSE_STORAGE_KEY = "ai-edu-admin-instructor-course-map-v1";

export async function fetchAdminInstructorCourseWorkspace(): Promise<AdminInstructorCourseWorkspace> {
  try {
    const { data } = await api.get<unknown>("/admin/instructor-courses/workspace");
    const normalized = normalizeInstructorCourseWorkspace(data);

    if (normalized) {
      persistInstructorAssignments(normalized.instructors);
      return normalized;
    }

    throw new Error("INVALID_ADMIN_INSTRUCTOR_WORKSPACE");
  } catch {
    return buildFallbackInstructorCourseWorkspace();
  }
}

export async function updateInstructorCourseAssignment(input: {
  instructorId: string;
  assignedCourseIds: string[];
}): Promise<AdminInstructorCourseAssignment> {
  try {
    const { data } = await api.put<unknown>(
      `/admin/instructors/${input.instructorId}/courses`,
      {
        assignedCourseIds: input.assignedCourseIds,
      },
    );
    const normalized = normalizeSingleInstructorAssignment(data);

    if (normalized) {
      upsertInstructorAssignment(normalized);
      return normalized;
    }

    throw new Error("INVALID_ADMIN_INSTRUCTOR_UPDATE");
  } catch {
    const workspace = await buildFallbackInstructorCourseWorkspace();
    const target = workspace.instructors.find((instructor) => instructor.instructorId === input.instructorId);

    if (!target) {
      throw new Error("강사 정보를 찾을 수 없습니다.");
    }

    const updated: AdminInstructorCourseAssignment = {
      ...target,
      assignedCourseIds: Array.from(new Set(input.assignedCourseIds)),
    };
    upsertInstructorAssignment(updated);
    return updated;
  }
}

async function buildFallbackInstructorCourseWorkspace(): Promise<AdminInstructorCourseWorkspace> {
  const catalog = await fetchCourseCatalog();
  const courseSeeds = [catalog.featuredCourse, ...catalog.courses];
  const courses: AdminInstructorCourseRef[] = courseSeeds.map((course) => ({
    courseId: course.id,
    courseTitle: course.title,
    category: course.category,
  }));
  const byInstructor = new Map<string, AdminInstructorCourseAssignment>();

  courses.forEach((course, index) => {
    const source = courseSeeds[index];
    const instructorName = source.instructor.name;
    const instructorTitle = source.instructor.title;
    const instructorId = buildInstructorId(instructorName);
    const current = byInstructor.get(instructorId);

    if (current) {
      current.assignedCourseIds = Array.from(
        new Set([...current.assignedCourseIds, course.courseId]),
      );
      return;
    }

    byInstructor.set(instructorId, {
      instructorId,
      instructorName,
      instructorTitle,
      assignedCourseIds: [course.courseId],
    });
  });

  const stored = readInstructorAssignmentMap();
  const instructors = Array.from(byInstructor.values())
    .map((instructor) => {
      const storedCourseIds = stored[instructor.instructorId];

      if (!storedCourseIds) {
        return instructor;
      }

      return {
        ...instructor,
        assignedCourseIds: Array.from(new Set(storedCourseIds)),
      };
    })
    .sort((a, b) => a.instructorName.localeCompare(b.instructorName, "ko"));

  persistInstructorAssignments(instructors);

  return {
    courses,
    instructors,
  };
}

function normalizeInstructorCourseWorkspace(data: unknown): AdminInstructorCourseWorkspace | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as Record<string, unknown>;
  const rawCourses = Array.isArray(raw.courses) ? raw.courses : null;
  const rawInstructors = Array.isArray(raw.instructors) ? raw.instructors : null;

  if (!rawCourses || !rawInstructors) {
    return null;
  }

  const courses = rawCourses
    .map((item) => normalizeCourseRef(item))
    .filter((item): item is AdminInstructorCourseRef => Boolean(item));
  const instructors = rawInstructors
    .map((item) => normalizeSingleInstructorAssignment(item))
    .filter((item): item is AdminInstructorCourseAssignment => Boolean(item));

  return {
    courses,
    instructors,
  };
}

function normalizeCourseRef(data: unknown): AdminInstructorCourseRef | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as Record<string, unknown>;

  if (typeof raw.courseId !== "string" || typeof raw.courseTitle !== "string") {
    return null;
  }

  return {
    courseId: raw.courseId,
    courseTitle: raw.courseTitle,
    category: typeof raw.category === "string" ? raw.category : "기타",
  };
}

function normalizeSingleInstructorAssignment(data: unknown): AdminInstructorCourseAssignment | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as Record<string, unknown>;
  const rawAssignedCourseIds = Array.isArray(raw.assignedCourseIds) ? raw.assignedCourseIds : [];

  if (typeof raw.instructorId !== "string" || typeof raw.instructorName !== "string") {
    return null;
  }

  return {
    instructorId: raw.instructorId,
    instructorName: raw.instructorName,
    instructorTitle: typeof raw.instructorTitle === "string" ? raw.instructorTitle : "Instructor",
    assignedCourseIds: rawAssignedCourseIds.filter(
      (courseId): courseId is string => typeof courseId === "string",
    ),
  };
}

function readInstructorAssignmentMap() {
  if (typeof window === "undefined") {
    return {} as Record<string, string[]>;
  }

  const raw = window.localStorage.getItem(INSTRUCTOR_COURSE_STORAGE_KEY);

  if (!raw) {
    return {} as Record<string, string[]>;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: Record<string, string[]> = {};

    Object.entries(parsed).forEach(([instructorId, value]) => {
      if (!Array.isArray(value)) {
        return;
      }

      result[instructorId] = value.filter((courseId): courseId is string => typeof courseId === "string");
    });

    return result;
  } catch {
    return {} as Record<string, string[]>;
  }
}

function persistInstructorAssignments(instructors: AdminInstructorCourseAssignment[]) {
  if (typeof window === "undefined") {
    return;
  }

  const map = instructors.reduce<Record<string, string[]>>((acc, instructor) => {
    acc[instructor.instructorId] = Array.from(new Set(instructor.assignedCourseIds));
    return acc;
  }, {});

  window.localStorage.setItem(INSTRUCTOR_COURSE_STORAGE_KEY, JSON.stringify(map));
}

function upsertInstructorAssignment(instructor: AdminInstructorCourseAssignment) {
  if (typeof window === "undefined") {
    return;
  }

  const map = readInstructorAssignmentMap();
  map[instructor.instructorId] = Array.from(new Set(instructor.assignedCourseIds));
  window.localStorage.setItem(INSTRUCTOR_COURSE_STORAGE_KEY, JSON.stringify(map));
}

function buildInstructorId(name: string) {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "-");
  return `instructor-${normalized || "unknown"}`;
}

