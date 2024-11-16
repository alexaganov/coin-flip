import clsx from "clsx";
import { CircularText } from "./CircularText";
import CircularSurface from "./CircularSurface";

export const Coin = ({
  radius,
  depth,
  className,
}: {
  radius: number;
  depth: number;
  className?: string;
}) => {
  const frontZ = depth / 2;
  const backZ = -depth / 2;
  const size = radius * 2;

  const partClassName = "backdrop-blur-lg bg-white/50";

  return (
    <div
      className={clsx("font-mono text-2xl", className)}
      style={{
        transformStyle: "preserve-3d",
        width: size,
        height: size,
      }}
    >
      <div
        className={clsx(
          "absolute text-blue-500 rounded-full w-full h-full border-4 border-current  flex items-center justify-center",
          partClassName
        )}
        style={{
          transform: `translate3d(0, 0, ${frontZ}px)`,
        }}
      >
        <div className="absolute">Head</div>
        <CircularText
          className="animate-[spin_60s_linear_infinite]"
          radius={radius}
          text="HEAD  *  "
        />
      </div>

      <div
        className={clsx(
          "absolute w-full h-full text-red-500 backdrop-blur-lg rounded-full border-4 border-current flex items-center justify-center",
          partClassName
        )}
        style={{
          transform: `translate3d(0, 0, ${backZ}px) rotate3d(0, 1, 0, -180deg)`,
        }}
      >
        <div className="absolute">Tail</div>
        <CircularText
          className="animate-[spin_60s_linear_infinite]"
          radius={radius}
          text="TAIL  *  "
        />
      </div>

      <CircularSurface
        radius={radius}
        depth={depth}
        segmentClassName={clsx(
          "border-y-[3px] border-b-blue-500 border-t-red-500 py-0.5",
          partClassName
        )}
        totalSegments={40}
        render={() => {
          return <div className="h-full w-0.5 bg-current" />;
        }}
      />
    </div>
  );
};
