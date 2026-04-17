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
    id: 'primary_care',
    label: 'Primary Care',
    icon: 'Stethoscope',
    tiers: [
      { id: 'new_patient_visit', label: 'New Patient Visit (Level 3)', description: 'Comprehensive first visit with history and exam', lowPrice: 150, highPrice: 300 },
      { id: 'established_visit', label: 'Established Patient Visit (Level 3)', description: 'Follow-up or routine visit', lowPrice: 100, highPrice: 200 },
      { id: 'annual_physical', label: 'Annual Wellness Exam', description: 'Preventive care visit with vitals and screening review', lowPrice: 150, highPrice: 350 },
      { id: 'urgent_visit', label: 'Same-Day Urgent Visit', description: 'Acute complaint requiring same-day evaluation', lowPrice: 175, highPrice: 400 },
    ],
    addOns: [
      { id: 'ekg', label: 'In-Office EKG', description: '12-lead electrocardiogram with interpretation', flatCost: 75 },
      { id: 'rapid_strep', label: 'Rapid Strep / Flu Test', description: 'Point-of-care rapid antigen testing', flatCost: 35 },
      { id: 'injection_admin', label: 'Injection Administration', description: 'IM or SubQ injection (medication cost separate)', flatCost: 25 },
    ],
  },
  {
    id: 'specialist_consult',
    label: 'Specialist Consultations',
    icon: 'UserCheck',
    tiers: [
      { id: 'cardiology_consult', label: 'Cardiology Consultation', description: 'Initial cardiac evaluation and risk assessment', lowPrice: 250, highPrice: 500 },
      { id: 'dermatology_consult', label: 'Dermatology Consultation', description: 'Skin exam with possible biopsy', lowPrice: 150, highPrice: 400 },
      { id: 'orthopedic_consult', label: 'Orthopedic Consultation', description: 'Musculoskeletal evaluation and treatment plan', lowPrice: 200, highPrice: 450 },
      { id: 'ent_consult', label: 'ENT Consultation', description: 'Ear, nose, and throat evaluation', lowPrice: 175, highPrice: 400 },
    ],
    addOns: [
      { id: 'xray_extremity', label: 'X-Ray (Extremity)', description: 'Single-view radiograph of hand, foot, knee, etc.', flatCost: 75 },
      { id: 'ultrasound', label: 'In-Office Ultrasound', description: 'Point-of-care diagnostic ultrasound', flatCost: 200 },
      { id: 'biopsy', label: 'Skin Biopsy (Punch)', description: 'Diagnostic skin biopsy with pathology', flatCost: 250 },
    ],
  },
  {
    id: 'preventive_screening',
    label: 'Preventive Screenings',
    icon: 'ShieldCheck',
    tiers: [
      { id: 'blood_panel', label: 'Comprehensive Blood Panel', description: 'CBC, CMP, lipids, thyroid, A1C', lowPrice: 100, highPrice: 300 },
      { id: 'mammogram', label: 'Screening Mammogram', description: 'Bilateral digital mammography', lowPrice: 150, highPrice: 400 },
      { id: 'colonoscopy_screen', label: 'Screening Colonoscopy', description: 'Preventive colonoscopy with sedation', lowPrice: 1500, highPrice: 3500 },
      { id: 'dexa_scan', label: 'DEXA Bone Density Scan', description: 'Dual-energy X-ray absorptiometry for osteoporosis screening', lowPrice: 100, highPrice: 250 },
    ],
    addOns: [
      { id: 'psa', label: 'PSA Screening', description: 'Prostate-specific antigen blood test', flatCost: 40 },
      { id: 'hemoglobin_a1c', label: 'Hemoglobin A1C (add-on)', description: 'Diabetes monitoring blood test', flatCost: 30 },
      { id: 'vitamin_d', label: 'Vitamin D Level', description: '25-hydroxyvitamin D blood test', flatCost: 50 },
    ],
  },
  {
    id: 'telehealth',
    label: 'Telehealth',
    icon: 'Video',
    tiers: [
      { id: 'telehealth_new', label: 'Telehealth — New Patient', description: 'Virtual initial consultation via video', lowPrice: 100, highPrice: 250 },
      { id: 'telehealth_followup', label: 'Telehealth — Follow-Up', description: 'Virtual follow-up or medication check', lowPrice: 75, highPrice: 175 },
      { id: 'telehealth_mental', label: 'Telehealth — Behavioral Health', description: 'Virtual mental health consultation or therapy session', lowPrice: 125, highPrice: 300 },
      { id: 'telehealth_urgent', label: 'Telehealth — Urgent Visit', description: 'Same-day virtual urgent care evaluation', lowPrice: 100, highPrice: 225 },
    ],
    addOns: [
      { id: 'remote_monitoring', label: 'Remote Patient Monitoring (monthly)', description: 'Connected device monitoring for chronic conditions', flatCost: 75 },
      { id: 'e_prescribe', label: 'E-Prescribe to Pharmacy', description: 'Electronic prescription sent directly to patient pharmacy', flatCost: 0 },
      { id: 'lab_order', label: 'Lab Order with Results Review', description: 'Lab requisition with follow-up telehealth review', flatCost: 45 },
    ],
  },
];
