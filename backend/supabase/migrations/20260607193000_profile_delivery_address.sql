-- Add delivery_address JSONB column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS delivery_address JSONB;

-- Ensure the listing-images storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket 'listing-images'
CREATE POLICY "Allow public read access to listing images" 
  ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Allow authenticated farmers to upload listing images" 
  ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'listing-images');
