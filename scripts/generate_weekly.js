const genres = ['hindi', 'malwi', 'bagheli', 'bundeli', 'chhattisgarhi', 'sarguja', 'bastar', 'raigarh', 'punjabi', 'news'];
(async () => {
  const now = new Date();
  const istTimeMs = now.getTime() + (5.5 * 60 * 60 * 1000);
  const startIst = new Date(istTimeMs);
  const totalHours = 168;
  console.log(`Starting generation for ${totalHours} hours...`);
  
  for (let i = 0; i < totalHours; i++) {
    const targetIst = new Date(startIst.getTime() + i * 60 * 60 * 1000);
    const y = targetIst.getUTCFullYear();
    const m = String(targetIst.getUTCMonth() + 1).padStart(2, '0');
    const d = String(targetIst.getUTCDate()).padStart(2, '0');
    const h = String(targetIst.getUTCHours()).padStart(2, '0');
    const iso = `${y}-${m}-${d}T${h}:00:00+05:30`;
    console.log(`\nHour ${i+1}/${totalHours}: ${iso}`);
    
    for (const genre of genres) {
      try {
        const url = `https://thefutureradio.com/api/broadcast/generate-hour?city=${genre}&startTime=${encodeURIComponent(iso)}`;
        const res = await fetch(url, { method: 'POST' });
        process.stdout.write(`[${genre}: ${res.ok ? 'OK' : 'FAIL'}] `);
        await new Promise(r => setTimeout(r, 100));
      } catch (err) { }
    }
  }
  console.log('Done!');
})();
