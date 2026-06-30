"use client";

import React, { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Layers, 
  TrendingUp, 
  Sprout, 
  Users, 
  Home, 
  Calendar, 
  Award,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";

// Standard curated color palette for charts
const COLORS = ["#1B5E20", "#2E7D32", "#C9A227", "#E65100", "#006064", "#311B92", "#004D40"];

export default function Dashboard() {
  const { data, isLoading, error } = useData();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Current date (fixed from metadata context: 2026-06-26)
  const TODAY_STR = "2026-06-26";

  // Calculate statistics from dynamic spreadsheet data
  const stats = useMemo(() => {
    let totalStock = 0;
    let totalDistributed = 0;
    let todayDistribution = 0;
    let weeklyDistribution = 0;
    const uniqueBeneficiaries = new Set<string>();

    const nurseryTotals: Record<string, number> = {};

    // 1. Calculate opening stock from Nursery Master
    data.nurseryMaster.forEach(n => {
      totalStock += Number(n.openingStock) || 0;
      nurseryTotals[n.name] = 0; // Initialize
    });

    // Get time boundaries for weekly distribution
    const today = new Date(TODAY_STR);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 2. Iterate through all nursery sheets
    Object.entries(data.distributions).forEach(([nurseryName, records]) => {
      records.forEach(r => {
        const qty = Number(r["पौधों की संख्या"]) || 0;
        totalDistributed += qty;

        // Nursery specific distribution accumulation
        if (nurseryTotals[nurseryName] !== undefined) {
          nurseryTotals[nurseryName] += qty;
        } else {
          nurseryTotals[nurseryName] = qty;
        }

        // Today's distribution check
        const distDateStr = r["वितरण दिनांक"];
        if (distDateStr === TODAY_STR) {
          todayDistribution += qty;
        }

        // Weekly distribution check
        if (distDateStr) {
          const distDate = new Date(distDateStr);
          if (distDate >= sevenDaysAgo && distDate <= today) {
            weeklyDistribution += qty;
          }
        }

        // Unique beneficiaries
        const name = r["लाभार्थी का नाम"] || "";
        const mobile = r["मोबाइल नंबर"] || "";
        if (name) {
          uniqueBeneficiaries.add(`${name.trim()}_${mobile.trim()}`);
        }
      });
    });

    // Calculate total remaining stock by summing remaining stocks of individual nurseries (capped at 0)
    let remainingStock = 0;
    data.nurseryMaster.forEach(n => {
      const records = data.distributions[n.name] || [];
      const dist = records.reduce((sum, r) => sum + (Number(r["पौधों की संख्या"]) || 0), 0);
      remainingStock += Math.max(0, (Number(n.openingStock) || 0) - dist);
    });

    const distRate = totalStock > 0 ? (totalDistributed / totalStock) * 100 : 0;

    // Find top nursery
    let topNurseryName = "-";
    let maxDistQty = 0;
    Object.entries(nurseryTotals).forEach(([name, qty]) => {
      if (qty > maxDistQty) {
        maxDistQty = qty;
        topNurseryName = name;
      }
    });

    return {
      totalStock,
      totalDistributed,
      remainingStock,
      distRate,
      totalBeneficiaries: uniqueBeneficiaries.size,
      totalNurseries: data.nurseryMaster.length,
      todayDistribution,
      weeklyDistribution,
      topNursery: topNurseryName
    };
  }, [data, TODAY_STR]);

  // Chart Data 1: Nursery-wise stock vs distribution
  const nurseryChartData = useMemo(() => {
    return data.nurseryMaster.map(n => {
      const records = data.distributions[n.name] || [];
      const distributed = records.reduce((sum, r) => sum + (Number(r["पौधों की संख्या"]) || 0), 0);
      return {
        name: n.name.replace(" Nursery", ""),
        Stock: Number(n.openingStock) || 0,
        Distributed: distributed
      };
    });
  }, [data]);

  // Chart Data 2: Daily distribution trend (last 10 entries/dates)
  const dailyTrendData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    Object.values(data.distributions).forEach(records => {
      records.forEach(r => {
        const date = r["वितरण दिनांक"];
        if (date) {
          dailyMap[date] = (dailyMap[date] || 0) + (Number(r["पौधों की संख्या"]) || 0);
        }
      });
    });

    return Object.entries(dailyMap)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-10) // Show last 10 active days
      .map(([date, qty]) => ({
        date: date.substring(5), // MM-DD format for clarity
        Quantity: qty
      }));
  }, [data]);

  // Chart Data 3: Janpad wise distribution
  const janpadChartData = useMemo(() => {
    const janpadMap: Record<string, number> = {};
    
    // Initialize janpads
    data.janpadMaster.forEach(j => {
      const key = language === "en" ? j.nameEn : j.nameHi;
      janpadMap[key] = 0;
    });

    Object.values(data.distributions).forEach(records => {
      records.forEach(r => {
        const jName = r["जनपद पंचायत"] || "";
        if (jName) {
          // Find matching Janpad Master to support English/Hindi toggled keys
          const matchedJ = data.janpadMaster.find(
            j => j.nameEn.toLowerCase() === jName.toLowerCase() || j.nameHi === jName
          );
          if (matchedJ) {
            const key = language === "en" ? matchedJ.nameEn : matchedJ.nameHi;
            janpadMap[key] = (janpadMap[key] || 0) + (Number(r["पौधों की संख्या"]) || 0);
          } else {
            janpadMap[jName] = (janpadMap[jName] || 0) + (Number(r["पौधों की संख्या"]) || 0);
          }
        }
      });
    });

    return Object.entries(janpadMap).map(([name, value]) => ({ name, value }));
  }, [data, language]);

  // Chart Data 4: Plant type distribution
  const plantTypeChartData = useMemo(() => {
    const plantMap: Record<string, number> = {};

    Object.values(data.distributions).forEach(records => {
      records.forEach(r => {
        const pt = r["पौधों का प्रकार"] || "";
        if (pt) {
          const matchedPt = data.plantTypes.find(
            p => p.nameEn.toLowerCase() === pt.toLowerCase() || p.nameHi === pt
          );
          if (matchedPt) {
            const key = language === "en" ? matchedPt.nameEn : matchedPt.nameHi;
            plantMap[key] = (plantMap[key] || 0) + (Number(r["पौधों की संख्या"]) || 0);
          } else {
            plantMap[pt] = (plantMap[pt] || 0) + (Number(r["पौधों की संख्या"]) || 0);
          }
        }
      });
    });

    return Object.entries(plantMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data, language]);

  // Chart Data 5: Beneficiary category distribution
  const categoryChartData = useMemo(() => {
    const catMap: Record<string, number> = {};

    Object.values(data.distributions).forEach(records => {
      records.forEach(r => {
        const cat = r["प्राप्तकर्ता श्रेणी"] || "";
        if (cat) {
          const matchedC = data.beneficiaryCategory.find(
            c => c.nameEn.toLowerCase() === cat.toLowerCase() || c.nameHi === cat
          );
          if (matchedC) {
            const key = language === "en" ? matchedC.nameEn : matchedC.nameHi;
            catMap[key] = (catMap[key] || 0) + (Number(r["पौधों की संख्या"]) || 0);
          } else {
            catMap[cat] = (catMap[cat] || 0) + (Number(r["पौधों की संख्या"]) || 0);
          }
        }
      });
    });

    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [data, language]);

  if (isLoading || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  // Dashboard Stats Config
  const statCards = [
    { title: t("totalPlants"), value: stats.totalStock.toLocaleString(), unit: t("plantsUnit"), icon: Layers, color: "bg-emerald-500 text-white" },
    { title: t("distributedPlants"), value: stats.totalDistributed.toLocaleString(), unit: t("plantsUnit"), icon: TrendingUp, color: "bg-green-600 text-white" },
    { title: t("remainingStock"), value: stats.remainingStock.toLocaleString(), unit: t("plantsUnit"), icon: Sprout, color: "bg-amber-600 text-white" },
    { title: t("distributionRate"), value: `${stats.distRate.toFixed(1)}%`, unit: "", icon: ArrowUpRight, color: "bg-primary text-white" },
    { title: t("totalBeneficiaries"), value: stats.totalBeneficiaries.toLocaleString(), unit: t("beneficiariesUnit"), icon: Users, color: "bg-teal-600 text-white" },
    { title: t("totalNurseries"), value: stats.totalNurseries.toLocaleString(), unit: t("callIncharge"), icon: Home, color: "bg-indigo-600 text-white" },
    { title: t("todayDistribution"), value: stats.todayDistribution.toLocaleString(), unit: t("plantsUnit"), icon: Calendar, color: "bg-sky-600 text-white" },
    { title: t("weeklyDistribution"), value: stats.weeklyDistribution.toLocaleString(), unit: t("plantsUnit"), icon: Calendar, color: "bg-violet-600 text-white" },
    { title: t("topNursery"), value: stats.topNursery, unit: "", icon: Award, color: "bg-accent text-white" },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-primary">{t("dashboard")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time statistics loaded dynamically from Google Sheets.</p>
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className="bg-white p-5 rounded-xl border border-border/40 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200 group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.title}</p>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl md:text-2xl font-extrabold text-foreground">{card.value}</span>
                  {card.unit && <span className="text-xs text-muted-foreground font-medium">{card.unit}</span>}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${card.color} shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Nursery Stock vs Distributed */}
        <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary border-b border-border pb-2 uppercase tracking-wide">
            {t("nurseryStockTrend")}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nurseryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Stock" fill="#C9A227" name={t("stockLabel")} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Distributed" fill="#1B5E20" name={t("distributedLabel")} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Distribution Trend */}
        <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary border-b border-border pb-2 uppercase tracking-wide">
            {t("dailyTrend")}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="Quantity" stroke="#1B5E20" fillOpacity={1} fill="url(#colorQty)" strokeWidth={2} name={t("plantsUnit")} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Janpad wise distribution */}
        <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary border-b border-border pb-2 uppercase tracking-wide">
            {t("distributionByJanpad")}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={janpadChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]} name={t("plantsUnit")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plant Type Wise Donuts */}
        <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary border-b border-border pb-2 uppercase tracking-wide">
            {t("distributionByPlantType")}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plantTypeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {plantTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
