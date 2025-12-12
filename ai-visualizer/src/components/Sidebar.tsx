"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShieldAlert, label: "Spam Detection", href: "/spam-detection" },
  { icon: Zap, label: "Upcoming", href: "/upcoming" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 border-r border-white/10 h-screen p-6 flex flex-col glass-panel fixed left-0 top-0 z-50 bg-black/40"
    >
      <div className="mb-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Zap className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600">
          TASL AI POC
        </h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group",
                  isActive
                    ? "text-white bg-white/10 shadow-lg border border-white/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 relative z-10",
                    isActive && "text-blue-400"
                  )}
                />
                <span className="font-medium relative z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="p-4 rounded-xl bg-linear-to-br from-purple-900/50 to-blue-900/50 border border-white/10">
          <h4 className="font-semibold text-sm mb-1">Pro Status</h4>
          <p className="text-xs text-gray-400 mb-3">Model v1.0 running</p>
          <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-blue-400 to-purple-500 w-[85%]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
