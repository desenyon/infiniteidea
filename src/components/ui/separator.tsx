"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0 bg-border",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
      variant: {
        default: "bg-border",
        gradient: "bg-gradient-to-r from-transparent via-border to-transparent",
        dashed: "border-t border-dashed border-border bg-transparent",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "default",
    },
  }
)

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation, variant, decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      className={cn(separatorVariants({ orientation, variant, className }))}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export interface SeparatorWithTextProps extends Omit<SeparatorProps, 'children'> {
  children: React.ReactNode
}

export const SeparatorWithText: React.FC<SeparatorWithTextProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Separator className="flex-1" {...props} />
      <div className="px-4 text-xs text-muted-foreground bg-background">
        {children}
      </div>
      <Separator className="flex-1" {...props} />
    </div>
  )
}

export { Separator, separatorVariants }