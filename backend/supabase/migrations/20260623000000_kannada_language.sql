-- Migration: Add Kannada to the preferred_language CHECK constraint
-- Grainline now supports Kannada as a preferred language option for farmers and customers.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_preferred_language_check;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_preferred_language_check 
  CHECK (preferred_language IN ('English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'));
