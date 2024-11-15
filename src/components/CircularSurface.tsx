import React, { ComponentPropsWithoutRef, ReactNode } from "react";
import { styleTransform } from "../utils/css";
import { radToDeg, TWO_PI } from "../utils/math";
import clsx from "clsx";

interface CircularSurfaceProps extends ComponentPropsWithoutRef<"div"> {
  radius: number;
  depth: number;
  totalSegments: number;
  render?: (params: { index: number }) => ReactNode;
  segmentClassName?: string;
}

const CircularSurface = ({
  className,
  style,
  depth,
  radius,
  totalSegments,
  segmentClassName,
  render,
}: CircularSurfaceProps) => {
  const segmentsRadius = radius;
  const circumference = TWO_PI * segmentsRadius;
  const segmentHeight = depth;
  const segmentWidth = 2 * radius * Math.sin(Math.PI / totalSegments);

  const segmentAngleStep = circumference / totalSegments / segmentsRadius;

  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={clsx(
        "absolute w-full h-full flex items-center justify-center",
        className
      )}
    >
      {Array.from({ length: totalSegments }, (_, i) => {
        const angle = segmentAngleStep * i;

        const x = segmentsRadius * Math.cos(angle);
        const y = segmentsRadius * Math.sin(angle);

        const rotateZ = radToDeg(angle + Math.PI / totalSegments) + 90;

        return (
          <div
            style={{
              width: 0,
              height: 0,
              transformOrigin: "center",
              transformStyle: "preserve-3d",
              transform: styleTransform()
                .translate3d({
                  x,
                  y,
                })
                .get(),
            }}
            className="absolute flex items-center"
            key={i}
          >
            <div
              style={{
                width: segmentWidth,
                height: segmentHeight,
                transformOrigin: "left",
                transform: styleTransform().rotateZ(rotateZ).rotateX(90).get(),
              }}
              className={clsx("absolute", segmentClassName)}
            >
              {render && render({ index: i })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CircularSurface;
