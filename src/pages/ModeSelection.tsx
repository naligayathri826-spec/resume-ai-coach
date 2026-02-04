import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, FileSearch, Users, Target, Sparkles, ArrowRight } from "lucide-react";

const ModeSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleModeSelect = async (mode: "hiring" | "applying") => {
    setSelectedMode(mode);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ user_mode: mode })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: mode === "hiring" ? "Hiring Mode Activated" : "Job Seeker Mode Activated",
        description: mode === "hiring" 
          ? "Let's find the perfect candidates for your team!" 
          : "Let's optimize your resume for success!",
      });

      navigate(mode === "hiring" ? "/hiring/jobs" : "/upload");
    } catch (error: any) {
      console.error("Mode selection error:", error);
      toast({
        title: "Error",
        description: "Failed to set your preference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background to-secondary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered HR Platform</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          How will you use{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            ResumeAI
          </span>
          ?
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Choose your path to unlock personalized features designed for your specific needs
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Hiring Mode Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-large hover:scale-[1.02] border-2 ${
              selectedMode === "hiring" ? "border-primary shadow-large" : "border-transparent"
            }`}
            onClick={() => !isLoading && handleModeSelect("hiring")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                <Users className="w-10 h-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">I'm Hiring</CardTitle>
              <CardDescription className="text-base">
                Find and evaluate top talent with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSearch className="w-4 h-4 text-primary" />
                  </div>
                  <span>Bulk resume screening & analysis</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <span>AI-powered candidate ranking</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <span>Custom job requirement matching</span>
                </div>
              </div>
              <Button 
                className="w-full gradient-primary" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading && selectedMode === "hiring" ? (
                  "Setting up..."
                ) : (
                  <>
                    Start Hiring <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applying Mode Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-large hover:scale-[1.02] border-2 ${
              selectedMode === "applying" ? "border-secondary shadow-large" : "border-transparent"
            }`}
            onClick={() => !isLoading && handleModeSelect("applying")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
                <FileSearch className="w-10 h-10 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl">I'm Applying</CardTitle>
              <CardDescription className="text-base">
                Optimize your resume for dream jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-secondary" />
                  </div>
                  <span>ATS compatibility scoring</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </div>
                  <span>AI improvement suggestions</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-secondary" />
                  </div>
                  <span>Industry-specific recommendations</span>
                </div>
              </div>
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading && selectedMode === "applying" ? (
                  "Setting up..."
                ) : (
                  <>
                    Optimize Resume <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground mt-8"
      >
        You can change this preference anytime from your profile settings
      </motion.p>
    </div>
  );
};

export default ModeSelection;