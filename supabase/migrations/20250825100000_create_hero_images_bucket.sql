/*
          # [Operation] Create Storage Bucket for Hero Images
          [This script creates the necessary storage bucket for uploading hero images and sets the required access policies.]

          ## Query Description:
          - This operation is safe and will not affect existing data. It adds new storage functionality.
          - It creates a bucket named 'hero-images' and configures it for public read access, allowing anyone to view the uploaded images via their URL.
          - It also sets a policy to only allow authenticated users to upload new images, enhancing security.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Creates storage bucket: 'hero-images'
          - Creates policies on 'storage.objects' for this bucket.

          ## Security Implications:
          - RLS Status: N/A (Storage Policies)
          - Policy Changes: Yes (Adds policies for public read and authenticated insert)
          - Auth Requirements: Authenticated users for uploads.
          
          ## Performance Impact:
          - Indexes: N/A
          - Triggers: N/A
          - Estimated Impact: None on existing database performance.
          */

-- Create the storage bucket and make it public
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow public read access (SELECT) for everyone
CREATE POLICY "Public Read Access for Hero Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'hero-images' );

-- Create a policy to allow authenticated users to upload (INSERT)
CREATE POLICY "Authenticated Upload for Hero Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'hero-images' );
