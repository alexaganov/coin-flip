import React, { useLayoutEffect, useRef, useState } from "react";
import { degToRad, radToDeg, TWO_PI } from "../utils/math";
import clsx from "clsx";
import { styleTransform } from "../utils/css";

interface CircularTextProps {
  repeatText?: boolean;
  isTextInside?: boolean;
  offset?: number;
  text: string;
  radius: number;
  className?: string;
}

// TODO: add ability to specify separator
export const CircularText = ({
  text,
  radius,
  className,
  offset = 10,
  isTextInside = true,
  repeatText = true,
}: CircularTextProps) => {
  const [textSize, setTextSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const size = radius * 2;

  const symbols = [...text];
  const symbolWidth = textSize ? textSize.width / symbols.length : 0;

  const textRadius = textSize
    ? radius + (isTextInside ? -(textSize.height + offset) : offset)
    : 0;

  const textCircleCircumference = TWO_PI * textRadius;

  const textRepeatCount =
    textSize?.width && repeatText
      ? Math.floor(textCircleCircumference / textSize.width)
      : 1;

  // console.log({ textRepeatCount, textCircleCircumference });
  // const repeatedTextSpearSpace = textSize
  //   ? textCircleCircumference - textRepeatCount * textSize.width
  //   : 0;

  // const repeatedTextSpaceBetween = repeatedTextSpearSpace / textRepeatCount;

  const repeatedTextStepAngleInDegree = radToDeg(
    textCircleCircumference / textRepeatCount / textRadius
  );

  // console.log({ symbolWidth });

  const symbolStepAngleInDegree = textSize
    ? radToDeg(symbolWidth / textRadius)
    : 0;

  // console.log({
  //   textRepeatCount,
  //   repeatedTextSpaceBetween,
  //   repeatedTotalWidth: textRepeatCount * textSize?.width ?? 0,
  //   seg: textCircleCircumference / symbols.length,
  //   circumference: textCircleCircumference,
  //   angleStep: symbolStepAngleInDegree,
  //   textWidth: textSize,
  //   symbolWidth,
  // });

  useLayoutEffect(() => {
    setTextSize({
      width: textRef.current!.offsetWidth,
      height: textRef.current!.offsetHeight,
    });
  }, [text]);

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
      <span ref={textRef} className="absolute invisible pointer-events-none">
        {text}
      </span>

      {textSize &&
        Array.from({ length: textRepeatCount }, (_, i) => {
          return (
            <span
              style={{
                transform: styleTransform()
                  .rotateZ(repeatedTextStepAngleInDegree * i)
                  .get(),
              }}
              key={i}
              className="absolute flex items-center justify-center"
            >
              {symbols.map((symbol, i) => {
                const angle = symbolStepAngleInDegree * i;

                const x = textRadius * Math.cos(degToRad(angle));
                const y = textRadius * Math.sin(degToRad(angle));

                const rotateZ = angle + 90;

                return (
                  <React.Fragment key={`${symbol}-${i}`}>
                    {/* <span
                      className="absolute size-1 bg-red-900 rounded-full z-10"
                      style={{
                        transform: styleTransform()
                          .translate3d({
                            x,
                            y,
                          })
                          .get(),
                      }}
                    /> */}

                    <span
                      className="absolute"
                      style={{
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
                      <span className="block -translate-y-1/2">{symbol}</span>
                    </span>
                  </React.Fragment>
                );
              })}
            </span>
          );
        })}
    </div>
  );
};
