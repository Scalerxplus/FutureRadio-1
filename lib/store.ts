import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CityStore {
  cityId: string;
  cityName: string;
  radioSection: "regional" | "devotional";
  setCityId: (cityId: string, cityName: string) => void;
  setRadioSection: (section: "regional" | "devotional") => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      cityId: "bagheli",
      cityName: "Bagheli Vibe",
      radioSection: "regional",
      setCityId: (cityId, cityName) => set({ cityId, cityName }),
      setRadioSection: (radioSection) => set({ radioSection }),
    }),
    {
      name: "future-radio-station-storage",
    }
  )
);

interface UiStore {
  mode: "radio" | "news" | null;
  splashComplete: boolean;
  setMode: (mode: "radio" | "news" | null) => void;
  setSplashComplete: (complete: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  mode: null,
  splashComplete: false,
  setMode: (mode) => set({ mode }),
  setSplashComplete: (splashComplete) => set({ splashComplete }),
}));

interface AuthStore {
  user: Record<string, unknown> | null;
  session: Record<string, unknown> | null;
  isYtPremium: boolean;
  setUser: (user: Record<string, unknown> | null) => void;
  setSession: (session: Record<string, unknown> | null) => void;
  setIsYtPremium: (premium: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isYtPremium: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsYtPremium: (isYtPremium) => set({ isYtPremium }),
}));
