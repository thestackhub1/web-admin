"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/client/utils";
import { Logo } from "@/client/components/shared/Logo";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  ClipboardList,
  BarChart3,
  Settings,
  Layers,
  Calendar,
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from "lucide-react";

export type UserRole = "admin" | "teacher";

interface DashboardSidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  className?: string;
  /** Hide internal header - used when sidebar is in a Dialog with its own header */
  hideHeader?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
  /** Color accent using semantic palette */
  color: "primary" | "success" | "warning" | "insight";
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "primary" },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "insight" },
    ],
  },
  {
    title: "ACADEMIC",
    items: [
      { label: "Class Levels", href: "/dashboard/class-levels", icon: Layers, color: "primary" },
      { label: "Subjects", href: "/dashboard/subjects", icon: BookOpen, color: "success" },
      { label: "Questions", href: "/dashboard/questions", icon: FileQuestion, color: "warning", highlight: true },
      { label: "Exam Structures", href: "/dashboard/exam-structures", icon: ClipboardList, color: "insight" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Scheduled Exams", href: "/dashboard/scheduled-exams", icon: Calendar, color: "warning" },
      { label: "Exam Attempts", href: "/dashboard/exams", icon: GraduationCap, color: "success" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Users", href: "/dashboard/users", icon: Users, roles: ["admin"], color: "primary" },
      { label: "Schools", href: "/dashboard/schools", icon: Building2, roles: ["admin"], color: "insight" },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, color: "primary" },
    ],
  },
];

/** Get pill indicator color based on semantic color */
const getPillColor = (color: string) => {
  switch (color) {
    case "primary": return "bg-primary-500";
    case "success": return "bg-success-500";
    case "warning": return "bg-warning-500";
    case "insight": return "bg-insight-500";
    default: return "bg-primary-500";
  }
};

/** Get active state classes - minimal with subtle background */
const getActiveClasses = (color: string) => {
  switch (color) {
    case "primary":
      return "bg-primary-50/80 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300";
    case "success":
      return "bg-success-50/80 dark:bg-success-900/20 text-success-700 dark:text-success-300";
    case "warning":
      return "bg-warning-50/80 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300";
    case "insight":
      return "bg-insight-50/80 dark:bg-insight-900/20 text-insight-700 dark:text-insight-300";
    default:
      return "bg-primary-50/80 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300";
  }
};

/** Get icon color for active state */
const getIconActiveColor = (color: string) => {
  switch (color) {
    case "primary": return "text-primary-500";
    case "success": return "text-success-500";
    case "warning": return "text-warning-500";
    case "insight": return "text-insight-500";
    default: return "text-primary-500";
  }
};

export function DashboardSidebar({ userRole, isCollapsed, onToggle, onNavigate, className, hideHeader }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col",
        // Minimalist: blend into page, subtle border
        "border-r border-neutral-200/60 bg-white/80 backdrop-blur-xl",
        "dark:border-neutral-800/60 dark:bg-neutral-900/80",
        "transition-all duration-300 ease-out",
        isCollapsed ? "w-20" : "w-64",
        // When used in mobile dialog, make it relative instead of fixed
        hideHeader && "relative h-full border-r-0",
        className
      )}
    >
      {/* Logo Header - Clean, minimal */}
      {!hideHeader && (
        <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-100/80 dark:border-neutral-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group w-full">
            <Logo className="h-8 w-8 group-hover:scale-105 transition-transform duration-200" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-bold text-gradient-logo overflow-hidden whitespace-nowrap"
                >
                  The Stack Hub
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      )}

      {/* Navigation - Clean spacing */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => {
          const filteredItems = group.items.filter(
            (item) => !item.roles || item.roles.includes(userRole)
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500"
                  >
                    {group.title}
                  </motion.h3>
                )}
              </AnimatePresence>

              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? getActiveClasses(item.color)
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/40",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Vertical pill indicator */}
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scaleY: isActive ? 1 : 0.5,
                      }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full",
                        getPillColor(item.color)
                      )}
                    />

                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors duration-200",
                        isActive
                          ? getIconActiveColor(item.color)
                          : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                      )}
                    />

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Highlight badge */}
                    {item.highlight && !isCollapsed && (
                      <span className="ml-auto text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-400">
                        Core
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Admin Role Badge */}
      {userRole === "admin" && (
        <div className={cn("border-t border-neutral-100/80 dark:border-neutral-800/80 p-4", isCollapsed && "px-2")}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-3 relative overflow-hidden",
              "bg-linear-to-br from-insight-50 to-insight-100/50",
              "dark:from-insight-900/20 dark:to-insight-800/10",
              "border border-insight-200/50 dark:border-insight-800/30",
              isCollapsed && "justify-center p-2"
            )}
          >
            <div className={cn("h-5 w-5 rounded-full bg-insight-500 flex items-center justify-center", isCollapsed ? "" : "shrink-0")}>
              <span className="text-[10px] font-bold text-white">A</span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-bold text-insight-700 dark:text-insight-300 leading-none whitespace-nowrap">
                    Admin Access
                  </p>
                  <p className="text-[10px] text-insight-600/70 dark:text-insight-400/70 mt-0.5 whitespace-nowrap">
                    Full permissions
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Collapse Toggle - Minimal (hidden in mobile dialog) */}
      {!hideHeader && (
        <div className="border-t border-neutral-100/80 dark:border-neutral-800/80 p-3">
          <button
            onClick={onToggle}
            className={cn(
              "flex w-full items-center justify-center rounded-lg p-2 text-neutral-400 transition-all duration-200",
              "hover:bg-neutral-100/60 hover:text-neutral-600",
              "dark:hover:bg-neutral-800/40 dark:hover:text-neutral-300"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
