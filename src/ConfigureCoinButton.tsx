import { useState } from "react";
import { Sliders } from "./components/icons/Sliders";
import Button from "./components/Button";
import { useAppStore } from "./store";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { Cross } from "./components/icons/Cross";
import { COIN_FACE } from "./type";
import {
  DEFAULT_COIN_HEAD_ICON,
  DEFAULT_COIN_HEAD_LABEL,
  DEFAULT_COIN_TAIL_ICON,
  DEFAULT_COIN_TAIL_LABEL,
} from "./components/Coin";
import TextField from "./components/TextField";
import { useRouteSearchCoinConfig } from "./routes";

interface ConfigureCoinButtonProps {
  className?: string;
}

const ConfigureCoinButton = ({ className }: ConfigureCoinButtonProps) => {
  const { config: decodedCoinConfig, update: updateCoinFaceConfig } =
    useRouteSearchCoinConfig();

  const currentFace = useAppStore((state) => state.currentChoice);
  const coinFaceConfig = decodedCoinConfig[currentFace];

  const [open, setOpen] = useState(false);

  const TriggerIcon = open ? Cross : Sliders;

  const inputProps =
    currentFace === COIN_FACE.HEAD
      ? {
          labelPlaceholder: DEFAULT_COIN_HEAD_LABEL,
          iconPlaceholder: DEFAULT_COIN_HEAD_ICON,
        }
      : {
          labelPlaceholder: DEFAULT_COIN_TAIL_LABEL,
          iconPlaceholder: DEFAULT_COIN_TAIL_ICON,
        };

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <Button className={clsx("text-[--coin-current-face-color]", className)}>
          <TriggerIcon className="size-6" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
          align="start"
          side="left"
          collisionPadding={{
            left: 39,
            bottom: 39,
            top: 37 + 60,
          }}
          sideOffset={10}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="w-[--radix-popover-content-available-width] max-w-[calc(562px)]"
        >
          <div className="flex button-group items-start flex-col">
            <header
              className={clsx("absolute top-[0.1875rem] -translate-y-full")}
            >
              <h2
                className={clsx(
                  "text-xl neo-brut-card uppercase p-1 px-4 border-b-2 border-black",
                  "text-[--coin-current-face-color]"
                )}
              >
                {currentFace}
              </h2>

              <div className="neo-brut-shadow" />
            </header>

            <div className="neo-brut-card pointer-events-auto w-full">
              <div className="neo-brut-shadow" />

              <div className="flex flex-col gap-2.5 p-3 pt-3">
                <TextField
                  placeholder={inputProps.labelPlaceholder}
                  value={coinFaceConfig.label}
                  label="LABEL"
                  inputClassName="focus:border-[--coin-current-face-color]"
                  onValueChange={(value) => {
                    updateCoinFaceConfig(currentFace, {
                      label: value,
                    });
                  }}
                />

                <TextField
                  placeholder={inputProps.iconPlaceholder}
                  value={coinFaceConfig.icon}
                  label="ICON"
                  inputClassName="focus:border-[--coin-current-face-color]"
                  onValueChange={(value) => {
                    updateCoinFaceConfig(currentFace, {
                      icon: value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ConfigureCoinButton;
