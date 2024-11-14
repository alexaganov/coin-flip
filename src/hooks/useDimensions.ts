import { useLayoutEffect, useRef, useState } from "react";

export const useDimension = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateDimensions = () => {
      const element = ref.current;

      if (!element) {
        return;
      }

      const clientRect = element.getBoundingClientRect();

      setDimensions({
        width: clientRect.width,
        height: clientRect.height,
      });
    };

    const resizeObserver = new ResizeObserver(updateDimensions);

    updateDimensions();

    resizeObserver.observe(ref.current!);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, dimensions] as const;
};
