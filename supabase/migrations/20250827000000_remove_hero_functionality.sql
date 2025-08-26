/*
  # [Operation Name]
  Remove Hero Image Functionality

  ## Query Description:
  This script removes all database and storage components related to the "Hero Image" feature. It will delete the 'hero-images' storage bucket, which contains all uploaded hero images, and remove the corresponding setting from the configuration table. This action is irreversible and will result in the permanent loss of all hero images.

  ## Metadata:
  - Schema-Category: "Dangerous"
  - Impact-Level: "High"
  - Requires-Backup: true
  - Reversible: false

  ## Structure Details:
  - Storage Bucket Dropped: `hero-images`
  - Table Rows Deleted: `admin_settings` where `key` = 'hero_image'

  ## Security Implications:
  - RLS Status: Not Applicable
  - Policy Changes: No
  - Auth Requirements: Admin privileges required to execute.

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Low. The operation is a one-time cleanup.
*/

-- Step 1: Delete the hero image setting from the admin_settings table.
DELETE FROM public.admin_settings
WHERE key = 'hero_image';

-- Step 2: Drop the storage bucket for hero images.
-- Note: This action is destructive and will permanently delete all files in the bucket.
SELECT storage.delete_bucket('hero-images');
