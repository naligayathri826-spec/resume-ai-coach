import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, CheckCircle, AlertCircle, XCircle, Download, 
  ChevronDown, ChevronUp, Briefcase, Target, Star 
} from "lucide-react";
import Footer from "@/components/Footer";

interface Candidate {
  id: string;
  file_name: string;
  candidate_name: string | null;
  ai_score: number | null;
  skill_match_percentage: number | null;
  experience_match_percentage: number | null;
  fit_category: "strong_fit" | "medium_fit" | "reject" | null;
  ai_reasoning: string | null;
  parsed_skills: string[];
  created_at: string;
}

const RecruiterDashboard = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    if (!jobId) return;

    try {
      const [jobRes, candidatesRes] = await Promise.all([
        supabase.from("hiring_jobs").select("*").eq("id", jobId).single(),
        supabase.from("candidates").select("*").eq("job_id", jobId).order("ai_score", { ascending: false, nullsFirst: false })
      ]);

      if (jobRes.error) throw jobRes.error;
      if (candidatesRes.error) throw candidatesRes.error;

      setJob(jobRes.data);
      setCandidates(candidatesRes.data as Candidate[]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "strong_fit":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "medium_fit":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "reject":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryBadge = (category: string | null) => {
    switch (category) {
      case "strong_fit":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Strong Fit</Badge>;
      case "medium_fit":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Medium Fit</Badge>;
      case "reject":
        return <Badge variant="destructive">Reject</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "File", "Score", "Skill Match", "Fit Category", "AI Reasoning"];
    const rows = candidates.map(c => [
      c.candidate_name || "Unknown",
      c.file_name,
      c.ai_score?.toString() || "N/A",
      c.skill_match_percentage ? `${c.skill_match_percentage}%` : "N/A",
      c.fit_category || "Pending",
      c.ai_reasoning || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `candidates_${job?.job_title || "export"}.csv`;
    link.click();
  };

  const strongFit = candidates.filter(c => c.fit_category === "strong_fit");
  const mediumFit = candidates.filter(c => c.fit_category === "medium_fit");
  const rejected = candidates.filter(c => c.fit_category === "reject");
  const pending = candidates.filter(c => !c.fit_category);

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
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Candidate Rankings
                </h1>
                {job && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {job.job_title} at {job.company_name}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={() => navigate(`/hiring/candidates/${jobId}`)}>
                  Add More Candidates
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-600">{strongFit.length}</p>
                <p className="text-sm text-muted-foreground">Strong Fit</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold text-yellow-600">{mediumFit.length}</p>
                <p className="text-sm text-muted-foreground">Medium Fit</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-4 text-center">
                <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-red-600">{rejected.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </CardContent>
            </Card>
          </div>

          {/* Candidates Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="all">All ({candidates.length})</TabsTrigger>
              <TabsTrigger value="strong">Strong ({strongFit.length})</TabsTrigger>
              <TabsTrigger value="medium">Medium ({mediumFit.length})</TabsTrigger>
              <TabsTrigger value="reject">Reject ({rejected.length})</TabsTrigger>
            </TabsList>

            {["all", "strong", "medium", "reject"].map((tab) => {
              const filteredCandidates = tab === "all" 
                ? candidates 
                : tab === "strong" 
                ? strongFit 
                : tab === "medium" 
                ? mediumFit 
                : rejected;

              return (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {filteredCandidates.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No candidates in this category</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredCandidates.map((candidate, index) => (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="hover:shadow-medium transition-shadow">
                          <CardHeader 
                            className="cursor-pointer"
                            onClick={() => setExpandedCandidate(
                              expandedCandidate === candidate.id ? null : candidate.id
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                  {index + 1}
                                </div>
                                <div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {candidate.candidate_name || candidate.file_name}
                                    {index === 0 && candidate.fit_category === "strong_fit" && (
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                  </CardTitle>
                                  <CardDescription>{candidate.file_name}</CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {candidate.ai_score !== null && (
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">{candidate.ai_score}</p>
                                    <p className="text-xs text-muted-foreground">AI Score</p>
                                  </div>
                                )}
                                {getCategoryBadge(candidate.fit_category)}
                                {expandedCandidate === candidate.id ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          {expandedCandidate === candidate.id && (
                            <CardContent className="border-t pt-4 space-y-4">
                              {/* Match Percentages */}
                              <div className="grid md:grid-cols-2 gap-4">
                                {candidate.skill_match_percentage !== null && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Skill Match</span>
                                      <span className="font-medium">{candidate.skill_match_percentage}%</span>
                                    </div>
                                    <Progress value={candidate.skill_match_percentage} className="h-2" />
                                  </div>
                                )}
                                {candidate.experience_match_percentage !== null && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Experience Match</span>
                                      <span className="font-medium">{candidate.experience_match_percentage}%</span>
                                    </div>
                                    <Progress value={candidate.experience_match_percentage} className="h-2" />
                                  </div>
                                )}
                              </div>

                              {/* Skills */}
                              {candidate.parsed_skills && candidate.parsed_skills.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Skills</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(candidate.parsed_skills as string[]).slice(0, 10).map((skill, i) => (
                                      <Badge key={i} variant="secondary">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* AI Reasoning */}
                              {candidate.ai_reasoning && (
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-medium">AI Analysis</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {candidate.ai_reasoning}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;