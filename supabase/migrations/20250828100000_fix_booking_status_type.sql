/*
# [Fix] Correct Booking Status Type
This migration fixes a critical error from a previous script by correctly defining the `booking_status` custom type before applying it to the `bookings` table. It also handles the conversion of existing data to the new format.

## Query Description:
This operation alters the structure of the `bookings` table. It creates a new data type (`ENUM`) and changes the `status` column to use this type. Existing data in the `status` column will be converted: 'active' becomes 'confirmed', 'expired' remains 'expired', and any other values become 'pending'. This change is necessary for the new filtering and status display features to work correctly.

## Metadata:
- Schema-Category: ["Structural", "Data"]
- Impact-Level: ["Medium"]
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Creates:** ENUM type `public.booking_status`.
- **Alters:** Table `public.bookings`, column `status`.
  - Changes data type from `text` to `public.booking_status`.
  - Sets a `DEFAULT` value of 'pending'.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to run migrations.

## Performance Impact:
- Indexes: Unchanged
- Triggers: Unchanged
- Estimated Impact: Low. The operation might lock the `bookings` table briefly during the alteration.
*/

-- Step 1: Create the custom ENUM type for booking statuses.
-- This defines the allowed values for the status of a booking.
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');

-- Step 2: Alter the 'status' column in the 'bookings' table.
-- This changes the column's data type from text to the newly created 'booking_status' ENUM.
-- The USING clause handles the conversion of existing text values to the corresponding ENUM values.
ALTER TABLE public.bookings
ALTER COLUMN status TYPE public.booking_status
USING (
  CASE
    WHEN status = 'active' THEN 'confirmed'::public.booking_status
    WHEN status = 'expired' THEN 'expired'::public.booking_status
    -- Any other existing status will be considered 'pending'.
    -- This handles edge cases or unexpected data gracefully.
    ELSE 'pending'::public.booking_status
  END
);

-- Step 3: Set a default value for the 'status' column.
-- All new bookings will automatically be created with the 'pending' status.
ALTER TABLE public.bookings
ALTER COLUMN status SET DEFAULT 'pending';
