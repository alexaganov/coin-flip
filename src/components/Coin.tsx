import clsx from "clsx";
import { radToDeg, TWO_PI } from "../utils/math";
import { styleTransform } from "../utils/css";
import { useLayoutEffect, useRef, useState } from "react";

const CircularText = ({
  text,
  radius,
  className,
}: {
  text: string;
  radius: number;
  className?: string;
}) => {
  const [textSize, setTextSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const size = radius * 2;

  const symbols = [...text];
  const symbolWidth = textSize ? textSize.width / symbols.length : 0;
  const angleStep = textSize ? symbolWidth / (radius - textSize.height) : 0; // (symbolWidth * 360) / (TWO_PI * radius);

  console.log({ angleStep, textWidth: textSize, symbolWidth });

  useLayoutEffect(() => {
    setTextSize({
      width: textRef.current!.getBoundingClientRect().width,
      height: textRef.current!.getBoundingClientRect().height,
    });
  }, []);

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className={clsx(
        "relative whitespace-pre flex items-center justify-center",
        className
      )}
    >
      <span ref={textRef} className="absolute invisible">
        {text}
      </span>

      {textSize &&
        symbols.map((symbol, i) => {
          const angle = angleStep * i;

          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          const rotateZ = radToDeg(angle) + 90;

          return (
            <span
              className="absolute"
              style={{
                transformOrigin: "center bottom",
                transform: styleTransform()
                  .translate3d({
                    x,
                    y,
                  })
                  .rotateZ(rotateZ)
                  .get(),
              }}
              key={`${symbol}-${i}`}
            >
              {symbol}
            </span>
          );
        })}
    </div>
  );
};

export const Coin = ({ radius, depth }: { radius: number; depth: number }) => {
  const frontZ = depth / 2;
  const backZ = -depth / 2;
  const size = radius * 2;

  const radialSegments = 50;

  return (
    <div
      className="font-mono text-2xl uppercase"
      style={{
        transformStyle: "preserve-3d",
        width: size,
        height: size,
        // transform: `translate3d(0, 0, ${z}px)`,
      }}
    >
      <div
        className="absolute  backdrop-blur-sm rounded-full w-full h-full border-4 border-current  bg-blue-500/20 text-blue-500 flex items-center justify-center"
        style={{
          transform: `translate3d(0, 0, ${frontZ}px)`,
        }}
      >
        <CircularText radius={radius} text="front side of the coin" />
      </div>

      <div
        className="absolute w-full h-full  backdrop-blur-sm  rounded-full border-4 border-current bg-red-500/20 text-red-500 flex items-center justify-center"
        style={{
          transform: `translate3d(0, 0, ${backZ}px) rotate3d(0, 1, 0, -180deg)`,
        }}
      >
        back
      </div>

      <div
        style={{
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full absolute flex items-center justify-center"
      >
        {Array.from({ length: radialSegments }, (_, i) => {
          const angleStep = TWO_PI / radialSegments;

          const angle = angleStep * i;
          const width = angleStep * radius;

          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <div
              style={{
                width,
                height: depth,
                transformOrigin: "center",
                transformStyle: "preserve-3d",
                transform: styleTransform()
                  .translate3d({
                    x,
                    y,
                  })
                  .rotateX(90)
                  .rotateY(radToDeg(angle) + 90)
                  .get(),
                // transforms.join(" "),
                // width:
              }}
              className="absolute border bg-white/10 backdrop-blur-sm border-black"
              key={i}
            />
          );
        })}
      </div>
    </div>
  );
};
