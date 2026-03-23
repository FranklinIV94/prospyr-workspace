
import React from 'react';
import { 
  User, 
  Briefcase, 
  FileText, 
  Calculator,
  BookOpen,
  PieChart,
  ClipboardList,
  Cpu
} from 'lucide-react';
import { ServiceType } from './types';

export const SERVICES_CONFIG: Record<ServiceType, { price: string; description: string; icon: React.ReactNode }> = {
  'Bookkeeping': { 
    price: '$125/hr + $500 intake', 
    description: 'Ongoing categorization of transactions and monthly financial reporting. Required: 3 months of recent bank and credit card statements.',
    icon: <BookOpen className="w-5 h-5" /> 
  },
  '1040 Tax Prep': { 
    price: 'Varies by complexity', 
    description: 'Individual income tax return for individuals and families. For standard W-2 earners and basic deductions.',
    icon: <User className="w-5 h-5" /> 
  },
  '1040 Tax Prep + Schedule C': { 
    price: 'Starts at $395', 
    description: 'Individual tax return including business income/loss for Sole Proprietors, freelancers, or single-member LLCs.',
    icon: <Briefcase className="w-5 h-5" /> 
  },
  '1120s / 1065': { 
    price: 'Starts at $695', 
    icon: <PieChart className="w-5 h-5" />,
    description: 'Income tax returns for S-Corporations (1120-S) or Partnerships (1065) with multiple members.'
  },
  '1120 / 1041': { 
    price: 'Starts at $1095', 
    icon: <Calculator className="w-5 h-5" />,
    description: 'C-Corporation federal returns (1120) or Fiduciary returns for Trusts and Estates (1041).'
  },
  '941 + 940 Payroll': { 
    price: 'Starts at $500', 
    icon: <ClipboardList className="w-5 h-5" />,
    description: 'Employer’s Quarterly (941) and Annual (940) Federal Tax Returns for business payroll management.'
  },
  'State Tax Forms': { 
    price: 'Varies', 
    icon: <FileText className="w-5 h-5" />,
    description: 'Specific state-level tax filings required in addition to federal returns based on residency or business location.'
  },
  'AI as a Service (AIIO)': {
    price: 'Custom Project / Retainer',
    icon: <Cpu className="w-5 h-5" />,
    description: 'Leverage AI automation to simplify operations. Includes chatbots, workflow automation, and custom AI tools.'
  }
};
