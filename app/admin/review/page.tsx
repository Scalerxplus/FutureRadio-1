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
    <div className="min-h-screen bg-gray-100 text-brand-dark flex flex-col font-sans">
      <header className="bg-black text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/creators" className="hover:-translate-x-1 transition-transform">
            <div className="p-2 border-2 border-white/20 hover:border-white transition-colors">
              <MoveLeft className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-widest">
            Admin Review Dashboard
          </h1>
        </div>
        <div className="text-sm font-mono opacity-60 bg-white/10 px-3 py-1 rounded">
          {applications.length} Pending
        </div>
      </header>

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-20 animate-pulse font-bold text-xl">Loading Queue...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-black text-gray-400 uppercase tracking-widest">No Pending Applications</h2>
            <p className="mt-4 text-gray-500">The queue is currently empty.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden flex flex-col md:flex-row">
                {/* Details Section */}
                <div className="p-6 flex-grow border-b md:border-b-0 md:border-r border-gray-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black">{app.name}</h3>
                      <p className="text-gray-500 font-mono text-sm">{app.email} • {app.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-brand-red/10 text-brand-red px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full">
                        {app.type} Creator
                      </span>
                      <span className="bg-brand-dark/10 text-brand-dark px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full">
                        {app.target_station}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Submitted Audio Sample</p>
                    <audio controls src={app.sample_file_url} className="w-full h-10 outline-none" controlsList="nodownload"></audio>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="bg-gray-50 p-6 md:w-64 flex flex-col justify-center gap-3 shrink-0">
                  <button 
                    onClick={() => handleAction(app.id, 'approve')}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    APPROVE
                  </button>
                  <button 
                    onClick={() => handleAction(app.id, 'reject')}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 font-bold py-3 px-4 rounded transition-colors"
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
