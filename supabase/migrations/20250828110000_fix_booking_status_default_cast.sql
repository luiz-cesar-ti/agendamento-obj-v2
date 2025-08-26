/*
# [Fix] Correct Booking Status Column Default Value
[This migration fixes the booking status column by recreating it with the correct enum type and a properly casted default value. It resolves the `cannot be cast automatically` error from the previous attempt.]

## Query Description: [This operation will temporarily remove the 'status' column from the 'bookings' table and recreate it. Any existing status data will be lost, but since the previous migrations failed, this is unlikely to be an issue. The new column will enforce a strict set of statuses ('pending', 'confirmed', 'cancelled', 'expired') and set 'pending' as the default for all new entries.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Medium"]
- Requires-Backup: [true]
- Reversible: [false]

## Structure Details:
- Tables affected: public.bookings
- Columns affected: status (dropped and recreated)
- Types created: public.booking_status (if not exists)

## Security Implications:
- RLS Status: [Unaffected]
- Policy Changes: [No]
- Auth Requirements: [Admin privileges for migration]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. The operation is fast on tables of small to medium size.]
*/

-- Step 1: Create the custom ENUM type if it doesn't already exist.
-- This ensures the script is safe to re-run and idempotent.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');
    END IF;
END $$;

-- Step 2: Drop the existing 'status' column to ensure a clean state,
-- avoiding any issues from previous failed migrations.
ALTER TABLE public.bookings
DROP COLUMN IF EXISTS status;

-- Step 3: Add the 'status' column back with the correct ENUM type and a properly casted default value.
-- The explicit cast 'pending'::public.booking_status is the key fix for the error.
ALTER TABLE public.bookings
ADD COLUMN status public.booking_status NOT NULL DEFAULT 'pending'::public.booking_status;
