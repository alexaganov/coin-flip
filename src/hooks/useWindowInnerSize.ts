import { useLayoutEffect, useState } from "react";

export const useWindowInnerSize = () => {
  const [windowInnerSize, setWindowInnerSize] = useState({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const updateWindow = () => {
      setWindowInnerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindow();

    window.addEventListener("resize", updateWindow);

    return () => {
      window.removeEventListener("resize", updateWindow);
    };
  }, []);

  return windowInnerSize;
};
