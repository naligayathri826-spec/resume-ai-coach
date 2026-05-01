import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, MessageSquare, TrendingUp } from "lucide-react";
import Footer from "@/components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthGracePeriod } from "@/hooks/useAuthGracePeriod";
import { SocialShare } from "@/components/SocialShare";

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

interface AnalysisData {
  field_category: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggested_changes: string[];
  skills: Skill[];
  job_matches: JobMatch[];
  improvement_tips: string[];
}

const Results = () => {
  useAuthGracePeriod();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const analysisId = searchParams.get('analysisId');
      
      if (!analysisId) {
        toast({
          title: "No Analysis Found",
          description: "Please upload a resume first.",
          variant: "destructive",
        });
        navigate('/upload');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('id', analysisId)
          .single();

        if (error) throw error;

        setAnalysisData({
          field_category: data.field_category,
          overall_score: data.overall_score,
          strengths: data.strengths as unknown as string[],
          weaknesses: data.weaknesses as unknown as string[],
          suggested_changes: data.suggested_changes as unknown as string[],
          skills: data.skills as unknown as Skill[],
          job_matches: data.job_matches as unknown as JobMatch[],
          improvement_tips: data.improvement_tips as unknown as string[],
        });
      } catch (error: any) {
        console.error('Error fetching analysis:', error);
        toast({
          title: "Error Loading Results",
          description: "Failed to load analysis results. Please try again.",
          variant: "destructive",
        });
        navigate('/upload');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analysis results...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Resume Analysis Results
            </h1>
            <p className="text-lg text-muted-foreground">
              Field: <Badge variant="secondary" className="ml-2">{analysisData.field_category}</Badge>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-soft animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{analysisData.overall_score}%</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{analysisData.skills.length}</div>
                <p className="text-sm text-muted-foreground">Skills Detected</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">{analysisData.job_matches.length}</div>
                <p className="text-sm text-muted-foreground">Job Matches</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Strengths - What's Good */}
            <Card className="shadow-medium animate-fade-in-up border-green-200 dark:border-green-900">
              <CardHeader className="bg-green-50 dark:bg-green-950">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  What's Good About Your Resume
                </CardTitle>
                <CardDescription>
                  Strengths and positive aspects identified by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {analysisData.strengths.map((strength, index) => (
                    <li key={index} className="flex gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/50">
                      <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses - What's Not Good */}
            <Card className="shadow-medium animate-fade-in-up border-red-200 dark:border-red-900" style={{ animationDelay: "0.1s" }}>
              <CardHeader className="bg-red-50 dark:bg-red-950">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Areas That Need Improvement
                </CardTitle>
                <CardDescription>
                  Weaknesses and aspects to work on
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {analysisData.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/50">
                      <span className="text-red-600 dark:text-red-400 flex-shrink-0">!</span>
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Suggested Changes */}
            <Card className="lg:col-span-2 shadow-medium animate-fade-in-up border-blue-200 dark:border-blue-900" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="bg-blue-50 dark:bg-blue-950">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Suggested Changes to Make
                </CardTitle>
                <CardDescription>
                  Detailed, actionable changes to improve your resume
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {analysisData.suggested_changes.map((change, index) => (
                    <li key={index} className="flex gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">{index + 1}.</span>
                      <span className="text-sm">{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Job Matches */}
            <Card className="shadow-medium animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  Top Job Matches
                </CardTitle>
                <CardDescription>
                  Positions that best match your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisData.job_matches.map((job, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-soft transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{job.position}</h4>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge variant="secondary">{job.match}% Match</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">{job.location}</p>
                      <p className="font-medium text-primary">{job.salary}</p>
                    </div>
                    <Button className="w-full mt-3" size="sm">
                      Apply Now
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement Tips */}
            <Card className="lg:col-span-2 shadow-medium animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-accent" />
                  Resume Improvement Tips
                </CardTitle>
                <CardDescription>
                  AI-powered suggestions to enhance your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisData.improvement_tips.map((tip, index) => (
                    <li key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold text-primary flex-shrink-0">{index + 1}.</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="shadow-medium gradient-primary">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button size="lg" variant="outline" className="shadow-medium" onClick={() => navigate("/chatbot")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Get AI Advice
            </Button>
            <SocialShare 
              score={analysisData.overall_score} 
              category={analysisData.field_category}
              title="My Resume Analysis Results"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
