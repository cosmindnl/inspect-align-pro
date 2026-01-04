-- Politică pentru a permite adminilor să vadă profilurile din companie
CREATE POLICY "Admins can view company profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);