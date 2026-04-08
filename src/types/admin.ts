export interface AdminInstructorCourseRef {
  courseId: string;
  courseTitle: string;
  category: string;
}

export interface AdminInstructorCourseAssignment {
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  assignedCourseIds: string[];
}

export interface AdminInstructorCourseWorkspace {
  courses: AdminInstructorCourseRef[];
  instructors: AdminInstructorCourseAssignment[];
}

