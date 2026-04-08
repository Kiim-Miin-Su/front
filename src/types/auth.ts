export type UserRole = "guest" | "student" | "assistant" | "instructor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, "guest">;
}

export interface AuthSession {
  accessToken: string | null;
  user: AuthUser | null;
}
