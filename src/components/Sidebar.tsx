"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { 
  LayoutDashboard, 
  Sprout, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();

  const menuItems = [
    { name: t("dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("nurseries"), path: "/nurseries", icon: Sprout },
    { name: t("distribute"), path: "/distribute", icon: ClipboardCheck },
    { name: t("reports"), path: "/reports", icon: BarChart3 },
    { name: t("settings"), path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("ddpms_auth");
    router.push("/");
  };

  return (
    <aside 
      className={`fixed top-16 bottom-0 left-0 z-30 flex flex-col bg-white border-r border-border transition-transform duration-300 ${
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
      } md:relative md:top-0 md:translate-x-0 md:h-[calc(100vh-4rem)] ${
        isOpen ? "md:w-64" : "md:w-16"
      }`}
    >
      {/* Sidebar Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                }
              }}
              className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-primary"}`} />
              <span className={`ml-3 transition-opacity duration-300 ${isOpen ? "opacity-100 block" : "opacity-0 hidden"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Trigger (Desktop Only) */}
      <div className="hidden md:flex justify-end p-2 border-t border-border">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-muted hover:bg-border text-muted-foreground transition-colors"
          title={isOpen ? "Collapse Menu" : "Expand Menu"}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-border bg-muted/30">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors group"
        >
          <LogOut className="w-5 h-5 shrink-0 text-red-500 group-hover:text-red-700" />
          <span className={`ml-3 transition-opacity duration-300 ${isOpen ? "opacity-100 block" : "opacity-0 hidden"}`}>
            {t("logout")}
          </span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;

