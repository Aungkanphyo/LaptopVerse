import * as React from "react"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all disabled:opacity-50"
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
    outline: "border border-slate-700 text-slate-300 hover:bg-slate-800/60",
    ghost: "text-slate-300 hover:bg-slate-800/50 hover:text-white"
  }

  const sizes = {
    default: "px-4 py-2.5 text-xs",
    sm: "px-3 py-2 text-[11px]",
    lg: "px-6 py-3.5 text-sm"
  }

  return (
    <Comp
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}

export { Button }