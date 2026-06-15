CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email text)
RETURNS uuid AS $$
DECLARE
  found_id uuid;
BEGIN
  -- On auto-confirme l'utilisateur directement pour qu'il n'ait pas besoin de taper un code reçu par e-mail
  UPDATE auth.users 
  SET email_confirmed_at = now(), confirmed_at = now() 
  WHERE email = user_email
  RETURNING id INTO found_id;
  
  RETURN found_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
