import { CoinFace } from "../type";

export interface CoinFaceConfig {
  label: string;
  icon: string;
}

export type CoinConfig = {
  [key in CoinFace]: CoinFaceConfig;
};

const getDefaultCoinConfig = (): CoinConfig => {
  return {
    head: {
      label: "",
      icon: "",
    },
    tail: {
      label: "",
      icon: "",
    },
  };
};

export const encodeCoinConfig = (config: CoinConfig): string => {
  // encodeURIComponent is used to preserve emojis
  return window.btoa(encodeURIComponent(JSON.stringify(config)));
};

export const decodeCoinConfig = (encodedString: string): CoinConfig => {
  const defaultCoinConfig = getDefaultCoinConfig();

  if (!encodedString) {
    return defaultCoinConfig;
  }

  try {
    const decodedCoinCoinConfig = JSON.parse(
      decodeURIComponent(window.atob(encodedString))
    );

    if (!decodedCoinCoinConfig || typeof decodedCoinCoinConfig !== "object") {
      return defaultCoinConfig;
    }

    return {
      tail: {
        ...defaultCoinConfig.tail,
        ...decodedCoinCoinConfig.tail,
      },
      head: {
        ...defaultCoinConfig.head,
        ...decodedCoinCoinConfig.head,
      },
    };
  } catch (error) {
    console.warn(error);

    return defaultCoinConfig;
  }
};
