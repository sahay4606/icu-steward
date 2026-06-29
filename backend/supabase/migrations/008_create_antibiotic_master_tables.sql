-- ══════════════════════════════════════════════════════════════════════════════
-- Antibiotic Master Reference Tables — ICU Stewardship Platform
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Antibiotic Classes
CREATE TABLE IF NOT EXISTS antibiotic_class_master (
  id text primary key,
  class_code text,
  class_name text not null,
  subclass text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO antibiotic_class_master (id, class_code, class_name, subclass) VALUES
  (gen_random_uuid()::text, 'PEN', 'Penicillin', null),
  (gen_random_uuid()::text, 'PEN-BLI', 'Penicillin + Beta-Lactamase Inhibitor', null),
  (gen_random_uuid()::text, 'CEPH-1', 'Cephalosporin', 'First Generation'),
  (gen_random_uuid()::text, 'CEPH-2', 'Cephalosporin', 'Second Generation'),
  (gen_random_uuid()::text, 'CEPH-3', 'Cephalosporin', 'Third Generation'),
  (gen_random_uuid()::text, 'CEPH-4', 'Cephalosporin', 'Fourth Generation'),
  (gen_random_uuid()::text, 'CEPH-5', 'Cephalosporin', 'Fifth Generation'),
  (gen_random_uuid()::text, 'CARBA', 'Carbapenem', null),
  (gen_random_uuid()::text, 'MONO', 'Monobactam', null),
  (gen_random_uuid()::text, 'GLYCOP', 'Glycopeptide', null),
  (gen_random_uuid()::text, 'LIPO-GLY', 'Lipoglycopeptide', null),
  (gen_random_uuid()::text, 'OXA', 'Oxazolidinone', null),
  (gen_random_uuid()::text, 'LIPOPEP', 'Lipopeptide', null),
  (gen_random_uuid()::text, 'AMINO', 'Aminoglycoside', null),
  (gen_random_uuid()::text, 'FQ', 'Fluoroquinolone', null),
  (gen_random_uuid()::text, 'MAC', 'Macrolide', null),
  (gen_random_uuid()::text, 'TETRA', 'Tetracycline', null),
  (gen_random_uuid()::text, 'NITRO', 'Nitroimidazole', null),
  (gen_random_uuid()::text, 'SULFA', 'Sulfonamide', null),
  (gen_random_uuid()::text, 'POLY', 'Polymyxin', null),
  (gen_random_uuid()::text, 'GLYCYL', 'Glycylcycline', null),
  (gen_random_uuid()::text, 'NOVEL-BL', 'Novel Beta-Lactam Combination', null)
ON CONFLICT (id) DO NOTHING;

-- 2. Antibiotic Master
CREATE TABLE IF NOT EXISTS antibiotic_master (
  id text primary key,
  generic_name text not null,
  brand_name text,
  class text,
  subclass text,
  route text,
  aware_category text,
  spectrum text,
  covers_gram_positive boolean default false,
  covers_gram_negative boolean default false,
  covers_anaerobes boolean default false,
  covers_pseudomonas boolean default false,
  covers_mrsa boolean default false,
  covers_vre boolean default false,
  covers_esbl boolean default false,
  covers_cre boolean default false,
  covers_atypicals boolean default false,
  covers_fungi boolean default false,
  covers_tb boolean default false,
  renal_adjustment boolean default false,
  hepatic_adjustment boolean default false,
  pregnancy_category text,
  therapeutic_drug_monitoring boolean default false,
  restricted boolean default false,
  approval_required boolean default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO antibiotic_master (id, generic_name, brand_name, class, subclass, route, aware_category, spectrum, covers_gram_positive, covers_gram_negative, covers_anaerobes, covers_pseudomonas, covers_mrsa, covers_atypicals, renal_adjustment, therapeutic_drug_monitoring) VALUES
  -- Penicillins
  (gen_random_uuid()::text, 'Penicillin G', null, 'Penicillin', null, 'IV', 'Access', 'Narrow', true, false, false, false, false, false, false, false),
  (gen_random_uuid()::text, 'Penicillin V', null, 'Penicillin', null, 'Oral', 'Access', 'Narrow', true, false, false, false, false, false, false, false),
  (gen_random_uuid()::text, 'Ampicillin', null, 'Penicillin', null, 'IV/Oral', 'Access', 'Moderate', true, true, false, false, false, false, true, false),
  (gen_random_uuid()::text, 'Amoxicillin', null, 'Penicillin', null, 'Oral', 'Access', 'Moderate', true, true, false, false, false, false, true, false),
  (gen_random_uuid()::text, 'Cloxacillin', null, 'Penicillin', null, 'IV/Oral', 'Access', 'Narrow', true, false, false, false, false, false, false, false),
  (gen_random_uuid()::text, 'Oxacillin', null, 'Penicillin', null, 'IV', 'Access', 'Narrow', true, false, false, false, false, false, false, false),
  (gen_random_uuid()::text, 'Nafcillin', null, 'Penicillin', null, 'IV', 'Access', 'Narrow', true, false, false, false, false, false, false, false),
  -- Penicillin + BLI
  (gen_random_uuid()::text, 'Amoxicillin-Clavulanate', 'Augmentin', 'Penicillin + Beta-Lactamase Inhibitor', null, 'Oral', 'Access', 'Moderate', true, true, false, false, false, false, true, false),
  (gen_random_uuid()::text, 'Ampicillin-Sulbactam', 'Unasyn', 'Penicillin + Beta-Lactamase Inhibitor', null, 'IV', 'Access', 'Broad', true, true, true, false, false, false, true, false),
  (gen_random_uuid()::text, 'Piperacillin-Tazobactam', 'Zosyn', 'Penicillin + Beta-Lactamase Inhibitor', null, 'IV', 'Watch', 'Broad', true, true, true, true, false, false, true, false),
  (gen_random_uuid()::text, 'Ticarcillin-Clavulanate', 'Timentin', 'Penicillin + Beta-Lactamase Inhibitor', null, 'IV', 'Watch', 'Broad', true, true, true, true, false, false, true, false),
  -- Cephalosporins 1st Gen
  (gen_random_uuid()::text, 'Cefazolin', 'Ancef', 'Cephalosporin', 'First Generation', 'IV', 'Access', 'Moderate', true, true, false, false, false, false, false, false),
  (gen_random_uuid()::text, 'Cephalexin', 'Keflex', 'Cephalosporin', 'First Generation', 'Oral', 'Access', 'Moderate', true, true, false, false, false, false, true, false),
  -- Cephalosporins 2nd Gen
  (gen_random_uuid()::text, 'Cefuroxime', 'Zinacef', 'Cephalosporin', 'Second Generation', 'IV/Oral', 'Watch', 'Moderate', true, true, false, false, false, false, true, false),
  (gen_random_uuid()::text, 'Cefoxitin', 'Mefoxin', 'Cephalosporin', 'Second Generation', 'IV', 'Watch', 'Moderate', true, true, true, false, false, false, false, false),
  (gen_random_uuid()::text, 'Cefotetan', null, 'Cephalosporin', 'Second Generation', 'IV', 'Watch', 'Moderate', true, true, true, false, false, false, false, false),
  -- Cephalosporins 3rd Gen
  (gen_random_uuid()::text, 'Ceftriaxone', 'Rocephin', 'Cephalosporin', 'Third Generation', 'IV', 'Watch', 'Broad', true, true, false, false, false, false, false, false),
  (gen_random_uuid()::text, 'Cefotaxime', 'Claforan', 'Cephalosporin', 'Third Generation', 'IV', 'Watch', 'Broad', true, true, false, false, false, false, false, false),
  (gen_random_uuid()::text, 'Ceftazidime', 'Fortaz', 'Cephalosporin', 'Third Generation', 'IV', 'Watch', 'Broad', false, true, false, true, false, false, true, false),
  (gen_random_uuid()::text, 'Cefixime', 'Suprax', 'Cephalosporin', 'Third Generation', 'Oral', 'Watch', 'Moderate', false, true, false, false, false, false, true, false),
  -- Cephalosporins 4th Gen
  (gen_random_uuid()::text, 'Cefepime', 'Maxipime', 'Cephalosporin', 'Fourth Generation', 'IV', 'Watch', 'Broad', true, true, false, true, false, false, true, false),
  -- Cephalosporins 5th Gen
  (gen_random_uuid()::text, 'Ceftaroline', 'Teflaro', 'Cephalosporin', 'Fifth Generation', 'IV', 'Reserve', 'Broad', true, true, false, false, true, false, true, false),
  -- Carbapenems
  (gen_random_uuid()::text, 'Meropenem', 'Merrem', 'Carbapenem', null, 'IV', 'Watch', 'Broad', true, true, true, true, false, false, true, false),
  (gen_random_uuid()::text, 'Imipenem', 'Primaxin', 'Carbapenem', null, 'IV', 'Watch', 'Broad', true, true, true, true, false, false, true, false),
  (gen_random_uuid()::text, 'Ertapenem', 'Invanz', 'Carbapenem', null, 'IV', 'Watch', 'Broad', true, true, true, false, false, false, true, false),
  (gen_random_uuid()::text, 'Doripenem', 'Doribax', 'Carbapenem', null, 'IV', 'Watch', 'Broad', true, true, true, true, false, false, true, false),
  -- Monobactam
  (gen_random_uuid()::text, 'Aztreonam', 'Azactam', 'Monobactam', null, 'IV', 'Watch', 'Narrow', false, true, false, true, false, false, true, false),
  -- Glycopeptides
  (gen_random_uuid()::text, 'Vancomycin', null, 'Glycopeptide', null, 'IV', 'Watch', 'Narrow', true, false, false, false, true, false, true, true),
  (gen_random_uuid()::text, 'Teicoplanin', 'Targocid', 'Glycopeptide', null, 'IV/IM', 'Watch', 'Narrow', true, false, false, false, true, false, true, true),
  -- Lipoglycopeptides
  (gen_random_uuid()::text, 'Dalbavancin', 'Dalvance', 'Lipoglycopeptide', null, 'IV', 'Reserve', 'Narrow', true, false, false, false, true, false, true, false),
  (gen_random_uuid()::text, 'Oritavancin', 'Orbactiv', 'Lipoglycopeptide', null, 'IV', 'Reserve', 'Narrow', true, false, false, false, true, false, true, false),
  -- Oxazolidinones
  (gen_random_uuid()::text, 'Linezolid', 'Zyvox', 'Oxazolidinone', null, 'IV/Oral', 'Watch', 'Narrow', true, false, false, false, true, true, false, false),
  (gen_random_uuid()::text, 'Tedizolid', 'Sivextro', 'Oxazolidinone', null, 'IV/Oral', 'Reserve', 'Narrow', true, false, false, false, true, true, false, false),
  -- Lipopeptide
  (gen_random_uuid()::text, 'Daptomycin', 'Cubicin', 'Lipopeptide', null, 'IV', 'Reserve', 'Narrow', true, false, false, false, true, true, true, false),
  -- Aminoglycosides
  (gen_random_uuid()::text, 'Amikacin', null, 'Aminoglycoside', null, 'IV/IM', 'Access', 'Moderate', false, true, false, true, false, false, true, true),
  (gen_random_uuid()::text, 'Gentamicin', null, 'Aminoglycoside', null, 'IV/IM', 'Access', 'Moderate', false, true, false, true, false, false, true, true),
  (gen_random_uuid()::text, 'Tobramycin', 'Tobrex', 'Aminoglycoside', null, 'IV', 'Watch', 'Moderate', false, true, false, true, false, false, true, true),
  (gen_random_uuid()::text, 'Streptomycin', null, 'Aminoglycoside', null, 'IV/IM', 'Access', 'Narrow', false, true, false, false, false, false, true, true),
  -- Fluoroquinolones
  (gen_random_uuid()::text, 'Ciprofloxacin', 'Cipro', 'Fluoroquinolone', null, 'IV/Oral', 'Watch', 'Broad', true, true, false, true, false, true, true, false),
  (gen_random_uuid()::text, 'Levofloxacin', 'Levaquin', 'Fluoroquinolone', null, 'IV/Oral', 'Watch', 'Broad', true, true, false, false, false, true, true, false),
  (gen_random_uuid()::text, 'Moxifloxacin', 'Avelox', 'Fluoroquinolone', null, 'IV/Oral', 'Watch', 'Broad', true, true, false, false, false, true, false, false),
  (gen_random_uuid()::text, 'Ofloxacin', 'Floxin', 'Fluoroquinolone', null, 'IV/Oral', 'Watch', 'Broad', true, true, false, false, false, true, true, false),
  -- Macrolides
  (gen_random_uuid()::text, 'Azithromycin', 'Zithromax', 'Macrolide', null, 'IV/Oral', 'Watch', 'Moderate', true, false, false, false, false, true, false, false),
  (gen_random_uuid()::text, 'Clarithromycin', 'Biaxin', 'Macrolide', null, 'IV/Oral', 'Watch', 'Moderate', true, false, false, false, false, true, true, false),
  (gen_random_uuid()::text, 'Erythromycin', null, 'Macrolide', null, 'IV/Oral', 'Watch', 'Moderate', true, false, false, false, false, true, false, false),
  -- Tetracyclines
  (gen_random_uuid()::text, 'Doxycycline', null, 'Tetracycline', null, 'IV/Oral', 'Access', 'Moderate', true, true, false, false, false, true, false, false),
  (gen_random_uuid()::text, 'Minocycline', 'Minocin', 'Tetracycline', null, 'IV/Oral', 'Watch', 'Moderate', true, true, false, false, true, true, false, false),
  (gen_random_uuid()::text, 'Tigecycline', 'Tygacil', 'Tetracycline', null, 'IV', 'Reserve', 'Broad', true, true, false, false, true, true, false, false),
  -- Nitroimidazoles
  (gen_random_uuid()::text, 'Metronidazole', 'Flagyl', 'Nitroimidazole', null, 'IV/Oral', 'Access', 'Narrow', false, false, true, false, false, false, false, false),
  (gen_random_uuid()::text, 'Tinidazole', 'Tindamax', 'Nitroimidazole', null, 'Oral', 'Watch', 'Narrow', false, false, true, false, false, false, false, false),
  -- Sulfonamides
  (gen_random_uuid()::text, 'Trimethoprim-Sulfamethoxazole', 'Bactrim', 'Sulfonamide', null, 'IV/Oral', 'Access', 'Broad', true, true, false, false, false, false, true, false),
  -- Polymyxins
  (gen_random_uuid()::text, 'Colistin', 'Coly-Mycin', 'Polymyxin', null, 'IV/Inhal', 'Reserve', 'Narrow', false, true, false, true, false, false, true, true),
  (gen_random_uuid()::text, 'Polymyxin B', null, 'Polymyxin', null, 'IV', 'Reserve', 'Narrow', false, true, false, true, false, false, true, false),
  -- Glycylcycline (already included as Tigecycline above)
  -- Novel Beta-Lactam Combinations
  (gen_random_uuid()::text, 'Ceftazidime-Avibactam', 'Avycaz', 'Novel Beta-Lactam Combination', null, 'IV', 'Reserve', 'Broad', false, true, false, true, false, false, true, false),
  (gen_random_uuid()::text, 'Ceftolozane-Tazobactam', 'Zerbaxa', 'Novel Beta-Lactam Combination', null, 'IV', 'Reserve', 'Broad', false, true, false, true, false, false, true, false),
  (gen_random_uuid()::text, 'Meropenem-Vaborbactam', 'Vabomere', 'Novel Beta-Lactam Combination', null, 'IV', 'Reserve', 'Broad', true, true, true, true, false, false, true, false),
  (gen_random_uuid()::text, 'Imipenem-Relebactam', 'Recarbrio', 'Novel Beta-Lactam Combination', null, 'IV', 'Reserve', 'Broad', true, true, true, true, false, false, true, false),
  (gen_random_uuid()::text, 'Cefiderocol', 'Fetroja', 'Novel Beta-Lactam Combination', null, 'IV', 'Reserve', 'Broad', false, true, false, true, false, false, true, false)
ON CONFLICT (id) DO NOTHING;

-- Update specific coverage flags on inserted antibiotics
UPDATE antibiotic_master SET covers_esbl = true WHERE generic_name IN ('Meropenem', 'Imipenem', 'Ertapenem', 'Doripenem', 'Ceftazidime-Avibactam', 'Ceftolozane-Tazobactam', 'Meropenem-Vaborbactam', 'Imipenem-Relebactam', 'Cefiderocol');
UPDATE antibiotic_master SET covers_cre = true WHERE generic_name IN ('Ceftazidime-Avibactam', 'Meropenem-Vaborbactam', 'Imipenem-Relebactam', 'Cefiderocol', 'Colistin', 'Polymyxin B');
UPDATE antibiotic_master SET covers_anaerobes = true WHERE generic_name IN ('Metronidazole', 'Tinidazole', 'Piperacillin-Tazobactam', 'Ampicillin-Sulbactam', 'Ticarcillin-Clavulanate', 'Meropenem', 'Imipenem', 'Ertapenem', 'Doripenem', 'Cefoxitin', 'Cefotetan', 'Meropenem-Vaborbactam', 'Imipenem-Relebactam');
UPDATE antibiotic_master SET covers_pseudomonas = true WHERE generic_name IN ('Piperacillin-Tazobactam', 'Ticarcillin-Clavulanate', 'Ceftazidime', 'Cefepime', 'Meropenem', 'Imipenem', 'Doripenem', 'Aztreonam', 'Ciprofloxacin', 'Amikacin', 'Gentamicin', 'Tobramycin', 'Colistin', 'Polymyxin B', 'Ceftazidime-Avibactam', 'Ceftolozane-Tazobactam', 'Meropenem-Vaborbactam', 'Imipenem-Relebactam', 'Cefiderocol');
UPDATE antibiotic_master SET covers_mrsa = true WHERE generic_name IN ('Vancomycin', 'Teicoplanin', 'Dalbavancin', 'Oritavancin', 'Linezolid', 'Tedizolid', 'Daptomycin', 'Ceftaroline', 'Minocycline', 'Tigecycline');
UPDATE antibiotic_master SET covers_vre = true WHERE generic_name IN ('Linezolid', 'Tedizolid', 'Daptomycin', 'Tigecycline');
UPDATE antibiotic_master SET covers_atypicals = true WHERE class IN ('Macrolide', 'Fluoroquinolone', 'Tetracycline') OR generic_name IN ('Linezolid', 'Tedizolid', 'Daptomycin');
UPDATE antibiotic_master SET restricted = true WHERE aware_category = 'Reserve';
UPDATE antibiotic_master SET approval_required = true WHERE aware_category = 'Reserve';

-- 3. Coverage Master — which antibiotics cover which pathogens
CREATE TABLE IF NOT EXISTS coverage_master (
  id text primary key,
  pathogen text not null,
  antibiotic text not null,
  coverage_type text,
  strength text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO coverage_master (id, pathogen, antibiotic, coverage_type) VALUES
  -- MRSA
  (gen_random_uuid()::text, 'MRSA', 'Vancomycin', 'Standard'),
  (gen_random_uuid()::text, 'MRSA', 'Linezolid', 'Standard'),
  (gen_random_uuid()::text, 'MRSA', 'Daptomycin', 'Standard'),
  (gen_random_uuid()::text, 'MRSA', 'Ceftaroline', 'Alternative'),
  (gen_random_uuid()::text, 'MRSA', 'Teicoplanin', 'Standard'),
  (gen_random_uuid()::text, 'MRSA', 'Clindamycin', 'Alternative'),
  (gen_random_uuid()::text, 'MRSA', 'Tigecycline', 'Alternative'),
  -- VRE
  (gen_random_uuid()::text, 'VRE', 'Linezolid', 'Standard'),
  (gen_random_uuid()::text, 'VRE', 'Daptomycin', 'Standard'),
  (gen_random_uuid()::text, 'VRE', 'Tigecycline', 'Alternative'),
  -- ESBL
  (gen_random_uuid()::text, 'ESBL', 'Meropenem', 'Standard'),
  (gen_random_uuid()::text, 'ESBL', 'Imipenem', 'Standard'),
  (gen_random_uuid()::text, 'ESBL', 'Ertapenem', 'Standard'),
  (gen_random_uuid()::text, 'ESBL', 'Ceftazidime-Avibactam', 'Reserve'),
  (gen_random_uuid()::text, 'ESBL', 'Ceftolozane-Tazobactam', 'Reserve'),
  -- CRE
  (gen_random_uuid()::text, 'CRE', 'Ceftazidime-Avibactam', 'Reserve'),
  (gen_random_uuid()::text, 'CRE', 'Meropenem-Vaborbactam', 'Reserve'),
  (gen_random_uuid()::text, 'CRE', 'Cefiderocol', 'Reserve'),
  (gen_random_uuid()::text, 'CRE', 'Colistin', 'Reserve'),
  -- Pseudomonas
  (gen_random_uuid()::text, 'Pseudomonas', 'Piperacillin-Tazobactam', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Cefepime', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Ceftazidime', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Meropenem', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Imipenem', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Ciprofloxacin', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Amikacin', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Tobramycin', 'Standard'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Aztreonam', 'Alternative'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Colistin', 'Reserve'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Ceftazidime-Avibactam', 'Reserve'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Ceftolozane-Tazobactam', 'Reserve'),
  (gen_random_uuid()::text, 'Pseudomonas', 'Cefiderocol', 'Reserve'),
  -- Anaerobes
  (gen_random_uuid()::text, 'Anaerobes', 'Metronidazole', 'Standard'),
  (gen_random_uuid()::text, 'Anaerobes', 'Piperacillin-Tazobactam', 'Standard'),
  (gen_random_uuid()::text, 'Anaerobes', 'Meropenem', 'Standard'),
  (gen_random_uuid()::text, 'Anaerobes', 'Imipenem', 'Standard'),
  (gen_random_uuid()::text, 'Anaerobes', 'Ertapenem', 'Standard'),
  (gen_random_uuid()::text, 'Anaerobes', 'Ampicillin-Sulbactam', 'Standard'),
  -- Atypicals
  (gen_random_uuid()::text, 'Atypicals', 'Azithromycin', 'Standard'),
  (gen_random_uuid()::text, 'Atypicals', 'Doxycycline', 'Standard'),
  (gen_random_uuid()::text, 'Atypicals', 'Levofloxacin', 'Standard'),
  (gen_random_uuid()::text, 'Atypicals', 'Moxifloxacin', 'Standard'),
  -- MSSA
  (gen_random_uuid()::text, 'MSSA', 'Cloxacillin', 'Standard'),
  (gen_random_uuid()::text, 'MSSA', 'Cefazolin', 'Standard'),
  (gen_random_uuid()::text, 'MSSA', 'Cephalexin', 'Standard'),
  -- Enterococcus
  (gen_random_uuid()::text, 'Enterococcus', 'Ampicillin', 'Standard'),
  (gen_random_uuid()::text, 'Enterococcus', 'Vancomycin', 'Standard'),
  (gen_random_uuid()::text, 'Enterococcus', 'Linezolid', 'Standard'),
  (gen_random_uuid()::text, 'Enterococcus', 'Daptomycin', 'Standard'),
  -- Candida
  (gen_random_uuid()::text, 'Candida', 'Fluconazole', 'Standard'),
  (gen_random_uuid()::text, 'Candida', 'Micafungin', 'Standard'),
  (gen_random_uuid()::text, 'Candida', 'Caspofungin', 'Standard'),
  (gen_random_uuid()::text, 'Candida', 'Amphotericin B', 'Reserve'),
  -- Aspergillus
  (gen_random_uuid()::text, 'Aspergillus', 'Voriconazole', 'Standard'),
  (gen_random_uuid()::text, 'Aspergillus', 'Isavuconazole', 'Standard'),
  (gen_random_uuid()::text, 'Aspergillus', 'Amphotericin B', 'Reserve')
ON CONFLICT (id) DO NOTHING;

-- 4. Stewardship Status
CREATE TABLE IF NOT EXISTS stewardship_status_master (
  id text primary key,
  status_code text,
  status_name text not null,
  category text,
  requires_review boolean default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO stewardship_status_master (id, status_code, status_name, category, requires_review) VALUES
  (gen_random_uuid()::text, 'EMP', 'Empirical Therapy', 'Initial', true),
  (gen_random_uuid()::text, 'TAR', 'Targeted Therapy', 'Directed', false),
  (gen_random_uuid()::text, 'CUL-DIR', 'Culture Directed', 'Directed', false),
  (gen_random_uuid()::text, 'DE-ESC', 'De-escalated', 'Review', false),
  (gen_random_uuid()::text, 'ESC', 'Escalated', 'Review', false),
  (gen_random_uuid()::text, 'COMBO', 'Combination Therapy', 'Directed', true),
  (gen_random_uuid()::text, 'DEF', 'Definitive Therapy', 'Directed', false),
  (gen_random_uuid()::text, 'SWITCH', 'Oral Switch', 'Transition', false),
  (gen_random_uuid()::text, 'STOP', 'Stopped', 'End', false),
  (gen_random_uuid()::text, 'COMPL', 'Completed', 'End', false),
  (gen_random_uuid()::text, 'REST', 'Restricted Drug', 'Restriction', true),
  (gen_random_uuid()::text, 'ID-APP', 'ID Approval Required', 'Restriction', true),
  (gen_random_uuid()::text, 'REV-48', 'Review at 48 Hours', 'Review', true),
  (gen_random_uuid()::text, 'REV-72', 'Review at 72 Hours', 'Review', true),
  (gen_random_uuid()::text, 'CUL-PEND', 'Culture Pending', 'Pending', false),
  (gen_random_uuid()::text, 'SENS-PEND', 'Sensitivity Pending', 'Pending', false),
  (gen_random_uuid()::text, 'NO-GROW', 'No Growth', 'Micro', false),
  (gen_random_uuid()::text, 'CONTAM', 'Contaminant', 'Micro', false),
  (gen_random_uuid()::text, 'DUP', 'Duplicate Coverage', 'Review', true),
  (gen_random_uuid()::text, 'FAIL', 'Therapy Failure', 'Review', true)
ON CONFLICT (id) DO NOTHING;

-- 5. ICU Infection Syndromes
CREATE TABLE IF NOT EXISTS infection_syndrome_master (
  id text primary key,
  syndrome_code text,
  syndrome_name text not null,
  category text,
  common_pathogens text,
  typical_antibiotics text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO infection_syndrome_master (id, syndrome_code, syndrome_name, category, common_pathogens, typical_antibiotics) VALUES
  (gen_random_uuid()::text, 'CAP', 'Community Acquired Pneumonia', 'Respiratory', 'Strep. pneumoniae, Haemophilus, Atypicals', 'Ceftriaxone + Azithromycin / Levofloxacin'),
  (gen_random_uuid()::text, 'HAP', 'Hospital Acquired Pneumonia', 'Respiratory', 'Pseudomonas, MRSA, Enterobacterales', 'Piperacillin-Tazobactam + Vancomycin / Cefepime + Vancomycin'),
  (gen_random_uuid()::text, 'VAP', 'Ventilator Associated Pneumonia', 'Respiratory', 'Pseudomonas, Acinetobacter, MRSA', 'Anti-pseudomonal beta-lactam + Vancomycin or Linezolid'),
  (gen_random_uuid()::text, 'CAUTI', 'Catheter Associated UTI', 'Urinary', 'E. coli, Klebsiella, Pseudomonas, Enterococcus', 'Ceftriaxone / Cefepime / Carbapenem if ESBL'),
  (gen_random_uuid()::text, 'CUTI', 'Complicated UTI', 'Urinary', 'E. coli, Klebsiella, Proteus', 'Ceftriaxone / Cefepime / Carbapenem if ESBL'),
  (gen_random_uuid()::text, 'BSI', 'Bloodstream Infection', 'Blood', 'E. coli, Klebsiella, Staph. aureus, Enterococcus', 'Culture-directed therapy'),
  (gen_random_uuid()::text, 'CLABSI', 'Central Line Associated BSI', 'Blood', 'CoNS, Staph. aureus, Enterococcus, Candida', 'Vancomycin + Anti-pseudomonal beta-lactam'),
  (gen_random_uuid()::text, 'CRBSI', 'Catheter Related BSI', 'Blood', 'CoNS, Staph. aureus, Candida', 'Vancomycin + Remove catheter, Culture-directed'),
  (gen_random_uuid()::text, 'SSTI', 'Skin and Soft Tissue Infection', 'Skin', 'Strep. pyogenes, Staph. aureus', 'Cefazolin / Cloxacillin / Vancomycin if MRSA'),
  (gen_random_uuid()::text, 'NEC-FAS', 'Necrotizing Fasciitis', 'Skin', 'Mixed aerobes + anaerobes', 'Piperacillin-Tazobactam + Clindamycin / Carbapenem + Clindamycin'),
  (gen_random_uuid()::text, 'BRAIN-ABS', 'Brain Abscess', 'CNS', 'Strep. milleri, Bacteroides, Enterobacterales', 'Ceftriaxone + Metronidazole / Carbapenem'),
  (gen_random_uuid()::text, 'MENING', 'Meningitis', 'CNS', 'S. pneumoniae, Neisseria, Listeria', 'Ceftriaxone + Vancomycin + Ampicillin'),
  (gen_random_uuid()::text, 'IAI', 'Intra-abdominal Infection', 'Abdomen', 'E. coli, Bacteroides, Enterococcus', 'Piperacillin-Tazobactam / Ertapenem / Meropenem'),
  (gen_random_uuid()::text, 'PERITON', 'Peritonitis', 'Abdomen', 'E. coli, Klebsiella, Enterococcus, Anaerobes', 'Piperacillin-Tazobactam / Ertapenem / Ceftriaxone + Metronidazole'),
  (gen_random_uuid()::text, 'CHOLANG', 'Cholangitis', 'Hepatobiliary', 'E. coli, Klebsiella, Enterococcus, Anaerobes', 'Piperacillin-Tazobactam / Ceftriaxone + Metronidazole'),
  (gen_random_uuid()::text, 'DFI', 'Diabetic Foot Infection', 'Skin', 'Staph. aureus, Streptococcus, Anaerobes, Pseudomonas', 'Piperacillin-Tazobactam / Ampicillin-Sulbactam'),
  (gen_random_uuid()::text, 'OSTEO', 'Osteomyelitis', 'Bone', 'Staph. aureus, Gram negatives', 'Cefazolin / Cloxacillin + Culture-directed Gram-negative coverage'),
  (gen_random_uuid()::text, 'SEP-ART', 'Septic Arthritis', 'Joint', 'Staph. aureus, Streptococcus', 'Cefazolin / Cloxacillin / Vancomycin if MRSA'),
  (gen_random_uuid()::text, 'ENDOC', 'Endocarditis', 'Cardiac', 'Strep. viridans, Staph. aureus, Enterococcus', 'Ampicillin + Gentamicin / Vancomycin + Gentamicin'),
  (gen_random_uuid()::text, 'FEB-NEUT', 'Febrile Neutropenia', 'Hematology', 'Pseudomonas, E. coli, Staph. aureus', 'Cefepime / Piperacillin-Tazobactam / Meropenem + Vancomycin if instability'),
  (gen_random_uuid()::text, 'SEPSIS', 'Sepsis', 'Systemic', 'Variable — depends on source', 'Broad-spectrum: Piperacillin-Tazobactam / Meropenem + Vancomycin'),
  (gen_random_uuid()::text, 'SEP-SHOCK', 'Septic Shock', 'Systemic', 'Variable — depends on source', 'Broad-spectrum: Meropenem + Vancomycin ± antifungal'),
  (gen_random_uuid()::text, 'NEUT-FEV', 'Neutropenic Fever', 'Hematology', 'Pseudomonas, Gram negatives', 'Cefepime / Piperacillin-Tazobactam / Meropenem')
ON CONFLICT (id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_antibiotic_master_generic ON antibiotic_master(generic_name);
CREATE INDEX IF NOT EXISTS idx_antibiotic_master_class ON antibiotic_master(class);
CREATE INDEX IF NOT EXISTS idx_antibiotic_master_aware ON antibiotic_master(aware_category);
CREATE INDEX IF NOT EXISTS idx_coverage_master_pathogen ON coverage_master(pathogen);
CREATE INDEX IF NOT EXISTS idx_infection_syndrome_master_name ON infection_syndrome_master(syndrome_name);
  