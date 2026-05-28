import { createClient } from "@/lib/supabase/server";
import { format, startOfDay, endOfDay, setHours, setMinutes, setSeconds } from "date-fns";
import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";

const SHOWS = [
  { id: "morning_zen", name: "Morning Zen", voice: "Core", startHour: 6, endHour: 8, color: "text-blue-400" },
  { id: "morning_drive", name: "The Morning Drive", voice: "Core", startHour: 8, endHour: 11, color: "text-yellow-400" },
  { id: "mid_day", name: "Mid-Day Cafe", voice: "Core", startHour: 11, endHour: 16, color: "text-orange-400" },
  { id: "evening_rush", name: "Evening Rush", voice: "Core", startHour: 16, endHour: 20, color: "text-red-400" },
  { id: "global_club", name: "The Global Club", voice: "Core", startHour: 20, endHour: 1, color: "text-purple-400" },
  { id: "night_shift", name: "Night Shift", voice: "Core", startHour: 1, endHour: 6, color: "text-indigo-400" },
];

function getShowForHour(hour: number) {
  if (hour >= 6 && hour < 8) return SHOWS[0];
  if (hour >= 8 && hour < 11) return SHOWS[1];
  if (hour >= 11 && hour < 16) return SHOWS[2];
  if (hour >= 16 && hour < 20) return SHOWS[3];
  if (hour >= 20 || hour < 1) return SHOWS[4]; 
  return SHOWS[5];  
}

function generateHotClockPlaceholders(hour: number, show: any) {
  // Compute absolute ms for the start of this hour in IST today
  const now = new Date();
  const istTimeMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const istDate = new Date(istTimeMs);
  istDate.setUTCHours(hour, 0, 0, 0);
  let currentTimeMs = istDate.getTime() - 5.5 * 60 * 60 * 1000;
  const placeholders = [];
  
  const addBlock = (type: string, durationS: number, title: string, subtitle: string, isStatic: boolean) => {
    placeholders.push({
      id: `placeholder-${hour}-${placeholders.length}`,
      start_time: new Date(currentTimeMs).toISOString(),
      end_time: new Date(currentTimeMs + (durationS * 1000)).toISOString(),
      duration_ms: durationS * 1000,
      element_type: type,
      metadata: { title, subtitle },
      isPlaceholder: true,
      isStatic
    });
    currentTimeMs += (durationS * 1000);
  };

  // TOTH
  addBlock("station_id", 15, "Station ID (Pre-recorded)", "Station Branding", true);
  
  let jocktalkCount = 0;
  while (jocktalkCount < 5) {
    addBlock("jocktalk", 40, "Station Update (Unscripted)", `Station AI Voice (To be generated)`, false);
    addBlock("song", 210, "Song Slot (AI Selection)", "Music Engine Selection", false);
    addBlock("sweeper", 8, "Radio Sweeper", "Station Branding", true);
    addBlock("song", 210, "Song Slot (AI Selection)", "Music Engine Selection", false);
    
    if (jocktalkCount < 4) {
      addBlock("sweeper", 8, "Radio Sweeper Bumper", "Station Branding", true);
      addBlock("ad", 30, "Sponsor Break", "Commercial Block", false);
      addBlock("sweeper", 8, "Radio Sweeper Bumper", "Station Branding", true);
    } else {
      addBlock("sweeper", 8, "Radio Sweeper", "Station Branding", true);
    }
    jocktalkCount++;
  }
  
  // Fill remaining conceptual time
  addBlock("song", 210, "Song Slot (AI Selection)", "Music Engine Selection", false);
  addBlock("sweeper", 8, "Radio Sweeper", "Station Branding", true);
  addBlock("song", 210, "Song Slot (AI Selection)", "Music Engine Selection", false);
  
  return placeholders;
}

export default async function SchedulePage() {
  const supabase = createClient();
  
  // Fetch today's schedule from DB using explicit IST boundaries
  const now = new Date();
  const istTimeMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const istDate = new Date(istTimeMs);
  
  const startIST = new Date(istDate);
  startIST.setUTCHours(0, 0, 0, 0);
  const startOfTodayISO = new Date(startIST.getTime() - 5.5 * 60 * 60 * 1000).toISOString();

  const endIST = new Date(istDate);
  endIST.setUTCHours(23, 59, 59, 999);
  const endOfTodayISO = new Date(endIST.getTime() - 5.5 * 60 * 60 * 1000).toISOString();

  let allDbSchedule: any[] = [];
  let hasMore = true;
  let offset = 0;
  const BATCH_SIZE = 1000;

  while (hasMore) {
    const { data: dbSchedule, error } = await supabase
      .from("broadcast_schedule")
      .select("*")
      .eq("city_id", "raipur")
      .gte("start_time", startOfTodayISO)
      .lte("start_time", endOfTodayISO)
      .order("start_time", { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error("Error fetching schedule:", error);
      break;
    }

    if (dbSchedule && dbSchedule.length > 0) {
      allDbSchedule = [...allDbSchedule, ...dbSchedule];
      offset += BATCH_SIZE;
      if (dbSchedule.length < BATCH_SIZE) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  // Group DB items by hour
  const dbItemsByHour: Record<number, any[]> = {};
  if (allDbSchedule.length > 0) {
    allDbSchedule.forEach((item) => {
      // Robust IST hour extraction without toLocaleString quirks
      const dateInIST = new Date(new Date(item.start_time).getTime() + 5.5 * 60 * 60 * 1000);
      const h = dateInIST.getUTCHours();
      if (!dbItemsByHour[h]) dbItemsByHour[h] = [];
      dbItemsByHour[h].push(item);
    });
  }

  // Construct full 24-hour loop
  const twentyFourHourSchedule = [];
  for (let hour = 0; hour < 24; hour++) {
    const show = getShowForHour(hour);
    let elements = dbItemsByHour[hour] || [];
    let isActive = elements.length > 0;
    
    if (!isActive) {
      elements = generateHotClockPlaceholders(hour, show);
    }
    
    twentyFourHourSchedule.push({
      hour,
      show,
      isActive,
      elements
    });
  }

  return <ScheduleClient initialSchedule={twentyFourHourSchedule} />;
}
