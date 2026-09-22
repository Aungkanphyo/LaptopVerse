import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, leftIcon, rightElement, ...props }, ref) => {
        const hasWrapper = Boolean(leftIcon || rightElement);
        const inputElement = (
            <input
                type={type}
                className={cn(
                    "h-9 w-full rounded-xl border border-slate-800 bg-[#070913] px-3 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:cursor-not-allowed disabled:opacity-50",
                    leftIcon && "pl-9",
                    rightElement && "pr-9",
                    className
                )}
                ref={ref}
                {...props}
            />
        );

        if (!hasWrapper) {
            return inputElement;
        }

        return (
            <div className="relative flex items-center w-full">
                {leftIcon && (
                    <div className="absolute left-3 flex items-center text-slate-500 pointer-events-none z-10">
                        {leftIcon}
                    </div>
                )}
                {inputElement}
                {rightElement && (
                    <div className="absolute right-3 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };