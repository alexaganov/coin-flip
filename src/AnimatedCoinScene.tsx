import { Environment, Stars } from "@react-three/drei";
import { Coin } from "./Coin";

export const AnimatedCoinScene = () => {
  const coinSize = 2;
  const coinWidth = 0.1;

  return (
    <>
      {/* <gridHelper
        receiveShadow={false}
        args={[20, 20, "#222", "#222"]}
        position={[0, -0.03, 0]}
      /> */}

      <ambientLight intensity={2} />

      <directionalLight castShadow intensity={0.1} position={[0, 5, -1.5]} />

      <directionalLight castShadow intensity={0.1} position={[0, -2, 10]} />

      <Coin
        groundPosition={[0, 0, 0]}
        initialPosition={[0, 2, 0]}
        size={coinSize}
        width={coinWidth}
      />

      <fog args={[0x000000, 1, 2]} />

      <mesh
        receiveShadow
        // y is set to show outline of the coin when it's on the ground
        position={[0, -0.05, 0]}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[1.5, 1.5, 0.1, 50]} />
        {/* <sphereGeometry args={[5, 50]} /> */}

        <meshStandardMaterial metalness={0} roughness={0.5} color="#000" />
      </mesh>

      <Stars
        radius={100}
        depth={40}
        count={1000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <Environment preset="dawn" />
    </>
  );
};

export default AnimatedCoinScene;
