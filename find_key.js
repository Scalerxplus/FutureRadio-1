const fs = require('fs');
const txt = fs.readFileSync('C:/Users/scale/.gemini/antigravity/brain/689c50c5-25c9-4dd7-9a1c-21967e86fc56/.system_generated/logs/transcript.jsonl', 'utf8');
const match = txt.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\s"'\\]+)/);
console.log('KEY:', match ? match[1] : 'not found');
const match2 = txt.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
console.log('JWT:', match2 ? match2[0] : 'not found');
