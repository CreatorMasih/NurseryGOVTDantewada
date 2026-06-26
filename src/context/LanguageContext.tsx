"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  en: {
    // Header & Navigation
    title: "Dantewada Plantation Monitoring",
    subtitle: "Forest Department, Dantewada District",
    dashboard: "Dashboard",
    nurseries: "Nursery Management",
    distribute: "Distribution Entry",
    reports: "Reports & Analytics",
    settings: "System Settings",
    logout: "Log Out",
    loginTitle: "DDPMS Officer Portal",
    loginSubtitle: "Government of Chhattisgarh | Forest Department",
    username: "Officer Username",
    password: "Password",
    loginButton: "Secure Login",
    loginError: "Invalid username or password.",
    authenticating: "Verifying credentials...",
    connected: "Google Sheets Connected",
    lastSync: "Last Sync",

    // Dashboard Cards
    totalPlants: "Total Opening Stock",
    distributedPlants: "Total Distributed",
    remainingStock: "Remaining Stock",
    distributionRate: "Distribution Rate",
    totalBeneficiaries: "Total Beneficiaries",
    totalNurseries: "Total Nurseries",
    todayDistribution: "Today's Distribution",
    weeklyDistribution: "Weekly Distribution",
    topNursery: "Top Nursery",
    plantsUnit: "Plants",
    beneficiariesUnit: "People",

    // Dashboard Charts
    nurseryStockTrend: "Nursery Stock vs Distribution",
    distributionByJanpad: "Distribution by Janpad Panchayat",
    distributionByPlantType: "Distribution by Plant Type",
    dailyTrend: "Daily Distribution Trend",
    categoryShare: "Beneficiary Category Distribution",
    stockLabel: "Opening Stock",
    distributedLabel: "Distributed",

    // Nursery Management
    nurseryTableTitle: "Nursery Overview",
    nurseryName: "Nursery Name",
    incharge: "Nursery Incharge",
    contact: "Contact Number",
    openStock: "Opening Stock",
    distPercent: "Dist. %",
    callIncharge: "Call Incharge",
    nurseryMasterList: "Master Nursery Stock List",

    // Distribution Form
    formTitle: "New Plantation Distribution Entry",
    selectNursery: "Select Nursery",
    distributionDate: "Distribution Date",
    beneficiaryName: "Beneficiary Name",
    mobileNumber: "Mobile Number (10 digits)",
    selectJanpad: "Select Janpad Panchayat",
    selectGp: "Select Gram Panchayat",
    selectVillage: "Select Village",
    plantQuantity: "Plant Quantity",
    plantType: "Plant Type",
    beneficiaryCategory: "Beneficiary Category",
    distributorName: "Distributor Officer Name",
    submitForm: "Submit Distribution Entry",
    submitting: "Submitting to Google Sheets...",
    formSuccess: "Distribution entry saved successfully!",
    formError: "Error saving distribution entry. Please try again.",
    fillAll: "Please fill all the required fields correctly.",

    // Reports Page
    reportsTitle: "Plantation Distribution Reports",
    searchPlaceholder: "Search by beneficiary, mobile, or officer...",
    filterNursery: "All Nurseries",
    filterJanpad: "All Janpads",
    filterPlantType: "All Plant Types",
    filterCategory: "All Categories",
    exportCsv: "Export to CSV",
    sNo: "S.No.",
    action: "Action",
    pageOf: "Page {page} of {totalPages}",
    noRecords: "No distribution records found.",
    dateRange: "Date Range",
    startDate: "Start Date",
    endDate: "End Date",

    // Settings Page
    settingsTitle: "DDPMS Integration Settings",
    scriptUrlLabel: "Google Apps Script Web App URL",
    scriptUrlPlaceholder: "https://script.google.com/macros/s/.../exec",
    saveUrl: "Save & Synchronize",
    connectionSuccess: "Connected successfully! Database loaded.",
    connectionFailed: "Failed to connect. Please verify Apps Script URL and CORS setup.",
    resetMock: "Reset Demo Database",
    resetSuccess: "Demo database reset successfully.",
    scriptInstructions: "How to connect Google Sheets:",
    instructionStep1: "1. Create a spreadsheet with Master sheets and Nursery sheets.",
    instructionStep2: "2. Paste the `code.gs` backend script into Apps Script.",
    instructionStep3: "3. Deploy it as a Web App (access: 'Anyone', execute as: 'Me').",
    instructionStep4: "4. Paste the deployment URL above.",

    // Common UI
    loading: "Loading database...",
    pleaseWait: "Please wait...",
    save: "Save",
    cancel: "Cancel",
    english: "English",
    hindi: "हिंदी",
    govermentText: "Dantewada District Plantation Monitoring System"
  },
  hi: {
    // Header & Navigation
    title: "दंतेवाड़ा वृक्षारोपण निगरानी",
    subtitle: "वन विभाग, दंतेवाड़ा जिला",
    dashboard: "डैशबोर्ड",
    nurseries: "नर्सरी प्रबंधन",
    distribute: "वितरण प्रविष्टि",
    reports: "रिपोर्ट और विश्लेषण",
    settings: "सिस्टम सेटिंग्स",
    logout: "लॉग आउट",
    loginTitle: "डी.डी.पी.एम.एस. अधिकारी पोर्टल",
    loginSubtitle: "छत्तीसगढ़ सरकार | वन विभाग",
    username: "अधिकारी का यूजरनेम",
    password: "पासवर्ड",
    loginButton: "सुरक्षित लॉगिन",
    loginError: "अमान्य उपयोगकर्ता नाम या पासवर्ड।",
    authenticating: "क्रेडेंशियल सत्यापित किए जा रहे हैं...",
    connected: "गूगल शीट कनेक्टेड",
    lastSync: "अंतिम सिंक",

    // Dashboard Cards
    totalPlants: "कुल प्रारंभिक स्टॉक",
    distributedPlants: "कुल वितरित पौधे",
    remainingStock: "शेष स्टॉक",
    distributionRate: "वितरण दर",
    totalBeneficiaries: "कुल लाभार्थी",
    totalNurseries: "कुल नर्सरी संख्या",
    todayDistribution: "आज का वितरण",
    weeklyDistribution: "साप्ताहिक वितरण",
    topNursery: "शीर्ष नर्सरी",
    plantsUnit: "पौधे",
    beneficiariesUnit: "लोग",

    // Dashboard Charts
    nurseryStockTrend: "नर्सरी स्टॉक बनाम वितरण",
    distributionByJanpad: "जनपद पंचायत वार वितरण",
    distributionByPlantType: "पौधों के प्रकार वार वितरण",
    dailyTrend: "दैनिक वितरण प्रवृत्ति",
    categoryShare: "प्राप्तकर्ता श्रेणी वार वितरण",
    stockLabel: "प्रारंभिक स्टॉक",
    distributedLabel: "वितरित",

    // Nursery Management
    nurseryTableTitle: "नर्सरी विवरण",
    nurseryName: "नर्सरी का नाम",
    incharge: "नर्सरी प्रभारी",
    contact: "संपर्क नंबर",
    openStock: "प्रारंभिक स्टॉक",
    distPercent: "वितरण %",
    callIncharge: "प्रभारी को कॉल करें",
    nurseryMasterList: "मास्टर नर्सरी स्टॉक सूची",

    // Distribution Form
    formTitle: "नया वृक्षारोपण वितरण प्रविष्टि",
    selectNursery: "नर्सरी चुनें",
    distributionDate: "वितरण दिनांक",
    beneficiaryName: "लाभार्थी का नाम",
    mobileNumber: "मोबाइल नंबर (10 अंक)",
    selectJanpad: "जनपद पंचायत चुनें",
    selectGp: "ग्राम पंचायत चुनें",
    selectVillage: "ग्राम का नाम चुनें",
    plantQuantity: "पौधों की संख्या",
    plantType: "पौधों का प्रकार",
    beneficiaryCategory: "प्राप्तकर्ता श्रेणी",
    distributorName: "वितरणकर्ता अधिकारी का नाम",
    submitForm: "वितरण प्रविष्टि जमा करें",
    submitting: "गूगल शीट में सुरक्षित किया जा रहा है...",
    formSuccess: "वितरण प्रविष्टि सफलतापूर्वक सुरक्षित की गई!",
    formError: "प्रविष्टि सुरक्षित करने में त्रुटि। कृपया पुनः प्रयास करें।",
    fillAll: "कृपया सभी आवश्यक फ़ील्ड सही ढंग से भरें।",

    // Reports Page
    reportsTitle: "वृक्षारोपण वितरण रिपोर्ट्स",
    searchPlaceholder: "लाभार्थी, मोबाइल या अधिकारी द्वारा खोजें...",
    filterNursery: "सभी नर्सरी",
    filterJanpad: "सभी जनपद",
    filterPlantType: "सभी पौधों के प्रकार",
    filterCategory: "सभी श्रेणियां",
    exportCsv: "सीएसवी निर्यात",
    sNo: "क्रमांक",
    action: "कार्रवाई",
    pageOf: "पृष्ठ {page} का {totalPages}",
    noRecords: "कोई वितरण रिकॉर्ड नहीं मिला।",
    dateRange: "दिनांक सीमा",
    startDate: "प्रारंभ तिथि",
    endDate: "अंतिम तिथि",

    // Settings Page
    settingsTitle: "डी.डी.पी.एम.एस. एकीकरण सेटिंग्स",
    scriptUrlLabel: "गूगल ऐप्स स्क्रिप्ट वेब ऐप यू.आर.एल.",
    scriptUrlPlaceholder: "https://script.google.com/macros/s/.../exec",
    saveUrl: "सुरक्षित करें और सिंक करें",
    connectionSuccess: "सफलतापूर्वक कनेक्ट हो गया! डेटाबेस लोड हो गया।",
    connectionFailed: "कनेक्ट करने में विफल। कृपया ऐप्स स्क्रिप्ट यू.आर.एल. और कॉर्स सेटअप जांचें।",
    resetMock: "डेमो डेटाबेस रीसेट करें",
    resetSuccess: "डेमो डेटाबेस सफलतापूर्वक रीसेट हो गया।",
    scriptInstructions: "गूगल शीट को कैसे कनेक्ट करें:",
    instructionStep1: "1. मास्टर और नर्सरी शीट के साथ एक गूगल स्प्रेडशीट बनाएं।",
    instructionStep2: "2. `code.gs` बैकएंड स्क्रिप्ट को ऐप्स स्क्रिप्ट में पेस्ट करें।",
    instructionStep3: "3. इसे एक वेब ऐप के रूप में तैनात करें (पहुंच: 'कोई भी', मेरे रूप में निष्पादित करें)।",
    instructionStep4: "4. ऊपर दिए गए बॉक्स में तैनाती यू.आर.एल. पेस्ट करें।",

    // Common UI
    loading: "डेटाबेस लोड हो रहा है...",
    pleaseWait: "कृपया प्रतीक्षा करें...",
    save: "सुरक्षित करें",
    cancel: "रद्द करें",
    english: "English",
    hindi: "हिंदी",
    govermentText: "दंतेवाड़ा जिला वृक्षारोपण निगरानी प्रणाली"
  }
};

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("hi"); // Default to Hindi as per govt focus, easily toggled

  // Load language preference from local storage if available
  useEffect(() => {
    const savedLang = localStorage.getItem("ddpms_language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "hi")) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("ddpms_language", newLang);
  };

  const t = (key: string): string => {
    const trans = translations[language];
    if (trans && trans[key]) {
      return trans[key];
    }
    // Return key if no translation matches
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
