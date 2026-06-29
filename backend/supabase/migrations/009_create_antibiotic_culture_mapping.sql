-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 009: Antibiotic ↔ Culture Mapping (Many-to-Many Recommendation)
-- Junction table: antibiotic_culture_mapping
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS antibiotic_culture_mapping (
  id uuid primary key default gen_random_uuid(),
  antibiotic_generic_name text not null,
  culture_type text not null,
  infection_type text,
  priority text check (priority in ('Primary', 'Secondary', 'Optional')),
  recommended boolean not null default true,
  requires_before_first_dose boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique(antibiotic_generic_name, culture_type, infection_type)
);

CREATE INDEX IF NOT EXISTS idx_abx_culture_map_antibiotic ON antibiotic_culture_mapping(antibiotic_generic_name);
CREATE INDEX IF NOT EXISTS idx_abx_culture_map_culture ON antibiotic_culture_mapping(culture_type);

-- ══════════════════════════════════════════════════════════════════════════════
-- Seed data from the reference tables
-- ══════════════════════════════════════════════════════════════════════════════

-- Penicillin G: Streptococci, Syphilis
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Penicillin G', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Penicillin G', 'CSF Culture', 'Meningitis', 'Primary'),
  ('Penicillin G', 'Tissue Culture', 'Deep Infection', 'Secondary'),
  ('Penicillin G', 'Wound Swab', 'SSTI', 'Secondary'),
  ('Penicillin G', 'Pus Culture', 'Abscess', 'Secondary');

