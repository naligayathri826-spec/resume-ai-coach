import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Briefcase, FileText, Clock, User, ChevronLeft } from "lucide-react";

type Application = {
  id: string;
  job_id: string;
  user_id: string;
  resume_id: string | null;
  status: string;
  cover_note: string | null;
  created_at: string;
  updated_at: string;
};

type Job = { id: string; job_title: string; company_name: string };
type Resume = { id: string; file_name: string; file_content: string };
type Profile = { id: string; email: string };

const statusOptions = [
  { value: "submitted", label: "Submitted", variant: "secondary" as const },
  { value: "reviewing", label: "Reviewing", variant: "default" as const },
  { value: "shortlisted", label: "Shortlisted", variant: "default" as const },
  { value: "interview", label: "Interview", variant: "default" as const },
  { value: "rejected", label: "Rejected", variant: "destructive" as const },
  { value: "hired", label: "Hired", variant: "default" as const },
];

function statusBadgeVariant(status: string) {
  const opt = statusOptions.find((o) => o.value === status);
  return opt?.variant ?? ("secondary" as const);
}

export default function ApplicationReview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Record<string, Resume>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data } = await supabase.from("hiring_jobs").select("id, job_title, company_name").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setJobs(data || []);
      if (data?.length) setSelectedJobId(data[0].id);
      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!selectedJobId) return;
    (async () => {
      setLoading(true);
      const { data: apps } = await supabase.from("job_applications").select("*").eq("job_id", selectedJobId).order("created_at", { ascending: false });
      setApplications(apps || []);

      // Fetch resumes
      const resumeIds = (apps || []).map((a) => a.resume_id).filter(Boolean) as string[];
      if (resumeIds.length) {
        const { data: r } = await supabase.from("resumes").select("id, file_name, file_content").in("id", resumeIds);
        const map: Record<string, Resume> = {};
        (r || []).forEach((res) => (map[res.id] = res));
        setResumes(map);
      }

      // Fetch candidate profiles
      const userIds = [...new Set((apps || []).map((a) => a.user_id))];
      if (userIds.length) {
        const { data: p } = await supabase.from("profiles").select("id, email").in("id", userIds);
        const pMap: Record<string, Profile> = {};
        (p || []).forEach((pr) => (pMap[pr.id] = pr));
        setProfiles(pMap);
      }
      setLoading(false);
    })();
  }, [selectedJobId]);

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    const { error } = await supabase.from("job_applications").update({ status: newStatus }).eq("id", appId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
      toast({ title: "Status Updated", description: `Application marked as ${newStatus}` });

      // Send email notification to candidate
      const app = applications.find((a) => a.id === appId);
      const job = jobs.find((j) => j.id === selectedJobId);
      const profile = app ? profiles[app.user_id] : null;
      if (profile && job) {
        supabase.functions.invoke("send-application-status-email", {
          body: {
            candidateEmail: profile.email,
            jobTitle: job.job_title,
            companyName: job.company_name,
            newStatus,
          },
        }).catch((e) => console.error("Email send error:", e));
      }
    }
    setUpdatingId(null);
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/hiring/jobs")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Application Review</h1>
          <p className="text-muted-foreground text-sm">Review and manage candidate applications</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedJobId || ""} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{j.job_title}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedJob && <Badge variant="outline">{applications.length} application{applications.length !== 1 ? "s" : ""}</Badge>}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : applications.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No applications yet for this job.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const profile = profiles[app.user_id];
            const resume = app.resume_id ? resumes[app.resume_id] : null;
            return (
              <Card key={app.id}>
                <CardContent className="flex flex-col md:flex-row md:items-center gap-4 py-5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{profile?.email || "Unknown"}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(app.created_at).toLocaleDateString()}
                        {app.cover_note && <span>• has cover note</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {resume && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />Resume</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader><DialogTitle>{resume.file_name}</DialogTitle></DialogHeader>
                          <ScrollArea className="h-[60vh]">
                            <pre className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-lg">{resume.file_content}</pre>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    )}

                    {app.cover_note && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Cover Note</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Cover Note</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.cover_note}</p>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)} disabled={updatingId === app.id}>
                      <SelectTrigger className="w-[140px]">
                        <Badge variant={statusBadgeVariant(app.status)} className="text-xs">
                          {statusOptions.find((o) => o.value === app.status)?.label || app.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
