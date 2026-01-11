-- Adăugare câmpuri pentru configurarea formatului ID raport în companies
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS report_prefix TEXT DEFAULT 'BV',
ADD COLUMN IF NOT EXISTS report_year_format TEXT DEFAULT 'YYYY',
ADD COLUMN IF NOT EXISTS report_sequence_digits INTEGER DEFAULT 4;

-- Actualizare funcție generate_report_number pentru a folosi configurația din companies
CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  company_prefix TEXT;
  company_year_format TEXT;
  company_sequence_digits INTEGER;
  site_client_company_id UUID;
BEGIN
  -- Obține company_id din site -> client -> company
  SELECT c.company_id INTO site_client_company_id
  FROM public.sites s
  JOIN public.clients c ON s.client_id = c.id
  WHERE s.id = NEW.site_id;
  
  -- Obține configurația din companies
  SELECT 
    COALESCE(report_prefix, 'BV'),
    COALESCE(report_year_format, 'YYYY'),
    COALESCE(report_sequence_digits, 4)
  INTO company_prefix, company_year_format, company_sequence_digits
  FROM public.companies
  WHERE id = site_client_company_id;
  
  -- Fallback dacă nu găsește compania
  IF company_prefix IS NULL THEN
    company_prefix := 'BV';
    company_year_format := 'YYYY';
    company_sequence_digits := 4;
  END IF;
  
  -- Generează partea de an conform formatului
  IF company_year_format = 'YY' THEN
    year_part := TO_CHAR(CURRENT_DATE, 'YY');
  ELSE
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  END IF;
  
  -- Calculează următorul număr de secvență pentru prefixul și anul curent
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(report_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.reports
  WHERE report_number LIKE company_prefix || '-' || year_part || '-%';
  
  -- Generează numărul de raport cu padding-ul corect
  NEW.report_number := company_prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, company_sequence_digits, '0');
  
  RETURN NEW;
END;
$function$;