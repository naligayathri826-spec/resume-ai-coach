CREATE OR REPLACE FUNCTION public.get_user_mode(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT user_mode FROM public.profiles WHERE id = _user_id $$;

CREATE OR REPLACE FUNCTION public.is_applicant_of_recruiter(_applicant uuid, _recruiter uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.job_applications a JOIN public.hiring_jobs j ON j.id = a.job_id
  WHERE a.user_id = _applicant AND j.user_id = _recruiter) $$;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Recruiters can view applicant profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_applicant_of_recruiter(id, auth.uid()));
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can view all jobs" ON public.hiring_jobs;
CREATE POLICY "Job seekers can view job postings" ON public.hiring_jobs FOR SELECT TO authenticated
  USING (public.get_user_mode(auth.uid()) = 'applying' OR public.has_role(auth.uid(), 'admin'));