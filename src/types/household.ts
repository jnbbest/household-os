export type Domain = 'kitchen' | 'staff' | 'admin' | 'repairs' | 'laundry' | 'family';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'as_needed';

export interface TaskOwnership {
  id: string;
  domain: Domain;
  title: string;
  frequency: Frequency;
  primaryOwner: string;
  backupOwner: string;
  definitionOfDone: string;
  status: 'pending' | 'completed';
  lastCompletedDate?: string;
}

export interface ExpenseItem {
  id: string;
  bucket: 'Fixed' | 'Variable';
  itemName: string;
  amount: number;
  notes?: string;
}

export interface MoneyPoolState {
  items: ExpenseItem[];
  bufferRate: number; // default 0.15 (15%)
  splitModel: 'equal_50_50' | 'income_weighted';
  partnerAName: string;
  partnerBName: string;
  partnerAIncome: number;
  partnerBIncome: number;
}

export type DocCategory = 'identity' | 'property' | 'medical' | 'vehicle' | 'finance';

export interface DocumentPointer {
  id: string;
  documentName: string;
  category: DocCategory;
  physicalLocation: string; // e.g. "Master Bedroom Shelf -> Red Sleeve 1"
  digilockerSync: boolean;
  expiryDate?: string;      // YYYY-MM-DD
  isEmergencyICE: boolean;
}

export interface EmergencyInfo {
  primaryContactName: string;
  primaryContactPhone: string;
  secondaryContactName: string;
  secondaryContactPhone: string;
  familyDoctorName: string;
  familyDoctorPhone: string;
  preferredHospital: string;
  tpaHelpline: string;
  healthInsurancePolicyNo: string;
  bloodGroups: { name: string; group: string }[];
}

export interface SundayResetLog {
  id: string;
  weekStarting: string;
  choresReviewed: boolean;
  staffLedgerCleared: boolean;
  billsAutodebitVerified: boolean;
  weeklyAIMenuGenerated: boolean;
  notes: string;
}

export interface HouseholdSettings {
  householdName: string;
  currencySymbol: string;
  googleSheetUrl: string;
  pinCode?: string;
}
