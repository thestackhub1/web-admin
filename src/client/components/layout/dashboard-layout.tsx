// Client-side only — no server secrets or database access here

"use client";

import { DashboardSidebar, type UserRole } from '@/client/components/layout/sidebar';
import { DashboardHeader } from '@/client/components/layout/header';
import { Logo } from '@/client/components/shared/Logo';
import { IconButton } from '@/client/components/ui/icon-button';
import { cn } from '@/client/utils';
import { X } from "lucide-react";
import { CloseButton, Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Link from "next/link";
import { createContext, useContext, useState, type ReactNode } from "react";

interface DashboardContextType {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    avatarUrl?: string | null;
  } | null;
}

export const DashboardContext = createContext<DashboardContextType>({
  user: null,
});

export function useDashboard() {
  return useContext(DashboardContext);
}

interface DashboardLayoutClientProps {
  children: ReactNode;
  user: DashboardContextType["user"];
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <DashboardContext.Provider value={{ user }}>
      <div className="relative flex min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.1),transparent)]" />
        
        {/* Desktop Sidebar */}
        <div className="hidden xl:block">
          <DashboardSidebar 
            userRole={user.role}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar */}
        <Dialog
          open={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          className="xl:hidden"
        >
          <DialogBackdrop className="fixed inset-0 z-30 bg-neutral-950/25 backdrop-blur-sm" />
          <DialogPanel className="fixed inset-y-0 left-0 z-40 w-72 max-w-[calc(100%-3rem)] bg-white/95 backdrop-blur-xl dark:bg-neutral-900/95">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200/80 px-4 dark:border-neutral-800/80">
              <Link
                href="/dashboard"
                className="flex items-center gap-x-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Logo className="h-6 fill-neutral-950 dark:fill-white" />
                <span className="font-semibold text-neutral-950 dark:text-white">The Stack Hub</span>
              </Link>
              <CloseButton as={IconButton}>
                <X className="h-4 w-4 stroke-neutral-950 dark:stroke-white" />
              </CloseButton>
            </div>
            <DashboardSidebar 
              userRole={user.role}
              isCollapsed={false}
              onToggle={() => {}}
              onNavigate={() => setIsMobileMenuOpen(false)}
              hideHeader
            />
          </DialogPanel>
        </Dialog>

        {/* Main Content Area */}
        <div 
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-out",
            isSidebarCollapsed ? "xl:pl-20" : "xl:pl-64"
          )}
        >
          {/* Floating Header Container */}
          <div className="sticky top-0 z-30 px-4 pt-4 md:px-6">
            <DashboardHeader
              user={{ email: user.email, name: user.name, role: user.role }}
              onMenuClick={() => setIsMobileMenuOpen(true)}
            />
          </div>
          
          {/* Content with proper padding */}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
