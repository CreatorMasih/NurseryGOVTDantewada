export interface Nursery {
  id: string;
  name: string;
  inchargeName: string;
  contactNumber: string;
  openingStock: number;
}

export interface PlantType {
  id: string;
  nameEn: string;
  nameHi: string;
}

export interface Janpad {
  id: string;
  nameEn: string;
  nameHi: string;
}

export interface GramPanchayat {
  id: string;
  janpadId: string;
  nameEn: string;
  nameHi: string;
}

export interface Village {
  id: string;
  gpId: string;
  nameEn: string;
  nameHi: string;
}

export interface BeneficiaryCategory {
  id: string;
  nameEn: string;
  nameHi: string;
}

export interface DistributionRecord {
  "क्रमांक": number;
  "वितरण दिनांक": string;
  "लाभार्थी का नाम": string;
  "मोबाइल नंबर": string;
  "जनपद पंचायत": string;
  "ग्राम पंचायत": string;
  "ग्राम का नाम": string;
  "पौधों की संख्या": number;
  "पौधों का प्रकार": string;
  "प्राप्तकर्ता श्रेणी": string;
  "वितरणकर्ता का नाम": string;
}

export interface FullDatabase {
  nurseryMaster: Nursery[];
  plantTypes: PlantType[];
  janpadMaster: Janpad[];
  gramPanchayatMaster: GramPanchayat[];
  villageMaster: Village[];
  beneficiaryCategory: BeneficiaryCategory[];
  distributions: Record<string, DistributionRecord[]>;
}
