import { useMemo } from "react";
import Button from "./components/Button";
import { CoinFaceDown } from "./components/icons/CoinFaceDown";
import { CoinFaceUp } from "./components/icons/CoinFaceUp";
import clsx from "clsx";
import { HistoryRecord, useAppStore } from "./store";
import { useTransition, animated } from "react-spring";
import { CHOICE } from "./type";

const CoinList = ({ items }: { items: HistoryRecord[] }) => {
  const iconClassName = "size-6 flex-center shrink-0";

  const transitions = useTransition(items, {
    from: { x: "100%", opacity: 0 },
    initial: { x: "0%" },
    enter: (item) => {
      return { x: "0%", opacity: item.choice !== item.outcome ? 0.5 : 1 };
    },
    keys: (data) => data.id,
  });

  return (
    <div className="flex items-center justify-center flex-1 px-4">
      {transitions((style, item) => {
        const Icon = item.choice === item.outcome ? CoinFaceUp : CoinFaceDown;

        return (
          <animated.span
            style={style}
            key={item.id}
            className={clsx(
              iconClassName,
              item.outcome === CHOICE.HEAD
                ? "text-[var(--coin-head-color)]"
                : "text-[var(--coin-tail-color)]"
            )}
          >
            <Icon className="w-full h-full" />
          </animated.span>
        );
      })}
    </div>
  );
};

const getLastStreakGroups = (
  items: HistoryRecord[],
  max: number
): { id: string; items: HistoryRecord[] }[] => {
  const groups: { id: string; items: HistoryRecord[] }[] = [];
  let streak: HistoryRecord[] = [];

  for (let i = items.length - 1; i >= 0 && groups.length < 2; --i) {
    const item = items[i];

    if (item.choice === item.outcome) {
      streak.unshift(item);
    } else {
      if (streak.length) {
        groups.unshift({
          id: streak[0].id,
          items: streak,
        });
      }

      groups.unshift({
        id: item.id,
        items: [item],
      });

      streak = [];
    }
  }

  return groups.slice(
    groups.length > 0 && groups[groups.length - 1].items.length > 1 ? -1 : -max
  );
};

const HistoryButton = ({ className }: { className?: string }) => {
  const history = useAppStore((state) => state.history);

  const lastTwoStreakGroups = useMemo(
    () => getLastStreakGroups(history, 2),
    [history]
  );

  const groupClassName =
    "relative overflow-hidden min-w-[60px] justify-end shadow-[1px_0,-1px_0] shadow-black items-center flex";

  return (
    <Button
      className={className}
      contentClassName="w-[7.5rem] items-stretch relative overflow-hidden px-0"
    >
      {lastTwoStreakGroups.map((item) => {
        return (
          <div
            key={item.id}
            className={clsx(
              groupClassName,
              lastTwoStreakGroups.length === 1 || item.items.length > 1
                ? "w-full"
                : "w-1/2"
            )}
          >
            <CoinList items={item.items} />

            {item.items.length > 1 && (
              <span className="absolute right-0 top-0 overflow-hidden flex-shrink-0 pl-0.5 pr-[0.1875rem] text-sm leading-none border-[var(--contrast-primary-color)] bg-[var(--accent-primary-color)] border-l-2 border-b-2">
                +{item.items.length}
              </span>
            )}
          </div>
        );
      })}
    </Button>
  );
};

export default HistoryButton;
