"use client";

import React, { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { Phone, Users, ShieldAlert, CheckCircle2, ChevronRight, Home, TreePine } from "lucide-react";

export default function NurseriesPage() {
  const { data, isLoading, error } = useData();
  const { t, language } = useLanguage();

  const nurseriesData = useMemo(() => {
    return data.nurseryMaster.map(n => {
      const records = data.distributions[n.name] || [];
      const distributed = records.reduce((sum, r) => sum + (Number(r["पौधों की संख्या"]) || 0), 0);
      const remaining = Math.max(0, (Number(n.openingStock) || 0) - distributed);
      const percentage = (Number(n.openingStock) || 0) > 0 
        ? (distributed / (Number(n.openingStock) || 0)) * 100 
        : 0;

      return {
        ...n,
        distributed,
        remaining,
        percentage
      };
    });
  }, [data]);

  // Aggregate stats
  const totalStock = useMemo(() => nurseriesData.reduce((s, n) => s + (Number(n.openingStock) || 0), 0), [nurseriesData]);
  const totalDistributed = useMemo(() => nurseriesData.reduce((s, n) => s + n.distributed, 0), [nurseriesData]);
  const totalRemaining = useMemo(() => nurseriesData.reduce((s, n) => s + n.remaining, 0), [nurseriesData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-primary">{t("nurseries")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t("nurseryMasterList")}</p>
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-800 text-sm font-medium shadow-sm">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-xs text-red-950">Database Connection Failed</h4>
            <p className="opacity-90">{error}</p>
            <p className="text-xs opacity-75 mt-1 font-semibold">
              The system is displaying offline cached data. Please verify your Google Apps Script URL in the System Settings.
            </p>
          </div>
        </div>
      )}

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("totalPlants")}</p>
          <p className="text-2xl font-extrabold text-primary">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("distributedPlants")}</p>
          <p className="text-2xl font-extrabold text-secondary">{totalDistributed.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("remainingStock")}</p>
          <p className="text-2xl font-extrabold text-amber-600">{totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Nurseries Detail Card Deck (Mobile Responsive Cards & Desktop Table) */}
      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{t("nurseryTableTitle")}</h3>
        </div>

        {/* Mobile Layout: Stacked Card list */}
        <div className="md:hidden divide-y divide-border">
          {nurseriesData.map((n) => (
            <div key={n.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-primary flex items-center">
                  <TreePine className="w-4.5 h-4.5 mr-1.5 text-secondary shrink-0" />
                  <span>{n.name}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {n.percentage.toFixed(0)}% Dist.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <div>
                  <span className="text-muted-foreground block">Incharge:</span>
                  <span>{n.inchargeName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Contact:</span>
                  <a href={`tel:${n.contactNumber}`} className="text-primary hover:underline flex items-center mt-0.5">
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    <span>{n.contactNumber}</span>
                  </a>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, n.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Stock: {Number(n.openingStock).toLocaleString()}</span>
                  <span>Rem: {n.remaining.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">{t("nurseryName")}</th>
                <th className="px-6 py-4">{t("incharge")}</th>
                <th className="px-6 py-4">{t("contact")}</th>
                <th className="px-6 py-4 text-right">{t("openStock")}</th>
                <th className="px-6 py-4 text-right">{t("distributedPlants")}</th>
                <th className="px-6 py-4 text-right">{t("remainingStock")}</th>
                <th className="px-6 py-4 text-center w-[160px]">{t("distPercent")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-medium">
              {nurseriesData.map((n) => (
                <tr key={n.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 text-primary font-semibold flex items-center">
                    <TreePine className="w-4 h-4 mr-2 text-secondary" />
                    {n.name}
                  </td>
                  <td className="px-6 py-4 text-foreground/80">{n.inchargeName}</td>
                  <td className="px-6 py-4">
                    <a 
                      href={`tel:${n.contactNumber}`} 
                      className="inline-flex items-center text-primary hover:text-primary-hover hover:underline transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      {n.contactNumber}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">{Number(n.openingStock).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono text-secondary">{n.distributed.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono text-amber-600">{n.remaining.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>{n.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, n.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
