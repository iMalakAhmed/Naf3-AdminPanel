const DEFAULT_API_BASE_URL =
  "https://nafaa-frfve0gyfyatgzh0.uaenorth-01.azurewebsites.net/api";
const DEFAULT_ADMIN_BASE_URL =
  "https://nafaa-frfve0gyfyatgzh0.uaenorth-01.azurewebsites.net/admin";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const ADMIN_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL ?? DEFAULT_ADMIN_BASE_URL;

type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  error: string | null;
};

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("naf3_admin_auth");
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch (err) {
    return null;
  }
}

async function apiFetch<T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  let json: T | null = null;
  try {
    json = (await response.json()) as T;
  } catch (err) {
    json = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      data: json,
      error: (json as { message?: string })?.message ?? "Request failed",
    };
  }

  return { ok: true, data: json, error: null };
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  return apiFetch<T>(API_BASE_URL, path, { method: "GET" });
}

export async function apiAdminGet<T>(path: string): Promise<ApiResult<T>> {
  return apiFetch<T>(ADMIN_BASE_URL, path, { method: "GET" });
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<ApiResult<T>> {
  return apiFetch<T>(API_BASE_URL, path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiAdminPost<T>(
  path: string,
  body: unknown
): Promise<ApiResult<T>> {
  return apiFetch<T>(ADMIN_BASE_URL, path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(
  path: string,
  body: unknown
): Promise<ApiResult<T>> {
  return apiFetch<T>(API_BASE_URL, path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Redeem points for a recipient
 * @param redeemData - The redemption data
 * @param redeemData.nationalId - National ID of the recipient (optional)
 * @param redeemData.virtualCardCode - Virtual card code (optional)
 * @param redeemData.cardHolderName - Card holder name (optional)
 * @param redeemData.amount - Amount to redeem (required)
 * @param redeemData.pin - PIN for the virtual card (optional)
 */
export async function redeemPoints(redeemData: {
  nationalId?: string | null;
  virtualCardCode?: string | null;
  cardHolderName?: string | null;
  amount: number;
  pin?: string | null;
}): Promise<ApiResult<unknown>> {
  return apiPost("/partners/redeem-points", redeemData);
}
