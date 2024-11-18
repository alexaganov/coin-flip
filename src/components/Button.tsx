import clsx from "clsx";
import React, { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  innerClassName?: string;
};

const Button = ({
  className,
  innerClassName,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={clsx("flex-center relative group", className)}
      {...props}
    >
      <div
        className={clsx(
          "w-full relative px-4 flex-center min-h-[3.75rem] min-w-[3.75rem] h-full duration-100 border-2 bg-white border-black ",
          "group-active:translate-x-0.5 transition-all group-active:translate-y-0.5 group-active:nb-shadow-2",
          innerClassName
        )}
      >
        {children}
      </div>

      <div className="bg-black translate-x-1 translate-y-1 absolute w-full h-full z-[-1]"></div>
    </button>
  );
};

export default Button;
