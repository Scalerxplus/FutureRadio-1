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
