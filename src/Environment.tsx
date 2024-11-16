import clsx from "clsx";
import { useWindowInnerSize } from "./hooks/useWindowInnerSize";
import { styleTransform } from "./utils/css";
import { ComponentPropsWithoutRef } from "react";

interface EnvironmentProps extends ComponentPropsWithoutRef<"div"> {
  perspective: number;
  floorSize: number;
  floorY: number;
}

export const Environment = ({
  perspective,
  className,
  floorSize,
  floorY,
  style,
  ...props
}: EnvironmentProps) => {
  const windowInnerSize = useWindowInnerSize();

  const maxSizeDimension = Math.max(
    windowInnerSize.height,
    windowInnerSize.width
  );

  return (
    <div
      style={{
        // transform: "rotateX(45deg)",
        // transformOrigin: "center bottom",
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={clsx(
        "absolute flex-center pointer-events-none size-full",
        className
      )}
      {...props}
    >
      <div
        style={{
          height: floorSize,
          width: floorSize,
          // width: windowInnerSize.width * 2,
          transform: styleTransform()
            .translate3d({
              y: floorY - floorSize / 2,
              z: -floorSize / 2,
              // z: -floorSize / 2,
              // z: -perspective,
            })
            .get(),
        }}
        className="absolute size-full border border-black"
      >
        Wall
      </div>
      <div
        style={{
          width: floorSize, //windowInnerSize.width * 2,
          height: floorSize, //perspective * 2,
          transform: styleTransform()
            .translate3d({
              y: floorY,
              // y: windowInnerSize.height / 2,
              z: 0,
            })
            .rotateX(90)
            .get(),
        }}
        className="absolute size-full border border-black"
      >
        Floor
      </div>
    </div>
  );
};
