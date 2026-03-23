import React, { useState } from 'react';
import { 
  ChevronRight, 
  Upload, 
  FileCheck, 
  Download, 
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  ArrowRight,
  Info,
  Check,
  Building2,
  ShieldCheck,
  Users,
  Cpu,
  Zap,
  Layers,
  Sparkles,
  BarChart3,
  Clock,
  // Added missing Calculator icon
  Calculator
} from 'lucide-react';
import { ClientData, ServiceType, FileMetadata, AIDetails } from './types';
import { SERVICES_CONFIG } from './constants';
import { StepIndicator } from './components/StepIndicator';
import { analyzeIntakeData } from './services/geminiService';

const BrandLogo = ({ size = "md" }: { size?: "md" | "lg" }) => (
  <div className={`flex items-center ${size === "lg" ? "flex-col space-y-4" : "space-x-3"}`}>
    <div className={`${size === "lg" ? "w-24 h-24" : "w-12 h-12"} relative`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M25 5L75 5L100 50L75 95L25 95L0 50L25 5Z" fill="#0073bc" />
        <path d="M35 25L15 75" stroke="white" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <path d="M55 25L35 75" stroke="white" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <path d="M75 25L55 75" stroke="white" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
      </svg>
    </div>
    <div className={`flex flex-col ${size === "lg" ? "items-center text-center" : "items-start"}`}>
      <span className={`${size === "lg" ? "text-4xl" : "text-xl"} font-bold tracking-tight text-slate-800 leading-none uppercase`}>
        All Lines
      </span>
      <span className={`${size === "lg" ? "text-xl mt-1" : "text-[11px] mt-0.5"} font-semibold text-slate-700 tracking-[0.15em] leading-none uppercase`}>
        Business Solutions
      </span>
      <span className={`${size === "lg" ? "text-sm mt-3" : "text-[8px] mt-1"} font-medium text-[#0073bc] tracking-[0.2em] leading-none uppercase opacity-80`}>
        Simplifying Small Business
      </span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [primaryPath, setPrimaryPath] = useState<'Tax' | 'AI' | 'Payroll' | 'Both' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [data, setData] = useState<ClientData>({
    fullName: '',
    email: '',
    phone: '',
    services: [],
    additionalNotes: '',
    documents: [],
    aiDetails: {
      serviceTypes: [],
      techStack: '',
      automationTools: 'None',
      painPoints: [],
      otherPainPoint: '',
      budget: '',
      timeline: '',
      businessDescription: '',
      primaryAutomationGoal: ''
    }
  });

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified
      }));
      setData(prev => ({ ...prev, documents: [...prev.documents, ...newFiles] }));
    }
  };

  const toggleService = (service: ServiceType) => {
    setData(prev => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists 
          ? prev.services.filter(s => s !== service)
          : [...prev.services, service]
      };
    });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const summary = await analyzeIntakeData(data);
    setAiSummary(summary || "Summary generated successfully.");
    setIsSubmitting(false);
    nextStep();
  };

  const downloadReport = () => {
    const reportData = {
      ...data,
      primaryPath,
      aiSummary: aiSummary,
      timestamp: new Date().toISOString(),
      firm: "All Lines Business Solutions"
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALBS_Intake_${data.fullName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const needsBusinessInfo = data.services.some(s => 
    ['Bookkeeping', '1040 Tax Prep + Schedule C', '1120s / 1065', '1120 / 1041', '941 + 940 Payroll', 'Payroll Services', 'AI as a Service (AIIO)'].includes(s)
  );
  
  const needsTaxInfo = data.services.some(s => 
    ['1040 Tax Prep', '1040 Tax Prep + Schedule C', '1120s / 1065', '1120 / 1041'].includes(s)
  );

  const needsAIInfo = data.services.includes('AI as a Service (AIIO)');

  const needsPayrollInfo = data.services.includes('Payroll Services');

  const steps = [
    { id: 'intro', title: 'Welcome', component: <Welcome onNext={nextStep} /> },
    { id: 'path', title: 'Service Path', component: (
      <PathSelector 
        selected={primaryPath} 
        onSelect={(v) => {
          setPrimaryPath(v);
          // If Payroll is the primary path, pre-select Payroll Services so the downstream flow is deterministic.
          if (v === 'Payroll') {
            setData(prev => prev.services.includes('Payroll Services') ? prev : ({ ...prev, services: [...prev.services, 'Payroll Services'] }));
          }
        }} 
        onNext={nextStep} 
      />
    )},
    { id: 'contact', title: 'Contact Information', component: (
      <ContactForm 
        value={data} 
        onChange={(updates) => setData(prev => ({ ...prev, ...updates }))} 
        onNext={nextStep}
      />
    )},
    { id: 'services', title: 'Services Needed', component: (
      <ServicePicker 
        path={primaryPath}
        selected={data.services} 
        onToggle={toggleService} 
        onNext={nextStep}
        onPrev={prevStep}
      />
    )},
    ...(needsAIInfo ? [{ id: 'ai-questionnaire', title: 'AI Requirements', component: (
      <AIQuestionnaire 
        value={data.aiDetails!} 
        onChange={(aiDetails: AIDetails) => setData(prev => ({ ...prev, aiDetails }))}
        onNext={nextStep}
        onPrev={prevStep}
      />
    )}] : []),
    ...(needsPayrollInfo ? [{ id: 'payroll', title: 'Payroll Details', component: (
      <PayrollForm
        value={data.payrollDetails || {
          w2EmployeeCount: '',
          contractor1099Count: '',
          hasProcessedPayrollYTD: null,
          hasPaidPayrollTaxesYTD: null,
          ein: '',
          suiAccountNumber: '',
          stateWithholdingAccountNumber: ''
        }}
        onChange={(payrollDetails) => setData(prev => ({ ...prev, payrollDetails }))}
        onNext={nextStep}
        onPrev={prevStep}
      />
    )}] : []),
    ...(needsBusinessInfo ? [{ id: 'business', title: 'Business Details', component: (
      <BusinessForm 
        value={data.businessDetails || { entityType: '' }} 
        onChange={(businessDetails) => setData(prev => ({ ...prev, businessDetails }))}
        onNext={nextStep}
        onPrev={prevStep}
      />
    )}] : []),
    ...(needsTaxInfo ? [{ id: 'tax', title: 'Tax Details', component: (
      <TaxForm 
        value={data.taxDetails || { filingStatus: '', hasDependents: false, hasInvestments: false, hasRentalProperty: false }} 
        onChange={(taxDetails) => setData(prev => ({ ...prev, taxDetails }))}
        onNext={nextStep}
        onPrev={prevStep}
      />
    )}] : []),
    { id: 'docs', title: 'Document Upload', component: (
      <DocumentUploader 
        files={data.documents} 
        services={data.services}
        taxDetails={data.taxDetails}
        onUpload={handleFileUpload}
        onNext={nextStep}
        onPrev={prevStep}
      />
    )},
    { id: 'review', title: 'Final Review', component: (
      <ReviewScreen 
        data={data} 
        isSubmitting={isSubmitting} 
        onSubmit={handleFinalSubmit} 
        onPrev={prevStep}
      />
    )},
    { id: 'success', title: 'Complete', component: (
      <SuccessScreen 
        summary={aiSummary} 
        onDownload={downloadReport}
      />
    )}
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl shadow-slate-300 overflow-hidden border border-white">
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="px-10 pt-10 flex flex-col items-center">
             <div className="mb-6">
                <BrandLogo />
             </div>
             <StepIndicator currentStep={currentStep} totalSteps={steps.length - 1} />
          </div>
        )}
        
        <div className="flow-transition">
          {steps[currentStep]?.component}
        </div>
      </div>
      
      <footer className="mt-8 text-slate-500 text-sm flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-3 grayscale opacity-60">
            <BrandLogo size="md" />
        </div>
        <p className="flex items-center space-x-2 font-medium">
          <span>&copy; {new Date().getFullYear()} All Lines Business Solutions</span>
          <span>•</span>
          <span>Confidential Portal</span>
        </p>
        <p className="text-xs italic text-slate-400">Simplifying small business through tax strategy and AI automation.</p>
      </footer>
    </div>
  );
};

