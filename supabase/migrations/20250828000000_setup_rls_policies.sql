/*
# [SECURITY] Setup RLS Policies for Admin and Public Access
This migration secures the database by enabling Row Level Security (RLS) on all tables and defining access policies.

## Query Description:
This script establishes a secure foundation for data access. It ensures that:
1. All tables are protected by RLS by default.
2. The public (anonymous users) can read all equipment and booking information, and can create new bookings. This is essential for the booking form to work.
3. Only users authenticated via the Admin page can modify or delete any data (equipment, bookings).
This prevents unauthorized data modification, which was the root cause of the previous errors.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true (by dropping policies and disabling RLS)

## Structure Details:
- Tables affected: equipment, bookings, booking_equipment
- New Policies: Multiple policies for SELECT, INSERT, and ALL permissions based on authentication status.

## Security Implications:
- RLS Status: Enabled on all tables.
- Policy Changes: Yes, this is the core of the migration.
- Auth Requirements: Defines policies based on anonymous vs. authenticated roles.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. RLS checks are highly optimized by PostgreSQL.
*/

-- 1. Enable RLS on all relevant tables
alter table public.equipment enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_equipment enable row level security;

-- 2. Create policies for PUBLIC (anonymous) access
-- Public can read all equipment
drop policy if exists "Public can read all equipment" on public.equipment;
create policy "Public can read all equipment"
  on public.equipment for select
  using ( true );

-- Public can read all bookings
drop policy if exists "Public can read all bookings" on public.bookings;
create policy "Public can read all bookings"
  on public.bookings for select
  using ( true );

-- Public can read all booking_equipment details
drop policy if exists "Public can read all booking_equipment" on public.booking_equipment;
create policy "Public can read all booking_equipment"
  on public.booking_equipment for select
  using ( true );

-- Public can create new bookings
drop policy if exists "Anyone can create a booking" on public.bookings;
create policy "Anyone can create a booking"
  on public.bookings for insert
  with check ( true );

-- Public can create booking_equipment entries when making a booking
drop policy if exists "Anyone can create booking_equipment" on public.booking_equipment;
create policy "Anyone can create booking_equipment"
  on public.booking_equipment for insert
  with check ( true );

-- 3. Create policies for AUTHENTICATED (admin) users
-- Authenticated users have full control over equipment
drop policy if exists "Admins can manage all equipment" on public.equipment;
create policy "Admins can manage all equipment"
  on public.equipment for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

-- Authenticated users have full control over bookings
drop policy if exists "Admins can manage all bookings" on public.bookings;
create policy "Admins can manage all bookings"
  on public.bookings for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

-- Authenticated users have full control over booking_equipment
drop policy if exists "Admins can manage all booking_equipment" on public.booking_equipment;
create policy "Admins can manage all booking_equipment"
  on public.booking_equipment for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );
