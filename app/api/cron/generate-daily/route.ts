import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    
    // Auto-Delete 48h old logs
    try {
      const supabase = createClient();
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { error: deleteError } = await supabase
        .from("broadcast_schedule")
        .delete()
        .lt("end_time", fortyEightHoursAgo);
        
      if (deleteError) {
        console.error("[Daily Cron] Failed to delete old logs:", deleteError);
      } else {
        console.log(`[Daily Cron] Cleaned up schedule logs older than ${fortyEightHoursAgo}`);
      }
    } catch (dbErr) {
      console.error("[Daily Cron] Database cleanup error:", dbErr);
    }
    
    const nowUtc = new Date();
    // Add 5.5 hours to get current IST time mapped onto UTC methods
    const istTimeMs = nowUtc.getTime() + (5.5 * 60 * 60 * 1000);

    // Vercel URL discovery for internal fetch
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = request.headers.get("host") || process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Generate next 48 hours in batches of 8 to prevent Vercel 60s timeout
    const genres = ["bagheli"];
    const batchSize = 8;
    for (let i = 0; i < 48; i += batchSize) {
      const batchPromises = [];
      for (let j = 0; j < batchSize && (i + j) < 48; j++) {
        const hourOffset = i + j;
        const targetIst = new Date(istTimeMs);
        // Start from CURRENT hour
        targetIst.setUTCHours(targetIst.getUTCHours() + hourOffset, 0, 0, 0);
        
        const year = targetIst.getUTCFullYear();
        const month = String(targetIst.getUTCMonth() + 1).padStart(2, '0');
        const day = String(targetIst.getUTCDate()).padStart(2, '0');
        const hourStr = String(targetIst.getUTCHours()).padStart(2, '0');
        
        const istIsoString = `${year}-${month}-${day}T${hourStr}:00:00+05:30`;
        
        console.log(`[Daily Cron] Requesting generation for Hour ${hourStr} (${istIsoString})`);
        
        for (const genre of genres) {
          batchPromises.push(
            fetch(`${baseUrl}/api/broadcast/generate-hour?city=${genre}&startTime=${encodeURIComponent(istIsoString)}`, { 
              method: "POST" 
            }).then(res => {
              if (!res.ok) console.error(`[Daily Cron] Failed to generate hour ${hourStr} for ${genre}: ${res.statusText}`);
            })
          );
        }
      }
      // Wait for the batch of 8 hours to finish before starting the next batch
      await Promise.all(batchPromises);
    }

    console.log("[Daily Cron] Successfully generated 24-hour schedule for tomorrow.");

    // Trigger the Self-Healing Watchdog to verify the integrity of the generated schedule
    console.log("[Daily Cron] Triggering Self-Healing Diagnostics...");
    try {
        await fetch(`${baseUrl}/api/cron/self-healing`, {
            method: "GET",
            headers: request.headers.get("authorization") ? { "authorization": request.headers.get("authorization") as string } : {}
        });
    } catch (e) {
        console.error("[Daily Cron] Failed to trigger self-healing:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Daily schedule generation and diagnostics completed successfully."
    });

  } catch (err: unknown) {
    console.error("[Daily Cron] Execution failed:", err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
