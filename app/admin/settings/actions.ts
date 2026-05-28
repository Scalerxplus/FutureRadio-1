"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveStationSettings(cityId: string, voiceId: string, language: string, rjPrompt: string, playlistMood: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("station_settings")
    .upsert({
      city_id: cityId,
      voice_id: voiceId,
      language: language,
      rj_prompt: rjPrompt,
      playlist_mood: playlistMood,
      updated_at: new Date().toISOString()
    }, { onConflict: "city_id" });

  if (error) {
    console.error("Error saving station settings:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function getStationSettings(cityId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("station_settings")
    .select("*")
    .eq("city_id", cityId)
    .single();
  return { data, error };
}

export async function saveJocktalkOverride(cityId: string, topicText: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("jocktalk_overrides")
    .insert({
      city_id: cityId,
      topic_text: topicText,
      status: "pending",
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error("Error saving jocktalk override:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function getPendingOverrides(cityId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jocktalk_overrides")
    .select("*")
    .eq("city_id", cityId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function deleteOverride(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("jocktalk_overrides")
    .delete()
    .eq("id", id);
  return { success: !error };
}
