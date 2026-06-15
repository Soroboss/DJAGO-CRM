CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email text)
RETURNS uuid AS $$
DECLARE
  found_id uuid;
BEGIN
  SELECT id INTO found_id FROM auth.users WHERE email = user_email;
  RETURN found_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
