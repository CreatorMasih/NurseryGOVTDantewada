"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, User, Globe, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();
  
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Redirect if already logged in
  useEffect(() => {
    const isAuth = localStorage.getItem("ddpms_auth") === "true";
    if (isAuth) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulated network delay
    setTimeout(() => {
      // Validate credentials (admin / forest@dantewada)
      if (username.trim().toLowerCase() === "admin" && password === "forest@dantewada") {
        localStorage.setItem("ddpms_auth", "true");
        router.push("/dashboard");
      } else {
        setError(t("loginError"));
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#E8F5E9] via-[#F5F7F8] to-[#FFF9C4]">
      {/* Header bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-primary/10 bg-white/60 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Image src="/dantewada-district.png" alt="Dantewada District logo" width={32} height={32} className="h-8 w-8 object-contain" priority />
          <span className="text-sm font-bold text-primary">{t("subtitle")}</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center px-3 py-1.5 rounded-full border border-primary/20 bg-white text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 mr-1.5" />
          <span>{language === "en" ? t("hindi") : t("english")}</span>
        </button>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-primary/10 overflow-hidden">
          
          {/* Top Title Banner */}
          <div className="px-6 py-8 bg-primary text-white text-center relative gov-pattern">
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 border border-white/20 overflow-hidden"><Image src="/dantewada-district.png" alt="Dantewada District logo" width={80} height={80} className="h-20 w-20 object-contain" priority /></div>
              <h2 className="text-xl font-bold">{t("loginTitle")}</h2>
              <p className="text-xs text-white/80 mt-1">{t("loginSubtitle")}</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            {error && (
              <div className="flex items-center p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle className="w-4.5 h-4.5 mr-2 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                {t("username")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-[#FBFDFB] focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                {t("password")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-[#FBFDFB] focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold transition-all shadow-md shadow-primary/10"
            >
              {isLoading ? t("authenticating") : t("loginButton")}
            </button>

            {/* Demo Credentials Box */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs">
              <p className="font-bold flex items-center text-amber-950 mb-1">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-accent" />
                <span>Demo Credentials:</span>
              </p>
              <p className="font-mono mt-0.5">Username: <span className="font-bold">admin</span></p>
              <p className="font-mono">Password: <span className="font-bold">forest@dantewada</span></p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-primary/5 bg-white/20">
        <p className="text-xs text-muted-foreground">
          © 2026 {t("subtitle")}. Secured Portal.
        </p>
      </footer>
    </div>
  );
}


