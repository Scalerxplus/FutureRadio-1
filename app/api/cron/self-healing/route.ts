import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300; // Allow 5 minutes on Vercel Pro
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Vercel Cron Security Check
    const authHeader = request.headers.get("authorization");
    const isCron = request.headers.get("x-vercel-cron") === "1";
    const isDev = process.env.NODE_ENV === "development";

    if (!isDev && !isCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const cityId = "raipur"; // Assuming standard single-station for now

    const now = new Date();
    // Anchor to top of current hour
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const currentIstMs = now.getTime() + istOffsetMs;
    const currentIstDate = new Date(currentIstMs);
    currentIstDate.setUTCMinutes(0, 0, 0);
    const startHour = new Date(currentIstDate.getTime() - istOffsetMs);

    const endHour = new Date(startHour.getTime() + 24 * 60 * 60 * 1000); // Check next 24 hours

    const { data: schedule, error } = await supabase
      .from("broadcast_schedule")
      .select("*")
      .eq("city_id", cityId)
      .gte("start_time", startHour.toISOString())
      .lt("start_time", endHour.toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    const diagnostics = {
      hoursScanned: 24,
      issuesFound: 0,
      healed: 0,
      details: [] as string[]
    };

    // Group elements by hour to analyze blocks independently
    const elementsByHour = new Map<string, any[]>();
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(startHour.getTime() + i * 60 * 60 * 1000);
      elementsByHour.set(hourStart.toISOString(), []);
    }

    for (const el of (schedule || [])) {
      // Find which hour block it belongs to
      for (const [hourIso] of elementsByHour.entries()) {
        const hStart = new Date(hourIso).getTime();
        const hEnd = hStart + 60 * 60 * 1000;
        const elStart = new Date(el.start_time).getTime();
        if (elStart >= hStart && elStart < hEnd) {
          elementsByHour.get(hourIso)?.push(el);
          break;
        }
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Analyze each hour
    for (const [hourIso, elements] of elementsByHour.entries()) {
      let hasError = false;
      let reason = "";

      // 1. Underflow / Missing Block Check
      if (elements.length < 5) {
        hasError = true;
        reason = `Underflow: Only ${elements.length} elements found.`;
      } 
      // 2. Overflow Check
      else if (elements.length > 40) {
        hasError = true;
        reason = `Overflow: Abnormally high elements (${elements.length}). Possible duplicate generation.`;
      } 
      // 3. Overlap / Corruption Check
      else {
        // Elements are already ordered by start_time from DB.
        for (let i = 1; i < elements.length; i++) {
          const prevEnd = new Date(elements[i - 1].end_time).getTime();
          const currStart = new Date(elements[i].start_time).getTime();
          
          // If the current element starts more than 1 second BEFORE the previous one ended, it's a severe overlap
          if (currStart < prevEnd - 1000) {
            hasError = true;
            reason = `Overlap: Element ${elements[i].element_type} starts before previous ${elements[i-1].element_type} ends.`;
            break;
          }
        }
      }

      if (hasError) {
        diagnostics.issuesFound++;
        diagnostics.details.push(`[${hourIso}] ${reason}`);
        console.log(`[Watchdog] Issue found at ${hourIso}: ${reason}`);

        // HEALING ACTION
        try {
          const targetEndTime = new Date(new Date(hourIso).getTime() + 59 * 60 * 1000 + 59 * 1000 + 999);
          
          // 1. Wipe the corrupted hour
          await supabase
            .from("broadcast_schedule")
            .delete()
            .eq("city_id", cityId)
            .gte("start_time", new Date(hourIso).toISOString())
            .lt("start_time", targetEndTime.toISOString());

          // 2. Regenerate cleanly
          const encodedTime = encodeURIComponent(new Date(new Date(hourIso).getTime() + istOffsetMs).toISOString().replace("Z", "+05:30"));
          const genUrl = `${appUrl}/api/broadcast/generate-hour?startTime=${encodedTime}`;
          
          await fetch(genUrl, { method: "POST" });
          diagnostics.healed++;
          diagnostics.details.push(`[${hourIso}] Successfully wiped and regenerated.`);
        } catch (e: any) {
          console.error(`[Watchdog] Failed to heal ${hourIso}:`, e);
          diagnostics.details.push(`[${hourIso}] Healing failed: ${e.message}`);
        }
      }
    }

    return NextResponse.json({ success: true, ...diagnostics });
  } catch (error: any) {
    console.error("[Watchdog Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
