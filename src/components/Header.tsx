"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Menu, RefreshCw, Globe, ShieldCheck } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { isLoading, refreshData, error } = useData();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-4 bg-white border-b border-border shadow-sm gov-pattern">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-primary/20 overflow-hidden">
            <Image
              src="/dantewada-district.png"
              alt="Dantewada District logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-primary md:text-lg">
              {t("title")}
            </h1>
            <p className="text-xs font-semibold text-accent leading-none">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="hidden sm:flex items-center px-3 py-1 text-xs rounded-full border bg-muted/50 border-border">
          {error ? (
            <div className="flex items-center text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse mr-1.5" />
              <span>Sync Error</span>
            </div>
          ) : (
            <div className="flex items-center text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span className="max-w-[150px] truncate">{t("connected")}</span>
            </div>
          )}
        </div>

        <button
          onClick={refreshData}
          disabled={isLoading}
          className={`p-2 rounded-full hover:bg-muted text-muted-foreground transition-all duration-300 ${
            isLoading ? "animate-spin text-primary" : ""
          }`}
          title="Sync Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center px-3 py-1.5 text-xs font-medium rounded-full border border-primary/20 bg-primary/5 hover:bg-primary hover:text-white text-primary transition-all duration-200"
        >
          <Globe className="w-3.5 h-3.5 mr-1.5" />
          <span>{language === "en" ? t("hindi") : t("english")}</span>
        </button>
      </div>
    </header>
  );
};
export default Header;
