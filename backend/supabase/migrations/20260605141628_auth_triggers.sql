-- Create a function to automatically create a profile for every new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, role, full_name)
  VALUES (
    new.id,
    new.phone,
    -- We can pass 'role' in the user metadata during sign up. Defaults to 'customer' if not provided.
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  
  -- If the role is farmer, also initialize an empty farmer record
  IF COALESCE((new.raw_user_meta_data->>'role')::text, 'customer') = 'farmer' THEN
    INSERT INTO public.farmers (id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
