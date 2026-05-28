"use client";

import { useState, useEffect, useRef } from "react";
import { Music, Mic2, AlertCircle, Trash2, Edit3, PlusCircle, Clock, Volume2, Target, X, Check } from "lucide-react";
import { updateScheduleElement } from "./actions";

export default function ScheduleClient({ initialSchedule }: { initialSchedule: any[] }) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [now, setNow] = useState(new Date());
  const liveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Edit Modal State
  const [editingElement, setEditingElement] = useState<any>(null);
  const [editValue, setEditValue] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Update 'now' every second to keep 'Live Now' accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on mount
  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const scrollToLive = () => {
    if (liveRef.current) {
      liveRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleEditClick = (element: any) => {
    setEditingElement(element);
    if (element.element_type === 'song') {
      setEditValue(element.youtube_id || "");
      setEditTitle(element.metadata?.title || "");
    } else {
      setEditValue(element.media_url || "");
      setEditTitle(element.metadata?.title || "Station Branding");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingElement) return;
    setIsSaving(true);
    
    const updates: any = {};
    if (editingElement.element_type === 'song') {
      updates.youtube_id = editValue;
      updates.metadata = { ...editingElement.metadata, title: editTitle };
    } else {
      updates.media_url = editValue;
      updates.metadata = { ...editingElement.metadata, title: editTitle };
    }

    const res = await updateScheduleElement(editingElement.id, updates);
    
    if (res.success) {
      // Optimistic Local Update
      setSchedule(prev => prev.map(block => ({
        ...block,
        elements: block.elements.map((el: any) => 
          el.id === editingElement.id ? { ...el, ...updates } : el
        )
      })));
      setEditingElement(null);
    } else {
      alert("Failed to update element.");
    }
    setIsSaving(false);
  };

  return (
    <div className="p-8 pb-24" ref={containerRef}>
      
      {/* --- HITL EDIT MODAL --- */}
      {editingElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setEditingElement(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Replace Master Element</h3>
            <p className="text-xs text-gray-400 mb-6">Changes will take effect instantly for all live listeners if this element is > 60s away.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Target Element Type</label>
                <div className="flex items-center gap-2 mb-2">
                  <TypeBadge type={editingElement.element_type} />
                </div>
              </div>

              {editingElement.element_type === "song" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">New YouTube Video ID</label>
                    <input 
                      type="text" 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)}
                      placeholder="e.g. kJQP7kiw5Fk"
                      className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Song Display Title</label>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">New Audio File URL</label>
                    <select 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)}
                      className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                    >
                      <optgroup label="Sweepers (High Energy)">
                        <option value="/audio/Sweepers/Future_Sweeper_High_Energy.mp3">Future Sweeper High Energy</option>
                        <option value="/audio/Sweepers/Future_Sweeper_High_Energy_Fun.mp3">Future Sweeper High Energy Fun</option>
                        <option value="/audio/Sweepers/Future_Sweeper_High_Energy_India.mp3">Future Sweeper High Energy India</option>
                        <option value="/audio/Sweepers/Sweeper_Desi_High_Energy_01.mp3">Desi High Energy 01</option>
                        <option value="/audio/Sweepers/Sweeper_Edm_High_Energy_01.mp3">EDM High Energy 01</option>
                        <option value="/audio/Sweepers/Sweeper_Edm_High_Energy_02.mp3">EDM High Energy 02</option>
                        <option value="/audio/Sweepers/Sweeper_Edm_High_Energy_03.mp3">EDM High Energy 03</option>
                        <option value="/audio/Sweepers/Sweeper_Edm_High_Energy_04.mp3">EDM High Energy 04</option>
                        <option value="/audio/Sweepers/Sweeper_EDM_High_Energy_05.mp3">EDM High Energy 05</option>
                      </optgroup>
                      <optgroup label="Sweepers (Mid/Low Energy)">
                        <option value="/audio/Sweepers/Future_Sweeper_Mid_Energy_.mp3">Future Sweeper Mid Energy</option>
                        <option value="/audio/Sweepers/Sweeper_MidEnergy_01.mp3">Mid Energy 01</option>
                        <option value="/audio/Sweepers/Sweeper_MidEnergy_02.mp3">Mid Energy 02</option>
                        <option value="/audio/Sweepers/Sweeper_LoFi_01.mp3">LoFi 01</option>
                        <option value="/audio/Sweepers/Sweeper_LoFi_02.mp3">LoFi 02</option>
                        <option value="/audio/Sweepers/Sweeper_LoFi_03.mp3">LoFi 03</option>
                        <option value="/audio/Sweepers/Sweeper_LoFi_04.mp3">LoFi 04</option>
                      </optgroup>
                      <optgroup label="Station IDs">
                        <option value="/audio/jingles/Station_Jingle_EDM.mp3">Station ID EDM</option>
                        <option value="/audio/jingles/Station_Jingle_Mid.mp3">Station ID Mid</option>
                        <option value="/audio/jingles/Station_Jingle_LoFi.mp3">Station ID LoFi</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Display Title</label>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </>
              )}

              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
              >
                <Check size={18} />
                {isSaving ? "Injecting Update..." : "Force Override Element"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 flex justify-between items-end sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-md z-10 py-4 border-b border-[#1a1a24] -mx-8 px-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">24-Hour Master Playlist</h2>
          <p className="text-gray-400">Complete bird's-eye view of today's Hot Clock programming.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={scrollToLive}
            className="flex items-center gap-2 bg-[#1a1a24] hover:bg-[#2a2a35] text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-[#2a2a35]"
          >
            <Target size={18} className="text-red-500" />
            Now Playing
          </button>
          <button className="flex items-center gap-2 bg-brand-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <PlusCircle size={18} />
            Inject Element
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {schedule.map((block) => (
          <div key={`hour-${block.hour}`} className="bg-[#111118] border border-[#1a1a24] rounded-2xl overflow-hidden">
            {/* Hour Header */}
            <div className={`p-4 border-b border-[#1a1a24] flex items-center justify-between ${block.isActive ? 'bg-[#1a1a24]' : 'bg-[#0d0d14]'}`}>
              <div className="flex items-center gap-3">
                <Clock className={block.show.color} size={20} />
                <h3 className={`text-lg font-bold ${block.show.color}`}>
                  {block.hour.toString().padStart(2, '0')}:00 - {block.show.name}
                </h3>
                {!block.isActive && (
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
                    Placeholder Mode
                  </span>
                )}
                {block.isActive && (
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-green-900/30 text-green-400 border border-green-800">
                    Scripted & Generated
                  </span>
                )}
              </div>
            </div>

            {/* Elements Header */}
            <div className="grid grid-cols-12 gap-4 p-3 border-b border-[#1a1a24] text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-black/20">
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-5">Content / Title</div>
              <div className="col-span-1 text-right">Dur</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Elements List */}
            <div className="divide-y divide-[#1a1a24]">
              {block.elements.map((element: any) => {
                const startTime = new Date(element.start_time);
                const endTime = new Date(element.end_time);
                const isPlayingNow = now >= startTime && now < endTime && !element.isPlaceholder;
                const isPast = now >= endTime && !element.isPlaceholder;
                
                const isPlaceholder = element.isPlaceholder;
                const isStatic = element.isStatic;
                const canEdit = !isPast && !isPlaceholder && (element.element_type === 'song' || element.element_type === 'sweeper' || element.element_type === 'station_id');

                return (
                  <div 
                    key={element.id} 
                    ref={isPlayingNow ? liveRef : null}
                    className={`grid grid-cols-12 gap-4 p-3 items-center transition-colors ${
                      isPlayingNow ? 'bg-red-900/10 border-l-2 border-red-500' : 
                      isPast ? 'opacity-40 grayscale hover:grayscale-0' : 
                      isPlaceholder ? 'opacity-70 border-l-2 border-dashed border-gray-700 bg-transparent' : 'hover:bg-[#1a1a24]/50'
                    }`}
                  >
                    <div className="col-span-2 flex flex-col">
                      <span className={`font-mono text-xs ${isPlayingNow ? 'text-red-400 font-bold' : isPlaceholder ? 'text-gray-500' : 'text-gray-300'}`}>
                        {startTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {isPlayingNow && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-[9px] text-red-500 uppercase font-bold tracking-widest">Live Now</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2 flex items-center gap-2">
                      <TypeBadge type={element.element_type} isStatic={isStatic} />
                    </div>

                    <div className="col-span-5 flex flex-col justify-center">
                      <p className={`font-medium truncate text-sm ${isPlayingNow ? 'text-white' : isPlaceholder && !isStatic ? 'text-gray-400 italic' : 'text-gray-200'}`}>
                        {element.metadata?.title || element.metadata?.transcript?.substring(0, 50) + "..." || "Station ID"}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {isPlaceholder ? element.metadata?.subtitle : (element.element_type === 'song' ? `YT: ${element.youtube_id}` : element.media_url)}
                      </p>
                    </div>

                    <div className="col-span-1 text-right text-xs text-gray-400 font-mono">
                      {(element.duration_ms / 1000).toFixed(0)}s
                    </div>

                    <div className="col-span-2 flex justify-end gap-1">
                      <button 
                        onClick={() => handleEditClick(element)}
                        className="p-1.5 rounded hover:bg-[#222230] text-gray-500 hover:text-white transition-colors disabled:opacity-20" 
                        disabled={!canEdit}
                        title={canEdit ? "Replace Element" : "Cannot edit past/placeholder elements"}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-20" disabled={isPast || isPlayingNow || isPlaceholder}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeBadge({ type, isStatic }: { type: string, isStatic?: boolean }) {
  if (type === "song") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold uppercase tracking-wider">
        <Music size={10} /> Song
      </span>
    );
  }
  if (type === "jocktalk") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold uppercase tracking-wider">
        <Mic2 size={10} /> Jocktalk
      </span>
    );
  }
  if (type === "ad") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-semibold uppercase tracking-wider">
        <Volume2 size={10} /> Sponsor
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${isStatic ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'} border`}>
      <AlertCircle size={10} /> Branding
    </span>
  );
}
