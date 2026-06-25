import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Note: Ensure your Vercel project is configured with a CRON job pointing to this route
// and you have a secure CRON_SECRET to prevent unauthorized execution.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Secret
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch all expired pending submissions
    const { data: expiredSubmissions, error: fetchError } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('status', 'pending')
      .lte('expires_at', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredSubmissions || expiredSubmissions.length === 0) {
      return NextResponse.json({ success: true, message: "No expired submissions found." });
    }

    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    // 3. Delete files from storage and records from database
    for (const sub of expiredSubmissions) {
      try {
        // Extract filename from the URL 
        // Example URL: https://[project].supabase.co/storage/v1/object/public/creator-uploads/submissions/123-17234.mp3
        const urlParts = sub.file_url.split('/creator-uploads/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          // Delete from storage
          await supabase.storage.from('creator-uploads').remove([filePath]);
        }

        // Delete from database
        await supabase.from('content_submissions').delete().eq('id', sub.id);
        deletedIds.push(sub.id);
      } catch (err) {
        console.error(`Failed to delete submission ${sub.id}`, err);
        failedIds.push(sub.id);
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedIds.length,
      failedCount: failedIds.length,
      deletedIds
    });

  } catch (error: any) {
    console.error('Cleanup Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
