-- Create equipment table
CREATE TABLE public.equipment (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  manufacturer text,
  model text,
  serial_number text,
  verification_valid_until date,
  verification_certificate_number text,
  category text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- RLS policy: Company members can view equipment
CREATE POLICY "Company members can view equipment"
ON public.equipment
FOR SELECT
USING (
  company_id IN (
    SELECT profiles.company_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- RLS policy: Engineers can manage equipment
CREATE POLICY "Engineers can manage equipment"
ON public.equipment
FOR ALL
USING (
  has_role(auth.uid(), 'engineer'::app_role) AND
  company_id IN (
    SELECT profiles.company_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();