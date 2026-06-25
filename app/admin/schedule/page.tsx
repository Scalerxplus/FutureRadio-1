import { createClient } from "@/lib/supabase/server";
import { format, startOfDay, endOfDay, setHours, setMinutes, setSeconds } from "date-fns";
import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";

function getShowForHour(hour: number, currentChannel: string) {
  // Format the channel name properly (e.g., 'bastar' -> 'Bastar', 'hindi' -> 'Hindi')
  const formattedName = currentChannel === 'news' 
    ? 'Future Radio - News'
    : `Future Radio - ${currentChannel.charAt(0).toUpperCase() + currentChannel.slice(1)}`;

  return { 
    name: formattedName, 
    color: "text-brand-red" 
  };
}

function generateHotClockPlaceholders(hour: number, show: any) {
  // Compute absolute ms for the start of this hour in IST today
  const now = new Date();
  const istTimeMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const istDate = new Date(istTimeMs);
  istDate.setUTCHours(hour, 0, 0, 0);
  let currentTimeMs = istDate.getTime() - 5.5 * 60 * 60 * 1000;
  const placeholders: any[] = [];
  
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

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { channel?: string };
}) {
  const currentChannel = searchParams.channel || "hindi";
  const supabase = createClient();
  
  // Fetch today's schedule from DB using explicit IST boundaries
  const now = new Date();
  const istTimeMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const istDate = new Date(istTimeMs);
  
  const startIST = new Date(istDate);
  startIST.setUTCHours(0, 0, 0, 0);
  const startOfTodayISO = new Date(startIST.getTime() - 5.5 * 60 * 60 * 1000).toISOString();

  const endIST = new Date(istDate);
  endIST.setUTCHours(23 + 24, 59, 59, 999); // Extend to the end of Tomorrow (48 hours total)
  const endOfTodayISO = new Date(endIST.getTime() - 5.5 * 60 * 60 * 1000).toISOString();

  let allDbSchedule: any[] = [];
  let hasMore = true;
  let offset = 0;
  const BATCH_SIZE = 1000;

  while (hasMore) {
    const { data: dbSchedule, error } = await supabase
      .from("broadcast_schedule")
      .select("*")
      .eq("city_id", currentChannel)
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

  // Group DB items by hour (0 to 47)
  const dbItemsByHour: Record<number, any[]> = {};
  if (allDbSchedule.length > 0) {
    allDbSchedule.forEach((item) => {
      const dateInIST = new Date(new Date(item.start_time).getTime() + 5.5 * 60 * 60 * 1000);
      const h = dateInIST.getUTCHours();
      const isTomorrow = dateInIST.getUTCDate() !== startIST.getUTCDate();
      const hourKey = h + (isTomorrow ? 24 : 0);
      
      if (!dbItemsByHour[hourKey]) dbItemsByHour[hourKey] = [];
      dbItemsByHour[hourKey].push(item);
    });
  }

  // Construct full 48-hour loop
  const twentyFourHourSchedule = [];
  for (let hourKey = 0; hourKey < 48; hourKey++) {
    const displayHour = hourKey % 24;
    const show = getShowForHour(displayHour, currentChannel);
    let elements = dbItemsByHour[hourKey] || [];
    const isActive = elements.length > 0;
    
    if (!isActive) {
      elements = generateHotClockPlaceholders(hourKey, show);
    }
    
    twentyFourHourSchedule.push({
      hour: hourKey,
      displayHour,
      show,
      isActive,
      isTomorrow: hourKey >= 24,
      elements
    });
  }

  return <ScheduleClient initialSchedule={twentyFourHourSchedule} currentChannel={currentChannel} />;
}
