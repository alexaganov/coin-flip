import { createFileRoute } from "@tanstack/react-router";
import App from "../App";
import SoundEffectsProvider from "../SoundEffectsProvider";
import {
  CoinConfig,
  CoinFaceConfig,
  decodeCoinConfig,
  encodeCoinConfig,
} from "../utils/coinConfig";
import { useCallback, useMemo } from "react";
import { CoinFace } from "../type";
import { hasOnlyEmptyStrings } from "../utils/object";

interface IndexSearch {
  config?: string;
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
  validateSearch: (search): IndexSearch => {
    if ("config" in search && typeof search.config === "string") {
      return {
        config: search.config,
      };
    }

    return {};
  },
});

export const useRouteSearchCoinConfig = () => {
  const navigate = Route.useNavigate();
  const { config: encodedCoinConfig = "" } = Route.useSearch();

  const decodedCoinConfig = useMemo(
    () => decodeCoinConfig(encodedCoinConfig),
    [encodedCoinConfig]
  );

  const updateCoinFaceConfig = useCallback(
    (face: CoinFace, partialConfig: Partial<CoinFaceConfig>) => {
      navigate({
        search: (oldSearch) => {
          const decodedSearch = decodeCoinConfig(oldSearch.config || "");

          const updatedSearch: CoinConfig = {
            ...decodedSearch,
            [face]: {
              ...decodedSearch[face],
              ...partialConfig,
            },
          };

          if (hasOnlyEmptyStrings(updatedSearch)) {
            return {};
          }

          return {
            config: encodeCoinConfig(updatedSearch),
          };
        },
      });
    },
    [navigate]
  );

  return {
    config: decodedCoinConfig,
    update: updateCoinFaceConfig,
  };
};

function RouteComponent() {
  return (
    <SoundEffectsProvider>
      <App />
    </SoundEffectsProvider>
  );
}
