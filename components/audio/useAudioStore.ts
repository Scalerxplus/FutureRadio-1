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
  isPlaying: false,
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
