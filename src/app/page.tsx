"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F5F7F8] to-[#E8F5E9]">
      
      {/* Floating Leaves (SVGs) */}
      <div className="absolute top-1/4 left-1/12 text-primary/15 animate-float-1 pointer-events-none">
        <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,20.06C11.27,22.28 16.27,19.29 18,15C20.89,13.23 23,10 23,10C23,10 19,10 17,8M11,18C10.66,18 10.3,18 10,18C7.5,17 7.5,14 10.5,14C11.83,14 12.83,14.67 13.5,15C13.5,16.66 12.33,18 11,18Z" />
        </svg>
      </div>
      <div className="absolute top-1/3 right-1/10 text-secondary/20 animate-float-2 pointer-events-none">
        <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,20.06C11.27,22.28 16.27,19.29 18,15C20.89,13.23 23,10 23,10C23,10 19,10 17,8M11,18C10.66,18 10.3,18 10,18C7.5,17 7.5,14 10.5,14C11.83,14 12.83,14.67 13.5,15C13.5,16.66 12.33,18 11,18Z" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 left-1/5 text-primary/10 animate-float-3 pointer-events-none">
        <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,20.06C11.27,22.28 16.27,19.29 18,15C20.89,13.23 23,10 23,10C23,10 19,10 17,8M11,18C10.66,18 10.3,18 10,18C7.5,17 7.5,14 10.5,14C11.83,14 12.83,14.67 13.5,15C13.5,16.66 12.33,18 11,18Z" />
        </svg>
      </div>

      {/* Top Banner & Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-primary/10 bg-white/60 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-primary/10 overflow-hidden shadow-sm"><Image src="/dantewada-district.png" alt="Dantewada District logo" width={48} height={48} className="h-12 w-12 object-contain" priority /></div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary leading-none block">
              Forest Department
            </span>
            <span className="text-sm font-semibold text-accent leading-tight">
              Dantewada District, Chhattisgarh
            </span>
          </div>
        </div>

        {/* Language Selection */}
        <button
          onClick={toggleLanguage}
          className="flex items-center px-4 py-2 rounded-full border border-primary/20 bg-white hover:bg-primary hover:text-white text-primary text-sm font-medium transition-all duration-300 shadow-sm"
        >
          <Globe className="w-4 h-4 mr-2" />
          <span>{language === "en" ? t("hindi") : t("english")}</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-4xl mx-auto z-10 space-y-8">
        
        {/* District Emblem Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-primary/20 overflow-hidden"><Image src="/dantewada-district.png" alt="Dantewada District logo" width={128} height={128} className="h-32 w-32 object-contain" priority /></div>
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-accent/25 border border-accent text-amber-950 uppercase tracking-widest">
            Government of Chhattisgarh
          </div>
        </div>

        {/* Title Group */}
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl drop-shadow-sm">
            {language === "en" ? (
              <>
                Dantewada District <br />
                <span className="text-secondary font-bold">Plantation Monitoring System</span>
              </>
            ) : (
              <>
                दंतेवाड़ा जिला <br />
                <span className="text-secondary font-bold">वृक्षारोपण निगरानी प्रणाली</span>
              </>
            )}
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
            {language === "en" 
              ? "Official digital portal of the District Administration, Dantewada. Monitor nursery stocks, record plant distributions, and review plantation progress across the district." 
              : "जिला प्रशासन, दंतेवाड़ा का आधिकारिक डिजिटल पोर्टल। नर्सरी स्टॉक का प्रबंधन, पौधों के वितरण का अभिलेखीकरण एवं जिले में संचालित वृक्षारोपण अभियान की प्रगति की प्रभावी निगरानी हेतु।"}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-all duration-300 shadow-md shadow-primary/20 group hover:translate-y-[-2px]"
          >
            <span>{language === "en" ? "Enter System" : "सिस्टम में प्रवेश करें"}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-primary/10 bg-white/30 backdrop-blur-sm z-10">
        <p className="text-xs text-muted-foreground">
          © 2026 {t("subtitle")}. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}


