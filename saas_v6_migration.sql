-- Migration to allow DGs and SuperAdmins to permanently delete users
CREATE OR REPLACE FUNCTION delete_user_by_id(user_to_delete uuid)
RETURNS boolean AS $$
DECLARE
  caller_org_id uuid;
  target_org_id uuid;
  caller_role text;
BEGIN
  -- Get caller's org and role
  SELECT organization_id, role INTO caller_org_id, caller_role 
  FROM public.team_members 
  WHERE id = auth.uid();

  -- Get target's org
  SELECT organization_id INTO target_org_id 
  FROM public.team_members 
  WHERE id = user_to_delete;

  -- Ensure target exists in team_members
  IF target_org_id IS NULL THEN
    -- If target is not in team_members, only superadmin can delete them directly from auth.users
    IF caller_role = 'superadmin' THEN
      DELETE FROM auth.users WHERE id = user_to_delete;
      RETURN true;
    ELSE
      RAISE EXCEPTION 'Utilisateur introuvable dans une organisation.';
    END IF;
  END IF;

  -- Check if caller is authorized:
  -- 1. Caller is superadmin
  -- OR
  -- 2. Caller is DG of the SAME organization
  IF caller_role = 'superadmin' OR (caller_role = 'dg' AND caller_org_id = target_org_id) THEN
    -- Delete from team_members
    DELETE FROM public.team_members WHERE id = user_to_delete;
    -- Delete from auth.users (this requires SECURITY DEFINER)
    DELETE FROM auth.users WHERE id = user_to_delete;
    RETURN true;
  ELSE
    RAISE EXCEPTION 'Non autorisé à supprimer cet utilisateur.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
