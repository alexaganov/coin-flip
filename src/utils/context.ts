import { Context, createContext, useContext } from "react";

const defaultValue = undefined;

type DefaultValue = typeof defaultValue;

export const createSafeContext = <ContextValue>(): Context<
  ContextValue | DefaultValue
> => {
  return createContext<ContextValue | DefaultValue>(defaultValue);
};

export const useSafeContext = <ContextType>(
  context: Context<ContextType | DefaultValue>,
  contextName = ""
): ContextType => {
  const value = useContext(context);

  if (value === defaultValue) {
    throw new Error(`No value provided for context ${contextName}`);
  }

  return value as ContextType;
};
