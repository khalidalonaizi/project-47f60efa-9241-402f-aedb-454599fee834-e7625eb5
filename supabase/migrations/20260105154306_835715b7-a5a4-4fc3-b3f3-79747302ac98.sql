-- Add notifications table for real-time alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'price_alert',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to check price alerts and create notifications
CREATE OR REPLACE FUNCTION public.check_price_alerts_on_property()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for approved properties
  IF NEW.is_approved = true THEN
    INSERT INTO public.notifications (user_id, type, title, message, property_id)
    SELECT 
      pa.user_id,
      'price_alert',
      'عقار جديد يطابق تنبيهك!',
      'تم إضافة عقار جديد في ' || NEW.city || ' بسعر ' || NEW.price || ' ر.س',
      NEW.id
    FROM public.price_alerts pa
    WHERE pa.is_active = true
      AND pa.city = NEW.city
      AND NEW.price <= pa.max_price
      AND (pa.property_type IS NULL OR pa.property_type = NEW.property_type)
      AND pa.user_id != NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new properties
CREATE TRIGGER on_property_approved
  AFTER INSERT OR UPDATE OF is_approved ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.check_price_alerts_on_property();

-- Add bio column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;