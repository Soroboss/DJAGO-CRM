CREATE POLICY "Allow authenticated users to insert team_members" ON team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update team_members" ON team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete team_members" ON team_members FOR DELETE TO authenticated USING (true);
