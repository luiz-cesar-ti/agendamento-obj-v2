/*
# [Fix Booking Status Constraint]
This migration corrects the CHECK constraint on the `status` column of the `bookings` table to ensure it accepts all required values, including 'pending'. This resolves an error where new bookings were being rejected by the database.

## Query Description: [This operation modifies a table constraint. It will first remove the old, incorrect constraint and then add a new, correct one. There is no risk to existing data, as it only affects the rules for new or updated rows.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Table: `bookings`
- Column: `status`
- Constraint: `bookings_status_check`

## Security Implications:
- RLS Status: [Enabled/Disabled]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [No change]
- Triggers: [No change]
- Estimated Impact: [Negligible. The change is a metadata update and will not affect query performance.]
*/

-- First, remove the old, potentially incorrect constraint.
-- We wrap this in a DO block to handle cases where the constraint might not exist, preventing errors.
DO $$
BEGIN
   IF EXISTS (
       SELECT 1
       FROM information_schema.table_constraints
       WHERE constraint_name = 'bookings_status_check' AND table_name = 'bookings'
   ) THEN
      ALTER TABLE public.bookings DROP CONSTRAINT bookings_status_check;
   END IF;
END
$$;

-- Then, add the new, correct constraint that includes all necessary statuses.
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired'));
