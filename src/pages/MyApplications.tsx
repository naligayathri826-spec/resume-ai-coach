import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Clock, Building2, MapPin, FileText, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

interface Application {
  id: string;
  status: string;
  cover_note: string | null;
  created_at: string;
  updated_at: string;
  job: {
    job_title: string;
    company_name: string;
    location: string | null;
    seniority_level: string | null;
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  submitted: { label: "Submitted", variant: "default" },
  reviewing: { label: "Under Review", variant: "secondary" },
  shortlisted: { label: "Shortlisted", variant: "default" },
  interview: { label: "Interview Stage", variant: "default" },
  rejected: { label: "Not Selected", variant: "destructive" },
  hired: { label: "Hired! 🎉", variant: "default" },
};

const MyApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchApplications();
    };
    checkAuth();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, status, cover_note, created_at, updated_at, job:hiring_jobs(job_title, company_name, location, seniority_level)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data || []) as unknown as Application[]);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("my-applications")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "job_applications" }, (payload) => {
        setApplications((prev) =>
          prev.map((app) => (app.id === payload.new.id ? { ...app, status: payload.new.status, updated_at: payload.new.updated_at } : app))
        );
        const config = statusConfig[payload.new.status] || { label: payload.new.status };
        toast({ title: "Application Updated", description: `Your application status changed to: ${config.label}` });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  };

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
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Applications</h1>
            <p className="text-muted-foreground">Track the status of your job applications</p>
          </motion.div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No Applications Yet</h2>
                <p className="text-muted-foreground mb-6">Browse available positions and submit your resume.</p>
                <Button onClick={() => navigate("/jobs")} className="gradient-primary">
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app, index) => {
                const sc = statusConfig[app.status] || { label: app.status, variant: "outline" as const };
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-medium transition-smooth">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{app.job?.job_title}</h3>
                              <p className="text-muted-foreground">{app.job?.company_name}</p>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                {app.job?.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {app.job.location}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Applied {timeAgo(app.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyApplications;
