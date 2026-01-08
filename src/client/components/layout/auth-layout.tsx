// Client-side only — no server secrets or database access here

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Logo } from '@/client/components/shared/Logo';

interface AuthLayoutProps {
    children: React.ReactNode;
    variant?: "login" | "register";
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Animated Hero */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
            >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-neutral-900">
                    <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-neutral-900 to-neutral-800" />
                    {/* Animated blobs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full bg-primary-500/30 blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.4, 0.3],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute top-1/3 -right-1/4 w-[60%] h-[60%] rounded-full bg-purple-500/30 blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                        }}
                        className="absolute -bottom-1/4 left-1/4 w-[60%] h-[60%] rounded-full bg-emerald-500/20 blur-[100px]"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                        className="mb-8"
                    >
                        <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-white/20">
                            <Logo className="h-20 w-20" />
                        </div>
                    </motion.div>

                    {/* Brand */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-4xl font-bold tracking-tight text-white mb-4"
                    >
                        The Stack Hub Admin
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl text-primary-300 font-medium mb-4"
                    >
                        Foundation First, Excellence Always
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-sm text-neutral-400 max-w-md text-center leading-relaxed"
                    >
                        Admin Portal for Managing Operations, Users, and Content.
                    </motion.p>
                </div>

                {/* Floating decorations */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 left-10 w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-400/30 to-emerald-300/30 backdrop-blur-sm border border-white/10 rotate-12"
                />
                <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-10 w-20 h-20 rounded-full bg-linear-to-bl from-amber-400/30 to-amber-300/30 backdrop-blur-sm border border-white/10"
                />
            </motion.div>

            {/* Right Panel - Form */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 relative bg-white dark:bg-neutral-950"
            >
                {/* Mobile background effects */}
                <div className="lg:hidden absolute inset-0 overflow-hidden -z-10">
                    <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[60%] rounded-full bg-primary-500/10 blur-[80px]" />
                    <div className="absolute -bottom-1/4 -left-1/4 w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[80px]" />
                </div>

                {/* Form container */}
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex lg:hidden items-center justify-center gap-3 mb-8"
                    >
                        <Logo className="h-12 w-12" />
                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">The Stack Hub</span>
                    </motion.div>

                    {children}

                    {/* Footer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 text-center text-xs text-neutral-400"
                    >
                        © 2026 The Stack Hub. All rights reserved.
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}

