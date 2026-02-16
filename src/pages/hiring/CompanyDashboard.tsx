import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, Users, CalendarDays, CheckCircle, Clock,
  TrendingUp, Plus, ArrowRight, Building2, Target,
  BarChart3, Star
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from "recharts";
import Footer from "@/components/Footer";

interface JobSummary {
  id: string;
  job_title: string;
  company_name: string;
  created_at: string;
  candidateCount: number;
  strongFitCount: number;
  interviewCount: number;
}

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [upcomingInterviews, setUpcomingInterviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: jobsData } = await supabase
        .from("hiring_jobs").select("id, job_title, company_name, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false });

      if (!jobsData || jobsData.length === 0) {
        setJobs([]);
        setIsLoading(false);
        return;
      }

      const jobIds = jobsData.map(j => j.id);

      const [candidatesRes, interviewsRes] = await Promise.all([
        supabase.from("candidates").select("id, job_id, fit_category").in("job_id", jobIds),
        supabase.from("interviews").select("id, job_id, status, scheduled_at").in("job_id", jobIds),
      ]);

      const candidates = candidatesRes.data || [];
      const interviews = interviewsRes.data || [];
      const now = new Date();

      const jobSummaries: JobSummary[] = jobsData.map(job => ({
        ...job,
        candidateCount: candidates.filter(c => c.job_id === job.id).length,
        strongFitCount: candidates.filter(c => c.job_id === job.id && c.fit_category === "strong_fit").length,
        interviewCount: interviews.filter(i => i.job_id === job.id).length,
      }));

      setJobs(jobSummaries);
      setTotalCandidates(candidates.length);
      setTotalInterviews(interviews.length);
      setUpcomingInterviews(interviews.filter(i => i.status === "scheduled" && new Date(i.scheduled_at) > now).length);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load dashboard", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const pipelineData = jobs.slice(0, 5).map(j => ({
    name: j.job_title.length > 15 ? j.job_title.slice(0, 15) + "…" : j.job_title,
    candidates: j.candidateCount,
    strongFit: j.strongFitCount,
  }));

  const COLORS = ["hsl(220, 90%, 56%)", "hsl(142, 71%, 45%)", "hsl(48, 96%, 53%)", "hsl(0, 84%, 60%)"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-primary" />
                  Company Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">Overview of your hiring pipeline</p>
              </div>
              <Button className="gradient-primary" onClick={() => navigate("/hiring/new")}>
                <Plus className="w-4 h-4 mr-2" /> Post New Job
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Briefcase, value: jobs.length, label: "Active Jobs", color: "text-primary" },
              { icon: Users, value: totalCandidates, label: "Total Candidates", color: "text-blue-500" },
              { icon: CalendarDays, value: upcomingInterviews, label: "Upcoming Interviews", color: "text-yellow-500" },
              { icon: CheckCircle, value: totalInterviews, label: "Total Interviews", color: "text-green-500" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {jobs.length === 0 ? (
            <Card className="shadow-large">
              <CardContent className="py-16 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">No Jobs Posted Yet</h2>
                <p className="text-muted-foreground mb-6">Create your first job posting to start receiving candidates</p>
                <Button className="gradient-primary" onClick={() => navigate("/hiring/new")}>
                  <Plus className="w-4 h-4 mr-2" /> Create First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Charts */}
              {pipelineData.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" /> Hiring Pipeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={pipelineData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                            <Bar dataKey="candidates" fill="hsl(220, 90%, 56%)" name="Candidates" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="strongFit" fill="hsl(142, 71%, 45%)" name="Strong Fit" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/hiring/dashboard/${job.id}`)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{job.job_title}</p>
                              <p className="text-xs text-muted-foreground">{job.company_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{job.candidateCount} candidates</Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Jobs List */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">All Job Postings</CardTitle>
                  <CardDescription>Manage your active job positions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jobs.map((job) => (
                    <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-soft transition-smooth">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{job.job_title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {job.candidateCount}</span>
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-green-500" /> {job.strongFitCount}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {job.interviewCount}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/hiring/dashboard/${job.id}`)}>
                            View <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyDashboard;
