import { NextResponse } from "next/server";

const DEFAULT_ADMIN_BASE_URL =
  "https://nafaa-frfve0gyfyatgzh0.uaenorth-01.azurewebsites.net/admin";

function buildTargetUrl(request: Request, baseUrl: string, path: string) {
  const url = new URL(request.url);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}${url.search}`;
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const baseUrl = process.env.ADMIN_PROXY_BASE_URL ?? DEFAULT_ADMIN_BASE_URL;
  const targetUrl = buildTargetUrl(request, baseUrl, params.path.join("/"));
  const response = await fetch(targetUrl, {
    method: "GET",
    headers: request.headers,
  });

  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: response.headers,
  });
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  const baseUrl = process.env.ADMIN_PROXY_BASE_URL ?? DEFAULT_ADMIN_BASE_URL;
  const targetUrl = buildTargetUrl(request, baseUrl, params.path.join("/"));
  const body = await request.arrayBuffer();
  const response = await fetch(targetUrl, {
    method: "POST",
    headers: request.headers,
    body,
  });

  const responseBody = await response.arrayBuffer();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: response.headers,
  });
}

export async function PUT(request: Request, { params }: { params: { path: string[] } }) {
  const baseUrl = process.env.ADMIN_PROXY_BASE_URL ?? DEFAULT_ADMIN_BASE_URL;
  const targetUrl = buildTargetUrl(request, baseUrl, params.path.join("/"));
  const body = await request.arrayBuffer();
  const response = await fetch(targetUrl, {
    method: "PUT",
    headers: request.headers,
    body,
  });

  const responseBody = await response.arrayBuffer();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: response.headers,
  });
}
