// fetch wrapper for the client. Server errors arrive as { error } JSON and
// are shown to the user as they are.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
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
    throw new ApiError("Could not reach the server. Check the connection and try again.", 0);
  }
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new ApiError(data?.error ?? `The server answered ${response.status}`, response.status);
  }
  return data as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
