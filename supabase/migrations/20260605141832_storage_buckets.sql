-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('farmer-images', 'farmer-images', true),
('listing-images', 'listing-images', true),
('village-images', 'village-images', true);

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for farmer-images
CREATE POLICY "Public Access for farmer-images" ON storage.objects FOR SELECT USING (bucket_id = 'farmer-images');
CREATE POLICY "Authenticated users can upload farmer-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'farmer-images');
CREATE POLICY "Users can update their own farmer-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'farmer-images' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own farmer-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'farmer-images' AND auth.uid() = owner);

-- Policies for listing-images
CREATE POLICY "Public Access for listing-images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Authenticated users can upload listing-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images');
CREATE POLICY "Users can update their own listing-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listing-images' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own listing-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-images' AND auth.uid() = owner);

-- Policies for village-images
CREATE POLICY "Public Access for village-images" ON storage.objects FOR SELECT USING (bucket_id = 'village-images');
CREATE POLICY "Authenticated users can upload village-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'village-images');
