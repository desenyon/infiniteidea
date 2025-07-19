"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Stack Component
const stackVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        vertical: "flex-col",
        horizontal: "flex-row",
      },
      spacing: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
      },
    },
    defaultVariants: {
      direction: "vertical",
      spacing: "md",
      align: "start",
      justify: "start",
    },
  }
)

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, spacing, align, justify, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ direction, spacing, align, justify, className }))}
      {...props}
    />
  )
)
Stack.displayName = "Stack"

// Section Component
const sectionVariants = cva(
  "w-full",
  {
    variants: {
      padding: {
        none: "",
        sm: "py-8",
        md: "py-12",
        lg: "py-16",
        xl: "py-20",
      },
      background: {
        none: "",
        muted: "bg-muted",
        accent: "bg-accent",
        gradient: "bg-gradient-secondary",
      },
    },
    defaultVariants: {
      padding: "md",
      background: "none",
    },
  }
)

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, padding, background, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(sectionVariants({ padding, background, className }))}
      {...props}
    />
  )
)
Section.displayName = "Section"

// Columns Component
export interface ColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  breakpoint?: "sm" | "md" | "lg" | "xl"
}

export const Columns: React.FC<ColumnsProps> = ({
  children,
  count = 2,
  gap = "md",
  breakpoint = "md",
  className,
  ...props
}) => {
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  }

  const columnClasses = {
    1: "grid-cols-1",
    2: `grid-cols-1 ${breakpoint}:grid-cols-2`,
    3: `grid-cols-1 ${breakpoint}:grid-cols-2 lg:grid-cols-3`,
    4: `grid-cols-1 ${breakpoint}:grid-cols-2 lg:grid-cols-4`,
    5: `grid-cols-1 ${breakpoint}:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`,
    6: `grid-cols-1 ${breakpoint}:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`,
  }

  return (
    <div
      className={cn(
        "grid",
        columnClasses[count],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// AspectRatio Component
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
}

export const AspectRatio: React.FC<AspectRatioProps> = ({
  children,
  ratio = 16 / 9,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      {...props}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  )
}

// Show/Hide Components for responsive visibility
export interface ShowProps extends React.HTMLAttributes<HTMLDivElement> {
  above?: "sm" | "md" | "lg" | "xl" | "2xl"
  below?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export const Show: React.FC<ShowProps> = ({
  children,
  above,
  below,
  className,
  ...props
}) => {
  let visibilityClasses = ""
  
  if (above) {
    const showClasses = {
      sm: "hidden sm:block",
      md: "hidden md:block",
      lg: "hidden lg:block",
      xl: "hidden xl:block",
      "2xl": "hidden 2xl:block",
    }
    visibilityClasses = showClasses[above]
  }
  
  if (below) {
    const hideClasses = {
      sm: "block sm:hidden",
      md: "block md:hidden",
      lg: "block lg:hidden",
      xl: "block xl:hidden",
      "2xl": "block 2xl:hidden",
    }
    visibilityClasses = hideClasses[below]
  }

  return (
    <div className={cn(visibilityClasses, className)} {...props}>
      {children}
    </div>
  )
}

export const Hide: React.FC<ShowProps> = ({
  children,
  above,
  below,
  className,
  ...props
}) => {
  let visibilityClasses = ""
  
  if (above) {
    const hideClasses = {
      sm: "block sm:hidden",
      md: "block md:hidden",
      lg: "block lg:hidden",
      xl: "block xl:hidden",
      "2xl": "block 2xl:hidden",
    }
    visibilityClasses = hideClasses[above]
  }
  
  if (below) {
    const showClasses = {
      sm: "hidden sm:block",
      md: "hidden md:block",
      lg: "hidden lg:block",
      xl: "hidden xl:block",
      "2xl": "hidden 2xl:block",
    }
    visibilityClasses = showClasses[below]
  }

  return (
    <div className={cn(visibilityClasses, className)} {...props}>
      {children}
    </div>
  )
}

export { stackVariants, sectionVariants }