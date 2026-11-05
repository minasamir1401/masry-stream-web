import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HOP_BY_HOP_REQUEST = new Set(["host", "connection", "transfer-encoding", "accept-encoding", "content-length"]);
const STRIPPED_RESPONSE = new Set(["content-encoding", "transfer-encoding", "connection", "keep-alive"]);

async function proxy(request: NextRequest, { params }: { params: { path?: string[] } }) {
  const backendBase =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const subpath = params.path ? params.path.join("/") : "";
  const targetUrl = `${backendBase.replace(/\/$/, "")}/api/${subpath}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_REQUEST.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  // fetch() decompresses bodies but keeps the upstream encoding headers, so the
  // backend must answer uncompressed; the edge compresses for the browser.
  headers.set("accept-encoding", "identity");

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
    const encoded = (res.headers.get("content-encoding") || "identity") !== "identity";
    res.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (!STRIPPED_RESPONSE.has(lower) && !(encoded && lower === "content-length")) {
        resHeaders.append(key, val);
      }
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

