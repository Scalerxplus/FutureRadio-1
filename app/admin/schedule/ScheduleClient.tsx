"use client";

import { useState, useEffect, useRef } from "react";
import { Music, Mic2, AlertCircle, Trash2, Edit3, PlusCircle, Clock, Volume2, Target, X, Check, Lock, UploadCloud } from "lucide-react";
import { updateScheduleElement } from "./actions";
import LibraryPane from "@/components/admin/LibraryPane";
import MixingConsole from "@/components/admin/MixingConsole";

export default function ScheduleClient({ initialSchedule, currentChannel }: { initialSchedule: any[], currentChannel: string }) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [now, setNow] = useState(new Date());
  const liveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout UI States
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field (like search or edit modals)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key.toLowerCase() === 'm') {
        setIsMixerOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'l') {
        setIsRightPanelOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Upload Jocktalk State
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, element: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("audio")) {
      alert("Please upload a valid audio file (mp3, wav, etc.)");
      return;
    }

    setIsUploading(element.id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("start_time", element.start_time);
      formData.append("end_time", element.end_time);
      formData.append("city_id", element.city_id || currentChannel);

      const res = await fetch("/api/admin/upload-jocktalk", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Jocktalk uploaded and scheduled successfully!");
        window.location.reload(); // Re-sync the master clock schedule to show the real block
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(null);
    }
  };

  // Edit Modal State
  const [editingElement, setEditingElement] = useState<any>(null);
  const [editValue, setEditValue] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Batch Generation State
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Diagnostics State
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const handleRunDiagnostics = async () => {
    if (!confirm("Run System Diagnostics? This will scan the next 24 hours for overlaps or missing data and automatically rebuild corrupted hours.")) return;
    
    setIsRunningDiagnostics(true);
    try {
      const res = await fetch("/api/cron/self-healing");
      const data = await res.json();
      if (data.success) {
        alert(`Diagnostics Complete.\nIssues Found: ${data.issuesFound}\nHealed: ${data.healed}\nDetails:\n${data.details.join("\\n")}`);
        if (data.healed > 0) window.location.reload();
      } else {
        alert("Diagnostics failed: " + data.error);
      }
    } catch (err) {
      alert("Failed to run diagnostics.");
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleGenerateTomorrow = async () => {
    if (!confirm("Are you sure you want to generate the next 24 hours of programming? This will take a few minutes.")) return;
    
    setIsGeneratingBatch(true);
    setGenerationProgress(0);
    
    try {
      const nowUtc = new Date();
      // Add 5.5 hours to get current IST time mapped onto UTC methods
      const istTimeMs = nowUtc.getTime() + (5.5 * 60 * 60 * 1000);
      
      for (let i = 0; i < 24; i++) {
        const targetIst = new Date(istTimeMs);
        // Start from the CURRENT full hour (current hour + i)
        targetIst.setUTCHours(targetIst.getUTCHours() + i, 0, 0, 0);
        
        const year = targetIst.getUTCFullYear();
        const month = String(targetIst.getUTCMonth() + 1).padStart(2, '0');
        const day = String(targetIst.getUTCDate()).padStart(2, '0');
        const hourStr = String(targetIst.getUTCHours()).padStart(2, '0');
        
        const istIsoString = `${year}-${month}-${day}T${hourStr}:00:00+05:30`;
        
        await fetch(`/api/broadcast/generate-hour?city=${currentChannel}&startTime=${encodeURIComponent(istIsoString)}`, { method: "POST" });
        setGenerationProgress(i + 1);
      }
      alert("Next 24 hours generated successfully! Master clock is now future-proof.");
      window.location.reload();
    } catch (err) {
      alert("Failed to complete batch generation.");
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Update 'now' every second to keep 'Live Now' accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on mount with slight delay to ensure DOM is ready
  useEffect(() => {
    setTimeout(() => {
      if (liveRef.current) {
        liveRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);
  }, []);

  const scrollToLive = () => {
    if (liveRef.current) {
      liveRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSkip = async () => {
    const reason = prompt("Emergency Skip Reason (e.g. Offensive content, Dead air):", "Manual skip via Admin Dashboard");
    if (reason === null) return;
    if (!confirm(`Are you sure you want to Emergency Skip the currently playing element?\nReason: ${reason}`)) return;
    
    try {
      const res = await fetch("/api/broadcast/skip", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        alert("Skipped! The next track is now live.");
        window.location.reload();
      } else {
        alert("Skip failed: " + data.error);
      }
    } catch (err) {
      alert("Skip failed.");
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

  const handleDropAsset = async (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData("application/json");
    if (!dataString) return;

    try {
      const data = JSON.parse(dataString);
      if (data.type === "library_asset") {
        await updateScheduleElement(elementId, {
          media_url: data.url,
          "metadata->isEmptyPlaceholder": false,
          "metadata->title": data.name
        });
        window.location.reload();
      }
    } catch (err) {
      console.error("Drop failed:", err);
      alert("Failed to assign Jocktalk to this slot.");
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

  const flatElements = schedule.flatMap(b => b.elements);
  const currentActive = flatElements.find(el => new Date(el.end_time) > now && !el.isPlaceholder) 
                     || flatElements.find(el => new Date(el.end_time) > now) 
                     || flatElements[0];
  const activeElementId = currentActive?.id;

  let currentDeckTracker = "A";

  return (
    <div className="h-full flex relative overflow-hidden bg-[#050505]">
      {/* Left Column: Live Schedule */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
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
            <p className="text-xs text-gray-400 mb-6">Changes will take effect instantly for all live listeners if this element is &gt; 60s away.</p>
            
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

      {/* Pinned Top Area: Header & Mixing Console */}
      <div className="shrink-0 px-8 pt-6 pb-2 border-b border-[#1a1a24] bg-[#0a0a0f]/95 backdrop-blur-md z-20">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">24-Hour Master Playlist</h2>
            <p className="text-gray-400">Complete bird's-eye view of today's Hot Clock programming.</p>
          </div>
          <div>
            <select 
              value={currentChannel}
              onChange={(e) => window.location.href = `/admin/schedule?channel=${e.target.value}`}
              className="bg-[#111118] border border-[#2a2a35] text-white rounded-lg px-4 py-2 text-sm font-bold shadow-lg"
            >
              <option value="hindi">Future Radio - Hindi</option>
              <option value="malwi">Future Radio - Malwi</option>
              <option value="bagheli">Future Radio - Bagheli</option>
              <option value="bundeli">Future Radio - Bundeli</option>
              <option value="chhattisgarhi">Future Radio - Chhattisgarhi</option>
              <option value="sarguja">Future Radio - Sarguja/Ambikapur</option>
              <option value="bastar">Future Radio - Bastar/Jagdalpur</option>
              <option value="raigarh">Future Radio - Raigarh</option>
              <option value="punjabi">Future Radio - Punjabi</option>
              <option value="news">Future Radio - News</option>
            </select>
          </div>
        </header>

        {/* --- LIVE MIXING CONSOLE --- */}
        <div className={`transition-all duration-500 origin-top overflow-hidden ${isMixerOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 mb-0'}`}>
          <MixingConsole schedule={schedule} now={now} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-24 pt-6" ref={containerRef}>
        {/* Batch Generation Progress Overlay */}
        {isGeneratingBatch && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
            <div className="bg-[#111118] p-8 rounded-2xl border border-[#2a2a35] flex flex-col items-center max-w-md w-full">
              <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-white mb-2">Automating Tomorrow's Schedule</h3>
              <p className="text-gray-400 mb-6 text-center">Generating AI elements for each hour of the day. Do not close this window.</p>
              <div className="w-full bg-[#1a1a24] rounded-full h-4 mb-2 overflow-hidden border border-[#2a2a35]">
                <div 
                  className="bg-gradient-to-r from-brand-red to-white h-full transition-all duration-300"
                  style={{ width: `${(generationProgress / 24) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-brand-red font-bold tracking-widest">{Math.round((generationProgress / 24) * 100)}% COMPLETE ({generationProgress}/24 HOURS)</p>
            </div>
          </div>
        )}

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
                const isPlayingNow = element.id === activeElementId;
                const isPast = now >= endTime && !element.isPlaceholder;
                const isSkipped = element.status === 'skipped';
                const isPlayed = isPast && !isSkipped;
                
                const isPlaceholder = element.isPlaceholder || element.metadata?.isEmptyPlaceholder;
                const isStatic = element.isStatic;
                const timeDiffMs = new Date(element.start_time).getTime() - now.getTime();
                const isLocked = timeDiffMs < 60 * 60 * 1000; // 1-Hour Lock
                const canEdit = !isPast && !isPlaceholder && !isLocked && (element.element_type === 'song' || element.element_type === 'sweeper' || element.element_type === 'station_id');
                const isDropTarget = isPlaceholder && element.element_type === 'jocktalk' && !isPast;

                let elementDeck = null;
                if (element.element_type === 'song' && !element.isPlaceholder) {
                  currentDeckTracker = currentDeckTracker === "A" ? "B" : "A";
                  elementDeck = currentDeckTracker;
                }

                return (
                  <div 
                    key={element.id} 
                    ref={isPlayingNow ? liveRef : null}
                    onDragOver={(e) => {
                      if (isDropTarget && !isLocked) {
                        e.preventDefault(); // allow drop
                      }
                    }}
                    onDrop={(e) => {
                      if (isDropTarget && !isLocked) {
                        handleDropAsset(e, element.id);
                      } else if (isDropTarget && isLocked) {
                        alert("1-Hour Lock: You cannot modify elements scheduled to play within the next hour.");
                      }
                    }}
                    className={`grid grid-cols-12 gap-4 p-3 items-center transition-all rounded-lg my-1 ${
                      isPlayingNow ? 'bg-red-900/10 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] relative z-10' : 
                      isSkipped ? 'opacity-50 grayscale bg-red-900/5 border border-transparent' :
                      isPast ? 'opacity-40 grayscale hover:grayscale-0 border border-transparent' : 
                      isDropTarget && !isLocked ? 'opacity-90 border-2 border-dashed border-brand-red bg-brand-red/5 hover:bg-brand-red/10' :
                      isDropTarget && isLocked ? 'opacity-60 border-2 border-dashed border-gray-600 bg-gray-900/30 cursor-not-allowed' :
                      isPlaceholder ? 'opacity-70 border border-dashed border-[#2a2a35] bg-transparent' : 'border border-transparent hover:bg-[#1a1a24]/50 hover:border-[#2a2a35]'
                    }`}
                  >
                    {isPlayingNow && (
                      <div className="absolute inset-0 rounded-lg ring-1 ring-red-500/50 animate-pulse pointer-events-none"></div>
                    )}
                    <div className="col-span-2 flex flex-col pl-2">
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
                    
                    <div className="col-span-2 flex flex-col items-start justify-center gap-1">
                      <TypeBadge type={element.element_type} isStatic={isStatic} />
                      {elementDeck && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider ${
                          elementDeck === 'A' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'
                        }`}>
                          DECK {elementDeck}
                        </span>
                      )}
                    </div>

                    <div className="col-span-5 flex items-center gap-3">
                      {/* Album Art / Icon Thumbnail */}
                      <div className={`w-10 h-10 rounded shrink-0 flex items-center justify-center border shadow-inner ${
                        element.element_type === 'song' ? 'bg-[#1a1a24] border-[#2a2a35] text-blue-400' :
                        element.element_type === 'jocktalk' ? 'bg-purple-900/20 border-purple-500/20 text-purple-400' :
                        'bg-orange-900/20 border-orange-500/20 text-orange-400'
                      }`}>
                        {element.element_type === 'song' ? <Music size={16} /> : element.element_type === 'jocktalk' ? <Mic2 size={16} /> : <Target size={16} />}
                      </div>

                      <div className="flex flex-col justify-center min-w-0">
                        <p className={`font-medium truncate text-sm ${isPlayingNow ? 'text-white' : isSkipped ? 'line-through text-red-400' : isPlaceholder && !isStatic ? 'text-gray-400 italic' : 'text-gray-200'}`}>
                          {element.metadata?.title || element.metadata?.transcript?.substring(0, 50) + "..." || "Station ID"}
                        </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {isSkipped ? (
                          <span className="text-red-400 font-bold">Skipped: {element.status_reason}</span>
                        ) : isPlayed ? (
                          <span className="text-green-500 font-bold">Played / Expired</span>
                        ) : isPlaceholder ? (
                          element.metadata?.subtitle
                        ) : (
                          element.element_type === 'song' ? `YT: ${element.youtube_id}` : element.media_url
                        )}
                      </p>
                    </div>
                    </div>

                    <div className="col-span-1 text-right text-xs text-gray-400 font-mono">
                      {(element.duration_ms / 1000).toFixed(0)}s
                    </div>

                    <div className="col-span-2 flex justify-end gap-1">
                      {isDropTarget ? (
                        <div className="relative group flex items-center justify-center">
                          <input 
                            type="file" 
                            accept="audio/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                            disabled={isLocked || isUploading === element.id}
                            title={isLocked ? "1-Hour Lock: Cannot upload too close to broadcast" : "Upload Audio (MP3/WAV)"}
                            onChange={(e) => handleFileUpload(e, element)}
                          />
                          <button 
                            className={`p-1.5 rounded transition-colors ${isLocked ? 'text-gray-600 bg-gray-900/50 cursor-not-allowed' : 'text-purple-400 bg-purple-900/20 group-hover:bg-purple-900/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]'} disabled:opacity-20`}
                            disabled={isLocked || isUploading === element.id}
                            title={isLocked ? "1-Hour Lock Active" : "Upload Custom Voiceover"}
                          >
                            {isUploading === element.id ? <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={14} />}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(element)}
                          className="p-1.5 rounded hover:bg-[#222230] text-gray-500 hover:text-white transition-colors disabled:opacity-20" 
                          disabled={!canEdit}
                          title={canEdit ? "Replace Element" : "Cannot edit past/placeholder elements"}
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                      
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
      </div>
      
      {/* Right Column: Control Panel */}
      <div className={`transition-all duration-300 border-l border-[#1a1a24] bg-[#0d0d14] flex flex-col h-full shrink-0 overflow-hidden ${isRightPanelOpen ? "w-80" : "w-0 border-l-0"}`}>
        
        {/* Right Panel Header - Toggle & Mixer Hotkey */}
        <div className="p-4 border-b border-[#1a1a24] bg-[#111118] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMixerOpen(!isMixerOpen)}
              className={`p-2 rounded-lg transition-all duration-300 border active:scale-90 ${isMixerOpen ? 'bg-gradient-to-t from-red-600 to-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6),inset_0_2px_4px_rgba(255,255,255,0.4)]' : 'bg-[#1a1a24] text-gray-400 hover:text-white border-[#2a2a35] hover:border-gray-500 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]'}`}
              title="Toggle Live Mixing Console (Hotkey: M)"
            >
              <Volume2 size={16} className={isMixerOpen ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''} />
            </button>
            <span className="text-xs font-bold text-gray-400">MIXER (M)</span>
          </div>
          <button 
            onClick={() => setIsRightPanelOpen(false)}
            className="p-1 rounded text-gray-500 hover:text-white transition-colors"
            title="Close Panel (Hotkey: L)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons (2x2 Grid) */}
        <div className="p-4 grid grid-cols-2 gap-3 shrink-0">
          <button 
            onClick={scrollToLive}
            className="group flex flex-col justify-center items-center gap-2 bg-[#1a1a24] hover:bg-[#20202c] text-gray-400 hover:text-white aspect-square rounded-[24px] font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-[#2a2a35] hover:border-red-500/50 active:scale-95 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          >
            <Target size={28} className="text-red-500 group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] transition-all" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Now Playing</span>
          </button>
          
          <button 
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="group flex flex-col justify-center items-center gap-2 bg-[#1a1a24] hover:bg-[#20202c] text-gray-400 hover:text-white aspect-square rounded-[24px] font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-[#2a2a35] hover:border-blue-500/50 active:scale-95 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] disabled:opacity-50"
          >
            <AlertCircle size={28} className="text-blue-500 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-center px-1 leading-tight">{isRunningDiagnostics ? "Scanning" : "Diagnostics"}</span>
          </button>
          
          <button 
            onClick={handleGenerateTomorrow}
            disabled={isGeneratingBatch}
            className="group flex flex-col justify-center items-center gap-2 bg-[#1a1a24] hover:bg-[#20202c] text-gray-400 hover:text-white aspect-square rounded-[24px] font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-[#2a2a35] hover:border-purple-500/50 active:scale-95 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] disabled:opacity-50"
          >
            <PlusCircle size={28} className="text-purple-500 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-all" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-center px-1 leading-tight">{isGeneratingBatch ? `Gen ${generationProgress}/24` : "Auto-Gen"}</span>
          </button>
          
          <button 
            onClick={handleSkip}
            className="group flex flex-col justify-center items-center gap-2 bg-[#1a1a24] hover:bg-[#20202c] text-gray-400 hover:text-white aspect-square rounded-[24px] font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-[#2a2a35] hover:border-orange-500/50 active:scale-95 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 group-hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] transition-all"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
            <span className="text-[10px] uppercase tracking-wider font-bold">Skip Live</span>
          </button>
        </div>

        {/* Collapsible Asset Library */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <button 
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="px-4 py-3 bg-[#111118] border-y border-[#1a1a24] flex items-center justify-between text-sm font-bold text-gray-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Music size={16} className="text-brand-red" />
              Asset Library
            </span>
            <span className="text-xs text-gray-500">{isLibraryOpen ? 'Hide' : 'Show'}</span>
          </button>
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${isLibraryOpen ? 'opacity-100' : 'max-h-0 opacity-0'}`}>
            <LibraryPane />
          </div>
        </div>
      </div>
      
      {/* Floating Toggle if panel is closed */}
      {!isRightPanelOpen && (
        <button 
          onClick={() => setIsRightPanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#111118] border border-r-0 border-[#2a2a35] text-gray-400 hover:text-white p-2 rounded-l-xl shadow-2xl z-50 transition-colors"
          title="Open Control Panel (Hotkey: L)"
        >
          <div className="flex flex-col gap-4 items-center">
             <span className="text-[10px] uppercase font-bold writing-vertical-lr rotate-180 tracking-widest text-brand-red">Controls</span>
          </div>
        </button>
      )}

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
