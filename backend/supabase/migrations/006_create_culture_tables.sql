-- Cultures table
create table if not exists cultures (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  admission_id text,
  culture_type text not null,
  specimen_source text,
  anatomical_source text,
  collection_method text,
  collection_datetime timestamptz,
  received_datetime timestamptz,
  processing_datetime timestamptz,
  report_datetime timestamptz,
  status text not null default 'Ordered',
  gram_stain text,
  growth_result text,
  colony_count text,
  laboratory text,
  department text,
  ordered_by text,
  collected_by text,
  specimen_number text,
  remarks text,
  hospital_id text not null references hospitals(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Culture organisms
create table if not exists culture_organisms (
  id text primary key,
  culture_id text not null references cultures(id) on delete cascade,
  organism_name text not null,
  colony_count text,
  resistance_marker text,
  hospital_id text not null references hospitals(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Antibiotic sensitivity per organism
create table if not exists culture_sensitivities (
  id text primary key,
  organism_id text not null references culture_organisms(id) on delete cascade,
  antibiotic text not null,
  mic text,
  susceptibility text not null default 'Not Tested',
  hospital_id text not null references hospitals(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Many-to-many: antibiotic ↔ culture with reason
create table if not exists antibiotic_culture_links (
  id text primary key,
  antibiotic_id text not null references antibiotics(id) on delete cascade,
  culture_id text not null references cultures(id) on delete cascade,
  link_reason text not null default 'Empirical Therapy',
  linked_by text,
  linked_at timestamptz not null default now(),
  hospital_id text not null references hospitals(id)
);

-- Indexes
create index if not exists idx_cultures_patient on cultures(patient_id);
create index if not exists idx_cultures_hospital on cultures(hospital_id, created_at desc);
create index if not exists idx_culture_organisms_culture on culture_organisms(culture_id);
create index if not exists idx_culture_sensitivities_organism on culture_sensitivities(organism_id);
create index if not exists idx_abx_culture_links_antibiotic on antibiotic_culture_links(antibiotic_id);
create index if not exists idx_abx_culture_links_culture on antibiotic_culture_links(culture_id);

-- Enable RLS (service_role key bypasses anyway)
alter table cultures enable row level security;
alter table culture_organisms enable row level security;
alter table culture_sensitivities enable row level security;
alter table antibiotic_culture_links enable row level security;
