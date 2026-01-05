-- Actualizează funcția handle_new_user pentru a seta primul utilizator ca admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
  new_role app_role;
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
  
  -- Check if there are any existing admins
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  -- If no admins exist, make this user an admin; otherwise, make them an engineer
  IF admin_count = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := 'engineer';
  END IF;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, new_role);
  
  RETURN NEW;
END;
$$;