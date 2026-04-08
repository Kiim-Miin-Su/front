import type {
  AssignmentDefinition,
  AssignmentTemplate,
  SubmissionCodeLanguage,
  SubmissionEditorType,
} from "@/types/submission";

const recommendedLanguageByCourseId: Record<string, SubmissionCodeLanguage> = {
  "course-next-ai-lms": "typescript",
  "course-react-state": "typescript",
  "course-spring-lms-api": "java",
  "course-llm-study-assistant": "python",
  "course-sql-learning-analytics": "sql",
};

export function resolveRecommendedSubmissionLanguage(assignment?: AssignmentDefinition) {
  if (!assignment) {
    return "typescript" as const;
  }

  return recommendedLanguageByCourseId[assignment.courseId] ?? "typescript";
}

export function buildSubmissionTemplate({
  assignment,
  editorType,
  language,
}: {
  assignment?: AssignmentDefinition;
  editorType: SubmissionEditorType;
  language: SubmissionCodeLanguage;
}) {
  const title = assignment?.title ?? "과제 제목";
  const prompt = assignment?.prompt ?? "과제 설명";

  if (editorType === "NOTE") {
    return [
      `# ${title} 제출 노트`,
      "",
      "## 구현/작성 요약",
      "- ",
      "",
      "## 핵심 결정",
      "- ",
      "",
      "## 검토 요청 사항",
      "- ",
      "",
      "## 참고",
      prompt,
    ].join("\n");
  }

  if (language === "typescript" || language === "javascript") {
    return [
      `/**`,
      ` * ${title}`,
      ` * ${prompt}`,
      ` */`,
      "",
      "export function solveAssignment() {",
      "  // TODO: implement",
      "}",
      "",
      "console.log(solveAssignment());",
    ].join("\n");
  }

  if (language === "python") {
    return [
      `"""`,
      `${title}`,
      `${prompt}`,
      `"""`,
      "",
      "def solve_assignment():",
      "    # TODO: implement",
      "    return None",
      "",
      "if __name__ == '__main__':",
      "    print(solve_assignment())",
    ].join("\n");
  }

  if (language === "java") {
    return [
      `// ${title}`,
      `// ${prompt}`,
      "",
      "public class AssignmentSolution {",
      "  public static void main(String[] args) {",
      "    // TODO: implement",
      "  }",
      "}",
    ].join("\n");
  }

  if (language === "sql") {
    return [
      `-- ${title}`,
      `-- ${prompt}`,
      "",
      "-- TODO: write query",
      "SELECT",
      "  *",
      "FROM table_name;",
    ].join("\n");
  }

  if (language === "markdown") {
    return [
      `# ${title}`,
      "",
      prompt,
      "",
      "## 구현 메모",
      "- ",
      "",
      "## 검토 요청",
      "- ",
    ].join("\n");
  }

  return [
    `${title}`,
    "",
    prompt,
    "",
    "TODO:",
    "- ",
  ].join("\n");
}

export function findInstructorTemplate({
  templates,
  assignmentId,
  editorType,
  language,
}: {
  templates: AssignmentTemplate[];
  assignmentId?: string;
  editorType: SubmissionEditorType;
  language: SubmissionCodeLanguage;
}) {
  if (!assignmentId) {
    return undefined;
  }

  return templates
    .filter(
      (template) =>
        template.assignmentId === assignmentId &&
        template.editorType === editorType &&
        template.codeLanguage === language,
    )
    .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))[0];
}
