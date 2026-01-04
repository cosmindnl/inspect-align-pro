-- Create storage bucket for equipment certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment-certificates', 'equipment-certificates', true);

-- Add column for certificate URL
ALTER TABLE public.equipment
ADD COLUMN certificate_url text;

-- Storage policies for equipment certificates
CREATE POLICY "Anyone can view equipment certificates"
ON storage.objects
FOR SELECT
USING (bucket_id = 'equipment-certificates');

CREATE POLICY "Authenticated users can upload equipment certificates"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'equipment-certificates' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update their equipment certificates"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'equipment-certificates' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete equipment certificates"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'equipment-certificates' 
  AND auth.uid() IS NOT NULL
);