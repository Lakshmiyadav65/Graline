-- Allow users to insert their own farmer record during enrollment
CREATE POLICY "Users can insert own farmer record" ON public.farmers FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert village requests
CREATE POLICY "Authenticated users can insert villages" ON public.villages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
