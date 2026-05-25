import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Music, Mic2, AlertCircle, Trash2, Edit3, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: schedule } = await supabase
    .from("broadcast_schedule")
    .select("*")
    .eq("city_id", "raipur")
    .order("created_at", { ascending: false })
    .limit(100);

  // Get the most recent valid batch (same logic as the frontend player)
  let activeSchedule = [];
  if (schedule && schedule.length > 0) {
    const latestCreatedAt = new Date(schedule[0].created_at);
    
    activeSchedule = schedule.filter(el => {
      const diffMs = latestCreatedAt.getTime() - new Date(el.created_at).getTime();
      return diffMs < 10000;
    });

    // Sort chronologically for the admin UI
    activeSchedule.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  const now = new Date();

  return (
    <div className="p-8 pb-24">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Master Clock</h2>
          <p className="text-gray-400">Live timeline overview of the broadcast schedule.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <PlusCircle size={18} />
          Inject Element
        </button>
      </header>

      <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#1a1a24] text-xs font-bold text-gray-500 uppercase tracking-wider bg-[#0d0d14]">
          <div className="col-span-2">Time (IST)</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-5">Content / Title</div>
          <div className="col-span-1 text-right">Duration</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-[#1a1a24]">
          {activeSchedule.map((element) => {
            const startTime = new Date(element.start_time);
            const endTime = new Date(element.end_time);
            const isPlayingNow = now >= startTime && now < endTime;
            const isPast = now >= endTime;

            return (
              <div 
                key={element.id} 
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                  isPlayingNow ? 'bg-red-900/10 border-l-2 border-red-500' : 
                  isPast ? 'opacity-40 grayscale hover:grayscale-0' : 'hover:bg-[#1a1a24]/50'
                }`}
              >
                <div className="col-span-2 flex flex-col">
                  <span className={`font-mono text-sm ${isPlayingNow ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                    {startTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {isPlayingNow && <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest mt-1">Live Now</span>}
                </div>
                
                <div className="col-span-2 flex items-center gap-2">
                  <TypeBadge type={element.element_type} />
                </div>

                <div className="col-span-5">
                  <p className={`font-medium truncate ${isPlayingNow ? 'text-white' : 'text-gray-300'}`}>
                    {element.metadata?.title || element.metadata?.transcript?.substring(0, 50) + "..." || "Station ID"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {element.element_type === 'song' ? `YT: ${element.youtube_id}` : element.media_url}
                  </p>
                </div>

                <div className="col-span-1 text-right text-sm text-gray-400 font-mono">
                  {(element.duration_ms / 1000).toFixed(0)}s
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                  <button className="p-2 rounded-lg hover:bg-[#222230] text-gray-400 hover:text-white transition-colors disabled:opacity-30" disabled={isPast}>
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30" disabled={isPast || isPlayingNow}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {activeSchedule.length === 0 && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-400">Schedule is empty</p>
              <p className="text-sm mt-1">Run the autonomous generator to populate the master clock.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  if (type === "song") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider">
        <Music size={12} /> Song
      </span>
    );
  }
  if (type === "jocktalk") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider">
        <Mic2 size={12} /> Jocktalk
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold uppercase tracking-wider">
      <AlertCircle size={12} /> Branding
    </span>
  );
}
