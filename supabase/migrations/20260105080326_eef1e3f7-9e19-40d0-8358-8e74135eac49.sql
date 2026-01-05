-- Fix RLS recursion on public.profiles

-- Helper to get current user's company_id without referencing profiles inside RLS policies
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Replace the recursive policy with a non-recursive one
DROP POLICY IF EXISTS "Admins can view company profiles" ON public.profiles;

CREATE POLICY "Admins can view company profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  AND company_id = public.current_user_company_id()
);
