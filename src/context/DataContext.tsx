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

const formatDatabase = (fetchedData: Partial<FullDatabase>): FullDatabase => ({
  nurseryMaster: fetchedData.nurseryMaster || [],
  plantTypes: fetchedData.plantTypes || [],
  janpadMaster: fetchedData.janpadMaster || [],
  gramPanchayatMaster: fetchedData.gramPanchayatMaster || [],
  villageMaster: fetchedData.villageMaster || [],
  beneficiaryCategory: fetchedData.beneficiaryCategory || [],
  distributions: fetchedData.distributions || {},
});

const getConfiguredScriptUrl = () => {
  if (typeof window === "undefined") return DEFAULT_SCRIPT_URL;
  return localStorage.getItem("ddpms_script_url") || DEFAULT_SCRIPT_URL;
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
      const response = await fetch(`${currentUrl}?t=${Date.now()}`);
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
      const response = await fetch(`${cleanUrl}?t=${Date.now()}`);
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
          date: record["à¤µà¤¿à¤¤à¤°à¤£ à¤¦à¤¿à¤¨à¤¾à¤‚à¤•"],
          beneficiaryName: record["à¤²à¤¾à¤­à¤¾à¤°à¥à¤¥à¥€ à¤•à¤¾ à¤¨à¤¾à¤®"],
          mobileNumber: record["à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤°"],
          janpad: record["à¤œà¤¨à¤ªà¤¦ à¤ªà¤‚à¤šà¤¾à¤¯à¤¤"],
          gramPanchayat: record["à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤"],
          village: record["à¤—à¥à¤°à¤¾à¤® à¤•à¤¾ à¤¨à¤¾à¤®"],
          quantity: Number(record["à¤ªà¥Œà¤§à¥‹à¤‚ à¤•à¥€ à¤¸à¤‚à¤–à¥à¤¯à¤¾"]),
          plantType: record["à¤ªà¥Œà¤§à¥‹à¤‚ à¤•à¤¾ à¤ªà¥à¤°à¤•à¤¾à¤°"],
          category: record["à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤à¤•à¤°à¥à¤¤à¤¾ à¤¶à¥à¤°à¥‡à¤£à¥€"],
          distributorName: record["à¤µà¤¿à¤¤à¤°à¤£à¤•à¤°à¥à¤¤à¤¾ à¤•à¤¾ à¤¨à¤¾à¤®"],
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
