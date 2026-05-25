"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LiveListenersCard({ cityId = "raipur" }: { cityId?: string }) {
  const [listenerCount, setListenerCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`radio_listeners_${cityId}`);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // The state object keys are the unique user IDs tracking their presence
        const totalListeners = Object.keys(state).length;
        setListenerCount(totalListeners);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cityId]);

  return (
    <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a1a24] flex items-center justify-center">
            <Users className="text-orange-400" />
          </div>
          <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Live Listeners</span>
        </div>
        {listenerCount > 0 && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        )}
      </div>
      <div>
        <h4 className="text-2xl font-bold text-white mb-1">{listenerCount.toLocaleString()}</h4>
        <p className="text-xs text-gray-500">Tuned in to {cityId}</p>
      </div>
    </div>
  );
}
