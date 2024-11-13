import { Canvas } from "@react-three/fiber";

import { lazy, Suspense, useEffect, useRef } from "react";
import clsx from "clsx";
import { APP_STATE, CHOICE } from "./type";
import { useAppStore } from "./store";
import { useTransition } from "react-spring";
import { animated, useSpring } from "@react-spring/web";
import { SpeakerWave } from "./components/icons/SpeakerWave";
import { SpeakerXMark } from "./components/icons/SpeakerXMark";

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

const HistoryList = ({ className }: { className?: string }) => {
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

const ToggleAudioButton = ({ className }: { className?: string }) => {
  const isAudioMuted = useAppStore((state) => state.isAudioMuted);
  const toggleIsAudioMuted = useAppStore((state) => state.toggleIsAudioMuted);

  const Icon = isAudioMuted ? SpeakerXMark : SpeakerWave;

  return (
    <button
      onClick={toggleIsAudioMuted}
      className={clsx(
        "size-10 flex items-center transition-all justify-center",
        isAudioMuted ? "invert-[40%]" : "invert-[80%]",
        className
      )}
    >
      <Icon className="size-8" />
    </button>
  );
};

const AnimatedCoinScene = lazy(() => import("./AnimatedCoinScene"));

const App = () => {
  // NOTE: iphone shows selection magnifier on dbl touch
  // below code prevents it but in some cases it also prevents normal scroll
  // useEffect(() => {
  //   function createDoubleTapPreventer(timeout: number) {
  //     let dblTapTimer = 0;
  //     let dblTapPressed = false;

  //     return function (e: TouchEvent) {
  //       clearTimeout(dblTapTimer);
  //       if (dblTapPressed) {
  //         e.preventDefault();
  //         dblTapPressed = false;
  //       } else {
  //         dblTapPressed = true;
  //         dblTapTimer = setTimeout(() => {
  //           dblTapPressed = false;
  //         }, timeout);
  //       }
  //     };
  //   }
  //   const handler = createDoubleTapPreventer(500);

  //   window.addEventListener("touchstart", handler, { passive: false });

  //   return () => {
  //     window.removeEventListener("touchstart", handler);
  //   };
  // }, []);

  return (
    <main className="relative flex flex-col h-full">
      <div className="fixed z-10 right-0 select-none p-5 flex">
        <ToggleAudioButton />
      </div>

      <div className="relative min-h-0 h-full">
        <Canvas
          shadows
          camera={{ position: [0, 2.7, 6] }}
          className="[&_canvas]:touch-none select-none"
        >
          <Suspense fallback={"Loading"}>
            <AnimatedCoinScene />
          </Suspense>
        </Canvas>
      </div>

      <HistoryList className="fixed bottom-0 left-0 right-0 w-full select-none flex-shrink-0 pt-1 px-8 pb-8 pr-[calc(50vw-16px)]" />
    </main>
  );
};

export default App;
