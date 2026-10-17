import { tr } from "@/i18n/core";
import {
  create,
  isAxiosError,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
export const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL ||
  (process.env.EXPO_OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://localhost:8000")
).replace(/\/+$/, "");
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public fields: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    const body = error.response?.data;
    const fields: Record<string, string[]> = {};
    if (body && typeof body === "object")
      for (const [key, value] of Object.entries(body))
        if (Array.isArray(value))
          fields[key] = value.map((message) => tr(String(message)));
    return new ApiError(
      typeof body?.detail === "string"
        ? tr(body.detail)
        : Object.values(fields).flat().join(" ") ||
            tr("No pudimos conectar. Revisá tu conexión e intentá de nuevo."),
      error.response?.status || 0,
      fields,
    );
  }
  return new ApiError(tr("Ocurrió un problema. Intentá de nuevo."));
}
export const publicApi = create({
  baseURL: `${apiBaseUrl}/api/v1/`,
  timeout: 15000,
  headers: { Accept: "application/json" },
});
export const privateApi = create({
  baseURL: `${apiBaseUrl}/api/v1/`,
  timeout: 15000,
  headers: { Accept: "application/json" },
});
type RetriedConfig = InternalAxiosRequestConfig & {
  retried?: boolean;
  sessionGeneration?: number;
};
export function connectAuth(auth: {
  access: () => string | null;
  generation: () => number;
  refresh: () => Promise<string>;
}) {
  const request = privateApi.interceptors.request.use((config) => {
    const value = config as RetriedConfig;
    value.sessionGeneration ??= auth.generation();
    if (value.sessionGeneration !== auth.generation())
      throw new ApiError(tr("La sesión cambió."), 401);
    const token = auth.access();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  const response = privateApi.interceptors.response.use(
    (value) => value,
    async (error: AxiosError) => {
      const config = error.config as RetriedConfig | undefined;
      if (
        error.response?.status === 401 &&
        config &&
        !config.retried &&
        config.sessionGeneration === auth.generation()
      ) {
        config.retried = true;
        // A delayed 401 from the old token can arrive after another request renewed it.
        // Reuse the current access token rather than rotating refresh a second time.
        const sentToken = config.headers.Authorization;
        if (!auth.access() || sentToken === `Bearer ${auth.access()}`)
          await auth.refresh();
        if (config.sessionGeneration !== auth.generation())
          throw new ApiError(tr("La sesión cambió."), 401);
        return privateApi.request(config);
      }
      throw normalizeError(error);
    },
  );
  return () => {
    privateApi.interceptors.request.eject(request);
    privateApi.interceptors.response.eject(response);
  };
}
publicApi.interceptors.response.use(
  (value) => value,
  (error) => Promise.reject(normalizeError(error)),
);
export async function get<T>(
  path: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal,
  authenticated = false,
): Promise<T> {
  return (
    await (authenticated ? privateApi : publicApi).get<T>(path, {
      params,
      signal,
    })
  ).data;
}
export async function write<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  data?: unknown,
): Promise<T> {
  return (await privateApi.request<T>({ url: path, method, data })).data;
}
