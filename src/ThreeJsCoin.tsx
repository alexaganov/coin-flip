import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import BezierEasing from "bezier-easing";
import * as THREE from "three";
import {
  useSpring,
  animated,
  config,
  easings,
  SpringConfig,
} from "@react-spring/three";
import { FullGestureState, useDrag } from "@use-gesture/react";
import {
  RenderTexture,
  PerspectiveCamera,
  Outlines,
  PositionalAudio,
} from "@react-three/drei";

import { useAppStore } from "./store";
import { APP_STATE, COIN_FACE, CoinFace } from "./type";
import { degToRad, lerp, radToDeg } from "three/src/math/MathUtils.js";
import { roundToDecimals } from "./utils/number";

// const getRandomBooleanApi = async () => {
//   // await delay(1500);

//   try {
//     const response = await fetch(
//       "https://www.random.org/integers/?num=1&min=0&max=1&col=1&base=10&format=plain&rnd=new"
//     );

//     if (!response.ok) {
//       throw Error(`Request rejected with status ${response.status}`);
//     }

//     const result = await response.text();

//     return parseInt(result) === 1;
//   } catch (error) {
//     return Math.random() < 0.5;
//   }
// };

const getRandomBoolean = () => {
  return Math.random() < 0.5;
};

const getRandomChoice = () => {
  return getRandomBoolean() ? COIN_FACE.HEAD : COIN_FACE.TAIL;
};

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

const roundRotationToClosestFace = (rotation: number) => {
  return Math.round(rotation / NEXT_SIDE_ROTATION) * NEXT_SIDE_ROTATION;
};

interface CoinProps {
  size: number;
  width: number;
  groundPosition: [number, number, number];
  initialPosition: [number, number, number];
}

const QUARTER_ROTATION = 90;
const NEXT_SIDE_ROTATION = QUARTER_ROTATION * 2;
const FULL_ROTATION = NEXT_SIDE_ROTATION * 2;

const HEAD_INITIAL_ROTATION: [number, number, number] = [
  -QUARTER_ROTATION,
  0,
  0,
];
const TAIL_INITIAL_ROTATION: [number, number, number] = [
  -QUARTER_ROTATION,
  0,
  NEXT_SIDE_ROTATION,
];

const getChoiceByZRotation = (z: number) => {
  return z % FULL_ROTATION === 0 ? COIN_FACE.HEAD : COIN_FACE.TAIL;
};

const screenToWordPosition = ({
  position: [x, y],
  canvasWidth,
  canvasHeight,
  camera,
}: {
  position: [x: number, y: number];
  canvasWidth: number;
  canvasHeight: number;
  camera: THREE.Camera;
}) => {
  const vector = new THREE.Vector3(
    (x / canvasWidth) * 2 - 1,
    -(y / canvasHeight) * 2 + 1,
    0
  );

  vector.unproject(camera);

  vector.sub(camera.position).normalize();

  const cameraDistance = -camera.position.z / vector.z;

  return camera.position.clone().add(vector.multiplyScalar(cameraDistance));
};

const INITIAL_CAMERA_POSITION = [0, 3.7, 5];
const CAMERA_POSITION_FROM_TOP = [0, 5, 0];

