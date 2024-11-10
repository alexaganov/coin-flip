import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import BezierEasing from "bezier-easing";
import Three, { Mesh, Vector3 } from "three";
import { useSpring, animated, config, easings } from "@react-spring/three";
import { FullGestureState, useDrag } from "@use-gesture/react";
import {
  RenderTexture,
  Text,
  PerspectiveCamera,
  ContactShadows,
  Outlines,
  Plane,
  Edges,
  MeshDiscardMaterial,
  PositionalAudio,
  MeshReflectorMaterial,
  Environment,
} from "@react-three/drei";
import {
  DepthOfField,
  DotScreen,
  EffectComposer,
  Glitch,
  GodRays,
  Grid,
  Outline,
} from "@react-three/postprocessing";
import { BlendFunction, GlitchMode, KernelSize } from "postprocessing";
import { useAppStore } from "./store";
import { APP_STATE } from "./type";

const getRandomBooleanApi = async () => {
  // await delay(1500);

  try {
    const response = await fetch(
      "https://www.random.org/integers/?num=1&min=0&max=1&col=1&base=10&format=plain&rnd=new"
    );

    if (!response.ok) {
      throw Error(`Request rejected with status ${response.status}`);
    }

    const result = await response.text();

    return parseInt(result) === 1;
  } catch (error) {
    return Math.random() < 0.5;
  }
};

const getRandomBoolean = () => {
  return Math.random() < 0.5;
};

const HALF_PI = Math.PI / 2;
const TWO_PI = Math.PI * 2;

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
  const appState = useAppStore((state) => state.appState);
  const setAppState = useAppStore((state) => state.setAppState);
  const restart = useAppStore((state) => state.restart);

  const choice = useAppStore((state) => state.currentChoice);
  const setChoice = useAppStore((state) => state.setChoice);
  const setCurrentOutcome = useAppStore((state) => state.setCurrentOutcome);

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
          restart();
        },
      });
    };

    window.addEventListener("click", handlePointerUp, {
      once: true,
    });

    return () => {
      window.removeEventListener("click", handlePointerUp);
    };
  }, [appState, api, restart, initialPosition, setAppState, choice, rotation]);

  useEffect(() => {
    if (appState !== APP_STATE.THROW) {
      return;
    }

    if (!coinFlipAudioRef.current?.isPlaying) {
      coinFlipAudioRef.current!.offset = 0;
      coinFlipAudioRef.current?.play();
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
        duration: 150,
        easing: easings.linear,
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

        // await delay(50);

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
        const isChoiceHead = choice === CHOICE.HEAD;

        const isHead =
          Math.abs((rotateXTillFace / Math.PI) % 2) === Number(isChoiceHead);

        const randomBoolean = getRandomBoolean();

        if (isHead !== randomBoolean) {
          // rotate till random side
          rotateXTillFace -= Math.PI;
        }

        if (!coinFallAudioRef.current?.isPlaying) {
          coinFlipAudioRef.current?.stop();
          coinFallAudioRef.current!.play();
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
            setCurrentOutcome(randomBoolean ? CHOICE.HEAD : CHOICE.TAIL);
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
    setAppState,
    setCurrentOutcome,
    groundPosition,
    initialPosition,
    choice,
    api,
  ]);

  const choiceConfig = {
    tension: 200,
    friction: 15,
    mass: 1,
    // becaus config is merging every time,
    // bounce can be 0 which removes wobble effect
    bounce: undefined,
  } as const;

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
      config: {
        ...choiceConfig,
        tension: down ? 300 : choiceConfig.tension,
        friction: down ? 20 : choiceConfig.friction,
      },
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
  const coinFlipAudioRef = useRef<Three.PositionalAudio>(null);
  const coinFallAudioRef = useRef<Three.PositionalAudio>(null);

  // const headColor = 0xd600ff;
  // const tailColor = 0x00ff9f;
  // const edgeColor = 0x001eff;

  const headColor = 0x3d82f6;
  const tailColor = 0xef4444;
  const edgeColor = 0x00ffff;

  return (
    <>
      <animated.mesh
        renderOrder={1}
        ref={meshRef}
        rotation={rotation}
        position={position}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[size / 2, size / 2, width, 50]} />

        {/* <meshBasicMaterial color="red" /> */}
        {/* <meshNormalMaterial /> */}

        <meshBasicMaterial
          color={edgeColor}
          depthTest={false}
          attach="material-0"
          // color={choice === CHOICE.HEAD ? "blue" : "red"}
        />

        <meshBasicMaterial
          color={tailColor}
          attach="material-1"
          depthTest={false}
        />

        <meshBasicMaterial
          color={headColor}
          attach="material-2"
          depthTest={false}
        />

        {/* TODO: use drei decal */}
        {/* <meshStandardMaterial
          // metalness={0.5}
          // roughness={0.2}
          attach="material-1"
          attach="material-2"
          depthTest={false}
        >
          <RenderTexture attach="map">
            <PerspectiveCamera
              makeDefault
              manual
              aspect={1 / 1}
              position={[0, 0, 10]}
            />
            <color attach="background" args={[headColor]} />
            <Text
              lineHeight={0}
              // color=
              fontSize={2}
              rotation={[0, 0, -HALF_PI]}
            >
              ⬤
            </Text>
          </RenderTexture>
        </meshStandardMaterial> */}

        <Outlines screenspace thickness={0.03} color={0x000000} />
        <PositionalAudio
          loop={false}
          hasPlaybackControl
          onEnded={() => {
            if (appState === APP_STATE.THROW) {
              coinFlipAudioRef.current?.stop();
              coinFlipAudioRef.current!.offset = 0.6;
              coinFlipAudioRef.current?.play();
            }
          }}
          ref={coinFlipAudioRef}
          url="/coin-flip.wav"
          distance={3}
        />
        <PositionalAudio
          loop={false}
          hasPlaybackControl
          offset={0.6}
          duration={0.5}
          ref={coinFallAudioRef}
          url="/coin-fall.mp3"
          distance={3}
        />
      </animated.mesh>
    </>
  );
};

export const AnimatedCoinScene = () => {
  return (
    <>
      <gridHelper
        receiveShadow={false}
        args={[100, 200, "#bbb", "#bbb"]}
        position={[0, -0.029, 0]}
      />

      <color attach="background" args={["#ffffff"]} />

      <fog attach="fog" args={["#fff", 2, 50]} />

      <ambientLight intensity={2} />

      <directionalLight
        castShadow
        intensity={5}
        position={[0, 6, 6]}
        shadow-mapSize={[1024, 1024]}
      />

      <Coin
        groundPosition={[0, 0.3, 0]}
        initialPosition={[0, 2, 0]}
        size={2}
        width={0.1}
      />

      <mesh
        receiveShadow
        position={[0, -0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[100, 100]} />

        <meshStandardMaterial color="#fff" />
      </mesh>

      {/* <Environment preset="city" /> */}
      {/* <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 50]} />
        <meshToonMaterial color={0xffffff} />

        <Edges lineWidth={2} color="#000" />

        <Outlines thickness={5} color={0x000000} />
      </mesh> */}

      {/* <ContactShadows
        position={[0, 0, 0]}
        scale={10}
        blur={0.4}
        opacity={0.1}
      /> */}

      {/* <EffectComposer>
        <DotScreen
          blendFunction={BlendFunction.SCREEN} // blend mode
          angle={Math.PI * 0.06} // angle of the dot pattern
          scale={0.9} // scale of the dot pattern
        />
      </EffectComposer> */}
    </>
  );
};
