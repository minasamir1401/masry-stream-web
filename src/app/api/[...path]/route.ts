import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, { params }: { params: { path?: string[] } }) {
  const backendBase =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const subpath = params.path ? params.path.join("/") : "";
  const targetUrl = `${backendBase.replace(/\/$/, "")}/api/${subpath}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!["host", "connection", "transfer-encoding"].includes(lower)) {
      headers.set(key, value);
    }
  });

  const forwardHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (forwardHost) {
    headers.set("x-forwarded-host", forwardHost);
  }

  const init: RequestInit & { duplex?: string } = {
    method: request.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
    init.duplex = "half";
  }

  try {
    const res = await fetch(targetUrl, init);

    const resHeaders = new Headers();
    res.headers.forEach((val, key) => {
      resHeaders.set(key, val);
    });

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Backend proxy error", details: err?.message || String(err) },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;