-- Ampicillin: Enterococcus, Listeria
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ampicillin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ampicillin', 'CSF Culture', 'Meningitis', 'Primary'),
  ('Ampicillin', 'Urine Culture', 'UTI', 'Primary'),
  ('Ampicillin', 'Tissue Culture', 'Deep Infection', 'Secondary'),
  ('Ampicillin', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Secondary');

-- Amoxicillin: CAP, ENT, UTI
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Amoxicillin', 'Sputum Culture', 'CAP', 'Primary'),
  ('Amoxicillin', 'Throat Swab', 'Pharyngitis', 'Primary'),
  ('Amoxicillin', 'Urine Culture', 'UTI', 'Primary'),
  ('Amoxicillin', 'Blood Culture', 'Sepsis', 'Secondary'),
  ('Amoxicillin', 'Ear Swab', 'Otitis', 'Secondary');

-- Amoxicillin-Clavulanate: Aspiration, SSTI
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Amoxicillin-Clavulanate', 'Wound Swab', 'SSTI', 'Primary'),
  ('Amoxicillin-Clavulanate', 'Sputum Culture', 'Aspiration', 'Primary'),
  ('Amoxicillin-Clavulanate', 'Tissue Culture', 'Deep Infection', 'Secondary'),
  ('Amoxicillin-Clavulanate', 'Pus Culture', 'Abscess', 'Secondary'),
  ('Amoxicillin-Clavulanate', 'Surgical Site Culture', 'SSI', 'Secondary');

-- Ampicillin-Sulbactam: Intra-abdominal, Aspiration
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ampicillin-Sulbactam', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ampicillin-Sulbactam', 'Wound Swab', 'SSTI', 'Primary'),
  ('Ampicillin-Sulbactam', 'Bronchoalveolar Lavage (BAL)', 'Aspiration', 'Primary'),
  ('Ampicillin-Sulbactam', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Primary'),
  ('Ampicillin-Sulbactam', 'Tissue Culture', 'Deep Infection', 'Secondary'),
  ('Ampicillin-Sulbactam', 'Pus Culture', 'Abscess', 'Secondary');

-- Piperacillin-Tazobactam: Sepsis, HAP, VAP
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Piperacillin-Tazobactam', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Piperacillin-Tazobactam', 'Urine Culture', 'Sepsis', 'Primary'),
  ('Piperacillin-Tazobactam', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Piperacillin-Tazobactam', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Piperacillin-Tazobactam', 'Sputum Culture', 'HAP', 'Secondary'),
  ('Piperacillin-Tazobactam', 'Pleural Fluid Culture', 'Empyema', 'Secondary'),
  ('Piperacillin-Tazobactam', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Secondary'),
  ('Piperacillin-Tazobactam', 'Wound Swab', 'SSTI', 'Secondary'),
  ('Piperacillin-Tazobactam', 'Tissue Culture', 'Deep Infection', 'Secondary');

-- Cloxacillin: MSSA
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Cloxacillin', 'Blood Culture', 'Bacteremia', 'Primary'),
  ('Cloxacillin', 'Wound Swab', 'SSTI', 'Primary'),
  ('Cloxacillin', 'Bone Culture', 'Osteomyelitis', 'Primary'),
  ('Cloxacillin', 'Pus Culture', 'Abscess', 'Primary'),
  ('Cloxacillin', 'Tissue Culture', 'Deep Infection', 'Secondary'),
  ('Cloxacillin', 'Surgical Site Culture', 'SSI', 'Secondary');

-- Cefazolin: Surgical prophylaxis
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Cefazolin', 'Blood Culture', 'Bacteremia', 'Primary'),
  ('Cefazolin', 'Wound Swab', 'SSTI', 'Primary'),
  ('Cefazolin', 'Bone Culture', 'Osteomyelitis', 'Primary'),
  ('Cefazolin', 'Surgical Site Culture', 'SSI', 'Primary'),
  ('Cefazolin', 'Tissue Culture', 'Deep Infection', 'Secondary'),
  ('Cefazolin', 'Pus Culture', 'Abscess', 'Secondary');

-- Cefuroxime: Respiratory
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Cefuroxime', 'Sputum Culture', 'CAP', 'Primary'),
  ('Cefuroxime', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Cefuroxime', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Secondary'),
  ('Cefuroxime', 'Throat Swab', 'Pharyngitis', 'Secondary');

-- Cefoxitin: Anaerobic
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Cefoxitin', 'Tissue Culture', 'Deep Infection', 'Primary'),
  ('Cefoxitin', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Primary'),
  ('Cefoxitin', 'Pus Culture', 'Abscess', 'Primary'),
  ('Cefoxitin', 'Wound Swab', 'SSTI', 'Secondary');

-- Ceftriaxone: CAP, Sepsis, Meningitis
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ceftriaxone', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ceftriaxone', 'CSF Culture', 'Meningitis', 'Primary'),
  ('Ceftriaxone', 'Sputum Culture', 'CAP', 'Primary'),
  ('Ceftriaxone', 'Urine Culture', 'UTI', 'Primary'),
  ('Ceftriaxone', 'Pleural Fluid Culture', 'Empyema', 'Secondary'),
  ('Ceftriaxone', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Secondary'),
  ('Ceftriaxone', 'Ascitic Fluid Culture', 'SBP', 'Primary'),
  ('Ceftriaxone', 'Bile Culture', 'Cholangitis', 'Primary'),
  ('Ceftriaxone', 'Wound Swab', 'SSTI', 'Secondary');

-- Cefotaxime: Meningitis
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Cefotaxime', 'CSF Culture', 'Meningitis', 'Primary'),
  ('Cefotaxime', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Cefotaxime', 'Sputum Culture', 'Pneumonia', 'Secondary'),
  ('Cefotaxime', 'Urine Culture', 'UTI', 'Secondary');

-- Ceftazidime: Pseudomonas
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ceftazidime', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Ceftazidime', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Ceftazidime', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ceftazidime', 'Sputum Culture', 'HAP', 'Secondary'),
  ('Ceftazidime', 'Urine Culture', 'UTI', 'Secondary');

-- Cefepime: ICU Sepsis
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Cefepime', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Cefepime', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Cefepime', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Cefepime', 'Urine Culture', 'UTI', 'Primary'),
  ('Cefepime', 'Sputum Culture', 'HAP', 'Secondary'),
  ('Cefepime', 'Pleural Fluid Culture', 'Empyema', 'Secondary');

-- Ceftaroline: MRSA Pneumonia
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ceftaroline', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ceftaroline', 'Sputum Culture', 'Pneumonia', 'Primary'),
  ('Ceftaroline', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Primary'),
  ('Ceftaroline', 'Wound Swab', 'SSTI', 'Secondary'),
  ('Ceftaroline', 'Tissue Culture', 'Deep Infection', 'Secondary');

-- Aztreonam: Gram-negative, Allergy
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Aztreonam', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Aztreonam', 'Urine Culture', 'UTI', 'Primary'),
  ('Aztreonam', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Aztreonam', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Secondary'),
  ('Aztreonam', 'Sputum Culture', 'HAP', 'Secondary');

