// Future Radio - Live Data Fetcher

// Dictionary of popular Indian cities and their rough coordinates
const CITY_COORDINATES: Record<string, { lat: number, lon: number }> = {
  "raipur": { lat: 21.2514, lon: 81.6296 },
  "delhi": { lat: 28.6139, lon: 77.2090 },
  "mumbai": { lat: 19.0760, lon: 72.8777 },
  "bangalore": { lat: 12.9716, lon: 77.5946 },
  "pune": { lat: 18.5204, lon: 73.8567 },
  "hyderabad": { lat: 17.3850, lon: 78.4867 },
  "chennai": { lat: 13.0827, lon: 80.2707 },
  "kolkata": { lat: 22.5726, lon: 88.3639 },
  "ahmedabad": { lat: 23.0225, lon: 72.5714 },
  "jaipur": { lat: 26.9124, lon: 75.7873 },
  "chandigarh": { lat: 30.7333, lon: 76.7794 },
  "lucknow": { lat: 26.8467, lon: 80.9462 },
  "indore": { lat: 22.7196, lon: 75.8577 },
  "bhopal": { lat: 23.2599, lon: 77.4126 },
};

export async function getLiveWeather(cityId: string): Promise<string> {
  try {
    const coords = CITY_COORDINATES[cityId.toLowerCase()] || CITY_COORDINATES["raipur"];
    
    // Fetch live weather from Open-Meteo (No API Key required)
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`, {
      next: { revalidate: 1800 } // Cache weather for 30 minutes to prevent API spam
    });

    if (!response.ok) {
      throw new Error(`Weather API failed with status: ${response.status}`);
    }

    const data = await response.json();
    const weather = data.current_weather;
    
    // Convert WMO weather code to readable string
    let condition = "clear";
    const code = weather.weathercode;
    if (code === 0) condition = "clear and sunny";
    else if (code >= 1 && code <= 3) condition = "partly cloudy";
    else if (code >= 45 && code <= 48) condition = "foggy";
    else if (code >= 51 && code <= 67) condition = "raining";
    else if (code >= 71 && code <= 77) condition = "snowing";
    else if (code >= 80 && code <= 82) condition = "heavy rain showers";
    else if (code >= 95 && code <= 99) condition = "experiencing thunderstorms";

    return `${weather.temperature}°C and ${condition}`;
  } catch (error) {
    console.error("[Live Data] Failed to fetch weather:", error);
    return "pleasant"; // Safe fallback
  }
}
