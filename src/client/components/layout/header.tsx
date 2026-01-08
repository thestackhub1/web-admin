// Client-side only — no server secrets or database access here

"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/client/utils";
import { Logo } from "@/client/components/shared/Logo";
import { GlobalSearchDialog } from "@/client/components/shared/global-search-dialog";
import { Bell, Search, Menu, Moon, Sun, User, LogOut, Settings, Command } from "lucide-react";

/**
 * Admin Dashboard Header - Floating Glass Navbar
 * Premium SaaS design aligned with student portal
 */

interface AdminUser {
  name?: string | null;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface DashboardHeaderProps {
  user: AdminUser;
  onMenuClick?: () => void;
  className?: string;
}

export function DashboardHeader({ user, onMenuClick, className }: DashboardHeaderProps) {
  const [isDark, setIsDark] = React.useState<boolean | null>(null);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Initialize theme from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // Keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Close on escape
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    if (!isProfileOpen) return;
    
    const handleClickOutside = () => setIsProfileOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileOpen]);

  return (
    <>
      <header
        className={cn(
          // Floating glass navbar
          "glass-header rounded-2xl",
          "flex h-14 items-center gap-4 px-4",
          "transition-all duration-300",
          className
        )}
      >
        {/* Left: Menu button (mobile) + Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100/60 hover:text-neutral-700 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300 xl:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo - Desktop only */}
          <Link href="/dashboard" className="hidden xl:flex items-center gap-2.5 group">
            <Logo className="h-8 w-8 group-hover:scale-105 transition-transform duration-200" />
            <span className="text-base font-bold text-gradient-logo">
              The Stack Hub
            </span>
          </Link>
        </div>

        {/* Center: Full Search Bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <button
            onClick={() => setIsSearchOpen(true)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-4 py-2.5",
              "bg-neutral-100/80 dark:bg-neutral-800/50",
              "border border-neutral-200/60 dark:border-neutral-700/60",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800/80",
              "hover:border-neutral-300/80 dark:hover:border-neutral-600/80",
              "transition-all duration-200 group cursor-text"
            )}
          >
            <Search className="h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:group-hover:text-neutral-300 transition-colors" />
            <span className="flex-1 text-left text-sm text-neutral-500 dark:text-neutral-400">
              Search users, exams, questions...
            </span>
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                <Command className="h-2.5 w-2.5 mr-0.5" />
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            disabled={isDark === null}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100/60 hover:text-neutral-700 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark === null ? (
              <div className="h-[18px] w-[18px]" />
            ) : isDark ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100/60 hover:text-neutral-700 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-neutral-900" />
          </button>

          {/* Profile dropdown */}
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileOpen(!isProfileOpen);
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-xl p-1.5 pl-3 transition-all",
                "hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60",
                isProfileOpen && "bg-neutral-100/60 dark:bg-neutral-800/60"
              )}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <span className="hidden text-right text-sm leading-tight md:block">
                <div className="flex items-center gap-2">
                  <span className="block font-medium text-neutral-700 dark:text-neutral-200">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  {user.role === "admin" && (
                    <span className="inline-flex items-center rounded-full bg-insight-100 dark:bg-insight-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-insight-600 dark:text-insight-400">
                      Admin
                    </span>
                  )}
                </div>
                <span className="block text-[11px] text-neutral-400 dark:text-neutral-500 capitalize">
                  {user.role}
                </span>
              </span>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-white/80 dark:ring-neutral-800/80"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-insight-600 text-sm font-semibold text-white shadow-sm">
                  {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || "A"}
                </div>
              )}
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div 
                className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl glass-strong p-1.5 shadow-lg animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-1.5 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 p-2.5">
                  <p className="font-medium text-sm text-neutral-900 dark:text-white">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {user.email}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    Settings
                  </Link>
                  <div className="my-1 h-px bg-neutral-200/60 dark:bg-neutral-700/60" />
                  <Link
                    href="/login"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger-600 hover:bg-danger-50/60 dark:text-danger-400 dark:hover:bg-danger-900/20 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
