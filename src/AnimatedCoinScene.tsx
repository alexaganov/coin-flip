import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import BezierEasing from "bezier-easing";
import { Mesh, Vector3 } from "three";
import { useSpring, animated, config, easings } from "@react-spring/three";
import { FullGestureState, useDrag } from "@use-gesture/react";
import {
  RenderTexture,
  Text,
  PerspectiveCamera,
  ContactShadows,
  Outlines,
} from "@react-three/drei";
import {
  DotScreen,
  EffectComposer,
  Outline,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";

const getRandomBoolean = () => {
  // await delay(1500);

  // TODO: add api call
  //'https://www.random.org/integers/?num=1&min=0&max=1&col=1&base=10&format=plain&rnd=new'
  return Math.random() < 0.5;
};

const HALF_PI = Math.PI / 2;
const TWO_PI = Math.PI * 2;

const APP_STATE = {
  CHOICE: "CHOICE",
  THROW: "THROW",
  RESTART: "RESTART",
} as const;

// const INITIAL_POSITION: [number, number, number] = [0, 0.5, 0] as const;
const INITIAL_ROTATION: [number, number, number] = [-HALF_PI, 0, 0];

const delay = (timeout: number) => {
  return new Promise((res) => {
    setTimeout(res, timeout);
  });
};

const getActiveAxis = ([x, y]: [x: number, y: number]): "x" | "y" | null => {
  if (Math.abs(x) > Math.abs(y)) {
    return "x";
  } else if (Math.abs(y) > Math.abs(x)) {
    return "y";
  }

  return null;
};

const getClosestSideZ = (z: number) => {
  return Math.round(z / Math.PI) * Math.PI;
};

const CHOICE = {
  HEAD: "head",
  TAIL: "tail",
} as const;

type ChoiceName = keyof typeof CHOICE;

type ChoiceType = (typeof CHOICE)[ChoiceName];

const getChoice = (rotation: number): ChoiceType => {
  if ((rotation / Math.PI) % 2 === 0) {
    return CHOICE.HEAD;
  }

  return CHOICE.TAIL;
};

const getChoiceRotation = (choice: ChoiceType): number => {
  if (choice === CHOICE.HEAD) {
    return 0;
  }

  return Math.PI;
};

interface CoinProps {
  size: number;
  width: number;
  groundPosition: [number, number, number];
  initialPosition: [number, number, number];
}

const Coin = ({ size, width, groundPosition, initialPosition }: CoinProps) => {
  const [appState, setAppState] = useState<
    (typeof APP_STATE)[keyof typeof APP_STATE]
  >(APP_STATE.CHOICE);

  const [choice, setChoice] = useState<ChoiceType>(CHOICE.HEAD);

  console.log({ choice });

  const { size: canvasSize, viewport } = useThree();
  const aspect = canvasSize.width / viewport.width;

  const [{ rotation, position }, api] = useSpring(
    () => ({
      position: [...initialPosition],
      rotation: [...INITIAL_ROTATION],
    }),
    []
  );

  useEffect(() => {
    if (appState !== APP_STATE.RESTART) {
      return;
    }

    const handlePointerUp = () => {
      api({
        to: {
          position: [...initialPosition],
          rotation: [...INITIAL_ROTATION],
        },
        config: config.gentle,
        onResolve: () => {
          setAppState(APP_STATE.CHOICE);
        },
      });
    };

    window.addEventListener("click", handlePointerUp, {
      once: true,
    });

    return () => {
      window.removeEventListener("click", handlePointerUp);
    };
  }, [appState, api, initialPosition, choice, rotation]);

  useEffect(() => {
    if (appState !== APP_STATE.THROW) {
      return;
    }

    const currentRotation = rotation.get();

    // simulate coin rotation
    api({
      from: {
        rotation: [...currentRotation],
      },
      to: {
        rotation: [
          currentRotation[0] - Math.PI * 2,
          currentRotation[1],
          currentRotation[2],
        ],
      },
      loop: true,
      config: {
        bounce: 0,
      },
    });

    const currentPosition = position.get();

    api({
      to: async (next) => {
        await next({
          position: [
            currentPosition[0],
            currentPosition[1] + 10,
            currentPosition[2],
          ],
          config: {
            easing: BezierEasing(0.05, 0.95, 0.205, 0.965),
            duration: 1000,
          },
        });

        await delay(50);

        await next({
          position: [
            groundPosition[0],
            groundPosition[1] + size / 2,
            groundPosition[2],
          ],
          config: {
            easing: BezierEasing(0.93, 0.06, 0.84, 0.495),
            duration: 750,
          },
        });

        const currentRotation = rotation.get();

        let rotateXTillFace =
          currentRotation[0] - (Math.PI + (currentRotation[0] % Math.PI));

        // because each choice rotates coin on some angle
        // we should consider it to determine current side
        const isChoiceTail = choice === CHOICE.TAIL;

        const isTail = (rotateXTillFace / Math.PI) % 2 === Number(isChoiceTail);

        const randomBoolean = getRandomBoolean();

        if (isTail !== randomBoolean) {
          rotateXTillFace -= Math.PI;
        }

        await next({
          position: [
            groundPosition[0],
            groundPosition[1] + width / 2,
            groundPosition[2],
          ],
          rotation: [rotateXTillFace, currentRotation[1], currentRotation[2]],
          config: {
            easing: easings.easeInOutBounce,
            duration: 300,
          },
          onResolve: () => {
            setAppState(APP_STATE.RESTART);
          },
        });
      },
      config: {
        bounce: 0,
      },
    });
  }, [
    appState,
    position,
    rotation,
    size,
    width,
    groundPosition,
    initialPosition,
    choice,
    api,
  ]);

  const choiceConfig = {
    tension: 100,
    friction: 10,
    mass: 1,
    // becaus config is merging every time,
    // bounce can be 0 which removes wobble effect
    bounce: undefined,
  };

  const handleHorizontalSwipe = ({ swipe }: FullGestureState<"drag">) => {
    const [x, y, z] = rotation.get();

    const updateZ = getClosestSideZ(z + swipe[0] * Math.PI);

    setChoice(getChoice(updateZ));

    api({
      rotation: [x, y, updateZ],
      config: choiceConfig,
    });
  };

  const handleHorizontalDrag = ({
    movement,
    down,
    memo,
  }: Omit<FullGestureState<"drag">, "memo"> & { memo?: { rotateZ: number } }): {
    rotateZ: number;
  } => {
    const [x, y, z] = rotation.get();

    const rotateZStart = memo?.rotateZ ?? z;

    let updatedZ = rotateZStart + movement[0] / aspect;

    if (!down) {
      updatedZ = getClosestSideZ(updatedZ);

      setChoice(getChoice(updatedZ));
    }

    api({
      rotation: [x, y, updatedZ],
      config: choiceConfig,
    });

    return {
      rotateZ: rotateZStart,
    };
  };

  const handleVerticalDrag = ({
    down,
    movement,
    cancel,
  }: FullGestureState<"drag">) => {
    const [, y, z] = rotation.get();

    const updatedX = INITIAL_ROTATION[0] + movement[1] / aspect;

    if (updatedX <= -Math.PI) {
      setAppState(APP_STATE.THROW);

      // after toggling useDrag's enabled prop from false to true,
      // the down param is still in true causing unintentional interaction
      // to prevent this we should cancel before setting enabled to false
      cancel();

      return;
    }

    if (down) {
      const updatePositionY =
        initialPosition[1] + (movement[1] * -1) / aspect / 2;

      api({
        position: [initialPosition[0], updatePositionY, initialPosition[2]],
        rotation: [updatedX, y, getClosestSideZ(z)],
      });
    } else {
      api({
        position: [...initialPosition],
        rotation: [INITIAL_ROTATION[0], y, getClosestSideZ(z)],
      });
    }
  };

  useDrag(
    (state) => {
      // don't use enabled param for useDrag because when it's toggled back
      // down param can be still in true even though mouse/pointer is not active
      if (appState !== APP_STATE.CHOICE) {
        return;
      }

      if (state.swipe[0] !== 0) {
        return handleHorizontalSwipe(state);
      }

      const { movement, direction, down, memo } = state;

      let updatedMemo = {
        ...memo,
        activeAxis: memo?.activeAxis ?? getActiveAxis(direction),
      } as ReturnType<typeof handleHorizontalDrag> & {
        activeAxis: "x" | "y" | null;
      };

      if (updatedMemo.activeAxis === "x") {
        updatedMemo = {
          ...updatedMemo,
          ...handleHorizontalDrag(state),
        };
      } else if (updatedMemo.activeAxis === "y" && movement[1] < 0) {
        handleVerticalDrag(state);
      }

      if (!down) {
        return;
      }

      return updatedMemo;
    },
    {
      target: window,
    }
  );

  useFrame(({ camera }) => {
    camera.lookAt(new Vector3(...position.get()));
  });

  const meshRef = useRef<Mesh>(null);

  return (
    <>
      <animated.mesh
        ref={meshRef}
        rotation={rotation}
        position={position}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[size / 2, size / 2, width, 50]} />

        {/* <meshNormalMaterial /> */}

        <meshStandardMaterial transparent color="white" attach="material-0">
          {/* <color attach="background" args={["orange"]} />
          <RenderTexture attach="map">
          </RenderTexture> */}
        </meshStandardMaterial>

        <meshStandardMaterial
          // color="red"
          attach="material-1"
        >
          <RenderTexture attach="map">
            <PerspectiveCamera
              makeDefault
              manual
              aspect={1 / 1}
              position={[0, 0, 5]}
            />
            <color attach="background" args={["red"]} />
            {/* <Text color="black" rotation={[0, 0, -HALF_PI]}>
              ❀
            </Text> */}
          </RenderTexture>
        </meshStandardMaterial>

        <meshStandardMaterial
          metalness={0.5}
          roughness={0.2}
          attach="material-2"
        >
          <RenderTexture attach="map">
            <PerspectiveCamera
              makeDefault
              manual
              aspect={1 / 1}
              position={[0, 0, 5]}
            />
            <color attach="background" args={["blue"]} />
            {/* <Text
              lineHeight={1}
              color="black"
              fontSize={2}
              rotation={[0, 0, -HALF_PI]}
            >
              ✦꥟❂✹
            </Text> */}
          </RenderTexture>
        </meshStandardMaterial>

        <Outlines thickness={5} color="black" />
      </animated.mesh>
    </>
  );
};

export const AnimatedCoinScene = () => {
  return (
    <>
      <gridHelper
        receiveShadow={false}
        args={[100, 100, "#bbb", "#bbb"]}
        position={[0, -0.000001, 0]}
      />

      <Coin
        groundPosition={[0, 0, 0]}
        initialPosition={[0, 3, 0]}
        size={2}
        width={0.1}
      />

      <ContactShadows
        position={[0, 0, 0]}
        scale={10}
        blur={0.4}
        opacity={0.2}
      />
    </>
  );
};
