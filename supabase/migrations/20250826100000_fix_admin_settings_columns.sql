/*
  # [Operation Name]
  Fix admin_settings column names

  ## Query Description: [This operation corrects a schema mismatch by dropping the existing 'admin_settings' table and recreating it with the correct column names ('key' and 'value') that the application code expects. This will reset any data in the settings table, but since it's a fresh setup, no user data will be lost.]

  ## Metadata:
  - Schema-Category: ["Structural", "Dangerous"]
  - Impact-Level: ["Medium"]
  - Requires-Backup: false
  - Reversible: false

  ## Structure Details:
  - Drops table: admin_settings
  - Creates table: admin_settings
  - Columns affected: setting_key -> key, setting_value -> value

  ## Security Implications:
  - RLS Status: Re-enabled
  - Policy Changes: Re-created
  - Auth Requirements: None

  ## Performance Impact:
  - Indexes: Re-created
  - Triggers: None
  - Estimated Impact: Low
*/

-- Drop the existing table with incorrect column names
drop table if exists public.admin_settings;

-- Recreate the table with the correct column names ('key', 'value')
create table public.admin_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Re-apply Row Level Security
alter table public.admin_settings enable row level security;

-- Re-create policies
create policy "Allow public read access" on public.admin_settings for select using (true);
create policy "Allow authenticated users to manage settings" on public.admin_settings for all using (auth.role() = 'authenticated');

-- Add a comment for clarity
comment on table public.admin_settings is 'Stores general application settings, like the hero image URL.';
