import { Canvas } from "@react-three/fiber";

import { lazy, ReactNode, Suspense, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { APP_STATE, CHOICE, ChoiceType } from "./type";
import { useAppStore } from "./store";
import { useTransition } from "react-spring";
import { animated, easings, to, useSpring } from "@react-spring/web";
import { SpeakerWave } from "./components/icons/SpeakerWave";
import { SpeakerXMark } from "./components/icons/SpeakerXMark";
import { useDimension } from "./hooks/useDimensions";
import { useWindowInnerSize } from "./hooks/useWindowInnerSize";
import { Coin } from "./components/Coin";
import { ToggleAudioButton } from "./ToggleAudioButton";
import { styleTransform } from "./utils/css";
import { HistoryList } from "./HistoryList";
import { FullGestureState, useDrag } from "@use-gesture/react";
import { getRandomBoolean, roundToMultiple } from "./utils/number";

import BezierEasing from "bezier-easing";
import { delay } from "./utils/promise";
import { calculateZAxisProjection, degToRad, radToDeg } from "./utils/math";

const PERSPECTIVE = 1000;

const Environment = () => {
  const windowInnerSize = useWindowInnerSize();

  return (
    <div
      style={{
        // transform: "rotateX(45deg)",
        // transformOrigin: "center bottom",
        transformStyle: "preserve-3d",
      }}
      className="w-full absolute pointer-events-none left-0 top-0 h-full"
    >
      <div
        style={{
          transform: `translate3d(0, 0, -${PERSPECTIVE}px)`,
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

const COIN_SIZE = 150;

const defaultConfig = {
  tension: 200,
  friction: 16,
  mass: 1,
  // becaus config is merging every time,
  // bounce can be 0 which removes wobble effect
  bounce: undefined,
} as const;

const CAMERA_INITIAL_POSITION_Y = 100;

const isFrontSideLookingAtScreen = (
  xRotationInDegrees: number,
  yRotationInDegrees: number
) => {
  const xRotationInRadians = degToRad(xRotationInDegrees);
  const yRotationInRadians = degToRad(yRotationInDegrees);

  const zProjection = calculateZAxisProjection(
    xRotationInRadians,
    yRotationInRadians
  );

  // console.log({ zProjection });

  return zProjection > 0;
};

const App = () => {
  const appState = useAppStore((state) => state.appState);
  const setAppState = useAppStore((state) => state.setAppState);
  const restart = useAppStore((state) => state.restart);
  const isAudioMuted = useAppStore((state) => state.isAudioMuted);

  // const choice = useAppStore((state) => state.currentChoice);
  const currentOutcome = useAppStore((state) => state.currentOutcome);
  const currentChoice = useAppStore((state) => state.currentChoice);
  const setChoice = useAppStore((state) => state.setChoice);
  const setCurrentOutcome = useAppStore((state) => state.setCurrentOutcome);
  const coinRef = useRef<HTMLDivElement>(null);
  const [activeSide, setActiveSide] = useState<ChoiceType>(CHOICE.HEAD);
  // const windowInnerSize = useWindowInnerSize();

  const updateChoice = (rotationH: number) => {
    console.log(" update choice ");
    const nextChoice =
      roundToMultiple(rotationH, 180) % 360 === 0 ? CHOICE.HEAD : CHOICE.TAIL;

    // console.log({ nextChoice });
    setChoice(nextChoice);
  };

  // const handleChange = (rotationH: number, rotationV: number) => {
  //   setActiveSide(
  //     isFrontSideLookingAtScreen(
  //       roundToMultiple(rotationH, 180),
  //       roundToMultiple(rotationV, 180)
  //     )
  //       ? CHOICE.HEAD
  //       : CHOICE.TAIL
  //   );

  //   if (appState === APP_STATE.CHOICE) {
  //     updateChoice(rotationH);
  //   }
  // };

  // console.log({ activeSide });

  console.log({ currentChoice });

  const [{ rotationV, positionY, rotationH }, api] = useSpring(() => ({
    rotationH: 0,
    rotationV: 0,
    positionY: 0,
    cameraY: 0,
    // onChange: (result) => {
    //   handleChange(result.value.rotationH, result.value.rotationV);
    // },
  }));

  const handleChangeSide = ({
    swipe,
    movement,
    down,
    memo,
  }: FullGestureState<"drag">) => {
    const h = rotationH.get();

    const initialH = memo?.initialH ?? h;
    let updatedH = h;

    if (swipe[0] !== 0) {
      updatedH = roundToMultiple(h + swipe[0] * 180, 180);
    } else {
      updatedH = initialH + (movement[0] / COIN_SIZE) * 180;

      if (!down) {
        updatedH = roundToMultiple(updatedH, 180);
      }
    }

    updateChoice(updatedH);

    // setChoice(getChoiceByZRotation(updatedZ));

    api.start({
      rotationH: updatedH,
      config: defaultConfig,
    });

    return {
      initialH,
    };
  };

  const throwCoin = () => {
    setAppState(APP_STATE.THROW);

    const currentRotationV = rotationV.get();

    // simulate coin rotation
    api.start({
      from: {
        rotationV: currentRotationV,
      },
      to: {
        rotationV: currentRotationV + 360 * 2,
      },
      loop: true,
      config: {
        duration: 300,
        easing: easings.linear,
        bounce: 0,
      },
    });

    api.start({
      to: async (next) => {
        await next({
          positionY: window.innerHeight / 2,
          config: {
            easing: BezierEasing(0.05, 0.95, 0.205, 0.965),
            duration: 750,
          },
        });

        await delay(50);

        await next({
          positionY: COIN_SIZE / 2,
          config: {
            easing: BezierEasing(0.93, 0.06, 0.84, 0.495),
            duration: 750,
          },
        });

        const currentRotationV = rotationV.get();
        const currentRotationH = rotationH.get();

        // v rotation till face of the coin will look right in screen
        let vRotationToLookAtScreen = roundToMultiple(
          currentRotationV + (180 - (currentRotationV % 180)),
          180
        );

        const newOutcome = getRandomBoolean();

        const tail = false;
        const head = true;

        const isFront = isFrontSideLookingAtScreen(
          vRotationToLookAtScreen,
          roundToMultiple(currentRotationH, 180)
        );

        if (
          (newOutcome === tail && isFront) ||
          (newOutcome === head && !isFront)
        ) {
          vRotationToLookAtScreen += 180;
        }

        let updatedRotationH = currentRotationH;

        const isUpsideDown = vRotationToLookAtScreen % 360 !== 0;

        // If the label on the coin is upside down,
        // rotate the coin to make the label upright.
        if (isUpsideDown) {
          updatedRotationH = currentRotationH + 180;

          api.set({
            rotationH: updatedRotationH,
            rotationV: currentRotationV + 180,
          });

          vRotationToLookAtScreen += 180;
        }

        // // playCoinFallSoundEffect();

        // setIsCameraLookingFromTop(true);

        await next({
          positionY: -window.innerHeight / 2,
          rotationH: roundToMultiple(updatedRotationH, 180),
          rotationV: vRotationToLookAtScreen + 90,
          onResolve: () => {
            setAppState(APP_STATE.OUTCOME);
            setCurrentOutcome(newOutcome === tail ? CHOICE.TAIL : CHOICE.HEAD);
          },
          config: {
            easing: easings.easeInOutBounce,
            duration: 300,
          },
        });
      },
      config: {
        bounce: 0,
      },
    });
  };

  const handlePrepareThrow = ({
    down,
    movement,
    memo,
  }: FullGestureState<"drag">) => {
    const v = rotationV.get();

    // only handle up movement
    if (movement[1] >= 0) {
      return;
    }

    const initialV = memo?.initialV ?? v;
    let updatedV = v;

    // per COIN_SIZE "y" movement do 180 deg rotation
    updatedV = initialV + ((movement[1] * -1) / COIN_SIZE) * 180;

    if (updatedV > 90) {
      return throwCoin();
    }

    const rotationProgress = updatedV / 90;

    const MAX_POSITION_Y = 100;

    let updatedY = rotationProgress * MAX_POSITION_Y;

    if (!down) {
      updatedV = 0;
      updatedY = 0;
    }

    api.start({
      rotationV: updatedV,
      positionY: updatedY,
      config: defaultConfig,
    });

    return {
      initialV,
    };
  };

  const reset = () => {
    restart();

    api.set({
      rotationV: 0,
      rotationH: currentOutcome === CHOICE.HEAD ? 0 : 180,
      positionY: 0,
    });
  };

  const coinChoiceTapBind = useDrag((state) => {
    // console.log({ tap });
    if (!state.tap || appState !== APP_STATE.CHOICE) {
      return;
    }
  });

  const coinThrowTapBind = useDrag((state) => {
    // console.log({ tap });
    if (!state.tap || appState !== APP_STATE.CHOICE) {
      throwCoin();
    }
  });

  useDrag(
    (state) => {
      switch (appState) {
        case APP_STATE.CHOICE: {
          const { initial, axis, swipe, movement, delta, tap, down } = state;

          if (axis === "x") {
            return handleChangeSide(state);
          } else if (axis === "y") {
            return handlePrepareThrow(state);
          }

          break;
        }

        case APP_STATE.OUTCOME: {
          if (state.active) {
            const v = rotationV.get();

            api.start({
              rotationV: v - 90,
              positionY: 0,
              onResolve: () => reset(),
              config: {
                duration: 500,
                easing: easings.easeOutSine,
              },
            });
          }
        }
      }
    },
    {
      axisThreshold: {
        mouse: 2,
      },
      target: window,
    }
  );

  return (
    <main className="relative flex flex-col h-full">
      <div className="fixed z-10 right-0 select-none p-5 flex">
        <ToggleAudioButton />
      </div>

      <div
        style={{
          perspective: PERSPECTIVE,
          // transformOrigin: "center center ",
        }}
        className="relative select-none flex overflow-hidden items-center justify-center min-h-0 h-full"
      >
        <div
          className="absolute w-full flex items-center justify-center h-full"
          style={{
            transform: styleTransform()
              .translate3d({
                // y: 200,
              })
              // .rotateX(-20)
              .get(),
            // transform: "rotateX(-20deg) translateZ(200px)",
            // transform: "rotateX(-30deg)",
            transformOrigin: "center bottom 0",
            transformStyle: "preserve-3d",
          }}
        >
          <Environment />

          <animated.div
            className="absolute touch-none"
            style={{
              transformStyle: "preserve-3d",
              z: -PERSPECTIVE / 1.5,
              y: positionY.to((y) => y * -1),
              rotateX: rotationV,
              rotateY: rotationH,
              // rotateX: rotateZ,
              // transform: to([rotationV, rotationH], (v, h) => {
              //   return `rotateX(${v}deg) rotateY(${h}deg)`;
              // }),
              // rotateY,
              // rotateZ,
              // transform: rotateZ.to((value) => {
              //   return styleTransform()
              //     .translate3d({
              //       z:
              //     })
              //     .rotateY(value)
              //     .get();
              // }),
            }}
          >
            <div
              {...coinChoiceTapBind()}
              className="absolute top-0 w-full h-4/5 bg-red-500/10"
            />
            <div
              {...coinThrowTapBind()}
              className="absolute bottom-0 w-full h-1/5 bg-blue-500/10"
            />
            <Coin radius={COIN_SIZE} depth={20} />
          </animated.div>
        </div>
      </div>

      <HistoryList className="fixed bottom-0 left-0 right-0 w-full select-none flex-shrink-0 pt-1 px-8 pb-8 pr-[calc(50vw-16px)]" />
    </main>
  );
};

export default App;
