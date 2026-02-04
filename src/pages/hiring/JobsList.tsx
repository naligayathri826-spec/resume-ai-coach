import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, Plus, MapPin, Users, Calendar, 
  ChevronRight, Building2, Sparkles 
} from "lucide-react";
import Footer from "@/components/Footer";

interface Job {
  id: string;
  company_name: string;
  job_title: string;
  industry: string | null;
  location: string | null;
  remote_allowed: boolean;
  seniority_level: string | null;
  created_at: string;
  candidate_count?: number;
}

const JobsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from("hiring_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Get candidate counts for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count } = await supabase
            .from("candidates")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);
          return { ...job, candidate_count: count || 0 };
        })
      );

      setJobs(jobsWithCounts);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Your Job Postings
              </h1>
              <p className="text-muted-foreground">
                Manage your hiring campaigns and track candidates
              </p>
            </div>
            <Button 
              className="gradient-primary"
              onClick={() => navigate("/hiring/new")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Job
            </Button>
          </motion.div>

          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Start Hiring with AI</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first job posting and let our AI help you find the perfect candidates
                  </p>
                  <Button 
                    className="gradient-primary"
                    size="lg"
                    onClick={() => navigate("/hiring/new")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Job
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-large transition-all hover:scale-[1.02]"
                    onClick={() => navigate(`/hiring/dashboard/${job.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="secondary">
                          {job.candidate_count} candidates
                        </Badge>
                      </div>
                      <CardTitle className="mt-4">{job.job_title}</CardTitle>
                      <CardDescription>{job.company_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {job.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                          {job.remote_allowed && (
                            <Badge variant="outline" className="ml-2">Remote OK</Badge>
                          )}
                        </div>
                      )}
                      {job.seniority_level && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          {job.seniority_level}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Created {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      <Button variant="ghost" className="w-full mt-4 justify-between">
                        View Dashboard
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobsList;