import clsx from "clsx";
import { useWindowInnerSize } from "./hooks/useWindowInnerSize";
import { styleTransform } from "./utils/css";
import { ComponentPropsWithoutRef } from "react";

interface EnvironmentProps extends ComponentPropsWithoutRef<"div"> {
  perspective: number;
}

export const Environment = ({
  perspective,
  className,
  style,
  ...props
}: EnvironmentProps) => {
  const windowInnerSize = useWindowInnerSize();

  // const maxSizeDimension = Math.max(
  //   windowInnerSize.height,
  //   windowInnerSize.width
  // );

  // const minSizeDimension = Math.min(
  //   windowInnerSize.height,
  //   windowInnerSize.width
  // );

  // const depth = maxSizeDimension * 1.5;

  const width = windowInnerSize.width * 1.5;
  const height = windowInnerSize.height * 1.5;

  const frontDepth = perspective;
  const backDepth = perspective;
  const topDepth = Math.max(perspective - windowInnerSize.height, 0);
  const bottomDepth = perspective / 2;

  const wallsY = -height / 2 + bottomDepth / 2 - topDepth / 2;

  const commonClassName =
    "absolute text-black/10 pattern-grid-[100px] size-full border-2 border-current";

  return (
    <div
      style={{
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
          height: height + topDepth + bottomDepth,
          width,
          // maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${windowInnerSize.height}px)`,
          transform: styleTransform()
            .translate3d({
              z: -frontDepth,
              y: wallsY,
            })
            .get(),
        }}
        className={commonClassName}
      >
        Wall
      </div>

      <div
        style={{
          height: frontDepth,
          width,
          maskImage: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 50%)`,
          // maskImage: `linear-gradient(to top, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              y: bottomDepth,
              // y: windowInnerSize.height / 2,
              z: (frontDepth / 2) * -1,
              // z: ((frontDepth + backDepth) / 2 - backDepth) * -1,
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
          height: height + topDepth + bottomDepth,
          width: frontDepth + backDepth,
          // maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${windowInnerSize.height}px)`,
          // maskImage: `linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          // maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              x: -width / 2,
              y: wallsY,
              // y: windowInnerSize.height / 2,
              // y: windowInnerSize.height / 2,
              z: ((frontDepth + backDepth) / 2 - backDepth) * -1,
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
          height: height + topDepth + bottomDepth,
          width: frontDepth + backDepth,
          // maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${windowInnerSize.height}px)`,
          // maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          // maskImage: `linear-gradient(to left, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              x: width / 2,
              y: wallsY,
              // y: windowInnerSize.height / 2,
              // y: windowInnerSize.height / 2,
              z: ((frontDepth + backDepth) / 2 - backDepth) * -1,
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
          height: frontDepth + backDepth,
          width,
          // maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          // maskImage: `linear-gradient(to top, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) ${
          //   fadeOut * 100
          // }%)`,
          transform: styleTransform()
            .translate3d({
              y: -(height + topDepth),
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
