"use client"

import * as React from "react"
import { motion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

// Animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// Animated components
export interface AnimatedDivProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof animationVariants
  delay?: number
  duration?: number
}

const animationVariants = {
  fadeInUp,
  fadeIn,
  slideInLeft,
  slideInRight,
  scaleIn,
}

export const AnimatedDiv: React.FC<AnimatedDivProps> = ({
  children,
  className,
  variant = "fadeInUp",
  delay = 0,
  duration = 0.3,
  ...props
}) => {
  return (
    <motion.div
      className={className}
      variants={animationVariants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface StaggeredListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  staggerDelay?: number
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  ...props
}) => {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: staggerDelay }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  gradient?: "primary" | "secondary" | "accent"
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  gradient = "primary",
  ...props
}) => {
  const gradientClasses = {
    primary: "bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-300",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-400",
    accent: "bg-gradient-to-r from-gray-800 to-gray-500 dark:from-gray-200 dark:to-gray-400",
  }

  return (
    <span
      className={cn(
        "bg-clip-text text-transparent",
        gradientClasses[gradient],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export interface FloatingElementProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "subtle" | "medium" | "strong"
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className,
  intensity = "medium",
  ...props
}) => {
  const intensityValues = {
    subtle: { y: [-2, 2], duration: 3 },
    medium: { y: [-5, 5], duration: 2.5 },
    strong: { y: [-10, 10], duration: 2 },
  }

  const { y, duration } = intensityValues[intensity]

  return (
    <motion.div
      className={className}
      animate={{ y }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}