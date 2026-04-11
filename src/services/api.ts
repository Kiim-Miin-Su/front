import axios, { AxiosHeaders } from "axios";

import { clearStoredAuthSession, readStoredAuthSession } from "@/lib/auth-storage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const session = readStoredAuthSession();

  if (session?.accessToken) {
    const headers = config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

    headers.set("Authorization", `Bearer ${session.accessToken}`);
    config.headers = headers;
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function drainQueue(token: string | null, error: unknown) {
  for (const pending of pendingQueue) {
    if (token) {
      pending.resolve(token);
    } else {
      pending.reject(error);
    }
  }
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // refresh 요청 자체가 401이면 세션 완전 만료 → 로그아웃
    if (error.response?.status === 401 && originalRequest.url?.includes("/auth/refresh")) {
      clearStoredAuthSession();
      return Promise.reject(error);
    }

    // 다른 요청의 401: refresh 토큰으로 accessToken 재발급 1회 시도
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          const headers = originalRequest.headers instanceof AxiosHeaders
            ? originalRequest.headers
            : new AxiosHeaders(originalRequest.headers);
          headers.set("Authorization", `Bearer ${newToken}`);
          originalRequest.headers = headers;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
        const newToken = data.accessToken;

        // Zustand store에 새 토큰 반영
        const { useAuthStore } = await import("@/store/auth-store");
        useAuthStore.getState().setSession({
          accessToken: newToken,
          user: useAuthStore.getState().user,
        });

        drainQueue(newToken, null);

        const headers = originalRequest.headers instanceof AxiosHeaders
          ? originalRequest.headers
          : new AxiosHeaders(originalRequest.headers);
        headers.set("Authorization", `Bearer ${newToken}`);
        originalRequest.headers = headers;

        return api(originalRequest);
      } catch (refreshError) {
        drainQueue(null, refreshError);
        clearStoredAuthSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
