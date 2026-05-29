import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (Admin Mode)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const startTimeStr = formData.get("start_time") as string;
    const endTimeStr = formData.get("end_time") as string;
    const cityId = formData.get("city_id") as string;
    
    if (!file || !startTimeStr || !endTimeStr || !cityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Process and Save the Audio File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize the filename and ensure the uploads directory exists
    const extension = file.name.split('.').pop() || 'mp3';
    const safeFilename = `Jocktalk_${cityId}_${Date.now()}.${extension}`;
    const uploadDir = join(process.cwd(), "public", "audio", "uploads");
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const filePath = join(uploadDir, safeFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/audio/uploads/${safeFilename}`;

    // Calculate exact duration
    const start = new Date(startTimeStr).getTime();
    const end = new Date(endTimeStr).getTime();
    const durationMs = end - start;

    // 2. Insert into Supabase Schedule Table
    const newBlockId = crypto.randomUUID();
    const { error: insertError } = await supabase.from("schedule").insert([
      {
        id: newBlockId,
        city_id: cityId,
        element_type: "jocktalk",
        start_time: startTimeStr,
        end_time: endTimeStr,
        duration_ms: durationMs,
        media_url: publicUrl,
        metadata: {
          title: "Custom Jocktalk Upload",
          subtitle: `Uploaded File: ${file.name}`,
          original_filename: file.name
        }
      }
    ]);

    if (insertError) {
      console.error("[Upload Jocktalk] Database insert failed:", insertError);
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
    }

    console.log(`[Upload Jocktalk] Successfully processed and scheduled ${safeFilename}`);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      id: newBlockId
    });

  } catch (error) {
    console.error("[Upload Jocktalk] Fatal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
