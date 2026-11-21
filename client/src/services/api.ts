import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, User } from "../types/auth.types";

let accessToken: string | null = null;

const BASE_URL = import.meta.env.PROD
    ? "/api"
    : import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const isLoginOrRegistrationRequest = (url?: string) =>
    url?.includes("/auth/login") || url?.includes("/auth/register");

const isDeactivatedAgentError = (error: AxiosError) => {
    const data: unknown = error.response?.data;

    return (
        error.response?.status === 403 &&
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        data.message ===
            "Your account has been deactivated. Contact an administrator."
    );
};

const expireClientSession = () => {
    setAccessToken(null);

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:session-expired"));
    }
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const request = error.config as RetriableRequestConfig | undefined;

        if (isDeactivatedAgentError(error)) {
            expireClientSession();
            return Promise.reject(error);
        }

        if (
            error.response?.status !== 401 ||
            !request ||
            request._retry ||
            isLoginOrRegistrationRequest(request.url)
        ) {
            return Promise.reject(error);
        }

        request._retry = true;

        try {
            await refreshAccessToken();
            return await api.request(request);
        } catch (refreshError) {
            expireClientSession();
            return Promise.reject(refreshError);
        }
    }
);

const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

export const setAccessToken = (token: string | null) => {
    accessToken = token;
}

// api.ts

interface RefreshSession {
  accessToken: string;
  user?: User;
}

let refreshPromise: Promise<RefreshSession> | null = null;

export const refreshAccessToken = async (): Promise<RefreshSession> => {
  if (!refreshPromise) {
    const refresh = () =>
      refreshClient
        .post<ApiResponse<RefreshSession>>("/auth/refresh")
        .then((response) => {
          const session = response.data.data;

          setAccessToken(session.accessToken);

          return session;
        });

    refreshPromise = (
      typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request("supportdesk-refresh-token", refresh)
        : refresh()
    )
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};
