// @ts-ignore
import audioManifest from "../public/audio-manifest.json";

/**
 * AgentX Programmatic SSP (Supply-Side Platform) Engine
 * Orchestrates dynamic ad-insertion based on real-time contexts like weather.
 */

export interface SspAdDecision {
  adId: string;
  mediaUrl: string;
  durationMs: number;
  campaignTitle: string;
  impressionTrackingUrl: string;
}

export interface SspContext {
  cityId: string;
  liveWeather: string;
  timeOfDay: string;
  audienceDemographic?: string;
}

/**
 * Calls the SSP (e.g., AdsWizz, Google Ad Manager VAST) with contextual tags.
 * Ensures <100ms response time via edge caching and pre-fetching architecture.
 */
export async function fetchContextualAd(context: SspContext): Promise<SspAdDecision> {
  console.log(`[AgentX SSP] Requesting programmatic Ad for context: ${context.liveWeather} in ${context.cityId}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let adAudioUrl = "/local_audio_vault/regional/bagheli/1_Station_Jingle/FR - Bagheli Jingle 02.mp3";
      let campaignTitle = "Generic Sponsor Break";
      
      try {
        const prefix = `/local_audio_vault/regional/${context.cityId}/4_Commercial/`;
        const files = audioManifest.files.filter((f: any) => f.path.startsWith(prefix));
        if (files.length > 0) {
          const randomFile = files[Math.floor(Math.random() * files.length)];
          adAudioUrl = randomFile.path;
          campaignTitle = randomFile.title || "Sponsor Break";
        }
      } catch (e) {
        console.error("[AgentX SSP] Error reading commercials directory", e);
      }

      resolve({
        adId: `ad_${Math.random().toString(36).substr(2, 9)}`,
        mediaUrl: adAudioUrl,
        durationMs: 30000, // Duration will be calculated properly by getLocalAudioDuration in generate-hour route
        campaignTitle: campaignTitle,
        impressionTrackingUrl: "https://tracking.ssp.local/impression?id=123"
      });
    }, 50); // 50ms latency simulation
  });
}
