"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  showLabel?: boolean
  label?: string
  animated?: boolean
  gradient?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    size, 
    value = 0, 
    max = 100, 
    showLabel = false, 
    label,
    animated = true,
    gradient = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div className="space-y-2">
        {(showLabel || label) && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {label || "Progress"}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressVariants({ size, className }))}
          {...props}
        >
          <motion.div
            className={cn(
              "h-full rounded-full transition-all",
              gradient 
                ? "bg-gradient-primary" 
                : "bg-primary"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={animated ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export interface MultiStepProgressProps {
  steps: Array<{
    label: string
    completed: boolean
    current?: boolean
  }>
  className?: string
}

export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  className,
}) => {
  const completedSteps = steps.filter(step => step.completed).length
  const currentStepIndex = steps.findIndex(step => step.current)
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedSteps / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "w-4 h-4 rounded-full border-2 -mt-1 transition-all duration-200",
                step.completed
                  ? "bg-primary border-primary"
                  : step.current
                  ? "bg-background border-primary animate-pulse"
                  : "bg-background border-muted"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between text-xs">
        {steps.map((step, index) => (
          <span
            key={index}
            className={cn(
              "transition-colors",
              step.completed || step.current
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export { Progress, progressVariants }