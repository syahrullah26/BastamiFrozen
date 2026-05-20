"use client";

import React, { useState } from "react";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { AuthService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.login({
        username,
        password,
      });
      toast.success("Login Berhasil");
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login Failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="w-full bg-surface rounded-2xl  backdrop-blur-xl border border-/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-6 sm:p-8"
      data-aos="fade-up"
    >
      <div className="text-center mb-8">
        <Image
          src="/logo.png"
          alt="Logo"
          width={100}
          height={100}
          className="mx-auto"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          Selamat Datang
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Silakan login terlebih dahulu
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative mt-2">
          <input
            type="text"
            id="username"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="peer w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all duration-200 text-sm"
          />
          <label
            htmlFor="username"
            className="absolute left-4 top-3 text-sm font-medium text-muted-foreground transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-brand-dark peer-focus:bg-surface peer-focus:px-1.5 peer-focus:rounded-2xl peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1.5"
          >
            Username
          </label>
        </div>

        <div className="relative mt-2">
          <input
            type="password"
            id="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all duration-200 text-sm"
          />
          <label
            htmlFor="Password"
            className="absolute left-4 top-3 text-sm font-medium text-muted-foreground transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-brand-dark peer-focus:bg-surface peer-focus:px-1.5 peer-focus:rounded-2xl peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1.5"
          >
            password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group w-full py-3 mt-4 rounded-xl bg-primary-brand text-background font-bold text-sm tracking-wide shadow-md hover:bg-brand-dark cursor-pointer active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Authenticating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              LOG IN
              <LogIn className="w-4 h-4 transition-transform duration-300 ease-out transform group-hover:translate-x-1" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
