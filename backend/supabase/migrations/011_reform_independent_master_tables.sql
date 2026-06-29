-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 011: Reform Independent Master Tables
-- 
-- Replaces all old relational mapping tables and comprehensive catalogs
-- with simple independent master tables. No auto-linking logic.
-- ══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════ 1. DROP OLD RELATIONAL/MAPPING TABLES ═══════════════════

-- Drop 010 comprehensive mapping tables (FK-dependent first)
DROP TABLE IF EXISTS dx_culture_mapping CASCADE;
DROP TABLE IF EXISTS dx_device_mapping CASCADE;
DROP TABLE IF EXISTS dx_investigation_mapping CASCADE;
DROP TABLE IF EXISTS culture_organism_mapping CASCADE;
DROP TABLE IF EXISTS investigation_culture_mapping CASCADE;
DROP TABLE IF EXISTS device_culture_mapping CASCADE;
DROP TABLE IF EXISTS device_investigation_mapping CASCADE;
DROP TABLE IF EXISTS allergy_cross_reactivity CASCADE;
DROP TABLE IF EXISTS organism_susceptibility CASCADE;
DROP TABLE IF EXISTS abx_device_mapping CASCADE;
DROP TABLE IF EXISTS abx_investigation_mapping CASCADE;
DROP TABLE IF EXISTS abx_culture_mapping CASCADE;
DROP TABLE IF EXISTS dx_antibiotic_mapping CASCADE;
DROP TABLE IF EXISTS stewardship_review_triggers CASCADE;

-- Drop 010 catalogs
DROP TABLE IF EXISTS organism_catalog CASCADE;
DROP TABLE IF EXISTS culture_catalog CASCADE;
DROP TABLE IF EXISTS device_catalog CASCADE;
DROP TABLE IF EXISTS investigation_catalog CASCADE;
DROP TABLE IF EXISTS antibiotic_catalog CASCADE;
DROP TABLE IF EXISTS diagnosis_catalog CASCADE;

-- Drop 009 mapping
DROP TABLE IF EXISTS antibiotic_culture_mapping CASCADE;

-- Drop broader session mapping
DROP TABLE IF EXISTS antibiotic_culture_links CASCADE;

-- Drop 008 old antibiotic master tables
DROP TABLE IF EXISTS antibiotic_master CASCADE;
DROP TABLE IF EXISTS antibiotic_class_master CASCADE;
DROP TABLE IF EXISTS coverage_master CASCADE;
DROP TABLE IF EXISTS stewardship_status_master CASCADE;
DROP TABLE IF EXISTS infection_syndrome_master CASCADE;

-- Drop old 007 master tables (replaced by new independent ones)
DROP TABLE IF EXISTS culture_master CASCADE;
DROP TABLE IF EXISTS specimen_master CASCADE;
DROP TABLE IF EXISTS organism_master CASCADE;
DROP TABLE IF EXISTS susceptibility_master CASCADE;
DROP TABLE IF EXISTS resistance_marker_master CASCADE;
DROP TABLE IF EXISTS investigation_category_master CASCADE;
DROP TABLE IF EXISTS investigation_master CASCADE;
DROP TABLE IF EXISTS imaging_master CASCADE;
DROP TABLE IF EXISTS device_category_master CASCADE;
DROP TABLE IF EXISTS device_master CASCADE;
DROP TABLE IF EXISTS device_site_master CASCADE;
DROP TABLE IF EXISTS device_status_master CASCADE;
DROP TABLE IF EXISTS device_assessment_master CASCADE;
DROP TABLE IF EXISTS device_event_master CASCADE;

-- Drop old culture linkage column (was a migration-005 column add, no table to drop)
-- culture_organisms and culture_sensitivities are kept as sub-entity tables for culture results

-- ═══════════════════ 2. CREATE INDEPENDENT MASTER TABLES ═══════════════════

-- ═══════════════════ 2a. ANTIBIOTIC MASTER ═══════════════════

