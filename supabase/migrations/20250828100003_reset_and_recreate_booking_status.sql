/*
# [Operation Name]
Reset and Recreate Booking Status Column

## Query Description: [This operation resets the 'status' column in the 'bookings' table to fix inconsistencies from previous failed migrations. It will delete existing status data for all bookings and reset them to 'pending'. This is a necessary step to ensure the stability and correct functioning of the booking system. A backup of the 'bookings' table is recommended before proceeding.]

## Metadata:
- Schema-Category: ["Structural", "Data"]
- Impact-Level: ["High"]
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Tables affected: bookings
- Columns affected: status (will be dropped and recreated)
- Types affected: booking_status (will be created)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges required to run migration.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Low. The operation will be fast on small to medium-sized tables.
*/

-- Drop the old check constraint if it exists to avoid conflicts.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Drop the old column if it exists to ensure a clean slate.
ALTER TABLE public.bookings DROP COLUMN IF EXISTS status;

-- Drop the enum type if it exists from previous failed attempts.
DROP TYPE IF EXISTS public.booking_status;

-- Create a new, explicit ENUM type for booking statuses. This is more robust than a check constraint.
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');

-- Add the status column back, now using the new ENUM type and setting a correct default value.
ALTER TABLE public.bookings
ADD COLUMN status public.booking_status DEFAULT 'pending' NOT NULL;
