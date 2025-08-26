/*
# [Operation Name]
Reset and Recreate Booking Status Column

## Query Description: [This operation performs a hard reset on the 'status' column in the 'bookings' table to resolve persistent constraint errors. It will drop the existing 'status' column, which will result in the loss of all current status data for existing bookings. It then recreates the column with the correct 'booking_status' ENUM type and sets a valid default ('pending'). This is a destructive but necessary step to ensure the database schema is consistent and allows new bookings to be created.]

## Metadata:
- Schema-Category: ["Dangerous"]
- Impact-Level: ["High"]
- Requires-Backup: [true]
- Reversible: [false]

## Structure Details:
- Table 'bookings': The 'status' column will be dropped and recreated. **All existing status data will be lost.**
- Type 'booking_status': This ENUM type will be dropped and recreated to ensure it's correctly defined.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [Admin privileges required to run migration.]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. The operation might lock the 'bookings' table briefly.]
*/

-- Remove the default value from the column first.
ALTER TABLE public.bookings ALTER COLUMN status DROP DEFAULT;

-- Drop the column entirely. This is destructive but ensures a clean slate.
ALTER TABLE public.bookings DROP COLUMN IF EXISTS status;

-- Drop the type, which is now safe to do.
DROP TYPE IF EXISTS public.booking_status;

-- Recreate the type with the correct values.
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');

-- Add the column back with the correct type and a safe default value.
ALTER TABLE public.bookings ADD COLUMN status public.booking_status NOT NULL DEFAULT 'pending';
