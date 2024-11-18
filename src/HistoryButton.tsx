import React from "react";
import Button from "./components/Button";
import { CoinFaceDown } from "./components/icons/CoinFaceDown";
import { CoinFaceUp } from "./components/icons/CoinFaceUp";

const HistoryButton = () => {
  const iconClassName = "size-6 shrink-0";

  return (
    <Button
      innerClassName="overflow-hidden pl-0 justify-start"
      className="w-[7.5rem]"
    >
      <span className="absolute right-0 top-0 px-0.5 text-sm leading-none border-black border-l-2 border-b-2">
        +4
      </span>
      <div className="flex">
        <CoinFaceUp className={iconClassName} />
        <CoinFaceUp className={iconClassName} />
        <CoinFaceDown className={iconClassName} />
        <CoinFaceUp className={iconClassName} />
        <CoinFaceDown className={iconClassName} />
        <CoinFaceDown className={iconClassName} />
      </div>
    </Button>
  );
};

export default HistoryButton;
