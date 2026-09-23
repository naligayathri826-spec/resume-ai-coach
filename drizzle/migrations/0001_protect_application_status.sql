CREATE OR REPLACE FUNCTION public.protect_application_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_owner boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF; -- server/service context
  SELECT EXISTS (SELECT 1 FROM public.hiring_jobs j WHERE j.id = NEW.job_id AND j.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin') INTO is_owner;
  IF TG_OP = 'INSERT' THEN
    IF NOT is_owner THEN NEW.status := 'submitted'; END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NOT is_owner THEN
    RAISE EXCEPTION 'Only the recruiter for this job can change the application status';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.job_id IS DISTINCT FROM OLD.job_id THEN
    RAISE EXCEPTION 'Cannot move an application to another job';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_application_status ON public.job_applications;
CREATE TRIGGER protect_application_status
BEFORE INSERT OR UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.protect_application_status();

DROP POLICY IF EXISTS "Users can update their own applications" ON public.job_applications;
CREATE POLICY "Users can update their own applications" ON public.job_applications
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);