"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoveLeft, Play, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  target_station: string;
  sample_file_url: string;
  status: string;
  created_at: string;
};

export default function AdminReviewPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('creator_applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (appId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      // Update status in creator_applications
      const { error: updateError } = await supabase
        .from('creator_applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (updateError) throw updateError;

      // If approved, insert into verified_creators
      if (action === 'approve') {
        const appToApprove = applications.find(app => app.id === appId);
        if (appToApprove) {
          const { error: insertError } = await supabase
            .from('verified_creators')
            .insert([{
              application_id: appToApprove.id,
              name: appToApprove.name,
              email: appToApprove.email,
              type: appToApprove.type
            }]);
          
          if (insertError) throw insertError;
        }
      }

      // Remove from UI list
      setApplications(apps => apps.filter(app => app.id !== appId));
      alert(`Application ${action}d successfully!`);

    } catch (err: any) {
      console.error(err);
      alert("Action failed: " + err.message);
    }
  };

  return (
    <div className="p-8 font-sans">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/creators" className="hover:-translate-x-1 transition-transform">
            <div className="p-2 border-2 border-white/20 rounded-lg hover:border-white transition-colors bg-[#111118]">
              <MoveLeft className="w-5 h-5 text-gray-300" />
            </div>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Content Audit</h2>
            <p className="text-gray-400">Review pending creator applications and audio samples.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-400 uppercase tracking-wide">
            {applications.length} Pending
          </span>
        </div>
      </header>

      <main className="w-full">
        {loading ? (
          <div className="text-center py-20 animate-pulse font-bold text-xl text-gray-500">Loading Queue...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-[#111118] border border-[#1a1a24] rounded-2xl">
            <h2 className="text-3xl font-black text-gray-600 uppercase tracking-widest">No Pending Applications</h2>
            <p className="mt-4 text-gray-500">The queue is currently empty.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-[#111118] border border-[#1a1a24] rounded-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Details Section */}
                <div className="p-6 flex-grow border-b md:border-b-0 md:border-r border-[#1a1a24] space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-white">{app.name}</h3>
                      <p className="text-gray-400 font-mono text-sm">{app.email} • {app.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
                        {app.type} Creator
                      </span>
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
                        {app.target_station}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[#1a1a24]">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Submitted Audio Sample</p>
                    <audio controls src={app.sample_file_url} className="w-full h-10 outline-none grayscale invert" controlsList="nodownload"></audio>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="bg-[#0d0d14] p-6 md:w-64 flex flex-col justify-center gap-3 shrink-0">
                  <button 
                    onClick={() => handleAction(app.id, 'approve')}
                    className="w-full flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    <CheckCircle className="w-5 h-5" />
                    APPROVE
                  </button>
                  <button 
                    onClick={() => handleAction(app.id, 'reject')}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    REJECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
