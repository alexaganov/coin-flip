import React from "react";
import { CHOICE, ChoiceType } from "./type";
import { CoinFaceUp } from "./components/icons/CoinFaceUp";
import { CoinFaceDown } from "./components/icons/CoinFaceDown";
import clsx from "clsx";

interface CoinOutcomeIconProps {
  choice: ChoiceType;
  outcome: ChoiceType;
  className?: string;
}

const CoinOutcomeIcon = ({
  choice,
  outcome,
  className,
}: CoinOutcomeIconProps) => {
  const Icon = choice === outcome ? CoinFaceUp : CoinFaceDown;

  const colorClassName =
    outcome === CHOICE.HEAD
      ? "text-[var(--coin-head-color)]"
      : "text-[var(--coin-tail-color)]";

  return <Icon className={clsx(colorClassName, className)} />;
};

export default CoinOutcomeIcon;
