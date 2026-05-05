import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// .field label — DESIGN.html ~line 280
const labelClass =
  "block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold";

// .field input/textarea
const inputClass =
  "w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper " +
  "font-sans text-[15px] text-ink focus:outline-none focus:border-ink " +
  "disabled:text-muted disabled:cursor-not-allowed";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, error, containerClassName, className, id, ...rest },
    ref,
  ) {
    return (
      <div className={cn("mb-3.5", containerClassName)}>
        {label && (
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            inputClass,
            error && "border-terra focus:border-terra",
            className,
          )}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-[12px] text-terra font-medium">{error}</p>
        )}
      </div>
    );
  },
);

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, containerClassName, className, id, ...rest },
    ref,
  ) {
    return (
      <div className={cn("mb-3.5", containerClassName)}>
        {label && (
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            inputClass,
            "resize-vertical",
            error && "border-terra focus:border-terra",
            className,
          )}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-[12px] text-terra font-medium">{error}</p>
        )}
      </div>
    );
  },
);
