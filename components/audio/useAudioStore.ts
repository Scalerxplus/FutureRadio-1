import { create } from "zustand";
import { PlaylistBlock } from "@/lib/types";
import { AudioPhase } from "./audioMachine";

interface AudioStore {
  phase: AudioPhase;
  currentBlock: PlaylistBlock | null;
  upcomingBlocks: PlaylistBlock[];
  nextBlock: PlaylistBlock | null;
  cityId: string;
  viewMode: "fullscreen" | "minimized" | "bubble";
  ytVolume: number;
  isPlaying: boolean;
  hasGesture: boolean;
  setPhase: (phase: AudioPhase) => void;
  setCurrentBlock: (block: PlaylistBlock | null) => void;
  setUpcomingBlocks: (blocks: PlaylistBlock[]) => void;
  setNextBlock: (block: PlaylistBlock | null) => void;
  setViewMode: (mode: "fullscreen" | "minimized" | "bubble") => void;
  setYtVolume: (volume: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCityId: (cityId: string) => void;
  setHasGesture: (hasGesture: boolean) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  phase: "idle",
  currentBlock: null,
  upcomingBlocks: [],
  nextBlock: null,
  cityId: "raipur",
  viewMode: "bubble",
  ytVolume: 80,
  isPlaying: true,
  hasGesture: false,
  setPhase: (phase) => set({ phase }),
  setCurrentBlock: (currentBlock) => set({ currentBlock }),
  setUpcomingBlocks: (upcomingBlocks) => set({ upcomingBlocks }),
  setNextBlock: (nextBlock) => set({ nextBlock }),
  setViewMode: (viewMode) => set({ viewMode }),
  setYtVolume: (ytVolume) => set({ ytVolume }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCityId: (cityId) => set({ cityId }),
  setHasGesture: (hasGesture) => set({ hasGesture }),
}));

export function unlockAudio(playStinger: boolean = false) {
  if (typeof document === "undefined") return;
  const silentSrc = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
  const stingerSrc = "/audio/jingles/Station_Jingle_EDM.mp3";
  
  const ids = ["audius-player", "html5-player", "jingle-player", "bed-player", "keepalive-player"];
  ids.forEach(id => {
    const el = document.getElementById(id) as HTMLAudioElement | null;
    if (el) {
      if (!el.src || el.src === window.location.href || el.src === silentSrc) {
        el.src = (id === "jingle-player" && playStinger) ? stingerSrc : silentSrc;
      }
      el.play().catch(() => {});
    }
  });
}
