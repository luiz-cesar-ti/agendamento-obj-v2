/*
          # [Operation Name]
          Remove Hero Feature Components

          ## Query Description: [This operation removes the admin_settings table, which was used for the now-removed Hero image feature. This simplifies the database schema and removes unused components. No user data will be lost as this table only contained configuration settings.]

          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Tables Dropped: public.admin_settings
          
          ## Security Implications:
          - RLS Status: [N/A]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [Removed]
          - Triggers: [None]
          - Estimated Impact: [Negligible. Removes a small, unused table.]
          */

DROP TABLE IF EXISTS public.admin_settings;
