-- Add subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'light')),
ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired')),
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription queries
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier, subscription_status);

-- Create a function to check upload limit
CREATE OR REPLACE FUNCTION public.check_upload_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  upload_count INTEGER;
  user_subscription TEXT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_subscription
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Count user's resumes
  SELECT COUNT(*) INTO upload_count
  FROM public.resumes
  WHERE user_id = user_id_param;
  
  RETURN upload_count;
END;
$$;