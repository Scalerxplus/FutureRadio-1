"use client";

import { useState, useEffect } from "react";
import { Save, Mic2, Languages, Music, Info } from "lucide-react";
import { saveStationSettings, getStationSettings } from "./actions";

export default function SettingsPage() {
  const [cityId, setCityId] = useState("raipur");
  const [voiceId, setVoiceId] = useState("pm");
  const [language, setLanguage] = useState("hi");
  const [rjPrompt, setRjPrompt] = useState("");
  const [playlistMood, setPlaylistMood] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await getStationSettings(cityId);
      if (data) {
        setVoiceId(data.voice_id || "pm");
        setLanguage(data.language || "hi");
        setRjPrompt(data.rj_prompt || "");
        setPlaylistMood(data.playlist_mood || "");
      }
    }
    load();
  }, [cityId]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveStationSettings(cityId, voiceId, language, rjPrompt, playlistMood);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Station Settings</h2>
        <p className="text-gray-400">Configure core Station AI behavior, voice, and language for the broadcast.</p>
      </header>

      <div className="space-y-8">
        {/* City Selector */}
        <div className="bg-[#111118] border border-[#1a1a24] p-6 rounded-2xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


          {/* Broadcast Language */}
          <div className="bg-[#111118] border border-[#1a1a24] p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-blue-400">
              <Languages size={24} />
              <h3 className="text-lg font-bold text-white">Broadcast Language</h3>
            </div>
            <p className="text-xs text-gray-400">Force the Station AI to use a specific linguistic constraint during script generation.</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-[#2a2a35] rounded-xl cursor-pointer hover:bg-[#1a1a24] transition-colors">
                <input type="radio" name="language" value="hi" checked={language === "hi"} onChange={() => setLanguage("hi")} className="w-4 h-4 accent-blue-500" />
                <div>
                  <div className="text-white font-bold">Hinglish / Hindi (Devenagari)</div>
                  <div className="text-[10px] text-gray-500">Natural Gen-Z mix of Hindi & English words</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-[#2a2a35] rounded-xl cursor-pointer hover:bg-[#1a1a24] transition-colors">
                <input type="radio" name="language" value="en" checked={language === "en"} onChange={() => setLanguage("en")} className="w-4 h-4 accent-blue-500" />
                <div>
                  <div className="text-white font-bold">Pure English</div>
                  <div className="text-[10px] text-gray-500">100% fluent American English (Global Club style)</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Overrides */}
        <div className="bg-[#111118] border border-[#1a1a24] p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 text-orange-400 border-b border-[#2a2a35] pb-4">
            <Info size={24} />
            <h3 className="text-lg font-bold text-white">Advanced Persona & Music Overrides</h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Custom Station Intelligence Prompt (Optional)</label>
            <p className="text-xs text-gray-500 mb-3">Overrides the default AI instructions. Leave blank to use defaults.</p>
            <textarea 
              value={rjPrompt}
              onChange={(e) => setRjPrompt(e.target.value)}
              placeholder="e.g., You are hosting a retro 90s show. Use 90s slang and talk about cassette tapes..."
              className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Playlist Mood Strategy Override (Optional)</label>
            <p className="text-xs text-gray-500 mb-3">Forces all music queries to follow this mood strategy.</p>
            <input 
              type="text"
              value={playlistMood}
              onChange={(e) => setPlaylistMood(e.target.value)}
              placeholder="e.g., High energy Punjabi trending songs"
              className="w-full bg-[#1a1a24] border border-[#2a2a35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Instant Broadcast */}
        <div className="bg-[#111118] border border-red-900/50 p-6 rounded-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600 animate-pulse"></div>
          <div className="flex items-center justify-between border-b border-[#2a2a35] pb-4">
            <div className="flex items-center gap-3 text-red-500">
              <Mic2 size={24} className="animate-pulse" />
              <h3 className="text-lg font-bold text-white">Instant Broadcast & Emergency Override</h3>
            </div>
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              High Priority
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-300 font-medium mb-1">Queue Insertion Strategy</p>
                <p className="text-xs text-gray-500 mb-4">Instant Broadcasts are automatically scheduled to play exactly after the 5th element in the current 'Now Playing' queue of the targeted station to ensure smooth crossfading.</p>
                
                <div className="p-4 bg-black/40 border border-[#2a2a35] rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Emergency Text-to-Speech</h4>
                    <p className="text-xs text-gray-500">Generate an AI voiceover announcement instantly.</p>
                  </div>
                  <button className="bg-[#1a1a24] hover:bg-[#2a2a35] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[#3a3a45]">
                    Open Editor
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <p className="text-sm text-gray-300 font-medium mb-1">Direct Audio Injection</p>
              <p className="text-xs text-gray-500 mb-4">If you already have a pre-produced high quality segment (e.g. Police Announcement), upload it directly to the Asset Manager as a <strong>Segment</strong>.</p>
              
              <a href="/admin/assets" className="block w-full text-center bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 font-bold py-4 rounded-xl transition-all">
                Upload Segment to Asset Manager
              </a>
            </div>
          </div>
        </div>


        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${
              saved ? "bg-green-500" : isSaving ? "bg-gray-600 cursor-not-allowed" : "bg-brand-primary hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(255,51,102,0.3)]"
            }`}
          >
            <Save size={20} />
            {saved ? "Settings Saved Live" : isSaving ? "Saving..." : "Deploy Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
