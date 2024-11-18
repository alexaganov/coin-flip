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
import {
  FullGestureState,
  useDrag,
  useGesture,
  usePinch,
} from "@use-gesture/react";
import { getRandomBoolean, roundToMultiple } from "./utils/number";

import BezierEasing from "bezier-easing";
import { delay } from "./utils/promise";
import { calculateZAxisProjection, degToRad, radToDeg } from "./utils/math";
import { Environment } from "./Environment";
import Axis from "./Axis";
import Button from "./components/Button";
import { Sliders } from "./components/icons/Sliders";
import { ChevronLeft } from "./components/icons/ChevronLeft";
import { ChevronRight } from "./components/icons/ChevronRight";
import { ThrowCoin } from "./components/icons/ThrowCoin";
import HistoryButton from "./HistoryButton";

const PERSPECTIVE = 1000;

// const COIN_RADIUS = 150;

const defaultConfig = {
  tension: 200,
  friction: 16,
  mass: 1,
  // becaus config is merging every time,
  // bounce can be 0 which removes wobble effect
  bounce: undefined,
} as const;

// const CAMERA_INITIAL_POSITION_Y = 0;
// const COIN_INITIAL_POSITION_Y = -COIN_RADIUS / 2;
// const COIN_INITIAL_POSITION_Y = -200;

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
  const windowInnerSize = useWindowInnerSize();

  const windowInnerMaxSize = Math.max(
    windowInnerSize.height,
    windowInnerSize.width
  );

  const CAMERA_INITIAL_POSITION_Y = 0;
  const CAMERA_INITIAL_POSITION_Z = -400;
  const COIN_RADIUS = 150;
  const COIN_DEPTH = 20;
  // Math.min(
  //   Math.min(windowInnerSize.height, windowInnerSize.width) / 4,
  //   150
  // );
  const COIN_INITIAL_THROW_POSITION_Y = 0; //-COIN_RADIUS / 2;
  // const COIN_INITIAL_POSITION_Y = -COIN_RADIUS / 2;
  const FLOOR_POSITION_Y = COIN_RADIUS * 2;

  // const COIN_FLOOR_POSITION_Y = -(FLOOR_POSITION_Y - COIN_DEPTH / 2);
  const COIN_FLOOR_POSITION_Y = -(
    (windowInnerMaxSize * 1.5) / 2 -
    COIN_DEPTH / 2
  );
  const COIN_INITIAL_POSITION_Z = -PERSPECTIVE;
  // const COIN_POSITION_Z = -COIN_RADIUS * 2; //-PERSPECTIVE / 2;

  const appState = useAppStore((state) => state.appState);
  const setAppState = useAppStore((state) => state.setAppState);
  const restart = useAppStore((state) => state.restart);
  const isAudioMuted = useAppStore((state) => state.isAudioMuted);

  // const choice = useAppStore((state) => state.currentChoice);
  const currentOutcome = useAppStore((state) => state.currentOutcome);
  const currentChoice = useAppStore((state) => state.currentChoice);
  const setChoice = useAppStore((state) => state.setChoice);
  const setCurrentOutcome = useAppStore((state) => state.setCurrentOutcome);
  const containerRef = useRef<HTMLDivElement>(null);
  // const [activeSide, setActiveSide] = useState<ChoiceType>(CHOICE.HEAD);
  // const windowInnerSize = useWindowInnerSize();

  const coinColorSide = currentOutcome ?? currentChoice;
  // const coinColor =
  //   activeSide === CHOICE.HEAD ? "text-blue-500" : "text-red-500";

  const updateChoice = (rotationH: number) => {
    // console.log(" update choice ");
    const nextChoice =
      roundToMultiple(rotationH, 180) % 360 === 0 ? CHOICE.HEAD : CHOICE.TAIL;

    // console.log({ nextChoice });
    setChoice(nextChoice);
  };

  const handleSpringChangeRef = useRef<
    ((params: { rotationV: number; rotationH: number }) => void) | null
  >(null);

  handleSpringChangeRef.current = ({
    rotationH,
    rotationV,
  }: {
    rotationH: number;
    rotationV: number;
  }) => {
    // setActiveSide(
    //   isFrontSideLookingAtScreen(
    //     roundToMultiple(rotationH, 180),
    //     roundToMultiple(rotationV - 90, 180)
    //   )
    //     ? CHOICE.HEAD
    //     : CHOICE.TAIL
    // );

    if (appState === APP_STATE.CHOICE) {
      updateChoice(rotationH);
    }
  };

  const [{ cameraZ, cameraRotateY }, cameraApi] = useSpring(() => ({
    cameraZ: 0,
    cameraRotateY: 0,
  }));

  const [{ rotationV, positionY, rotationH }, api] = useSpring(() => ({
    rotationH: 0,
    rotationV: 0,
    positionZ: COIN_INITIAL_POSITION_Z,
    positionY: COIN_INITIAL_THROW_POSITION_Y,
    onChange: (result) => {
      handleSpringChangeRef.current?.({
        rotationH: result.value.rotationH,
        rotationV: result.value.rotationV,
      });
    },
  }));

  const handleChangeSide = ({
    swipe,
    movement,
    down,
    memo,
    xy,
    tap,
    event,
  }: FullGestureState<"drag">) => {
    const h = rotationH.get();

    const initialH = memo?.initialH ?? h;
    let updatedH = h;

    if (tap) {
      const xProgress = xy[0] / window.innerWidth;
      const dir = xProgress >= 0.5 ? 1 : -1;

      updatedH = roundToMultiple(h + dir * 180, 180);
    } else if (swipe[0] !== 0) {
      updatedH = roundToMultiple(h + swipe[0] * 180, 180);
    } else {
      updatedH = initialH + (movement[0] / COIN_RADIUS) * 180;

      if (!down) {
        updatedH = roundToMultiple(updatedH, 180);
      }
    }

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
          // positionY: window.innerHeight / 2,
          positionY: window.innerHeight,
          config: {
            easing: BezierEasing(0.05, 0.95, 0.205, 0.965),
            duration: 1000,
          },
        });

        await delay(50);

        await next({
          positionY: COIN_RADIUS / 2,
          config: {
            easing: BezierEasing(0.93, 0.06, 0.84, 0.495),
            duration: 750,
            // duration: 5000,
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

        const outcome = newOutcome === tail ? CHOICE.TAIL : CHOICE.HEAD;

        // // playCoinFallSoundEffect();

        await next({
          positionY: COIN_FLOOR_POSITION_Y,
          positionZ: COIN_INITIAL_POSITION_Z - 300,
          // floor level
          // positionY: -(window.innerHeight / 2),
          // y: windowInnerSize.height / 2,
          // z: -perspective / 2,
          rotationH: roundToMultiple(updatedRotationH, 180),
          rotationV: vRotationToLookAtScreen + 90,
          onResolve: () => {
            setAppState(APP_STATE.OUTCOME);
            setCurrentOutcome(outcome);
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

    const ROTATION_TO_THROW = 90;

    // per COIN_SIZE "y" movement do 180 deg rotation
    updatedV = initialV + ((movement[1] * -1) / COIN_RADIUS) * 180;

    if (updatedV > ROTATION_TO_THROW) {
      return throwCoin();
    }

    const rotationProgress = updatedV / ROTATION_TO_THROW;

    const MAX_POSITION_Y_DISTANCE =
      CAMERA_INITIAL_POSITION_Y - COIN_INITIAL_THROW_POSITION_Y ||
      COIN_RADIUS / 2;

    let newPositionY =
      COIN_INITIAL_THROW_POSITION_Y +
      rotationProgress * MAX_POSITION_Y_DISTANCE;

    if (!down) {
      updatedV = 0;
      newPositionY = COIN_INITIAL_THROW_POSITION_Y;
    }

    api.start({
      rotationV: updatedV,
      positionY: newPositionY,
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
      positionY: COIN_INITIAL_THROW_POSITION_Y,
    });
  };

  const containerBind = useGesture(
    {
      onWheel: (state) => {
        // console.log({ wheel: state.offset });
        cameraApi.set({
          cameraZ: state.offset[1] * -1,
          cameraRotateY: state.offset[0],
        });
        // if (state.axis === "y") {
        //   cameraZ.set();
        // }

        // if ()
        // console.log(" pinch", state);
      },
      onDrag: (state) => {
        switch (appState) {
          case APP_STATE.CHOICE: {
            const {
              initial,
              axis,
              swipe,
              event,
              pressed,
              movement,
              delta,
              tap,
              type,
              down,
            } = state;

            // TODO: long press infinite rotation + swipe up to throw

            // console.log({ event, tap, pressed, type });

            // const isTapOnCoin = tap && event?.target?.id === "coin";

            // if (isTapOnCoin) {
            //   return throwCoin();
            // } else
            if (axis === "x" || tap) {
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
                // rotate back to show coin face at screen
                rotationV: v - 90,
                positionY: COIN_INITIAL_THROW_POSITION_Y,
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
    },
    {
      drag: {
        axisThreshold: {
          mouse: 2,
        },
      },
      // target: containerRef,
      // eventOptions: {
      //   capture: false,
      // },
    }
  );

  return (
    <main className="relative flex flex-col h-full">
      <div className="fixed z-10  max-w-3xl left-0 justify-end w-full mx-auto right-0 select-none p-10 flex">
        <ToggleAudioButton />
      </div>

      <animated.div
        {...containerBind()}
        style={{
          perspective: PERSPECTIVE,
          // perspectiveOrigin: positionY.to((value) => {
          //   return `center calc(50% + ${value}px)`;
          // }),
        }}
        className="relative select-none touch-none flex overflow-hidden items-center justify-center h-full"
      >
        {/* <Axis /> */}

        <animated.div
          className="absolute w-full flex items-center justify-center h-full"
          style={{
            transformOrigin: `center center 0`,
            z: cameraZ.to((value) => value - CAMERA_INITIAL_POSITION_Z),
            rotateY: cameraRotateY,
            transform: positionY.to((value) => {
              const distanceFromInitialToFloor =
                COIN_INITIAL_THROW_POSITION_Y - COIN_FLOOR_POSITION_Y;
              const currentDistanceFromInitialToFloor = Math.max(
                COIN_INITIAL_THROW_POSITION_Y - value,
                0
              );

              const currentDistanceProgress =
                currentDistanceFromInitialToFloor / distanceFromInitialToFloor;
              const translateZ =
                currentDistanceProgress * -COIN_INITIAL_POSITION_Z;

              const translateY = currentDistanceProgress * COIN_RADIUS;

              const additionalRotationX = currentDistanceProgress * COIN_RADIUS;
              const distanceToCoin =
                COIN_INITIAL_POSITION_Z + COIN_DEPTH / 2 + translateZ / 2;
              additionalRotationX; //+ (currentDistanceProgress * COIN_DEPTH) / 2;

              const rotateX = radToDeg(Math.atan2(value, distanceToCoin * -1));
              // const rotateX = radToDeg(Math.atan2(value, hypot));
              // const hypot = Math.hypot(translateY, translateZ);

              return styleTransform()
                .translate3d({
                  // z: translateZ,
                  y: translateY,
                })
                .rotateX(rotateX)
                .get();
            }),
            // color: to([rotationH, rotationV], (h, v) => {
            //   return isFrontSideLookingAtScreen(
            //     roundToMultiple(h, 180),
            //     roundToMultiple(v, 360)
            //   )
            //     ? "var(--coin-head-color)"
            //     : "var(--coin-tail-color";
            // }),
            // translateY: 100,
            // translateZ: -1000,
            // translateY: positionY.to((value) => {

            //   return v * -1;
            //   // windowInnerSize.height - PERSPECTIVE / 2
            //   // return radToDeg(value / (window.innerHeight / 2 + COIN_SIZE));
            //   // return 1000 - Math.hypot(value, 1000);
            // }),
            // translateZ: positionY.to((value) => {
            //   const v = Math.min(value, 0);

            //   return v * -1;
            //   // windowInnerSize.height - PERSPECTIVE / 2
            //   // return radToDeg(value / (window.innerHeight / 2 + COIN_SIZE));
            //   // return 1000 - Math.hypot(value, 1000);
            // }),

            // look at coin center
            // rotateX: positionY.to((value) => {
            //   return ;
            // }),
            transformStyle: "preserve-3d",
          }}
        >
          <Environment floorY={300} floorSize={500} perspective={PERSPECTIVE} />

          <animated.div
            style={{
              // when we apply rotation on parent element this element can appear in view
              // to prevent this we are moving it outside of view
              z: positionY.to((value) => {
                return -Math.max(value, 0);
              }),
              transformStyle: "preserve-3d",
            }}
            className="absolute flex-center size-full"
          >
            <animated.div
              style={{
                // transformStyle: "preserve-3d",
                // .magicpattern {
                // }

                // width: 100%;
                // height: 100%;
                // backgroundColor: #e5e5f7;
                maskImage: positionY.to((value) => {
                  const distanceFromInitialToFloor =
                    CAMERA_INITIAL_POSITION_Y - COIN_FLOOR_POSITION_Y;
                  const currentDistanceFromInitialToFloor = Math.max(
                    CAMERA_INITIAL_POSITION_Y - value,
                    0
                  );

                  const currentDistanceProgress =
                    currentDistanceFromInitialToFloor /
                    distanceFromInitialToFloor;

                  console.log({ currentDistanceProgress });

                  return `radial-gradient(circle, rgba(0, 0, 0, 0.5) 0, rgba(0, 0, 0, 0) ${
                    currentDistanceProgress * COIN_RADIUS + COIN_RADIUS
                  }px)`;
                }),
                width: 500, //windowInnerSize.width * 2,
                height: 500, //perspective * 2,
                transform: styleTransform()
                  .translate3d({
                    y: FLOOR_POSITION_Y,
                    z: COIN_INITIAL_POSITION_Z,
                  })
                  .rotateX(90)
                  .get(),
              }}
              className="absolute size-full transition-colors"
            >
              <animated.div
                style={{
                  // rotateZ: 45,
                  // opacity: 0.8,
                  // transformStyle: "preserve-3d",
                  backgroundSize: "20px 20px",
                  backgroundImage: to([rotationH, rotationV], (h, v) => {
                    const color = isFrontSideLookingAtScreen(
                      roundToMultiple(h, 180),
                      roundToMultiple(v, 360)
                    )
                      ? "var(--coin-head-color)"
                      : "var(--coin-tail-color)";
                    return [
                      `linear-gradient(${color} 1px, transparent 1px)`,
                      `linear-gradient(to right, ${color} 1px, transparent 1px)`,
                    ].join();
                    return;
                  }),
                }}
                className="hidden absolute size-full"
              />
              {/* <animated.div
                style={{
                  backgroundPosition: "center",
                  backgroundSize: "80%",
                  backgroundRepeat: "no-repeat",
                  backgroundImage: `radial-gradient(circle at center, transparent 0%, white 55%)`,
                }}
                className="absolute size-full"
              /> */}
            </animated.div>

            <div
              style={{
                width: 500, //windowInnerSize.width * 2,
                height: 500, //perspective * 2,
                transform: styleTransform()
                  .translate3d({
                    z: COIN_INITIAL_POSITION_Z - 250,
                    y: FLOOR_POSITION_Y - 500 / 2,
                    // y: floorY - floorSize / 2,
                    // z: -floorSize / 2,
                    // y: windowInnerSize.height / 2,
                    // z: COIN_POSITION_Z,
                  })
                  // .rotateX(90)
                  .get(),
              }}
              className="hidden absolute size-full border border-black"
            >
              Wall
            </div>
          </animated.div>

          <animated.div
            id="coin"
            className={clsx(
              "absolute touch-none flex-center rounded-full transition-colors"
            )}
            style={{
              transformStyle: "preserve-3d",
              z: COIN_INITIAL_POSITION_Z,
              willChange: "color, transform",
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
            <Coin
              radius={COIN_RADIUS}
              depth={COIN_DEPTH}
              // className="pointer-events-none touch-none"
            />
          </animated.div>
        </animated.div>

        {/* <div className="absolute size-full flex justify-center items-center">
          <div className="absolute w-0.5 h-5 bg-black/40" />
          <div className="absolute w-5 h-0.5 bg-black/40" />
        </div> */}
      </animated.div>

      <div className="fixed mx-auto max-w-3xl justify-between right-0 items-end bottom-0 flex gap-5 left-0 w-full select-none px-10 pb-10">
        <HistoryButton />

        <div className="flex items-end flex-col gap-5">
          <div className="button-group flex-col items-end">
            {/* <div className="button-group">
            </div> */}
            <Button>
              <ThrowCoin className="size-6" />
            </Button>

            <div className="button-group">
              <Button>
                <ChevronLeft className="size-6" />
              </Button>

              <Button>
                <ChevronRight className="size-6" />
              </Button>
            </div>

            <Button>
              <Sliders className="size-6" />
            </Button>
          </div>
        </div>
        {/* <div className="h-14 border-2 border-black flex-1 bg-white shadow-[4px_4px_0] shadow-black"></div> */}
      </div>
      {/* <HistoryList className="fixed bottom-0 left-0 right-0 w-full select-none flex-shrink-0 pt-1 px-8 pb-8 pr-[calc(50vw-16px)]" /> */}
    </main>
  );
};

export default App;
