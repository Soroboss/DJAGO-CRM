-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id UUID;
  user_role public.user_role;
  org_name TEXT;
  ind_category TEXT;
BEGIN
  -- Extract metadata
  org_name := COALESCE(NEW.raw_user_meta_data->>'orgName', 'Default Company');
  ind_category := COALESCE(NEW.raw_user_meta_data->>'industryCategory', 'Services B2B');
  
  -- Insert into organizations and get the generated ID
  INSERT INTO public.organizations (name, industry_category)
  VALUES (org_name, ind_category)
  RETURNING id INTO new_org_id;

  -- Determine role
  -- Since 'superadmin' enum might not exist in public.user_role, we fallback safely.
  BEGIN
    IF NEW.email = 'soroboss.bossimpact@gmail.com' THEN
      user_role := 'superadmin'::public.user_role;
    ELSE
      user_role := 'dg'::public.user_role;
    END IF;

    INSERT INTO public.team_members (id, email, name, role, zone, organization_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      user_role,
      'Global',
      new_org_id
    );
  EXCEPTION WHEN invalid_text_representation THEN
    -- Fallback to 'dg' if 'superadmin' doesn't exist
    INSERT INTO public.team_members (id, email, name, role, zone, organization_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      'dg'::public.user_role,
      'Global',
      new_org_id
    );
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