// --- Sub-components ---

const Welcome: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="p-12 text-center bg-gradient-to-b from-slate-50 to-white">
    <div className="mb-10">
      <BrandLogo size="lg" />
    </div>
    <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Onboarding Portal</h1>
    <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg leading-relaxed">
      Welcome. This smart intake handles both <span className="font-bold text-[#0073bc]">Tax Strategy</span> and <span className="font-bold text-purple-600">AI Automation (AIIO)</span>.
    </p>
    <button 
      onClick={onNext}
      className="bg-[#0073bc] hover:bg-[#005a92] text-white font-bold py-5 px-10 rounded-2xl transition-all flex items-center justify-center w-full group shadow-xl shadow-blue-100 uppercase tracking-widest text-sm"
    >
      Start Onboarding <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

const PathSelector: React.FC<{ selected: string | null; onSelect: (v: 'Tax' | 'AI' | 'Payroll' | 'Both') => void; onNext: () => void }> = ({ selected, onSelect, onNext }) => (
  <div className="p-10">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Primary Service Needs</h2>
    <p className="text-slate-500 mb-8">What area of your business are we simplifying today?</p>
    <div className="grid grid-cols-1 gap-4 mb-10">
      {[
        { id: 'Tax', title: 'Tax & Accounting', desc: 'Bookkeeping, 1040s, Corporate Filings', icon: <Calculator className="w-6 h-6" />, color: 'blue' },
        { id: 'Payroll', title: 'Payroll Services', desc: 'Payroll processing, onboarding, compliance', icon: <Users className="w-6 h-6" />, color: 'blue' },
        { id: 'AI', title: 'AI as a Service (AIIO)', desc: 'Workflows, Chatbots, Automation', icon: <Cpu className="w-6 h-6" />, color: 'purple' },
        { id: 'Both', title: 'Integrated Solutions', desc: 'Full Financial & Automation Strategy', icon: <Zap className="w-6 h-6" />, color: 'indigo' }
      ].map(path => (
        <button
          key={path.id}
          onClick={() => onSelect(path.id as any)}
          className={`flex items-center p-6 rounded-[1.5rem] border-2 text-left transition-all ${
            selected === path.id 
              ? 'border-[#0073bc] bg-blue-50 ring-4 ring-blue-50' 
              : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className={`p-4 rounded-xl mr-5 ${selected === path.id ? 'bg-[#0073bc] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
            {path.icon}
          </div>
          <div>
            <p className="font-bold text-lg text-slate-900">{path.title}</p>
            <p className="text-sm text-slate-500">{path.desc}</p>
          </div>
          {selected === path.id && <CheckCircle2 className="ml-auto text-[#0073bc] w-6 h-6" />}
        </button>
      ))}
    </div>
    <button 
      disabled={!selected}
      onClick={onNext}
      className="bg-[#0073bc] disabled:bg-slate-300 hover:bg-[#005a92] text-white font-bold py-5 px-10 rounded-2xl transition-all flex items-center justify-center w-full uppercase tracking-widest text-sm"
    >
      Continue <ChevronRight className="ml-2" />
    </button>
  </div>
);

const ContactForm: React.FC<{ value: any; onChange: (v: any) => void; onNext: () => void }> = ({ value, onChange, onNext }) => (
  <div className="p-10">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Point of Contact</h2>
    <p className="text-slate-500 mb-8">Verified contact details for secure document delivery.</p>
    <div className="space-y-5 mb-10">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Legal Full Name</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#0073bc] transition-colors" />
          <input 
            type="text" 
            placeholder="First and Last"
            value={value.fullName}
            onChange={e => onChange({ fullName: e.target.value })}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#0073bc] transition-colors" />
            <input 
              type="email" 
              placeholder="primary@email.com"
              value={value.email}
              onChange={e => onChange({ email: e.target.value })}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#0073bc] transition-colors" />
            <input 
              type="tel" 
              placeholder="(555) 000-0000"
              value={value.phone}
              onChange={e => onChange({ phone: e.target.value })}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>
    </div>
    <button 
      disabled={!value.fullName || !value.email}
      onClick={onNext}
      className="bg-[#0073bc] disabled:bg-slate-300 hover:bg-[#005a92] text-white font-bold py-5 px-10 rounded-2xl transition-all flex items-center justify-center w-full uppercase tracking-widest text-sm"
    >
      Continue <ChevronRight className="ml-2" />
    </button>
  </div>
);

const ServicePicker: React.FC<{ path: any; selected: ServiceType[]; onToggle: (s: ServiceType) => void; onNext: () => void; onPrev: () => void }> = ({ path, selected, onToggle, onNext, onPrev }) => {
  const filteredServices = (Object.keys(SERVICES_CONFIG) as ServiceType[]).filter(s => {
    if (path === 'Tax') return s !== 'AI as a Service (AIIO)' && s !== 'Payroll Services';
    if (path === 'AI') return s === 'AI as a Service (AIIO)';
    if (path === 'Payroll') return ['Payroll Services', '941 + 940 Payroll'].includes(s);
    return true; // Both
  });

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Specific Requirements</h2>
      <p className="text-slate-500 mb-8">Select the precise solutions you require assistance with.</p>
      <div className="grid grid-cols-1 gap-4 mb-10 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredServices.map(service => {
          const isActive = selected.includes(service);
          const config = SERVICES_CONFIG[service];
          const isAI = service === 'AI as a Service (AIIO)';
          return (
            <button
              key={service}
              onClick={() => onToggle(service)}
              className={`flex flex-col p-6 rounded-[1.5rem] border-2 text-left transition-all ${
                isActive 
                  ? isAI ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-50/50' : 'border-[#0073bc] bg-blue-50 ring-4 ring-blue-50/50' 
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2.5 rounded-xl mr-4 ${isActive ? isAI ? 'bg-purple-600 text-white' : 'bg-[#0073bc] text-white' : 'bg-white text-slate-500 border border-slate-100 shadow-sm'}`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-lg ${isActive ? isAI ? 'text-purple-900' : 'text-blue-900' : 'text-slate-800'}`}>{service}</p>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isActive ? isAI ? 'text-purple-600' : 'text-[#0073bc]' : 'text-slate-400'}`}>{config.price}</p>
                </div>
                {isActive && (
                  <div className={`${isAI ? 'bg-purple-600' : 'bg-[#0073bc]'} rounded-full p-1 text-white shadow-lg`}>
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed font-medium ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
                {config.description}
              </p>
            </button>
          );
        })}
      </div>
      <div className="flex space-x-5">
        <button onClick={onPrev} className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs">Back</button>
        <button 
          disabled={selected.length === 0}
          onClick={onNext} 
          className="flex-[2] bg-[#0073bc] disabled:bg-slate-300 hover:bg-[#005a92] text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center shadow-xl shadow-blue-100 uppercase tracking-widest text-sm"
        >
          Continue <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

const AIQuestionnaire: React.FC<{ value: AIDetails; onChange: (v: AIDetails) => void; onNext: () => void; onPrev: () => void }> = ({ value, onChange, onNext, onPrev }) => {
  const aiCategories = [
    { id: 'Process Automation', desc: 'Workflows, data entry, docs' },
    { id: 'Chatbots & Virtual Assistants', desc: 'Customer service, internal support' },
    { id: 'Marketing Automation', desc: 'Email, social, content' },
    { id: 'Lead Generation', desc: 'Prospecting, research, outreach' },
    { id: 'Custom AI Development', desc: 'Integrations, specialized tools' }
  ];

  const painPoints = [
    'Repetitive manual tasks',
    'Slow response times to customers',
    'Inconsistent processes',
    'Data scattered across systems',
    'Can\'t scale current operations'
  ];

  return (
    <div className="p-10 bg-slate-50/30">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-100">
           <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-900">AIIO Strategy Intake</h2>
            <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Simplifying through Intelligence</p>
        </div>
      </div>

      <div className="space-y-8 mb-10 h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {/* Categories */}
        <section>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">AI Service Type Selections</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiCategories.map(cat => {
              const active = value.serviceTypes.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => onChange({
                    ...value,
                    serviceTypes: active ? value.serviceTypes.filter(s => s !== cat.id) : [...value.serviceTypes, cat.id]
                  })}
                  className={`flex flex-col p-4 rounded-2xl border-2 text-left transition-all ${active ? 'border-purple-600 bg-purple-50/50' : 'border-slate-100 bg-white'}`}
                >
                   <span className="font-bold text-sm text-slate-800">{cat.id}</span>
                   <span className="text-[10px] text-slate-400 uppercase font-medium mt-1">{cat.desc}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Software Stack</label>
            <textarea 
              placeholder="e.g. QuickBooks, HubSpot, Slack..."
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-purple-600 outline-none h-32 font-medium"
              value={value.techStack}
              onChange={e => onChange({ ...value, techStack: e.target.value })}
            />
          </div>
          <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Existing Automation Tools</label>
                <select 
                   className="w-full p-4 rounded-2xl border border-slate-200 focus:border-purple-600 outline-none appearance-none bg-white font-bold"
                   value={value.automationTools}
                   onChange={e => onChange({ ...value, automationTools: e.target.value })}
                >
                    <option value="None">None</option>
                    <option value="Zapier">Zapier</option>
                    <option value="Make">Make.com</option>
                    <option value="Custom">Custom / In-house</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Operational Timeline</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select 
                    className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-purple-600 outline-none appearance-none bg-white font-bold"
                    value={value.timeline}
                    onChange={e => onChange({ ...value, timeline: e.target.value })}
                  >
                      <option value="">Target Date...</option>
                      <option value="ASAP">ASAP</option>
                      <option value="1-2 weeks">1-2 Weeks</option>
                      <option value="1 month">1 Month</option>
                      <option value="3+ months">3+ Months</option>
                      <option value="Just exploring">Just Exploring</option>
                  </select>
                </div>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Operational Pain Points</label>
          <div className="space-y-2">
            {painPoints.map(point => {
              const active = value.painPoints.includes(point);
              return (
                <label key={point} className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'border-purple-600 bg-purple-50' : 'border-slate-50 bg-white'}`}>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-slate-200" 
                      checked={active}
                      onChange={() => onChange({
                        ...value,
                        painPoints: active ? value.painPoints.filter(p => p !== point) : [...value.painPoints, point]
                      })}
                    />
                    <span className="ml-4 text-sm font-bold text-slate-700">{point}</span>
                </label>
              );
            })}
            <div className="p-4 rounded-xl border-2 border-slate-50 bg-white">
                <input 
                  type="text" 
                  placeholder="Other pain points..."
                  className="w-full bg-transparent outline-none text-sm font-medium"
                  value={value.otherPainPoint}
                  onChange={e => onChange({ ...value, otherPainPoint: e.target.value })}
                />
            </div>
          </div>
        </section>

        {/* Budget */}
        <section>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Budget Range (Monthly Retainer)</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: '$500-2,000/month', label: 'Starter' },
              { id: '$2,000-5,000/month', label: 'Growth' },
              { id: '$5,000-10,000/month', label: 'Enterprise' },
              { id: 'Custom/Not sure', label: 'Custom' }
            ].map(b => (
              <button
                key={b.id}
                onClick={() => onChange({ ...value, budget: b.id })}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${value.budget === b.id ? 'border-purple-600 bg-purple-50' : 'border-slate-50 bg-white'}`}
              >
                <span className="text-xs font-bold text-slate-800">{b.id}</span>
                <span className="text-[10px] uppercase text-slate-400 mt-1">{b.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Business Context */}
        <section className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Brief Business Context</label>
                <textarea 
                  placeholder="Describe your primary business activities..."
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:border-purple-600 outline-none h-24 font-medium"
                  value={value.businessDescription}
                  onChange={e => onChange({ ...value, businessDescription: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">#1 Thing to Automate</label>
                <textarea 
                  placeholder="If you could wave a magic wand, what's the first thing you'd automate?"
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:border-purple-600 outline-none h-24 font-bold text-purple-900 placeholder:text-purple-200"
                  value={value.primaryAutomationGoal}
                  onChange={e => onChange({ ...value, primaryAutomationGoal: e.target.value })}
                />
            </div>
        </section>
      </div>

      <div className="flex space-x-5">
        <button onClick={onPrev} className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs">Back</button>
        <button onClick={onNext} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center shadow-xl shadow-purple-100 uppercase tracking-widest text-sm">Review Next Step <ChevronRight className="ml-2" /></button>
      </div>
    </div>
  );
};

const PayrollForm: React.FC<{ value: any; onChange: (v: any) => void; onNext: () => void; onPrev: () => void }> = ({ value, onChange, onNext, onPrev }) => (
  <div className="p-10">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Payroll Services Intake</h2>
    <p className="text-slate-500 mb-8">A few quick compliance questions so we can onboard payroll cleanly.</p>

    <div className="space-y-8 mb-10">
      {/* Headcount */}
      <section>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Headcount</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">W-2 Employee Count</label>
            <input
              type="number"
              placeholder="0"
              value={value.w2EmployeeCount}
              onChange={e => onChange({ ...value, w2EmployeeCount: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">1099 Contractor Count</label>
            <input
              type="number"
              placeholder="0"
              value={value.contractor1099Count}
              onChange={e => onChange({ ...value, contractor1099Count: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none font-medium"
            />
          </div>
        </div>
      </section>

      {/* Historical Data */}
      <section>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historical Data</label>
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50">
            <div>
              <p className="text-sm font-bold text-slate-800">Payroll processed year-to-date?</p>
              <p className="text-xs text-slate-500 mt-1">Have any payrolls been processed in the current calendar year?</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange({ ...value, hasProcessedPayrollYTD: true })}
                className={`px-5 py-3 rounded-xl border-2 font-bold uppercase tracking-widest text-xs transition-all ${value.hasProcessedPayrollYTD === true ? 'border-[#0073bc] bg-blue-50 text-[#0073bc]' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, hasProcessedPayrollYTD: false })}
                className={`px-5 py-3 rounded-xl border-2 font-bold uppercase tracking-widest text-xs transition-all ${value.hasProcessedPayrollYTD === false ? 'border-[#0073bc] bg-blue-50 text-[#0073bc]' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                No
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50">
            <div>
              <p className="text-sm font-bold text-slate-800">Payroll taxes paid year-to-date?</p>
              <p className="text-xs text-slate-500 mt-1">Have any federal or state payroll taxes been paid to date this year?</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange({ ...value, hasPaidPayrollTaxesYTD: true })}
                className={`px-5 py-3 rounded-xl border-2 font-bold uppercase tracking-widest text-xs transition-all ${value.hasPaidPayrollTaxesYTD === true ? 'border-[#0073bc] bg-blue-50 text-[#0073bc]' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, hasPaidPayrollTaxesYTD: false })}
                className={`px-5 py-3 rounded-xl border-2 font-bold uppercase tracking-widest text-xs transition-all ${value.hasPaidPayrollTaxesYTD === false ? 'border-[#0073bc] bg-blue-50 text-[#0073bc]' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance / Onboarding */}
      <section>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Compliance / Onboarding</label>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Federal Employer Identification Number (EIN)</label>
            <input
              type="text"
              placeholder="9 digits"
              maxLength={10}
              value={value.ein}
              onChange={e => onChange({ ...value, ein: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none font-medium"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">State Unemployment (SUI) Account Number</label>
              <input
                type="text"
                placeholder="SUI account #"
                maxLength={30}
                value={value.suiAccountNumber}
                onChange={e => onChange({ ...value, suiAccountNumber: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">State Withholding Account Number</label>
              <input
                type="text"
                placeholder="Withholding account #"
                maxLength={30}
                value={value.stateWithholdingAccountNumber}
                onChange={e => onChange({ ...value, stateWithholdingAccountNumber: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    <div className="flex space-x-5">
      <button onClick={onPrev} className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs">Back</button>
      <button
        disabled={!value.ein || value.hasProcessedPayrollYTD === null || value.hasPaidPayrollTaxesYTD === null}
        onClick={onNext}
        className="flex-[2] bg-[#0073bc] disabled:bg-slate-300 hover:bg-[#005a92] text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center uppercase tracking-widest text-sm"
      >
        Continue <ChevronRight className="ml-2" />
      </button>
    </div>
  </div>
);

const BusinessForm: React.FC<{ value: any; onChange: (v: any) => void; onNext: () => void; onPrev: () => void }> = ({ value, onChange, onNext, onPrev }) => (
  <div className="p-10">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Business Operations</h2>
    <p className="text-slate-500 mb-8 italic">Structure and scale details.</p>
    <div className="space-y-6 mb-10">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Legal Entity Type</label>
        <select 
          value={value.entityType}
          onChange={e => onChange({ ...value, entityType: e.target.value })}
          className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none appearance-none bg-white font-medium"
        >
          <option value="">Select an option...</option>
          <option value="Sole Proprietor">Sole Proprietor / Single Member LLC</option>
          <option value="S-Corp">S-Corporation (1120-S)</option>
          <option value="C-Corp">C-Corporation (1120)</option>
          <option value="Partnership">Partnership (1065)</option>
          <option value="Trust">Trust (1041)</option>
          <option value="Other">Other / AI Startup</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Monthly Tx Volume</label>
          <input 
            type="text" 
            placeholder="e.g. 150 Transactions"
            value={value.transactionVolume}
            onChange={e => onChange({ ...value, transactionVolume: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">W-2 Employee Count</label>
          <input 
            type="number" 
            placeholder="0"
            value={value.employeeCount}
            onChange={e => onChange({ ...value, employeeCount: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none font-medium"
          />
        </div>
      </div>
    </div>
    <div className="flex space-x-5">
      <button onClick={onPrev} className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs">Back</button>
      <button 
        disabled={!value.entityType}
        onClick={onNext} 
        className="flex-[2] bg-[#0073bc] disabled:bg-slate-300 hover:bg-[#005a92] text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center uppercase tracking-widest text-sm"
      >
        Continue <ChevronRight className="ml-2" />
      </button>
    </div>
  </div>
);

const TaxForm: React.FC<{ value: any; onChange: (v: any) => void; onNext: () => void; onPrev: () => void }> = ({ value, onChange, onNext, onPrev }) => (
  <div className="p-10">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Tax Profile</h2>
    <p className="text-slate-500 mb-8">We'll use these answers to build your document checklist.</p>
    <div className="space-y-6 mb-10">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Federal Filing Status</label>
        <select 
          value={value.filingStatus}
          onChange={e => onChange({ ...value, filingStatus: e.target.value })}
          className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#0073bc] focus:ring-4 focus:ring-blue-50 outline-none appearance-none bg-white font-medium"
        >
          <option value="">Select Status...</option>
          <option value="Single">Single</option>
          <option value="Married Filing Jointly">Married Filing Jointly</option>
          <option value="Married Filing Separately">Married Filing Separately</option>
          <option value="Head of Household">Head of Household</option>
        </select>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Dependents (Children, Elders, or Relatives)', key: 'hasDependents' },
          { label: 'Sale of Assets (Stocks, Real Estate, Crypto)', key: 'hasInvestments' },
          { label: 'Active Rental Properties', key: 'hasRentalProperty' }
        ].map(item => (
          <label key={item.key} className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${value[item.key] ? 'border-[#0073bc] bg-blue-50 ring-4 ring-blue-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
            <input 
              type="checkbox" 
              checked={value[item.key]}
              onChange={e => onChange({ ...value, [item.key]: e.target.checked })}
              className="w-6 h-6 rounded-lg text-[#0073bc] focus:ring-[#0073bc] border-slate-300" 
            />
            <span className="ml-5 text-slate-700 font-bold text-sm uppercase tracking-wide">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
    <div className="flex space-x-5">
      <button onClick={onPrev} className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs">Back</button>
      <button onClick={onNext} className="flex-[2] bg-[#0073bc] hover:bg-[#005a92] text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center uppercase tracking-widest text-sm">Continue <ChevronRight className="ml-2" /></button>
    </div>
  </div>
);

const DocumentUploader: React.FC<{ files: FileMetadata[]; services: ServiceType[]; taxDetails: any; onUpload: (e: any) => void; onNext: () => void; onPrev: () => void }> = ({ files, services, taxDetails, onUpload, onNext, onPrev }) => {
  const getRequiredDocs = () => {
    const list: string[] = ["Government Issued Photo ID", "SSN/ITIN Verification"];
    if (services.includes('Bookkeeping')) list.push("3 Months Recent Bank Statements", "3 Months Recent Credit Card Statements");
    if (services.some(s => ['1040 Tax Prep', '1040 Tax Prep + Schedule C'].includes(s))) {
      list.push("W-2 Wage Statements", "1099-INT/DIV Interest Statements", "1098 Mortgage Interest", "1095 Health Insurance");
    }
    if (services.includes('1040 Tax Prep + Schedule C')) list.push("Full Profit & Loss Statement", "Business Bank Statements");
    if (services.some(s => ['1120s / 1065', '1120 / 1041'].includes(s))) list.push("Articles of Incorporation", "Prior Year Tax Return", "Current Balance Sheet");
    if (taxDetails?.hasInvestments) list.push("Brokerage/Crypto Transaction Logs");
    if (taxDetails?.hasRentalProperty) list.push("Rental P&L Records");
    if (services.includes('941 + 940 Payroll') || services.includes('Payroll Services')) list.push("Payroll Summaries", "Deposit Records");
    if (services.includes('AI as a Service (AIIO)')) list.push("Current Workflow Diagrams (if any)", "System Access List (Guest/Read-only)");
    return list;
  };

  const checklist = getRequiredDocs();

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Documentation Required</h2>
      <p className="text-slate-500 mb-8">Securely upload these items to proceed with onboarding.</p>
      
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        <div className="flex-1">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-6">
            <h3 className="text-[10px] font-extrabold text-[#0073bc] uppercase tracking-[0.2em] mb-4 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" /> All Lines Checklist
            </h3>
            <ul className="space-y-3">
              {checklist.map((item, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-700 font-semibold">
                  <div className="mt-0.5 mr-3 bg-white border border-slate-200 rounded shadow-sm p-0.5">
                    <Check className="w-3 h-3 text-[#0073bc]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-[3px] border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-[#0073bc] transition-all bg-white group relative shadow-inner">
            <input type="file" multiple onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer" id="file-upload" />
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4 group-hover:text-[#0073bc] group-hover:scale-110 transition-all" />
            <p className="text-slate-800 font-bold text-sm uppercase tracking-widest">Drop Files Here</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Encrypted Upload: PDF, JPG, PNG, XLS</p>
          </div>
        </div>

        <div className="flex-1 max-h-[400px] overflow-y-auto bg-slate-50/50 border border-slate-100 rounded-3xl p-6 shadow-inner custom-scrollbar">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">Uploaded Files ({files.length})</h3>
          <div className="space-y-3">
            {files.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-sm">No files selected yet.</div>
            ) : (
                files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="flex items-center truncate">
                            <div className="bg-blue-50 p-2 rounded-lg mr-3">
                                <FileCheck className="text-[#0073bc] w-4 h-4 shrink-0" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-5">
        <button onClick={onPrev} className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs">Back</button>
        <button onClick={onNext} className="flex-[2] bg-[#0073bc] hover:bg-[#005a92] text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center shadow-xl shadow-blue-100 uppercase tracking-widest text-sm">Continue <ChevronRight className="ml-2" /></button>
      </div>
    </div>
  );
};

const ReviewScreen: React.FC<{ data: ClientData; isSubmitting: boolean; onSubmit: () => void; onPrev: () => void }> = ({ data, isSubmitting, onSubmit, onPrev }) => (
  <div className="p-10">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Submission</h2>
    <p className="text-slate-500 mb-8">Finalize your intake to notify the All Lines accounting and AI teams.</p>
    
    <div className="space-y-5 mb-10 bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-inner">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Contact Name</span>
          <p className="font-bold text-slate-900 text-lg mt-1">{data.fullName}</p>
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Primary Email</span>
          <p className="font-bold text-slate-900 text-lg mt-1 truncate">{data.email}</p>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-5">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Solutions Requested</span>
        <div className="flex flex-wrap gap-2 mt-3">
          {data.services.map(s => (
            <span key={s} className={`px-4 py-2 bg-white rounded-xl text-xs font-bold border-2 shadow-sm uppercase tracking-wide ${s.includes('AI') ? 'text-purple-600 border-purple-50' : 'text-[#0073bc] border-blue-50'}`}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="flex space-x-5">
      <button disabled={isSubmitting} onClick={onPrev} className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs">Edit Intake</button>
      <button 
        disabled={isSubmitting} 
        onClick={onSubmit} 
        className="flex-[2] bg-[#0073bc] hover:bg-[#005a92] text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-blue-100 uppercase tracking-widest text-sm"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin mr-3" />
            Analyzing Data...
          </div>
        ) : (
          <>Transmit Securely <CheckCircle2 className="ml-2" /></>
        )}
      </button>
    </div>
  </div>
);

const SuccessScreen: React.FC<{ summary: string | null; onDownload: () => void }> = ({ summary, onDownload }) => (
  <div className="p-12 text-center bg-gradient-to-b from-slate-50 to-white">
    <div className="w-24 h-24 bg-[#0073bc] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
      <CheckCircle2 className="text-white w-12 h-12" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">Intake Received</h2>
    <p className="text-slate-500 mb-10 text-lg">Your data is safe. The All Lines team has been notified and will process your onboarding shortly.</p>
    
    {summary && (
      <div className="text-left mb-10 bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#0073bc] to-purple-600" />
        <div className="flex items-center mb-5 text-[#0073bc] font-extrabold uppercase tracking-[0.2em] text-xs">
          <AlertCircle className="w-4 h-4 mr-2" />
          AI Office Intelligence Report
        </div>
        <div className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-loose max-h-72 overflow-y-auto custom-scrollbar pr-4">
          {summary}
        </div>
      </div>
    )}

    <div className="space-y-5">
      <button 
        onClick={onDownload}
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-10 rounded-2xl transition-all flex items-center justify-center w-full shadow-2xl uppercase tracking-widest text-sm"
      >
        Download Dossier Package <Download className="ml-2" />
      </button>
      <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-5 text-left flex items-start">
        <Info className="w-5 h-5 mr-3 shrink-0 mt-1 text-[#0073bc]" />
        <div className="text-xs text-slate-600 font-medium leading-relaxed">
          <strong className="text-slate-900 block mb-1 uppercase tracking-wider">Office Assistant Instructions:</strong>
          Download and store the dossier file in the client's local server folder. This file contains the complete smart logic mapping for both tax and AI services.
        </div>
      </div>
    </div>
  </div>
);

export default App;