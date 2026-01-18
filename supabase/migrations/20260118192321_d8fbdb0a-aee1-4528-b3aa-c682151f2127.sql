-- Fix the overly permissive INSERT policy on notifications table
-- This policy allows ANY user to insert notifications, which is a security risk

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more restrictive policy that allows:
-- 1. Users to create notifications for themselves (self-notifications)
-- 2. Notifications triggered by database functions (security definer functions)
CREATE POLICY "Users can create own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);