export interface DialectMarker {
  name: string;
  type: "HUB" | "NODE";
  speakers: string;
  engagement: string;
  networkStatus: string;
  color: string;
  coordinates: [number, number];
  spread: { rx: number; ry: number; rotate: number };
  majorCities: string[];
  smartphonePenetration: number;
  secondaryDialects?: { name: string; speakers: string }[];
}

export const dialectMarkers: DialectMarker[] = [
  // HUB (Regional)
  { coordinates: [78.0, 25.0], name: "Hindi (Belt)", speakers: "300M+", engagement: "65", type: "HUB", networkStatus: "CLAIMED", color: "#C0392B", spread: { rx: 70, ry: 40, rotate: -15 }, majorCities: ["Delhi", "Lucknow", "Patna", "Jaipur"], smartphonePenetration: 55 },
  { coordinates: [84.5, 26.0], name: "Bhojpuri", speakers: "50M+", engagement: "82", type: "HUB", networkStatus: "CLAIMED", color: "#E74C3C", spread: { rx: 40, ry: 30, rotate: 10 }, majorCities: ["Patna", "Varanasi", "Gorakhpur"], smartphonePenetration: 45 },
  { coordinates: [81.5, 26.5], name: "Awadhi", speakers: "38M+", engagement: "78", type: "HUB", networkStatus: "CLAIMED", color: "#D35400", spread: { rx: 35, ry: 25, rotate: -5 }, majorCities: ["Lucknow", "Ayodhya", "Prayagraj"], smartphonePenetration: 46 },
  { coordinates: [86.0, 26.5], name: "Maithili", speakers: "34M+", engagement: "85", type: "HUB", networkStatus: "DEPLOYABLE", color: "#F39C12", spread: { rx: 30, ry: 25, rotate: 15 }, majorCities: ["Darbhanga", "Muzaffarpur", "Sitamarhi"], smartphonePenetration: 43 },
  { coordinates: [73.0, 26.0], name: "Marwari", speakers: "20M+", engagement: "80", type: "HUB", networkStatus: "CLAIMED", color: "#F1C40F", spread: { rx: 45, ry: 35, rotate: -20 }, majorCities: ["Jodhpur", "Bikaner", "Nagaur"], smartphonePenetration: 58 },
  { coordinates: [75.5, 23.5], name: "Malwi", speakers: "15M+", engagement: "88", type: "HUB", networkStatus: "CRITICAL", color: "#E67E22", spread: { rx: 30, ry: 25, rotate: 0 }, majorCities: ["Indore", "Ujjain", "Ratlam"], smartphonePenetration: 54 },
  { coordinates: [79.0, 24.5], name: "Bundeli", speakers: "18M+", engagement: "76", type: "HUB", networkStatus: "DEPLOYABLE", color: "#D35400", spread: { rx: 35, ry: 25, rotate: 10 }, majorCities: ["Jhansi", "Gwalior", "Sagar"], smartphonePenetration: 50 },
  { coordinates: [88.0, 23.0], name: "Bengali", speakers: "97M+", engagement: "70", type: "HUB", networkStatus: "CLAIMED", color: "#27AE60", spread: { rx: 45, ry: 60, rotate: 15 }, majorCities: ["Kolkata", "Howrah", "Asansol"], smartphonePenetration: 60 },
  { coordinates: [76.0, 19.0], name: "Marathi", speakers: "83M+", engagement: "72", type: "HUB", networkStatus: "CLAIMED", color: "#2980B9", spread: { rx: 50, ry: 40, rotate: -10 }, majorCities: ["Mumbai", "Pune", "Nagpur"], smartphonePenetration: 70 },
  { coordinates: [72.0, 23.0], name: "Gujarati", speakers: "55M+", engagement: "75", type: "HUB", networkStatus: "CLAIMED", color: "#16A085", spread: { rx: 40, ry: 35, rotate: -15 }, majorCities: ["Ahmedabad", "Surat", "Rajkot"], smartphonePenetration: 65 },
  { coordinates: [85.0, 20.5], name: "Odia", speakers: "35M+", engagement: "80", type: "HUB", networkStatus: "DEPLOYABLE", color: "#8E44AD", spread: { rx: 35, ry: 40, rotate: 20 }, majorCities: ["Bhubaneswar", "Cuttack", "Rourkela"], smartphonePenetration: 52 },
  { coordinates: [75.0, 31.0], name: "Punjabi", speakers: "33M+", engagement: "85", type: "HUB", networkStatus: "CLAIMED", color: "#3498DB", spread: { rx: 35, ry: 30, rotate: -25 }, majorCities: ["Amritsar", "Ludhiana", "Chandigarh"], smartphonePenetration: 68 },
  { coordinates: [82.0, 21.5], name: "Chhattisgarhi", speakers: "16M+", engagement: "82", type: "HUB", networkStatus: "DEPLOYABLE", color: "#9B59B6", spread: { rx: 30, ry: 40, rotate: 15 }, majorCities: ["Raipur", "Bilaspur", "Bhilai"], smartphonePenetration: 51 },
  { coordinates: [76.5, 29.0], name: "Haryanvi", speakers: "10M+", engagement: "90", type: "HUB", networkStatus: "CRITICAL", color: "#E67E22", spread: { rx: 25, ry: 20, rotate: 0 }, majorCities: ["Rohtak", "Hisar", "Panipat"], smartphonePenetration: 62 },

  // NODE (Dialects)
  { coordinates: [81.5, 24.5], name: "Bagheli", speakers: "8M+", engagement: "97", type: "NODE", networkStatus: "CRITICAL", color: "#9B59B6", spread: { rx: 25, ry: 15, rotate: 20 }, majorCities: ["Rewa", "Satna", "Sidhi"], smartphonePenetration: 45, secondaryDialects: [{ name: "Rewa Core", speakers: "3M+" }] },
  { coordinates: [75.5, 26.5], name: "Marwari", speakers: "8M+", engagement: "92", type: "NODE", networkStatus: "DEPLOYABLE", color: "#F1C40F", spread: { rx: 40, ry: 25, rotate: 15 }, majorCities: ["Jodhpur", "Pali"], smartphonePenetration: 58, secondaryDialects: [{ name: "Mewari Overlap", speakers: "2.1M+" }] },

  // NODE (Dialects)
  { coordinates: [74.5, 18.5], name: "Pune Marathi (Deshi)", speakers: "15M+", engagement: "88", type: "NODE", networkStatus: "CLAIMED", color: "#2980B9", spread: { rx: 25, ry: 35, rotate: 15 }, majorCities: ["Pune", "Pimpri-Chinchwad"], smartphonePenetration: 75 },
  { coordinates: [79.0, 21.0], name: "Nagpuri Marathi (Varhadi)", speakers: "10M+", engagement: "91", type: "NODE", networkStatus: "CRITICAL", color: "#8E44AD", spread: { rx: 25, ry: 20, rotate: 0 }, majorCities: ["Nagpur", "Amravati"], smartphonePenetration: 68 },
  { coordinates: [71.5, 22.0], name: "Kathiawadi", speakers: "12M+", engagement: "93", type: "NODE", networkStatus: "DEPLOYABLE", color: "#1ABC9C", spread: { rx: 25, ry: 20, rotate: -10 }, majorCities: ["Rajkot", "Bhavnagar", "Jamnagar"], smartphonePenetration: 62 },
  { coordinates: [85.5, 24.5], name: "Magahi", speakers: "12.7M+", engagement: "95", type: "NODE", networkStatus: "DEPLOYABLE", color: "#E74C3C", spread: { rx: 35, ry: 25, rotate: 10 }, majorCities: ["Patna", "Gaya", "Jehanabad"], smartphonePenetration: 43 },
  { coordinates: [74.0, 24.5], name: "Mewari", speakers: "4.2M+", engagement: "94", type: "NODE", networkStatus: "DEPLOYABLE", color: "#F39C12", spread: { rx: 25, ry: 20, rotate: 0 }, majorCities: ["Udaipur", "Bhilwara", "Chittorgarh"], smartphonePenetration: 55 },
  { coordinates: [73.5, 23.5], name: "Wagdi", speakers: "3.3M+", engagement: "92", type: "NODE", networkStatus: "DEPLOYABLE", color: "#1ABC9C", spread: { rx: 20, ry: 15, rotate: -15 }, majorCities: ["Dungarpur", "Banswara"], smartphonePenetration: 50 },
  { coordinates: [76.0, 25.0], name: "Harauti", speakers: "2.9M+", engagement: "91", type: "NODE", networkStatus: "DEPLOYABLE", color: "#D35400", spread: { rx: 20, ry: 20, rotate: 0 }, majorCities: ["Kota", "Bundi", "Jhalawar"], smartphonePenetration: 58 },
  { coordinates: [78.5, 30.2], name: "Garhwali", speakers: "2.5M+", engagement: "96", type: "NODE", networkStatus: "CRITICAL", color: "#3498DB", spread: { rx: 20, ry: 20, rotate: -10 }, majorCities: ["Dehradun", "Pauri", "Tehri"], smartphonePenetration: 65 },
  { coordinates: [79.8, 29.6], name: "Kumaoni", speakers: "2.0M+", engagement: "95", type: "NODE", networkStatus: "CRITICAL", color: "#2980B9", spread: { rx: 20, ry: 15, rotate: 15 }, majorCities: ["Nainital", "Almora", "Pithoragarh"], smartphonePenetration: 63 },
  { coordinates: [83.5, 21.0], name: "Sambalpuri", speakers: "2.6M+", engagement: "97", type: "NODE", networkStatus: "CRITICAL", color: "#27AE60", spread: { rx: 30, ry: 25, rotate: 20 }, majorCities: ["Sambalpur", "Bargarh", "Jharsuguda"], smartphonePenetration: 50 },
  { coordinates: [75.0, 32.7], name: "Dogri", speakers: "2.6M+", engagement: "93", type: "NODE", networkStatus: "DEPLOYABLE", color: "#8E44AD", spread: { rx: 25, ry: 15, rotate: -20 }, majorCities: ["Jammu", "Udhampur", "Kathua"], smartphonePenetration: 60 },
  { coordinates: [75.0, 21.0], name: "Khandeshi", speakers: "1.8M+", engagement: "90", type: "NODE", networkStatus: "DEPLOYABLE", color: "#E67E22", spread: { rx: 25, ry: 15, rotate: 0 }, majorCities: ["Jalgaon", "Dhule", "Nandurbar"], smartphonePenetration: 60 },
  { coordinates: [83.0, 23.0], name: "Surgujia", speakers: "1.7M+", engagement: "91", type: "NODE", networkStatus: "DEPLOYABLE", color: "#9B59B6", spread: { rx: 20, ry: 15, rotate: 10 }, majorCities: ["Ambikapur", "Surajpur", "Balrampur"], smartphonePenetration: 48 },
];
