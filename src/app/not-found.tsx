"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from '@/client/components/ui/button';
import { GlassCard } from '@/client/components/ui/premium';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[50vw] w-[50vw] rounded-full bg-blue-500/10 blur-3xl" />
            </div>

            <GlassCard className="relative z-10 w-full max-w-md p-8 text-center backdrop-blur-xl">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-purple-500 to-blue-600 shadow-xl shadow-purple-500/20">
                        <span className="text-5xl font-bold text-white">404</span>
                    </div>
                </div>

                <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">
                    Page Not Found
                </h1>
                <p className="mb-8 text-neutral-500 dark:text-neutral-400">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>

                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button className="w-full">
                            <Home className="mr-2 h-4 w-4" />
                            Return Home
                        </Button>
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
