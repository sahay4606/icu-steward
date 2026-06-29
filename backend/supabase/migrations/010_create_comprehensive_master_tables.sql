-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 010: Comprehensive Master Reference Tables
-- Replaces migrations 007 and 008 with workbook-derived data.
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. DIAGNOSIS CATALOG
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS diagnosis_catalog (
  id text primary key,
  diagnosis_name text not null,
  icd10_code text,
  category text,
  typical_onset_setting text,
  severity_tier text,
  common_pathogens text,
  empiric_coverage_class text,
  care_bundle_reference text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO diagnosis_catalog (id, diagnosis_name, icd10_code, category, typical_onset_setting, severity_tier, common_pathogens, empiric_coverage_class, care_bundle_reference) VALUES
  ('D01', 'Septic shock', 'R65.21', 'Systemic', 'ICU', 'Critical', 'Polymicrobial / gram +/-', 'Broad-spectrum gram +/- coverage', 'Surviving Sepsis Campaign hour-1 bundle'),
  ('D02', 'Severe sepsis (without shock)', 'A41.9', 'Systemic', 'ICU/ward', 'Critical-High', 'Polymicrobial', 'Broad-spectrum', 'Surviving Sepsis Campaign'),
  ('D03', 'Ventilator-associated pneumonia (VAP)', 'J95.851', 'Respiratory', 'ICU-acquired', 'High', 'Pseudomonas, Klebsiella, Acinetobacter, MRSA', 'Broad gram-negative + MRSA cover', 'IHI Ventilator Bundle'),
  ('D04', 'Hospital-acquired pneumonia (HAP)', 'J18.9', 'Respiratory', 'ICU/ward-acquired', 'High', 'Similar to VAP, broader range', 'Broad gram-negative cover', 'Institutional HAP pathway'),
  ('D05', 'Community-acquired pneumonia (CAP)', 'J18.9', 'Respiratory', 'Community', 'Moderate-High', 'S. pneumoniae, H. influenzae, atypicals', 'Beta-lactam + macrolide', 'CURB-65 / PSI severity pathway'),
  ('D06', 'Central line-associated bloodstream infection (CLABSI)', 'T80.211A', 'Device-related', 'ICU', 'Critical', 'CoNS, S. aureus, Candida', 'Vancomycin +/- gram-negative cover', 'CLABSI prevention bundle'),
  ('D07', 'Catheter-associated UTI (CAUTI)', 'T83.51', 'Device-related', 'ICU/ward', 'Moderate', 'E. coli, Klebsiella, Enterococcus', 'Targeted gram-negative cover', 'CAUTI prevention bundle'),
  ('D08', 'Intra-abdominal sepsis / peritonitis', 'K65.9', 'Abdominal', 'ICU/ward/post-surgical', 'Critical', 'Polymicrobial, anaerobes', 'Anti-anaerobic + broad gram-negative', 'Source control + antibiotics within hours'),
  ('D09', 'Necrotizing fasciitis', 'M72.6', 'Skin/soft tissue', 'Surgical emergency', 'Critical', 'Group A Streptococcus, polymicrobial', 'Broad-spectrum + toxin suppression', 'Emergent surgical debridement bundle'),
  ('D10', 'Cellulitis / skin and soft tissue infection (SSTI)', 'L03.90', 'Skin/soft tissue', 'Ward/community', 'Moderate', 'Staphylococcus, Streptococcus', 'Narrow gram-positive cover', 'Standard SSTI pathway'),
  ('D11', 'Bacterial meningitis', 'G00.9', 'CNS', 'Community/ICU', 'Critical', 'N. meningitidis, S. pneumoniae, Listeria', 'CNS-penetrant beta-lactam + vancomycin', 'Meningitis empiric pathway'),
  ('D12', 'Ventriculitis / EVD-associated infection', 'G04.90', 'CNS-device', 'ICU', 'Critical', 'CoNS, gram-negative rods', 'CNS-penetrant vancomycin + cefepime/meropenem', 'Neuro-ICU device infection pathway'),
  ('D13', 'Infective endocarditis', 'I33.0', 'Cardiac', 'ICU/ward', 'High-Critical', 'Staphylococcus, Streptococcus, Enterococcus', 'Targeted prolonged therapy', 'Duke criteria-guided pathway'),
  ('D14', 'Febrile neutropenia', 'D70', 'Hematology/oncology', 'ICU/ward', 'Critical', 'Broad gram-negative incl. Pseudomonas', 'Anti-pseudomonal beta-lactam', 'Neutropenic fever escalation pathway'),
  ('D15', 'Clostridioides difficile colitis', 'A04.7', 'Gastrointestinal', 'Ward/ICU', 'Moderate-High', 'C. difficile', 'Oral vancomycin / fidaxomicin', 'C. diff isolation + treatment pathway'),
  ('D16', 'Empyema / pleural infection', 'J86.9', 'Respiratory', 'ICU/ward', 'High', 'S. pneumoniae, anaerobes', 'Anti-anaerobic broad-spectrum + drainage', 'Pleural infection pathway'),
  ('D17', 'Candidemia / invasive candidiasis', 'B37.7', 'Bloodstream/fungal', 'ICU', 'High-Critical', 'Candida spp.', 'Echinocandin first-line', 'Invasive fungal infection pathway'),
  ('D18', 'Osteomyelitis', 'M86.9', 'Bone', 'Ward/ICU', 'High', 'S. aureus', 'Targeted prolonged IV therapy', 'Bone/joint infection pathway'),
  ('D19', 'Complicated UTI / urosepsis', 'N39.0', 'Genitourinary', 'ICU/ward', 'High', 'E. coli, Klebsiella, Pseudomonas', 'Broad gram-negative cover', 'Urosepsis escalation pathway'),
  ('D20', 'Surgical site infection', 'T81.4', 'Post-surgical', 'Ward/ICU', 'Moderate-High', 'Staphylococcus, polymicrobial (site-dependent)', 'Site-dependent empiric cover', 'Surgical site infection pathway'),
  ('D21', 'Burn wound infection', 'T31', 'Skin/soft tissue', 'ICU burn unit', 'High', 'Pseudomonas, Staphylococcus, polymicrobial', 'Broad-spectrum + topical agents', 'Burn unit infection pathway'),
  ('D22', 'Aspiration pneumonia', 'J69.0', 'Respiratory', 'ICU/ward', 'Moderate-High', 'Anaerobes, gram-negative rods', 'Anti-anaerobic beta-lactam', 'Aspiration pneumonia pathway'),
  ('D23', 'ECMO-associated bloodstream infection', 'T82.7', 'Device-related', 'ICU', 'Critical', 'CoNS, Candida, gram-negative rods', 'Vancomycin + broad gram-negative cover', 'ECMO infection surveillance pathway')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ANTIBIOTIC CATALOG
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS antibiotic_catalog (
  id text primary key,
  drug_name text not null,
  class text,
  spectrum_category text,
  route text,
  renal_adjustment boolean not null default false,
  hepatic_adjustment boolean not null default false,
  key_monitoring text,
  allergy_class text,
  primary_indications text,
  spectrum_notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO antibiotic_catalog (id, drug_name, class, spectrum_category, route, renal_adjustment, hepatic_adjustment, key_monitoring, allergy_class, primary_indications, spectrum_notes) VALUES
  ('AB01', 'Meropenem', 'Carbapenem', 'Broad gram-negative incl. Pseudomonas/ESBL', 'IV', true, false, 'Renal function, seizure threshold', 'Beta-lactam', 'VAP, severe sepsis, ESBL infections', 'Stable to most ESBL/AmpC enzymes'),
  ('AB02', 'Imipenem-Cilastatin', 'Carbapenem', 'Broad gram-negative/positive', 'IV', true, false, 'Renal function, seizure threshold (lower than meropenem)', 'Beta-lactam', 'Severe polymicrobial infection', 'Higher seizure risk than meropenem'),
  ('AB03', 'Ertapenem', 'Carbapenem', 'Broad, excludes Pseudomonas/Acinetobacter', 'IV/IM', true, false, 'Renal function', 'Beta-lactam', 'Intra-abdominal sepsis, complicated UTI', 'Once-daily dosing, not for Pseudomonas'),
  ('AB04', 'Piperacillin-Tazobactam', 'Beta-lactam/inhibitor combo', 'Broad gram +/- + anaerobes', 'IV', true, false, 'Renal function', 'Beta-lactam', 'Intra-abdominal sepsis, HAP, febrile neutropenia', 'Workhorse broad-spectrum agent'),
  ('AB05', 'Ampicillin-Sulbactam', 'Beta-lactam/inhibitor combo', 'Gram +/- + anaerobes (narrower)', 'IV', true, false, 'Renal function', 'Beta-lactam', 'Aspiration pneumonia, mild intra-abdominal infection', 'Narrower than pip-tazo'),
  ('AB06', 'Ceftriaxone', '3rd-gen cephalosporin', 'Gram-negative + some gram-positive', 'IV/IM', false, true, 'LFT', 'Beta-lactam', 'CAP, meningitis, uncomplicated infections', 'No anti-pseudomonal activity'),
  ('AB07', 'Ceftazidime', '3rd-gen cephalosporin (anti-pseudomonal)', 'Gram-negative incl. Pseudomonas', 'IV', true, false, 'Renal function', 'Beta-lactam', 'Pseudomonas-targeted therapy', 'Weak gram-positive activity'),
  ('AB08', 'Cefepime', '4th-gen cephalosporin', 'Broad incl. Pseudomonas', 'IV', true, false, 'Renal function, neurotoxicity in renal failure', 'Beta-lactam', 'Febrile neutropenia, HAP/VAP', 'Neurotoxicity risk if underdosed in renal failure'),
  ('AB09', 'Ceftaroline', '5th-gen cephalosporin', 'Gram-positive incl. MRSA + some gram-negative', 'IV', true, false, 'Renal function', 'Beta-lactam', 'Complicated SSTI/CAP with MRSA risk', 'Only cephalosporin with MRSA activity'),
  ('AB10', 'Ceftazidime-Avibactam', 'Cephalosporin/beta-lactamase inhibitor', 'MDR gram-negative incl. KPC-CRE', 'IV', true, false, 'Renal function', 'Beta-lactam', 'Carbapenem-resistant Enterobacterales, MDR Pseudomonas', 'No activity vs metallo-beta-lactamases'),
  ('AB11', 'Ceftolozane-Tazobactam', 'Cephalosporin/inhibitor combo', 'MDR Pseudomonas, gram-negative', 'IV', true, false, 'Renal function', 'Beta-lactam', 'MDR Pseudomonas infections', 'Potent anti-pseudomonal activity'),
  ('AB12', 'Meropenem-Vaborbactam', 'Carbapenem/inhibitor combo', 'CRE-targeted', 'IV', true, false, 'Renal function, seizure threshold', 'Beta-lactam', 'KPC-producing CRE', 'Targets KPC specifically'),
  ('AB13', 'Aztreonam', 'Monobactam', 'Gram-negative only', 'IV', true, false, 'Renal function', 'None (safe in most penicillin allergy)', 'Gram-negative infection in beta-lactam-allergic patients', 'Shares side chain with ceftazidime - caution if allergic to that'),
  ('AB14', 'Vancomycin', 'Glycopeptide', 'Gram-positive incl. MRSA', 'IV', true, false, 'Trough/AUC, creatinine', 'Rare true allergy', 'MRSA, CLABSI, severe gram-positive infection', 'Red-man syndrome is infusion-rate reaction, not allergy'),
  ('AB15', 'Linezolid', 'Oxazolidinone', 'Gram-positive incl. VRE, MRSA', 'IV/PO', false, false, 'CBC/platelets weekly, serotonin syndrome risk', 'Rare', 'VRE, MRSA pneumonia', 'Caution with serotonergic drugs'),
  ('AB16', 'Daptomycin', 'Lipopeptide', 'Gram-positive incl. MRSA, VRE', 'IV', true, false, 'CPK weekly', 'Rare', 'Bacteremia, endocarditis', 'Inactivated by pulmonary surfactant - not for pneumonia'),
  ('AB17', 'Colistin', 'Polymyxin', 'MDR gram-negative (CRE, Acinetobacter)', 'IV', true, false, 'Renal function, electrolytes', 'Rare', 'Carbapenem-resistant organisms, MDR organisms', 'Last-line agent, narrow therapeutic window'),
  ('AB18', 'Polymyxin B', 'Polymyxin', 'MDR gram-negative', 'IV', true, false, 'Renal function, neurotoxicity', 'Rare', 'Carbapenem-resistant organisms (alternative to colistin)', 'Dosing not renally adjusted the way colistin is'),
  ('AB19', 'Amikacin', 'Aminoglycoside', 'Gram-negative incl. Pseudomonas', 'IV', true, false, 'Peak/trough, renal function, hearing', 'Rare', 'MDR synergy/combination therapy', 'Often combined with beta-lactam, not monotherapy'),
  ('AB20', 'Gentamicin', 'Aminoglycoside', 'Gram-negative, enterococcal synergy', 'IV', true, false, 'Peak/trough, renal function, hearing', 'Rare', 'Synergy in endocarditis, gram-negative infection', 'Synergy dosing differs from treatment dosing'),
  ('AB21', 'Ciprofloxacin', 'Fluoroquinolone', 'Gram-negative', 'IV/PO', true, false, 'QTc, tendon', 'Rare', 'UTI, atypical pneumonia', 'Weak gram-positive activity'),
  ('AB22', 'Levofloxacin', 'Fluoroquinolone', 'Gram-negative + atypicals + some gram-positive', 'IV/PO', true, false, 'QTc, tendon', 'Rare', 'CAP, atypical coverage', 'Better gram-positive activity than ciprofloxacin'),
  ('AB23', 'Metronidazole', 'Nitroimidazole', 'Anaerobes', 'IV/PO', false, true, 'LFT, neuro symptoms with prolonged use', 'Rare', 'Intra-abdominal infection, C. difficile', 'No aerobic gram-negative or gram-positive activity'),
  ('AB24', 'Clindamycin', 'Lincosamide', 'Gram-positive, anaerobes, toxin suppression', 'IV/PO', false, true, 'C. difficile risk', 'Rare', 'Necrotizing fasciitis (toxin suppression), anaerobic infection', 'Used adjunctively for toxin-mediated disease'),
  ('AB25', 'Tigecycline', 'Glycylcycline', 'Broad incl. anaerobes, excl. Pseudomonas/Proteus', 'IV', false, true, 'LFT', 'Tetracycline-related', 'Complicated intra-abdominal/skin infection', 'Low serum concentrations - avoid for bacteremia'),
  ('AB26', 'Trimethoprim-Sulfamethoxazole', 'Folate antagonist combo', 'Gram-negative, some gram-positive, Stenotrophomonas', 'IV/PO', true, false, 'Renal function, hyperkalemia, CBC', 'Sulfa', 'UTI, Stenotrophomonas, PJP', 'First-line for Stenotrophomonas maltophilia'),
  ('AB27', 'Doxycycline', 'Tetracycline', 'Atypicals, broad spectrum', 'IV/PO', false, true, 'Photosensitivity', 'Tetracycline', 'Atypical pneumonia, tick-borne illness', 'Avoid in pregnancy, young children'),
  ('AB28', 'Fluconazole', 'Azole antifungal', 'Candida spp. (non-resistant)', 'IV/PO', true, true, 'LFT, QTc', 'Rare', 'Candidemia (susceptible species)', 'No activity vs C. glabrata (variable), C. krusei (resistant)'),
  ('AB29', 'Voriconazole', 'Azole antifungal', 'Aspergillus, some Candida', 'IV/PO', false, true, 'LFT, drug levels, visual disturbance', 'Rare', 'Invasive aspergillosis', 'Numerous drug interactions, requires level monitoring'),
  ('AB30', 'Micafungin', 'Echinocandin antifungal', 'Broad Candida incl. resistant species', 'IV', false, false, 'LFT', 'Rare', 'First-line candidemia/invasive candidiasis', 'Preferred empiric choice for unstable candidemia'),
  ('AB31', 'Amphotericin B (liposomal)', 'Polyene antifungal', 'Broad fungal incl. molds', 'IV', true, false, 'Renal function, K/Mg, infusion reactions', 'Rare', 'Refractory/severe invasive fungal infection', 'Reserved for resistant or refractory infections')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. INVESTIGATION CATALOG
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS investigation_catalog (
  id text primary key,
  investigation_name text not null,
  investigation_type text,
  specimen_method text,
  clinical_purpose text,
  typical_frequency text,
  linked_entities text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO investigation_catalog (id, investigation_name, investigation_type, specimen_method, clinical_purpose, typical_frequency, linked_entities) VALUES
  ('INV01', 'Complete blood count (CBC)', 'Lab', 'Blood', 'Infection / marrow toxicity screen', 'Daily or per protocol', 'Diagnosis, Antibiotic'),
  ('INV02', 'C-reactive protein (CRP)', 'Lab', 'Blood', 'Inflammatory trend marker', 'Every 48-72h', 'Diagnosis'),
  ('INV03', 'Procalcitonin', 'Lab', 'Blood', 'Bacterial infection marker, de-escalation guide', 'Day 1, 3, 5', 'Diagnosis, Antibiotic'),
  ('INV04', 'Lactate', 'Lab', 'Blood', 'Tissue perfusion / severity marker', 'Initial + 6h repeat', 'Diagnosis (sepsis)'),
  ('INV05', 'Arterial blood gas (ABG)', 'Lab', 'Arterial blood', 'Oxygenation / ventilation status', 'Per ventilator status', 'Device (ETT)'),
  ('INV06', 'Renal function tests (creatinine, urea, electrolytes)', 'Lab', 'Blood', 'Renal function, drug dosing', 'Daily on nephrotoxic drugs', 'Antibiotic, Device'),
  ('INV07', 'Liver function tests (LFT)', 'Lab', 'Blood', 'Hepatic function, drug dosing', 'Baseline + weekly', 'Antibiotic'),
  ('INV08', 'Vancomycin level (trough/AUC)', 'Lab', 'Blood', 'Pharmacokinetic dosing', 'Per institutional protocol', 'Antibiotic'),
  ('INV09', 'Aminoglycoside levels (peak/trough)', 'Lab', 'Blood', 'Pharmacokinetic dosing', 'Per institutional protocol', 'Antibiotic'),
  ('INV10', 'Chest X-ray', 'Imaging', 'Radiograph', 'Infiltrate identification, device position', 'Daily if ventilated', 'Device, Diagnosis'),
  ('INV11', 'CT abdomen/pelvis', 'Imaging', 'CT scan', 'Source identification', 'On clinical suspicion', 'Diagnosis'),
  ('INV12', 'CT chest', 'Imaging', 'CT scan', 'Empyema / abscess characterization', 'On clinical suspicion', 'Diagnosis'),
  ('INV13', 'MRI spine', 'Imaging', 'MRI', 'Osteomyelitis / discitis workup', 'On clinical suspicion', 'Diagnosis'),
  ('INV14', 'Echocardiogram (TTE/TEE)', 'Imaging', 'Ultrasound', 'Endocarditis workup, vegetation detection', 'On clinical suspicion', 'Diagnosis'),
  ('INV15', 'Urinalysis', 'Lab', 'Urine', 'Pyuria / nitrites screen', 'With suspected CAUTI', 'Device (Foley), Culture'),
  ('INV16', 'Creatine phosphokinase (CPK)', 'Lab', 'Blood', 'Myotoxicity marker', 'Weekly on daptomycin', 'Antibiotic'),
  ('INV17', 'Audiometry', 'Functional', 'N/A', 'Ototoxicity screen', 'Baseline + after 7-10 days of aminoglycoside', 'Antibiotic'),
  ('INV18', 'Beta-D-glucan', 'Lab', 'Blood', 'Invasive fungal infection marker', 'On suspicion of invasive fungal infection', 'Diagnosis'),
  ('INV19', 'Galactomannan', 'Lab', 'Blood / BAL', 'Aspergillus marker', 'On suspicion of invasive aspergillosis', 'Diagnosis, Culture'),
  ('INV20', 'C. difficile toxin PCR / EIA', 'Lab', 'Stool', 'Confirm C. difficile colitis', 'On diarrhea with risk factors', 'Diagnosis, Culture'),
  ('INV21', 'Coagulation profile (PT/INR/aPTT/fibrinogen)', 'Lab', 'Blood', 'DIC / sepsis coagulopathy screen', 'Daily in septic shock', 'Diagnosis'),
  ('INV22', 'Sputum / aspirate gram stain', 'Lab', 'Sputum/ETA', 'Rapid organism morphology screen', 'Same day as culture collection', 'Culture')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. DEVICE CATALOG
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS device_catalog (
  id text primary key,
  device_name text not null,
  insertion_site_type text,
  primary_infection_risk text,
  recommended_cultures text,
  recommended_monitoring text,
  review_trigger text,
  typical_removal_criteria text,
  review_interval text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO device_catalog (id, device_name, insertion_site_type, primary_infection_risk, recommended_cultures, recommended_monitoring, review_trigger, typical_removal_criteria, review_interval) VALUES
  ('DEV01', 'Central venous catheter (CVC)', 'Subclavian / IJ / femoral', 'CLABSI', 'Blood + catheter tip culture', 'Site inspection, CRP/lactate trend', 'Daily', 'No longer needed / signs of infection', 'Daily necessity review'),
  ('DEV02', 'Peripherally inserted central catheter (PICC)', 'Peripheral-to-central', 'CLABSI (lower risk)', 'Blood culture', 'Site inspection', 'Weekly', 'Therapy course completed', 'Weekly review'),
  ('DEV03', 'Arterial line', 'Radial / femoral', 'Local infection (rare bacteremia)', 'Blood culture if suspected', 'Site inspection', 'Daily', 'Hemodynamic monitoring no longer needed', 'Daily review'),
  ('DEV04', 'Endotracheal tube (ETT) / ventilator', 'Airway', 'VAP', 'ETA culture, BAL, chest X-ray', 'ABG, sedation level, cuff pressure', 'Daily', 'Extubation criteria met', 'Daily review (ventilator bundle)'),
  ('DEV05', 'Tracheostomy', 'Airway', 'Tracheobronchitis / VAP', 'Tracheal aspirate culture', 'Secretions, stoma site', 'Daily', 'Weaning achieved', 'Daily review'),
  ('DEV06', 'Foley catheter', 'Urethral', 'CAUTI', 'Urine culture, urinalysis', 'Output monitoring, urine appearance', 'Daily', 'No longer clinically indicated', 'Daily review'),
  ('DEV07', 'Suprapubic catheter', 'Suprapubic', 'CAUTI (lower risk)', 'Urine culture', 'Site inspection', 'Daily', 'No longer clinically indicated', 'Daily review'),
  ('DEV08', 'Chest tube', 'Pleural', 'Empyema / pleural infection', 'Pleural fluid culture', 'Drainage volume/character, chest X-ray', 'Daily', 'Lung re-expansion, minimal output', 'Daily review'),
  ('DEV09', 'Hemodialysis catheter', 'Subclavian / IJ / femoral', 'Catheter-related bloodstream infection', 'Blood culture (line + peripheral)', 'Site inspection pre/post dialysis', 'Each dialysis session', 'Permanent access established', 'Each-session review'),
  ('DEV10', 'External ventricular drain (EVD) / ICP monitor', 'Cranial', 'Ventriculitis', 'CSF culture', 'CSF cell count, protein, glucose', 'Daily', 'Resolution of need for ICP monitoring / CSF diversion', 'Daily review'),
  ('DEV11', 'Peritoneal dialysis catheter', 'Abdominal wall', 'Peritonitis', 'Peritoneal fluid culture', 'Effluent clarity, cell count', 'Per exchange', 'Catheter dysfunction or infection', 'Per-exchange review'),
  ('DEV12', 'Tunneled catheter (Hickman / port)', 'Subclavian / IJ (tunneled)', 'CLABSI (lower long-term risk)', 'Blood + catheter tip culture', 'Site inspection', 'Weekly', 'Long-term therapy completed', 'Weekly review'),
  ('DEV13', 'Surgical drain', 'Surgical site', 'Surgical site infection', 'Drain fluid / wound culture', 'Output volume/character', 'Daily', 'No further drainage needed', 'Daily review'),
  ('DEV14', 'ECMO cannula', 'Vascular (venous/arterial)', 'Cannula-associated bloodstream infection', 'Blood culture', 'Site inspection, circuit checks', 'Daily', 'ECMO weaning completed', 'Daily review')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. CULTURE CATALOG
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS culture_catalog (
  id text primary key,
  culture_name text not null,
  specimen_source text,
  associated_devices text,
  typical_turnaround text,
  common_organisms text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO culture_catalog (id, culture_name, specimen_source, associated_devices, typical_turnaround, common_organisms, notes) VALUES
  ('CUL01', 'Blood culture', 'Peripheral / central blood', 'CVC, PICC, dialysis catheter, ECMO cannula', '24-72h (final at 5 days)', 'Klebsiella, E. coli, Staph aureus, Candida', 'Two sets recommended, at least one peripheral'),
  ('CUL02', 'Urine culture', 'Midstream / catheter urine', 'Foley, suprapubic catheter', '24-48h', 'E. coli, Klebsiella, Enterococcus', 'Quantitative colony count required'),
  ('CUL03', 'Endotracheal aspirate (ETA) culture', 'Tracheal secretions', 'ETT', '24-48h', 'Pseudomonas, Acinetobacter, Klebsiella', 'Semi-quantitative reporting'),
  ('CUL04', 'Bronchoalveolar lavage (BAL) culture', 'Lower respiratory tract', 'ETT / bronchoscope', '24-72h', 'Pseudomonas, Staph aureus', 'Quantitative threshold used to diagnose VAP'),
  ('CUL05', 'Tracheal aspirate culture', 'Tracheostomy secretions', 'Tracheostomy', '24-48h', 'Pseudomonas, Klebsiella', 'Semi-quantitative reporting'),
  ('CUL06', 'Catheter tip culture', 'Removed catheter tip', 'CVC, PICC, tunneled catheter, dialysis catheter', '48-72h', 'CoNS, Candida', 'Semi-quantitative roll-plate method'),
  ('CUL07', 'Pleural fluid culture', 'Pleural fluid', 'Chest tube', '48-72h', 'S. pneumoniae, anaerobes', 'Send with cell count, pH, LDH'),
  ('CUL08', 'Peritoneal fluid culture', 'Peritoneal fluid / dialysate effluent', 'Peritoneal dialysis catheter, surgical drain', '48-72h', 'E. coli, Enterococcus, mixed flora', 'Send with cell count'),
  ('CUL09', 'Wound / tissue culture', 'Surgical or soft tissue site', 'Surgical drain', '24-48h', 'Staph aureus, mixed flora', 'Tissue sample preferred over surface swab'),
  ('CUL10', 'CSF culture', 'Cerebrospinal fluid', 'Lumbar puncture, EVD', '48-72h (urgent)', 'N. meningitidis, S. pneumoniae', 'Urgent gram stain + cell count'),
  ('CUL11', 'Stool culture / C. difficile assay', 'Stool', 'N/A', '24-48h', 'C. difficile, Salmonella', 'Avoid repeat testing within 7 days'),
  ('CUL12', 'Bone / joint fluid culture', 'Bone biopsy / synovial fluid', 'N/A', '5-10 days (extended for fastidious organisms)', 'Staph aureus', 'Often requires extended incubation'),
  ('CUL13', 'Fungal blood culture (isolator)', 'Blood', 'N/A', '5-14 days', 'Candida, Aspergillus', 'Specialized fungal isolator tube'),
  ('CUL14', 'Nasal MRSA screening swab', 'Nasal swab', 'N/A', '24-48h', 'MRSA', 'Used for de-escalation/screening, not active infection diagnosis'),
  ('CUL15', 'Sputum culture', 'Expectorated sputum', 'N/A', '24-48h', 'S. pneumoniae, H. influenzae', 'Lower specificity than ETA/BAL'),
  ('CUL16', 'Skin / soft tissue aspirate culture', 'Abscess / cellulitis aspirate', 'N/A', '24-48h', 'Staph aureus, Streptococcus', 'Needle aspirate preferred over surface swab')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. ORGANISM CATALOG
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS organism_catalog (
  id text primary key,
  organism_name text not null,
  category text,
  typical_source_site text,
  notable_resistance_concern text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO organism_catalog (id, organism_name, category, typical_source_site, notable_resistance_concern, notes) VALUES
  ('ORG01', 'Staphylococcus aureus (MSSA)', 'Gram-positive cocci', 'Skin, blood, bone', 'Minimal', 'Methicillin-susceptible'),
  ('ORG02', 'Staphylococcus aureus (MRSA)', 'Gram-positive cocci', 'Skin, blood, bone, lung', 'Methicillin resistance', 'Requires vancomycin / linezolid / daptomycin'),
  ('ORG03', 'Coagulase-negative staphylococcus (CoNS)', 'Gram-positive cocci', 'Catheter-associated', 'Frequent methicillin resistance', 'Common contaminant - needs clinical correlation'),
  ('ORG04', 'Enterococcus faecalis', 'Gram-positive cocci', 'Urine, blood, intra-abdominal', 'Variable ampicillin resistance', 'Usually ampicillin-susceptible'),
  ('ORG05', 'Enterococcus faecium', 'Gram-positive cocci', 'Urine, blood', 'Vancomycin resistance (VRE)', 'Often requires linezolid / daptomycin'),
  ('ORG06', 'Streptococcus pneumoniae', 'Gram-positive cocci', 'Lung, CSF, blood', 'Variable penicillin resistance', 'Common CAP / meningitis pathogen'),
  ('ORG07', 'Group A Streptococcus (S. pyogenes)', 'Gram-positive cocci', 'Skin/soft tissue', 'Minimal', 'Toxin-mediated disease (necrotizing fasciitis)'),
  ('ORG08', 'Escherichia coli', 'Gram-negative rod', 'Urine, blood, intra-abdominal', 'ESBL production', 'Common UTI / bacteremia pathogen'),
  ('ORG09', 'Klebsiella pneumoniae', 'Gram-negative rod', 'Urine, blood, lung', 'ESBL, KPC-CRE', 'Increasing carbapenem resistance globally'),
  ('ORG10', 'Enterobacter spp.', 'Gram-negative rod', 'Blood, urine', 'AmpC beta-lactamase induction', 'Risk of resistance emergence on cephalosporins during therapy'),
  ('ORG11', 'Proteus mirabilis', 'Gram-negative rod', 'Urine', 'Variable ESBL', 'Urease-producing, associated with struvite stones'),
  ('ORG12', 'Serratia marcescens', 'Gram-negative rod', 'Blood, respiratory', 'AmpC beta-lactamase', 'Healthcare-associated pathogen'),
  ('ORG13', 'Pseudomonas aeruginosa', 'Gram-negative rod', 'Lung, urine, blood', 'Multidrug resistance common', 'Major VAP/HAP pathogen'),
  ('ORG14', 'Acinetobacter baumannii', 'Gram-negative rod', 'Lung, blood, wounds', 'Extensive/pan-drug resistance common', 'Major MDR concern in ICU settings'),
  ('ORG15', 'Stenotrophomonas maltophilia', 'Gram-negative rod', 'Lung, blood', 'Intrinsic carbapenem resistance', 'Requires TMP-SMX or alternative agent'),
  ('ORG16', 'Bacteroides fragilis', 'Anaerobe', 'Intra-abdominal', 'Beta-lactamase production', 'Requires metronidazole / carbapenem / pip-tazo'),
  ('ORG17', 'Clostridium perfringens', 'Anaerobe', 'Soft tissue, gas gangrene', 'Minimal', 'Toxin-mediated, surgical emergency'),
  ('ORG18', 'Clostridioides difficile', 'Anaerobe (spore-forming)', 'GI tract / stool', 'N/A', 'Toxin-mediated colitis'),
  ('ORG19', 'Neisseria meningitidis', 'Gram-negative diplococcus', 'CSF, blood', 'Minimal', 'Requires droplet precautions'),
  ('ORG20', 'Listeria monocytogenes', 'Gram-positive rod', 'CSF, blood', 'Intrinsic cephalosporin resistance', 'Requires ampicillin; risk in elderly/immunosuppressed/pregnant patients'),
  ('ORG21', 'Candida albicans', 'Yeast / fungal', 'Blood, urine', 'Fluconazole-susceptible usually', 'Most common Candida bloodstream isolate'),
  ('ORG22', 'Candida glabrata', 'Yeast / fungal', 'Blood', 'Reduced/variable fluconazole susceptibility', 'Often requires echinocandin'),
  ('ORG23', 'Candida auris', 'Yeast / fungal', 'Blood, surfaces', 'Multidrug resistance, infection control concern', 'Requires isolation + echinocandin first-line'),
  ('ORG24', 'Aspergillus fumigatus', 'Mold / fungal', 'Lung', 'Azole resistance emerging', 'Requires voriconazole / isavuconazole')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. DX → ANTIBIOTIC MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dx_antibiotic_mapping (
  id uuid primary key default gen_random_uuid(),
  diagnosis_id text not null,
  diagnosis_name text,
  first_line_empiric text,
  escalation_option text,
  typical_duration_range text,
  notes text,
  created_at timestamptz not null default now()
);

INSERT INTO dx_antibiotic_mapping (diagnosis_id, diagnosis_name, first_line_empiric, escalation_option, typical_duration_range, notes) VALUES
  ('D01', 'Septic shock', 'Piperacillin-Tazobactam (AB04) + Vancomycin (AB14)', 'Meropenem (AB01) +/- Colistin (AB17)', '7-10 days, source-dependent', 'Re-assess at 48-72h with culture data'),
  ('D02', 'Severe sepsis (without shock)', 'Piperacillin-Tazobactam (AB04)', 'Meropenem (AB01)', '7-10 days', 'Narrow once source/organism identified'),
  ('D03', 'Ventilator-associated pneumonia (VAP)', 'Meropenem (AB01) or Cefepime (AB08)', '+ Colistin (AB17) / Amikacin (AB19) if MDR risk', '7 days (shorter course supported by evidence)', 'Add MRSA cover (Vancomycin AB14 / Linezolid AB15) if risk factors present'),
  ('D04', 'Hospital-acquired pneumonia (HAP)', 'Piperacillin-Tazobactam (AB04) or Cefepime (AB08)', 'Meropenem (AB01) + MRSA cover', '7 days', 'Risk-stratify for MDR organisms'),
  ('D05', 'Community-acquired pneumonia (CAP)', 'Ceftriaxone (AB06) + Azithromycin', 'Levofloxacin (AB22) monotherapy', '5-7 days', 'Atypical cover required even in non-severe cases'),
  ('D06', 'Central line-associated bloodstream infection (CLABSI)', 'Vancomycin (AB14)', '+ gram-negative cover (AB04/AB08) pending cultures', '7-14 days (longer for S. aureus/Candida)', 'Line removal strongly recommended'),
  ('D07', 'Catheter-associated UTI (CAUTI)', 'Ceftriaxone (AB06)', 'Ciprofloxacin (AB21)', '7 days (10-14 days if delayed response)', 'Catheter removal/exchange recommended'),
  ('D08', 'Intra-abdominal sepsis / peritonitis', 'Piperacillin-Tazobactam (AB04)', 'Meropenem (AB01) + Metronidazole (AB23) if not already broad', '4-7 days after adequate source control', 'Source control is as critical as antibiotic choice'),
  ('D09', 'Necrotizing fasciitis', 'Piperacillin-Tazobactam (AB04) + Clindamycin (AB24)', 'Meropenem (AB01) + Vancomycin (AB14) + Clindamycin (AB24)', 'Until surgical debridement complete + clinical resolution', 'Emergent surgical debridement is primary therapy'),
  ('D10', 'Cellulitis / SSTI', 'Cefazolin or Ampicillin-Sulbactam (AB05)', 'Vancomycin (AB14) if MRSA risk', '5-7 days (uncomplicated)', 'Outpatient-appropriate in many cases'),
  ('D11', 'Bacterial meningitis', 'Ceftriaxone (AB06) + Vancomycin (AB14)', '+ Ampicillin if Listeria risk (extremes of age/immunosuppression)', '7-14 days, organism-dependent', 'Dexamethasone often co-administered'),
  ('D12', 'Ventriculitis / EVD-associated infection', 'Vancomycin (AB14) + Cefepime (AB08) or Meropenem (AB01)', 'Intrathecal/intraventricular therapy in refractory cases', '10-21 days', 'CNS penetration is the key selection driver'),
  ('D13', 'Infective endocarditis', 'Vancomycin (AB14) + Gentamicin (AB20) (pending organism)', 'Targeted per organism (Ceftriaxone for Strep, Ampicillin for Enterococcus)', '4-6 weeks', 'Valve involvement and organism dictate duration'),
  ('D14', 'Febrile neutropenia', 'Cefepime (AB08)', 'Meropenem (AB01) + Vancomycin (AB14) if unstable/line infection suspected', 'Until neutrophil recovery + afebrile 48h', 'Antifungal cover added if fever persists >4-7 days'),
  ('D15', 'Clostridioides difficile colitis', 'Oral Vancomycin', 'Fidaxomicin or IV Metronidazole (AB23) as adjunct in fulminant disease', '10 days', 'IV vancomycin has no luminal effect'),
  ('D16', 'Empyema / pleural infection', 'Piperacillin-Tazobactam (AB04)', 'Meropenem (AB01) + drainage', '2-4 weeks depending on drainage adequacy', 'Drainage is essential adjunct'),
  ('D17', 'Candidemia / invasive candidiasis', 'Micafungin (AB30)', 'Fluconazole (AB28) step-down if susceptible and stable', '2 weeks from first negative blood culture', 'Ophthalmologic exam recommended'),
  ('D18', 'Osteomyelitis', 'Vancomycin (AB14) or targeted per culture', 'Daptomycin (AB16) if vancomycin-intolerant', '4-6 weeks IV', 'Often requires surgical debridement'),
  ('D19', 'Complicated UTI / urosepsis', 'Piperacillin-Tazobactam (AB04) or Ceftriaxone (AB06)', 'Meropenem (AB01) if ESBL risk', '7-14 days', 'Source control (stent/nephrostomy) if obstructed'),
  ('D20', 'Surgical site infection', 'Cefazolin or Vancomycin (AB14) (site-dependent)', 'Piperacillin-Tazobactam (AB04) for deep/abdominal SSI', '5-7 days post source control', 'Wound exploration often required'),
  ('D21', 'Burn wound infection', 'Piperacillin-Tazobactam (AB04)', 'Meropenem (AB01) + Vancomycin (AB14) for MDR/MRSA risk', '7-14 days, individualized', 'Topical antimicrobials used adjunctively'),
  ('D22', 'Aspiration pneumonia', 'Ampicillin-Sulbactam (AB05)', 'Piperacillin-Tazobactam (AB04)', '5-7 days', 'Anaerobic cover key differentiator vs CAP'),
  ('D23', 'ECMO-associated bloodstream infection', 'Vancomycin (AB14) + Cefepime (AB08)', 'Meropenem (AB01) +/- antifungal if Candida risk', '2 weeks from clearance', 'Cannula site and circuit inspected concurrently')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. DX → INVESTIGATION MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dx_investigation_mapping (
  id uuid primary key default gen_random_uuid(),
  diagnosis_id text not null,
  diagnosis_name text,
  recommended_investigations text,
  notes text,
  created_at timestamptz not null default now()
);

INSERT INTO dx_investigation_mapping (diagnosis_id, diagnosis_name, recommended_investigations, notes) VALUES
  ('D01', 'Septic shock', 'CBC, CRP, Procalcitonin, Lactate, ABG, RFT, LFT, Coagulation profile', 'Lactate clearance tracked at 6h'),
  ('D02', 'Severe sepsis (without shock)', 'CBC, CRP, Procalcitonin, Lactate, RFT', 'Repeat lactate to confirm trend'),
  ('D03', 'Ventilator-associated pneumonia (VAP)', 'Chest X-ray, ABG, CBC, Procalcitonin', 'Daily CXR while ventilated'),
  ('D04', 'Hospital-acquired pneumonia (HAP)', 'Chest X-ray, CBC, CRP, ABG', 'Consider CT chest if not improving'),
  ('D05', 'Community-acquired pneumonia (CAP)', 'Chest X-ray, CBC, CRP, Procalcitonin', 'Severity scoring (CURB-65/PSI) guides setting'),
  ('D06', 'Central line-associated bloodstream infection (CLABSI)', 'CBC, CRP, RFT', 'Two blood culture sets mandatory before antibiotics'),
  ('D07', 'Catheter-associated UTI (CAUTI)', 'Urinalysis, CBC', 'Symptoms required to distinguish from asymptomatic bacteriuria'),
  ('D08', 'Intra-abdominal sepsis / peritonitis', 'CT abdomen/pelvis, CBC, CRP, Lactate', 'Imaging guides source control planning'),
  ('D09', 'Necrotizing fasciitis', 'CBC, CRP, CPK, Lactate', 'LRINEC score may support diagnosis'),
  ('D10', 'Cellulitis / SSTI', 'CBC, CRP (if systemic signs)', 'Imaging rarely needed unless abscess suspected'),
  ('D11', 'Bacterial meningitis', 'CSF analysis (via culture order), CT head if indicated pre-LP', 'LP should not delay first antibiotic dose if unstable'),
  ('D12', 'Ventriculitis / EVD-associated infection', 'CSF cell count/protein/glucose, CBC', 'CSF parameters trended daily'),
  ('D13', 'Infective endocarditis', 'Echocardiogram (TTE/TEE), CBC, CRP, Coagulation profile', 'Repeat TEE if high suspicion despite negative TTE'),
  ('D14', 'Febrile neutropenia', 'CBC with differential, CRP, RFT, LFT', 'ANC trend determines de-escalation timing'),
  ('D15', 'Clostridioides difficile colitis', 'C. difficile toxin PCR/EIA, CBC', 'Avoid repeat testing within 7 days of prior negative'),
  ('D16', 'Empyema / pleural infection', 'CT chest, CBC, CRP', 'Pleural fluid pH/LDH guides drainage decision'),
  ('D17', 'Candidemia / invasive candidiasis', 'Beta-D-glucan, CBC, LFT', 'Ophthalmologic exam, repeat blood cultures until negative'),
  ('D18', 'Osteomyelitis', 'MRI spine (or affected site), CBC, CRP, ESR', 'CRP trend used to monitor response'),
  ('D19', 'Complicated UTI / urosepsis', 'Urinalysis, CBC, CRP, RFT', 'Imaging if obstruction suspected'),
  ('D20', 'Surgical site infection', 'CBC, CRP, wound imaging if deep infection suspected', 'CT if intra-abdominal collection suspected'),
  ('D21', 'Burn wound infection', 'CBC, CRP, RFT (fluid shifts)', 'Frequent reassessment given fluid resuscitation needs'),
  ('D22', 'Aspiration pneumonia', 'Chest X-ray, CBC, ABG', 'Assess aspiration risk factors (swallowing eval)'),
  ('D23', 'ECMO-associated bloodstream infection', 'CBC, CRP, RFT', 'Circuit and cannula site inspected with each review')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. DX → DEVICE MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dx_device_mapping (
  id uuid primary key default gen_random_uuid(),
  diagnosis_id text not null,
  diagnosis_name text,
  associated_devices text,
  relevance text,
  created_at timestamptz not null default now()
);

INSERT INTO dx_device_mapping (diagnosis_id, diagnosis_name, associated_devices, relevance) VALUES
  ('D03', 'Ventilator-associated pneumonia (VAP)', 'Endotracheal tube / ventilator (DEV04)', 'Causative device'),
  ('D06', 'Central line-associated bloodstream infection (CLABSI)', 'Central venous catheter (DEV01), PICC (DEV02), tunneled catheter (DEV12)', 'Causative device'),
  ('D07', 'Catheter-associated UTI (CAUTI)', 'Foley catheter (DEV06), suprapubic catheter (DEV07)', 'Causative device'),
  ('D12', 'Ventriculitis / EVD-associated infection', 'External ventricular drain (DEV10)', 'Causative device'),
  ('D16', 'Empyema / pleural infection', 'Chest tube (DEV08)', 'Therapeutic + diagnostic device'),
  ('D20', 'Surgical site infection', 'Surgical drain (DEV13)', 'Diagnostic / source-control device'),
  ('D23', 'ECMO-associated bloodstream infection', 'ECMO cannula (DEV14)', 'Causative device'),
  ('D08', 'Intra-abdominal sepsis / peritonitis', 'Surgical drain (DEV13), peritoneal dialysis catheter (DEV11) if applicable', 'Source-control / risk device'),
  ('D19', 'Complicated UTI / urosepsis', 'Foley catheter (DEV06) if present', 'Risk-modifying device')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. DX → CULTURE MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dx_culture_mapping (
  id uuid primary key default gen_random_uuid(),
  diagnosis_id text not null,
  diagnosis_name text,
  required_cultures text,
  notes text,
  created_at timestamptz not null default now()
);

INSERT INTO dx_culture_mapping (diagnosis_id, diagnosis_name, required_cultures, notes) VALUES
  ('D01', 'Septic shock', 'Blood culture x2 (CUL01), Urine culture (CUL02)', 'Obtain before first antibiotic dose if feasible without delay'),
  ('D03', 'Ventilator-associated pneumonia (VAP)', 'ETA culture (CUL03), BAL culture (CUL04)', 'Quantitative thresholds distinguish infection from colonization'),
  ('D06', 'Central line-associated bloodstream infection (CLABSI)', 'Blood culture (CUL01), catheter tip culture (CUL06)', 'Paired peripheral + central draws aid diagnosis'),
  ('D07', 'Catheter-associated UTI (CAUTI)', 'Urine culture (CUL02)', 'Obtain after catheter exchange if catheter in place >2 weeks'),
  ('D08', 'Intra-abdominal sepsis / peritonitis', 'Peritoneal fluid culture (CUL08), Blood culture (CUL01)', 'Intra-operative cultures preferred when available'),
  ('D09', 'Necrotizing fasciitis', 'Wound/tissue culture (CUL09), Blood culture (CUL01)', 'Tissue obtained at debridement'),
  ('D11', 'Bacterial meningitis', 'CSF culture (CUL10), Blood culture (CUL01)', 'CSF gram stain reviewed urgently'),
  ('D12', 'Ventriculitis / EVD-associated infection', 'CSF culture (CUL10)', 'Send with each suspected episode, not on fixed schedule'),
  ('D13', 'Infective endocarditis', 'Blood culture (CUL01) x3 sets from different sites', 'Spaced over time to demonstrate continuous bacteremia'),
  ('D15', 'Clostridioides difficile colitis', 'Stool culture / toxin assay (CUL11)', 'Toxin assay preferred over culture alone'),
  ('D16', 'Empyema / pleural infection', 'Pleural fluid culture (CUL07)', 'Send alongside pH, LDH, glucose'),
  ('D17', 'Candidemia / invasive candidiasis', 'Blood culture (CUL01), fungal blood culture (CUL13)', 'Repeat until two consecutive negative results'),
  ('D18', 'Osteomyelitis', 'Bone/joint fluid culture (CUL12)', 'Obtain prior to starting empiric therapy where feasible'),
  ('D19', 'Complicated UTI / urosepsis', 'Urine culture (CUL02), Blood culture (CUL01)', 'Both obtained when systemic signs present'),
  ('D20', 'Surgical site infection', 'Wound/tissue culture (CUL09)', 'Deep tissue preferred over superficial swab'),
  ('D23', 'ECMO-associated bloodstream infection', 'Blood culture (CUL01)', 'Drawn from cannula and peripheral site')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 11. ANTIBIOTIC → CULTURE MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS abx_culture_mapping (
  id uuid primary key default gen_random_uuid(),
  antibiotic_id text not null,
  antibiotic_name text,
  triggering_culture text,
  organism_suggestive_of text,
  recommended_action text,
  created_at timestamptz not null default now()
);

INSERT INTO abx_culture_mapping (antibiotic_id, antibiotic_name, triggering_culture, organism_suggestive_of, recommended_action) VALUES
  ('AB01', 'Meropenem', 'Blood culture (CUL01)', 'ESBL-producing Klebsiella/E. coli', 'Continue / confirmed appropriate choice'),
  ('AB14', 'Vancomycin', 'Blood culture / catheter tip culture', 'MRSA, CoNS', 'Continue; consider line removal if CLABSI'),
  ('AB17', 'Colistin', 'Blood / ETA culture', 'Carbapenem-resistant Enterobacterales, MDR Acinetobacter', 'Initiate per stewardship/ID approval'),
  ('AB30', 'Micafungin', 'Blood culture (CUL01) / fungal blood culture (CUL13)', 'Candida spp.', 'Continue; step-down to fluconazole if susceptible'),
  ('AB23', 'Metronidazole', 'Stool culture / toxin assay (CUL11)', 'C. difficile', 'Initiate + enteric/contact isolation'),
  ('AB06', 'Ceftriaxone', 'Urine culture (CUL02)', 'E. coli, Klebsiella (non-ESBL)', 'Continue if susceptible, narrow from broader agent if started'),
  ('AB04', 'Piperacillin-Tazobactam', 'Peritoneal fluid culture (CUL08)', 'Polymicrobial gram-negative + anaerobes', 'Continue; add metronidazole if anaerobic cover inadequate'),
  ('AB16', 'Daptomycin', 'Blood culture (CUL01)', 'VRE, MRSA bacteremia/endocarditis', 'Continue if not a pneumonia source'),
  ('AB24', 'Clindamycin', 'Wound/tissue culture (CUL09)', 'Group A Streptococcus (toxin-producing)', 'Continue as adjunct for toxin suppression'),
  ('AB29', 'Voriconazole', 'BAL culture (CUL04) with galactomannan (INV19)', 'Aspergillus spp.', 'Initiate; monitor drug levels')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 12. ANTIBIOTIC → INVESTIGATION MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS abx_investigation_mapping (
  id uuid primary key default gen_random_uuid(),
  antibiotic_id text not null,
  antibiotic_name text,
  required_investigation text,
  purpose text,
  frequency text,
  created_at timestamptz not null default now()
);

INSERT INTO abx_investigation_mapping (antibiotic_id, antibiotic_name, required_investigation, purpose, frequency) VALUES
  ('AB14', 'Vancomycin', 'Trough/AUC level (INV08) + Creatinine (INV06)', 'Nephrotoxicity, dosing accuracy', 'Per institutional pharmacokinetic protocol'),
  ('AB15', 'Linezolid', 'CBC/platelets (INV01)', 'Myelosuppression', 'Weekly, more frequently if course >2 weeks'),
  ('AB17', 'Colistin', 'Creatinine, electrolytes (INV06)', 'Nephrotoxicity', 'Daily'),
  ('AB18', 'Polymyxin B', 'Creatinine, electrolytes (INV06)', 'Nephrotoxicity', 'Daily'),
  ('AB19', 'Amikacin', 'Peak/trough levels (INV09), RFT (INV06), audiometry (INV17)', 'Nephro/ototoxicity', 'Per protocol; audiometry if course >7-10 days'),
  ('AB20', 'Gentamicin', 'Peak/trough levels (INV09), RFT (INV06)', 'Nephro/ototoxicity', 'Per protocol'),
  ('AB01', 'Meropenem', 'Creatinine / CrCl (INV06)', 'Dose adjustment in renal impairment', 'Daily in acute kidney injury'),
  ('AB25', 'Tigecycline', 'LFT (INV07)', 'Hepatotoxicity', 'Weekly'),
  ('AB23', 'Metronidazole', 'LFT (INV07)', 'Hepatotoxicity with prolonged use', 'Weekly if course >10 days'),
  ('AB16', 'Daptomycin', 'CPK (INV16)', 'Myotoxicity', 'Weekly'),
  ('AB28', 'Fluconazole', 'LFT (INV07), ECG/QTc', 'Hepatotoxicity, QT prolongation', 'Baseline + weekly'),
  ('AB29', 'Voriconazole', 'LFT (INV07), drug level', 'Hepatotoxicity, sub/supratherapeutic dosing', 'Baseline + weekly'),
  ('AB21', 'Ciprofloxacin', 'ECG/QTc', 'QT prolongation, tendon risk counseling', 'Baseline if risk factors present'),
  ('AB31', 'Amphotericin B (liposomal)', 'Creatinine, K/Mg (INV06)', 'Nephrotoxicity, electrolyte wasting', 'Daily')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 13. DEVICE → ANTIBIOTIC MAPPING (device-driven empiric choice)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS abx_device_mapping (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  device_name text,
  suspected_source text,
  empiric_antibiotic text,
  rationale text,
  created_at timestamptz not null default now()
);

INSERT INTO abx_device_mapping (device_id, device_name, suspected_source, empiric_antibiotic, rationale) VALUES
  ('DEV01', 'Central venous catheter (CVC)', 'CLABSI', 'Vancomycin (AB14) +/- gram-negative cover (AB04/AB08)', 'Cover Staph/CoNS first, broaden if unstable'),
  ('DEV04', 'Endotracheal tube (ETT) / ventilator', 'VAP', 'Meropenem (AB01) or Piperacillin-Tazobactam (AB04)', 'Cover Pseudomonas, ESBL organisms'),
  ('DEV06', 'Foley catheter', 'CAUTI', 'Ceftriaxone (AB06) or Ciprofloxacin (AB21)', 'Cover typical uropathogens'),
  ('DEV08', 'Chest tube', 'Empyema', 'Piperacillin-Tazobactam (AB04) + Metronidazole (AB23) if not already broad', 'Cover anaerobes'),
  ('DEV10', 'External ventricular drain (EVD)', 'Ventriculitis', 'Vancomycin (AB14) + Cefepime (AB08) or Meropenem (AB01)', 'CNS-penetrant cover for CoNS and gram-negatives'),
  ('DEV14', 'ECMO cannula', 'Cannula-associated bloodstream infection', 'Vancomycin (AB14) + Cefepime (AB08)', 'Cover CoNS and broad gram-negative organisms'),
  ('DEV09', 'Hemodialysis catheter', 'Catheter-related bloodstream infection', 'Vancomycin (AB14)', 'Empiric MRSA/CoNS cover pending cultures'),
  ('DEV11', 'Peritoneal dialysis catheter', 'Peritonitis', 'Vancomycin (AB14) (intraperitoneal) + gram-negative cover', 'Covers gram-positive and gram-negative peritoneal pathogens')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 14. ORGANISM → SUSCEPTIBILITY MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS organism_susceptibility (
  id uuid primary key default gen_random_uuid(),
  organism_id text not null,
  organism_name text,
  typically_susceptible_to text,
  typically_resistant_avoid text,
  notes text,
  created_at timestamptz not null default now()
);

INSERT INTO organism_susceptibility (organism_id, organism_name, typically_susceptible_to, typically_resistant_avoid, notes) VALUES
  ('ORG01', 'Staphylococcus aureus (MSSA)', 'Cefazolin, Nafcillin, Ampicillin-Sulbactam (AB05)', 'N/A', 'Narrow to anti-staphylococcal beta-lactam once confirmed MSSA'),
  ('ORG02', 'Staphylococcus aureus (MRSA)', 'Vancomycin (AB14), Linezolid (AB15), Daptomycin (AB16), Ceftaroline (AB09)', 'All standard beta-lactams except ceftaroline', 'Confirm MIC for vancomycin dosing decisions'),
  ('ORG03', 'Coagulase-negative staphylococcus (CoNS)', 'Vancomycin (AB14)', 'Often methicillin-resistant by default', 'Confirm clinical significance before treating'),
  ('ORG04', 'Enterococcus faecalis', 'Ampicillin, Vancomycin (AB14)', 'N/A (usually)', 'Check ampicillin susceptibility before narrowing'),
  ('ORG05', 'Enterococcus faecium', 'Linezolid (AB15), Daptomycin (AB16)', 'Vancomycin (if VRE), Ampicillin (often)', 'Assume VRE risk in healthcare-associated infection until proven otherwise'),
  ('ORG06', 'Streptococcus pneumoniae', 'Ceftriaxone (AB06), Penicillin (if susceptible)', 'Variable to penicillin', 'Check local resistance rates'),
  ('ORG07', 'Group A Streptococcus (S. pyogenes)', 'Penicillin, Ampicillin-Sulbactam (AB05)', 'N/A', 'Add clindamycin (AB24) for toxin suppression in severe disease'),
  ('ORG08', 'Escherichia coli', 'Ceftriaxone (AB06), Piperacillin-Tazobactam (AB04)', 'Ampicillin (often), consider ESBL risk', 'ESBL strains require carbapenem (AB01/AB03)'),
  ('ORG09', 'Klebsiella pneumoniae', 'Ceftriaxone (AB06) if non-ESBL, Meropenem (AB01) if ESBL', 'Ampicillin always; consider carbapenem-resistance (KPC)', 'Check carbapenemase status before using AB10/AB12'),
  ('ORG10', 'Enterobacter spp.', 'Cefepime (AB08), Meropenem (AB01)', 'Ceftriaxone/Ceftazidime (AmpC induction risk)', 'Avoid 3rd-gen cephalosporins as definitive therapy'),
  ('ORG11', 'Proteus mirabilis', 'Ceftriaxone (AB06), Ampicillin (if susceptible)', 'Tetracyclines, Nitrofurantoin (intrinsic resistance)', 'Generally more susceptible than other Enterobacterales'),
  ('ORG12', 'Serratia marcescens', 'Cefepime (AB08), Meropenem (AB01)', 'Ceftriaxone/Ceftazidime (AmpC induction risk)', 'Treat similarly to Enterobacter'),
  ('ORG13', 'Pseudomonas aeruginosa', 'Cefepime (AB08), Piperacillin-Tazobactam (AB04), Meropenem (AB01)', 'Ertapenem (AB03, no activity), Ceftriaxone (no activity)', 'Confirm susceptibility given high resistance rates'),
  ('ORG14', 'Acinetobacter baumannii', 'Meropenem (AB01) if susceptible, Colistin (AB17) if MDR', 'Many beta-lactams in MDR strains', 'Often requires combination therapy'),
  ('ORG15', 'Stenotrophomonas maltophilia', 'Trimethoprim-Sulfamethoxazole (AB26)', 'Carbapenems (intrinsic resistance)', 'Carbapenem therapy can select for this organism'),
  ('ORG16', 'Bacteroides fragilis', 'Metronidazole (AB23), Piperacillin-Tazobactam (AB04), Meropenem (AB01)', 'Aminoglycosides, fluoroquinolones (variable)', 'Always include anaerobic cover for intra-abdominal sources'),
  ('ORG17', 'Clostridium perfringens', 'Penicillin, Clindamycin (AB24, adjunct)', 'N/A', 'Surgical debridement is primary therapy'),
  ('ORG18', 'Clostridioides difficile', 'Oral Vancomycin, Fidaxomicin', 'Systemic IV agents (no luminal effect)', 'Discontinue inciting antibiotic if possible'),
  ('ORG19', 'Neisseria meningitidis', 'Ceftriaxone (AB06), Penicillin (if susceptible)', 'N/A', 'Droplet precautions until 24h of effective therapy'),
  ('ORG20', 'Listeria monocytogenes', 'Ampicillin, Trimethoprim-Sulfamethoxazole (AB26, alternative)', 'Cephalosporins (intrinsic resistance)', 'Add ampicillin empirically in at-risk meningitis patients'),
  ('ORG21', 'Candida albicans', 'Fluconazole (AB28), Micafungin (AB30)', 'N/A (usually)', 'Step down to fluconazole once susceptibility confirmed and patient stable'),
  ('ORG22', 'Candida glabrata', 'Micafungin (AB30)', 'Fluconazole (reduced/variable susceptibility)', 'Avoid fluconazole as definitive therapy without susceptibility data'),
  ('ORG23', 'Candida auris', 'Micafungin (AB30)', 'Fluconazole (frequently resistant)', 'Requires contact precautions and infection control notification'),
  ('ORG24', 'Aspergillus fumigatus', 'Voriconazole (AB29), Isavuconazole', 'Echinocandins (not first-line monotherapy)', 'Monitor for emerging azole resistance')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 15. ALLERGY CROSS-REACTIVITY
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS allergy_cross_reactivity (
  id text primary key,
  allergy_type text not null,
  cross_reactive_classes text,
  risk_level text,
  safe_alternatives text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO allergy_cross_reactivity (id, allergy_type, cross_reactive_classes, risk_level, safe_alternatives, notes) VALUES
  ('ALG01', 'Penicillin allergy (mild/non-severe, e.g. rash)', 'Cephalosporins (low, ~1-2%), Carbapenems (very low)', 'Low', 'Cephalosporins or carbapenems generally tolerated with monitoring', 'Avoid only the specific implicated penicillin agent'),
  ('ALG02', 'Penicillin allergy (severe/anaphylaxis)', 'All beta-lactams (cephalosporins, carbapenems) until allergy testing', 'High', 'Aztreonam (AB13), non-beta-lactam agents', 'Aztreonam shares a side chain with ceftazidime - confirm if that was the index reaction'),
  ('ALG03', 'Cephalosporin allergy', 'Other cephalosporins (same generation/side chain), low cross-reactivity with penicillins', 'Moderate', 'Aztreonam (AB13) if not ceftazidime-related; alternative class per organism', 'Cross-reactivity is side-chain dependent, not class-wide'),
  ('ALG04', 'Carbapenem allergy', 'Other carbapenems', 'Low-Moderate', 'Non-carbapenem beta-lactam if penicillin/cephalosporin tolerated', 'Cross-reactivity with penicillins is low'),
  ('ALG05', 'Sulfa allergy', 'Trimethoprim-Sulfamethoxazole (AB26), other sulfonamide-containing drugs', 'Moderate-High', 'Non-sulfa alternative per organism', 'Distinguish from non-antibiotic sulfonamide reactions where relevant'),
  ('ALG06', 'Vancomycin infusion reaction (red man syndrome)', 'Not a true allergy - histamine-mediated infusion reaction', 'Low (manageable)', 'Slow infusion rate, antihistamine premedication', 'Does not preclude future vancomycin use'),
  ('ALG07', 'Fluoroquinolone allergy', 'Other fluoroquinolones', 'Moderate', 'Non-fluoroquinolone agent per organism', 'Tendon/QTc risk is separate from allergic cross-reactivity'),
  ('ALG08', 'Macrolide allergy', 'Other macrolides (azithromycin, clarithromycin, erythromycin)', 'Moderate', 'Doxycycline (AB27) or fluoroquinolone for atypical cover', 'Confirm true allergy vs GI intolerance')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 16. DEVICE → INVESTIGATION MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS device_investigation_mapping (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  device_name text,
  required_investigation text,
  purpose text,
  frequency text,
  created_at timestamptz not null default now()
);

INSERT INTO device_investigation_mapping (device_id, device_name, required_investigation, purpose, frequency) VALUES
  ('DEV04', 'Endotracheal tube (ETT)', 'Chest X-ray (INV10), ABG (INV05)', 'Position confirmation, oxygenation status', 'Daily'),
  ('DEV01', 'Central venous catheter (CVC)', 'Renal function tests (INV06) - indirect', 'Correlate with nephrotoxic drug levels if infused through line', 'As needed'),
  ('DEV06', 'Foley catheter', 'Urinalysis (INV15)', 'CAUTI screening', 'With symptoms'),
  ('DEV08', 'Chest tube', 'Chest X-ray (INV10)', 'Drainage adequacy, lung re-expansion', 'Daily'),
  ('DEV10', 'External ventricular drain (EVD)', 'CSF cell count/protein/glucose (via culture order)', 'Ventriculitis surveillance', 'Daily or with new symptoms'),
  ('DEV05', 'Tracheostomy', 'Chest X-ray (INV10)', 'Position, secretion burden', 'As clinically indicated'),
  ('DEV14', 'ECMO cannula', 'ABG (INV05), RFT (INV06)', 'Circuit performance, organ perfusion', 'Per ECMO protocol'),
  ('DEV09', 'Hemodialysis catheter', 'Renal function tests (INV06)', 'Dialysis adequacy correlation', 'Each session'),
  ('DEV13', 'Surgical drain', 'CRP (INV02) trend', 'Surgical site infection surveillance', 'Daily while in place')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 17. DEVICE → CULTURE MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS device_culture_mapping (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  device_name text,
  linked_culture text,
  trigger_condition text,
  created_at timestamptz not null default now()
);

INSERT INTO device_culture_mapping (device_id, device_name, linked_culture, trigger_condition) VALUES
  ('DEV01', 'Central venous catheter (CVC)', 'Blood culture (CUL01) + Catheter tip culture (CUL06)', 'Fever / suspected CLABSI'),
  ('DEV02', 'Peripherally inserted central catheter (PICC)', 'Blood culture (CUL01)', 'Fever / suspected line infection'),
  ('DEV04', 'Endotracheal tube (ETT)', 'ETA culture (CUL03) / BAL culture (CUL04)', 'New infiltrate or purulent secretions'),
  ('DEV05', 'Tracheostomy', 'Tracheal aspirate culture (CUL05)', 'Increased secretions / fever'),
  ('DEV06', 'Foley catheter', 'Urine culture (CUL02)', 'Fever + cloudy/malodorous urine'),
  ('DEV08', 'Chest tube', 'Pleural fluid culture (CUL07)', 'Increasing or purulent drainage'),
  ('DEV09', 'Hemodialysis catheter', 'Blood culture (CUL01)', 'Fever during/after dialysis session'),
  ('DEV10', 'External ventricular drain (EVD)', 'CSF culture (CUL10)', 'New fever, altered CSF appearance'),
  ('DEV11', 'Peritoneal dialysis catheter', 'Peritoneal fluid culture (CUL08)', 'Cloudy effluent / abdominal pain'),
  ('DEV12', 'Tunneled catheter (Hickman/port)', 'Blood culture (CUL01) + catheter tip culture (CUL06) if removed', 'Fever / suspected line infection'),
  ('DEV13', 'Surgical drain', 'Wound/tissue culture (CUL09)', 'Purulent drainage / wound breakdown'),
  ('DEV14', 'ECMO cannula', 'Blood culture (CUL01)', 'Fever / unexplained hemodynamic instability')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 18. INVESTIGATION → CULTURE MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS investigation_culture_mapping (
  id uuid primary key default gen_random_uuid(),
  investigation_id text not null,
  investigation_name text,
  linked_culture text,
  rationale text,
  created_at timestamptz not null default now()
);

INSERT INTO investigation_culture_mapping (investigation_id, investigation_name, linked_culture, rationale) VALUES
  ('INV01', 'CBC (rising WBC)', 'Blood culture (CUL01)', 'Sepsis workup'),
  ('INV02', 'CRP / Procalcitonin rising trend', 'Source-specific culture per suspected diagnosis', 'Confirm bacterial source before escalating'),
  ('INV10', 'Chest X-ray (new infiltrate)', 'ETA culture (CUL03) / BAL culture (CUL04)', 'VAP/HAP workup'),
  ('INV15', 'Urinalysis (pyuria/nitrites)', 'Urine culture (CUL02)', 'CAUTI workup'),
  ('INV18', 'Beta-D-glucan (positive)', 'Fungal blood culture (CUL13)', 'Invasive fungal infection workup'),
  ('INV19', 'Galactomannan (positive)', 'BAL culture (CUL04)', 'Invasive aspergillosis workup'),
  ('INV20', 'C. difficile toxin (positive)', 'Stool culture (CUL11)', 'Confirm and characterize colitis'),
  ('INV21', 'Coagulation profile (DIC pattern)', 'Blood culture (CUL01)', 'Severe sepsis workup'),
  ('INV22', 'Sputum/aspirate gram stain (organisms seen)', 'ETA/sputum culture (CUL03/CUL15)', 'Guide empiric therapy pending final culture')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 19. CULTURE → ORGANISM MAPPING
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS culture_organism_mapping (
  id uuid primary key default gen_random_uuid(),
  culture_id text not null,
  culture_name text,
  likely_organism text,
  likelihood_tier text,
  pathogen_or_contaminant_note text,
  created_at timestamptz not null default now()
);

INSERT INTO culture_organism_mapping (culture_id, culture_name, likely_organism, likelihood_tier, pathogen_or_contaminant_note) VALUES
  ('CUL01', 'Blood culture', 'Staphylococcus aureus (ORG01/ORG02)', 'High', 'Pathogen - treat unless clear contamination context'),
  ('CUL01', 'Blood culture', 'Coagulase-negative staphylococcus (ORG03)', 'Moderate', 'Frequent contaminant - confirm with repeat culture / clinical context'),
  ('CUL01', 'Blood culture', 'Candida spp. (ORG21-23)', 'Moderate', 'Always pathogenic - never a contaminant'),
  ('CUL02', 'Urine culture', 'Escherichia coli (ORG08)', 'High', 'Pathogen if symptomatic with adequate colony count'),
  ('CUL02', 'Urine culture', 'Enterococcus faecalis (ORG04)', 'Moderate', 'Distinguish from asymptomatic bacteriuria'),
  ('CUL03', 'ETA culture', 'Pseudomonas aeruginosa (ORG13)', 'High', 'Pathogen if quantitative threshold met and clinical signs present'),
  ('CUL03', 'ETA culture', 'Acinetobacter baumannii (ORG14)', 'Moderate', 'Can represent colonization - correlate clinically'),
  ('CUL04', 'BAL culture', 'Pseudomonas aeruginosa (ORG13)', 'High', 'Quantitative threshold distinguishes infection from colonization'),
  ('CUL06', 'Catheter tip culture', 'Coagulase-negative staphylococcus (ORG03)', 'High', 'Common true pathogen at this specific site'),
  ('CUL07', 'Pleural fluid culture', 'Streptococcus pneumoniae (ORG06)', 'High', 'Pathogenic if recovered from sterile fluid'),
  ('CUL08', 'Peritoneal fluid culture', 'Escherichia coli (ORG08)', 'High', 'Polymicrobial recovery is common and expected'),
  ('CUL08', 'Peritoneal fluid culture', 'Bacteroides fragilis (ORG16)', 'High', 'Anaerobic cover required when recovered'),
  ('CUL09', 'Wound/tissue culture', 'Staphylococcus aureus (ORG01/ORG02)', 'High', 'Pathogenic from deep tissue; less specific from surface swab'),
  ('CUL10', 'CSF culture', 'Neisseria meningitidis (ORG19)', 'High', 'Always pathogenic - immediate isolation required'),
  ('CUL11', 'Stool culture / C. diff assay', 'Clostridioides difficile (ORG18)', 'High', 'Toxin positivity required to confirm active disease'),
  ('CUL13', 'Fungal blood culture', 'Candida albicans (ORG21)', 'High', 'Always pathogenic from blood'),
  ('CUL14', 'Nasal MRSA screening swab', 'Staphylococcus aureus, MRSA (ORG02)', 'High (colonization, not infection)', 'Used for de-escalation decisions, not infection diagnosis')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 20. STEWARDSHIP REVIEW TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS stewardship_review_triggers (
  id text primary key,
  trigger_condition text not null,
  recommended_system_action text,
  linked_entity_type text,
  escalation_path text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

INSERT INTO stewardship_review_triggers (id, trigger_condition, recommended_system_action, linked_entity_type, escalation_path) VALUES
  ('TRG01', 'Culture negative at 48h with clinical improvement', 'Suggest antibiotic de-escalation or discontinuation', 'Antibiotic, Culture', 'Stewardship pharmacist review'),
  ('TRG02', 'Device dwell time exceeds review threshold', 'Flag device for necessity/removal assessment', 'Device', 'Daily multidisciplinary rounds'),
  ('TRG03', 'Renal function declining (creatinine rising significantly from baseline)', 'Flag nephrotoxic antibiotics for dose adjustment or substitution', 'Antibiotic, Investigation', 'Pharmacist / nephrology consult'),
  ('TRG04', 'Positive blood culture with likely skin commensal organism, single bottle only', 'Flag as probable contaminant; confirm with repeat culture before escalating therapy', 'Culture, Organism', 'Clinical team review before action'),
  ('TRG05', 'Antibiotic duration exceeds diagnosis-specific guideline maximum', 'Flag for stop/review at next stewardship round', 'Antibiotic, Diagnosis', 'Stewardship pharmacist review'),
  ('TRG06', 'Multidrug-resistant organism isolated (CRE, MDR-Acinetobacter, C. auris)', 'Trigger infection control isolation precautions + ID consult', 'Organism', 'Infection control + infectious disease'),
  ('TRG07', 'Procalcitonin falling more than 80% from peak value', 'Support antibiotic discontinuation discussion', 'Investigation, Antibiotic', 'Clinical team review'),
  ('TRG08', 'Two consecutive negative blood cultures in treated candidemia', 'Calculate 2-week therapy clock from first negative culture', 'Culture, Antibiotic', 'Pharmacist tracking'),
  ('TRG09', 'Vancomycin trough/AUC outside therapeutic range', 'Trigger dose adjustment recommendation', 'Antibiotic, Investigation', 'Pharmacist dosing review'),
  ('TRG10', 'New diagnosis entered with no matching empiric protocol', 'Flag for manual stewardship/ID input rather than auto-suggestion', 'Diagnosis', 'Infectious disease consult'),
  ('TRG11', 'Antibiotic-allergy conflict detected on order entry', 'Block order and surface safe alternatives from Allergy_CrossReactivity', 'Antibiotic, Allergy', 'Pharmacist verification before override'),
  ('TRG12', 'Empiric broad-spectrum therapy active for more than 72h without positive culture', 'Prompt re-assessment of diagnosis and likelihood of infection', 'Antibiotic, Diagnosis, Culture', 'Stewardship pharmacist review'),
  ('TRG13', 'C. difficile toxin positive while patient on broad-spectrum antibiotic', 'Recommend review of inciting antibiotic necessity', 'Antibiotic, Diagnosis, Culture', 'Clinical team review'),
  ('TRG14', 'Aminoglycoside or vancomycin course exceeds 7-10 days', 'Trigger ototoxicity/nephrotoxicity monitoring reminder', 'Antibiotic, Investigation', 'Pharmacist monitoring reminder')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- DROP OLD MASTER TABLES FROM MIGRATIONS 007 AND 008
-- ══════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS antibiotic_class_master CASCADE;
DROP TABLE IF EXISTS coverage_master CASCADE;
DROP TABLE IF EXISTS stewardship_status_master CASCADE;
DROP TABLE IF EXISTS infection_syndrome_master CASCADE;
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
