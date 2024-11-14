import { Canvas } from "@react-three/fiber";

import { lazy, ReactNode, Suspense, useEffect, useRef } from "react";
import clsx from "clsx";
import { APP_STATE, CHOICE } from "./type";
import { useAppStore } from "./store";
import { useTransition } from "react-spring";
import { animated, easings, useSpring } from "@react-spring/web";
import { SpeakerWave } from "./components/icons/SpeakerWave";
import { SpeakerXMark } from "./components/icons/SpeakerXMark";
import { useDimension } from "./hooks/useDimensions";
import { useWindowInnerSize } from "./hooks/useWindowInnerSize";
import { Coin } from "./components/Coin";
import { ToggleAudioButton } from "./ToggleAudioButton";
import { styleTransform } from "./utils/css";
import { HistoryList } from "./HistoryList";

const PERSPECTIVE = 1000;

const Environment = () => {
  const windowInnerSize = useWindowInnerSize();

  return (
    <div
      style={{
        transformStyle: "preserve-3d",
      }}
      className="w-full absolute left-0 top-0 h-full"
    >
      <div
        style={{
          transform: `translate3d(0, 0, -1000px)`,
        }}
        className="absolute w-full left-0 top-0 h-full border border-black"
      >
        Wall
      </div>
      <div
        style={{
          height: PERSPECTIVE,
          transform: `translate3d(0, ${
            windowInnerSize.height - PERSPECTIVE / 2
          }px, -${PERSPECTIVE / 2}px) rotate3d(1, 0, 0, 90deg)`,
        }}
        className="absolute h-full w-full left-0 top-0  border border-black"
      >
        Floor
      </div>
    </div>
  );
};

const App = () => {
  const spring = useSpring({
    pause: false,
    from: {
      rotateZ: 0,
    },
    to: {
      rotateZ: 360,
    },
    loop: true,
    config: {
      duration: 5000,
      easing: easings.linear,
    },
  });

  return (
    <main className="relative flex flex-col h-full">
      <div className="fixed z-10 right-0 select-none p-5 flex">
        <ToggleAudioButton />
      </div>

      <div
        style={{
          perspective: PERSPECTIVE,
        }}
        className="relative flex overflow-hidden items-center justify-center min-h-0 h-full"
      >
        <Environment />

        <animated.div
          className="absolute"
          style={{
            transformStyle: "preserve-3d",
            transform: spring.rotateZ.to((value) => {
              return styleTransform()
                .translate3d({
                  z: -PERSPECTIVE / 2,
                })
                .rotateY(value)
                .get();
            }),
          }}
        >
          <Coin radius={150} depth={20} />
        </animated.div>
      </div>

      <HistoryList className="fixed bottom-0 left-0 right-0 w-full select-none flex-shrink-0 pt-1 px-8 pb-8 pr-[calc(50vw-16px)]" />
    </main>
  );
};

export default App;
