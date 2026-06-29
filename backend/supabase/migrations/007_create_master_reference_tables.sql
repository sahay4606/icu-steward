-- ══════════════════════════════════════════════════════════════════════════════
-- Master Reference Tables — ICU Stewardship Platform
-- These are separate from transaction tables. Populated with seed data.
-- ══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════ 1. CULTURE MODULE ═══════════════════

-- 1a. Culture types
CREATE TABLE IF NOT EXISTS culture_master (
  id text primary key,
  culture_code text,
  culture_name text not null,
  category text,
  specimen_required text,
  transport_media text,
  default_turnaround text,
  department text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO culture_master (id, culture_code, culture_name, category, specimen_required, transport_media) VALUES
  (gen_random_uuid()::text, 'BLD-CX', 'Blood Culture', 'Blood', 'Whole Blood', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'PBLD-CX', 'Peripheral Blood Culture', 'Blood', 'Whole Blood', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'CLBLD-CX', 'Central Line Blood Culture', 'Blood', 'Central Line Blood', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'URN-CX', 'Urine Culture', 'Urine', 'Midstream Urine', 'Sterile container'),
  (gen_random_uuid()::text, 'CATH-URN-CX', 'Catheter Urine Culture', 'Urine', 'Catheter Urine', 'Sterile container'),
  (gen_random_uuid()::text, 'SPT-CX', 'Sputum Culture', 'Respiratory', 'Sputum', 'Sterile container'),
  (gen_random_uuid()::text, 'ETA-CX', 'Endotracheal Aspirate', 'Respiratory', 'ETA', 'Sterile container'),
  (gen_random_uuid()::text, 'BAL-CX', 'Bronchoalveolar Lavage', 'Respiratory', 'BAL Fluid', 'Sterile container'),
  (gen_random_uuid()::text, 'BW-CX', 'Bronchial Wash', 'Respiratory', 'Bronchial Wash', 'Sterile container'),
  (gen_random_uuid()::text, 'TA-CX', 'Tracheal Aspirate', 'Respiratory', 'Tracheal Aspirate', 'Sterile container'),
  (gen_random_uuid()::text, 'PLFL-CX', 'Pleural Fluid Culture', 'Fluid', 'Pleural Fluid', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'ASFL-CX', 'Ascitic Fluid Culture', 'Fluid', 'Ascitic Fluid', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'PEFL-CX', 'Peritoneal Fluid Culture', 'Fluid', 'Peritoneal Fluid', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'CSF-CX', 'CSF Culture', 'Fluid', 'CSF', 'Sterile container'),
  (gen_random_uuid()::text, 'SYFL-CX', 'Synovial Fluid Culture', 'Fluid', 'Synovial Fluid', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'BN-CX', 'Bone Culture', 'Tissue', 'Bone', 'Sterile container'),
  (gen_random_uuid()::text, 'BMR-CX', 'Bone Marrow Culture', 'Tissue', 'Bone Marrow', 'Blood culture bottles'),
  (gen_random_uuid()::text, 'TIS-CX', 'Tissue Culture', 'Tissue', 'Tissue', 'Sterile container'),
  (gen_random_uuid()::text, 'DTIS-CX', 'Deep Tissue Culture', 'Tissue', 'Deep Tissue', 'Sterile container'),
  (gen_random_uuid()::text, 'PUS-CX', 'Pus Culture', 'Pus', 'Pus', 'Sterile swab/container'),
  (gen_random_uuid()::text, 'WND-CX', 'Wound Swab', 'Wound', 'Wound Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'SS-CX', 'Surgical Site Culture', 'Wound', 'Surgical Site Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'CTHT-CX', 'Catheter Tip Culture', 'Device', 'Catheter Tip', 'Sterile container'),
  (gen_random_uuid()::text, 'DRFL-CX', 'Drain Fluid Culture', 'Fluid', 'Drain Fluid', 'Sterile container'),
  (gen_random_uuid()::text, 'BILE-CX', 'Bile Culture', 'Fluid', 'Bile', 'Sterile container'),
  (gen_random_uuid()::text, 'STL-CX', 'Stool Culture', 'Stool', 'Stool', 'Sterile container'),
  (gen_random_uuid()::text, 'RCT-CX', 'Rectal Swab', 'Swab', 'Rectal Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'THRT-CX', 'Throat Swab', 'Swab', 'Throat Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'NSL-CX', 'Nasal Swab', 'Swab', 'Nasal Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'EAR-CX', 'Ear Swab', 'Swab', 'Ear Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'EYE-CX', 'Eye Swab', 'Swab', 'Eye Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'CNJ-CX', 'Conjunctival Swab', 'Swab', 'Conjunctival Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'CRN-CX', 'Corneal Scraping', 'Eye', 'Corneal Scraping', 'Sterile container'),
  (gen_random_uuid()::text, 'VAG-CX', 'Vaginal Swab', 'Swab', 'Vaginal Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'CRV-CX', 'Cervical Swab', 'Swab', 'Cervical Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'URT-CX', 'Urethral Swab', 'Swab', 'Urethral Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'PEN-CX', 'Penile Swab', 'Swab', 'Penile Swab', 'Transport swab'),
  (gen_random_uuid()::text, 'SKN-CX', 'Skin Scraping', 'Skin', 'Skin Scraping', 'Sterile container'),
  (gen_random_uuid()::text, 'NAIL-CX', 'Nail Sample', 'Skin', 'Nail', 'Sterile container'),
  (gen_random_uuid()::text, 'HAIR-CX', 'Hair Sample', 'Skin', 'Hair', 'Sterile container'),
  (gen_random_uuid()::text, 'FNG-CX', 'Fungal Culture', 'Fungal', 'Various', 'Fungal transport media'),
  (gen_random_uuid()::text, 'AFB-CX', 'AFB Culture', 'Mycobacterial', 'Sputum/Tissue', 'Sterile container'),
  (gen_random_uuid()::text, 'MYC-CX', 'Mycobacterial Culture', 'Mycobacterial', 'Sputum/Tissue', 'Sterile container'),
  (gen_random_uuid()::text, 'ANA-CX', 'Anaerobic Culture', 'Anaerobic', 'Deep Tissue/Aspirate', 'Anaerobic transport'),
  (gen_random_uuid()::text, 'AER-CX', 'Aerobic Culture', 'Aerobic', 'Various', 'Sterile container'),
  (gen_random_uuid()::text, 'VIR-CX', 'Viral Culture', 'Virology', 'Various', 'Viral transport media'),
  (gen_random_uuid()::text, 'SURV-CX', 'Surveillance Culture', 'Surveillance', 'Various', 'Transport swab')
ON CONFLICT (id) DO NOTHING;

-- 1b. Specimen types
CREATE TABLE IF NOT EXISTS specimen_master (
  id text primary key,
  specimen_code text,
  specimen_name text not null,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO specimen_master (id, specimen_code, specimen_name, category) VALUES
  (gen_random_uuid()::text, 'BLD', 'Whole Blood', 'Blood'),
  (gen_random_uuid()::text, 'SER', 'Serum', 'Blood'),
  (gen_random_uuid()::text, 'PLA', 'Plasma', 'Blood'),
  (gen_random_uuid()::text, 'URN', 'Urine', 'Urine'),
  (gen_random_uuid()::text, 'CSF', 'CSF', 'Fluid'),
  (gen_random_uuid()::text, 'PLFL', 'Pleural Fluid', 'Fluid'),
  (gen_random_uuid()::text, 'ASFL', 'Ascitic Fluid', 'Fluid'),
  (gen_random_uuid()::text, 'PEFL', 'Peritoneal Fluid', 'Fluid'),
  (gen_random_uuid()::text, 'SYFL', 'Synovial Fluid', 'Fluid'),
  (gen_random_uuid()::text, 'BAL', 'BAL', 'Respiratory'),
  (gen_random_uuid()::text, 'ETA', 'ETA', 'Respiratory'),
  (gen_random_uuid()::text, 'SPT', 'Sputum', 'Respiratory'),
  (gen_random_uuid()::text, 'TIS', 'Tissue', 'Tissue'),
  (gen_random_uuid()::text, 'BN', 'Bone', 'Tissue'),
  (gen_random_uuid()::text, 'BMR', 'Bone Marrow', 'Tissue'),
  (gen_random_uuid()::text, 'PUS', 'Pus', 'Pus'),
  (gen_random_uuid()::text, 'SWB', 'Swab', 'Swab'),
  (gen_random_uuid()::text, 'DRFL', 'Drain Fluid', 'Fluid'),
  (gen_random_uuid()::text, 'BILE', 'Bile', 'Fluid'),
  (gen_random_uuid()::text, 'STL', 'Stool', 'Stool'),
  (gen_random_uuid()::text, 'SAL', 'Saliva', 'Oral'),
  (gen_random_uuid()::text, 'NSL', 'Nasal Swab', 'Swab'),
  (gen_random_uuid()::text, 'THRT', 'Throat Swab', 'Swab'),
  (gen_random_uuid()::text, 'VAG', 'Vaginal Swab', 'Swab'),
  (gen_random_uuid()::text, 'CRV', 'Cervical Swab', 'Swab'),
  (gen_random_uuid()::text, 'URT', 'Urethral Swab', 'Swab'),
  (gen_random_uuid()::text, 'EYE', 'Eye Swab', 'Swab'),
  (gen_random_uuid()::text, 'EAR', 'Ear Swab', 'Swab'),
  (gen_random_uuid()::text, 'HAIR', 'Hair', 'Skin'),
  (gen_random_uuid()::text, 'NAIL', 'Nail', 'Skin'),
  (gen_random_uuid()::text, 'SKN', 'Skin Scraping', 'Skin'),
  (gen_random_uuid()::text, 'CTHT', 'Catheter Tip', 'Device')
ON CONFLICT (id) DO NOTHING;

-- 1c. Organisms
CREATE TABLE IF NOT EXISTS organism_master (
  id text primary key,
  organism_code text,
  organism_name text not null,
  category text not null,
  gram_stain text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO organism_master (id, organism_code, organism_name, category, gram_stain) VALUES
  -- Gram Positive
  (gen_random_uuid()::text, 'SA', 'Staphylococcus aureus', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'MRSA', 'MRSA', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'MSSA', 'MSSA', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'CNS', 'Coagulase Negative Staphylococcus', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'SEPI', 'Staphylococcus epidermidis', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'SPNE', 'Streptococcus pneumoniae', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'SPYO', 'Streptococcus pyogenes', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'EFAL', 'Enterococcus faecalis', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'EFM', 'Enterococcus faecium', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'VRE', 'VRE', 'Gram Positive', 'Gram Positive Cocci'),
  (gen_random_uuid()::text, 'LMONO', 'Listeria monocytogenes', 'Gram Positive', 'Gram Positive Bacilli'),
  -- Gram Negative
  (gen_random_uuid()::text, 'EC', 'Escherichia coli', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'KPN', 'Klebsiella pneumoniae', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'KOXY', 'Klebsiella oxytoca', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'PAER', 'Pseudomonas aeruginosa', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'ABAUM', 'Acinetobacter baumannii', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'PMIR', 'Proteus mirabilis', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'PVUL', 'Proteus vulgaris', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'CFRE', 'Citrobacter freundii', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'ECLO', 'Enterobacter cloacae', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'SMAR', 'Serratia marcescens', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'MMOR', 'Morganella morganii', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'PSTU', 'Providencia stuartii', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'SALM', 'Salmonella', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'SHIG', 'Shigella', 'Gram Negative', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'NMEN', 'Neisseria meningitidis', 'Gram Negative', 'Gram Negative Cocci'),
  (gen_random_uuid()::text, 'HINF', 'Haemophilus influenzae', 'Gram Negative', 'Gram Negative Rods'),
  -- Anaerobes
  (gen_random_uuid()::text, 'BFRAG', 'Bacteroides fragilis', 'Anaerobe', 'Gram Negative Rods'),
  (gen_random_uuid()::text, 'CDIFF', 'Clostridium difficile', 'Anaerobe', 'Gram Positive Bacilli'),
  (gen_random_uuid()::text, 'CPERF', 'Clostridium perfringens', 'Anaerobe', 'Gram Positive Bacilli'),
  (gen_random_uuid()::text, 'PEPTO', 'Peptostreptococcus', 'Anaerobe', 'Gram Positive Cocci'),
  -- Fungi
  (gen_random_uuid()::text, 'CALB', 'Candida albicans', 'Fungi', 'Budding Yeast'),
  (gen_random_uuid()::text, 'CTROP', 'Candida tropicalis', 'Fungi', 'Budding Yeast'),
  (gen_random_uuid()::text, 'CGLAB', 'Candida glabrata', 'Fungi', 'Budding Yeast'),
  (gen_random_uuid()::text, 'CAUR', 'Candida auris', 'Fungi', 'Budding Yeast'),
  (gen_random_uuid()::text, 'AFUM', 'Aspergillus fumigatus', 'Fungi', 'Hyphae Seen'),
  (gen_random_uuid()::text, 'CRYPT', 'Cryptococcus neoformans', 'Fungi', 'Budding Yeast'),
  -- Mycobacteria
  (gen_random_uuid()::text, 'MTB', 'Mycobacterium tuberculosis', 'Mycobacteria', 'AFB Positive'),
  (gen_random_uuid()::text, 'NTM', 'Non-tuberculous mycobacteria', 'Mycobacteria', 'AFB Positive')
ON CONFLICT (id) DO NOTHING;

-- 1d. Susceptibility results
CREATE TABLE IF NOT EXISTS susceptibility_master (
  id text primary key,
  susceptibility_code text,
  susceptibility_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO susceptibility_master (id, susceptibility_code, susceptibility_name) VALUES
  (gen_random_uuid()::text, 'S', 'Sensitive'),
  (gen_random_uuid()::text, 'I', 'Intermediate'),
  (gen_random_uuid()::text, 'R', 'Resistant'),
  (gen_random_uuid()::text, 'NT', 'Not Tested'),
  (gen_random_uuid()::text, 'IR', 'Intrinsic Resistance')
ON CONFLICT (id) DO NOTHING;

-- 1e. Resistance markers
CREATE TABLE IF NOT EXISTS resistance_marker_master (
  id text primary key,
  marker_code text,
  marker_name text not null,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO resistance_marker_master (id, marker_code, marker_name, category) VALUES
  (gen_random_uuid()::text, 'MRSA', 'MRSA', 'Gram Positive'),
  (gen_random_uuid()::text, 'MSSA', 'MSSA', 'Gram Positive'),
  (gen_random_uuid()::text, 'ESBL', 'ESBL', 'Gram Negative'),
  (gen_random_uuid()::text, 'AMPC', 'AmpC', 'Gram Negative'),
  (gen_random_uuid()::text, 'CRE', 'CRE', 'Gram Negative'),
  (gen_random_uuid()::text, 'CRKP', 'CRKP', 'Gram Negative'),
  (gen_random_uuid()::text, 'KPC', 'KPC', 'Gram Negative'),
  (gen_random_uuid()::text, 'NDM', 'NDM', 'Gram Negative'),
  (gen_random_uuid()::text, 'OXA48', 'OXA-48', 'Gram Negative'),
  (gen_random_uuid()::text, 'VIM', 'VIM', 'Gram Negative'),
  (gen_random_uuid()::text, 'IMP', 'IMP', 'Gram Negative'),
  (gen_random_uuid()::text, 'MDR', 'MDR', 'Multi-Drug'),
  (gen_random_uuid()::text, 'XDR', 'XDR', 'Multi-Drug'),
  (gen_random_uuid()::text, 'PDR', 'PDR', 'Multi-Drug'),
  (gen_random_uuid()::text, 'VRE', 'VRE', 'Gram Positive'),
  (gen_random_uuid()::text, 'CR', 'Carbapenem Resistant', 'Gram Negative'),
  (gen_random_uuid()::text, 'CRS', 'Colistin Resistant', 'Gram Negative')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════ 2. INVESTIGATION MODULE ═══════════════════

-- 2a. Investigation categories
CREATE TABLE IF NOT EXISTS investigation_category_master (
  id text primary key,
  category_code text,
  category_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO investigation_category_master (id, category_code, category_name) VALUES
  (gen_random_uuid()::text, 'LAB', 'Laboratory'),
  (gen_random_uuid()::text, 'MICRO', 'Microbiology'),
  (gen_random_uuid()::text, 'RAD', 'Radiology'),
  (gen_random_uuid()::text, 'CARD', 'Cardiology'),
  (gen_random_uuid()::text, 'NEURO', 'Neurology'),
  (gen_random_uuid()::text, 'RESP', 'Respiratory'),
  (gen_random_uuid()::text, 'ENDO', 'Endoscopy'),
  (gen_random_uuid()::text, 'PATH', 'Pathology'),
  (gen_random_uuid()::text, 'GEN', 'Genetics'),
  (gen_random_uuid()::text, 'POC', 'Point of Care')
ON CONFLICT (id) DO NOTHING;

-- 2b. Specific investigations
CREATE TABLE IF NOT EXISTS investigation_master (
  id text primary key,
  investigation_code text,
  investigation_name text not null,
  category text not null,
  sub_category text,
  unit text,
  reference_range text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO investigation_master (id, investigation_code, investigation_name, category, sub_category, unit) VALUES
  -- Hematology
  (gen_random_uuid()::text, 'CBC', 'CBC', 'Laboratory', 'Hematology', ''),
  (gen_random_uuid()::text, 'HB', 'Hb', 'Laboratory', 'Hematology', 'g/dL'),
  (gen_random_uuid()::text, 'HCT', 'Hematocrit', 'Laboratory', 'Hematology', '%'),
  (gen_random_uuid()::text, 'RBC', 'RBC', 'Laboratory', 'Hematology', 'x10⁶/µL'),
  (gen_random_uuid()::text, 'WBC', 'WBC', 'Laboratory', 'Hematology', 'x10³/µL'),
  (gen_random_uuid()::text, 'PLT', 'Platelet Count', 'Laboratory', 'Hematology', 'x10³/µL'),
  (gen_random_uuid()::text, 'MCV', 'MCV', 'Laboratory', 'Hematology', 'fL'),
  (gen_random_uuid()::text, 'MCH', 'MCH', 'Laboratory', 'Hematology', 'pg'),
  (gen_random_uuid()::text, 'MCHC', 'MCHC', 'Laboratory', 'Hematology', 'g/dL'),
  (gen_random_uuid()::text, 'RDW', 'RDW', 'Laboratory', 'Hematology', '%'),
  (gen_random_uuid()::text, 'PS', 'Peripheral Smear', 'Laboratory', 'Hematology', ''),
  (gen_random_uuid()::text, 'RETIC', 'Reticulocyte Count', 'Laboratory', 'Hematology', '%'),
  (gen_random_uuid()::text, 'ESR', 'ESR', 'Laboratory', 'Hematology', 'mm/hr'),
  -- Biochemistry
  (gen_random_uuid()::text, 'GLU', 'Blood Glucose', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'HBA1C', 'HbA1c', 'Laboratory', 'Biochemistry', '%'),
  (gen_random_uuid()::text, 'UREA', 'Urea', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'CR', 'Creatinine', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'BUN', 'BUN', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'EGFR', 'eGFR', 'Laboratory', 'Biochemistry', 'mL/min'),
  (gen_random_uuid()::text, 'NA', 'Sodium', 'Laboratory', 'Biochemistry', 'mEq/L'),
  (gen_random_uuid()::text, 'K', 'Potassium', 'Laboratory', 'Biochemistry', 'mEq/L'),
  (gen_random_uuid()::text, 'CL', 'Chloride', 'Laboratory', 'Biochemistry', 'mEq/L'),
  (gen_random_uuid()::text, 'CA', 'Calcium', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'IONCA', 'Ionized Calcium', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'MG', 'Magnesium', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'PHOS', 'Phosphate', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'ALB', 'Albumin', 'Laboratory', 'Biochemistry', 'g/dL'),
  (gen_random_uuid()::text, 'TP', 'Total Protein', 'Laboratory', 'Biochemistry', 'g/dL'),
  (gen_random_uuid()::text, 'AST', 'AST', 'Laboratory', 'Biochemistry', 'U/L'),
  (gen_random_uuid()::text, 'ALT', 'ALT', 'Laboratory', 'Biochemistry', 'U/L'),
  (gen_random_uuid()::text, 'ALP', 'ALP', 'Laboratory', 'Biochemistry', 'U/L'),
  (gen_random_uuid()::text, 'GGT', 'GGT', 'Laboratory', 'Biochemistry', 'U/L'),
  (gen_random_uuid()::text, 'BILIT', 'Bilirubin Total', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'BILID', 'Bilirubin Direct', 'Laboratory', 'Biochemistry', 'mg/dL'),
  (gen_random_uuid()::text, 'LIP', 'Lipase', 'Laboratory', 'Biochemistry', 'U/L'),
  (gen_random_uuid()::text, 'AMY', 'Amylase', 'Laboratory', 'Biochemistry', 'U/L'),
  (gen_random_uuid()::text, 'LAC', 'Lactate', 'Laboratory', 'Biochemistry', 'mmol/L'),
  -- Coagulation
  (gen_random_uuid()::text, 'PT', 'PT', 'Laboratory', 'Coagulation', 'sec'),
  (gen_random_uuid()::text, 'INR', 'INR', 'Laboratory', 'Coagulation', ''),
  (gen_random_uuid()::text, 'APTT', 'aPTT', 'Laboratory', 'Coagulation', 'sec'),
  (gen_random_uuid()::text, 'FIB', 'Fibrinogen', 'Laboratory', 'Coagulation', 'mg/dL'),
  (gen_random_uuid()::text, 'DDIM', 'D-Dimer', 'Laboratory', 'Coagulation', 'ng/mL'),
  (gen_random_uuid()::text, 'AXA', 'Anti Xa', 'Laboratory', 'Coagulation', 'IU/mL'),
  (gen_random_uuid()::text, 'TEG', 'TEG', 'Laboratory', 'Coagulation', ''),
  (gen_random_uuid()::text, 'ROTEM', 'ROTEM', 'Laboratory', 'Coagulation', ''),
  -- Blood Gas
  (gen_random_uuid()::text, 'ABG', 'ABG', 'Laboratory', 'Blood Gas', ''),
  (gen_random_uuid()::text, 'VBG', 'VBG', 'Laboratory', 'Blood Gas', ''),
  -- Infection
  (gen_random_uuid()::text, 'CRP', 'CRP', 'Laboratory', 'Infection Markers', 'mg/L'),
  (gen_random_uuid()::text, 'PCT', 'Procalcitonin', 'Laboratory', 'Infection Markers', 'ng/mL'),
  (gen_random_uuid()::text, 'FERR', 'Ferritin', 'Laboratory', 'Infection Markers', 'ng/mL'),
  (gen_random_uuid()::text, 'IL6', 'IL-6', 'Laboratory', 'Infection Markers', 'pg/mL'),
  -- Cardiac
  (gen_random_uuid()::text, 'TROP I', 'Troponin I', 'Laboratory', 'Cardiac', 'ng/mL'),
  (gen_random_uuid()::text, 'TROP T', 'Troponin T', 'Laboratory', 'Cardiac', 'ng/mL'),
  (gen_random_uuid()::text, 'CK', 'CK', 'Laboratory', 'Cardiac', 'U/L'),
  (gen_random_uuid()::text, 'CKMB', 'CK-MB', 'Laboratory', 'Cardiac', 'U/L'),
  (gen_random_uuid()::text, 'BNP', 'BNP', 'Laboratory', 'Cardiac', 'pg/mL'),
  (gen_random_uuid()::text, 'NTPROBNP', 'NT-proBNP', 'Laboratory', 'Cardiac', 'pg/mL'),
  -- Endocrine
  (gen_random_uuid()::text, 'TSH', 'TSH', 'Laboratory', 'Endocrine', 'mIU/L'),
  (gen_random_uuid()::text, 'FT3', 'FT3', 'Laboratory', 'Endocrine', 'pg/mL'),
  (gen_random_uuid()::text, 'FT4', 'FT4', 'Laboratory', 'Endocrine', 'ng/dL'),
  (gen_random_uuid()::text, 'CORT', 'Cortisol', 'Laboratory', 'Endocrine', 'µg/dL'),
  (gen_random_uuid()::text, 'ACTH', 'ACTH', 'Laboratory', 'Endocrine', 'pg/mL')
ON CONFLICT (id) DO NOTHING;

-- 2c. Imaging
CREATE TABLE IF NOT EXISTS imaging_master (
  id text primary key,
  imaging_code text,
  imaging_name text not null,
  modality text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO imaging_master (id, imaging_code, imaging_name, modality) VALUES
  (gen_random_uuid()::text, 'CXR', 'Chest X-Ray', 'X-Ray'),
  (gen_random_uuid()::text, 'PCXR', 'Portable Chest X-Ray', 'X-Ray'),
  (gen_random_uuid()::text, 'AXR', 'Abdominal X-Ray', 'X-Ray'),
  (gen_random_uuid()::text, 'CTB', 'CT Brain', 'CT'),
  (gen_random_uuid()::text, 'CTC', 'CT Chest', 'CT'),
  (gen_random_uuid()::text, 'CTA', 'CT Abdomen', 'CT'),
  (gen_random_uuid()::text, 'CTP', 'CT Pelvis', 'CT'),
  (gen_random_uuid()::text, 'ANGIO', 'CT Angiography', 'CT'),
  (gen_random_uuid()::text, 'CTPA', 'CT Pulmonary Angiography', 'CT'),
  (gen_random_uuid()::text, 'MRIB', 'MRI Brain', 'MRI'),
  (gen_random_uuid()::text, 'MRIS', 'MRI Spine', 'MRI'),
  (gen_random_uuid()::text, 'MRIA', 'MRI Abdomen', 'MRI'),
  (gen_random_uuid()::text, 'USGA', 'Ultrasound Abdomen', 'Ultrasound'),
  (gen_random_uuid()::text, 'FAST', 'FAST', 'Ultrasound'),
  (gen_random_uuid()::text, 'POCUS', 'POCUS', 'Ultrasound'),
  (gen_random_uuid()::text, 'ECHO', 'Echocardiography', 'Ultrasound'),
  (gen_random_uuid()::text, 'TEE', 'TEE', 'Ultrasound'),
  (gen_random_uuid()::text, 'DOP', 'Doppler', 'Ultrasound'),
  (gen_random_uuid()::text, 'PET', 'PET CT', 'Nuclear'),
  (gen_random_uuid()::text, 'BSCN', 'Bone Scan', 'Nuclear')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════ 3. DEVICE MODULE ═══════════════════

-- 3a. Device categories
CREATE TABLE IF NOT EXISTS device_category_master (
  id text primary key,
  category_code text,
  category_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO device_category_master (id, category_code, category_name) VALUES
  (gen_random_uuid()::text, 'AIR', 'Airway'),
  (gen_random_uuid()::text, 'VENT', 'Ventilator'),
  (gen_random_uuid()::text, 'VASC', 'Vascular Access'),
  (gen_random_uuid()::text, 'DRN', 'Drain'),
  (gen_random_uuid()::text, 'URN', 'Urinary'),
  (gen_random_uuid()::text, 'FEED', 'Feeding'),
  (gen_random_uuid()::text, 'DIAL', 'Dialysis'),
  (gen_random_uuid()::text, 'MON', 'Monitoring'),
  (gen_random_uuid()::text, 'CARD', 'Cardiac Support'),
  (gen_random_uuid()::text, 'INF', 'Infusion'),
  (gen_random_uuid()::text, 'RESP', 'Respiratory Support'),
  (gen_random_uuid()::text, 'SURG', 'Surgical'),
  (gen_random_uuid()::text, 'OTH', 'Other')
ON CONFLICT (id) DO NOTHING;

-- 3b. Device types
CREATE TABLE IF NOT EXISTS device_master (
  id text primary key,
  device_code text,
  device_name text not null,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO device_master (id, device_code, device_name, category) VALUES
  -- Airway
  (gen_random_uuid()::text, 'NC', 'Nasal Cannula', 'Airway'),
  (gen_random_uuid()::text, 'SFM', 'Simple Face Mask', 'Airway'),
  (gen_random_uuid()::text, 'VM', 'Venturi Mask', 'Airway'),
  (gen_random_uuid()::text, 'NRBM', 'Non-Rebreather Mask', 'Airway'),
  (gen_random_uuid()::text, 'HFNC', 'High Flow Nasal Cannula', 'Airway'),
  (gen_random_uuid()::text, 'CPAP', 'CPAP', 'Airway'),
  (gen_random_uuid()::text, 'BIPAP', 'BiPAP', 'Airway'),
  (gen_random_uuid()::text, 'ETT', 'Endotracheal Tube', 'Airway'),
  (gen_random_uuid()::text, 'TRACH', 'Tracheostomy Tube', 'Airway'),
  (gen_random_uuid()::text, 'LMA', 'Laryngeal Mask Airway', 'Airway'),
  -- Ventilator
  (gen_random_uuid()::text, 'MV', 'Mechanical Ventilator', 'Ventilator'),
  (gen_random_uuid()::text, 'TV', 'Transport Ventilator', 'Ventilator'),
  (gen_random_uuid()::text, 'PV', 'Portable Ventilator', 'Ventilator'),
  (gen_random_uuid()::text, 'ECMO', 'ECMO', 'Ventilator'),
  -- Vascular Access
  (gen_random_uuid()::text, 'PIV', 'Peripheral IV', 'Vascular Access'),
  (gen_random_uuid()::text, 'MDL', 'Midline', 'Vascular Access'),
  (gen_random_uuid()::text, 'PICC', 'PICC', 'Vascular Access'),
  (gen_random_uuid()::text, 'CVC', 'Central Venous Catheter', 'Vascular Access'),
  (gen_random_uuid()::text, 'TLC', 'Triple Lumen Catheter', 'Vascular Access'),
  (gen_random_uuid()::text, 'DIALC', 'Dialysis Catheter', 'Vascular Access'),
  (gen_random_uuid()::text, 'AL', 'Arterial Line', 'Vascular Access'),
  (gen_random_uuid()::text, 'PAC', 'Pulmonary Artery Catheter', 'Vascular Access'),
  (gen_random_uuid()::text, 'PORT', 'Implantable Port', 'Vascular Access'),
  -- Drains
  (gen_random_uuid()::text, 'CHT', 'Chest Tube', 'Drain'),
  (gen_random_uuid()::text, 'ICD', 'Intercostal Drain', 'Drain'),
  (gen_random_uuid()::text, 'JPD', 'JP Drain', 'Drain'),
  (gen_random_uuid()::text, 'HEMOVAC', 'Hemovac', 'Drain'),
  (gen_random_uuid()::text, 'PIG', 'Pigtail', 'Drain'),
  (gen_random_uuid()::text, 'BILD', 'Biliary Drain', 'Drain'),
  (gen_random_uuid()::text, 'NEPH', 'Nephrostomy', 'Drain'),
  (gen_random_uuid()::text, 'ABDD', 'Abdominal Drain', 'Drain'),
  (gen_random_uuid()::text, 'PELD', 'Pelvic Drain', 'Drain'),
  -- Urinary
  (gen_random_uuid()::text, 'FOLEY', 'Foley Catheter', 'Urinary'),
  (gen_random_uuid()::text, 'SPC', 'Suprapubic Catheter', 'Urinary'),
  (gen_random_uuid()::text, 'EXTC', 'External Catheter', 'Urinary'),
  (gen_random_uuid()::text, 'NEPHT', 'Nephrostomy Tube', 'Urinary'),
  -- Feeding
  (gen_random_uuid()::text, 'NGT', 'Nasogastric Tube', 'Feeding'),
  (gen_random_uuid()::text, 'OGT', 'Orogastric Tube', 'Feeding'),
  (gen_random_uuid()::text, 'PEG', 'PEG Tube', 'Feeding'),
  (gen_random_uuid()::text, 'PEJ', 'PEJ Tube', 'Feeding'),
  (gen_random_uuid()::text, 'NJT', 'NJ Tube', 'Feeding'),
  (gen_random_uuid()::text, 'TPN', 'TPN Central Line', 'Feeding'),
  -- Dialysis
  (gen_random_uuid()::text, 'HDC', 'Hemodialysis Catheter', 'Dialysis'),
  (gen_random_uuid()::text, 'CRRT', 'CRRT Machine', 'Dialysis'),
  (gen_random_uuid()::text, 'HDM', 'Hemodialysis Machine', 'Dialysis'),
  (gen_random_uuid()::text, 'PDC', 'Peritoneal Dialysis Catheter', 'Dialysis'),
  -- Monitoring
  (gen_random_uuid()::text, 'ECGL', 'ECG Leads', 'Monitoring'),
  (gen_random_uuid()::text, 'SPO2', 'SpO₂ Probe', 'Monitoring'),
  (gen_random_uuid()::text, 'TEMP', 'Temperature Probe', 'Monitoring'),
  (gen_random_uuid()::text, 'CAPNO', 'Capnography', 'Monitoring'),
  (gen_random_uuid()::text, 'CVP', 'CVP Monitor', 'Monitoring'),
  (gen_random_uuid()::text, 'ICP', 'ICP Monitor', 'Monitoring'),
  (gen_random_uuid()::text, 'BIS', 'BIS Monitor', 'Monitoring'),
  (gen_random_uuid()::text, 'APM', 'Arterial Pressure Monitor', 'Monitoring'),
  (gen_random_uuid()::text, 'COM', 'Cardiac Output Monitor', 'Monitoring'),
  -- Infusion
  (gen_random_uuid()::text, 'SP', 'Syringe Pump', 'Infusion'),
  (gen_random_uuid()::text, 'IP', 'Infusion Pump', 'Infusion'),
  (gen_random_uuid()::text, 'PCA', 'PCA Pump', 'Infusion'),
  (gen_random_uuid()::text, 'INSP', 'Insulin Pump', 'Infusion'),
  -- Cardiac Support
  (gen_random_uuid()::text, 'TP', 'Temporary Pacemaker', 'Cardiac Support'),
  (gen_random_uuid()::text, 'PP', 'Permanent Pacemaker', 'Cardiac Support'),
  (gen_random_uuid()::text, 'IABP', 'IABP', 'Cardiac Support'),
  (gen_random_uuid()::text, 'IMPELLA', 'Impella', 'Cardiac Support'),
  (gen_random_uuid()::text, 'LVAD', 'LVAD', 'Cardiac Support')
ON CONFLICT (id) DO NOTHING;

-- 3c. Device sites
CREATE TABLE IF NOT EXISTS device_site_master (
  id text primary key,
  site_code text,
  site_name text not null,
  region text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO device_site_master (id, site_code, site_name, region) VALUES
  (gen_random_uuid()::text, 'RIJ', 'Right Internal Jugular', 'Neck'),
  (gen_random_uuid()::text, 'LIJ', 'Left Internal Jugular', 'Neck'),
  (gen_random_uuid()::text, 'RF', 'Right Femoral', 'Groin'),
  (gen_random_uuid()::text, 'LF', 'Left Femoral', 'Groin'),
  (gen_random_uuid()::text, 'RSC', 'Right Subclavian', 'Chest'),
  (gen_random_uuid()::text, 'LSC', 'Left Subclavian', 'Chest'),
  (gen_random_uuid()::text, 'RR', 'Right Radial', 'Arm'),
  (gen_random_uuid()::text, 'LR', 'Left Radial', 'Arm'),
  (gen_random_uuid()::text, 'RBAS', 'Right Basilic', 'Arm'),
  (gen_random_uuid()::text, 'LBAS', 'Left Basilic', 'Arm'),
  (gen_random_uuid()::text, 'RCEP', 'Right Cephalic', 'Arm'),
  (gen_random_uuid()::text, 'LCEP', 'Left Cephalic', 'Arm'),
  (gen_random_uuid()::text, 'RBR', 'Right Brachial', 'Arm'),
  (gen_random_uuid()::text, 'LBR', 'Left Brachial', 'Arm'),
  (gen_random_uuid()::text, 'RA', 'Right Arm', 'Arm'),
  (gen_random_uuid()::text, 'LA', 'Left Arm', 'Arm'),
  (gen_random_uuid()::text, 'RL', 'Right Leg', 'Leg'),
  (gen_random_uuid()::text, 'LL', 'Left Leg', 'Leg'),
  (gen_random_uuid()::text, 'CHEST', 'Chest', 'Chest'),
  (gen_random_uuid()::text, 'ABD', 'Abdomen', 'Abdomen'),
  (gen_random_uuid()::text, 'PEL', 'Pelvis', 'Pelvis'),
  (gen_random_uuid()::text, 'NCK', 'Neck', 'Neck'),
  (gen_random_uuid()::text, 'BCK', 'Back', 'Back')
ON CONFLICT (id) DO NOTHING;

-- 3d. Device statuses
CREATE TABLE IF NOT EXISTS device_status_master (
  id text primary key,
  status_code text,
  status_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO device_status_master (id, status_code, status_name) VALUES
  (gen_random_uuid()::text, 'PLN', 'Planned'),
  (gen_random_uuid()::text, 'ORD', 'Ordered'),
  (gen_random_uuid()::text, 'INS', 'Inserted'),
  (gen_random_uuid()::text, 'ACT', 'Active'),
  (gen_random_uuid()::text, 'USE', 'In Use'),
  (gen_random_uuid()::text, 'PAU', 'Paused'),
  (gen_random_uuid()::text, 'BLK', 'Blocked'),
  (gen_random_uuid()::text, 'OCC', 'Occluded'),
  (gen_random_uuid()::text, 'DIS', 'Dislodged'),
  (gen_random_uuid()::text, 'MAL', 'Malfunction'),
  (gen_random_uuid()::text, 'REV', 'Needs Review'),
  (gen_random_uuid()::text, 'SUS', 'Suspected Infection'),
  (gen_random_uuid()::text, 'REM', 'Removed'),
  (gen_random_uuid()::text, 'RPL', 'Replaced'),
  (gen_random_uuid()::text, 'EXP', 'Expired')
ON CONFLICT (id) DO NOTHING;

-- 3e. Site assessment findings
CREATE TABLE IF NOT EXISTS device_assessment_master (
  id text primary key,
  assessment_code text,
  assessment_name text not null,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO device_assessment_master (id, assessment_code, assessment_name, category) VALUES
  (gen_random_uuid()::text, 'CLN', 'Clean', 'Normal'),
  (gen_random_uuid()::text, 'DRY', 'Dry', 'Normal'),
  (gen_random_uuid()::text, 'INT', 'Intact', 'Normal'),
  (gen_random_uuid()::text, 'RED', 'Redness', 'Abnormal'),
  (gen_random_uuid()::text, 'TND', 'Tenderness', 'Abnormal'),
  (gen_random_uuid()::text, 'PAN', 'Pain', 'Abnormal'),
  (gen_random_uuid()::text, 'WTH', 'Warmth', 'Abnormal'),
  (gen_random_uuid()::text, 'SWL', 'Swelling', 'Abnormal'),
  (gen_random_uuid()::text, 'LEAK', 'Leakage', 'Abnormal'),
  (gen_random_uuid()::text, 'BLEED', 'Bleeding', 'Abnormal'),
  (gen_random_uuid()::text, 'PUS', 'Pus', 'Abnormal'),
  (gen_random_uuid()::text, 'DCH', 'Discharge', 'Abnormal'),
  (gen_random_uuid()::text, 'SEC', 'Secure', 'Normal'),
  (gen_random_uuid()::text, 'LOS', 'Loose', 'Abnormal'),
  (gen_random_uuid()::text, 'BLO', 'Blocked', 'Abnormal'),
  (gen_random_uuid()::text, 'PAT', 'Patent', 'Normal'),
  (gen_random_uuid()::text, 'FLS', 'Flushed', 'Intervention'),
  (gen_random_uuid()::text, 'DRS', 'Dressing Intact', 'Normal'),
  (gen_random_uuid()::text, 'DRC', 'Dressing Changed', 'Intervention')
ON CONFLICT (id) DO NOTHING;

-- 3f. Device events
CREATE TABLE IF NOT EXISTS device_event_master (
  id text primary key,
  event_code text,
  event_name text not null,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO device_event_master (id, event_code, event_name, category) VALUES
  (gen_random_uuid()::text, 'INS', 'Inserted', 'Procedure'),
  (gen_random_uuid()::text, 'ACT', 'Activated', 'Procedure'),
  (gen_random_uuid()::text, 'ADJ', 'Adjusted', 'Maintenance'),
  (gen_random_uuid()::text, 'ADV', 'Advanced', 'Maintenance'),
  (gen_random_uuid()::text, 'WTHD', 'Withdrawn', 'Maintenance'),
  (gen_random_uuid()::text, 'FLS', 'Flushed', 'Maintenance'),
  (gen_random_uuid()::text, 'LCK', 'Locked', 'Maintenance'),
  (gen_random_uuid()::text, 'ULCK', 'Unlocked', 'Maintenance'),
  (gen_random_uuid()::text, 'DRSG', 'Dressing Changed', 'Maintenance'),
  (gen_random_uuid()::text, 'CUL', 'Culture Sent', 'Clinical'),
  (gen_random_uuid()::text, 'OCC', 'Occluded', 'Complication'),
  (gen_random_uuid()::text, 'BLK', 'Blocked', 'Complication'),
  (gen_random_uuid()::text, 'COMP', 'Complication', 'Complication'),
  (gen_random_uuid()::text, 'REM', 'Removed', 'Procedure'),
  (gen_random_uuid()::text, 'REINS', 'Reinserted', 'Procedure'),
  (gen_random_uuid()::text, 'RPL', 'Replaced', 'Procedure'),
  (gen_random_uuid()::text, 'EXP', 'Expired', 'End')
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_culture_master_name ON culture_master(culture_name);
CREATE INDEX IF NOT EXISTS idx_specimen_master_name ON specimen_master(specimen_name);
CREATE INDEX IF NOT EXISTS idx_organism_master_name ON organism_master(organism_name);
CREATE INDEX IF NOT EXISTS idx_organism_master_category ON organism_master(category);
CREATE INDEX IF NOT EXISTS idx_investigation_master_name ON investigation_master(investigation_name);
CREATE INDEX IF NOT EXISTS idx_investigation_master_category ON investigation_master(category);
CREATE INDEX IF NOT EXISTS idx_device_master_name ON device_master(device_name);
CREATE INDEX IF NOT EXISTS idx_device_master_category ON device_master(category);
CREATE INDEX IF NOT EXISTS idx_device_site_master_name ON device_site_master(site_name);
