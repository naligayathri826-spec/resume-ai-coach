
-- Create job applications table for candidates to apply to jobs
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.hiring_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  cover_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own applications
CREATE POLICY "Users can view their own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Candidates can create applications
CREATE POLICY "Users can create their own applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Candidates can update their own applications
CREATE POLICY "Users can update their own applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Recruiters can view applications for their jobs
CREATE POLICY "Recruiters can view applications for their jobs"
  ON public.job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hiring_jobs
      WHERE hiring_jobs.id = job_applications.job_id
      AND hiring_jobs.user_id = auth.uid()
    )
  );

-- Recruiters can update application status for their jobs
CREATE POLICY "Recruiters can update applications for their jobs"
  ON public.job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.hiring_jobs
      WHERE hiring_jobs.id = job_applications.job_id
      AND hiring_jobs.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications on candidates and interviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interviews;
