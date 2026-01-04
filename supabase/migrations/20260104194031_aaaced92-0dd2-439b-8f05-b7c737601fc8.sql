-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true);

-- Allow authenticated users to upload their company logo
CREATE POLICY "Users can upload company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies WHERE id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Allow authenticated users to update their company logo
CREATE POLICY "Users can update company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies WHERE id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Allow authenticated users to delete their company logo
CREATE POLICY "Users can delete company logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies WHERE id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Allow public read access to company logos
CREATE POLICY "Public can view company logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow users to update their own company (add this policy)
CREATE POLICY "Users can update own company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
)
WITH CHECK (
  id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);