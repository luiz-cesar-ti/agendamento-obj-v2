/*
# [Update Booking Status Enum]
This migration updates the `booking_status` enum to include new states ('pending', 'confirmed', 'cancelled'), migrates existing 'active' bookings to 'confirmed', and sets the default for new bookings to 'pending'. This aligns the database with the new application workflow for managing bookings.

## Query Description:
- **Safety:** This operation modifies an existing data type and updates rows in the `bookings` table. It's designed to be non-destructive for existing data by mapping 'active' to 'confirmed'.
- **Recommendation:** A backup is recommended before applying this migration, as it alters table structure and data.
- **Impact:** Existing bookings with 'active' status will be changed to 'confirmed'. New bookings will default to 'pending'. Applications interacting with this table will need to be updated to handle the new status values.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Type Modified:** `public.booking_status`
- **Table Affected:** `public.bookings`
  - **Column:** `status` (type and default value changed)

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: Requires database owner or superuser privileges to alter types and tables.

## Performance Impact:
- Indexes: Unchanged.
- Triggers: Unchanged.
- Estimated Impact: Low. The `UPDATE` statement may cause a brief table lock on the `bookings` table.
*/

-- Step 1: Add new values to the existing enum type.
-- This is done safely without dropping the type.
ALTER TYPE "public"."booking_status" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "public"."booking_status" ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE "public"."booking_status" ADD VALUE IF NOT EXISTS 'cancelled';

-- Step 2: Update existing 'active' bookings to 'confirmed'.
-- This migrates old data to the new, more descriptive status.
UPDATE "public"."bookings"
SET "status" = 'confirmed'
WHERE "status"::text = 'active';

-- Step 3: Change the default value for the status column to 'pending' for new bookings.
ALTER TABLE "public"."bookings" ALTER COLUMN "status" SET DEFAULT 'pending';
