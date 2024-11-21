import clsx from "clsx";
import { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  contentClassName?: string;
};

const Button = ({
  className,
  contentClassName: innerClassName,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button type="button" className={clsx("btn", className)} {...props}>
      <div className={clsx("btn-content", innerClassName)}>{children}</div>

      <div className="btn-shadow" />
    </button>
  );
};

export default Button;
