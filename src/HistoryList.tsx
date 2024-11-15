import { useEffect, useRef } from "react";
import { useAppStore } from "./store";
import { useSpring, useTransition, animated } from "react-spring";
import clsx from "clsx";
import { APP_STATE, CHOICE } from "./type";

const HistoryListChoiceItem = ({ className }: { className: string }) => {
  const appState = useAppStore((state) => state.appState);
  const currentChoice = useAppStore((state) => state.currentChoice);

  const isCurrentChoiceHead = currentChoice === CHOICE.HEAD;

  return (
    <li
      className={clsx(className, "border transition-colors", {
        "border-red-700": !isCurrentChoiceHead,
        "border-blue-700": isCurrentChoiceHead,
        "animate-[spin_10s_linear_infinite] border-dashed":
          appState === APP_STATE.CHOICE,
      })}
    >
      <span
        className={clsx("bg-current rounded-full size-3.5 transition-all", {
          "text-red-500": !isCurrentChoiceHead,
          "text-blue-500": isCurrentChoiceHead,
          "scale-150": appState === APP_STATE.THROW,
        })}
      />
    </li>
  );
};

export const HistoryList = ({ className }: { className?: string }) => {
  const history = useAppStore((state) => state.history);

  const historyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyContainerRef.current!.scrollLeft =
      historyContainerRef.current!.scrollWidth;
  }, [history]);

  const itemClassName =
    "size-8 flex items-center justify-center shrink-0 rounded-full ";

  const showList = useSpring({
    from: {
      opacity: 0,
      y: "100%",
    },
    to: {
      opacity: 1,
      y: "0%",
    },
  });

  const transitions = useTransition(history, {
    keys(item) {
      return item.id;
    },
    from: { opacity: 0, transform: "translate3d(10px, 0, 0)" },
    enter: { opacity: 1, transform: "translate3d(0, 0, 0)" },
  });

  return (
    <animated.div
      style={showList}
      ref={historyContainerRef}
      className={clsx("mask-image-fade-x flex overflow-auto w-full", className)}
    >
      <ul className={clsx("gap-5 flex ml-auto")}>
        {transitions((style, item) => {
          const isHead = item.outcome === CHOICE.HEAD;

          return (
            <animated.li
              key={item.id}
              style={style}
              className={clsx("flex rounded-full")}
            >
              <span
                key={item.id}
                className={clsx(
                  itemClassName,
                  "transition-all shadow-[2px_1px_0] border",
                  {
                    "border-blue-400 bg-blue-500 text-blue-400 shadow-blue-800":
                      isHead,
                    "border-red-400 bg-red-500 text-red-400  shadow-red-800 ":
                      !isHead,
                    "": true,
                    "opacity-30 scale-90": item.choice !== item.outcome,
                  }
                )}
              >
                <span
                  className={clsx("bg-current transition-colors", {
                    "rounded-full text-red-500": !isHead,
                    "rounded-sm text-blue-500": isHead,
                    "size-4": true,
                  })}
                />
              </span>
            </animated.li>
          );
        })}

        <HistoryListChoiceItem className={clsx(itemClassName)} />
      </ul>
    </animated.div>
  );
};
