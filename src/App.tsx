import { Canvas } from "@react-three/fiber";

import { lazy, ReactNode, Suspense, useEffect, useRef } from "react";
import clsx from "clsx";
import { APP_STATE, CHOICE } from "./type";
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
      className="w-full absolute left-0 top-0 h-full"
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

const App = () => {
  const appState = useAppStore((state) => state.appState);
  const setAppState = useAppStore((state) => state.setAppState);
  const restart = useAppStore((state) => state.restart);
  const isAudioMuted = useAppStore((state) => state.isAudioMuted);

  // const choice = useAppStore((state) => state.currentChoice);
  const currentOutcome = useAppStore((state) => state.currentOutcome);
  const setChoice = useAppStore((state) => state.setChoice);
  const setCurrentOutcome = useAppStore((state) => state.setCurrentOutcome);
  const coinRef = useRef<HTMLDivElement>(null);
  // const windowInnerSize = useWindowInnerSize();

  const updateChoice = (rotationH: number) => {
    const nextChoice =
      roundToMultiple(rotationH, 180) % 360 === 0 ? CHOICE.HEAD : CHOICE.TAIL;

    // console.log({ nextChoice });
    setChoice(nextChoice);
  };

  const [{ rotationV, positionY, rotationH }, api] = useSpring(() => ({
    rotationH: 0,
    rotationV: 0,
    positionY: 0,
    onChange: (result) => {
      if (appState !== APP_STATE.CHOICE) {
        return;
      }

      updateChoice(result.value.rotationH);
    },
  }));

  // const handleHorizontalDrag = ({
  //   movement,
  //   down,
  //   memo,
  // }: Omit<FullGestureState<"drag">, "memo"> & { memo?: { rotateZ: number } }): {
  //   rotateZ: number;
  // } => {
  //   const [x, y, z] = rotation.get();

  //   const rotateZStart = memo?.rotateZ ?? z;

  //   let updatedZ = rotateZStart + (movement[0] / aspect) * QUARTER_ROTATION;

  //   if (!down) {
  //     updatedZ = roundRotationToClosestFace(updatedZ);

  //     setChoice(getChoiceByZRotation(updatedZ));
  //   }

  //   api.start({
  //     rotation: [x, y, updatedZ],
  //     config: {
  //       ...defaultConfig,
  //       tension: down ? 300 : defaultConfig.tension,
  //       friction: down ? 20 : defaultConfig.friction,
  //     },
  //   });

  //   return {
  //     rotateZ: rotateZStart,
  //   };
  // };

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

    // setChoice(getChoiceByZRotation(updatedZ));

    api.start({
      rotationH: updatedH,
      // config: {
      //   ...defaultConfig,
      //   tension: down ? 300 : defaultConfig.tension,
      //   friction: down ? 20 : defaultConfig.friction,
      // },
    });

    return {
      initialH,
    };
  };

  const throwCoin = () => {
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
        // duration: 300,
        duration: 5000,
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
            duration: 1000,
          },
        });

        await delay(50);

        await next({
          positionY: COIN_SIZE / 2,
          config: {
            easing: BezierEasing(0.93, 0.06, 0.84, 0.495),
            // duration: 750,
            duration: 1000,
          },
        });

        const currentRotationV = rotationV.get();

        // // Rotate the coin on the x-axis until the face is facing upwards.
        // // Using roundRotationToClosestFace alone is insufficient since the rotation
        // // must follow the current rotational direction of the coin.
        let rotateVTillFace = roundToMultiple(
          currentRotationV + (180 - (currentRotationV % 180)),
          180
        );

        console.log({ rotateVTillFace });

        // // rotateXTillFace % 2 will be 0
        // // if we choose head but it's tail
        // // if we choose tail buts it's head
        const isOppositeVFace = rotateVTillFace % 360 === 0;

        const currentRotationH = roundToMultiple(rotationH.get(), 180);

        const isRotationHTail = currentRotationH % 360 !== 0;

        const isCurrentTail =
          (!isOppositeVFace && isRotationHTail) ||
          (isOppositeVFace && !isRotationHTail);

        const newOutcome = getRandomBoolean();

        // if (
        //   (newOutcome === CHOICE.TAIL && !isCurrentTail) ||
        //   (newOutcome === CHOICE.HEAD && isCurrentTail)
        // ) {
        //   rotateXTillFace -= NEXT_SIDE_ROTATION;
        // } else {
        //   // To make additional rotation to prevent coin falling flat without animations
        //   rotateXTillFace -= FULL_ROTATION;
        // }

        // TODO:
        const tail = false;
        const head = true;

        if (
          (newOutcome === tail && !isCurrentTail) ||
          (newOutcome === head && isCurrentTail)
        ) {
          rotateVTillFace += 180;
        }
        // else {
        //   // To make additional rotation to prevent coin falling flat without animations
        //   rotateVTillFace += 360;
        // }

        // let rotateZ = roundRotationToClosestFace(currentRotation[2]);

        // // If the label on the coin is upside down,
        // // rotate the coin to make the label upright.
        // if (rotateXTillFace % FULL_ROTATION === 0) {
        //   rotateZ += NEXT_SIDE_ROTATION;
        //   rotateXTillFace -= NEXT_SIDE_ROTATION;

        //   console.log({ rotateXTillFace });

        //   api.set({
        //     rotation: [rotateXTillFace, currentPosition[1], rotateZ],
        //   });

        //   rotateXTillFace -= FULL_ROTATION;
        // }

        const updatedRotationH = currentRotationH;

        // // If the label on the coin is upside down,
        // // rotate the coin to make the label upright.
        // if (rotateVTillFace % 360 === 0) {
        //   updatedRotationH = currentRotationH + 180;
        //   rotateVTillFace -= 180;

        //   // console.log({ rotateXTillFace });

        //   api.set({
        //     rotationH: updatedRotationH,
        //     rotationV: rotateVTillFace,
        //   });

        //   rotateVTillFace -= 180;
        // }

        // // playCoinFallSoundEffect();

        // setIsCameraLookingFromTop(true);

        await next({
          positionY: -window.innerHeight / 2,
          rotationH: updatedRotationH,
          rotationV: rotateVTillFace + 90,
          onResolve: () => {
            setAppState(APP_STATE.OUTCOME);
            setCurrentOutcome(newOutcome === tail ? CHOICE.TAIL : CHOICE.HEAD);
          },
          // rotation: [rotateXTillFace, currentRotation[1], rotateZ],
          config: {
            easing: easings.linear,
            duration: 1000,
            // easing: easings.easeInOutBounce,
            // duration: 300,
          },
          // onResolve: () => {
          //   applyOutcomeState(newOutcome);
          // },
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

    console.log({ updatedV });

    if (updatedV > 90) {
      return throwCoin();
    }

    const rotationProgress = updatedV / 90;

    const MAX_POSITION_Y = 100;

    let updatedY = rotationProgress * MAX_POSITION_Y;

    console.log({ rotationProgress });

    if (!down) {
      updatedV = 0;
      updatedY = 0;
    }

    api.start({
      rotationV: updatedV,
      positionY: updatedY,
    });

    return {
      initialV,
    };
    // if (down) {
    //   updatedY = roundToMultiple(updatedY, 180);
    // }

    // const updatedXRotation =
    //   initialRotation[0] + (movement[1] / aspect) * QUARTER_ROTATION;

    // const xRotationToThrow = Math.abs(initialRotation[0]) + QUARTER_ROTATION;
    // const updatedZRotation = roundRotationToClosestFace(z);

    // if (Math.abs(updatedXRotation) >= xRotationToThrow) {
    //   setAppState(APP_STATE.THROW);

    //   api.set({
    //     // round z because during throw it can be still animated
    //     rotation: [updatedXRotation, y, updatedZRotation],
    //   });
    //   // after toggling useDrag's enabled prop from false to true,
    //   // the down param is still in true causing unintentional interaction
    //   // to prevent this we should cancel before setting enabled to false
    //   cancel();

    //   return;
    // }

    // if (down) {
    //   // const rotationProgress =
    //   //   (Math.abs(updatedXRotation) - Math.abs(initialRotation[0])) /
    //   //   QUARTER_ROTATION;

    //   // const updatePositionY =
    //   //   initialPosition[1] +
    //   //   rotationProgress * (INITIAL_CAMERA_POSITION[1] - initialPosition[1]);

    //   // api.start({

    //   //   // position: [initialPosition[0], updatePositionY, initialPosition[2]],
    //   //   // rotation: [updatedXRotation, y, updatedZRotation],
    //   // });
    // } else {
    //   api.start({
    //     // position: [...initialPosition],
    //     // rotation: [initialRotation[0], y, updatedZRotation],
    //   });
    // }
  };

  const reset = () => {
    restart();
    // setAppState(APP_STATE.CHOICE);

    api.set({
      rotationV: 0,
      rotationH: currentOutcome === CHOICE.HEAD ? 0 : 180,
      positionY: 0,
    });
  };

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
            // transform: "rotateX(-20deg) translateZ(200px)",
            // transform: "rotateX(-30deg)",
            transformOrigin: "center bottom 0",
            transformStyle: "preserve-3d",
          }}
        >
          <Environment />

          <animated.div
            ref={coinRef}
            className="absolute"
            style={{
              transformStyle: "preserve-3d",
              z: -PERSPECTIVE / 2,
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
            <Coin radius={COIN_SIZE} depth={20} />
          </animated.div>
        </div>
      </div>

      <HistoryList className="fixed bottom-0 left-0 right-0 w-full select-none flex-shrink-0 pt-1 px-8 pb-8 pr-[calc(50vw-16px)]" />
    </main>
  );
};

export default App;
