import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds (for slow page loads / Lighthouse / AI generation)

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log(`[API Proxy] Triggering unified scan for URL: ${url}`);

    // Call the Unified Backend Service (running on port 3001)
    let scanResponse;
    try {
      scanResponse = await fetch("http://localhost:3001/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(55000), // 55s timeout
      });
    } catch (err: any) {
      console.error("[API Proxy] Error contacting backend-service:", err);
      return NextResponse.json(
        { error: "Backend service is unreachable. Make sure the backend server is running on port 3001." },
        { status: 502 }
      );
    }

    if (!scanResponse.ok) {
      const errorData = await scanResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || `Backend service error (${scanResponse.status})` },
        { status: scanResponse.status }
      );
    }

    const { report } = await scanResponse.json();
    return NextResponse.json(report);
  } catch (err: any) {
    console.error("[API Proxy] Unexpected error in scanner proxy endpoint:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during the website scan." },
      { status: 500 }
    );
  }
}
