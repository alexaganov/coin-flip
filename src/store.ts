import { create } from "zustand";
import { APP_STATE, AppState, CHOICE, ChoiceType } from "./type";

interface HistoryRecord {
  id: number;
  choice: ChoiceType;
  outcome: ChoiceType;
}

interface AppStore {
  history: HistoryRecord[];
  currentChoice: ChoiceType;
  currentOutcome: ChoiceType | null;
  appState: AppState;
  setChoice: (choice: ChoiceType) => void;
  setCurrentOutcome: (choice: ChoiceType) => void;
  setAppState: (choice: AppState) => void;
  restart: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
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

    console.log({ currentChoice, currentOutcome });

    if (!currentOutcome) {
      return;
    }

    const lastHistoryItem: HistoryRecord | undefined =
      history[history.length - 1];

    const newHistoryItem: HistoryRecord = {
      id: (lastHistoryItem?.id || 0) + 1,
      choice: currentChoice,
      outcome: currentOutcome,
    };

    return set({
      currentChoice: CHOICE.HEAD,
      appState: APP_STATE.CHOICE,
      currentOutcome: null,
      history: [...history, newHistoryItem],
    });
  },
  setCurrentOutcome: (choice: ChoiceType) => set({ currentOutcome: choice }),
  setChoice: (choice: ChoiceType) => set({ currentChoice: choice }),
  setAppState: (state: AppState) => set({ appState: state }),
}));
