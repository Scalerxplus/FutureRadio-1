const DOMAIN = 'thefutureradio.com';
const CHANNELS = ['bagheli'];

async function run() {
  console.log('[GitHub Scheduler] Starting 24-hour schedule generation...');
  const nowUtc = new Date();
  const istTimeMs = nowUtc.getTime() + (5.5 * 60 * 60 * 1000);
  
  for (let i = 0; i < 24; i++) {
    const targetIst = new Date(istTimeMs);
    targetIst.setUTCHours(targetIst.getUTCHours() + i, 0, 0, 0);
    
    const year = targetIst.getUTCFullYear();
    const month = String(targetIst.getUTCMonth() + 1).padStart(2, '0');
    const day = String(targetIst.getUTCDate()).padStart(2, '0');
    const hourStr = String(targetIst.getUTCHours()).padStart(2, '0');
    
    const istIsoString = `${year}-${month}-${day}T${hourStr}:00:00+05:30`;
    
    for (const channel of CHANNELS) {
        console.log(`[GitHub Scheduler] Requesting generation for ${channel} at Hour ${hourStr} (${istIsoString})`);
        
        try {
          const res = await fetch(`https://${DOMAIN}/api/broadcast/generate-hour?city=${channel}&startTime=${encodeURIComponent(istIsoString)}`, {
            method: 'POST'
          });
          
          if (!res.ok) {
            const text = await res.text();
            console.error(`  -> Failed with status ${res.status}: ${text}`);
          } else {
            console.log(`  -> Success!`);
          }
        } catch (e) {
          console.error(`  -> Network error: ${e.message}`);
        }
        
        // Wait 1 second to avoid hitting rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  // Trigger diagnostics at the end
  console.log('[GitHub Scheduler] Triggering self-healing diagnostics...');
  try {
     const diagRes = await fetch(`https://${DOMAIN}/api/cron/self-healing`);
     if (diagRes.ok) {
        console.log('  -> Diagnostics triggered.');
     } else {
        console.error(`  -> Diagnostics failed: ${diagRes.status}`);
     }
  } catch (e) {
     console.error(`  -> Diagnostics error: ${e.message}`);
  }
  console.log('[GitHub Scheduler] Finished!');
}

run();
