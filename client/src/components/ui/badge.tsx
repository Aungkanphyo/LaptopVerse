import * as React from "react"
import { Slot } from "radix-ui"
import { badgeVariants, type BadgeVariantProps } from "./badge-variants"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.ComponentProps<"span">, BadgeVariantProps {
  asChild?: boolean
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
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
