import { Environment } from "@react-three/drei";
import { Coin } from "./Coin";

export const AnimatedCoinScene = () => {
  const coinSize = 2;
  const coinWidth = 0.1;

  return (
    <>
      <gridHelper
        receiveShadow={false}
        args={[70, 70, "#bbb", "#bbb"]}
        position={[0, -0.03, 0]}
      />

      {/* <Grid
        position={[0, -0.01, 0]}
        // args={[30, 30]}
        cellSize={0.5}
        sectionSize={1}
        sectionColor={0xaaaaaa}
        cellColor={0x777777}
        fadeDistance={10}
        fadeStrength={1}
        infiniteGrid
      /> */}

      {/* <color attach="background" args={["#ffffff"]} /> */}

      <fog attach="fog" args={[0xffffff, 2, 30]} />

      <ambientLight intensity={2} />

      {/* <directionalLight
        intensity={0.2}
        position={[0, 12, -6]}
        shadow-mapSize={[1024, 1024]}
      /> */}

      <directionalLight
        castShadow
        intensity={5}
        position={[3, 2, 10]}
        shadow-mapSize={[1024, 1024]}
      />

      <Coin
        groundPosition={[0, 0, 0]}
        initialPosition={[0, 2, 0]}
        size={coinSize}
        width={coinWidth}
      />

      <mesh
        receiveShadow
        // y is set to show outline of the coin when it's on the ground
        position={[0, -0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[100, 100]} />

        <meshStandardMaterial color="#fff" />
      </mesh>

      <Environment preset="city" />
      {/* <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 50]} />
        <meshToonMaterial color={0xffffff} />

        <Edges lineWidth={2} color="#000" />

        <Outlines thickness={5} color={0x000000} />
      </mesh> */}

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

export default AnimatedCoinScene;
