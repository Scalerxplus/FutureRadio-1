import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Since RLS might be active, anon key may not create buckets.

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket("broadcast_audio", {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    console.error("Error creating bucket:", error);
    if (error.message.includes("already exists")) {
      console.log("Bucket 'broadcast_audio' already exists. We are good to go!");
    }
  } else {
    console.log("Bucket 'broadcast_audio' created successfully:", data);
  }
}

createBucket();
