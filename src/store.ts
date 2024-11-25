import { create } from "zustand";
import { APP_STATE, AppState, COIN_FACE, CoinFace } from "./type";
import { persist } from "zustand/middleware";
import { CoinConfig, CoinFaceConfig } from "./utils/coinConfig";

export interface HistoryRecord {
  id: string;
  choice: CoinFace;
  outcome: CoinFace;
}

interface AppStore {
  isAudioMuted: boolean;
  toggleIsAudioMuted: () => void;
  history: HistoryRecord[];
  currentChoice: CoinFace;
  currentOutcome: CoinFace | null;
  appState: AppState;
  coinConfig: CoinConfig;
  updateCoinFaceConfig: (
    face: CoinFace,
    partialConfig: Partial<CoinFaceConfig>
  ) => void;
  setChoice: (choice: CoinFace) => void;
  setCurrentOutcome: (choice: CoinFace) => void;
  applyOutcome: (choice: CoinFace) => void;
  setAppState: (choice: AppState) => void;
  restart: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      isAudioMuted: false,
      currentChoice: COIN_FACE.HEAD,
      history: [],
      coinConfig: {
        tail: {
          icon: "",
          label: "",
        },
        head: {
          icon: "",
          label: "",
        },
      },
      // history: Array.from({ length: 10 }, (_, i) => {
      //   return {
      //     id: i,
      //     choice: ,
      //     outcome:
      //   };
      // }),
      currentOutcome: null,
      appState: APP_STATE.CHOICE,
      restart: () => {
        return set({
          appState: APP_STATE.CHOICE,
        });
      },
      applyOutcome: (outcome: CoinFace) => {
        const { history, currentChoice } = get();

        const newHistoryItem: HistoryRecord = {
          id: Date.now().toString(36),
          choice: currentChoice,
          outcome,
        };

        const MAX_HISTORY_SIZE = 50;

        const updatedHistory: HistoryRecord[] = [
          ...(history.length >= MAX_HISTORY_SIZE
            ? history.slice(history.length - MAX_HISTORY_SIZE + 1)
            : history),
          newHistoryItem,
        ];

        return set({
          currentChoice: outcome,
          currentOutcome: null,
          appState: APP_STATE.OUTCOME,
          history: updatedHistory,
        });
      },
      updateCoinFaceConfig: (face, coinFaceConfig) =>
        set((state) => {
          return {
            ...state,
            coinConfig: {
              ...state.coinConfig,
              [face]: {
                ...state.coinConfig[face],
                ...coinFaceConfig,
              },
            },
          };
        }),
      setCurrentOutcome: (choice: CoinFace) => set({ currentOutcome: choice }),
      setChoice: (choice: CoinFace) => set({ currentChoice: choice }),
      setAppState: (state: AppState) => set({ appState: state }),
      toggleIsAudioMuted: () => set({ isAudioMuted: !get().isAudioMuted }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        isAudioMuted: state.isAudioMuted,
        history: state.history,
      }),
    }
  )
);
