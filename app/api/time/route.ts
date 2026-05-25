import { NextResponse } from "next/server";

export async function GET() {
  // Prevent caching of this endpoint so it always returns the true live time
  return NextResponse.json(
    { server_time: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
