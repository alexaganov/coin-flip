import { useMemo } from "react";
import Button from "./components/Button";
import { CoinFaceDown } from "./components/icons/CoinFaceDown";
import { CoinFaceUp } from "./components/icons/CoinFaceUp";
import clsx from "clsx";
import { HistoryRecord, useAppStore } from "./store";
import { useTransition, animated } from "react-spring";
import { COIN_FACE } from "./type";
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
              item.outcome === COIN_FACE.HEAD
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
  const groups: { id: string; items: HistoryRecord[]; isStreak: boolean }[] =
    [];
  let streak: HistoryRecord[] = [];

  // i <= items.length to handle case when streak array
  // has items when for loop is ended
  for (let i = 0; i <= items.length; ++i) {
    const item = items[i];

    if (item && item.choice === item.outcome) {
      streak.push(item);
    } else {
      if (streak.length) {
        groups.push({
          id: streak[0].id,
          items: streak.reverse(),
          isStreak: true,
        });
      }

      if (item) {
        groups.push({
          id: item.id,
          items: [item],
          isStreak: false,
        });
      }

      streak = [];
    }
  }

  return groups;
};

const getHistoryPreviewStreakGroups = (
  items: HistoryRecord[],
  max: number
): { id: string; items: HistoryRecord[] }[] => {
  const groups: { id: string; items: HistoryRecord[]; isStreak: boolean }[] =
    [];
  let streak: HistoryRecord[] = [];

  for (let i = items.length - 1; i >= -1 && groups.length < 2; --i) {
    const item = items[i];

    if (item && item.choice === item.outcome) {
      streak.unshift(item);
    } else {
      if (streak.length) {
        groups.unshift({
          id: streak[0].id,
          items: streak,
          isStreak: true,
        });
      }

      if (item) {
        groups.unshift({
          id: item.id,
          items: [item],
          isStreak: false,
        });
      }

      streak = [];
    }
  }

  if (
    groups.length > 0 &&
    groups[groups.length - 1].isStreak &&
    groups[groups.length - 1].items.length > 1
  ) {
    return groups.slice(-1);
  }

  return groups.slice(-max);
};

const HistoryButton = ({ className }: { className?: string }) => {
  const history = useAppStore((state) => state.history);

  const groupedByStreaks = useMemo(() => {
    return groupByStreaks(history).reverse();
  }, [history]);

  const streakPreviewGroups = useMemo(() => {
    return getHistoryPreviewStreakGroups(history, 2);
  }, [history]);

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
          {!streakPreviewGroups.length && (
            <span className="flex-center text-gray-400">Empty!</span>
          )}
          {streakPreviewGroups.map((item) => {
            return (
              <div
                key={item.id}
                className={clsx(
                  groupClassName,
                  streakPreviewGroups.length === 1 || item.items.length > 1
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
          className="relative pointer-events-none button-group outline-none justify-end flex flex-col max-w-[calc(560px)] w-[calc(var(--radix-popper-available-width))]"
          sideOffset={10}
          align="start"
          side="top"
          // sideOffset={-60}
          // onInteractOutside={(event) => {
          //   event.preventDefault();
          // }}
          // onPointerDownOutside={(event) => {
          //   event.preventDefault();
          // }}
          collisionPadding={{
            top: 60,
            // top: 37,
            left: 39,
            // right padding + two buttons + space
            right: 39 + 60 + 60 + 10,
          }}
        >
          <div className="flex justify-between">
            <header className={clsx("self-start relative")}>
              <h2 className={clsx("text-xl neo-brut-card p-1 px-4")}>
                History
              </h2>

              <div className="neo-brut-shadow" />
            </header>

            {/* <Popover.Close asChild>
              <Button className="btn-sm">
                <Cross className="size-5 text-red-500" />
              </Button>
            </Popover.Close> */}
          </div>

          <div className="relative pointer-events-auto flex h-[7.375rem] flex-col">
            <div className="neo-brut-shadow" />

            <div className="relative neo-brut-card flex overflow-auto flex-[1_1_0]">
              {!groupedByStreaks.length && (
                <p className="m-auto text-center text-gray-400">
                  Empty! Throw the coin to see something.
                </p>
              )}
              {!!groupedByStreaks.length && (
                <div className="relative flex-grow h-full flex">
                  <div
                    className="absolute pointer-events-none w-full text-gray-200 h-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(-90deg, currentcolor 0px, currentcolor 1px, transparent 1px, transparent 100%)",
                      backgroundSize: "40px",
                    }}
                  >
                    <div className="absolute h-px w-full bg-gray-200 bottom-6" />
                  </div>
                  <ul
                    className={clsx(
                      "flex h-full"
                      // "divide-x divide-dashed divide-gray-300"
                    )}
                  >
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
                              <div className="text-xs bg-[var(--accent-primary-color)] border-b-2 border-x-2 relative border-black -ml-0.5 text-center">
                                RECENT
                              </div>
                            </div>
                          )}
                          {!isBadOutcome && (
                            <div className="overflow-hidden flex flex-col items-center justify-end">
                              {group.items.length > 1 && (
                                <span className="text-sm flex flex-shrink-0">
                                  +{group.items.length}
                                </span>
                              )}
                              <div className="flex flex-col items-center justify-end min-h-5 pb-1">
                                {group.items.map((item, i) => {
                                  return (
                                    <span
                                      key={item.id}
                                      style={{ zIndex: group.items.length - i }}
                                      className="flex-shrink basis-4 flex justify-center first:flex-shrink-0 items-end min-h-0"
                                    >
                                      <CoinOutcomeIcon
                                        className="size-5"
                                        choice={item.choice}
                                        outcome={item.outcome}
                                      />
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div
                            className={clsx(
                              "flex-center aspect-square w-full h-6 flex-shrink-0"
                              // "border-t border-t-gray-300"
                            )}
                          >
                            {isBadOutcome && (
                              <CoinOutcomeIcon
                                className="size-5 opacity-50"
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
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default HistoryButton;
