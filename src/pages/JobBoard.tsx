import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, MapPin, DollarSign, Search, Building2,
  Clock, Users, Sparkles, ExternalLink, Filter
} from "lucide-react";
import Footer from "@/components/Footer";

interface PublicJob {
  id: string;
  job_title: string;
  company_name: string;
  industry: string | null;
  location: string | null;
  remote_allowed: boolean | null;
  seniority_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: string[];
  nice_to_have_skills: string[];
  education_requirements: string | null;
  created_at: string;
}

const JobBoard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<PublicJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredJobs(jobs.filter(j =>
        j.job_title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.industry?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        (j.required_skills as string[])?.some(s => s.toLowerCase().includes(q))
      ));
    }
  }, [searchQuery, jobs]);

  const fetchJobs = async () => {
    try {
      // Jobs are public for applying users to browse
      const { data, error } = await supabase
        .from("hiring_jobs")
        .select("id, job_title, company_name, industry, location, remote_allowed, seniority_level, salary_min, salary_max, required_skills, nice_to_have_skills, education_requirements, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs((data || []) as PublicJob[]);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
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
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                AI-Matched Opportunities
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Job Openings</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Browse available positions and find your perfect match. Upload your resume to see AI-powered compatibility scores.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, skill, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {filteredJobs.length} position{filteredJobs.length !== 1 ? "s" : ""} available
            </p>
          </motion.div>

          {filteredJobs.length === 0 ? (
            <Card className="shadow-large">
              <CardContent className="py-16 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No Matching Jobs Found</h2>
                <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-medium transition-smooth border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{job.job_title}</h3>
                              <p className="text-muted-foreground">{job.company_name}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                {job.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {job.location}
                                  </span>
                                )}
                                {job.remote_allowed && (
                                  <Badge variant="secondary" className="text-xs">Remote</Badge>
                                )}
                                {job.seniority_level && (
                                  <Badge variant="outline" className="text-xs capitalize">{job.seniority_level}</Badge>
                                )}
                                {formatSalary(job.salary_min, job.salary_max) && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> {formatSalary(job.salary_min, job.salary_max)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {timeAgo(job.created_at)}
                                </span>
                              </div>

                              {/* Skills */}
                              {(job.required_skills as string[])?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {(job.required_skills as string[]).slice(0, 6).map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                                  ))}
                                  {(job.required_skills as string[]).length > 6 && (
                                    <Badge variant="outline" className="text-xs">+{(job.required_skills as string[]).length - 6} more</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Button
                            onClick={() => navigate("/upload")}
                            className="gradient-primary"
                            size="sm"
                          >
                            Apply with Resume
                          </Button>
                          {job.education_requirements && (
                            <p className="text-xs text-muted-foreground">{job.education_requirements}</p>
                          )}
                        </div>
                      </div>
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

export default JobBoard;
