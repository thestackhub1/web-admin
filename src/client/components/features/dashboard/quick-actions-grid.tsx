"use client";

import Link from "next/link";
import { Plus, BookOpen, GraduationCap, Layers, Sparkles } from "lucide-react";
import { FadeIn, SectionHeader } from "@/client/components/ui";

/**
 * Quick Actions Grid
 * Displays actionable cards for common admin tasks
 */
export function QuickActionsGrid() {
  const actions = [
    {
      href: "/dashboard/questions",
      icon: Plus,
      title: "Add Question",
      description: "Create new question",
      iconContainerClass: "icon-container-primary",
    },
    {
      href: "/dashboard/subjects",
      icon: BookOpen,
      title: "Subjects",
      description: "Manage curriculum",
      iconContainerClass: "icon-container-success",
    },
    {
      href: "/dashboard/class-levels",
      icon: GraduationCap,
      title: "Class Levels",
      description: "Student cohorts",
      iconContainerClass: "icon-container-warning",
    },
    {
      href: "/dashboard/exam-structures",
      icon: Layers,
      title: "Blueprints",
      description: "Exam structures",
      iconContainerClass: "icon-container-insight",
    },
  ];

  return (
    <FadeIn delay={0.2}>
      <div>
        <SectionHeader 
          title="Quick Actions" 
          icon={Sparkles} 
          iconColor="insight"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group">
                <div className="bento-card p-5 h-full flex flex-col items-center text-center space-y-3 transition-all hover:-translate-y-1 hover:shadow-glow-card-hover">
                  <div className={`icon-container ${action.iconContainerClass} rounded-xl p-4 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{action.title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}

