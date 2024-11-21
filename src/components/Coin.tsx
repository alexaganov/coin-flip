import clsx from "clsx";
import { CircularText } from "./CircularText";
import CircularSurface from "./CircularSurface";
import { Moon } from "./icons/Moon";
import { Sun } from "./icons/Sun";

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

  const partClassName = "bg-[--bg-primary-color]";

  const sideClassName =
    "absolute size-full overflow-hidden rounded-full border-4 border-current flex-center";

  return (
    <div
      className={clsx("absolute flex-center text-3xl", className)}
      style={{
        transformStyle: "preserve-3d",
        width: size,
        height: size,
      }}
    >
      <div
        className={clsx(
          sideClassName,
          partClassName,
          "text-[var(--coin-head-color)]"
        )}
        style={{
          // boxShadow: "inset 0 0 100px currentcolor",
          transform: `translate3d(0, 0, ${frontZ}px)`,
        }}
      >
        <div
          style={{
            opacity: 0.3,
            backgroundImage:
              "radial-gradient(circle at center, transparent 30%, currentcolor 100%)",
          }}
          className={clsx("absolute size-full", partClassName)}
        />
        <Moon className="absolute size-16" />
        <CircularText
          className="animate-[spin_60s_linear_infinite]"
          radius={radius}
          text="HEAD  *  "
        />

        {/* <div className="absolute w-full h-px bg-green-500" />
        <div className="absolute w-px h-full bg-red-500" /> */}
      </div>

      <div
        className={clsx(
          sideClassName,
          partClassName,
          "text-[var(--coin-tail-color)]"
        )}
        style={{
          transform: `translate3d(0, 0, ${backZ}px) rotate3d(0, 1, 0, -180deg)`,
        }}
      >
        <div
          style={{
            opacity: 0.3,
            backgroundImage:
              "radial-gradient(circle at center, transparent 30%, currentcolor 100%)",
          }}
          className={clsx("absolute size-full", partClassName)}
        />
        <Sun className="absolute size-16" />
        <CircularText
          className="animate-[spin_60s_linear_infinite]"
          radius={radius}
          text="TAIL  *  "
        />

        {/* <div className="absolute w-full h-px bg-green-500" />
        <div className="absolute w-px h-full bg-red-500" /> */}
      </div>

      <CircularSurface
        radius={radius}
        depth={depth}
        className="absolute size-full text-current flex-center"
        segmentClassName={clsx(
          "py-0.5",
          "border-y-4",
          // "border-current",
          "border-b-[var(--coin-head-color)] border-t-[var(--coin-tail-color)]",
          partClassName
        )}
        totalSegments={40}
        render={() => {
          return (
            <div
              className={clsx(
                "h-full w-0.5",
                // "bg-current",
                "bg-black"
              )}
            />
          );
        }}
      />
    </div>
  );
};
