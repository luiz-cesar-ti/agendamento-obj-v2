/*
# [FEATURE] Remove Hero Section
This migration removes all database components related to the "Hero Image" feature,
which is being deprecated. It deletes the `admin_settings` table. The associated
`hero-images` storage bucket is not being removed by this script to prevent errors
if the Storage API is not enabled. It can be manually removed from the Supabase dashboard if needed.

## Query Description:
- **DROP TABLE admin_settings:** This permanently deletes the table used to store the hero image URL. All data in this table will be lost. This is not reversible without a backup.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Table removed: `public.admin_settings`

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: Admin privileges required.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Low. Removes unused objects.
*/

-- Drop the admin_settings table if it exists
DROP TABLE IF EXISTS public.admin_settings;

-- The command to delete the storage bucket has been removed to prevent errors.
-- If the 'hero-images' bucket exists in your project, you can manually delete it
-- via the Supabase Dashboard under Storage > Buckets.
