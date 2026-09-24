"use client";

import { useState } from "react";
import Link from "next/link";
import { MoveLeft, UploadCloud, Radio } from "lucide-react";

export default function VerifiedPortalPage() {
  const [email, setEmail] = useState("");
  const [station, setStation] = useState("hindi");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!file) {
      setMessage({ type: 'error', text: "Please select an audio file." });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("station", station);
      formData.append("file", file);

      const res = await fetch("/api/creators/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const expiryDate = new Date(data.expiresAt).toLocaleString();
      setMessage({ 
        type: 'success', 
        text: `Success! Your content has been submitted for review. If not approved, it will automatically expire on ${expiryDate}.` 
      });
      setFile(null); // Reset file input

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-brand-dark flex flex-col font-mono">
      <header className="border-b-4 border-brand-dark bg-white p-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/creators" className="hover:-translate-x-1 transition-transform">
          <div className="p-2 border-2 border-brand-dark shadow-brutal-sm bg-brand-yellow hover:bg-brand-dark hover:text-brand-yellow transition-colors">
            <MoveLeft className="w-6 h-6" />
          </div>
        </Link>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          Verified Creator Portal
        </h1>
      </header>

      <main className="flex-grow p-6 flex justify-center py-12">
        <div className="bg-white border-4 border-brand-dark p-6 md:p-10 shadow-brutal max-w-2xl w-full">
          <div className="mb-8 border-b-4 border-brand-dark pb-4 flex items-center gap-4">
            <div className="bg-brand-dark text-white p-3">
              <Radio className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase mb-1">Broadcast Upload</h2>
              <p className="font-medium text-gray-600">
                Submit audio for live broadcast.
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 mb-6 font-bold border-l-4 ${message.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-black uppercase text-sm">Verified Email</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-dark" 
                placeholder="registered@email.com" 
              />
              <p className="text-xs text-gray-500">You must use the email associated with your verified profile.</p>
            </div>

            <div className="space-y-2">
              <label className="font-black uppercase text-sm">Broadcast Station</label>
              <select 
                value={station}
                onChange={e => setStation(e.target.value)}
                className="w-full p-3 border-2 border-brand-dark bg-brand-light focus:outline-none cursor-pointer"
              >
                <option value="hindi">Hindi</option>
                <option value="punjabi">Punjabi</option>
                <option value="bundeli">Bundeli</option>
                <option value="chhattisgarhi">Chhattisgarhi</option>
                <option value="news">News & Talk</option>
                <option value="bhojpuri">Bhojpuri</option>
                <option value="haryanvi">Haryanvi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-black uppercase text-sm">Audio Track (MP3/WAV)</label>
              <div className="border-4 border-dashed border-brand-dark p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  required
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <UploadCloud className="w-12 h-12 text-brand-dark" />
                  {file ? (
                    <span className="font-bold text-brand-dark bg-brand-yellow/30 px-3 py-1 border-2 border-brand-dark">{file.name}</span>
                  ) : (
                    <span className="font-bold">Select Audio File</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-8 p-4 bg-brand-dark text-white font-black uppercase tracking-widest text-lg border-2 border-brand-dark hover:bg-black hover:shadow-brutal-hover active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Uploading..." : "Submit to Queue"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
