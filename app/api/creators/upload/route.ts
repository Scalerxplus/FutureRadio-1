import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const station = formData.get("station") as string;
    const file = formData.get("file") as File;

    if (!email || !station || !file) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Verify if creator exists
    const { data: creator, error: creatorError } = await supabase
      .from("verified_creators")
      .select("id, type")
      .eq("email", email)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ error: "Verified creator profile not found for this email." }, { status: 403 });
    }

    // 2. Upload file
    const fileExt = file.name.split('.').pop();
    const fileName = `submissions/${creator.id}-${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('creator-uploads')
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload audio file to storage." }, { status: 500 });
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('creator-uploads')
      .getPublicUrl(fileName);

    // 4. Calculate Expiry Date
    // Radio creators: +24 hours
    // Music creators: +3 days
    const expiresAt = new Date();
    if (creator.type === 'radio') {
      expiresAt.setHours(expiresAt.getHours() + 24);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 3);
    }

    // 5. Insert Submission
    const { error: insertError } = await supabase
      .from("content_submissions")
      .insert([{
        creator_id: creator.id,
        station: station,
        file_url: publicUrl,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      }]);

    if (insertError) {
      return NextResponse.json({ error: "Failed to log submission in database." }, { status: 500 });
    }

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}
