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

  const minSizeDimension = Math.min(
    windowInnerSize.height,
    windowInnerSize.width
  );

  // const depth = maxSizeDimension * 1.5;

  const width = windowInnerSize.width * 1.5;
  const height = windowInnerSize.height * 1.5;

  const fadeOut = 0.95;
  const commonClassName =
    "absolute  text-black pattern-boxes-[100px] size-full border border-current";

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
          height,
          width,
          // maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              z: -perspective,
            })
            .get(),
        }}
        className={commonClassName}
      >
        Wall
      </div>

      <div
        style={{
          height,
          width,
          maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
            fadeOut * 100
          }%)`,
          transform: styleTransform()
            .translate3d({
              y: height / 2,
              // y: windowInnerSize.height / 2,
              z: height / 2 - perspective,
            })
            .rotateX(90)
            .get(),
        }}
        className={commonClassName}
      >
        Floor
      </div>

      <div
        style={{
          height: height,
          width: height, //windowInnerSize.width,
          maskImage: `linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
            fadeOut * 100
          }%)`,
          transform: styleTransform()
            .translate3d({
              x: -width / 2,
              // y: windowInnerSize.height / 2,
              // y: windowInnerSize.height / 2,
              z: height / 2 - perspective,
            })
            .rotateY(90)
            .get(),
        }}
        className={commonClassName}
      >
        left Wall
      </div>
      <div
        style={{
          height: height,
          width: height, //windowInnerSize.width,
          maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
            fadeOut * 100
          }%)`,
          transform: styleTransform()
            .translate3d({
              x: width / 2,
              // y: windowInnerSize.height / 2,
              // y: windowInnerSize.height / 2,
              z: height / 2 - perspective,
            })
            .rotateY(-90)
            .get(),
        }}
        className={commonClassName}
      >
        right Wall
      </div>
      <div
        style={{
          height,
          width,
          maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
            fadeOut * 100
          }%)`,
          transform: styleTransform()
            .translate3d({
              y: -height / 2,
              // y: windowInnerSize.height / 2,
              z: height / 2 - perspective,
            })
            .rotateX(90)
            .get(),
        }}
        className={commonClassName}
      >
        Celling
      </div>
    </div>
  );
};
