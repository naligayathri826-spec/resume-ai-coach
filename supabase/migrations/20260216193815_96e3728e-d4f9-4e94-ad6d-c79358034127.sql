-- Allow all authenticated users to view job listings (for the job board)
CREATE POLICY "Authenticated users can view all jobs"
ON public.hiring_jobs
FOR SELECT
TO authenticated
USING (true);
