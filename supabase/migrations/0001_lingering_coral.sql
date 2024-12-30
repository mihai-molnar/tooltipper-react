/*
  # Create tables for photo annotations

  1. New Tables
    - `photos`
      - `id` (uuid, primary key)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      - `short_id` (text, unique)
    - `tooltips`
      - `id` (uuid, primary key)
      - `photo_id` (uuid, references photos)
      - `x_position` (float)
      - `y_position` (float)
      - `text` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their photos
    - Add policies for anyone to view shared photos
*/

-- Create photos table
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  short_id text UNIQUE NOT NULL
);

-- Create tooltips table
CREATE TABLE tooltips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES photos ON DELETE CASCADE NOT NULL,
  x_position float NOT NULL,
  y_position float NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooltips ENABLE ROW LEVEL SECURITY;

-- Policies for photos
CREATE POLICY "Users can create their own photos"
  ON photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
  ON photos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view photos"
  ON photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view shared photos"
  ON photos FOR SELECT
  TO anon
  USING (true);

-- Policies for tooltips
CREATE POLICY "Users can manage tooltips for their photos"
  ON tooltips FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM photos
    WHERE photos.id = tooltips.photo_id
    AND photos.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view tooltips"
  ON tooltips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view shared tooltips"
  ON tooltips FOR SELECT
  TO anon
  USING (true);