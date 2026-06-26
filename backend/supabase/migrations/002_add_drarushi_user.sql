-- Rename St. John to General Hospital, add AIIMS, add Dr. Arushi
-- Password: aiimsonian (SHA-256 hashed)

update hospitals set name = 'General Hospital' where id = 'hosp-st-john';

insert into hospitals (id, name, city, beds, plan, sync_status) values
  ('hosp-aiims', 'AIIMS General', 'Delhi', 30, 'Pilot', 'Live')
on conflict (id) do nothing;

insert into users (id, hospital_id, name, email, password_hash, role, unit, status) values
  ('u-arushi', 'hosp-aiims', 'Arushi', 'drarushitest@gmail.com', 'ebc548f3d08ce356cfd8d06bde1911661f27834f587164d183eb943bb615e35f', 'ICU Consultant', 'Medical ICU', 'Active')
on conflict (id) do nothing;
