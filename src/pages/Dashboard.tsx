import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuthGracePeriod } from "@/hooks/useAuthGracePeriod";
import { Loader2, FileText, TrendingUp } from "lucide-react";

interface AnalysisResult {
  id: string;
  analyzed_at: string;
  overall_score: number;
  field_category: string;
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      fetchAnalyses();
    };

    checkAuth();
  }, [navigate]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          id,
          analyzed_at,
          overall_score,
          field_category,
          resume:resumes(file_name)
        `)
        .order('analyzed_at', { ascending: false });

      if (error) throw error;

      setAnalyses(data as any);
    } catch (error) {
      console.error('Error fetching analyses:', error);
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Resume Analysis Dashboard</h1>
            <p className="text-muted-foreground">View all your resume analysis results</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : analyses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">No Analyses Yet</h2>
                <p className="text-muted-foreground mb-4">
                  Upload your first resume to get started with AI-powered analysis
                </p>
                <Button onClick={() => navigate('/upload')}>
                  Upload Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => viewAnalysis(analysis.id)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{analysis.resume?.file_name || 'Resume'}</span>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>
                      {new Date(analysis.analyzed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Field</p>
                        <p className="font-medium">{analysis.field_category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                          {analysis.overall_score}/100
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => viewAnalysis(analysis.id)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
