import { useState } from "react";
import { Sliders } from "./components/icons/Sliders";
import Button from "./components/Button";
import { useAppStore } from "./store";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { Cross } from "./components/icons/Cross";
import { COIN_FACE } from "./type";
import {
  DEFAULT_COIN_HEAD_LABEL,
  DEFAULT_COIN_TAIL_LABEL,
} from "./components/Coin";

interface ConfigureCoinButtonProps {
  className?: string;
}

const ConfigureCoinButton = ({ className }: ConfigureCoinButtonProps) => {
  const currentFace = useAppStore((state) => state.currentChoice);
  const coinConfig = useAppStore((state) => state.coinConfig);
  const updateCoinFaceConfig = useAppStore(
    (state) => state.updateCoinFaceConfig
  );

  const coinFaceConfig = coinConfig[currentFace];

  const [open, setOpen] = useState(false);

  const TriggerIcon = open ? Cross : Sliders;

  const labelInputProps =
    currentFace === COIN_FACE.HEAD
      ? {
          placeholder: DEFAULT_COIN_HEAD_LABEL,
        }
      : {
          placeholder: DEFAULT_COIN_TAIL_LABEL,
        };

  const iconInputProps =
    currentFace === COIN_FACE.HEAD
      ? {
          placeholder: "!moon",
        }
      : {
          placeholder: "!sun",
        };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className={clsx("text-[--coin-current-face-color]", className)}>
          <TriggerIcon className="size-6" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* <Dialog.Overlay className="inset-0 bg-black/50 fixed flex p-10 items-end"> */}
        {/* <div className="fixed top-0 h-[--visual-viewport-height] w-full  "> */}
        <Dialog.Content
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="fixed bottom-[2.4375rem] left-[2.4375rem] w-[calc(100%-209px)] mx-auto"
        >
          <div className="flex button-group items-start flex-col">
            {/* <div className="button-group">
              <Dialog.Close asChild>
                <Button aria-label="Close">Close</Button>
              </Dialog.Close>
            </div> */}

            <header
              className={clsx("neo-brut-card p-1 px-4 border-b-2 border-black")}
            >
              <Dialog.Title
                className={clsx(
                  "text-xl uppercase",
                  "text-[--coin-current-face-color]"
                )}
              >
                {currentFace}
              </Dialog.Title>

              <div className="neo-brut-shadow" />
            </header>

            <div className="neo-brut-card pointer-events-auto w-full">
              <div className="neo-brut-shadow" />

              <div className="flex flex-col gap-2.5 p-3 pt-3">
                <div className="flex relative flex-col items-start">
                  <label
                    className="text-center absolute -translate-y-1/2 bg-white text-sm px-1 ml-1.5 -mb-2.5"
                    htmlFor="face-label"
                  >
                    LABEL
                  </label>

                  <input
                    onChange={(event) => {
                      updateCoinFaceConfig(currentFace, {
                        label: event.target.value,
                      });
                    }}
                    autoFocus={false}
                    id="face-label"
                    value={coinFaceConfig.label || ""}
                    placeholder={labelInputProps.placeholder}
                    className="order-1 w-full peer rounded-none border-gray-400 px-2 outline-none min-h-10 border-2 focus:border-[--coin-current-face-color]"
                  />
                </div>
                <div className="flex flex-col relative items-start">
                  <label
                    className="text-center  -translate-y-1/2 absolute bg-white text-sm px-1 ml-1.5 -mb-2.5"
                    htmlFor="face-label"
                  >
                    ICON
                  </label>
                  <input
                    onChange={(event) => {
                      updateCoinFaceConfig(currentFace, {
                        icon: event.target.value,
                      });
                    }}
                    autoFocus={false}
                    id="face-icon"
                    value={coinFaceConfig.icon || ""}
                    placeholder={iconInputProps.placeholder}
                    className="w-full rounded-none border-gray-400 px-2 outline-none min-h-10 border-2 focus:border-[--coin-current-face-color]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
        {/* </Dialog.Overlay> */}
        {/* </div> */}
        {/* <Dialog.Content className="DialogContent">


				<Dialog.Title className="DialogTitle">Edit profile</Dialog.Title>
				<Dialog.Description className="DialogDescription">
					Make changes to your profile here. Click save when you're done.
				</Dialog.Description>
				<fieldset className="Fieldset">
					<label className="Label" htmlFor="name">
						Name
					</label>
					<input className="Input" id="name" defaultValue="Pedro Duarte" />
				</fieldset>
				<fieldset className="Fieldset">
					<label className="Label" htmlFor="username">
						Username
					</label>
					<input className="Input" id="username" defaultValue="@peduarte" />
				</fieldset>
				<div
					style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
				>
					<Dialog.Close asChild>
						<button className="Button green">Save changes</button>
					</Dialog.Close>
				</div>
				<Dialog.Close asChild>
					<button className="IconButton" aria-label="Close">
						<Cross2Icon />
					</button>
				</Dialog.Close>
			</Dialog.Content> */}
      </Dialog.Portal>
    </Dialog.Root>

    // <Popover.Root>
    //   <Popover.Trigger asChild>

    //   </Popover.Trigger>
    //   <Popover.Portal>
    //     <Popover.Content
    //       className="pt-10 outline-none justify-end flex flex-col w-[calc(var(--radix-popper-available-width)-110px)]"
    //       sideOffset={10}
    //       align="end"
    //       side="right"
    //       alignOffset={0}
    //     >
    //       <Tabs.Root className="button-group flex-col" defaultValue="head">
    //         {/* <div className="button-group w-full">
    //           {Object.values(COIN_FACE).map((face) => {
    //             return (
    //               <Button
    //                 key={face}
    //                 onClick={() => setActiveFaceConfig(face)}
    //                 contentClassName="min-h-12"
    //                 className="w-full"
    //               >
    //                 {face}
    //               </Button>
    //             );
    //           })}
    //         </div> */}

    //       </Tabs.Root>
    //     </Popover.Content>
    //   </Popover.Portal>
    // </Popover.Root>
  );
};

export default ConfigureCoinButton;
