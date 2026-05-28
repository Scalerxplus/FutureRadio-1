"use client";

import { useState, useEffect } from "react";
import { Plus, List, Trash2, Mic2 } from "lucide-react";
import { saveJocktalkOverride, getPendingOverrides, deleteOverride } from "../settings/actions";

export default function ScriptCMSPage() {
  const [cityId, setCityId] = useState("raipur");
  const [topic, setTopic] = useState("");
  const [overrides, setOverrides] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadOverrides();
  }, [cityId]);

  async function loadOverrides() {
    const { data } = await getPendingOverrides(cityId);
    if (data) setOverrides(data);
  }

  const handleAdd = async () => {
    if (!topic.trim()) return;
    setIsSaving(true);
    await saveJocktalkOverride(cityId, topic);
    setTopic("");
    setIsSaving(false);
    loadOverrides();
  };

  const handleDelete = async (id: string) => {
    await deleteOverride(id);
    loadOverrides();
  };

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Human-In-The-Loop CMS</h2>
        <p className="text-gray-400">Manually feed precise news topics, scripts, or talking points to the AI RJ.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add New Script Section */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#111118] border border-[#1a1a24] p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-brand-primary mb-6">
              <Mic2 size={24} />
              <h3 className="text-lg font-bold text-white">Inject Topic or Script</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Target Station (City)</label>
                <select 
                  value={cityId} 
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="raipur">Raipur, CG</option>
                  <option value="indore">Indore, MP</option>
                  <option value="nagpur">Nagpur, MH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Script / Topic / Breaking News</label>
                <p className="text-xs text-gray-500 mb-3">
                  Type a few keywords (e.g. "Heavy rain alert in city") or write an exact script. The AI will weave this into the next generated broadcast block.
                  If you leave this empty in the system, the AI will strictly talk about the Weather and Music instead of hallucinating news.
                </p>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. City municipal corporation has announced a water cut tomorrow in Civil Lines..."
                  className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary h-40 resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleAdd}
                  disabled={isSaving || !topic.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  {isSaving ? "Injecting..." : "Inject to Generator Queue"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Queue Section */}
        <div className="col-span-1">
          <div className="bg-[#111118] border border-[#1a1a24] p-6 rounded-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <List size={20} />
                <h3 className="text-md font-bold text-white">Pending Queue</h3>
              </div>
              <span className="bg-[#2a2a35] text-xs px-2 py-1 rounded text-white">{overrides.length} items</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {overrides.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm italic border border-dashed border-[#2a2a35] rounded-xl">
                  Queue is empty.<br/><br/>The AI RJ will default to Weather & Song details for the next hour.
                </div>
              ) : (
                overrides.map((item) => (
                  <div key={item.id} className="bg-[#1a1a24] border border-[#2a2a35] p-3 rounded-xl relative group">
                    <p className="text-sm text-gray-200 line-clamp-3 pr-6">{item.topic_text}</p>
                    <div className="mt-2 text-[10px] text-gray-500 font-mono">
                      Target: {item.city_id.toUpperCase()} • Status: {item.status}
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
