"use client";

import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";

const subscribeSidebar = (callback: () => void) => {
  window.addEventListener("sidebarToggle", callback);
  return () => window.removeEventListener("sidebarToggle", callback);
};
const getSnapshot = () => Cookies.get("sidebar_collapsed") === "true";
const getServerSnapshot = () => false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = React.useSyncExternalStore(
    subscribeSidebar,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-back",
    });
    AOS.refresh();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 300);
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-ghost-white text-foreground flex transition-colors duration-500">
      <Sidebar />
      <div
        className={`w-full min-h-screen flex flex-col pl-0 transition-all duration-300 layout-content ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <main className="flex-1 w-full pt-16 lg:pt-0">
          <div className="w-full p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
