const base = import.meta.env.VITE_API_URL ?? "";

export function getStoredToken(): string | null {
  return null;
}

export function clearStoredToken(): void {
  return;
}

export function setStoredToken(_token: string): void {
  return;
}

function defaultHeaders(jsonBody: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (jsonBody) headers["Content-Type"] = "application/json";
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: defaultHeaders(false),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPut<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "PUT",
    headers: defaultHeaders(true),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "DELETE",
    headers: defaultHeaders(false),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPost<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: defaultHeaders(true),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** Login (sin token previo). */
export async function apiPostPublic<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: defaultHeaders(true),
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status}`);
  }

  return res.json() as Promise<T>;
}