DROP TABLE IF EXISTS antibiotic_master CASCADE;
CREATE TABLE antibiotic_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generic_name VARCHAR(150) NOT NULL,
  antibiotic_class VARCHAR(100) NOT NULL,
  subclass VARCHAR(100),
  is_core_icu BOOLEAN DEFAULT FALSE,
  aware_category VARCHAR(20),
  restricted BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO antibiotic_master (generic_name, antibiotic_class, subclass, aware_category, restricted) VALUES
  -- Natural Penicillins
  ('Penicillin G', 'Natural Penicillins', NULL, 'Access', FALSE),
  ('Penicillin V', 'Natural Penicillins', NULL, 'Access', FALSE),
  ('Benzathine Penicillin G', 'Natural Penicillins', NULL, 'Access', FALSE),
  ('Procaine Penicillin G', 'Natural Penicillins', NULL, 'Access', FALSE),
  -- Aminopenicillins
  ('Ampicillin', 'Aminopenicillins', NULL, 'Access', FALSE),
  ('Amoxicillin', 'Aminopenicillins', NULL, 'Access', FALSE),
  ('Bacampicillin', 'Aminopenicillins', NULL, 'Access', FALSE),
  -- Anti-staphylococcal Penicillins
  ('Oxacillin', 'Anti-staphylococcal Penicillins', NULL, 'Access', FALSE),
  ('Cloxacillin', 'Anti-staphylococcal Penicillins', NULL, 'Access', FALSE),
  ('Dicloxacillin', 'Anti-staphylococcal Penicillins', NULL, 'Access', FALSE),
  ('Flucloxacillin', 'Anti-staphylococcal Penicillins', NULL, 'Access', FALSE),
  ('Nafcillin', 'Anti-staphylococcal Penicillins', NULL, 'Access', FALSE),
  -- Extended-spectrum Penicillins
  ('Piperacillin', 'Extended-spectrum Penicillins', NULL, 'Watch', FALSE),
  ('Ticarcillin', 'Extended-spectrum Penicillins', NULL, 'Watch', FALSE),
  ('Mezlocillin', 'Extended-spectrum Penicillins', NULL, 'Watch', FALSE),
  ('Azlocillin', 'Extended-spectrum Penicillins', NULL, 'Watch', FALSE),
  -- β-lactam/β-lactamase Inhibitors
  ('Amoxicillin-Clavulanate', 'β-lactam/β-lactamase Inhibitors', NULL, 'Access', FALSE),
  ('Ampicillin-Sulbactam', 'β-lactam/β-lactamase Inhibitors', NULL, 'Access', FALSE),
  ('Piperacillin-Tazobactam', 'β-lactam/β-lactamase Inhibitors', NULL, 'Watch', FALSE),
  ('Ticarcillin-Clavulanate', 'β-lactam/β-lactamase Inhibitors', NULL, 'Watch', FALSE),
  ('Cefoperazone-Sulbactam', 'β-lactam/β-lactamase Inhibitors', NULL, 'Watch', FALSE),
  -- 1st Generation Cephalosporins
  ('Cefazolin', '1st Generation Cephalosporins', NULL, 'Access', FALSE),
  ('Cephalexin', '1st Generation Cephalosporins', NULL, 'Access', FALSE),
  ('Cefadroxil', '1st Generation Cephalosporins', NULL, 'Access', FALSE),
  ('Cephradine', '1st Generation Cephalosporins', NULL, 'Access', FALSE),
  -- 2nd Generation Cephalosporins
  ('Cefuroxime', '2nd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefaclor', '2nd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefprozil', '2nd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefoxitin', '2nd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefotetan', '2nd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Loracarbef', '2nd Generation Cephalosporins', NULL, 'Watch', FALSE),
  -- 3rd Generation Cephalosporins
  ('Ceftriaxone', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefotaxime', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Ceftazidime', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefixime', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefpodoxime', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefdinir', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefditoren', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefoperazone', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Ceftibuten', '3rd Generation Cephalosporins', NULL, 'Watch', FALSE),
  -- 4th Generation Cephalosporins
  ('Cefepime', '4th Generation Cephalosporins', NULL, 'Watch', FALSE),
  ('Cefpirome', '4th Generation Cephalosporins', NULL, 'Watch', FALSE),
  -- 5th Generation Cephalosporins
  ('Ceftaroline', '5th Generation Cephalosporins', NULL, 'Reserve', FALSE),
  ('Ceftobiprole', '5th Generation Cephalosporins', NULL, 'Reserve', FALSE),
  -- Carbapenems
  ('Meropenem', 'Carbapenems', NULL, 'Watch', FALSE),
  ('Imipenem-Cilastatin', 'Carbapenems', NULL, 'Watch', FALSE),
  ('Ertapenem', 'Carbapenems', NULL, 'Watch', FALSE),
  ('Doripenem', 'Carbapenems', NULL, 'Watch', FALSE),
  -- Monobactams
  ('Aztreonam', 'Monobactams', NULL, 'Watch', FALSE),
  -- Glycopeptides
  ('Vancomycin', 'Glycopeptides', NULL, 'Watch', FALSE),
  ('Teicoplanin', 'Glycopeptides', NULL, 'Watch', FALSE),
  -- Lipoglycopeptides
  ('Dalbavancin', 'Lipoglycopeptides', NULL, 'Reserve', FALSE),
  ('Oritavancin', 'Lipoglycopeptides', NULL, 'Reserve', FALSE),
  ('Telavancin', 'Lipoglycopeptides', NULL, 'Reserve', FALSE),
  -- Oxazolidinones
  ('Linezolid', 'Oxazolidinones', NULL, 'Watch', FALSE),
  ('Tedizolid', 'Oxazolidinones', NULL, 'Reserve', FALSE),
  -- Lipopeptides
  ('Daptomycin', 'Lipopeptides', NULL, 'Watch', FALSE),
  -- Aminoglycosides
  ('Gentamicin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Amikacin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Tobramycin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Netilmicin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Streptomycin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Kanamycin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Neomycin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Paromomycin', 'Aminoglycosides', NULL, 'Access', FALSE),
  ('Plazomicin', 'Aminoglycosides', NULL, 'Reserve', FALSE),
  -- Fluoroquinolones
  ('Ciprofloxacin', 'Fluoroquinolones', NULL, 'Watch', FALSE),
  ('Levofloxacin', 'Fluoroquinolones', NULL, 'Watch', FALSE),
  ('Moxifloxacin', 'Fluoroquinolones', NULL, 'Watch', FALSE),
  ('Ofloxacin', 'Fluoroquinolones', NULL, 'Watch', FALSE),
  ('Norfloxacin', 'Fluoroquinolones', NULL, 'Watch', FALSE),
  ('Delafloxacin', 'Fluoroquinolones', NULL, 'Reserve', FALSE),
  ('Gemifloxacin', 'Fluoroquinolones', NULL, 'Watch', FALSE),
  ('Lomefloxacin', 'Fluoroquinolones', NULL, 'Watch', FALSE),
  -- Macrolides
  ('Azithromycin', 'Macrolides', NULL, 'Watch', FALSE),
  ('Clarithromycin', 'Macrolides', NULL, 'Watch', FALSE),
  ('Erythromycin', 'Macrolides', NULL, 'Watch', FALSE),
  ('Roxithromycin', 'Macrolides', NULL, 'Watch', FALSE),
  ('Spiramycin', 'Macrolides', NULL, 'Watch', FALSE),
  -- Tetracyclines
  ('Doxycycline', 'Tetracyclines', NULL, 'Access', FALSE),
  ('Minocycline', 'Tetracyclines', NULL, 'Access', FALSE),
  ('Tetracycline', 'Tetracyclines', NULL, 'Access', FALSE),
  ('Demeclocycline', 'Tetracyclines', NULL, 'Access', FALSE),
  ('Sarecycline', 'Tetracyclines', NULL, 'Access', FALSE),
  -- Glycylcycline / New Tetracyclines
  ('Tigecycline', 'Glycylcycline / New Tetracyclines', NULL, 'Reserve', FALSE),
  ('Eravacycline', 'Glycylcycline / New Tetracyclines', NULL, 'Reserve', FALSE),
  ('Omadacycline', 'Glycylcycline / New Tetracyclines', NULL, 'Reserve', FALSE),
  -- Lincosamides
  ('Clindamycin', 'Lincosamides', NULL, 'Access', FALSE),
  ('Lincomycin', 'Lincosamides', NULL, 'Access', FALSE),
  -- Nitroimidazoles
  ('Metronidazole', 'Nitroimidazoles', NULL, 'Access', FALSE),
  ('Tinidazole', 'Nitroimidazoles', NULL, 'Access', FALSE),
  ('Ornidazole', 'Nitroimidazoles', NULL, 'Access', FALSE),
  ('Secnidazole', 'Nitroimidazoles', NULL, 'Access', FALSE),
  -- Sulfonamides
  ('Trimethoprim-Sulfamethoxazole', 'Sulfonamides', NULL, 'Access', FALSE),
  ('Sulfadiazine', 'Sulfonamides', NULL, 'Access', FALSE),
  ('Sulfisoxazole', 'Sulfonamides', NULL, 'Access', FALSE),
  -- Nitrofurans
  ('Nitrofurantoin', 'Nitrofurans', NULL, 'Access', FALSE),
  ('Furazolidone', 'Nitrofurans', NULL, 'Access', FALSE),
  -- Phosphonic Acid Derivatives
  ('Fosfomycin', 'Phosphonic Acid Derivatives', NULL, 'Watch', FALSE),
  -- Polymyxins
  ('Colistin (Colistimethate Sodium)', 'Polymyxins', NULL, 'Reserve', TRUE),
  ('Polymyxin B', 'Polymyxins', NULL, 'Reserve', TRUE),
  -- Rifamycins
  ('Rifampin (Rifampicin)', 'Rifamycins', NULL, 'Watch', FALSE),
  ('Rifabutin', 'Rifamycins', NULL, 'Watch', FALSE),
  ('Rifapentine', 'Rifamycins', NULL, 'Watch', FALSE),
  -- Amphenicols
  ('Chloramphenicol', 'Amphenicols', NULL, 'Watch', FALSE),
  -- Streptogramins
  ('Quinupristin-Dalfopristin', 'Streptogramins', NULL, 'Reserve', FALSE),
  -- Pleuromutilins
  ('Lefamulin', 'Pleuromutilins', NULL, 'Watch', FALSE),
  -- Urinary Antibiotics
  ('Methenamine Hippurate', 'Urinary Antibiotics', NULL, 'Access', FALSE),
  -- Drugs for Clostridioides difficile
  ('Fidaxomicin', 'Drugs for Clostridioides difficile', NULL, 'Reserve', FALSE),
  -- New β-lactam/β-lactamase Inhibitor Combinations
  ('Ceftazidime-Avibactam', 'New β-lactam/β-lactamase Inhibitor Combinations', NULL, 'Reserve', TRUE),
  ('Ceftolozane-Tazobactam', 'New β-lactam/β-lactamase Inhibitor Combinations', NULL, 'Reserve', TRUE),
  ('Meropenem-Vaborbactam', 'New β-lactam/β-lactamase Inhibitor Combinations', NULL, 'Reserve', TRUE),
  ('Imipenem-Cilastatin-Relebactam', 'New β-lactam/β-lactamase Inhibitor Combinations', NULL, 'Reserve', TRUE),
  -- Siderophore Cephalosporin
  ('Cefiderocol', 'Siderophore Cephalosporin', NULL, 'Reserve', TRUE),
  -- Other Specialized Agents
  ('Temocillin', 'Other Specialized Agents', NULL, 'Watch', FALSE),
  ('Spectinomycin', 'Other Specialized Agents', NULL, 'Access', FALSE);

