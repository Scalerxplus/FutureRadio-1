const stations = [
  "hindi",
  "malwi",
  "bagheli",
  "bundeli",
  "chhattisgarhi",
  "sarguja",
  "bastar",
  "raigarh",
  "punjabi",
  "news"
];

async function generateSchedules() {
  // Start from June 2, 2026 18:00:00 IST
  let currentDate = new Date("2026-06-02T18:00:00+05:30");
  
  for (let i = 0; i < 24; i++) {
    const targetIso = currentDate.toISOString();
    console.log(`\n======================================================`);
    console.log(`Generating schedule for hour: ${currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`======================================================`);
    
    for (const station of stations) {
      try {
        console.log(`Triggering generation for station: ${station} at ${targetIso}`);
        const res = await fetch(`http://localhost:3000/api/broadcast/generate-hour?city=${station}&startTime=${targetIso}`, {
          method: "POST"
        });
        if (res.ok) {
          console.log(`✅ Success: ${station}`);
        } else {
          console.error(`❌ Failed: ${station} - Status ${res.status}`);
        }
      } catch (e) {
        console.error(`❌ Error fetching ${station}:`, e.message);
      }
      
      // Delay to avoid hammering the local server or APIs too aggressively
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Add 1 hour
    currentDate.setHours(currentDate.getHours() + 1);
  }
  
  console.log("Finished generating 24-hour schedules for all stations.");
}

generateSchedules();
