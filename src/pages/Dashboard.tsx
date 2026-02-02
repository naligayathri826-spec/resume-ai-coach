import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthGracePeriod } from "@/hooks/useAuthGracePeriod";
import {
  Loader2,
  FileText,
  TrendingUp,
  Target,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { SkillBreakdown } from "@/components/dashboard/SkillBreakdown";
import { JobMatchWidget } from "@/components/dashboard/JobMatchWidget";

interface Skill {
  name: string;
  level: number;
}

interface JobMatch {
  company: string;
  position: string;
  match: number;
  location: string;
  salary: string;
}

interface AnalysisResult {
  id: string;
  analyzed_at: string;
  overall_score: number;
  field_category: string;
  skills?: Skill[];
  job_matches?: JobMatch[];
  resume: {
    file_name: string;
  };
}

const Dashboard = () => {
  useAuthGracePeriod();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchAnalyses();
    };

    checkAuth();
  }, [navigate]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("analysis_results")
        .select(
          `
          id,
          analyzed_at,
          overall_score,
          field_category,
          skills,
          job_matches,
          resume:resumes(file_name)
        `
        )
        .order("analyzed_at", { ascending: false });

      if (error) throw error;

      setAnalyses(data as any);

      setAnalyses(data as any);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      toast({
        title: "Error",
        description: "Failed to load your analysis history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewAnalysis = (id: string) => {
    navigate(`/results?analysisId=${id}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  // Analytics data
  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((acc, a) => acc + a.overall_score, 0) / analyses.length)
    : 0;

  const highestScore = analyses.length > 0
    ? Math.max(...analyses.map((a) => a.overall_score))
    : 0;

  const scoreData = analyses
    .slice(0, 10)
    .reverse()
    .map((a, i) => ({
      name: `#${i + 1}`,
      score: a.overall_score,
    }));

  const categoryData = analyses.reduce((acc: any[], a) => {
    const existing = acc.find((item) => item.name === a.field_category);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: a.field_category, value: 1 });
    }
    return acc;
  }, []);

  // Aggregate all skills across analyses
  const allSkills = analyses.reduce((acc: Skill[], a) => {
    if (a.skills && Array.isArray(a.skills)) {
      (a.skills as Skill[]).forEach((skill) => {
        const existing = acc.find((s) => s.name === skill.name);
        if (existing) {
          existing.level = Math.max(existing.level, skill.level);
        } else {
          acc.push({ ...skill });
        }
      });
    }
    return acc;
  }, []);

  // Aggregate all job matches
  const allJobMatches = analyses.reduce((acc: JobMatch[], a) => {
    if (a.job_matches && Array.isArray(a.job_matches)) {
      (a.job_matches as JobMatch[]).forEach((job) => {
        if (!acc.find((j) => j.position === job.position && j.company === job.company)) {
          acc.push(job);
        }
      });
    }
    return acc;
  }, []).slice(0, 5);

  // Weekly stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekAnalyses = analyses.filter(
    (a) => new Date(a.analyzed_at) >= oneWeekAgo
  );
  const lastWeekAnalyses = analyses.filter(
    (a) => new Date(a.analyzed_at) >= twoWeeksAgo && new Date(a.analyzed_at) < oneWeekAgo
  );

  const thisWeekAvg = thisWeekAnalyses.length > 0
    ? Math.round(thisWeekAnalyses.reduce((acc, a) => acc + a.overall_score, 0) / thisWeekAnalyses.length)
    : avgScore;
  const lastWeekAvg = lastWeekAnalyses.length > 0
    ? Math.round(lastWeekAnalyses.reduce((acc, a) => acc + a.overall_score, 0) / lastWeekAnalyses.length)
    : avgScore;

  const COLORS = ["hsl(220, 90%, 56%)", "hsl(220, 44%, 28%)", "hsl(220, 60%, 70%)", "hsl(220, 80%, 45%)"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Track your resume analysis progress</p>
          </div>
          <Button onClick={() => navigate("/upload")} className="gradient-primary">
            <FileText className="h-4 w-4 mr-2" /> Analyze New Resume
          </Button>
        </div>

        {analyses.length === 0 ? (
          <Card className="shadow-large">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Analyses Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload your first resume to get AI-powered analysis and start tracking your progress
              </p>
              <Button onClick={() => navigate("/upload")} className="gradient-primary">
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold">{analyses.length}</p>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Target className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <Award className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-500">{highestScore}</p>
                    <p className="text-sm text-muted-foreground">Highest Score</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{categoryData.length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Score Trend</CardTitle>
                    <CardDescription>Your resume scores over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={scoreData}>
                          <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis domain={[0, 100]} className="text-xs" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(220, 90%, 56%)"
                            fill="url(#scoreGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                    <CardDescription>Analysis by field category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {categoryData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* New Widgets Row */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <WeeklyProgress
                  currentWeekScore={thisWeekAvg}
                  previousWeekScore={lastWeekAvg}
                  weeklyGoal={85}
                  resumesThisWeek={thisWeekAnalyses.length}
                  weeklyTarget={3}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <SkillBreakdown skills={allSkills} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <JobMatchWidget jobs={allJobMatches} />
              </motion.div>
            </div>

            {/* Recent Analyses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Analyses</CardTitle>
                  <CardDescription>Your latest resume analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {analyses.slice(0, 6).map((analysis, index) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                      >
                        <Card
                          className="cursor-pointer hover:shadow-medium transition-smooth border-border"
                          onClick={() => viewAnalysis(analysis.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {analysis.resume?.file_name || "Resume"}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(analysis.analyzed_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(
                                  analysis.overall_score
                                )} ${getScoreColor(analysis.overall_score)}`}
                              >
                                {analysis.overall_score}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                {analysis.field_category}
                              </span>
                              <Button variant="ghost" size="sm" className="text-xs">
                                View <ArrowUpRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