-- ═══════════════════ 2b. ROUTE MASTER ═══════════════════

CREATE TABLE route_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name VARCHAR(100) NOT NULL,
  route_code VARCHAR(20),
  route_category VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO route_master (route_name, route_code, route_category) VALUES
  -- Enteral
  ('Oral (PO)', 'PO', 'Enteral'),
  ('Oral via NG Tube', 'NG', 'Enteral'),
  ('Oral via OG Tube', 'OG', 'Enteral'),
  ('Oral via PEG Tube', 'PEG', 'Enteral'),
  ('Oral via PEJ Tube', 'PEJ', 'Enteral'),
  ('Oral via Jejunostomy Tube', 'JEJ', 'Enteral'),
  ('Sublingual (SL)', 'SL', 'Enteral'),
  ('Buccal', 'BUCCAL', 'Enteral'),
  ('Rectal (PR)', 'PR', 'Enteral'),
  -- Parenteral
  ('Intravenous (IV)', 'IV', 'Parenteral'),
  ('IV Push', 'IVP', 'Parenteral'),
  ('IV Infusion', 'IVI', 'Parenteral'),
  ('Intramuscular (IM)', 'IM', 'Parenteral'),
  ('Subcutaneous (SC/SQ)', 'SC', 'Parenteral'),
  ('Intradermal (ID)', 'ID', 'Parenteral'),
  ('Intraosseous (IO)', 'IO', 'Parenteral'),
  ('Intrathecal', 'IT', 'Parenteral'),
  ('Epidural', 'EPI', 'Parenteral'),
  ('Intra-articular', 'IA', 'Parenteral'),
  ('Intraperitoneal', 'IP', 'Parenteral'),
  -- Topical
  ('Topical', 'TOP', 'Topical'),
  ('Transdermal Patch', 'TD', 'Topical'),
  ('Ophthalmic (Eye)', 'OPH', 'Topical'),
  ('Otic (Ear)', 'OTIC', 'Topical'),
  ('Nasal', 'NASAL', 'Topical'),
  ('Vaginal', 'VAG', 'Topical'),
  ('Urethral', 'URET', 'Topical'),
  -- Respiratory
  ('Inhalation', 'INH', 'Respiratory'),
  ('Nebulization', 'NEB', 'Respiratory'),
  ('Endotracheal', 'ET', 'Respiratory'),
  ('Tracheostomy', 'TRACH', 'Respiratory');

-- ═══════════════════ 2c. ANTIBIOTIC-ROUTE MAPPING ═══════════════════

