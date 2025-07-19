"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  className?: string
  contentClassName?: string
}

const sideOffsets = {
  top: { x: 0, y: -8 },
  right: { x: 8, y: 0 },
  bottom: { x: 0, y: 8 },
  left: { x: -8, y: 0 },
}

const alignmentClasses = {
  start: {
    top: "left-0",
    bottom: "left-0",
    left: "top-0",
    right: "top-0",
  },
  center: {
    top: "left-1/2 -translate-x-1/2",
    bottom: "left-1/2 -translate-x-1/2",
    left: "top-1/2 -translate-y-1/2",
    right: "top-1/2 -translate-y-1/2",
  },
  end: {
    top: "right-0",
    bottom: "right-0",
    left: "bottom-0",
    right: "bottom-0",
  },
}

const arrowClasses = {
  top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-background",
  right: "left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-l-transparent border-r-background",
  bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-background",
  left: "right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-r-transparent border-l-background",
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 300,
  className,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [delayHandler, setDelayHandler] = React.useState<NodeJS.Timeout | null>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    const handler = setTimeout(() => setIsOpen(true), delayDuration)
    setDelayHandler(handler)
  }

  const handleMouseLeave = () => {
    if (delayHandler) {
      clearTimeout(delayHandler)
      setDelayHandler(null)
    }
    setIsOpen(false)
  }

  const offset = sideOffsets[side]

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, ...offset }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, ...offset }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 px-3 py-1.5 text-xs text-foreground bg-background border border-border rounded-md shadow-md",
              side === "top" && "bottom-full mb-2",
              side === "right" && "left-full ml-2",
              side === "bottom" && "top-full mt-2",
              side === "left" && "right-full mr-2",
              alignmentClasses[align][side],
              contentClassName
            )}
          >
            {content}
            
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-4",
                arrowClasses[side]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delayDuration = 300,
}) => {
  return (
    <div data-tooltip-delay={delayDuration}>
      {children}
    </div>
  )
}