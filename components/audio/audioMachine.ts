import { createMachine, assign } from "xstate";
import { PlaylistBlock } from "@/lib/types";

export type AudioPhase =
  | "idle"
  | "buffering"
  | "playing_jingle"
  | "playing_jocktalk"
  | "playing_song"
  | "ad_paused"
  | "fetching";

export interface AudioContext {
  currentBlock: PlaylistBlock | null;
  nextBlock: PlaylistBlock | null;
  ytVolume: number;
  phase: string;
}

export const audioMachine = createMachine({
  id: "audioMachine",
  types: {} as {
    context: AudioContext;
    events:
      | { type: "LOAD_PLAYLIST"; currentBlock: PlaylistBlock; nextBlock: PlaylistBlock }
      | { type: "GESTURE_RECEIVED" }
      | { type: "YT_READY" }
      | { type: "TTS_CACHED" }
      | { type: "JINGLE_ENDED" }
      | { type: "JOCKTALK_ENDED" }
      | { type: "SONG_ENDED" }
      | { type: "AD_DETECTED" }
      | { type: "AD_ENDED" }
      | { type: "STOP" }
      | { type: "PLAY" };
  },
  context: {
    currentBlock: null,
    nextBlock: null,
    ytVolume: 100,
    phase: "idle",
  },
  initial: "idle",
  states: {
    idle: {
      entry: assign({ phase: "idle" }),
      on: {
        LOAD_PLAYLIST: {
          target: "buffering",
          actions: assign({
            currentBlock: ({ event }) => event.currentBlock,
            nextBlock: ({ event }) => event.nextBlock,
          }),
        },
        GESTURE_RECEIVED: "buffering",
      },
    },
    buffering: {
      entry: assign({ phase: "buffering" }),
      on: {
        YT_READY: "playing_jingle",
        TTS_CACHED: "playing_jingle",
      },
      after: {
        3000: "playing_jingle",
      }
    },
    playing_jingle: {
      entry: assign({ phase: "playing_jingle" }),
      on: {
        JINGLE_ENDED: "playing_jocktalk",
        STOP: "idle",
      },
    },
    playing_jocktalk: {
      entry: assign({ phase: "playing_jocktalk" }),
      on: {
        JOCKTALK_ENDED: "playing_song",
        STOP: "idle",
      },
    },
    playing_song: {
      entry: assign({ phase: "playing_song" }),
      on: {
        SONG_ENDED: "buffering",
        AD_DETECTED: "ad_paused",
        STOP: "idle",
      },
    },
    ad_paused: {
      entry: assign({ phase: "ad_paused" }),
      on: {
        AD_ENDED: "playing_song",
        STOP: "idle",
      },
    },
  },
});
