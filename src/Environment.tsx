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

  const forwardDepth = perspective * 2;

  const fadeOut = 1;
  const commonClassName =
    "absolute text-gray-200 pattern-boxes-[100px] size-full border border-current";

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
              z: -forwardDepth,
            })
            .get(),
        }}
        className={commonClassName}
      >
        Wall
      </div>

      <div
        style={{
          height: forwardDepth,
          width,
          // maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          // maskImage: `linear-gradient(to top, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              y: height / 2,
              // y: windowInnerSize.height / 2,
              z: -forwardDepth / 2,
              // z: height / 2 - perspective,
            })
            .rotateX(90)
            .get(),
        }}
        className={clsx(
          commonClassName
          // "animate-[move-bg-full-bottom_10s_linear_infinite]"
        )}
      >
        Floor
      </div>

      <div
        style={{
          height: height,
          width: forwardDepth, //windowInnerSize.width,
          // maskImage: `linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          // maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              x: -width / 2,
              // y: windowInnerSize.height / 2,
              // y: windowInnerSize.height / 2,
              z: -forwardDepth / 2,
            })
            .rotateY(90)
            .get(),
        }}
        className={clsx(
          commonClassName
          // "animate-[move-bg-full-left_10s_linear_infinite]"
        )}
      >
        left Wall
      </div>
      <div
        style={{
          height: height,
          width: forwardDepth, //windowInnerSize.width,
          // maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          // maskImage: `linear-gradient(to left, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              x: width / 2,
              // y: windowInnerSize.height / 2,
              // y: windowInnerSize.height / 2,
              z: -forwardDepth / 2,
            })
            .rotateY(-90)
            .get(),
        }}
        className={clsx(
          commonClassName
          // "animate-[move-bg-full-right_10s_linear_infinite]"
        )}
      >
        right Wall
      </div>
      <div
        style={{
          height: forwardDepth,
          width,
          // maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          // maskImage: `linear-gradient(to top, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              y: -height / 2,
              // y: windowInnerSize.height / 2,
              z: -forwardDepth / 2,
            })
            .rotateX(90)
            .get(),
        }}
        className={clsx(
          commonClassName
          // "animate-[move-bg-full-bottom_10s_linear_infinite]"
        )}
      >
        Celling
      </div>
    </div>
  );
};
