import type { AuthUser, UserRole } from "@/types/auth";

/**
 * 런타임에서 인증 세션이 비어 있을 때 사용할 기본 actor.
 * - 개발 단계에서 화면 흐름을 유지하기 위한 fallback이며
 * - 실제 운영에서는 백엔드 세션 사용자로 대체되어야 한다.
 */
const runtimeFallbackActorByRole: Record<Exclude<UserRole, "guest">, { id: string; name: string }> = {
  student: {
    id: "student-demo-01",
    name: "데모 수강생",
  },
  assistant: {
    id: "assistant-dev-01",
    name: "개발용 조교",
  },
  instructor: {
    id: "instructor-dev-01",
    name: "개발용 강사",
  },
  admin: {
    id: "admin-dev-01",
    name: "개발용 관리자",
  },
};

export function resolveRuntimeActor(
  user: AuthUser | null | undefined,
  roleHint: Exclude<UserRole, "guest">,
) {
  if (user) {
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      isFallback: false,
    };
  }

  const fallback = runtimeFallbackActorByRole[roleHint];

  return {
    id: fallback.id,
    name: fallback.name,
    role: roleHint,
    isFallback: true,
  };
}
