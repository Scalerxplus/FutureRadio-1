"use client";

import { useState } from "react";
import Link from "next/link";
import { MoveLeft, UploadCloud, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Note: For real deployment, use environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    creator_type: "music",
    target_station: "hindi"
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!file) {
      setErrorMsg("Please upload an audio sample.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // 1. Upload file to Supabase Storage (requires a 'creator-uploads' bucket)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `applications/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error("Failed to upload audio sample. Please check if the storage bucket is configured.");
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('creator-uploads')
        .getPublicUrl(filePath);

      // 3. Insert Application into Database
      const { error: dbError } = await supabase
        .from('creator_applications')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            type: formData.creator_type,
            target_station: formData.target_station,
            sample_file_url: publicUrl,
            status: 'pending'
          }
        ]);

      if (dbError) {
        throw new Error(dbError.message);
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-red flex items-center justify-center p-6 font-mono">
        <div className="bg-white border-4 border-brand-dark p-8 md:p-12 shadow-brutal max-w-xl text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-black uppercase">Application Received</h1>
          <p className="font-medium text-lg text-gray-700">
            Thank you for applying to join the Future Radio Creators Network. Our content team will review your audio sample. If approved, you will receive an email with your Verified Creator Profile details!
          </p>
          <Link href="/" className="inline-block px-8 py-4 bg-brand-yellow border-2 border-brand-dark font-black uppercase tracking-wider hover:-translate-y-1 hover:shadow-brutal transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-red text-brand-dark flex flex-col font-mono">
      <header className="border-b-4 border-brand-dark bg-white p-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/creators" className="hover:-translate-x-1 transition-transform">
          <div className="p-2 border-2 border-brand-dark shadow-brutal-sm bg-brand-yellow hover:bg-brand-dark hover:text-brand-yellow transition-colors">
            <MoveLeft className="w-6 h-6" />
          </div>
        </Link>
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
          Creator Application
        </h1>
      </header>

      <main className="flex-grow p-6 flex justify-center py-12">
        <div className="bg-white border-4 border-brand-dark p-6 md:p-10 shadow-brutal max-w-2xl w-full">
          <div className="mb-8 border-b-4 border-brand-dark pb-4">
            <h2 className="text-3xl font-black uppercase mb-2">Join the Network</h2>
            <p className="font-medium text-gray-600">
              Submit your creative audio sample. All uploads are manually reviewed by our human-in-the-loop content team.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-black uppercase text-sm">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border-2 border-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-red" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase text-sm">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border-2 border-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-red" 
                  placeholder="hello@example.com" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-black uppercase text-sm">WhatsApp / Phone</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border-2 border-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-red" 
                  placeholder="+91 9999999999" 
                />
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase text-sm">Creator Type</label>
                <select 
                  value={formData.creator_type}
                  onChange={e => setFormData({...formData, creator_type: e.target.value})}
                  className="w-full p-3 border-2 border-brand-dark bg-brand-light focus:outline-none cursor-pointer"
                >
                  <option value="music">Music Creator (Original Tracks)</option>
                  <option value="radio">Radio Creator (Talks / Segments)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-black uppercase text-sm">Target Station</label>
              <select 
                value={formData.target_station}
                onChange={e => setFormData({...formData, target_station: e.target.value})}
                className="w-full p-3 border-2 border-brand-dark bg-brand-light focus:outline-none cursor-pointer"
              >
                <option value="hindi">Hindi</option>
                <option value="punjabi">Punjabi</option>
                <option value="bundeli">Bundeli</option>
                <option value="bagheli">Bagheli</option>
                <option value="chhattisgarhi">Chhattisgarhi</option>
                <option value="malwi">Malwi</option>
                <option value="sarguja">Sarguja</option>
                <option value="bastar">Bastar</option>
                <option value="raigarh">Raigarh</option>
                <option value="news">News & Talk</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-black uppercase text-sm">Upload Creative Sample (MP3/WAV)</label>
              <div className="border-4 border-dashed border-brand-dark p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  required
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <UploadCloud className="w-12 h-12 text-brand-red" />
                  {file ? (
                    <span className="font-bold text-green-600 bg-green-100 px-3 py-1 border-2 border-green-600">{file.name}</span>
                  ) : (
                    <span className="font-bold">Click to browse or drag & drop</span>
                  )}
                  <span className="text-sm font-medium text-gray-500">Max size 20MB</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-8 p-4 bg-brand-dark text-white font-black uppercase tracking-widest text-lg border-2 border-brand-dark hover:bg-brand-red hover:shadow-brutal-hover active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
            >
              {isSubmitting ? "Uploading & Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