CREATE TABLE antibiotic_route_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  antibiotic_id UUID NOT NULL REFERENCES antibiotic_master(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES route_master(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(antibiotic_id, route_id)
);

-- ═══════════════════ 2d. CULTURE MASTER ═══════════════════

CREATE TABLE culture_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  culture_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  specimen_type VARCHAR(100),
  body_site VARCHAR(100),
  is_sterile_site BOOLEAN DEFAULT FALSE,
  is_surveillance BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO culture_master (culture_name, category, is_sterile_site, is_surveillance) VALUES
  -- Blood Cultures
  ('Blood Culture', 'Blood', TRUE, FALSE),
  ('Peripheral Blood Culture', 'Blood', TRUE, FALSE),
  ('Central Line Blood Culture', 'Blood', TRUE, FALSE),
  ('Arterial Line Blood Culture', 'Blood', TRUE, FALSE),
  ('PICC Line Blood Culture', 'Blood', TRUE, FALSE),
  ('Port Blood Culture', 'Blood', TRUE, FALSE),
  ('Pediatric Blood Culture', 'Blood', TRUE, FALSE),
  ('Fungal Blood Culture', 'Blood', TRUE, FALSE),
  ('Mycobacterial Blood Culture', 'Blood', TRUE, FALSE),
  -- Urine Cultures
  ('Urine Culture', 'Urine', FALSE, FALSE),
  ('Midstream Urine Culture (MSU)', 'Urine', FALSE, FALSE),
  ('Catheter Urine Culture', 'Urine', FALSE, FALSE),
  ('Foley Catheter Urine Culture', 'Urine', FALSE, FALSE),
  ('Suprapubic Aspirate Culture', 'Urine', TRUE, FALSE),
  ('Nephrostomy Urine Culture', 'Urine', TRUE, FALSE),
  ('Ureteric Urine Culture', 'Urine', TRUE, FALSE),
  -- Respiratory Cultures
  ('Sputum Culture', 'Respiratory', FALSE, FALSE),
  ('Induced Sputum Culture', 'Respiratory', FALSE, FALSE),
  ('Endotracheal Aspirate (ETA)', 'Respiratory', FALSE, FALSE),
  ('Tracheal Aspirate', 'Respiratory', FALSE, FALSE),
  ('Bronchoalveolar Lavage (BAL)', 'Respiratory', TRUE, FALSE),
  ('Bronchial Wash', 'Respiratory', TRUE, FALSE),
  ('Protected Specimen Brush (PSB)', 'Respiratory', TRUE, FALSE),
  ('Nasopharyngeal Aspirate Culture', 'Respiratory', FALSE, FALSE),
  ('Respiratory Viral Culture', 'Respiratory', FALSE, FALSE),
  -- CSF & CNS
  ('CSF Culture', 'CNS', TRUE, FALSE),
  ('Ventricular CSF Culture', 'CNS', TRUE, FALSE),
  ('Brain Abscess Culture', 'CNS', TRUE, FALSE),
  -- Sterile Body Fluid Cultures
  ('Pleural Fluid Culture', 'Sterile Body Fluids', TRUE, FALSE),
  ('Pericardial Fluid Culture', 'Sterile Body Fluids', TRUE, FALSE),
  ('Ascitic Fluid Culture', 'Sterile Body Fluids', TRUE, FALSE),
  ('Peritoneal Fluid Culture', 'Sterile Body Fluids', TRUE, FALSE),
  ('Synovial Fluid Culture', 'Sterile Body Fluids', TRUE, FALSE),
  ('Peritoneal Dialysis Fluid Culture', 'Sterile Body Fluids', TRUE, FALSE),
  -- Wound & Soft Tissue
  ('Wound Swab Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Deep Wound Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Superficial Wound Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Surgical Site Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Pus Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Abscess Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Deep Tissue Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Soft Tissue Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Necrotizing Fasciitis Tissue Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  ('Burn Wound Culture', 'Wound & Soft Tissue', FALSE, FALSE),
  -- Bone & Joint
  ('Bone Culture', 'Bone & Joint', TRUE, FALSE),
  ('Bone Marrow Culture', 'Bone & Joint', TRUE, FALSE),
  ('Joint Fluid Culture', 'Bone & Joint', TRUE, FALSE),
  ('Orthopedic Implant Culture', 'Bone & Joint', TRUE, FALSE),
  ('Prosthetic Joint Culture', 'Bone & Joint', TRUE, FALSE),
  -- Device-Related Cultures
  ('Catheter Tip Culture', 'Device-Related', FALSE, FALSE),
  ('Central Venous Catheter Tip Culture', 'Device-Related', FALSE, FALSE),
  ('PICC Tip Culture', 'Device-Related', FALSE, FALSE),
  ('Dialysis Catheter Tip Culture', 'Device-Related', FALSE, FALSE),
  ('Chest Drain Tip Culture', 'Device-Related', FALSE, FALSE),
  ('Drain Fluid Culture', 'Device-Related', FALSE, FALSE),
  ('Drain Tip Culture', 'Device-Related', FALSE, FALSE),
  ('ET Tube Tip Culture', 'Device-Related', FALSE, FALSE),
  ('Tracheostomy Tube Culture', 'Device-Related', FALSE, FALSE),
  -- Gastrointestinal
  ('Stool Culture', 'Gastrointestinal', FALSE, FALSE),
  ('Rectal Swab Culture', 'Gastrointestinal', FALSE, FALSE),
  ('Rectal Surveillance Culture', 'Gastrointestinal', FALSE, TRUE),
  ('Enteric Culture', 'Gastrointestinal', FALSE, FALSE),
  -- Hepatobiliary
  ('Bile Culture', 'Hepatobiliary', TRUE, FALSE),
  ('Gallbladder Fluid Culture', 'Hepatobiliary', TRUE, FALSE),
  ('Liver Abscess Culture', 'Hepatobiliary', TRUE, FALSE),
  -- ENT
  ('Throat Swab Culture', 'ENT', FALSE, FALSE),
  ('Tonsillar Swab Culture', 'ENT', FALSE, FALSE),
  ('Nasal Swab Culture', 'ENT', FALSE, FALSE),
  ('Nasopharyngeal Swab Culture', 'ENT', FALSE, FALSE),
  ('Sinus Aspirate Culture', 'ENT', TRUE, FALSE),
  ('Ear Swab Culture', 'ENT', FALSE, FALSE),
  ('Middle Ear Fluid Culture', 'ENT', TRUE, FALSE),
  -- Eye
  ('Eye Swab Culture', 'Eye', FALSE, FALSE),
  ('Conjunctival Swab Culture', 'Eye', FALSE, FALSE),
  ('Corneal Scraping Culture', 'Eye', TRUE, FALSE),
  ('Vitreous Fluid Culture', 'Eye', TRUE, FALSE),
  ('Aqueous Humor Culture', 'Eye', TRUE, FALSE),
  -- Genital
  ('Vaginal Swab Culture', 'Genital', FALSE, FALSE),
  ('High Vaginal Swab Culture (HVS)', 'Genital', FALSE, FALSE),
  ('Low Vaginal Swab Culture (LVS)', 'Genital', FALSE, FALSE),
  ('Endocervical Swab Culture', 'Genital', FALSE, FALSE),
  ('Cervical Swab Culture', 'Genital', FALSE, FALSE),
  ('Urethral Swab Culture', 'Genital', FALSE, FALSE),
  ('Penile Swab Culture', 'Genital', FALSE, FALSE),
  ('Genital Lesion Culture', 'Genital', FALSE, FALSE),
  -- Skin & Dermatology
  ('Skin Swab Culture', 'Skin', FALSE, FALSE),
  ('Skin Scraping Culture', 'Skin', FALSE, FALSE),
  ('Hair Culture', 'Skin', FALSE, FALSE),
  ('Nail Culture', 'Skin', FALSE, FALSE),
  -- Fungal
  ('Fungal Culture', 'Fungal', FALSE, FALSE),
  ('Yeast Culture', 'Fungal', FALSE, FALSE),
  ('Dermatophyte Culture', 'Fungal', FALSE, FALSE),
  ('Candida Culture', 'Fungal', FALSE, FALSE),
  -- Mycobacteria
  ('AFB Culture', 'Mycobacteria', FALSE, FALSE),
  ('Mycobacterial Culture', 'Mycobacteria', FALSE, FALSE),
  ('TB Culture', 'Mycobacteria', FALSE, FALSE),
  ('NTM Culture', 'Mycobacteria', FALSE, FALSE),
  -- Anaerobic
  ('Anaerobic Culture', 'Anaerobic', FALSE, FALSE),
  ('Anaerobic Tissue Culture', 'Anaerobic', FALSE, FALSE),
  ('Anaerobic Fluid Culture', 'Anaerobic', FALSE, FALSE),
  ('Anaerobic Wound Culture', 'Anaerobic', FALSE, FALSE),
  -- Aerobic
  ('Aerobic Culture', 'Aerobic', FALSE, FALSE),
  ('Aerobic Wound Culture', 'Aerobic', FALSE, FALSE),
  ('Aerobic Tissue Culture', 'Aerobic', FALSE, FALSE),
  -- Viral
  ('Viral Culture', 'Viral', FALSE, FALSE),
  ('HSV Culture', 'Viral', FALSE, FALSE),
  ('CMV Culture', 'Viral', FALSE, FALSE),
  ('Enterovirus Culture', 'Viral', FALSE, FALSE),
  -- Surveillance / Infection Control
  ('MRSA Surveillance Culture', 'Surveillance', FALSE, TRUE),
  ('VRE Surveillance Culture', 'Surveillance', FALSE, TRUE),
  ('CRE Surveillance Culture', 'Surveillance', FALSE, TRUE),
  ('ESBL Surveillance Culture', 'Surveillance', FALSE, TRUE),
  ('MDR Surveillance Culture', 'Surveillance', FALSE, TRUE),
  ('ICU Surveillance Culture', 'Surveillance', FALSE, TRUE),
  ('Admission Screening Culture', 'Surveillance', FALSE, TRUE),
  -- Special Cultures
  ('Placental Culture', 'Special', TRUE, FALSE),
  ('Umbilical Cord Culture', 'Special', TRUE, FALSE),
  ('Amniotic Fluid Culture', 'Special', TRUE, FALSE),
  ('Products of Conception Culture', 'Special', TRUE, FALSE),
  -- Miscellaneous
  ('Saliva Culture', 'Miscellaneous', FALSE, FALSE),
  ('Oral Swab Culture', 'Miscellaneous', FALSE, FALSE),
  ('Dental Abscess Culture', 'Miscellaneous', FALSE, FALSE),
  ('Aspirate Culture', 'Miscellaneous', FALSE, FALSE),
  ('Biopsy Tissue Culture', 'Miscellaneous', TRUE, FALSE),
  ('Foreign Body Culture', 'Miscellaneous', FALSE, FALSE),
  ('Implant Culture', 'Miscellaneous', TRUE, FALSE);

-- ═══════════════════ 2e. INVESTIGATION MASTER ═══════════════════

CREATE TABLE investigation_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  department VARCHAR(100),
  is_lab_test BOOLEAN DEFAULT FALSE,
  is_imaging BOOLEAN DEFAULT FALSE,
  is_point_of_care BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO investigation_master (investigation_name, category, is_lab_test) VALUES
  -- Hematology
  ('Complete Blood Count (CBC)', 'Hematology', TRUE),
  ('Hemoglobin', 'Hematology', TRUE),
  ('Hematocrit', 'Hematology', TRUE),
  ('Red Blood Cell Count (RBC)', 'Hematology', TRUE),
  ('White Blood Cell Count (WBC)', 'Hematology', TRUE),
  ('Platelet Count', 'Hematology', TRUE),
  ('Differential Leukocyte Count', 'Hematology', TRUE),
  ('Neutrophil Count', 'Hematology', TRUE),
  ('Lymphocyte Count', 'Hematology', TRUE),
  ('Monocyte Count', 'Hematology', TRUE),
  ('Eosinophil Count', 'Hematology', TRUE),
  ('Basophil Count', 'Hematology', TRUE),
  ('Reticulocyte Count', 'Hematology', TRUE),
  ('Peripheral Blood Smear', 'Hematology', TRUE),
  ('ESR', 'Hematology', TRUE),
  -- Biochemistry
  ('Blood Glucose', 'Biochemistry', TRUE),
  ('Random Blood Sugar', 'Biochemistry', TRUE),
  ('Fasting Blood Sugar', 'Biochemistry', TRUE),
  ('HbA1c', 'Biochemistry', TRUE),
  ('Serum Urea', 'Biochemistry', TRUE),
  ('Blood Urea Nitrogen (BUN)', 'Biochemistry', TRUE),
  ('Serum Creatinine', 'Biochemistry', TRUE),
  ('eGFR', 'Biochemistry', TRUE),
  ('Uric Acid', 'Biochemistry', TRUE),
  ('Serum Sodium', 'Biochemistry', TRUE),
  ('Serum Potassium', 'Biochemistry', TRUE),
  ('Serum Chloride', 'Biochemistry', TRUE),
  ('Serum Calcium', 'Biochemistry', TRUE),
  ('Ionized Calcium', 'Biochemistry', TRUE),
  ('Serum Magnesium', 'Biochemistry', TRUE),
  ('Serum Phosphate', 'Biochemistry', TRUE),
  ('Serum Osmolality', 'Biochemistry', TRUE),
  ('Urine Osmolality', 'Biochemistry', TRUE),
  ('Lactate', 'Biochemistry', TRUE),
  ('Ammonia', 'Biochemistry', TRUE),
  -- Liver Function Tests
  ('Total Bilirubin', 'Liver Function Tests', TRUE),
  ('Direct Bilirubin', 'Liver Function Tests', TRUE),
  ('Indirect Bilirubin', 'Liver Function Tests', TRUE),
  ('AST (SGOT)', 'Liver Function Tests', TRUE),
  ('ALT (SGPT)', 'Liver Function Tests', TRUE),
  ('ALP', 'Liver Function Tests', TRUE),
  ('GGT', 'Liver Function Tests', TRUE),
  ('Albumin', 'Liver Function Tests', TRUE),
  ('Globulin', 'Liver Function Tests', TRUE),
  ('Total Protein', 'Liver Function Tests', TRUE),
  ('A/G Ratio', 'Liver Function Tests', TRUE),
  ('LDH', 'Liver Function Tests', TRUE),
  -- Renal / Urine
  ('Urinalysis', 'Renal / Urine', TRUE),
  ('Urine Microscopy', 'Renal / Urine', TRUE),
  ('Urine Protein', 'Renal / Urine', TRUE),
  ('Urine Albumin', 'Renal / Urine', TRUE),
  ('Urine Creatinine', 'Renal / Urine', TRUE),
  ('Urine Sodium', 'Renal / Urine', TRUE),
  ('Urine Potassium', 'Renal / Urine', TRUE),
  ('Urine Chloride', 'Renal / Urine', TRUE),
  ('Urine Urea', 'Renal / Urine', TRUE),
  ('Urine Protein Creatinine Ratio', 'Renal / Urine', TRUE),
  ('Microalbumin', 'Renal / Urine', TRUE),
  ('24 Hour Urine Protein', 'Renal / Urine', TRUE),
  ('Creatinine Clearance', 'Renal / Urine', TRUE),
  -- Coagulation
  ('PT', 'Coagulation', TRUE),
  ('INR', 'Coagulation', TRUE),
  ('aPTT', 'Coagulation', TRUE),
  ('Thrombin Time', 'Coagulation', TRUE),
  ('Fibrinogen', 'Coagulation', TRUE),
  ('D-Dimer', 'Coagulation', TRUE),
  ('FDP', 'Coagulation', TRUE),
  ('Anti-Xa Level', 'Coagulation', TRUE),
  -- Infection / Sepsis Markers
  ('CRP', 'Infection / Sepsis Markers', TRUE),
  ('Procalcitonin', 'Infection / Sepsis Markers', TRUE),
  ('Ferritin', 'Infection / Sepsis Markers', TRUE),
  ('IL-6', 'Infection / Sepsis Markers', TRUE),
  -- Blood Gas
  ('ABG', 'Arterial / Venous Blood Gas', TRUE),
  ('VBG', 'Arterial / Venous Blood Gas', TRUE),
  ('pH', 'Arterial / Venous Blood Gas', TRUE),
  ('PaO2', 'Arterial / Venous Blood Gas', TRUE),
  ('PaCO2', 'Arterial / Venous Blood Gas', TRUE),
  ('HCO3', 'Arterial / Venous Blood Gas', TRUE),
  ('Base Excess', 'Arterial / Venous Blood Gas', TRUE),
  ('SaO2', 'Arterial / Venous Blood Gas', TRUE),
  -- Cardiac
  ('Troponin I', 'Cardiac', TRUE),
  ('Troponin T', 'Cardiac', TRUE),
  ('CK', 'Cardiac', TRUE),
  ('CK-MB', 'Cardiac', TRUE),
  ('BNP', 'Cardiac', TRUE),
  ('NT-proBNP', 'Cardiac', TRUE),
  ('Myoglobin', 'Cardiac', TRUE),
  -- Endocrine
  ('TSH', 'Endocrine', TRUE),
  ('Free T3', 'Endocrine', TRUE),
  ('Free T4', 'Endocrine', TRUE),
  ('Cortisol', 'Endocrine', TRUE),
  ('ACTH', 'Endocrine', TRUE),
  ('PTH', 'Endocrine', TRUE),
  ('Vitamin D', 'Endocrine', TRUE),
  ('Insulin', 'Endocrine', TRUE),
  ('C-Peptide', 'Endocrine', TRUE),
  -- Nutritional
  ('Vitamin B12', 'Nutritional', TRUE),
  ('Folate', 'Nutritional', TRUE),
  ('Iron', 'Nutritional', TRUE),
  ('TIBC', 'Nutritional', TRUE),
  ('Transferrin Saturation', 'Nutritional', TRUE),
  ('Zinc', 'Nutritional', TRUE),
  ('Copper', 'Nutritional', TRUE),
  ('Selenium', 'Nutritional', TRUE),
  ('Vitamin A', 'Nutritional', TRUE),
  ('Vitamin E', 'Nutritional', TRUE),
  ('Vitamin K', 'Nutritional', TRUE),
  -- Pancreatic
  ('Serum Amylase', 'Pancreatic', TRUE),
  ('Serum Lipase', 'Pancreatic', TRUE),
  -- Toxicology
  ('Paracetamol Level', 'Toxicology', TRUE),
  ('Salicylate Level', 'Toxicology', TRUE),
  ('Alcohol Level', 'Toxicology', TRUE),
  ('Drug Screen', 'Toxicology', TRUE),
  ('Urine Drug Screen', 'Toxicology', TRUE),
  ('Heavy Metal Screen', 'Toxicology', TRUE),
  -- Therapeutic Drug Monitoring
  ('Vancomycin Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Gentamicin Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Amikacin Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Digoxin Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Lithium Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Phenytoin Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Valproate Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Tacrolimus Level', 'Therapeutic Drug Monitoring', TRUE),
  ('Cyclosporine Level', 'Therapeutic Drug Monitoring', TRUE),
  -- Immunology / Autoimmune
  ('ANA', 'Immunology / Autoimmune', TRUE),
  ('ENA Profile', 'Immunology / Autoimmune', TRUE),
  ('ANCA', 'Immunology / Autoimmune', TRUE),
  ('dsDNA', 'Immunology / Autoimmune', TRUE),
  ('Complement C3', 'Immunology / Autoimmune', TRUE),
  ('Complement C4', 'Immunology / Autoimmune', TRUE),
  ('Rheumatoid Factor', 'Immunology / Autoimmune', TRUE),
  ('Anti-CCP', 'Immunology / Autoimmune', TRUE),
  ('Immunoglobulin Profile', 'Immunology / Autoimmune', TRUE),
  -- Microbiology / Molecular
  ('Gram Stain', 'Microbiology / Molecular', TRUE),
  ('AFB Smear', 'Microbiology / Molecular', TRUE),
  ('Fungal Smear', 'Microbiology / Molecular', TRUE),
  ('KOH Mount', 'Microbiology / Molecular', TRUE),
  ('PCR', 'Microbiology / Molecular', TRUE),
  ('Multiplex PCR', 'Microbiology / Molecular', TRUE),
  ('GeneXpert', 'Microbiology / Molecular', TRUE),
  ('Respiratory Viral Panel', 'Microbiology / Molecular', TRUE),
  ('COVID PCR', 'Microbiology / Molecular', TRUE),
  ('Influenza PCR', 'Microbiology / Molecular', TRUE),
  ('RSV PCR', 'Microbiology / Molecular', TRUE),
  -- Serology
  ('HIV', 'Serology', TRUE),
  ('HBsAg', 'Serology', TRUE),
  ('Anti-HCV', 'Serology', TRUE),
  ('HAV IgM', 'Serology', TRUE),
  ('HEV IgM', 'Serology', TRUE),
  ('Dengue NS1', 'Serology', TRUE),
  ('Dengue IgM', 'Serology', TRUE),
  ('Dengue IgG', 'Serology', TRUE),
  ('Leptospira', 'Serology', TRUE),
  ('Scrub Typhus', 'Serology', TRUE),
  ('Malaria Antigen', 'Serology', TRUE),
  ('Widal', 'Serology', TRUE),
  ('VDRL', 'Serology', TRUE),
  ('TPHA', 'Serology', TRUE),
  -- Point-of-Care
  ('POC Glucose', 'Point-of-Care', FALSE),
  ('POC Lactate', 'Point-of-Care', FALSE),
  ('POC ABG', 'Point-of-Care', FALSE),
  ('POC Troponin', 'Point-of-Care', FALSE),
  ('POC Electrolytes', 'Point-of-Care', FALSE),
  ('POC Hemoglobin', 'Point-of-Care', FALSE),
  -- ICU Monitoring
  ('Daily CBC', 'ICU Monitoring', TRUE),
  ('Daily RFT', 'ICU Monitoring', TRUE),
  ('Daily LFT', 'ICU Monitoring', TRUE),
  ('Daily Electrolytes', 'ICU Monitoring', TRUE),
  ('Fluid Balance', 'ICU Monitoring', FALSE),
  ('Urine Output', 'ICU Monitoring', FALSE),
  ('CVP Trend', 'ICU Monitoring', FALSE),
  ('ICP Trend', 'ICU Monitoring', FALSE),
  ('Cardiac Output Monitoring', 'ICU Monitoring', FALSE),
  ('Mixed Venous Oxygen Saturation (SvO2)', 'ICU Monitoring', TRUE),
  ('ScvO2', 'ICU Monitoring', TRUE),
  -- ICU Scores / Assessments
  ('APACHE II', 'ICU Scores / Assessments', FALSE),
  ('SOFA Score', 'ICU Scores / Assessments', FALSE),
  ('qSOFA', 'ICU Scores / Assessments', FALSE),
  ('NEWS2', 'ICU Scores / Assessments', FALSE),
  ('Glasgow Coma Scale (GCS)', 'ICU Scores / Assessments', FALSE),
  ('RASS', 'ICU Scores / Assessments', FALSE),
  ('CAM-ICU', 'ICU Scores / Assessments', FALSE),
  ('Braden Score', 'ICU Scores / Assessments', FALSE),
  ('NUTRIC Score', 'ICU Scores / Assessments', FALSE);

-- ═══════════════════ 2f. DEVICE MASTER ═══════════════════

CREATE TABLE device_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name VARCHAR(200) NOT NULL,
  device_category VARCHAR(100),
  requires_insertion BOOLEAN DEFAULT FALSE,
  requires_daily_review BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO device_master (device_name, device_category, requires_insertion, requires_daily_review) VALUES
  -- Airway Devices
  ('Oropharyngeal Airway (OPA/Guedel)', 'Airway', TRUE, FALSE),
  ('Nasopharyngeal Airway (NPA)', 'Airway', TRUE, FALSE),
  ('Laryngeal Mask Airway (LMA)', 'Airway', TRUE, FALSE),
  ('Endotracheal Tube (ETT)', 'Airway', TRUE, TRUE),
  ('Double Lumen Endotracheal Tube', 'Airway', TRUE, TRUE),
  ('Tracheostomy Tube', 'Airway', TRUE, TRUE),
  ('Speaking Valve', 'Airway', FALSE, FALSE),
  ('Tracheostomy Inner Cannula', 'Airway', FALSE, TRUE),
  ('Airway Exchange Catheter', 'Airway', TRUE, FALSE),
  ('Bronchial Blocker', 'Airway', TRUE, FALSE),
  -- Oxygen Delivery Devices
  ('Nasal Cannula', 'Oxygen Delivery', FALSE, FALSE),
  ('Simple Face Mask', 'Oxygen Delivery', FALSE, FALSE),
  ('Venturi Mask', 'Oxygen Delivery', FALSE, FALSE),
  ('Non-Rebreather Mask', 'Oxygen Delivery', FALSE, FALSE),
  ('Partial Rebreather Mask', 'Oxygen Delivery', FALSE, FALSE),
  ('High Flow Nasal Cannula (HFNC)', 'Oxygen Delivery', FALSE, FALSE),
  ('Face Tent', 'Oxygen Delivery', FALSE, FALSE),
  ('Aerosol Mask', 'Oxygen Delivery', FALSE, FALSE),
  ('Tracheostomy Mask', 'Oxygen Delivery', FALSE, FALSE),
  ('Oxygen Hood', 'Oxygen Delivery', FALSE, FALSE),
  -- Mechanical Ventilation
  ('Mechanical Ventilator', 'Mechanical Ventilation', FALSE, TRUE),
  ('Transport Ventilator', 'Mechanical Ventilation', FALSE, FALSE),
  ('Home Ventilator', 'Mechanical Ventilation', FALSE, FALSE),
  ('CPAP Machine', 'Mechanical Ventilation', FALSE, TRUE),
  ('BiPAP Machine', 'Mechanical Ventilation', FALSE, TRUE),
  ('HFOV Ventilator', 'Mechanical Ventilation', FALSE, TRUE),
  ('Jet Ventilator', 'Mechanical Ventilation', FALSE, TRUE),
  ('Ventilator Circuit', 'Mechanical Ventilation', FALSE, TRUE),
  ('Humidifier', 'Mechanical Ventilation', FALSE, FALSE),
  ('Heat Moisture Exchanger (HME)', 'Mechanical Ventilation', FALSE, FALSE),
  ('HEPA Filter', 'Mechanical Ventilation', FALSE, FALSE),
  ('ETCO₂ Module', 'Mechanical Ventilation', FALSE, FALSE),
  -- Vascular Access
  ('Peripheral IV Cannula', 'Vascular Access', TRUE, FALSE),
  ('Midline Catheter', 'Vascular Access', TRUE, TRUE),
  ('Peripherally Inserted Central Catheter (PICC)', 'Vascular Access', TRUE, TRUE),
  ('Central Venous Catheter (CVC)', 'Vascular Access', TRUE, TRUE),
  ('Triple Lumen Catheter', 'Vascular Access', TRUE, TRUE),
  ('Quad Lumen Catheter', 'Vascular Access', TRUE, TRUE),
  ('Introducer Sheath', 'Vascular Access', TRUE, FALSE),
  ('Pulmonary Artery Catheter (Swan-Ganz)', 'Vascular Access', TRUE, TRUE),
  ('Implantable Port', 'Vascular Access', TRUE, TRUE),
  ('Chemo Port', 'Vascular Access', TRUE, TRUE),
  ('Hemodialysis Catheter', 'Vascular Access', TRUE, TRUE),
  ('Temporary Dialysis Catheter', 'Vascular Access', TRUE, TRUE),
  ('Permanent Dialysis Catheter', 'Vascular Access', TRUE, TRUE),
  ('Arterial Line', 'Vascular Access', TRUE, TRUE),
  ('Intraosseous Access Device', 'Vascular Access', TRUE, FALSE),
  -- Urinary Devices
  ('Foley Catheter', 'Urinary', TRUE, TRUE),
  ('Three-Way Foley Catheter', 'Urinary', TRUE, TRUE),
  ('Suprapubic Catheter', 'Urinary', TRUE, TRUE),
  ('External Urinary Catheter', 'Urinary', FALSE, FALSE),
  ('Condom Catheter', 'Urinary', FALSE, FALSE),
  ('Nephrostomy Tube', 'Urinary', TRUE, TRUE),
  ('Ureteric Stent', 'Urinary', TRUE, TRUE),
  ('Bladder Irrigation System', 'Urinary', TRUE, FALSE),
  -- Gastrointestinal / Feeding Devices
  ('Nasogastric Tube (NG)', 'Gastrointestinal / Feeding', TRUE, FALSE),
  ('Orogastric Tube (OG)', 'Gastrointestinal / Feeding', TRUE, FALSE),
  ('Nasojejunal Tube (NJ)', 'Gastrointestinal / Feeding', TRUE, FALSE),
  ('PEG Tube', 'Gastrointestinal / Feeding', TRUE, TRUE),
  ('PEJ Tube', 'Gastrointestinal / Feeding', TRUE, TRUE),
  ('Jejunostomy Tube', 'Gastrointestinal / Feeding', TRUE, TRUE),
  ('Feeding Pump', 'Gastrointestinal / Feeding', FALSE, FALSE),
  ('Rectal Tube', 'Gastrointestinal / Feeding', TRUE, FALSE),
  ('Fecal Management System', 'Gastrointestinal / Feeding', TRUE, TRUE),
  -- Drainage Devices
  ('Chest Tube', 'Drainage', TRUE, TRUE),
  ('Intercostal Drain (ICD)', 'Drainage', TRUE, TRUE),
  ('Pigtail Catheter', 'Drainage', TRUE, TRUE),
  ('Jackson Pratt Drain', 'Drainage', TRUE, TRUE),
  ('Hemovac Drain', 'Drainage', TRUE, TRUE),
  ('Penrose Drain', 'Drainage', TRUE, TRUE),
  ('Abdominal Drain', 'Drainage', TRUE, TRUE),
  ('Pelvic Drain', 'Drainage', TRUE, TRUE),
  ('Subhepatic Drain', 'Drainage', TRUE, TRUE),
  ('Biliary Drain', 'Drainage', TRUE, TRUE),
  ('T-Tube', 'Drainage', TRUE, TRUE),
  ('Nephrostomy Drain', 'Drainage', TRUE, TRUE),
  ('External Ventricular Drain (EVD)', 'Drainage', TRUE, TRUE),
  ('Lumbar Drain', 'Drainage', TRUE, TRUE),
  -- Cardiac Devices
  ('Temporary Pacemaker', 'Cardiac Support', TRUE, TRUE),
  ('Permanent Pacemaker', 'Cardiac Support', TRUE, TRUE),
  ('ICD (Implantable Cardioverter Defibrillator)', 'Cardiac Support', TRUE, TRUE),
  ('CRT Device', 'Cardiac Support', TRUE, TRUE),
  ('Intra-Aortic Balloon Pump (IABP)', 'Cardiac Support', TRUE, TRUE),
  ('Impella', 'Cardiac Support', TRUE, TRUE),
  ('ECMO', 'Cardiac Support', TRUE, TRUE),
  ('LVAD', 'Cardiac Support', TRUE, TRUE),
  ('RVAD', 'Cardiac Support', TRUE, TRUE),
  -- Renal Support
  ('Hemodialysis Machine', 'Renal Support', FALSE, TRUE),
  ('CRRT Machine', 'Renal Support', FALSE, TRUE),
  ('SLED Machine', 'Renal Support', FALSE, TRUE),
  ('Peritoneal Dialysis Machine', 'Renal Support', FALSE, TRUE),
  ('Hemoperfusion Device', 'Renal Support', FALSE, TRUE),
  -- Monitoring Devices
  ('Multiparameter Monitor', 'Monitoring', FALSE, FALSE),
  ('ECG Monitor', 'Monitoring', FALSE, FALSE),
  ('Holter Monitor', 'Monitoring', FALSE, FALSE),
  ('Telemetry Monitor', 'Monitoring', FALSE, FALSE),
  ('Pulse Oximeter', 'Monitoring', FALSE, FALSE),
  ('Capnography Monitor', 'Monitoring', FALSE, FALSE),
  ('Blood Pressure Monitor', 'Monitoring', FALSE, FALSE),
  ('Invasive Blood Pressure Monitor', 'Monitoring', TRUE, TRUE),
  ('CVP Monitor', 'Monitoring', TRUE, TRUE),
  ('ICP Monitor', 'Monitoring', TRUE, TRUE),
  ('BIS Monitor', 'Monitoring', FALSE, FALSE),
  ('Cardiac Output Monitor', 'Monitoring', FALSE, FALSE),
  ('PiCCO Monitor', 'Monitoring', TRUE, TRUE),
  ('FloTrac Monitor', 'Monitoring', TRUE, TRUE),
  ('LiDCO Monitor', 'Monitoring', TRUE, TRUE),
  ('Temperature Probe', 'Monitoring', TRUE, FALSE),
  ('Neuromuscular Monitor', 'Monitoring', FALSE, FALSE),
  -- Infusion Devices
  ('Infusion Pump', 'Infusion', FALSE, FALSE),
  ('Syringe Pump', 'Infusion', FALSE, FALSE),
  ('PCA Pump', 'Infusion', FALSE, FALSE),
  ('Insulin Pump', 'Infusion', TRUE, FALSE),
  ('Pressure Infuser', 'Infusion', FALSE, FALSE),
  ('Blood Warmer', 'Infusion', FALSE, FALSE),
  ('Fluid Warmer', 'Infusion', FALSE, FALSE),
  -- Respiratory Support Devices
  ('Nebulizer', 'Respiratory Support', FALSE, FALSE),
  ('Inline Nebulizer', 'Respiratory Support', FALSE, FALSE),
  ('Suction Machine', 'Respiratory Support', FALSE, FALSE),
  ('Portable Suction', 'Respiratory Support', FALSE, FALSE),
  ('Closed Suction System', 'Respiratory Support', TRUE, TRUE),
  ('Open Suction Catheter', 'Respiratory Support', FALSE, FALSE),
  ('Incentive Spirometer', 'Respiratory Support', FALSE, FALSE),
  ('PEP Device', 'Respiratory Support', FALSE, FALSE),
  -- Neurological Devices
  ('ICP Bolt', 'Neurology', TRUE, TRUE),
  ('ICP Catheter', 'Neurology', TRUE, TRUE),
  ('EEG Monitor', 'Neurology', FALSE, FALSE),
  ('Cerebral Oximeter', 'Neurology', FALSE, FALSE),
  ('Brain Tissue Oxygen Monitor', 'Neurology', TRUE, TRUE),
  -- Obstetric / Pediatric ICU
  ('Infant Warmer', 'Pediatric / Neonatal', FALSE, FALSE),
  ('Incubator', 'Pediatric / Neonatal', FALSE, FALSE),
  ('Phototherapy Unit', 'Pediatric / Neonatal', FALSE, FALSE),
  ('Neonatal CPAP', 'Pediatric / Neonatal', FALSE, TRUE),
  ('Umbilical Venous Catheter', 'Pediatric / Neonatal', TRUE, TRUE),
  ('Umbilical Arterial Catheter', 'Pediatric / Neonatal', TRUE, TRUE),
  -- Infection Control Devices
  ('Negative Pressure Wound Therapy (VAC)', 'Infection Control', TRUE, TRUE),
  ('Isolation Hood', 'Infection Control', FALSE, FALSE),
  ('Air Purification Device', 'Infection Control', FALSE, FALSE),
  ('UV Sterilization Device', 'Infection Control', FALSE, FALSE),
  -- Diagnostic Bedside Devices
  ('Portable Ultrasound', 'Diagnostic', FALSE, FALSE),
  ('Bladder Scanner', 'Diagnostic', FALSE, FALSE),
  ('Portable ECG Machine', 'Diagnostic', FALSE, FALSE),
  ('Portable X-ray', 'Diagnostic', FALSE, FALSE),
  ('TEE Probe', 'Diagnostic', TRUE, FALSE),
  ('Bronchoscope', 'Diagnostic', TRUE, FALSE),
  ('Video Laryngoscope', 'Diagnostic', TRUE, FALSE),
  -- Mobility & Support
  ('ICU Bed', 'Mobility', FALSE, FALSE),
  ('Air Mattress', 'Mobility', FALSE, FALSE),
  ('Pressure Relief Mattress', 'Mobility', FALSE, FALSE),
  ('Sequential Compression Device (SCD)', 'Mobility', FALSE, FALSE),
  ('Patient Lift', 'Mobility', FALSE, FALSE),
  ('Transfer Board', 'Mobility', FALSE, FALSE),
  ('Wheelchair', 'Mobility', FALSE, FALSE),
  -- Emergency Devices
  ('Defibrillator', 'Emergency', FALSE, FALSE),
  ('AED', 'Emergency', FALSE, FALSE),
  ('Crash Cart', 'Emergency', FALSE, FALSE),
  ('Resuscitation Cart', 'Emergency', FALSE, FALSE),
  ('Mechanical CPR Device', 'Emergency', FALSE, FALSE),
  -- Miscellaneous ICU Devices
  ('Blood Glucose Monitor', 'Miscellaneous', FALSE, FALSE),
  ('Continuous Glucose Monitor (CGM)', 'Miscellaneous', TRUE, FALSE),
  ('Temperature Management Device', 'Miscellaneous', FALSE, FALSE),
  ('Cooling Blanket', 'Miscellaneous', FALSE, FALSE),
  ('Warming Blanket', 'Miscellaneous', FALSE, FALSE);
