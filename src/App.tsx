import { Canvas } from "@react-three/fiber";
import { Environment, Stage } from "@react-three/drei";

import { AnimatedCoinScene } from "./AnimatedCoinScene";
import { useState } from "react";
import clsx from "clsx";

const App = () => {
  const [history, setHistory] = useState<
    { id: string; choice: boolean; outcome: boolean }[]
  >([
    {
      id: "1",
      choice: true,
      outcome: true,
    },
    {
      id: "2",
      choice: false,
      outcome: false,
    },
    {
      id: "3",
      choice: true,
      outcome: false,
    },
    {
      id: "4",
      choice: false,
      outcome: true,
    },
  ]);

  const choiceClassName = "size-8 shrink-0 rounded-full border";

  return (
    <main className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [0, 3, 5] }}
        className="touch-none select-none"
      >
        {/* <directionalLight position={[1, 10, 20]} /> */}
        <ambientLight intensity={5} />
        {/* <Environment preset="studio" /> */}

        <fog attach="fog" args={["#fff", 2, 50]} />

        <AnimatedCoinScene />
      </Canvas>

      <div className="absolute overflow-hidden w-full bottom-0 flex left-0 right-0 m-auto ">
        <ul className="gap-8 overflow-auto w-full pb-10 pl-5 flex pt-5 pr-[calc(50vw-16px)]">
          {history.map((item) => {
            return (
              <li
                className={clsx(choiceClassName, "border-black", {
                  // "bg-blue-500": item.choice,
                  // "bg-red-500": !item.choice,
                  "border-blue-400 bg-blue-500 shadow-blue-800 shadow-[2px_1px_0]":
                    item.choice,
                  "border-red-400 bg-red-500  shadow-red-800 shadow-[2px_1px_0]":
                    !item.choice,
                  "border-black shadow-black shadow-[2px_1px_0]":
                    item.choice === item.outcome,
                  "opacity-30": item.choice !== item.outcome,
                })}
              />
            );
          })}
          <li
            className={clsx(
              choiceClassName,
              "border-dashed  bg-white  border-gray-400"
            )}
          />
        </ul>
      </div>
    </main>
  );
};

export default App;