export const Coin = ({
  size,
  width,
  groundPosition,
  initialPosition,
}: CoinProps) => {
  const appState = useAppStore((state) => state.appState);
  const setAppState = useAppStore((state) => state.setAppState);
  const restart = useAppStore((state) => state.restart);
  const isAudioMuted = useAppStore((state) => state.isAudioMuted);

  // const choice = useAppStore((state) => state.currentChoice);
  const currentOutcome = useAppStore((state) => state.currentOutcome);
  const setChoice = useAppStore((state) => state.setChoice);
  const setCurrentOutcome = useAppStore((state) => state.setCurrentOutcome);

  const [initialRotation, setInitialRotation] = useState(HEAD_INITIAL_ROTATION);

  const { size: canvasSize, viewport, camera, gl } = useThree();
  const aspect = canvasSize.width / viewport.width;

  const [isCameraLookingFromTop, setIsCameraLookingFromTop] = useState(false);

  const [{ rotation, position }, api] = useSpring(
    () => ({
      position: [...initialPosition],
      rotation: [...initialRotation],
    }),
    []
  );

  const lookAtVector = new THREE.Vector3(...position.get());

  useEffect(() => {
    if (!isAudioMuted) {
      return;
    }

    if (coinFallAudioRef.current?.isPlaying) {
      coinFallAudioRef.current.stop();
    }

    if (coinFlipAudioRef.current?.isPlaying) {
      coinFlipAudioRef.current.stop();
    }
  }, [isAudioMuted]);

  const playAudioEffect = useCallback((name: "throw" | "in-air" | "fall") => {
    const effects = {
      throw: {
        play: () => {
          if (!coinFlipAudioRef.current) {
            return;
          }

          coinFlipAudioRef.current.offset = 0;
          coinFlipAudioRef.current.play();
        },
      },
      "in-air": {
        audio: coinFlipAudioRef,
        play: () => {
          if (!coinFlipAudioRef.current) {
            return;
          }

          coinFlipAudioRef.current.stop();
          coinFlipAudioRef.current.offset = 0.6;
          coinFlipAudioRef.current.play();
        },
      },
      fall: {
        play: () => {
          coinFlipAudioRef.current?.stop();

          if (!coinFallAudioRef.current) {
            return;
          }

          coinFallAudioRef.current.stop();
          coinFallAudioRef.current.play();
        },
      },
    };

    const isAudioMuted = useAppStore.getState().isAudioMuted;

    if (isAudioMuted) {
      return;
    }

    const effect = effects[name];

    if (!effect) {
      return;
    }

    effect.play();
  }, []);

  const playCoinFallSoundEffect = () => {
    playAudioEffect("fall");
  };

  const playCoinInAirSoundEffect = () => {
    playAudioEffect("in-air");
  };

  const playCoinThrowSoundEffect = () => {
    playAudioEffect("throw");
  };

  const reset = useCallback(() => {
    restart();

    const newInitialRotation: [number, number, number] =
      currentOutcome === COIN_FACE.HEAD
        ? [...HEAD_INITIAL_ROTATION]
        : [...TAIL_INITIAL_ROTATION];

    setInitialRotation(newInitialRotation);

    api.set({
      rotation: newInitialRotation,
    });
  }, [api, currentOutcome, restart]);

  const applyOutcomeState = useCallback(
    (outcome: CoinFace) => {
      setCurrentOutcome(outcome);
      setAppState(APP_STATE.OUTCOME);
    },
    [setAppState, setCurrentOutcome]
  );

  useEffect(() => {
    if (appState !== APP_STATE.OUTCOME) {
      return;
    }

    const handlePointerUp = () => {
      const currentRotation = rotation.get();

      setIsCameraLookingFromTop(false);

      api.start({
        to: {
          position: [...initialPosition],
          rotation: [
            currentRotation[0] + QUARTER_ROTATION,
            currentRotation[1],
            currentRotation[2],
          ],
        },
        config: config.gentle,
        onResolve: reset,
      });
    };

    window.addEventListener("click", handlePointerUp, {
      once: true,
    });

    return () => {
      window.removeEventListener("click", handlePointerUp);
    };
  }, [appState, reset, api, initialPosition, rotation]);

  useEffect(() => {
    if (appState !== APP_STATE.THROW) {
      return;
    }

    playCoinThrowSoundEffect();

    const currentRotation = rotation.get();

    // simulate coin rotation
    api.start({
      from: {
        rotation: [
          currentRotation[0],
          currentRotation[1],
          roundRotationToClosestFace(currentRotation[2]),
        ],
      },
      to: {
        rotation: [
          currentRotation[0] - FULL_ROTATION * 2,
          currentRotation[1],
          roundRotationToClosestFace(currentRotation[2]),
        ],
      },
      loop: true,
      config: {
        duration: 300,
        easing: easings.linear,
        bounce: 0,
      },
    });

    const currentPosition = position.get();

    api.start({
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
            // the point where coin hits the ground
            groundPosition[1] + size / 2,
            groundPosition[2],
          ],
          config: {
            easing: BezierEasing(0.93, 0.06, 0.84, 0.495),
            duration: 750,
          },
        });

        const currentRotation = rotation.get();

        // Rotate the coin on the x-axis until the face is facing upwards.
        // Using roundRotationToClosestFace alone is insufficient since the rotation
        // must follow the current rotational direction of the coin.
        let rotateXTillFace = roundRotationToClosestFace(
          currentRotation[0] -
            (NEXT_SIDE_ROTATION + (currentRotation[0] % NEXT_SIDE_ROTATION))
        );

        // rotateXTillFace % 2 will be 0
        // if we choose head but it's tail
        // if we choose tail buts it's head
        const isOppositeXFace = rotateXTillFace % FULL_ROTATION === 0;

        const isRotateZTail =
          roundRotationToClosestFace(currentRotation[2]) % FULL_ROTATION !== 0;

        const isCurrentTail =
          (!isOppositeXFace && isRotateZTail) ||
          (isOppositeXFace && !isRotateZTail);

        const newOutcome = getRandomChoice();

        if (
          (newOutcome === COIN_FACE.TAIL && !isCurrentTail) ||
          (newOutcome === COIN_FACE.HEAD && isCurrentTail)
        ) {
          rotateXTillFace -= NEXT_SIDE_ROTATION;
        } else {
          // To make additional rotation to prevent coin falling flat without animations
          rotateXTillFace -= FULL_ROTATION;
        }

        let rotateZ = roundRotationToClosestFace(currentRotation[2]);

        // If the label on the coin is upside down,
        // rotate the coin to make the label upright.
        if (rotateXTillFace % FULL_ROTATION === 0) {
          rotateZ += NEXT_SIDE_ROTATION;
          rotateXTillFace -= NEXT_SIDE_ROTATION;

          console.log({ rotateXTillFace });

          api.set({
            rotation: [rotateXTillFace, currentPosition[1], rotateZ],
          });

          rotateXTillFace -= FULL_ROTATION;
        }

        playCoinFallSoundEffect();

        setIsCameraLookingFromTop(true);

        await next({
          position: [
            groundPosition[0],
            groundPosition[1] + width / 2,
            groundPosition[2],
          ],
          rotation: [rotateXTillFace, currentRotation[1], rotateZ],
          config: {
            easing: easings.easeInOutBounce,
            duration: 300,
          },
          onResolve: () => {
            applyOutcomeState(newOutcome);
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
    applyOutcomeState,
    groundPosition,
    api,
  ]);

  const defaultConfig = {
    tension: 200,
    friction: 16,
    mass: 1,
    // becaus config is merging every time,
    // bounce can be 0 which removes wobble effect
    bounce: undefined,
  } as const;

  const handleSwipe = ({ swipe }: FullGestureState<"drag">) => {
    if (swipe[0] !== 0) {
      const [x, y, z] = rotation.get();

      const updatedZ = roundRotationToClosestFace(
        z + swipe[0] * NEXT_SIDE_ROTATION
      );

      setChoice(getChoiceByZRotation(updatedZ));

      api.start({
        rotation: [x, y, updatedZ],
        config: {
          ...defaultConfig,
          tension: 300,
        },
      });
    } else if (swipe[1] !== 0) {
      setAppState(APP_STATE.THROW);
    }
  };

  const rotateCoinByZToNextFace = ({
    direction = 0,
    config,
  }: {
    direction?: 1 | -1 | 0;
    config?: SpringConfig;
  } = {}) => {
    const [, , z] = rotation.get();

    const updatedZ = roundRotationToClosestFace(
      z + direction * NEXT_SIDE_ROTATION
    );

    setChoice(getChoiceByZRotation(updatedZ));

    return api.start({
      rotation: [initialRotation[0], initialRotation[1], updatedZ],
      config: {
        ...defaultConfig,
        ...config,
      },
      // onChange(result) {
      //   const progress = (result.value.rotation[2] - z) / (updatedZ - z);

      //   if (progress >= 0.5 && !effectPlayed) {
      //     effectPlayed = true;
      //     coinWhooshSoundRef.current?.play();
      //   }
      // },
    });
  };

  // TODO: update calculations
  const handleTap = (state: FullGestureState<"drag">) => {
    const wordPosition = screenToWordPosition({
      camera,
      position: state.xy,
      canvasHeight: canvasSize.height,
      canvasWidth: canvasSize.width,
    });

    const halfCoinSize = size / 2;

    if (
      wordPosition.x === 0 ||
      Math.abs(wordPosition.x) > halfCoinSize ||
      wordPosition.y > initialPosition[1] + halfCoinSize ||
      wordPosition.y < initialPosition[1] - halfCoinSize
    ) {
      return;
    }

    const angle = radToDeg(
      Math.atan2(initialPosition[1] - wordPosition.y, wordPosition.x)
    );

    if (angle >= 60 && angle <= 120) {
      setAppState(APP_STATE.THROW);

      return;
    }

    rotateCoinByZToNextFace({
      direction: wordPosition.x > 0 ? 1 : -1,
      config: {
        friction: 12,
      },
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

    let updatedZ = rotateZStart + (movement[0] / aspect) * QUARTER_ROTATION;

    if (!down) {
      updatedZ = roundRotationToClosestFace(updatedZ);

      setChoice(getChoiceByZRotation(updatedZ));
    }

    api.start({
      rotation: [x, y, updatedZ],
      config: {
        ...defaultConfig,
        tension: down ? 300 : defaultConfig.tension,
        friction: down ? 20 : defaultConfig.friction,
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

    const updatedXRotation =
      initialRotation[0] + (movement[1] / aspect) * QUARTER_ROTATION;

    const xRotationToThrow = Math.abs(initialRotation[0]) + QUARTER_ROTATION;
    const updatedZRotation = roundRotationToClosestFace(z);

    if (Math.abs(updatedXRotation) >= xRotationToThrow) {
      setAppState(APP_STATE.THROW);

      api.set({
        // round z because during throw it can be still animated
        rotation: [updatedXRotation, y, updatedZRotation],
      });
      // after toggling useDrag's enabled prop from false to true,
      // the down param is still in true causing unintentional interaction
      // to prevent this we should cancel before setting enabled to false
      cancel();

      return;
    }

    if (down) {
      const rotationProgress =
        (Math.abs(updatedXRotation) - Math.abs(initialRotation[0])) /
        QUARTER_ROTATION;

      const updatePositionY =
        initialPosition[1] +
        rotationProgress * (INITIAL_CAMERA_POSITION[1] - initialPosition[1]);

      api.start({
        position: [initialPosition[0], updatePositionY, initialPosition[2]],
        rotation: [updatedXRotation, y, updatedZRotation],
      });
    } else {
      api.start({
        position: [...initialPosition],
        rotation: [initialRotation[0], y, updatedZRotation],
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

      if (state.tap) {
        return handleTap(state);
      }

      if (state.swipe[0] !== 0 || state.swipe[1] !== 0) {
        return handleSwipe(state);
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
      target: gl.domElement,
    }
  );

  useFrame(({ camera }) => {
    camera.lookAt(
      lookAtVector.set(...(position.get() as [number, number, number]))
    );

    const cameraPosition = isCameraLookingFromTop
      ? CAMERA_POSITION_FROM_TOP
      : INITIAL_CAMERA_POSITION;

    camera.position.set(
      roundToDecimals(lerp(camera.position.x, cameraPosition[0], 0.06), 3),
      roundToDecimals(lerp(camera.position.y, cameraPosition[1], 0.06), 3),
      roundToDecimals(lerp(camera.position.z, cameraPosition[2], 0.06), 3)
    );
  });

  const meshRef = useRef<THREE.Mesh>(null);
  const coinFlipAudioRef = useRef<THREE.PositionalAudio>(null);
  const coinFallAudioRef = useRef<THREE.PositionalAudio>(null);

  const headColor = 0x3d82f6;
  const tailColor = 0xef4444;
  const edgeColor = 0x00ffff;
  const signColor = 0xffffff;

  return (
    <animated.mesh
      renderOrder={1}
      ref={meshRef}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      rotation={rotation.to((x, y, z) => [
        degToRad(x),
        degToRad(y),
        degToRad(z),
      ])}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      position={position}
      receiveShadow
      castShadow
    >
      <cylinderGeometry args={[size / 2, size / 2, width, 50]} />

      <meshStandardMaterial
        color={edgeColor}
        metalness={1}
        roughness={0.5}
        depthTest={false}
        attach="material-0"
      />

      {/* <meshBasicMaterial
        color={tailColor}
        attach="material-1"
        depthTest={false}
      />

      <meshBasicMaterial
        color={headColor}
        attach="material-2"
        depthTest={false}
      /> */}
      {/* <MeshRefractionMaterial envMap={texture} {...config} toneMapped={false} /> */}
      {/* <MeshTransmissionMaterial resolution={1024} distortion={0.25} color="#FF8F20" thickness={1} anisotropy={1} /> */}
      <meshStandardMaterial
        depthTest={false}
        metalness={1}
        roughness={0.5}
        attach="material-1"
      >
        <RenderTexture attach="map">
          <PerspectiveCamera
            makeDefault
            manual
            aspect={1 / 1}
            position={[0, 0, 10]}
          />
          <color attach="background" args={[tailColor]} />

          <mesh>
            <planeGeometry args={[0.3, 2]} />

            <meshBasicMaterial color={signColor} />
          </mesh>
          {/* <Text
            lineHeight={0}
            fontSize={4}
            rotation={[0, 0, -HALF_PI]}
          >
            Tail
          </Text> */}
        </RenderTexture>
      </meshStandardMaterial>

      <meshStandardMaterial
        depthTest={false}
        metalness={1}
        roughness={0.3}
        attach="material-2"
      >
        <RenderTexture attach="map">
          <PerspectiveCamera
            makeDefault
            manual
            aspect={1 / 1}
            position={[0, 0, 10]}
          />

          <color attach="background" args={[headColor]} />

          <mesh>
            <planeGeometry args={[0.3, 2]} />

            <meshBasicMaterial color={signColor} />
          </mesh>

          <mesh rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.3, 2]} />

            <meshBasicMaterial color={signColor} />
          </mesh>

          {/* <Text lineHeight={0} fontSize={4} rotation={[0, 0, -HALF_PI]}>
            Head
          </Text> */}
        </RenderTexture>
      </meshStandardMaterial>

      <Outlines screenspace thickness={0.02} color={0x000000} />

      <PositionalAudio
        loop={false}
        hasPlaybackControl
        isPlaying={false}
        onEnded={playCoinInAirSoundEffect}
        ref={coinFlipAudioRef}
        url="/coin-flip.wav"
        distance={3}
      />

      <PositionalAudio
        hasPlaybackControl
        isPlaying={false}
        loop={false}
        offset={0.6}
        duration={0.3}
        ref={coinFallAudioRef}
        url="/coin-fall.mp3"
        distance={1.5}
      />
    </animated.mesh>
  );
};

useLoader.preload(THREE.AudioLoader, ["/coin-fall.mp3", "/coin-flip.wav"]);
