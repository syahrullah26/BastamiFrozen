"use client";

import "@/app/globals.css";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-back",
    });
  }, []);
  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-500 relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-150 max-h-150 bg-brand-dark/10 dark:bg-brand-dark/5 rounded-full blur-[100px] sm:blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-150 max-h-150 bg-brand-dark/10 dark:bg-brand-dark/5 rounded-full blur-[100px] sm:blur-[140px] animate-pulse delay-1000"></div>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]"
          style={{
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, #000 60%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, #000 60%, transparent 100%)",
          }}
        />
      </div>
      <main className="relative z-10 w-full max-w-md mx-auto flex justify-center items-center py-10">
        {children}
      </main>
    </div>
  );
}
