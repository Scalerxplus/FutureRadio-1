export interface NewsItem {
  id: string;
  type: "local" | "national" | "official";
  category: string;
  headline: string;
  snippet: string;
  source: string;
  sourceHandle: string;
  timeAgo: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  isTwitterSource: boolean;
}

export const INITIAL_MOCK_NEWS: NewsItem[] = [
  {
    id: "news-1",
    type: "local",
    category: "Technology",
    headline: "Raipur Smart Telemetries Upgraded to Generative Soundwave Arrays",
    snippet: "State grids in Chhattisgarh successfully rolled out next-gen audio synths. The local AI RJ nodes will now utilize real-time city telemetry for ambient backgrounds.",
    source: "Chhattisgarh Gazette",
    sourceHandle: "@cg_gazette",
    timeAgo: "10m ago",
    imageUrl: null,
    likes: 142,
    comments: 24,
    isTwitterSource: false,
  },
  {
    id: "news-2",
    type: "local",
    category: "Politics",
    headline: "Indore Green Grid Sync Completes Ahead of Master Schedule",
    snippet: "Urban planners in MP confirmed the completion of decentralized sound networks. The city's nodes will synchronize audio overlays by early tomorrow morning.",
    source: "Madhya Pradesh Times",
    sourceHandle: "@mp_times",
    timeAgo: "45m ago",
    imageUrl: null,
    likes: 89,
    comments: 11,
    isTwitterSource: false,
  },
  {
    id: "news-3",
    type: "national",
    category: "Business",
    headline: "National AI Broadcasting Regulations Formally Ratified",
    snippet: "Ministry of Information and Broadcasting formally passed the Generative RJ Licensing Bill, creating standard compliance boundaries for AI radio and streaming feeds.",
    source: "Bharat Business Daily",
    sourceHandle: "@bharat_biz",
    timeAgo: "2h ago",
    imageUrl: null,
    likes: 312,
    comments: 47,
    isTwitterSource: false,
  },
  {
    id: "news-4",
    type: "official",
    category: "Technology",
    headline: "Future Radio Nagpur Node Sync Successfully Verified",
    snippet: "The central core database validated soundwave telemetry logs for Nagpur. Continuous synth beats and local RJ voices will align with the Raipur broadcast deck.",
    source: "Future Radio Nagpur",
    sourceHandle: "@futureradio_ngp",
    timeAgo: "3h ago",
    imageUrl: null,
    likes: 215,
    comments: 36,
    isTwitterSource: true,
  },
  {
    id: "news-5",
    type: "national",
    category: "Sports",
    headline: "India Selects Generative AI RJ Framework as Official Media Platform",
    snippet: "The Olympic selection council approved deploying localized generative sportscasts. Fans will experience real-time local language RJ syncs across all streaming channels.",
    source: "National Sports Mirror",
    sourceHandle: "@sports_mirror",
    timeAgo: "4h ago",
    imageUrl: null,
    likes: 418,
    comments: 53,
    isTwitterSource: false,
  },
  {
    id: "news-6",
    type: "official",
    category: "Technology",
    headline: "Surat Sound Telemetry Launches Real-Time Voice Synthesis",
    snippet: "Gujarati synthetic voice engines have completed grid synchronization. Localized dialects will adapt smoothly to ambient street telemetry logs from Raipur.",
    source: "Future Radio Surat",
    sourceHandle: "@futureradio_srt",
    timeAgo: "6h ago",
    imageUrl: null,
    likes: 198,
    comments: 18,
    isTwitterSource: true,
  },
  {
    id: "news-7",
    type: "local",
    category: "Business",
    headline: "Bhopal Smart Grid Integrates Raipur Soundwave System",
    snippet: "Technicians in MP successfully synced local smart grid telemetry loops to trigger continuous synth mood beats. Raipur algorithms will act as the master controller.",
    source: "Bhopal Chronicle",
    sourceHandle: "@bhopal_chron",
    timeAgo: "8h ago",
    imageUrl: null,
    likes: 156,
    comments: 29,
    isTwitterSource: false,
  },
  {
    id: "news-8",
    type: "national",
    category: "Politics",
    headline: "National AI News Syndicate Announces Raipur Headquarters",
    snippet: "A consortium of central digital publishers chose Raipur as the primary media server. High-speed neural voice grids will distribute syndicated stories on demand.",
    source: "Syndicate Press India",
    sourceHandle: "@press_india",
    timeAgo: "12h ago",
    imageUrl: null,
    likes: 274,
    comments: 41,
    isTwitterSource: false,
  },
];
