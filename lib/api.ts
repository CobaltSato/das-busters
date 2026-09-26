import { fill, type Messages } from "./i18n";

// fetch wrapper for the client. Server errors arrive as { error, code }
// JSON; the UI shows the translation for the code, or the English message.

type Params = Record<string, string>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly params?: Params,
  ) {
    super(message);
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiError("Could not reach the server. Check the connection and try again.", 0, "network");
  }
  const data = (await response.json().catch(() => null)) as { error?: string; code?: string; params?: Params } | null;
  if (!response.ok) {
    if (data?.error) throw new ApiError(data.error, response.status, data.code, data.params);
    throw new ApiError(`The server answered ${response.status}`, response.status, "http-status", {
      status: String(response.status),
    });
  }
  return data as T;
}

export function errorMessage(error: unknown, t: Messages): string {
  if (error instanceof ApiError && error.code) {
    const template = t.errors[error.code];
    if (template) return fill(template, error.params);
  }
  return error instanceof Error ? error.message : t.common.somethingWrong;
}
