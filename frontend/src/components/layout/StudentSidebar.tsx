"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  PlayCircle,
  User,
  LogOut,
  Activity,
  CreditCard,
  X,
  Menu,
  Sun,
  Moon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Browse Courses", icon: LayoutDashboard },
  { href: "/dashboard/learning", label: "My Learning", icon: PlayCircle },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/payments", label: "Payment History", icon: CreditCard },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const sidebarContent = (
    <>
      <div className="p-5 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 p-2 rounded-xl border border-primary/20">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            LMS<span className="text-primary">Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-[0.875rem] font-medium",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/10"
                    : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] transition-colors shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/40 mt-auto">
        <div className="bg-accent/5 rounded-xl p-3.5 flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-base font-bold text-foreground">
              LMS<span className="text-primary">Pro</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <div
        className={cn(
          "w-[280px] h-screen fixed left-0 top-0 flex flex-col bg-card/95 backdrop-blur-2xl border-r border-border/40 z-50",
          "sidebar-transition",
          // Desktop: always visible
          "lg:translate-x-0",
          // Mobile: slide in/out
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
