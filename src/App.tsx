import { useRef } from "react";
import clsx from "clsx";
import { APP_STATE, CHOICE } from "./type";
import { useAppStore } from "./store";
import { animated, easings, useSpring } from "@react-spring/web";
import { Coin } from "./components/Coin";
import { ToggleAudioButton } from "./ToggleAudioButton";
import { styleTransform } from "./utils/css";
import { FullGestureState, useGesture } from "@use-gesture/react";
import { getRandomBoolean, roundToMultiple } from "./utils/number";

import BezierEasing from "bezier-easing";
import { delay } from "./utils/promise";
import { calculateZAxisProjection, degToRad, radToDeg } from "./utils/math";
import { Environment } from "./Environment";
import Button from "./components/Button";
import { ChevronLeft } from "./components/icons/ChevronLeft";
import { ChevronRight } from "./components/icons/ChevronRight";
import { ThrowCoin } from "./components/icons/ThrowCoin";
import HistoryButton from "./HistoryButton";
import { Refresh } from "./components/icons/Refresh";
import { useSoundEffects } from "./SoundEffectsProvider";

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
  const { soundEffects } = useSoundEffects();

  const CAMERA_INITIAL_POSITION_Y = 0;
  const CAMERA_INITIAL_POSITION_Z = 0;
  const COIN_RADIUS = 180;
  const COIN_DEPTH = 20;
  // Math.min(
  //   Math.min(windowInnerSize.height, windowInnerSize.width) / 4,
  //   150
  // );
  const COIN_INITIAL_THROW_POSITION_Y = -COIN_RADIUS / 2;
  // const FLOOR_POSITION_Y = COIN_RADIUS * 2;

  // const COIN_FLOOR_POSITION_Y = -(FLOOR_POSITION_Y - COIN_DEPTH / 2);
  const COIN_FLOOR_POSITION_Y = -(PERSPECTIVE / 2 - COIN_DEPTH / 2);
  const COIN_INITIAL_POSITION_Z = -PERSPECTIVE / 2;
  // const COIN_POSITION_Z = -COIN_RADIUS * 2; //-PERSPECTIVE / 2;

  const appState = useAppStore((state) => state.appState);
  const setAppState = useAppStore((state) => state.setAppState);
  const restart = useAppStore((state) => state.restart);

  // const choice = useAppStore((state) => state.currentChoice);
  const currentOutcome = useAppStore((state) => state.currentOutcome);
  const currentChoice = useAppStore((state) => state.currentChoice);
  const setChoice = useAppStore((state) => state.setChoice);
  const setCurrentOutcome = useAppStore((state) => state.setCurrentOutcome);

  const handleSpringChangeRef = useRef<
    ((params: { rotationV: number; rotationH: number }) => void) | null
  >(null);

  handleSpringChangeRef.current = ({
    rotationH,
  }: {
    rotationH: number;
    rotationV: number;
  }) => {
    if (appState !== APP_STATE.CHOICE) {
      return;
    }

    const nextChoice =
      roundToMultiple(rotationH, 180) % 360 === 0 ? CHOICE.HEAD : CHOICE.TAIL;

    setChoice(nextChoice);
  };

  const [{ cameraZ, cameraRotateY }] = useSpring(() => ({
    cameraZ: 0,
    cameraRotateY: 0,
  }));

  const [{ rotationV, positionY, rotationH }, api] = useSpring(() => ({
    rotationH: 0,
    rotationV: 0,
    positionY: COIN_INITIAL_THROW_POSITION_Y,
    onChange: (result) => {
      handleSpringChangeRef.current?.({
        rotationH: result.value.rotationH,
        rotationV: result.value.rotationV,
      });
    },
  }));

  const handleChangeSide = ({
    movement,
    down,
    memo,
  }: FullGestureState<"drag">) => {
    const h = rotationH.get();

    const initialH = memo?.initialH ?? h;

    let updatedH = h;

    updatedH = initialH + (movement[0] / COIN_RADIUS) * 180;

    if (!down) {
      updatedH = roundToMultiple(updatedH, 180);
    }

    api.start({
      rotationH: updatedH,
      config: defaultConfig,
    });

    return {
      initialH,
    };
  };

  const turnCoinInDirection = (dir: -1 | 1) => {
    if (appState !== APP_STATE.CHOICE) {
      return;
    }

    const h = rotationH.get();

    api.start({
      rotationH: roundToMultiple(h + dir * 180, 180),
      config: defaultConfig,
    });
  };

  const turnCoinLeft = () => {
    turnCoinInDirection(-1);
  };

  const turnCoinRight = () => {
    turnCoinInDirection(1);
  };

  const throwCoin = () => {
    if (appState !== APP_STATE.CHOICE) {
      return;
    }

    soundEffects.coinThrow.play();

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
          positionY: PERSPECTIVE,
          config: {
            easing: BezierEasing(0.05, 0.95, 0.205, 0.965),
            duration: 1000,
          },
        });

        await delay(50);

        await next({
          positionY: COIN_FLOOR_POSITION_Y + COIN_RADIUS,
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

        const outcome = newOutcome === tail ? CHOICE.TAIL : CHOICE.HEAD;

        soundEffects.coinThrow.stop();
        soundEffects.coinFall.play();

        await next({
          positionY: COIN_FLOOR_POSITION_Y,
          rotationH: roundToMultiple(updatedRotationH, 180),
          rotationV: vRotationToLookAtScreen + 90,
          onResolve: () => {
            setAppState(APP_STATE.OUTCOME);
            setCurrentOutcome(outcome);
          },
          config: {
            easing: easings.easeInOutBounce,
            duration: soundEffects.coinFall.duration,
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
    const v = rotationV.get();

    setAppState(APP_STATE.RESTART);

    api.start({
      // rotate back to show coin face at screen
      rotationV: v - 90,
      positionY: COIN_INITIAL_THROW_POSITION_Y,
      onResolve: () => {
        restart();

        api.set({
          rotationV: 0,
          rotationH: currentOutcome === CHOICE.HEAD ? 0 : 180,
          positionY: COIN_INITIAL_THROW_POSITION_Y,
        });
      },
      config: {
        duration: 500,
        easing: easings.easeOutSine,
      },
    });
  };

  const containerBind = useGesture(
    {
      // onWheel: (state) => {
      //   // console.log({ wheel: state.offset });
      //   cameraApi.set({
      //     cameraZ: state.offset[1] * -1,
      //     cameraRotateY: state.offset[0],
      //   });
      //   // if (state.axis === "y") {
      //   //   cameraZ.set();
      //   // }

      //   // if ()
      //   // console.log(" pinch", state);
      // },
      onDrag: (state) => {
        switch (appState) {
          case APP_STATE.CHOICE: {
            const { axis, tap, xy, swipe } = state;

            // TODO: long press infinite rotation + swipe up to throw

            // console.log({ event, tap, pressed, type });

            // const isTapOnCoin = tap && event?.target?.id === "coin";

            // if (isTapOnCoin) {
            //   return throwCoin();
            // } else
            if (axis === "x" || tap) {
              if (tap) {
                const xProgress = xy[0] / window.innerWidth;
                const dir = xProgress >= 0.5 ? 1 : -1;

                return turnCoinInDirection(dir);
              } else if (swipe[0] !== 0) {
                return turnCoinInDirection(swipe[0] as 1 | -1);
              }

              return handleChangeSide(state);
            } else if (axis === "y") {
              return handlePrepareThrow(state);
            }

            break;
          }

          case APP_STATE.OUTCOME: {
            if (state.active) {
              reset();
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
    }
  );

  const handleActionButtonClick = () => {
    if (appState === APP_STATE.CHOICE) {
      throwCoin();
    } else if (appState === APP_STATE.OUTCOME) {
      reset();
    }
  };

  return (
    <>
      <h1 className="sr-only">
        Experience the Best 3D Coin Flipping App Online
      </h1>

      <main
        style={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          "--current-face-color": `var(${
            currentChoice === CHOICE.HEAD
              ? "--coin-head-color"
              : "--coin-tail-color"
          })`,
          "--opposite-face-color": `var(${
            currentChoice === CHOICE.HEAD
              ? "--coin-tail-color"
              : "--coin-head-color"
          })`,
        }}
        className="relative flex flex-col h-full"
      >
        <div
          {...containerBind()}
          style={{
            perspective: PERSPECTIVE,
          }}
          className="relative select-none touch-none flex overflow-hidden items-center justify-center h-full"
        >
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
                  currentDistanceFromInitialToFloor /
                  distanceFromInitialToFloor;
                const cameraTranslateZ =
                  currentDistanceProgress * Math.abs(COIN_INITIAL_POSITION_Z);

                // const cameraTranslateY = currentDistanceProgress * 250;
                // // TODO: figure out formula to calc angle
                // const cameraRotateZ = currentDistanceProgress * 20.65;

                const rotateX = radToDeg(
                  Math.atan2(
                    value + (currentDistanceProgress * COIN_DEPTH) / 2,
                    -COIN_INITIAL_POSITION_Z
                  )
                );

                return styleTransform()
                  .translate3d({
                    z: cameraTranslateZ,
                  })
                  .rotateX(rotateX)
                  .get();
              }),
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
          >
            <Environment perspective={PERSPECTIVE} />

            <animated.div
              id="coin"
              className={clsx(
                "absolute touch-none flex-center rounded-full transition-colors"
              )}
              style={{
                transformStyle: "preserve-3d",
                z: COIN_INITIAL_POSITION_Z,
                y: positionY.to((y) => y * -1),
                willChange: "transform",
                rotateX: rotationV,
                rotateY: rotationH,
              }}
            >
              <Coin
                radius={COIN_RADIUS}
                depth={COIN_DEPTH}
                // className="text-[var(--current-face-color)]"
              />
            </animated.div>
          </animated.div>

          {/* <div className="absolute size-full flex justify-center items-center">
          <div className="absolute w-0.5 h-5 bg-black/40" />
          <div className="absolute w-5 h-0.5 bg-black/40" />
        </div> */}
        </div>

        <div className="fixed mx-auto button-group pointer-events-none max-w-3xl justify-between m-auto right-0 top-0 bottom-0 flex flex-col left-0 w-full select-none p-10">
          <ToggleAudioButton className="pointer-events-auto self-end" />

          <div className="flex justify-between items-end pointer-events-none">
            <HistoryButton className="pointer-events-auto" />

            <div className="flex button-group gap-3 [&>*]:pointer-events-auto items-end flex-col">
              <Button
                disabled={
                  appState === APP_STATE.THROW || appState === APP_STATE.RESTART
                }
                onClick={handleActionButtonClick}
                className={clsx(
                  appState === APP_STATE.CHOICE && "text-[--current-face-color]"
                )}
              >
                {appState !== APP_STATE.OUTCOME && (
                  <ThrowCoin className="size-6" />
                )}
                {appState === APP_STATE.OUTCOME && (
                  <Refresh className="size-6" />
                )}
              </Button>

              <div className="button-group">
                <Button
                  disabled={appState !== APP_STATE.CHOICE}
                  onClick={turnCoinLeft}
                >
                  <ChevronLeft className="size-6" />
                </Button>

                <Button
                  disabled={appState !== APP_STATE.CHOICE}
                  onClick={turnCoinRight}
                >
                  <ChevronRight className="size-6" />
                </Button>
              </div>

              {/* <Button>
            <Sliders className="size-6" />
          </Button> */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
