import { useMemo } from "react";
import Button from "./components/Button";
import { CoinFaceDown } from "./components/icons/CoinFaceDown";
import { CoinFaceUp } from "./components/icons/CoinFaceUp";
import clsx from "clsx";
import { HistoryRecord, useAppStore } from "./store";
import { useTransition, animated } from "react-spring";
import { CHOICE } from "./type";
import * as Popover from "@radix-ui/react-popover";
import CoinOutcomeIcon from "./CoinOutcomeIcon";

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

const groupByStreaks = (items: HistoryRecord[]) => {
  const groups: { id: string; items: HistoryRecord[] }[] = [];
  let streak: HistoryRecord[] = [];

  for (let i = 0; i <= items.length; ++i) {
    const item = items[i];

    if (item && item.choice === item.outcome) {
      streak.push(item);
    } else {
      if (streak.length) {
        groups.push({
          id: streak[0].id,
          items: streak,
        });
      }

      if (item) {
        groups.push({
          id: item.id,
          items: [item],
        });
      }

      streak = [];
    }
  }

  return groups;
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

  const groupedByStreaks = useMemo(() => {
    return groupByStreaks(history).reverse();
  }, [history]);

  const lastTwoStreakGroups = useMemo(
    () => getLastStreakGroups(history, 2),
    [history]
  );

  const groupClassName =
    "relative overflow-hidden min-w-[60px] justify-end shadow-[1px_0,-1px_0] shadow-black items-center flex";

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          className={className}
          aria-label="Open history popup"
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
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="px-[2.4375rem] pt-10 pointer-events-none outline-none justify-end flex flex-col max-w-[calc(768px-4.375rem)] h-[var(--radix-popper-available-height)]  w-[calc(var(--radix-popper-available-width)-4.375rem)]"
          sideOffset={10}
          align="start"
          alignOffset={-39}
        >
          <div className="popover-content pointer-events-auto flex max-h-52 flex-col flex-grow">
            <header className="px-4 py-2 border-b-2 border-black">
              <h2 className="text-xl">History</h2>
            </header>
            <div className="overflow-auto flex-[1_1_0]">
              <ul className="flex h-full divide-x divide-dashed divide-gray-300">
                {groupedByStreaks.map((group, i) => {
                  const isBadOutcome =
                    group.items.length === 1 &&
                    group.items[0].choice !== group.items[0].outcome;

                  return (
                    <li
                      key={group.id}
                      className="flex h-full flex-shrink-0 flex-grow-0 basis-10 w-10 items-center flex-col justify-end"
                    >
                      {i === 0 && (
                        <div className="mb-auto w-full">
                          <div className="text-xs bg-[var(--accent-primary-color)] border-b-2 border-x-2 relative border-black -ml-0.5 -mr-px text-center">
                            RECENT
                          </div>
                        </div>
                      )}
                      {!isBadOutcome && (
                        <div className=" overflow-hidden flex flex-col items-center justify-end">
                          {group.items.length > 1 && (
                            <span className="text-sm flex-shrink-0">
                              +{group.items.length}
                            </span>
                          )}
                          {group.items.map((item, i) => {
                            return (
                              <span
                                style={{ zIndex: group.items.length - i }}
                                className="flex-shrink basis-4 flex-center last:mb-2 min-h-0"
                              >
                                <CoinOutcomeIcon
                                  className="size-6"
                                  choice={item.choice}
                                  outcome={item.outcome}
                                />
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex-center aspect-square w-full h-8 flex-shrink-0 border-t border-t-gray-300">
                        {isBadOutcome && (
                          <CoinOutcomeIcon
                            className="size-6 opacity-50"
                            choice={group.items[0].choice}
                            outcome={group.items[0].outcome}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default HistoryButton;
