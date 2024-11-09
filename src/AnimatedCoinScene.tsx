import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import BezierEasing from "bezier-easing";
import { Vector3 } from "three";
import { useSpring, animated, config } from "@react-spring/three";
import { useDrag } from "@use-gesture/react";
import {
  RenderTexture,
  Text,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei";

const getRandomBoolean = () => {
  // await delay(1500);

  // TODO: add api call
  //'https://www.random.org/integers/?num=1&min=0&max=1&col=1&base=10&format=plain&rnd=new'
  return Math.random() < 0.5;
};

const HALF_PI = Math.PI / 2;
const TWO_PI = Math.PI * 2;

const COIN_STATE = {
  CHOICE: "CHOICE",
  THROW: "THROW",
  END: "END",
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

interface CoinProps {
  size: number;
  width: number;
  initialPosition: [number, number, number];
}

const Coin = ({ size, width, initialPosition }: CoinProps) => {
  const [coinState, setCoinState] = useState<
    (typeof COIN_STATE)[keyof typeof COIN_STATE]
  >(COIN_STATE.CHOICE);

  const [choice, setChoice] = useState<ChoiceType>(CHOICE.HEAD);

  console.log({ choice });

  const { size: canvasSize, viewport } = useThree();
  const aspect = canvasSize.width / viewport.width;

  const [{ rotation, position }, api] = useSpring(() => ({
    position: [...initialPosition],
    rotation: [...INITIAL_ROTATION],
    config: {
      friction: 10,
    },
  }));

  useEffect(() => {
    const hanldeTrow = async () => {
      const currentRotation = rotation.get();

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

      await api({
        to: async (next) => {
          await next({
            position: [
              currentPosition[0],
              currentPosition[1] + 10,
              currentPosition[2],
            ],
            config: {
              // friction: 25,
              // velocity: 0,
              easing: BezierEasing(0.05, 0.95, 0.205, 0.965),
              duration: 1000,
            },
          });

          await delay(50);

          await next({
            position: [...initialPosition],
            config: {
              easing: BezierEasing(0.93, 0.06, 0.84, 0.495),
              duration: 750,
            },
          });

          const currentRotation = rotation.get();

          const rotateXTillFace =
            currentRotation[0] - (Math.PI + (currentRotation[0] % Math.PI));

          console.log((rotateXTillFace / Math.PI) % 2);

          const isTail = (rotateXTillFace / Math.PI) % 2 === 0;

          console.log({ isTail });
          // rotateXTillFace +=
          // const ranfomBoolean = getRandomBoolean();

          await next({
            position: [
              initialPosition[0],
              initialPosition[1] - size / 2 + width / 2,
              initialPosition[2],
            ],
            rotation: [rotateXTillFace, currentRotation[1], currentRotation[2]],
            config: {
              // easing: BezierEasing(0.93, 0.06, 0.84, 0.495),
              duration: 5000,
            },
          });
        },
        config: {
          bounce: 0,
        },
      });

      console.log(" on ground ");
    };

    if (coinState === COIN_STATE.THROW) {
      hanldeTrow();
    }

    // window.addEventListener("click", handleEndState);

    // return () => {
    //   window.removeEventListener("click", handleEndState);
    // };
  }, [coinState, position, rotation, size, width, initialPosition, api]);

  useDrag(
    ({ movement, direction, down, memo, swipe }) => {
      if (swipe[0] !== 0) {
        const [x, y, z] = rotation.get();

        const updateZ = getClosestSideZ(z + swipe[0] * Math.PI);

        setChoice(getChoice(updateZ));

        api({
          rotation: [x, y, updateZ],
          config: {
            ...config.default,
            friction: 15,
          },
        });

        return;
      }

      let {
        initialRotateZ,
        currentAxis,
      }: {
        initialRotateZ?: number;
        initialRotateX?: number;
        currentAxis?: "x" | "y" | null;
      } = memo || {};
      if (!currentAxis) {
        currentAxis = getActiveAxis(direction);
      }

      const isChoice = currentAxis === "x";

      if (isChoice) {
        const [x, y, z] = rotation.get();

        const initialZ = initialRotateZ ?? z;

        let updatedZ = initialZ + movement[0] / aspect;

        if (!down) {
          updatedZ = getClosestSideZ(z);

          setChoice(getChoice(updatedZ));

          currentAxis = null;
        }

        api({
          rotation: [x, y, updatedZ],
          config: {
            ...config.default,
            friction: 10,
          },
        });

        return {
          initialRotateZ: initialZ,
          currentAxis,
        };
      }

      const isThrow = currentAxis === "y" && movement[1] < 0;

      if (isThrow) {
        const [, y, z] = rotation.get();

        const updatedX = INITIAL_ROTATION[0] + movement[1] / aspect;

        if (updatedX <= -Math.PI) {
          setCoinState(COIN_STATE.THROW);

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

          currentAxis = null;
        }
      }

      return {
        currentAxis,
      };
    },
    {
      target: window,
      enabled: coinState === COIN_STATE.CHOICE,
    }
  );

  useFrame(({ camera }) => {
    camera.lookAt(new Vector3(...position.get()));
  });

  return (
    <>
      <animated.mesh
        rotation={rotation}
        position={position}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[size / 2, size / 2, width, 50]} />

        {/* <meshNormalMaterial /> */}

        <meshStandardMaterial
          metalness={0.5}
          roughness={0.2}
          color="orange"
          attach="material-0"
        >
          {/* <color attach="background" args={["orange"]} />
          <RenderTexture attach="map">
          </RenderTexture> */}
        </meshStandardMaterial>

        <meshStandardMaterial
          // color="red"
          metalness={0.5}
          roughness={0.2}
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
            <Text rotation={[0, 0, -HALF_PI]}>Tail</Text>
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
            <Text rotation={[0, 0, -HALF_PI]}>Head</Text>
          </RenderTexture>
        </meshStandardMaterial>
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

      <Coin initialPosition={[0, 1, 0]} size={2} width={0.1} />

      <ContactShadows
        position={[0, 0, 0]}
        scale={20}
        blur={0.4}
        opacity={0.2}
      />
    </>
  );
};
