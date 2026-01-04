-- Fix security warnings: add search_path to functions

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(report_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.reports
  WHERE report_number LIKE 'BV-' || year_part || '-%';
  
  NEW.report_number := 'BV-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$;