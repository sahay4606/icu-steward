-- ═══════════════════════════════════════════════════════════
-- Migration 001: Add auth columns to users table
-- ═══════════════════════════════════════════════════════════
-- Run in Supabase SQL Editor after the initial master.sql.
--
-- Adds email + password_hash columns so the login page
-- (email/password) can authenticate against existing users.
--
-- Test credentials after running:
--   meera@stjohn.icu  /  admin123
--   arjun@stjohn.icu  /  consult123
--   isha@stjohn.icu   /  resident123
-- ═══════════════════════════════════════════════════════════

alter table if exists users add column if not exists email text;
alter table if exists users add column if not exists password_hash text;

-- Seed existing users with credentials (SHA-256 hashed passwords)
update users set email='meera@stjohn.icu',   password_hash='240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' where id='u-admin' and email is null;
update users set email='arjun@stjohn.icu',   password_hash='aba1dcd38408657aa7876b03edfb8fd74aab2b95e2eda5cf258202c7cd5ee64c' where id='u-consultant' and email is null;
update users set email='isha@stjohn.icu',    password_hash='2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84' where id='u-resident' and email is null;
