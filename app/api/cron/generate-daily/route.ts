import { NextResponse } from "next/server";

export const maxDuration = 300; // Allow 5 minutes on Vercel Pro
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Vercel Cron Security Check
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In development or if unconfigured, we might bypass this, but for production it's critical
      console.warn("Unauthorized cron invocation attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("[Daily Cron] Starting 24-hour schedule generation...");
    
    const nowUtc = new Date();
    // Add 5.5 hours to get current IST time mapped onto UTC methods
    const istTimeMs = nowUtc.getTime() + (5.5 * 60 * 60 * 1000);

    // Vercel URL discovery for internal fetch
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = request.headers.get("host") || process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Generate next 24 hours sequentially starting from the NEXT upcoming hour
    for (let i = 0; i < 24; i++) {
      const targetIst = new Date(istTimeMs);
      targetIst.setUTCHours(targetIst.getUTCHours() + 1 + i, 0, 0, 0);
      
      const year = targetIst.getUTCFullYear();
      const month = String(targetIst.getUTCMonth() + 1).padStart(2, '0');
      const day = String(targetIst.getUTCDate()).padStart(2, '0');
      const hourStr = String(targetIst.getUTCHours()).padStart(2, '0');
      
      const istIsoString = `${year}-${month}-${day}T${hourStr}:00:00+05:30`;
      
      console.log(`[Daily Cron] Requesting generation for NEXT Hour ${hourStr} (${istIsoString})`);
      
      const res = await fetch(`${baseUrl}/api/broadcast/generate-hour?startTime=${encodeURIComponent(istIsoString)}`, { 
        method: "POST" 
      });

      if (!res.ok) {
        console.error(`[Daily Cron] Failed to generate hour ${hourStr}: ${res.statusText}`);
      }
    }

    console.log("[Daily Cron] Successfully generated 24-hour schedule for tomorrow.");

    return NextResponse.json({
      success: true,
      message: "Daily schedule generation completed successfully."
    });

  } catch (err: unknown) {
    console.error("[Daily Cron] Execution failed:", err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
