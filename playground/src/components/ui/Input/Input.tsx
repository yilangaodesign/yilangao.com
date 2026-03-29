import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    return (
      <div className={cn("flex flex-col gap-2 w-full", className)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full h-10 px-4 text-sm rounded-sm border bg-background text-foreground",
            "placeholder:text-muted-foreground",
            "transition-colors duration-150",
            "hover:border-foreground/25",
            "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-border",
            error
              ? "border-red-600 dark:border-red-500 focus:border-red-600 focus:ring-red-600 dark:focus:border-red-500 dark:focus:ring-red-500"
              : "border-border",
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />
        {error && (
          <span
            id={errorId}
            className="text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
