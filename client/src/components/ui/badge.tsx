import * as React from "react"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.ComponentProps<"span"> {
  asChild?: boolean
  variant?: "default" | "secondary"
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase transition-colors",
        variant === "default" 
          ? "bg-blue-600/90 text-white border border-blue-400/30" 
          : "bg-indigo-600/90 text-white border border-indigo-400/30",
        className
      )}
      {...props}
    />
  )
}

export { Badge }