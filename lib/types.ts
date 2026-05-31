export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  authorId?: string;
}

export interface Track {
  id: string;
  title: string;
  streamUrl: string;
  artist?: string;
  duration?: number;
}

export interface UserSession {
  id: string;
  email: string;
  role: "admin" | "listener" | "curator";
}

export interface PlaylistBlock {
  blockId: string;
  cityId: string;
  youtubeId: string;
  songTitle: string;
  songArtist: string;
  songDurationS: number;
  rjAudioUrl: string;
  jingleUrl?: string;
  rjTranscript: string;
  newsHeadlines: string[];
  mood: string;
  validFrom: string;
  validUntil: string;
  rjName?: string;
  coverArt?: string;
  permalink?: string;
}
