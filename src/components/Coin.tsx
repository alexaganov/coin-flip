import clsx from "clsx";
import { CircularText } from "./CircularText";
import CircularSurface from "./CircularSurface";
import { Moon } from "./icons/Moon";
import { Sun } from "./icons/Sun";
import LightSweepEffect from "./LightSweepEffect";
import { ComponentPropsWithoutRef, ComponentType } from "react";
import { useRouteSearchCoinConfig } from "../routes";

interface CoinFaceProps extends ComponentPropsWithoutRef<"div"> {
  radius: number;
  label?: string;
}

const CoinFace = ({
  radius,
  label = "HEAD",
  className,
  children,
  ...props
}: CoinFaceProps) => {
  return (
    <div
      className={clsx(
        "absolute size-full overflow-hidden rounded-full border-4 border-current flex-center",
        className
      )}
      {...props}
    >
      <div
        style={{
          opacity: 0.3,
          backgroundImage:
            "radial-gradient(circle at center, transparent 30%, currentcolor 100%)",
        }}
        className={clsx("absolute size-full")}
      />

      {children}

      <CircularText
        className="animate-[spin_60s_linear_infinite]"
        radius={radius}
        text={label}
      />

      <LightSweepEffect />
      {/* <div className="absolute w-full h-px bg-green-500" />
        <div className="absolute w-px h-full bg-red-500" /> */}
    </div>
  );
};

export const DEFAULT_COIN_HEAD_LABEL = "HEAD   *   ";
export const DEFAULT_COIN_HEAD_ICON = "!moon";

const DEFAULT_ICONS = {
  moon: Moon,
  sun: Sun,
};

const getDefaultIcon = (
  icon: string
): ComponentType<{ className?: string }> | null => {
  if (!icon.startsWith("!")) {
    return null;
  }

  const iconName = icon.slice(1);

  return iconName in DEFAULT_ICONS
    ? DEFAULT_ICONS[iconName as keyof typeof DEFAULT_ICONS]
    : null;
};

const CoinFaceIcon = ({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) => {
  const DefaultIcon = getDefaultIcon(icon);

  if (DefaultIcon) {
    return <DefaultIcon className={clsx("size-16", className)} />;
  }

  // return (
  //   <div className={clsx(className, "size-max")}>
  //     <svg
  //       viewBox="0 0 100 100"
  //       // preserveAspectRatio="xMinYMid meet"
  //       className={clsx("w-full h-full")}
  //     >
  //       <text x="50" y="50" alignmentBaseline="middle" textAnchor="middle">
  //         {icon}
  //       </text>
  //     </svg>
  //   </div>
  // );

  return (
    <div
      className={clsx(
        "size-2/3 flex-center rounded-full overflow-hidden",
        className
      )}
    >
      <p className="break-words text-center leading-none text-7xl w-full rounded-full">
        {icon}
      </p>
    </div>
    // <svg viewBox="0 0 100 100" className={clsx("size-full", className)}>
    //   <foreignObject className="size-full">
    //   </foreignObject>
    // </svg>
  );
};

const CoinHead = ({
  className,
  ...props
}: Omit<CoinFaceProps, "label" | "icon">) => {
  const { config } = useRouteSearchCoinConfig();
  const { label, icon } = config.head;

  return (
    <CoinFace
      className={clsx("text-[var(--coin-head-color)]", className)}
      label={label || DEFAULT_COIN_HEAD_LABEL}
      {...props}
    >
      <CoinFaceIcon
        className="absolute"
        icon={icon || DEFAULT_COIN_HEAD_ICON}
      />
    </CoinFace>
  );
};

export const DEFAULT_COIN_TAIL_LABEL = "TAIL   *   ";
export const DEFAULT_COIN_TAIL_ICON = "!sun";

const CoinTail = ({
  className,
  ...props
}: Omit<CoinFaceProps, "label" | "icon">) => {
  const { config } = useRouteSearchCoinConfig();
  const { label, icon } = config.tail;

  return (
    <CoinFace
      className={clsx("text-[var(--coin-tail-color)]", className)}
      label={label || DEFAULT_COIN_TAIL_LABEL}
      {...props}
    >
      <CoinFaceIcon
        className="absolute"
        icon={icon || DEFAULT_COIN_TAIL_ICON}
      />
    </CoinFace>
  );
};

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

  const bgClassName = "bg-[--bg-primary-color]";

  return (
    <div
      className={clsx("absolute flex-center text-3xl", className)}
      style={{
        transformStyle: "preserve-3d",
        width: size,
        height: size,
      }}
    >
      <CoinHead
        className={clsx(bgClassName)}
        radius={radius}
        style={{
          transform: `translate3d(0, 0, ${frontZ}px)`,
        }}
      />

      <CoinTail
        className={clsx(bgClassName)}
        radius={radius}
        style={{
          transform: `translate3d(0, 0, ${backZ}px) rotate3d(0, 1, 0, -180deg)`,
        }}
      />

      <CircularSurface
        radius={radius}
        depth={depth}
        className="absolute size-full text-current flex-center"
        segmentClassName={clsx(
          "py-0.5",
          "border-y-4",
          // "border-current",
          "border-b-[var(--coin-head-color)] border-t-[var(--coin-tail-color)]",
          bgClassName
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
