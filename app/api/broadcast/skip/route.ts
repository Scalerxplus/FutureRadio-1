import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const cityId = "raipur";
    
    // Find the currently playing element
    const nowISO = new Date().toISOString();
    const { data: currentElements, error: currErr } = await supabase
      .from("broadcast_schedule")
      .select("*")
      .eq("city_id", cityId)
      .gt("end_time", nowISO)
      .order("start_time", { ascending: true })
      .limit(1);

    if (currErr || !currentElements || currentElements.length === 0) {
      return NextResponse.json({ success: false, error: "No active element playing right now to skip" });
    }

    const activeElement = currentElements[0];
    const originalEndTimeMs = new Date(activeElement.end_time).getTime();
    const nowMs = new Date().getTime();
    const shiftMs = originalEndTimeMs - nowMs; // How much time we are cutting off

    if (shiftMs <= 0) {
       return NextResponse.json({ success: false, error: "Element already finished" });
    }

    // 1. End the current element immediately
    await supabase
      .from("broadcast_schedule")
      .update({ end_time: new Date(nowMs).toISOString() })
      .eq("id", activeElement.id);

    // 2. Fetch all future elements
    const { data: futureElements } = await supabase
      .from("broadcast_schedule")
      .select("*")
      .eq("city_id", cityId)
      .gt("start_time", nowISO)
      .order("start_time", { ascending: true })
      .limit(100);

    // 3. Shift them all up
    if (futureElements && futureElements.length > 0) {
      for (const el of futureElements) {
        const newStart = new Date(new Date(el.start_time).getTime() - shiftMs).toISOString();
        const newEnd = new Date(new Date(el.end_time).getTime() - shiftMs).toISOString();
        await supabase
          .from("broadcast_schedule")
          .update({ start_time: newStart, end_time: newEnd })
          .eq("id", el.id);
      }
    }

    return NextResponse.json({ success: true, shifted: futureElements?.length || 0 });
  } catch (err: any) {
    console.error("Skip failed", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
