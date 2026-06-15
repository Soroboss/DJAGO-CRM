DO $$
DECLARE
    new_org_id UUID;
    v_user_id UUID := 'd27513b2-a110-4bb3-aac3-a3f88d7b1233';
BEGIN
    -- Only insert if the user is not already in team_members
    IF NOT EXISTS (SELECT 1 FROM team_members WHERE id = v_user_id) THEN
        
        -- Insert a default organization for the superadmin
        INSERT INTO organizations (name, industry_category) 
        VALUES ('Boss Impact', 'services_b2b') 
        RETURNING id INTO new_org_id;

        -- Insert the team_member record
        INSERT INTO team_members (id, name, email, role, zone, organization_id)
        VALUES (
            v_user_id,
            'Soro Boss',
            'soroboss.bossimpact@gmail.com',
            'superadmin',
            'Global',
            new_org_id
        );
        
    END IF;
END $$;
