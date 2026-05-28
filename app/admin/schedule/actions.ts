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
