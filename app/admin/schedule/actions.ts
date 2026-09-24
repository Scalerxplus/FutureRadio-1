"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateScheduleElement(id: string, updates: any) {
  const supabase = createClient();
  const { error } = await supabase
    .from("broadcast_schedule")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating schedule element:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fixLegacyPromos() {
  const supabase = createClient();
  const { data, error: fetchErr } = await supabase.from('broadcast_schedule').select('id, metadata, media_url').like('media_url', '%Bagheli%');
  if (fetchErr) return { success: false, error: fetchErr.message };
  if (!data || data.length === 0) return { success: true, count: 0 };
  let count = 0;
  for (const row of data) {
    const newMetadata = { ...row.metadata, title: (row.metadata?.title || '').replace(/Bagheli/g, 'Roots') };
    await supabase.from('broadcast_schedule').update({ metadata: newMetadata }).eq('id', row.id);
    count++;
  }
  return { success: true, count };
}
