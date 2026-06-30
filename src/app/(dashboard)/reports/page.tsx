"use client";

import React, { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { Search, Download, ChevronLeft, ChevronRight, Filter, Calendar, ShieldAlert } from "lucide-react";

export default function ReportsPage() {
  const { data, isLoading, error } = useData();
  const { t, language } = useLanguage();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [nurseryFilter, setNurseryFilter] = useState<string>("");
  const [janpadFilter, setJanpadFilter] = useState<string>("");
  const [plantTypeFilter, setPlantTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Sorting State
  const [sortField, setSortField] = useState<string>("वितरण दिनांक");
  const [sortAsc, setSortAsc] = useState<boolean>(false); // Default latest first

  // Aggregated data: flatten all nursery distribution sheets
  const flattenedDistributions = useMemo(() => {
    const list: Array<any> = [];
    Object.entries(data.distributions).forEach(([nurseryName, records]) => {
      records.forEach(r => {
        list.push({
          ...r,
          nurseryName // Attach nursery context
        });
      });
    });
    return list;
  }, [data]);

  // Apply search, filters, sorting
  const processedRecords = useMemo(() => {
    let list = [...flattenedDistributions];

    // 1. Text Search
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim();
      list = list.filter(r => 
        (r["लाभार्थी का नाम"] && r["लाभार्थी का नाम"].toLowerCase().includes(s)) ||
        (r["मोबाइल नंबर"] && r["मोबाइल नंबर"].includes(s)) ||
        (r["ग्राम का नाम"] && r["ग्राम का नाम"].toLowerCase().includes(s)) ||
        (r["वितरणकर्ता का नाम"] && r["वितरणकर्ता का नाम"].toLowerCase().includes(s))
      );
    }

    // 2. Nursery Filter
    if (nurseryFilter) {
      list = list.filter(r => r.nurseryName === nurseryFilter);
    }

    // 3. Janpad Filter
    if (janpadFilter) {
      list = list.filter(r => r["जनपद पंचायत"] === janpadFilter);
    }

    // 4. Plant Type Filter
    if (plantTypeFilter) {
      list = list.filter(r => r["पौधों का प्रकार"] === plantTypeFilter);
    }

    // 5. Category Filter
    if (categoryFilter) {
      list = list.filter(r => r["प्राप्तकर्ता श्रेणी"] === categoryFilter);
    }

    // 6. Date Range Filters
    if (startDate) {
      list = list.filter(r => r["वितरण दिनांक"] >= startDate);
    }
    if (endDate) {
      list = list.filter(r => r["वितरण दिनांक"] <= endDate);
    }

    // 7. Sorting
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle numbers
      if (sortField === "पौधों की संख्या" || sortField === "क्रमांक") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
        return sortAsc ? aVal - bVal : bVal - aVal;
      }

      // Handle dates
      if (sortField === "वितरण दिनांक") {
        const aTime = aVal ? new Date(aVal).getTime() : 0;
        const bTime = bVal ? new Date(bVal).getTime() : 0;
        return sortAsc ? aTime - bTime : bTime - aTime;
      }

      // Default string sort
      aVal = (aVal || "").toString().toLowerCase();
      bVal = (bVal || "").toString().toLowerCase();
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [flattenedDistributions, searchTerm, nurseryFilter, janpadFilter, plantTypeFilter, categoryFilter, startDate, endDate, sortField, sortAsc]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [processedRecords, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedRecords.length / rowsPerPage) || 1;

  // Handle Export to CSV
  const handleExportCSV = () => {
    // English Headers for CSV compatibility
    const headers = [
      "S.No.",
      "Distribution Date",
      "Nursery",
      "Beneficiary Name",
      "Mobile Number",
      "Janpad Panchayat",
      "Gram Panchayat",
      "Village",
      "Plant Quantity",
      "Plant Type",
      "Category",
      "Distributor Officer"
    ];

    const csvRows = [headers.join(",")];

    processedRecords.forEach((r, idx) => {
      const row = [
        idx + 1,
        `"${r["वितरण दिनांक"] || ""}"`,
        `"${r.nurseryName || ""}"`,
        `"${r["लाभार्थी का नाम"] || ""}"`,
        `"${r["मोबाइल नंबर"] || ""}"`,
        `"${r["जनपद पंचायत"] || ""}"`,
        `"${r["ग्राम पंचायत"] || ""}"`,
        `"${r["ग्राम का नाम"] || ""}"`,
        r["पौधों की संख्या"] || 0,
        `"${r["पौधों का प्रकार"] || ""}"`,
        `"${r["प्राप्तकर्ता श्रेणी"] || ""}"`,
        `"${r["वितरणकर्ता का नाम"] || ""}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ddpms_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setNurseryFilter("");
    setJanpadFilter("");
    setPlantTypeFilter("");
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">{t("reports")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("reportsTitle")}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 mr-2" />
          <span>{t("exportCsv")}</span>
        </button>
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

      {/* Advanced Filters Panel */}
      <div className="bg-white p-5 rounded-xl border border-border/40 shadow-sm space-y-4">
        
        {/* Search & Reset */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input focus:ring-1 focus:ring-primary text-sm font-medium"
            />
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-bold text-muted-foreground uppercase transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        {/* Dropdowns Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Nursery Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("selectNursery")}</label>
            <select
              value={nurseryFilter}
              onChange={(e) => { setNurseryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2 py-1.5 rounded-lg border border-input bg-white text-xs font-semibold"
            >
              <option value="">{t("filterNursery")}</option>
              {data.nurseryMaster.map(n => (
                <option key={n.id} value={n.name}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Janpad Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("selectJanpad")}</label>
            <select
              value={janpadFilter}
              onChange={(e) => { setJanpadFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2 py-1.5 rounded-lg border border-input bg-white text-xs font-semibold"
            >
              <option value="">{t("filterJanpad")}</option>
              {data.janpadMaster.map(j => {
                const val = language === "en" ? j.nameEn : j.nameHi;
                return <option key={j.id} value={val}>{val}</option>;
              })}
            </select>
          </div>

          {/* Plant Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("plantType")}</label>
            <select
              value={plantTypeFilter}
              onChange={(e) => { setPlantTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2 py-1.5 rounded-lg border border-input bg-white text-xs font-semibold"
            >
              <option value="">{t("filterPlantType")}</option>
              {data.plantTypes.map(p => {
                const val = language === "en" ? p.nameEn : p.nameHi;
                return <option key={p.id} value={val}>{val}</option>;
              })}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("beneficiaryCategory")}</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2 py-1.5 rounded-lg border border-input bg-white text-xs font-semibold"
            >
              <option value="">{t("filterCategory")}</option>
              {data.beneficiaryCategory.map(c => {
                const val = language === "en" ? c.nameEn : c.nameHi;
                return <option key={c.id} value={val}>{val}</option>;
              })}
            </select>
          </div>

        </div>

        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/40">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase">{t("dateRange")}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1 rounded-lg border border-input focus:ring-1 focus:ring-primary text-xs"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1 rounded-lg border border-input focus:ring-1 focus:ring-primary text-xs"
            />
          </div>
        </div>

      </div>

      {/* Reports Table Card */}
      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-border">
          {paginatedRecords.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-muted-foreground">{t("noRecords")}</div>
          ) : (
            paginatedRecords.map((r, idx) => (
              <div key={idx} className="p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-border pb-1.5">
                  <span className="font-bold text-primary">S.No. {(currentPage - 1) * rowsPerPage + idx + 1}</span>
                  <span className="font-semibold text-muted-foreground">{r["वितरण दिनांक"]}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 font-medium">
                  <div>
                    <span className="text-muted-foreground block">Beneficiary:</span>
                    <span className="font-bold text-foreground">{r["लाभार्थी का नाम"]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Nursery:</span>
                    <span>{r.nurseryName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Mobile:</span>
                    <span>{r["मोबाइल नंबर"]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Quantity:</span>
                    <span className="font-bold text-secondary">{r["पौधों की संख्या"]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Plant Type:</span>
                    <span>{r["पौधों का प्रकार"]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Officer:</span>
                    <span>{r["वितरणकर्ता का नाम"]}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-4 w-[60px]">{t("sNo")}</th>
                <th 
                  className="px-4 py-4 cursor-pointer hover:bg-muted/20 hover:text-primary transition-all select-none"
                  onClick={() => handleSort("वितरण दिनांक")}
                >
                  Date {sortField === "वितरण दिनांक" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th className="px-4 py-4">{t("selectNursery")}</th>
                <th className="px-4 py-4">{t("beneficiaryName")}</th>
                <th className="px-4 py-4">{t("mobileNumber")}</th>
                <th className="px-4 py-4">Janpad / GP / Village</th>
                <th 
                  className="px-4 py-4 text-right cursor-pointer hover:bg-muted/20 hover:text-primary transition-all select-none"
                  onClick={() => handleSort("पौधों की संख्या")}
                >
                  Qty {sortField === "पौधों की संख्या" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th className="px-4 py-4">{t("plantType")}</th>
                <th className="px-4 py-4">{t("beneficiaryCategory")}</th>
                <th className="px-4 py-4">{t("distributorName")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold text-foreground/80">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm font-semibold text-muted-foreground">
                    {t("noRecords")}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-primary text-center">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3.5 font-mono whitespace-nowrap">{r["वितरण दिनांक"]}</td>
                    <td className="px-4 py-3.5 text-primary">{r.nurseryName}</td>
                    <td className="px-4 py-3.5 font-bold text-foreground">{r["लाभार्थी का नाम"]}</td>
                    <td className="px-4 py-3.5 font-mono">{r["मोबाइल नंबर"]}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">{r["जनपद पंचायत"]}</div>
                      <div className="text-[10px] text-muted-foreground">{r["ग्राम पंचायत"]} &gt; {r["ग्राम का नाम"]}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-secondary">
                      {Number(r["पौधों की संख्या"]).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-muted border border-border">
                        {r["पौधों का प्रकार"]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">{r["प्राप्तकर्ता श्रेणी"]}</td>
                    <td className="px-4 py-3.5 text-[10px] truncate max-w-[120px]">{r["वितरणकर्ता का नाम"]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-1.5 py-0.5 rounded border border-border bg-white text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="hidden sm:inline">| Total: {processedRecords.length} records</span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="text-muted-foreground">
              {t("pageOf").replace("{page}", currentPage.toString()).replace("{totalPages}", totalPages.toString())}
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1 rounded border border-border bg-white text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1 rounded border border-border bg-white text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
