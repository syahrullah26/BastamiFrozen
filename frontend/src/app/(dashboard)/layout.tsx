"use client";

import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return Cookies.get("sidebar_collapsed") === "true";
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-back",
    });
    AOS.refresh();
    const handleSidebarChange = () => {
      const currentStatus = Cookies.get("sidebar_collapsed") === "true";
      setIsCollapsed(currentStatus);
      setTimeout(() => {
        AOS.refresh();
      }, 300);
    };
    window.addEventListener("sidebarToggle", handleSidebarChange);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-500">
      <Sidebar />
      <div
        className={`w-full min-h-screen flex flex-col pl-0 transition-all duration-300 layout-content
          ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}
        `}
      >
        <main className="flex-1 w-full pt-16 lg:pt-0">
          <div className="w-full p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
