-- Create update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add user_mode to profiles for tracking hiring vs applying
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_mode text DEFAULT NULL;

-- Create hiring_jobs table for recruiter job postings
CREATE TABLE IF NOT EXISTS public.hiring_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  industry text,
  job_title text NOT NULL,
  seniority_level text,
  required_skills jsonb DEFAULT '[]'::jsonb,
  nice_to_have_skills jsonb DEFAULT '[]'::jsonb,
  years_experience_min integer DEFAULT 0,
  years_experience_max integer,
  education_requirements text,
  location text,
  remote_allowed boolean DEFAULT false,
  salary_min integer,
  salary_max integer,
  cultural_priorities jsonb DEFAULT '[]'::jsonb,
  deal_breakers jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create candidates table for bulk resume uploads
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.hiring_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  resume_content text NOT NULL,
  file_name text NOT NULL,
  candidate_name text,
  candidate_email text,
  parsed_skills jsonb DEFAULT '[]'::jsonb,
  years_experience integer,
  education text,
  ai_score integer,
  skill_match_percentage integer,
  experience_match_percentage integer,
  fit_category text CHECK (fit_category IN ('strong_fit', 'medium_fit', 'reject')),
  ai_reasoning text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  analyzed_at timestamp with time zone
);

-- Enable RLS on hiring_jobs
ALTER TABLE public.hiring_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs" ON public.hiring_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own jobs" ON public.hiring_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON public.hiring_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jobs" ON public.hiring_jobs FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own candidates" ON public.candidates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own candidates" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own candidates" ON public.candidates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own candidates" ON public.candidates FOR DELETE USING (auth.uid() = user_id);

-- Add update trigger for hiring_jobs
CREATE TRIGGER update_hiring_jobs_updated_at
BEFORE UPDATE ON public.hiring_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policy for profiles update
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);