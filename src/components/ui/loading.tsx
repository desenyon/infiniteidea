"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className 
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  )
}

export interface LoadingDotsProps {
  className?: string
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className }) => {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="h-2 w-2 bg-current rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export interface LoadingBarProps {
  progress?: number
  className?: string
  showPercentage?: boolean
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ 
  progress = 0, 
  className,
  showPercentage = false 
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        {showPercentage && (
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  lines = 1 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gradient-loading rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

export interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = "Loading...",
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Premium Gradient Loading Components
export interface GradientSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export const GradientSpinner: React.FC<GradientSpinnerProps> = ({ 
  size = "md", 
  className 
}) => {
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full bg-gradient-primary animate-spin">
        <div className="absolute inset-1 rounded-full bg-background" />
      </div>
    </div>
  )
}

export interface PulsingDotsProps {
  className?: string
  count?: number
}

export const PulsingDots: React.FC<PulsingDotsProps> = ({ 
  className, 
  count = 3 
}) => {
  return (
    <div className={cn("flex space-x-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="w-3 h-3 rounded-full bg-gradient-primary"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export interface WaveLoadingProps {
  className?: string
}

export const WaveLoading: React.FC<WaveLoadingProps> = ({ className }) => {
  return (
    <div className={cn("flex items-end space-x-1", className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className="w-1 bg-gradient-primary rounded-full"
          animate={{
            height: ["8px", "24px", "8px"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export interface CircularProgressProps {
  progress?: number
  size?: "sm" | "md" | "lg"
  className?: string
  showPercentage?: boolean
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress = 0,
  size = "md",
  className,
  showPercentage = false,
}) => {
  const sizeMap = {
    sm: { width: 40, strokeWidth: 3 },
    md: { width: 60, strokeWidth: 4 },
    lg: { width: 80, strokeWidth: 5 },
  }
  
  const { width, strokeWidth } = sizeMap[size]
  const radius = (width - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" className="text-foreground" />
            <stop offset="100%" stopColor="currentColor" className="text-muted-foreground" />
          </linearGradient>
        </defs>
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

export interface ShimmerCardProps {
  className?: string
  lines?: number
  showAvatar?: boolean
}

export const ShimmerCard: React.FC<ShimmerCardProps> = ({
  className,
  lines = 3,
  showAvatar = false,
}) => {
  return (
    <div className={cn("p-4 border border-border rounded-lg bg-background", className)}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="w-12 h-12 rounded-full bg-gradient-loading animate-pulse" />
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className="h-3 bg-gradient-loading rounded animate-pulse"
              style={{
                width: index === 0 ? "75%" : index === lines - 1 ? "50%" : "100%",
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}