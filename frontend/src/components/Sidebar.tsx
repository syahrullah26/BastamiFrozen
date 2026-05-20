"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { menuGroups } from "@/constants/sidebarData";
import Cookies from "js-cookie";
import { AuthService } from "@/services/authService";

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [name, setName] = useState("User");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const savedName = Cookies.get("name");
    const savedRole = Cookies.get("role") as "admin" | "employee";
    setTimeout(() => {
      if (savedName) setName(savedName);
      if (savedRole) setRole(savedRole);
      setIsMounted(true);
    }, 0);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    Cookies.set("sidebar_collapsed", String(nextState), { expires: 365 });
    window.dispatchEvent(new Event("sidebarToggle"));
  };
  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      Cookies.remove("name");
      Cookies.remove("role");
      Cookies.remove("auth_token");
      router.push("/login");
      router.refresh();
      setIsLoading(false);
    }
  };

  const activeRole = isMounted ? role : "employee";

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-dark border-b border-border/10 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold tracking-tight text-white text-sm">
            Bastami Frozen Food
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 bg-brand-dark border-r border-border/10 p-4 flex flex-col z-50 transition-all duration-300 ease-in-out
          lg:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"} 
          w-64 pt-20 lg:pt-4
        `}
      >
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 rounded-full bg-surface border border-border/20 text-foreground items-center justify-center shadow-md hover:bg-surface/90 transition-colors z-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
        <div
          className={`hidden lg:flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-2"} mb-8`}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="w-9 h-9 object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col animate-fadeIn">
              <span className="font-bold tracking-tight leading-none text-white text-sm whitespace-nowrap">
                Bastami Frozen Food
              </span>
              <span className="text-[10px] text-white/60 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-secondary-brand" /> Mode{" "}
                <span className="capitalize">{isMounted ? role : "..."}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {menuGroups.map((group, groupIndex) => {
            const allowedItems = group.items.filter((item) =>
              item.roles.includes(activeRole),
            );
            if (allowedItems.length === 0) return null;

            return (
              <div key={groupIndex} className="space-y-1.5">
                <span
                  className={`block transition-all ${
                    isCollapsed
                      ? "lg:flex lg:justify-center lg:px-0 py-2"
                      : "px-3 text-[10px] font-bold uppercase tracking-widest text-white/40"
                  }`}
                >
                  {isCollapsed ? (
                    <span className="h-0.5 w-6 bg-surface rounded-full opacity-60 inline-block" />
                  ) : (
                    group.groupName
                  )}
                </span>

                <nav className="space-y-0.5">
                  {allowedItems.map((item, itemIndex) => {
                    const IconComponent = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={itemIndex}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        title={isCollapsed ? item.name : undefined}
                        className={`
                          group flex items-center rounded-xl text-sm font-medium transition-all duration-200 py-2.5
                          ${isCollapsed ? "lg:justify-center lg:px-0" : "px-3 gap-3"}
                          ${
                            isActive
                              ? "bg-surface text-foreground shadow-sm font-semibold"
                              : "text-white/80 hover:text-white hover:bg-secondary-brand/20"
                          }
                        `}
                      >
                        <IconComponent
                          className={`
                            w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0
                            ${isActive ? "text-foreground" : "text-white/60 group-hover:text-white"}
                          `}
                        />
                        {!isCollapsed && (
                          <span className="truncate animate-fadeIn">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10 mt-auto space-y-4">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center lg:px-0" : "px-2 gap-3"}`}
          >
            <div className="w-9 h-9 rounded-full bg-surface text-foreground border border-white/10 flex items-center justify-center font-bold text-sm uppercase shadow-inner shrink-0">
              {isMounted ? name.substring(0, 2) : "??"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate animate-fadeIn">
                <span className="text-xs font-semibold text-white truncate">
                  {isMounted ? name : "Loading..."}
                </span>
                <span className="text-[10px] text-white/50 capitalize">
                  {isMounted ? `${role} Account` : "Account"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`flex items-center rounded-xl text-sm font-medium text-red-500 bg-red-500/40 hover:bg-red-500 hover:text-surface cursor-pointer transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed py-2.5 w-full
              ${isCollapsed ? "lg:justify-center lg:px-0" : "px-3 gap-3"}
            `}
          >
            <LogOut
              className={`w-4 h-4 text-red-400 transition-transform duration-200 shrink-0 ${isLoading ? "animate-spin" : "group-hover:translate-x-0.5"}`}
            />
            {!isCollapsed && (
              <span className="animate-fadeIn">
                {isLoading ? "Signing Out..." : "Sign Out"}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
