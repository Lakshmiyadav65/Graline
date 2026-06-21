-- Drop existing check constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_preferred_language_check;

-- Add updated check constraint with Kannada
ALTER TABLE public.profiles ADD CONSTRAINT profiles_preferred_language_check 
  CHECK (preferred_language IN ('English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'));
