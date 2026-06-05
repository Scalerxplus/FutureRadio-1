"use client";

import { useState, useRef } from "react";
import { UploadCloud, Music, XCircle, CheckCircle, Radio } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// We use the anon client for public uploads since RLS allows it for this HITL prototype
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AssetManagerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [bucket, setBucket] = useState<"jingles" | "sweepers" | "jocktalks" | "commercials" | "segments">("sweepers");
  const [station, setStation] = useState<string>("global");
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg("");
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      // Clean filename for URL safety
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const uploadPath = station === "global" ? fileName : `${station}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uploadPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMsg(err.message || "Failed to upload file. Check storage policies.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Audio Asset Manager</h2>
        <p className="text-gray-400">Upload new sweepers, station IDs, or advertisements to the cloud to be used in rotation.</p>
      </header>

      <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl overflow-hidden shadow-xl mb-8">
        <div className="p-6 border-b border-[#1a1a24] flex items-center justify-between bg-[#0d0d14]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
              <UploadCloud size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upload New Asset</h3>
              <p className="text-sm text-gray-400">Supports .mp3, .wav up to 10MB</p>
            </div>
          </div>
          
          <div className="flex bg-[#1a1a24] rounded-lg p-1">
            <button 
              onClick={() => setBucket("sweepers")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${bucket === 'sweepers' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Sweepers
            </button>
            <button 
              onClick={() => setBucket("jingles")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${bucket === 'jingles' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Jingles
            </button>
            <button 
              onClick={() => setBucket("jocktalks")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${bucket === 'jocktalks' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Jocktalks
            </button>
            <button 
              onClick={() => setBucket("commercials")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${bucket === 'commercials' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Commercials
            </button>
            <button 
              onClick={() => setBucket("segments")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${bucket === 'segments' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-gray-400 hover:text-red-400'}`}
              title="Urgent Announcements / Instant Broadcasts"
            >
              Segments
            </button>
          </div>
        </div>

        {/* Station Target Selector */}
        <div className="px-6 py-4 border-b border-[#1a1a24] bg-[#0d0d14] flex items-center justify-between">
          <div className="text-sm font-bold text-gray-400">Target Station Folder:</div>
          <select 
            value={station}
            onChange={(e) => setStation(e.target.value)}
            className="bg-[#1a1a24] border border-[#2a2a35] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 w-64"
          >
            <option value="global">Global (All Stations)</option>
            <option value="hindi">Hindi</option>
            <option value="bagheli">Bagheli</option>
            <option value="bundeli">Bundeli</option>
            <option value="chhattisgarhi">Chhattisgarhi</option>
            <option value="malwi">Malwi</option>
            <option value="sarguja">Sarguja</option>
            <option value="bastar">Bastar</option>
            <option value="raigarh">Raigarh</option>
            <option value="punjabi">Punjabi</option>
            <option value="news">News & Talk</option>
          </select>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-[#2a2a34] rounded-xl p-12 flex flex-col items-center justify-center bg-[#15151e] hover:bg-[#1a1a24] transition-colors cursor-pointer relative">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="audio/mpeg,audio/wav"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {file ? (
              <div className="flex flex-col items-center text-center">
                <Music size={48} className="text-blue-500 mb-4" />
                <p className="text-lg font-bold text-white mb-1">{file.name}</p>
                <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Radio size={48} className="text-gray-600 mb-4" />
                <p className="text-lg font-medium text-gray-300 mb-1">Drag & Drop Audio File Here</p>
                <p className="text-sm text-gray-500">or click to browse from your computer</p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/30 flex items-center gap-3 text-red-400">
              <XCircle size={18} />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                success 
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle size={18} /> Uploaded to {bucket}
                </>
              ) : (
                <>
                  <UploadCloud size={18} /> Upload to Server
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
