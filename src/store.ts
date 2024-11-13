import { create } from "zustand";
import { APP_STATE, AppState, CHOICE, ChoiceType } from "./type";
import { persist } from "zustand/middleware";
import { generateUUID } from "three/src/math/MathUtils.js";

interface HistoryRecord {
  id: string;
  choice: ChoiceType;
  outcome: ChoiceType;
}

interface AppStore {
  isAudioMuted: boolean;
  toggleIsAudioMuted: () => void;
  history: HistoryRecord[];
  currentChoice: ChoiceType;
  currentOutcome: ChoiceType | null;
  appState: AppState;
  setChoice: (choice: ChoiceType) => void;
  setCurrentOutcome: (choice: ChoiceType) => void;
  setAppState: (choice: AppState) => void;
  restart: () => void;
}
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      isAudioMuted: false,
      currentChoice: CHOICE.HEAD,
      history: [],
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
        const { history, currentChoice, currentOutcome } = get();

        if (!currentOutcome) {
          return;
        }

        const newHistoryItem: HistoryRecord = {
          id: generateUUID(),
          choice: currentChoice,
          outcome: currentOutcome,
        };

        const MAX_HISTORY_SIZE = 50;

        const updatedHistory: HistoryRecord[] = [
          ...(history.length >= MAX_HISTORY_SIZE
            ? history.slice(history.length - MAX_HISTORY_SIZE + 1)
            : history),
          newHistoryItem,
        ];

        return set({
          currentChoice: currentOutcome,
          appState: APP_STATE.CHOICE,
          currentOutcome: null,
          history: updatedHistory,
        });
      },
      setCurrentOutcome: (choice: ChoiceType) =>
        set({ currentOutcome: choice }),
      setChoice: (choice: ChoiceType) => set({ currentChoice: choice }),
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
