import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    return config;
  }

  const headers = config.headers as
    | (Record<string, string | undefined> & {
        set?: (name: string, value: string) => void;
      })
    | undefined;

  const contentType = headers?.["Content-Type"] ?? headers?.["content-type"];

  if (!contentType) {
    if (headers?.set) {
      headers.set("Content-Type", "application/json");
    } else {
      (config.headers as Record<string, string>)["Content-Type"] =
        "application/json";
    }
  }

  if (typeof config.data === "string") {
    const trimmed = config.data.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        config.data = JSON.parse(trimmed);
      } catch {
        // Keep original string if it is not valid JSON.
      }
    }
  }

  const finalContentType =
    (config.headers as Record<string, string | undefined>)?.["Content-Type"] ??
    (config.headers as Record<string, string | undefined>)?.["content-type"];

  console.log("[API][REQUEST]", {
    method: config.method,
    url: `${config.baseURL ?? ""}${config.url ?? ""}`,
    contentType: finalContentType,
    dataType: typeof config.data,
    data: config.data,
  });

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.log("[API][RESPONSE_ERROR]", {
        status: error.response?.status,
        data: error.response?.data,
        method: error.config?.method,
        url: `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`,
      });
    }

    return Promise.reject(error);
  },
);

function stringifyUnknownMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim().length > 0 ? value : null;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => stringifyUnknownMessage(item))
      .filter((item): item is string => Boolean(item));

    return parts.length > 0 ? parts.join(", ") : null;
  }

  if (value && typeof value === "object") {
    const parts = Object.entries(value as Record<string, unknown>)
      .flatMap(([key, nestedValue]) => {
        const parsed = stringifyUnknownMessage(nestedValue);
        if (!parsed) {
          return [];
        }

        return [`${key}: ${parsed}`];
      })
      .filter((item) => item.trim().length > 0);

    return parts.length > 0 ? parts.join(", ") : null;
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as { message?: unknown } | undefined;
  const parsed = stringifyUnknownMessage(data?.message);

  if (parsed) {
    return parsed;
  }

  return fallback;
}
