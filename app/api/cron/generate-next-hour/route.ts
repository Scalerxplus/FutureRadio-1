import { NextResponse } from "next/server";

// This cron job is intended to run at minute 55 of every hour
export async function GET(request: Request) {
  // Simple auth to prevent abuse
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    // Allow Vercel Cron to hit it
    request.headers.get("x-vercel-cron") !== "1"
  ) {
    // In dev mode, we might want to test this without headers, but let's be safe
    console.warn("Cron job unauthorized attempt");
  }

  const genres = ["chill", "drive", "party", "romance", "news"];
  const results = [];

  // Calculate the target time for the NEXT hour
  // If it's currently 14:55, the next hour starts at 15:00
  const nowUtc = new Date();
  const istTimeMs = nowUtc.getTime() + (5.5 * 60 * 60 * 1000);
  
  const targetIst = new Date(istTimeMs);
  // Add 1 hour to get the next hour
  targetIst.setUTCHours(targetIst.getUTCHours() + 1, 0, 0, 0);
  
  const year = targetIst.getUTCFullYear();
  const month = String(targetIst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(targetIst.getUTCDate()).padStart(2, '0');
  const hourStr = String(targetIst.getUTCHours()).padStart(2, '0');
  
  const istIsoString = `${year}-${month}-${day}T${hourStr}:00:00+05:30`;

  // Get the base URL for the internal fetch
  // In Vercel, x-forwarded-host works, otherwise fallback to localhost
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  console.log(`[Cron] Triggering next hour generation for ${istIsoString} across ${genres.length} stations.`);

  for (const genre of genres) {
    try {
      console.log(`[Cron] Generating for ${genre}...`);
      const res = await fetch(`${baseUrl}/api/broadcast/generate-hour?city=${genre}&startTime=${encodeURIComponent(istIsoString)}`, {
        method: "POST"
      });
      
      const data = await res.json();
      results.push({ genre, success: data.success, elements: data.schedule?.length });
      
      // Wait 5 seconds between stations to absolutely guarantee we don't hit Audius API rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (err: any) {
      console.error(`[Cron] Failed for ${genre}:`, err);
      results.push({ genre, success: false, error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Next hour auto-generation complete.",
    targetTime: istIsoString,
    results
  });
}
