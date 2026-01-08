"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Framer Motion Animations - Reusable animation components
 * Matching Student Portal smooth transitions and micro-interactions
 */

// Page transition wrapper
interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Fade in animation
interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.5,
    className,
    direction = "up",
}: FadeInProps) {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
        none: {},
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger children animation
interface StaggerContainerProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1,
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Scale on hover - for buttons and cards
interface ScaleOnHoverProps {
    children: React.ReactNode;
    className?: string;
    scale?: number;
}

export function ScaleOnHover({
    children,
    className,
    scale = 1.02,
}: ScaleOnHoverProps) {
    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Number counter animation
interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    suffix?: string;
    prefix?: string;
}

export function AnimatedCounter({
    value,
    duration = 1,
    className,
    suffix = "",
    prefix = "",
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const updateValue = () => {
            const now = Date.now();
            const progress = Math.min(1, (now - startTime) / (duration * 1000));
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(value * easeOut));

            if (now < endTime) {
                requestAnimationFrame(updateValue);
            }
        };

        requestAnimationFrame(updateValue);
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}
            {displayValue}
            {suffix}
        </span>
    );
}

