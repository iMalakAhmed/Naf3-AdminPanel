import { NextResponse } from "next/server";

const DEFAULT_LOGIN_URL =
  "https://nafaa-frfve0gyfyatgzh0.uaenorth-01.azurewebsites.net/api/auth/admin/login";

export async function POST(request: Request) {
  const loginUrl =
    process.env.ADMIN_LOGIN_PROXY_URL ??
    process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL ??
    DEFAULT_LOGIN_URL;

  try {
    const body = await request.json();
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Login proxy failed." },
      { status: 500 }
    );
  }
}
