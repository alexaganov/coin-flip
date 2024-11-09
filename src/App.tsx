import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

import { AnimatedCoinScene } from "./AnimatedCoinScene";

const App = () => {
  return (
    <Canvas shadows camera={{ position: [0, 1, 5] }} className="touch-none">
      <Environment preset="studio" />

      <fog attach="fog" args={["#fff", 2, 50]} />

      <AnimatedCoinScene />
    </Canvas>
  );
};

export default App;
