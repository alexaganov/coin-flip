import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef, Ref } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  contentClassName?: string;
};

const Button = (
  {
    className,
    contentClassName: innerClassName,
    children,
    ...props
  }: ButtonProps,
  ref: Ref<HTMLButtonElement>
) => {
  return (
    <button
      ref={ref}
      type="button"
      className={clsx("btn", className)}
      {...props}
    >
      <div className={clsx("btn-content", innerClassName)}>{children}</div>

      <div className="btn-shadow" />
    </button>
  );
};

export default forwardRef(Button);
