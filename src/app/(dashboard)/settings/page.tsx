"use client";

import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { Settings, Link2, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { 
    scriptUrl, 
    updateScriptUrl,
syncTime,
resetDatabase
} = useData();
  const { t } = useLanguage();

  const [inputUrl, setInputUrl] = useState<string>(scriptUrl);
  const [testing, setTesting] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string | null }>({ type: null, msg: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, msg: null });
    setTesting(true);

    const success = await updateScriptUrl(inputUrl);
    setTesting(false);

    if (success) {
      setStatus({
        type: "success",
        msg: t("connectionSuccess")
      });
    } else {
      setStatus({
        type: "error",
        msg: t("connectionFailed")
      });
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the database and connection URL? This will reload the default Google Sheets connection.")) {
      resetDatabase();
      setInputUrl(scriptUrl);
      setStatus({
        type: "success",
        msg: t("resetSuccess")
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-primary">{t("settings")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t("settingsTitle")}</p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Database Settings</h3>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Status Message */}
          {status.msg && (
            <div className={`flex items-center p-4 rounded-xl text-sm font-medium ${
              status.type === "success" 
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {status.type === "success" 
                ? <CheckCircle2 className="w-5 h-5 mr-2.5 shrink-0 text-emerald-600" />
                : <AlertCircle className="w-5 h-5 mr-2.5 shrink-0 text-red-600" />
              }
              <span>{status.msg}</span>
            </div>
          )}

          {/* Sync status metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/30 text-xs">
            <div>
              <span className="text-muted-foreground block uppercase font-bold tracking-wider">Connection Mode:</span>
              <span className={`text-sm font-bold mt-0.5 inline-block text-emerald-700`}>
                Live Google Sheets Database
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block uppercase font-bold tracking-wider">{t("lastSync")}:</span>
              <span className="text-sm font-semibold mt-0.5 inline-block text-foreground/80">
                {syncTime || "Never"}
              </span>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center">
              <Link2 className="w-4 h-4 mr-1.5 text-primary" />
              <span>{t("scriptUrlLabel")}</span>
            </label>
            <input
              type="url"
              placeholder={t("scriptUrlPlaceholder")}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input focus:ring-1 focus:ring-primary text-sm font-medium"
            />
            <p className="text-[10px] text-muted-foreground">
              Provide the Web App URL retrieved from Google Apps Script deployment to access direct spreadsheet reads/writes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3 justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-xs font-bold uppercase transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Reload Default Sheet</span>
            </button>

            <button
              type="submit"
              disabled={testing}
              className="flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>{t("saveUrl")}</span>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Guide Card */}
      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{t("scriptInstructions")}</h3>
        </div>

        <div className="p-6 space-y-4 text-xs font-semibold text-muted-foreground leading-relaxed">
          <p>{t("instructionStep1")}</p>
          <p>{t("instructionStep2")}</p>
          <p>{t("instructionStep3")}</p>
          <p>{t("instructionStep4")}</p>
          
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 mt-4 text-[10px] leading-relaxed">
            <p className="font-bold text-foreground mb-1">Spreadsheet Master Tabs Required:</p>
            <ul className="list-disc pl-4 space-y-0.5 font-mono text-foreground/80">
              <li>Nursery_Master</li>
              <li>Plant_Types</li>
              <li>Janpad_Master</li>
              <li>GramPanchayat_Master</li>
              <li>Village_Master</li>
              <li>Beneficiary_Category</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


