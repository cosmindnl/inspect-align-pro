-- Create table for notification logs
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'equipment_expiry',
  recipients TEXT[] NOT NULL,
  equipment_count INTEGER NOT NULL DEFAULT 0,
  equipment_ids UUID[] NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_notification_logs_company ON public.notification_logs(company_id);
CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs(sent_at DESC);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view notification logs for their company
CREATE POLICY "Admins can view notification logs"
ON public.notification_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IN (
    SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()
  )
);

-- Add comment
COMMENT ON TABLE public.notification_logs IS 'Logs for automated email notifications';