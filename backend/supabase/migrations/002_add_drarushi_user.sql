-- Add Dr. Arushi as a new user
-- Password: aiimsonian (SHA-256 hashed)
-- Run this in Supabase SQL Editor

insert into users (id, hospital_id, name, email, password_hash, role, unit, status) values
  ('u-arushi', 'hosp-st-john', 'Dr. Arushi', 'drarushi@stjohn.icu', 'ebc548f3d08ce356cfd8d06bde1911661f27834f587164d183eb943bb615e35f', 'ICU Consultant', 'Medical ICU', 'Active')
on conflict (id) do nothing;
