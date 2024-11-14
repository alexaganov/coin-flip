// NOTE: iphone shows selection magnifier on dbl touch

import { useEffect } from "react";

// below code prevents it but in some cases it also prevents normal scroll
export const usePreventSelectionMagnifier = () => {
  useEffect(() => {
    function createDoubleTapPreventer(timeout: number) {
      let dblTapTimer = 0;
      let dblTapPressed = false;

      return function (e: TouchEvent) {
        clearTimeout(dblTapTimer);
        if (dblTapPressed) {
          e.preventDefault();
          dblTapPressed = false;
        } else {
          dblTapPressed = true;
          dblTapTimer = setTimeout(() => {
            dblTapPressed = false;
          }, timeout);
        }
      };
    }
    const handler = createDoubleTapPreventer(500);

    window.addEventListener("touchstart", handler, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handler);
    };
  }, []);
};
