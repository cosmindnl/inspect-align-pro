-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Add signature_url column to engineers table
ALTER TABLE public.engineers 
ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- Storage policies for signatures bucket
CREATE POLICY "Engineers can upload own signature"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'signatures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Engineers can update own signature"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'signatures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Engineers can delete own signature"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'signatures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Signatures are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'signatures');