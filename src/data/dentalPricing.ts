export interface TreatmentType {
  id: string;
  label: string;
  icon: string;
}

export interface TreatmentTier {
  id: string;
  label: string;
  description: string;
  lowPrice: number;
  highPrice: number;
}

export interface TreatmentAddOn {
  id: string;
  label: string;
  description: string;
  flatCost: number;
}

export interface TreatmentCategory {
  id: string;
  label: string;
  icon: string;
  tiers: TreatmentTier[];
  addOns: TreatmentAddOn[];
}

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    id: 'preventive',
    label: 'Preventive Care',
    icon: 'ShieldCheck',
    tiers: [
      { id: 'cleaning_basic', label: 'Adult Prophylaxis (Cleaning)', description: 'Routine cleaning for healthy gums', lowPrice: 75, highPrice: 200 },
      { id: 'cleaning_deep', label: 'Deep Cleaning (Scaling & Root Planing)', description: 'Per quadrant, for periodontal disease', lowPrice: 150, highPrice: 350 },
      { id: 'exam_comprehensive', label: 'Comprehensive Exam + X-Rays', description: 'Full-mouth series and oral evaluation', lowPrice: 150, highPrice: 350 },
      { id: 'sealants', label: 'Dental Sealants (per tooth)', description: 'Protective coating for molars', lowPrice: 30, highPrice: 60 },
    ],
    addOns: [
      { id: 'fluoride', label: 'Fluoride Treatment', description: 'Professional-strength fluoride varnish', flatCost: 35 },
      { id: 'oral_cancer_screen', label: 'Oral Cancer Screening', description: 'VELscope or similar adjunctive screening', flatCost: 50 },
    ],
  },
  {
    id: 'restorative',
    label: 'Restorative',
    icon: 'Wrench',
    tiers: [
      { id: 'filling_composite', label: 'Composite Filling (tooth-colored)', description: 'Per surface, anterior or posterior', lowPrice: 150, highPrice: 350 },
      { id: 'crown', label: 'Porcelain Crown', description: 'Full-coverage lab-fabricated crown', lowPrice: 800, highPrice: 1500 },
      { id: 'root_canal', label: 'Root Canal Therapy', description: 'Anterior or premolar endodontic treatment', lowPrice: 700, highPrice: 1200 },
      { id: 'extraction', label: 'Tooth Extraction (surgical)', description: 'Impacted or complex extraction', lowPrice: 200, highPrice: 600 },
    ],
    addOns: [
      { id: 'buildup', label: 'Core Build-Up', description: 'Foundation for crown after root canal', flatCost: 250 },
      { id: 'post', label: 'Prefabricated Post', description: 'Retention for crown on endodontically treated tooth', flatCost: 200 },
    ],
  },
  {
    id: 'cosmetic',
    label: 'Cosmetic',
    icon: 'Sparkles',
    tiers: [
      { id: 'whitening', label: 'In-Office Whitening', description: 'Professional Zoom or KoR whitening session', lowPrice: 300, highPrice: 700 },
      { id: 'veneer', label: 'Porcelain Veneer (per tooth)', description: 'Custom lab-fabricated veneer', lowPrice: 800, highPrice: 2000 },
      { id: 'bonding', label: 'Cosmetic Bonding (per tooth)', description: 'Composite reshaping for chips or gaps', lowPrice: 200, highPrice: 600 },
      { id: 'gum_contouring', label: 'Gum Contouring', description: 'Laser or surgical gummy smile correction', lowPrice: 500, highPrice: 3000 },
    ],
    addOns: [
      { id: 'take_home_whitening', label: 'Take-Home Whitening Trays', description: 'Custom-fit bleaching trays with gel', flatCost: 250 },
      { id: 'smile_design', label: 'Digital Smile Design', description: 'Virtual mockup of final cosmetic result', flatCost: 150 },
    ],
  },
  {
    id: 'orthodontics',
    label: 'Orthodontics',
    icon: 'AlignLeft',
    tiers: [
      { id: 'braces_metal', label: 'Traditional Metal Braces', description: 'Full upper and lower, 18-24 months average', lowPrice: 3000, highPrice: 7000 },
      { id: 'braces_ceramic', label: 'Ceramic (Clear) Braces', description: 'Tooth-colored brackets, same treatment time', lowPrice: 4000, highPrice: 8000 },
      { id: 'invisalign', label: 'Invisalign / Clear Aligners', description: 'Full treatment, includes all trays and refinements', lowPrice: 3500, highPrice: 8000 },
      { id: 'retainer', label: 'Retainers (per arch)', description: 'Essix clear or Hawley retainer', lowPrice: 150, highPrice: 500 },
    ],
    addOns: [
      { id: 'ortho_records', label: 'Orthodontic Records', description: 'Cephalometric X-ray, photos, and models', flatCost: 300 },
      { id: 'accel_ortho', label: 'Accelerated Orthodontics (VPro / Propel)', description: 'Reduce treatment time by up to 50%', flatCost: 500 },
    ],
  },
];