-- Meropenem: ESBL, Septic Shock
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Meropenem', 'Blood Culture', 'Septic Shock', 'Primary'),
  ('Meropenem', 'Urine Culture', 'Sepsis', 'Primary'),
  ('Meropenem', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Meropenem', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Meropenem', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Primary'),
  ('Meropenem', 'Tissue Culture', 'Deep Infection', 'Secondary'),
  ('Meropenem', 'CSF Culture', 'Meningitis', 'Secondary'),
  ('Meropenem', 'Wound Swab', 'SSTI', 'Secondary');

-- Imipenem: Severe ICU Infection
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Imipenem', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Imipenem', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Imipenem', 'Wound Swab', 'SSTI', 'Primary'),
  ('Imipenem', 'Endotracheal Aspirate (ETA)', 'VAP', 'Secondary'),
  ('Imipenem', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Secondary'),
  ('Imipenem', 'Tissue Culture', 'Deep Infection', 'Secondary');

-- Ertapenem: ESBL (No Pseudomonas)
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ertapenem', 'Urine Culture', 'UTI', 'Primary'),
  ('Ertapenem', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ertapenem', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Primary'),
  ('Ertapenem', 'Wound Swab', 'SSTI', 'Secondary'),
  ('Ertapenem', 'Tissue Culture', 'Deep Infection', 'Secondary');

-- Doripenem: MDR Infection
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Doripenem', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Doripenem', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Doripenem', 'Endotracheal Aspirate (ETA)', 'VAP', 'Secondary');

-- Vancomycin: MRSA
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Vancomycin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Vancomycin', 'Catheter Tip Culture', 'CLABSI', 'Primary'),
  ('Vancomycin', 'Wound Swab', 'SSTI', 'Primary'),
  ('Vancomycin', 'Bone Culture', 'Osteomyelitis', 'Primary'),
  ('Vancomycin', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Secondary'),
  ('Vancomycin', 'Endotracheal Aspirate (ETA)', 'VAP', 'Secondary'),
  ('Vancomycin', 'CSF Culture', 'Meningitis', 'Secondary'),
  ('Vancomycin', 'Tissue Culture', 'Deep Infection', 'Secondary');

-- Teicoplanin: MRSA
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Teicoplanin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Teicoplanin', 'Wound Swab', 'SSTI', 'Primary'),
  ('Teicoplanin', 'Bone Culture', 'Osteomyelitis', 'Secondary'),
  ('Teicoplanin', 'Catheter Tip Culture', 'CLABSI', 'Primary');

-- Linezolid: MRSA, VRE
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Linezolid', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Linezolid', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Primary'),
  ('Linezolid', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Linezolid', 'Bone Culture', 'Osteomyelitis', 'Primary'),
  ('Linezolid', 'Wound Swab', 'SSTI', 'Secondary'),
  ('Linezolid', 'Tissue Culture', 'Deep Infection', 'Secondary');

-- Daptomycin: MRSA Bacteremia
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Daptomycin', 'Blood Culture', 'Bacteremia', 'Primary'),
  ('Daptomycin', 'Bone Culture', 'Osteomyelitis', 'Primary'),
  ('Daptomycin', 'Tissue Culture', 'Deep Infection', 'Primary'),
  ('Daptomycin', 'Wound Swab', 'SSTI', 'Secondary'),
  ('Daptomycin', 'Catheter Tip Culture', 'CLABSI', 'Secondary');

-- Gentamicin: Gram-negative
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Gentamicin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Gentamicin', 'Urine Culture', 'UTI', 'Primary'),
  ('Gentamicin', 'Endotracheal Aspirate (ETA)', 'VAP', 'Secondary'),
  ('Gentamicin', 'Wound Swab', 'SSTI', 'Secondary');

-- Amikacin: MDR Gram-negative
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Amikacin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Amikacin', 'Urine Culture', 'UTI', 'Primary'),
  ('Amikacin', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Amikacin', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Secondary'),
  ('Amikacin', 'Sputum Culture', 'HAP', 'Secondary');

-- Tobramycin: Pseudomonas
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Tobramycin', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Tobramycin', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Tobramycin', 'Sputum Culture', 'HAP', 'Secondary'),
  ('Tobramycin', 'Blood Culture', 'Sepsis', 'Secondary');

-- Ciprofloxacin: UTI, Pseudomonas
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ciprofloxacin', 'Urine Culture', 'UTI', 'Primary'),
  ('Ciprofloxacin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ciprofloxacin', 'Wound Swab', 'SSTI', 'Secondary'),
  ('Ciprofloxacin', 'Sputum Culture', 'HAP', 'Secondary');

-- Levofloxacin: CAP
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Levofloxacin', 'Sputum Culture', 'CAP', 'Primary'),
  ('Levofloxacin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Levofloxacin', 'Urine Culture', 'UTI', 'Secondary'),
  ('Levofloxacin', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Secondary');

-- Moxifloxacin: Respiratory
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Moxifloxacin', 'Sputum Culture', 'CAP', 'Primary'),
  ('Moxifloxacin', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Secondary'),
  ('Moxifloxacin', 'Blood Culture', 'Sepsis', 'Secondary');

-- Azithromycin: Atypical Pneumonia
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Azithromycin', 'Sputum Culture', 'CAP', 'Primary'),
  ('Azithromycin', 'Bronchoalveolar Lavage (BAL)', 'Pneumonia', 'Secondary'),
  ('Azithromycin', 'Blood Culture', 'Sepsis', 'Secondary'),
  ('Azithromycin', 'Throat Swab', 'Pharyngitis', 'Secondary');

-- Clarithromycin: Respiratory
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Clarithromycin', 'Sputum Culture', 'CAP', 'Primary'),
  ('Clarithromycin', 'Throat Swab', 'Pharyngitis', 'Secondary');

-- Doxycycline: Atypicals
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Doxycycline', 'Sputum Culture', 'CAP', 'Primary'),
  ('Doxycycline', 'Wound Swab', 'SSTI', 'Primary'),
  ('Doxycycline', 'Blood Culture', 'Sepsis', 'Secondary');

-- Tigecycline: MDR Intra-abdominal
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Tigecycline', 'Tissue Culture', 'Deep Infection', 'Primary'),
  ('Tigecycline', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Primary'),
  ('Tigecycline', 'Blood Culture', 'Sepsis', 'Secondary'),
  ('Tigecycline', 'Wound Swab', 'SSTI', 'Secondary');

-- Metronidazole: Anaerobes
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Metronidazole', 'Peritoneal Fluid Culture', 'Intra-abdominal', 'Primary'),
  ('Metronidazole', 'Tissue Culture', 'Deep Infection', 'Primary'),
  ('Metronidazole', 'Pus Culture', 'Abscess', 'Primary'),
  ('Metronidazole', 'Wound Swab', 'SSTI', 'Secondary');

-- TMP-SMX: PCP, UTI
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Trimethoprim-Sulfamethoxazole', 'Bronchoalveolar Lavage (BAL)', 'PCP', 'Primary'),
  ('Trimethoprim-Sulfamethoxazole', 'Urine Culture', 'UTI', 'Primary'),
  ('Trimethoprim-Sulfamethoxazole', 'Blood Culture', 'Sepsis', 'Secondary'),
  ('Trimethoprim-Sulfamethoxazole', 'Sputum Culture', 'Pneumonia', 'Secondary');

-- Colistin: CRE, MDR
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Colistin', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Colistin', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Colistin', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Colistin', 'Urine Culture', 'UTI', 'Secondary');

-- Polymyxin B: MDR
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Polymyxin B', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Polymyxin B', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Polymyxin B', 'Endotracheal Aspirate (ETA)', 'VAP', 'Secondary');

-- Ceftazidime-Avibactam: CRE
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ceftazidime-Avibactam', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Ceftazidime-Avibactam', 'Urine Culture', 'UTI', 'Primary'),
  ('Ceftazidime-Avibactam', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Secondary');

-- Ceftolozane-Tazobactam: MDR Pseudomonas
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Ceftolozane-Tazobactam', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Ceftolozane-Tazobactam', 'Endotracheal Aspirate (ETA)', 'VAP', 'Primary'),
  ('Ceftolozane-Tazobactam', 'Blood Culture', 'Sepsis', 'Secondary'),
  ('Ceftolozane-Tazobactam', 'Urine Culture', 'UTI', 'Secondary');

-- Cefiderocol: XDR Gram-negative
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Cefiderocol', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Cefiderocol', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Cefiderocol', 'Endotracheal Aspirate (ETA)', 'VAP', 'Secondary');

-- Meropenem-Vaborbactam: CRE
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Meropenem-Vaborbactam', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Meropenem-Vaborbactam', 'Urine Culture', 'UTI', 'Primary'),
  ('Meropenem-Vaborbactam', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Secondary');

-- Imipenem-Relebactam: MDR
INSERT INTO antibiotic_culture_mapping (antibiotic_generic_name, culture_type, infection_type, priority) VALUES
  ('Imipenem-Relebactam', 'Blood Culture', 'Sepsis', 'Primary'),
  ('Imipenem-Relebactam', 'Bronchoalveolar Lavage (BAL)', 'VAP', 'Primary'),
  ('Imipenem-Relebactam', 'Endotracheal Aspirate (ETA)', 'VAP', 'Secondary');
