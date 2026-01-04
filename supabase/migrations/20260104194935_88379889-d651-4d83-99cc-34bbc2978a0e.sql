-- Update the handle_new_user function to also create an engineer record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_profile_id uuid;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Create engineer record for the new user
  INSERT INTO public.engineers (profile_id, is_active)
  VALUES (NEW.id, true);
  
  -- Assign engineer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'engineer');
  
  RETURN NEW;
END;
$$;