import clsx from "clsx";
import { ReactNode, useId } from "react";
import { Cross } from "./icons/Cross";

interface TextField {
  label?: ReactNode;
  inputClassName?: string;
  placeholder?: string;
  value?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

const TextField = ({
  className,
  value,
  placeholder,
  inputClassName,
  onValueChange,
  label,
}: TextField) => {
  const inputId = useId();

  return (
    <div className={clsx("relative", className)}>
      {label && (
        <label
          className="text-center absolute -translate-y-1/2 bg-white text-sm px-1 ml-1.5 -mb-2.5"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}

      <input
        onChange={(event) => {
          onValueChange?.(event.target.value);
        }}
        id={inputId}
        value={value}
        placeholder={placeholder}
        className={clsx(
          "order-1 w-full peer pr-10 rounded-none border-gray-400 px-2 outline-none min-h-10 border-2",
          inputClassName
        )}
      />

      {!!value && (
        <button
          onClick={() => onValueChange?.("")}
          className={clsx(
            "flex-center text-red-500 top-0 h-full aspect-square absolute right-0"
          )}
        >
          <Cross className="size-4" />
        </button>
      )}
    </div>
  );
};

export default TextField;
