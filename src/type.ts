import { ObjectValues } from "./utils/type";

export const COIN_FACE = {
  HEAD: "head",
  TAIL: "tail",
} as const;

export type CoinFace = ObjectValues<typeof COIN_FACE>;

export const APP_STATE = {
  CHOICE: "CHOICE",
  THROW: "THROW",
  RESTART: "RESTART",
  OUTCOME: "OUTCOME",
} as const;

export type AppState = ObjectValues<typeof APP_STATE>;
