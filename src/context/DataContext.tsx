"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { FullDatabase } from "@/types";

const EMPTY_DATABASE: FullDatabase = {
  nurseryMaster: [],
  plantTypes: [],
  janpadMaster: [],
  gramPanchayatMaster: [],
  villageMaster: [],
  beneficiaryCategory: [],
  distributions: {},
};

const DEFAULT_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

type DistributionInput = Record<string, string | number> & { nursery: string };

interface DataContextProps {
  data: FullDatabase;
  isLoading: boolean;
  error: string | null;
  scriptUrl: string;
  syncTime: string | null;
  updateScriptUrl: (url: string) => Promise<boolean>;
  addDistribution: (record: DistributionInput) => Promise<boolean>;
  resetDatabase: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const formatDatabase = (fetchedData: any): FullDatabase => {
  const nurseryMaster = (fetchedData.nurseryMaster || []).map((n: any) => ({
    id: n.id || "",
    name: n.name || "",
    inchargeName: n.inchargeName || n.inchargename || "",
    contactNumber: String(n.contactNumber || n.contactnumber || ""),
    openingStock: n.openingStock !== undefined ? n.openingStock : n.openingstock,
  }));

  const plantTypes = (fetchedData.plantTypes || []).map((p: any) => ({
    id: p.id || "",
    nameEn: p.nameEn || p.nameen || "",
    nameHi: p.nameHi || p.namehi || "",
  }));

  const janpadMaster = (fetchedData.janpadMaster || []).map((j: any) => ({
    id: j.id || "",
    nameEn: j.nameEn || j.nameen || "",
    nameHi: j.nameHi || j.namehi || "",
  }));

  const gramPanchayatMaster = (fetchedData.gramPanchayatMaster || []).map((gp: any) => ({
    id: gp.id || "",
    janpadId: gp.janpadId || gp.janpadid || gp.janpad_id || "",
    nameEn: gp.nameEn || gp.nameen || "",
    nameHi: gp.nameHi || gp.namehi || "",
  }));

  const villageMaster = (fetchedData.villageMaster || []).map((v: any) => ({
    id: v.id || "",
    gpId: v.gpId || v.gpid || v.gp_id || "",
    nameEn: v.nameEn || v.nameen || "",
    nameHi: v.nameHi || v.namehi || "",
  }));

  const beneficiaryCategory = (fetchedData.beneficiaryCategory || []).map((c: any) => ({
    id: c.id || "",
    nameEn: c.nameEn || c.nameen || "",
    nameHi: c.nameHi || c.namehi || "",
  }));

  return {
    nurseryMaster,
    plantTypes,
    janpadMaster,
    gramPanchayatMaster,
    villageMaster,
    beneficiaryCategory,
    distributions: fetchedData.distributions || {},
  };
};

const getConfiguredScriptUrl = () => {
  if (typeof window === "undefined") return DEFAULT_SCRIPT_URL;
  return localStorage.getItem("ddpms_script_url") || DEFAULT_SCRIPT_URL;
};

const buildApiUrl = (baseUrl: string) => {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}api=data&t=${Date.now()}`;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<FullDatabase>(EMPTY_DATABASE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptUrl, setScriptUrl] = useState<string>(DEFAULT_SCRIPT_URL);
  const [syncTime, setSyncTime] = useState<string | null>(null);


  const refreshData = async () => {
    const currentUrl = getConfiguredScriptUrl();
    setScriptUrl(currentUrl);

    if (!currentUrl) {
      setData(EMPTY_DATABASE);
      setError("Google Apps Script URL is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(currentUrl));
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const fetchedData = await response.json();
      if (fetchedData.status === "error") {
        throw new Error(fetchedData.message || "Error returned from Google Sheets");
      }

      const formattedDb = formatDatabase(fetchedData);
      setData(formattedDb);
      localStorage.setItem("ddpms_db", JSON.stringify(formattedDb));

      const currentTimeString = `${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`;
      setSyncTime(currentTimeString);
      localStorage.setItem("ddpms_sync_time", currentTimeString);
    } catch (err) {
      console.error("Google Sheets Fetch Error:", err);
      const savedData = localStorage.getItem("ddpms_db");
      if (savedData) {
        setData(JSON.parse(savedData));
      }
      setError(err instanceof Error ? err.message : "Failed to load Google Sheets database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const configuredUrl = getConfiguredScriptUrl();
    const savedSyncTime = localStorage.getItem("ddpms_sync_time");

    setScriptUrl(configuredUrl);
    if (savedSyncTime) setSyncTime(savedSyncTime);

    refreshData();
  }, []);

  const updateScriptUrl = async (url: string): Promise<boolean> => {
    const cleanUrl = url.trim() || DEFAULT_SCRIPT_URL;
    setScriptUrl(cleanUrl);

    if (url.trim()) {
      localStorage.setItem("ddpms_script_url", cleanUrl);
    } else {
      localStorage.removeItem("ddpms_script_url");
    }

    if (!cleanUrl) {
      setError("Google Apps Script URL is not configured.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(cleanUrl));
      if (!response.ok) throw new Error("Connection failed");

      const fetchedData = await response.json();
      if (fetchedData.status === "error") {
        throw new Error(fetchedData.message || "Error returned from Google Sheets");
      }

      const formattedDb = formatDatabase(fetchedData);
      setData(formattedDb);
      localStorage.setItem("ddpms_db", JSON.stringify(formattedDb));

      const timeStr = `${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`;
      setSyncTime(timeStr);
      localStorage.setItem("ddpms_sync_time", timeStr);
      return true;
    } catch (err) {
      console.error("Google Sheets Connection Error:", err);
      setError("Failed to connect to Google Sheets.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addDistribution = async (record: DistributionInput): Promise<boolean> => {
    const currentUrl = getConfiguredScriptUrl();
    if (!currentUrl) {
      setError("Google Apps Script URL is not configured.");
      return false;
    }

    try {
      const payload = {
        action: "addDistribution",
        data: {
          nursery: record.nursery,
          date: record["वितरण दिनांक"],
          beneficiaryName: record["लाभार्थी का नाम"],
          mobileNumber: record["मोबाइल नंबर"],
          janpad: record["जनपद पंचायत"],
          gramPanchayat: record["ग्राम पंचायत"],
          village: record["ग्राम का नाम"],
          quantity: Number(record["पौधों की संख्या"]),
          plantType: record["पौधों का प्रकार"],
          category: record["प्राप्तकर्ता श्रेणी"],
          distributorName: record["वितरणकर्ता का नाम"],
        },
      };

      const response = await fetch(currentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("HTTP POST failed");
      }

      const resData = await response.json();
      if (resData.status !== "success") {
        throw new Error(resData.message || "Failed saving record");
      }

      await refreshData();
      return true;
    } catch (err) {
      console.error("Add Distribution Error:", err);
      setError(err instanceof Error ? err.message : "Failed saving record");
      return false;
    }
  };

  const resetDatabase = () => {
    localStorage.removeItem("ddpms_script_url");
    localStorage.removeItem("ddpms_db");
    localStorage.removeItem("ddpms_sync_time");
    setScriptUrl(DEFAULT_SCRIPT_URL);
    setData(EMPTY_DATABASE);
    setSyncTime(null);
    refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        data,
        isLoading,
        error,
        scriptUrl,
        syncTime,
        updateScriptUrl,
        addDistribution,
        resetDatabase,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
