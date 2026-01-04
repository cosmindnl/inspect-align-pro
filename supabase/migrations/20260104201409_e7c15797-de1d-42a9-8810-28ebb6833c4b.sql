-- Add RLS policy for engineers to view audit logs for their reports
CREATE POLICY "Engineers can view audit logs for their reports"
ON public.audit_logs
FOR SELECT
USING (
  table_name = 'reports' 
  AND record_id IN (
    SELECT r.id 
    FROM reports r
    WHERE r.engineer_id IN (
      SELECT engineers.id 
      FROM engineers 
      WHERE engineers.profile_id = auth.uid()
    )
  )
);

-- Add policy for inserting audit logs
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);