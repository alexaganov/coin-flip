import { Canvas, ThreeElements, useFrame, useThree } from "@react-three/fiber";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { CameraControls, useHelper } from '@react-three/drei';
import {
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  Object3D,
  Vector3,
} from "three";
import { useSpring, Globals, a, config, easings } from "@react-spring/three";
import { useDrag, useGesture } from "@use-gesture/react";
import {
  Edges,
  Environment,
  Instance,
  Instances,
  MeshPortalMaterial,
  OrbitControls,
  useGLTF,
  useHelper,
  useAnimations,
} from "@react-three/drei";
// import { OrbitControls } from '@react-three/drei';
// import { Globals } from "@react-spring/shared";

Globals.assign({
  frameLoop: "always",
});

const getRandomBoolean = async () => {
  await delay(1500);

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

const INITIAL_POSITION = [0, 0.5, 0];
const INITIAL_ROTATION = [-HALF_PI, 0, 0];

const delay = (timeout: number) => {
  return new Promise((res) => {
    setTimeout(res, timeout);
  });
};

const Coin = () => {
  const [coinState, setCoinState] = useState<
    (typeof COIN_STATE)[keyof typeof COIN_STATE]
  >(COIN_STATE.CHOICE);

  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  const positionYRef = useRef(0);
  const rotationZRef = useRef(INITIAL_ROTATION[2]);
  const rotationXRef = useRef(INITIAL_ROTATION[0]);

  const [coinThrowSpring, throwSpringApi] = useSpring(() => ({
    position: [...INITIAL_POSITION],
    rotation: [...INITIAL_ROTATION],
    config: {
      bounce: 0,
    },
  }));

  const [choiceSpring, choiceSpringApi] = useSpring(() => ({
    position: [...INITIAL_POSITION],
    rotation: [...INITIAL_ROTATION],
    config: {
      friction: 10,
    },
  }));
  const axis = useRef<"x" | "y" | null>(null);

  const handleThrowState = useCallback(() => {
    const TWO_FULL_ROTATION = -TWO_PI * 2;

    // getRandomBoolean().then(setCoinSide);
    // start request to get random 1 or 0

    throwSpringApi({
      from: {
        position: [0, positionYRef.current, 0],
        rotation: [rotationXRef.current, 0, rotationZRef.current],
      },
      to: async (next) => {
        await Promise.allSettled([
          next({
            position: [0, 10, 0],
            // config: {
            //   // easing: easings.easeOutSine,
            //   damping: 2,
            //   mass: 5,
            //   friction: 120,
            //   tension: 120,
            // },
            rotation: [
              rotationXRef.current + TWO_FULL_ROTATION * 3,
              0,
              rotationZRef.current,
            ],
          }),
        ]);

        await next({
          position: [0, -1, 0],
          rotation: [
            rotationXRef.current + TWO_FULL_ROTATION * 3,
            0,
            rotationZRef.current,
          ],
        });
      },
      config: {
        duration: 2000,
        easing: easings.easeInOutSine,
      },
      onResolve: () => {
        setCoinState(COIN_STATE.END);

        choiceSpringApi.set({
          position: [0, -1, 0],
          rotation: [0, 0, 0],
        });
      },

      // onResolve(result, ctrl, item) {
      //   if (!result.finished) {
      //     return;
      //   }
      //   throwSpringApi({
      //     from: {
      //       position: [0, 10, 0],
      //       rotation: [
      //         rotationXRef.current + TWO_FULL_ROTATION * 3,
      //         0,
      //         rotationZRef.current,
      //       ],
      //     },
      //     to: {
      //       position: [0, -1, 0],
      //       rotation: [
      //         rotationXRef.current + TWO_FULL_ROTATION * 6,
      //         0,
      //         rotationZRef.current,
      //       ],
      //     },
      //     config: {
      //       easing: easings.easeOutSine,
      //       duration: 2000,
      //     },
      //     onResolve() {
      //     }
      //   });
      // },
    });
  }, [throwSpringApi, choiceSpringApi]);

  const handleEndState = useCallback(() => {
    choiceSpringApi({
      position: [...INITIAL_POSITION],
      rotation: [...INITIAL_ROTATION],
      config: {
        duration: 500,
      },
      onResolve() {
        setCoinState(COIN_STATE.CHOICE);
      },
    });

    throwSpringApi.set({
      position: [...INITIAL_POSITION],
      rotation: [...INITIAL_ROTATION],
    });

    rotationZRef.current = [...INITIAL_ROTATION][2];
    rotationXRef.current = [...INITIAL_ROTATION][0];
    positionYRef.current = [...INITIAL_POSITION][1];
  }, [choiceSpringApi, throwSpringApi]);

  useEffect(() => {
    if (coinState !== COIN_STATE.END) {
      return;
    }

    window.addEventListener("click", handleEndState);

    return () => {
      window.removeEventListener("click", handleEndState);
    };
  }, [coinState, handleEndState]);

  useEffect(() => {
    if (coinState !== COIN_STATE.THROW) {
      return;
    }

    handleThrowState();
  }, [handleThrowState, coinState]);

  useDrag(
    ({
      last,
      movement,
      offset: [oy, ox],
      velocity,
      direction: [dx, dy],
      down,
      previous,
      initial,
      memo = {},
    }) => {
      if (!axis.current) {
        if (Math.abs(dx) > Math.abs(dy)) {
          axis.current = "x";
        } else if (Math.abs(dy) > Math.abs(dx)) {
          axis.current = "y";
        }
      }

      if (axis.current === "x") {
        let newRotationZ = rotationZRef.current;

        newRotationZ = rotationZRef.current + movement[0] / aspect;

        if (!down) {
          newRotationZ = Math.round(newRotationZ / Math.PI) * Math.PI;

          rotationZRef.current = newRotationZ;
        }

        choiceSpringApi({
          rotation: [rotationXRef.current, 0, newRotationZ],
          config: {
            ...config.default,
            friction: 10,
          },
        });
      }

      if (axis.current === "y" && movement[1] < 0) {
        let newRotationX = rotationXRef.current;

        newRotationX += movement[1] / aspect;

        console.log({ newRotationX });

        if (newRotationX <= -Math.PI) {
          rotationXRef.current = -Math.PI;

          setCoinState(COIN_STATE.THROW);
        } else {
          console.log(velocity);

          if (down) {
            positionYRef.current =
              INITIAL_POSITION[1] + (movement[1] * -1) / aspect / 2;

            // positionSpringApi({
            //   position: [0, positionY, 0],
            // });

            choiceSpringApi({
              position: [0, positionYRef.current, 0],
              rotation: [newRotationX, 0, rotationZRef.current],
              config: {
                bounce: 0,
              },
            });
          } else {
            positionYRef.current = INITIAL_POSITION[1];

            choiceSpringApi({
              position: [0, positionYRef.current, 0],
              rotation: [rotationXRef.current, 0, rotationZRef.current],
              config: {
                bounce: 0,
              },
            });
          }
        }
      }

      if (!down) {
        axis.current = null;
      }
    },
    {
      target: window,
      enabled: coinState === COIN_STATE.CHOICE,
    }
  );

  const activeSpring =
    coinState === COIN_STATE.THROW ? coinThrowSpring : choiceSpring;

  useFrame(({ camera }) => {
    camera.lookAt(new Vector3(...activeSpring.position.get()));
  });

  return (
    <>
      <a.mesh
        position={activeSpring.position}
        rotation={activeSpring.rotation}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[1, 1, 0.1, 50]} />
        <meshNormalMaterial />
      </a.mesh>
    </>
  );
};

const Grid = ({ number = 23, lineWidth = 0.026, height = 0.5 }) => (
  // Renders a grid and crosses as instances
  <Instances receiveShadow position={[0, -1.02, 0]}>
    <planeGeometry args={[lineWidth, height]} />
    <meshBasicMaterial color="#999" />
    {Array.from({ length: number }, (_, y) =>
      Array.from({ length: number }, (_, x) => (
        <group
          key={x + ":" + y}
          position={[
            x * 2 - Math.floor(number / 2) * 2,
            -0.01,
            y * 2 - Math.floor(number / 2) * 2,
          ]}
        >
          <Instance rotation={[-Math.PI / 2, 0, 0]} />
          <Instance rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
        </group>
      ))
    )}
    <gridHelper args={[100, 100, "#bbb", "#bbb"]} position={[0, -0.01, 0]} />
  </Instances>
);

function App() {
  return (
    <Canvas
      className="touch-none bg-black"
      shadows
      // frameloop='demand'
      camera={{ position: [0, 1, 5] }}
    >
      <Grid />

      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.04, 0]}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <fogExp2 attach="fog" color="black" density={0.1} />

      <Coin />
    </Canvas>
  );
}

export default App;
