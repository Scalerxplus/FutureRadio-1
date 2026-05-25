import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic_text, city_id } = body;

    if (!topic_text || !city_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("jocktalk_overrides")
      .insert([
        {
          city_id,
          topic_text,
          status: "pending"
        }
      ]);

    if (error) {
      console.error("[Admin API] Failed to insert jocktalk override:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
