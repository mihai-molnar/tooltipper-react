/*
  # Storage and Policy Updates
  
  1. Storage Policies
    - Add storage bucket policies for photos
    - Update RLS policies for unauthenticated access
  
  2. Table Updates
    - Make user_id nullable in photos table
    - Add policies for anonymous uploads
*/

-- Update photos table to allow anonymous uploads
ALTER TABLE photos ALTER COLUMN user_id DROP NOT NULL;

-- Update photos policies
DROP POLICY IF EXISTS "Anyone can view photos" ON photos;
DROP POLICY IF EXISTS "Public can view shared photos" ON photos;
DROP POLICY IF EXISTS "Users can create their own photos" ON photos;

CREATE POLICY "Enable read access for all users" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON photos
  FOR INSERT WITH CHECK (true);

-- Storage policies
BEGIN;
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('photos', 'photos', true)
  ON CONFLICT (id) DO NOTHING;

  -- Allow public access to photos bucket
  CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');

  -- Allow anyone to upload photos
  CREATE POLICY "Anyone can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'photos');
COMMIT;