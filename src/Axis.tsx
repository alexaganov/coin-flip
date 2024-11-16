import React from "react";
import { styleTransform } from "./utils/css";

const Axis = () => {
  return (
    <div
      style={{
        transform: `rotateX(90deg)`,
      }}
      className="absolute size-full flex-center"
    >
      <div
        style={{
          transform: `rotateX(90deg)`,
        }}
        className="absolute w-full text-red-500 bg-current h-0.5"
      >
        {/* <div
          style={{
            transform: styleTransform().rotateY(90).get(),
          }}
          className="w-full h-px bg-current"
        /> */}
      </div>
      {/* <div className="absolute h-full text-green-500 bg-current w-px">
      </div> */}
    </div>
  );
};

export default Axis;
