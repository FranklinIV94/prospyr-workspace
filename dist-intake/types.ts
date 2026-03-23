
export type ServiceType = 
  | 'Bookkeeping'
  | '1040 Tax Prep'
  | '1040 Tax Prep + Schedule C'
  | '1120s / 1065'
  | '1120 / 1041'
  | '941 + 940 Payroll'
  | 'Payroll Services'
  | 'State Tax Forms'
  | 'AI as a Service (AIIO)';

export interface AIDetails {
  serviceTypes: string[];
  techStack: string;
  automationTools: string;
  painPoints: string[];
  otherPainPoint: string;
  budget: string;
  timeline: string;
  businessDescription: string;
  primaryAutomationGoal: string;
}

export interface ClientData {
  fullName: string;
  email: string;
  phone: string;
  services: ServiceType[];
  businessDetails?: {
    entityType: string;
    annualRevenue?: string;
    transactionVolume?: string;
    employeeCount?: string;
  };
  taxDetails?: {
    filingStatus: string;
    hasDependents: boolean;
    hasInvestments: boolean;
    hasRentalProperty: boolean;
  };
  payrollDetails?: {
    w2EmployeeCount: string;
    contractor1099Count: string;
    hasProcessedPayrollYTD: boolean | null;
    hasPaidPayrollTaxesYTD: boolean | null;
    ein: string;
    suiAccountNumber: string;
    stateWithholdingAccountNumber: string;
  };
  aiDetails?: AIDetails;
  additionalNotes: string;
  documents: FileMetadata[];
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface Step {
  id: string;
  title: string;
  description: string;
}
