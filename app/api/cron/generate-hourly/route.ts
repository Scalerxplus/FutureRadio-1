import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60; // 60 seconds is plenty for 1-2 hours
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Vercel Cron Security Check
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("Unauthorized cron invocation attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("[Hourly Cron] Starting continuous schedule generation...");
    
    // Auto-Delete 48h old logs
    try {
      const supabase = createClient();
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { error: deleteError } = await supabase
        .from("broadcast_schedule")
        .delete()
        .lt("end_time", fortyEightHoursAgo);
        
      if (deleteError) {
        console.error("[Hourly Cron] Failed to delete old logs:", deleteError);
      }
    } catch (dbErr) {
      console.error("[Hourly Cron] Database cleanup error:", dbErr);
    }
    
    const nowUtc = new Date();
    const istTimeMs = nowUtc.getTime() + (5.5 * 60 * 60 * 1000);

    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = request.headers.get("host") || process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const genres = ["bagheli"];
    
    // We want to make sure the next 48 hours are populated.
    // To be safe, let's generate exactly the hour that is 48 hours from now.
    // We'll also generate the hour 47 hours from now, just in case the previous cron failed.
    const hoursToGenerate = [47, 48];
    
    for (const hourOffset of hoursToGenerate) {
        const targetIst = new Date(istTimeMs);
        targetIst.setUTCHours(targetIst.getUTCHours() + hourOffset, 0, 0, 0);
        
        const year = targetIst.getUTCFullYear();
        const month = String(targetIst.getUTCMonth() + 1).padStart(2, '0');
        const day = String(targetIst.getUTCDate()).padStart(2, '0');
        const hourStr = String(targetIst.getUTCHours()).padStart(2, '0');
        
        const istIsoString = `${year}-${month}-${day}T${hourStr}:00:00+05:30`;
        
        console.log(`[Hourly Cron] Requesting generation for +${hourOffset}h (${istIsoString})`);
        
        for (const genre of genres) {
            try {
                const res = await fetch(`${baseUrl}/api/broadcast/generate-hour?city=${genre}&startTime=${encodeURIComponent(istIsoString)}`, { 
                    method: "POST" 
                });
                if (!res.ok) {
                    console.error(`[Hourly Cron] Failed to generate hour ${hourStr} for ${genre}: ${res.statusText}`);
                }
            } catch (e) {
                console.error(`[Hourly Cron] Network error generating hour ${hourStr}:`, e);
            }
        }
    }

    console.log("[Hourly Cron] Successfully maintained 48-hour schedule buffer.");

    return NextResponse.json({
      success: true,
      message: "Hourly schedule generation completed successfully."
    });

  } catch (err: unknown) {
    console.error("[Hourly Cron] Execution failed:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}
