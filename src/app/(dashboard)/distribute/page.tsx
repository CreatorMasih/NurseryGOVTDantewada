"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { ClipboardCheck, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function DistributePage() {
  const { data, addDistribution, isLoading: dataLoading } = useData();
  const { t, language } = useLanguage();

  const TODAY_STR = "2026-06-26";

  // Form Fields State
  const [nursery, setNursery] = useState<string>("");
  const [date, setDate] = useState<string>(TODAY_STR);
  const [beneficiaryName, setBeneficiaryName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [janpad, setJanpad] = useState<string>("");
  const [gramPanchayat, setGramPanchayat] = useState<string>("");
  const [village, setVillage] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [plantType, setPlantType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [distributorName, setDistributorName] = useState<string>("");

  // UI Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cascading drop-down calculations
  // Get selected Janpad ID
  const selectedJanpadId = useMemo(() => {
    const matched = data.janpadMaster.find(
      j => j.nameEn === janpad || j.nameHi === janpad
    );
    return matched ? matched.id : "";
  }, [janpad, data.janpadMaster]);

  // Filtered GPs based on selected Janpad
  const filteredGps = useMemo(() => {
    if (!selectedJanpadId) return [];
    return data.gramPanchayatMaster.filter(gp => gp.janpadId === selectedJanpadId);
  }, [selectedJanpadId, data.gramPanchayatMaster]);

  // Get selected GP ID
  const selectedGpId = useMemo(() => {
    const matched = data.gramPanchayatMaster.find(
      gp => gp.nameEn === gramPanchayat || gp.nameHi === gramPanchayat
    );
    return matched ? matched.id : "";
  }, [gramPanchayat, data.gramPanchayatMaster]);

  // Filtered Villages based on selected GP
  const filteredVillages = useMemo(() => {
    if (!selectedGpId) return [];
    return data.villageMaster.filter(v => v.gpId === selectedGpId);
  }, [selectedGpId, data.villageMaster]);

  // Reset GP and Village if Janpad changes
  useEffect(() => {
    setGramPanchayat("");
    setVillage("");
  }, [janpad]);

  // Reset Village if GP changes
  useEffect(() => {
    setVillage("");
  }, [gramPanchayat]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validation checks
    if (
      !nursery ||
      !date ||
      !beneficiaryName.trim() ||
      !mobileNumber.trim() ||
      !janpad ||
      !gramPanchayat ||
      !village ||
      !quantity ||
      !plantType ||
      !category ||
      !distributorName.trim()
    ) {
      setErrorMsg(t("fillAll"));
      return;
    }

    // Validate mobile (10 digits)
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setErrorMsg(language === "en" ? "Mobile number must be exactly 10 digits." : "मोबाइल नंबर ठीक 10 अंकों का होना चाहिए।");
      return;
    }

    // Validate quantity
    const qtyVal = Number(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      setErrorMsg(language === "en" ? "Plant quantity must be a positive number." : "पौधों की संख्या शून्य से अधिक होनी चाहिए।");
      return;
    }

    setIsSubmitting(true);

    const success = await addDistribution({
      nursery,
      "वितरण दिनांक": date,
      "लाभार्थी का नाम": beneficiaryName.trim(),
      "मोबाइल नंबर": mobileNumber.trim(),
      "जनपद पंचायत": janpad,
      "ग्राम पंचायत": gramPanchayat,
      "ग्राम का नाम": village,
      "पौधों की संख्या": qtyVal,
      "पौधों का प्रकार": plantType,
      "प्राप्तकर्ता श्रेणी": category,
      "वितरणकर्ता का नाम": distributorName.trim()
    });

    setIsSubmitting(false);

    if (success) {
      setSuccessMsg(t("formSuccess"));
      // Clear inputs except static ones (like Nursery and Officer name which often repeat)
      setBeneficiaryName("");
      setMobileNumber("");
      setQuantity("");
      setJanpad("");
      setGramPanchayat("");
      setVillage("");
      setPlantType("");
      setCategory("");
    } else {
      setErrorMsg(t("formError"));
    }
  };

  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-primary">{t("distribute")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t("formTitle")}</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        
        {/* Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white flex items-center space-x-2.5">
          <ClipboardCheck className="w-5.5 h-5.5 text-accent" />
          <h3 className="font-bold text-sm uppercase tracking-wider">{t("govermentText")}</h3>
        </div>

        {/* Status Alerts */}
        <div className="px-6 pt-6">
          {successMsg && (
            <div className="flex items-center p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 mr-2.5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
              <AlertCircle className="w-5 h-5 mr-2.5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Nursery Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("selectNursery")} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={nursery}
                onChange={(e) => setNursery(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-white focus:ring-1 focus:ring-primary text-sm font-medium"
              >
                <option value="">-- {t("selectNursery")} --</option>
                {data.nurseryMaster.map(n => (
                  <option key={n.id} value={n.name}>{n.name}</option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("distributionDate")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-white focus:ring-1 focus:ring-primary text-sm font-medium"
              />
            </div>

            {/* Beneficiary Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("beneficiaryName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === "en" ? "Enter beneficiary name" : "लाभार्थी का नाम दर्ज करें"}
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input focus:ring-1 focus:ring-primary text-sm font-medium"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("mobileNumber")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3 py-2.5 rounded-lg border border-input focus:ring-1 focus:ring-primary text-sm font-medium"
              />
            </div>

            {/* Janpad Cascade */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("selectJanpad")} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={janpad}
                onChange={(e) => setJanpad(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-white focus:ring-1 focus:ring-primary text-sm font-medium"
              >
                <option value="">-- {t("selectJanpad")} --</option>
                {data.janpadMaster.map(j => {
                  const val = language === "en" ? j.nameEn : j.nameHi;
                  return <option key={j.id} value={val}>{val}</option>;
                })}
              </select>
            </div>

            {/* GP Cascade */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("selectGp")} <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!janpad}
                value={gramPanchayat}
                onChange={(e) => setGramPanchayat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-white focus:ring-1 focus:ring-primary disabled:bg-muted text-sm font-medium"
              >
                <option value="">-- {t("selectGp")} --</option>
                {filteredGps.map(gp => {
                  const val = language === "en" ? gp.nameEn : gp.nameHi;
                  return <option key={gp.id} value={val}>{val}</option>;
                })}
              </select>
            </div>

            {/* Village Cascade */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("selectVillage")} <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!gramPanchayat}
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-white focus:ring-1 focus:ring-primary disabled:bg-muted text-sm font-medium"
              >
                <option value="">-- {t("selectVillage")} --</option>
                {filteredVillages.map(v => {
                  const val = language === "en" ? v.nameEn : v.nameHi;
                  return <option key={v.id} value={val}>{val}</option>;
                })}
              </select>
            </div>

            {/* Plant Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("plantQuantity")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 250"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input focus:ring-1 focus:ring-primary text-sm font-medium"
              />
            </div>

            {/* Plant Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("plantType")} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={plantType}
                onChange={(e) => setPlantType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-white focus:ring-1 focus:ring-primary text-sm font-medium"
              >
                <option value="">-- {t("plantType")} --</option>
                {data.plantTypes.map(p => {
                  const val = language === "en" ? p.nameEn : p.nameHi;
                  return <option key={p.id} value={val}>{val}</option>;
                })}
              </select>
            </div>

            {/* Beneficiary Category Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("beneficiaryCategory")} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-white focus:ring-1 focus:ring-primary text-sm font-medium"
              >
                <option value="">-- {t("beneficiaryCategory")} --</option>
                {data.beneficiaryCategory.map(c => {
                  const val = language === "en" ? c.nameEn : c.nameHi;
                  return <option key={c.id} value={val}>{val}</option>;
                })}
              </select>
            </div>

            {/* Officer Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("distributorName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === "en" ? "Enter officer name" : "वितरणकर्ता अधिकारी का नाम दर्ज करें"}
                value={distributorName}
                onChange={(e) => setDistributorName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input focus:ring-1 focus:ring-primary text-sm font-medium"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold transition-all shadow-md shadow-primary/10 group cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>{t("submitting")}</span>
                </>
              ) : (
                <>
                  <span>{t("submitForm")}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
