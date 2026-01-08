"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Activity, TrendingUp } from "lucide-react";
import { FadeIn } from "@/client/components/ui";

interface DashboardHeroProps {
  activeScheduledExams: number;
  activeStudents: number;
  passRate: number;
  averageScore: number;
}

/**
 * Dashboard Hero Section
 * Premium gradient hero with quick stats
 */
export function DashboardHero({
  activeScheduledExams,
  activeStudents,
  passRate,
  averageScore,
}: DashboardHeroProps) {
  return (
    <FadeIn delay={0}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-insight-700 p-8 lg:p-10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-insight-400 blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/90 border border-white/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Stack Hub Admin Portal</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            
            <p className="text-white/80 text-base lg:text-lg max-w-lg">
              You have <span className="font-semibold text-white">{activeScheduledExams} active exams</span> running and <span className="font-semibold text-success-300">{activeStudents} students</span> engaged today.
            </p>
          </div>
          
          {/* Quick Stats Mini Cards */}
          <div className="flex gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 min-w-[120px]">
              <Activity className="h-5 w-5 text-success-300 mb-2" />
              <p className="text-2xl font-bold text-white">{passRate}%</p>
              <p className="text-xs text-white/70">Pass Rate</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 min-w-[120px]">
              <TrendingUp className="h-5 w-5 text-warning-300 mb-2" />
              <p className="text-2xl font-bold text-white">{averageScore}%</p>
              <p className="text-xs text-white/70">Avg Score</p>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

