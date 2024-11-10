import { ObjectValues } from "./utils/type";

export const CHOICE = {
  HEAD: "head",
  TAIL: "tail",
} as const;

export type ChoiceType = ObjectValues<typeof CHOICE>;

export const APP_STATE = {
  CHOICE: "CHOICE",
  THROW: "THROW",
  RESTART: "RESTART",
} as const;

export type AppState = ObjectValues<typeof APP_STATE>;
