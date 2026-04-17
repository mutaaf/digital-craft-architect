export interface ServiceTier {
  id: string;
  label: string;
  description: string;
  lowPrice: number;
  highPrice: number;
}

export interface ServiceAddOn {
  id: string;
  label: string;
  description: string;
  flatCost: number;
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  tiers: ServiceTier[];
  addOns: ServiceAddOn[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'initial_consultations',
    label: 'Initial Consultations',
    icon: 'MessageSquare',
    tiers: [
      { id: 'consult_free', label: 'Free Case Evaluation', description: 'Brief phone screening to determine case viability', lowPrice: 0, highPrice: 0 },
      { id: 'consult_standard', label: 'Standard Consultation (1 hour)', description: 'In-depth case review with attorney recommendation', lowPrice: 150, highPrice: 500 },
      { id: 'consult_complex', label: 'Complex Case Consultation', description: 'Multi-issue case review with document analysis', lowPrice: 300, highPrice: 750 },
      { id: 'consult_second_opinion', label: 'Second Opinion Review', description: 'Review of existing legal strategy with alternative recommendation', lowPrice: 250, highPrice: 600 },
    ],
    addOns: [
      { id: 'conflict_check', label: 'Expedited Conflict Check', description: 'Rush conflict of interest screening within 2 hours', flatCost: 75 },
      { id: 'records_review', label: 'Preliminary Records Review', description: 'Pre-consultation review of up to 50 pages of documents', flatCost: 150 },
    ],
  },
  {
    id: 'case_evaluation',
    label: 'Case Evaluation Packages',
    icon: 'ClipboardList',
    tiers: [
      { id: 'eval_basic', label: 'Basic Case Assessment', description: 'Written summary of case strengths, weaknesses, and likely outcomes', lowPrice: 500, highPrice: 1500 },
      { id: 'eval_comprehensive', label: 'Comprehensive Case Analysis', description: 'Detailed legal memorandum with case law research', lowPrice: 1500, highPrice: 5000 },
      { id: 'eval_litigation', label: 'Litigation Risk Assessment', description: 'Cost-benefit analysis of proceeding to trial vs. settlement', lowPrice: 2000, highPrice: 7500 },
      { id: 'eval_multi_party', label: 'Multi-Party Case Evaluation', description: 'Complex assessment involving multiple parties or cross-claims', lowPrice: 3000, highPrice: 10000 },
    ],
    addOns: [
      { id: 'expert_referral', label: 'Expert Witness Referral', description: 'Identification and vetting of subject matter expert', flatCost: 500 },
      { id: 'timeline_analysis', label: 'Statute of Limitations Analysis', description: 'Deadline review and filing timeline recommendation', flatCost: 250 },
    ],
  },
  {
    id: 'retainer_plans',
    label: 'Retainer Plans',
    icon: 'Shield',
    tiers: [
      { id: 'retainer_basic', label: 'Basic Retainer (5 hrs/mo)', description: 'General legal counsel for small businesses or individuals', lowPrice: 1000, highPrice: 2500 },
      { id: 'retainer_standard', label: 'Standard Retainer (10 hrs/mo)', description: 'Ongoing legal support with priority scheduling', lowPrice: 2500, highPrice: 5000 },
      { id: 'retainer_premium', label: 'Premium Retainer (20 hrs/mo)', description: 'Comprehensive legal partnership with dedicated attorney', lowPrice: 5000, highPrice: 10000 },
      { id: 'retainer_enterprise', label: 'Enterprise Retainer (unlimited)', description: 'Full-service outside general counsel arrangement', lowPrice: 10000, highPrice: 25000 },
    ],
    addOns: [
      { id: 'after_hours', label: 'After-Hours Availability', description: '24/7 emergency legal hotline access', flatCost: 500 },
      { id: 'quarterly_review', label: 'Quarterly Legal Audit', description: 'Proactive review of compliance and risk exposure', flatCost: 1500 },
    ],
  },
  {
    id: 'document_preparation',
    label: 'Document Preparation',
    icon: 'FileText',
    tiers: [
      { id: 'doc_simple', label: 'Simple Contract Drafting', description: 'Standard agreements, NDAs, or service contracts', lowPrice: 300, highPrice: 1000 },
      { id: 'doc_complex', label: 'Complex Contract Drafting', description: 'Multi-party agreements, partnership documents, or licensing deals', lowPrice: 1000, highPrice: 5000 },
      { id: 'doc_demand', label: 'Demand Letter', description: 'Formal legal demand with supporting case citations', lowPrice: 500, highPrice: 2000 },
      { id: 'doc_filing', label: 'Court Filing Preparation', description: 'Motions, pleadings, or discovery document drafting', lowPrice: 750, highPrice: 3000 },
    ],
    addOns: [
      { id: 'rush_draft', label: 'Rush Drafting (24-hour)', description: 'Priority turnaround on any document preparation', flatCost: 350 },
      { id: 'notarization', label: 'Notarization Coordination', description: 'Arrange mobile notary for document execution', flatCost: 100 },
    ],
  },
];
