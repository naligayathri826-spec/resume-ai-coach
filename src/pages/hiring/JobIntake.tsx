import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, Briefcase, GraduationCap, MapPin, DollarSign, 
  Users, Target, X, Plus, ArrowRight, Sparkles 
} from "lucide-react";
import Footer from "@/components/Footer";

const JobIntake = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    job_title: "",
    seniority_level: "",
    required_skills: [] as string[],
    nice_to_have_skills: [] as string[],
    years_experience_min: 0,
    years_experience_max: 10,
    education_requirements: "",
    location: "",
    remote_allowed: false,
    salary_min: 0,
    salary_max: 0,
    cultural_priorities: [] as string[],
    deal_breakers: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");
  const [niceToHaveInput, setNiceToHaveInput] = useState("");
  const [culturalInput, setCulturalInput] = useState("");
  const [dealBreakerInput, setDealBreakerInput] = useState("");

  const addToArray = (field: keyof typeof formData, value: string, setValue: (s: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setValue("");
    }
  };

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("hiring_jobs")
        .insert({
          user_id: user.id,
          ...formData,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Job Created!",
        description: "Now let's upload some candidate resumes.",
      });

      navigate(`/hiring/candidates/${data.id}`);
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create job posting",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI Recruiter Assistant</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Define Your Ideal Candidate
            </h1>
            <p className="text-muted-foreground">
              Tell us about the role and we'll help you find the perfect match
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s === step
                    ? "gradient-primary text-primary-foreground"
                    : s < step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {/* Step 1: Company & Role */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company & Role Details
                  </CardTitle>
                  <CardDescription>
                    Basic information about the position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input
                        placeholder="e.g., Acme Corp"
                        value={formData.company_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input
                        placeholder="e.g., Technology, Healthcare"
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.job_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Seniority Level</Label>
                      <Input
                        placeholder="e.g., Senior, Lead, Manager"
                        value={formData.seniority_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, seniority_level: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </Label>
                      <Input
                        placeholder="e.g., Bangalore, India"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Remote Work</Label>
                      <div className="flex items-center gap-3 h-10">
                        <Switch
                          checked={formData.remote_allowed}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, remote_allowed: checked }))}
                        />
                        <span className="text-sm text-muted-foreground">
                          {formData.remote_allowed ? "Remote allowed" : "On-site only"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gradient-primary"
                    onClick={() => setStep(2)}
                    disabled={!formData.company_name || !formData.job_title}
                  >
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Requirements */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Skills & Requirements
                  </CardTitle>
                  <CardDescription>
                    Define the skills and qualifications needed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Required Skills */}
                  <div className="space-y-2">
                    <Label>Required Skills (Must-Have)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., React, Node.js, TypeScript"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addToArray("required_skills", skillInput, setSkillInput)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addToArray("required_skills", skillInput, setSkillInput)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.required_skills.map((skill, i) => (
                        <Badge key={i} variant="default" className="pr-1">
                          {skill}
                          <button
                            onClick={() => removeFromArray("required_skills", i)}
                            className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Nice to Have Skills */}
                  <div className="space-y-2">
                    <Label>Nice-to-Have Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., AWS, GraphQL, Docker"
                        value={niceToHaveInput}
                        onChange={(e) => setNiceToHaveInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addToArray("nice_to_have_skills", niceToHaveInput, setNiceToHaveInput)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addToArray("nice_to_have_skills", niceToHaveInput, setNiceToHaveInput)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.nice_to_have_skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                          <button
                            onClick={() => removeFromArray("nice_to_have_skills", i)}
                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min Years Experience</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.years_experience_min}
                        onChange={(e) => setFormData(prev => ({ ...prev, years_experience_min: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Years Experience</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.years_experience_max}
                        onChange={(e) => setFormData(prev => ({ ...prev, years_experience_max: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Education Requirements
                    </Label>
                    <Textarea
                      placeholder="e.g., Bachelor's in Computer Science or equivalent experience"
                      value={formData.education_requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, education_requirements: e.target.value }))}
                    />
                  </div>

                  {/* Salary */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Min Salary (₹/year)
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g., 1000000"
                        value={formData.salary_min || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary_min: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Salary (₹/year)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 2000000"
                        value={formData.salary_max || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary_max: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button className="flex-1 gradient-primary" onClick={() => setStep(3)}>
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Culture & Deal Breakers */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Culture & Preferences
                  </CardTitle>
                  <CardDescription>
                    Help us understand what makes a great fit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cultural Priorities */}
                  <div className="space-y-2">
                    <Label>Cultural Priorities</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Team collaboration, Innovation, Work-life balance"
                        value={culturalInput}
                        onChange={(e) => setCulturalInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addToArray("cultural_priorities", culturalInput, setCulturalInput)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addToArray("cultural_priorities", culturalInput, setCulturalInput)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.cultural_priorities.map((item, i) => (
                        <Badge key={i} variant="secondary">
                          {item}
                          <button
                            onClick={() => removeFromArray("cultural_priorities", i)}
                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Deal Breakers */}
                  <div className="space-y-2">
                    <Label>Deal Breakers</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., No remote work, Frequent job hopping"
                        value={dealBreakerInput}
                        onChange={(e) => setDealBreakerInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addToArray("deal_breakers", dealBreakerInput, setDealBreakerInput)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addToArray("deal_breakers", dealBreakerInput, setDealBreakerInput)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.deal_breakers.map((item, i) => (
                        <Badge key={i} variant="destructive">
                          {item}
                          <button
                            onClick={() => removeFromArray("deal_breakers", i)}
                            className="ml-1 hover:bg-destructive-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      className="flex-1 gradient-primary" 
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Job & Upload Resumes"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobIntake;