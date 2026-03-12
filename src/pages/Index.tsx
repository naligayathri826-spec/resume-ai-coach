import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  Target,
  Sparkles,
  Building2,
  UserCheck,
  FileSearch,
  TrendingUp,
  Award,
  Globe,
  Layers,
  Bot,
  LineChart,
} from "lucide-react";
import Footer from "@/components/Footer";
import { useAuthGracePeriod } from "@/hooks/useAuthGracePeriod";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";
import featureAnalysis from "@/assets/feature-analysis.jpg";
import featureMatching from "@/assets/feature-matching.jpg";
import featureChatbot from "@/assets/feature-chatbot.jpg";
import featureReports from "@/assets/feature-reports.jpg";

const Index = () => {
  useAuthGracePeriod();

  const [liveStats, setLiveStats] = useState({
    resumesAnalyzed: 0,
    jobsPosted: 0,
    applicationsSubmitted: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [resumes, jobs, applications] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("hiring_jobs").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
      ]);
      setLiveStats({
        resumesAnalyzed: resumes.count || 0,
        jobsPosted: jobs.count || 0,
        applicationsSubmitted: applications.count || 0,
      });
    };
    fetchStats();
  }, []);

  const features = [
    {
      icon: FileSearch,
      title: "AI Resume Screening",
      description: "Upload your resume and get an instant AI-powered ATS score with actionable improvement tips.",
      image: featureAnalysis,
    },
    {
      icon: UserCheck,
      title: "Smart Job Matching",
      description: "AI analyzes your skills and experience to recommend positions that truly fit your profile.",
      image: featureMatching,
    },
    {
      icon: Bot,
      title: "AI Career Coach",
      description: "Chat with an AI assistant for personalized career advice, interview prep, and resume tips.",
      image: featureChatbot,
    },
    {
      icon: LineChart,
      title: "Analytics Dashboard",
      description: "Track your resume improvement over time with score trends, skill breakdowns, and progress goals.",
      image: featureReports,
    },
  ];

  const stats = [
    { value: liveStats.resumesAnalyzed.toString(), label: "Resumes Analyzed" },
    { value: liveStats.jobsPosted.toString(), label: "Jobs Posted" },
    { value: liveStats.applicationsSubmitted.toString(), label: "Applications Sent" },
    { value: "100%", label: "Free to Start" },
  ];

  const howItWorks = [
    { step: 1, title: "Upload Resume", description: "Upload your PDF or DOCX resume for instant AI analysis", icon: Layers },
    { step: 2, title: "Get AI Analysis", description: "Receive a detailed score, strengths, weaknesses, and improvement tips", icon: Bot },
    { step: 3, title: "Browse & Apply", description: "Find matching jobs on the Job Board and apply with one click", icon: TrendingUp },
    { step: 4, title: "Track Progress", description: "Monitor your applications and improve your resume score over time", icon: Award },
  ];

  const platformFeatures = [
    { icon: Building2, title: "Hiring Mode", desc: "Post jobs, upload candidates, and rank them with AI" },
    { icon: Globe, title: "Job Board", desc: "Browse real openings and apply directly from the platform" },
    { icon: Shield, title: "Secure & Private", desc: "Your data is protected with row-level security" },
    { icon: Zap, title: "Real-Time Updates", desc: "Get instant notifications when your application status changes" },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-36">
        <div className="absolute inset-0 gradient-hero opacity-5 -z-10" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Sparkles className="h-4 w-4" />
                AI-Powered Resume Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Analyze, Improve &{" "}
                <span className="text-transparent bg-clip-text gradient-primary">
                  Land Your Dream Job
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Upload your resume for an instant AI-powered analysis. Get your ATS score, skill gaps, and personalized improvement tips — then apply to matching jobs directly from the platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="gradient-primary shadow-large hover:shadow-medium transition-smooth text-lg px-8 py-6">
                  <Link to="/auth">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                  <Link to="/jobs">Browse Jobs</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Free resume analysis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Apply to real jobs
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 gradient-primary opacity-20 blur-3xl rounded-3xl" />
              <img
                src={heroImage}
                alt="AI Resume Analysis Dashboard"
                className="relative rounded-2xl shadow-large w-full border border-border"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground mb-8">Platform activity — live numbers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From upload to hired in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center relative"
              >
                <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-medium">
                  <item.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[65%] w-[70%] h-0.5 bg-border" />
                )}
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to land your next role — or find your next hire
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full shadow-soft hover:shadow-large transition-smooth border-border bg-card group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="gradient-hero text-primary-foreground shadow-large overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <CardContent className="p-12 md:p-20 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Ready to Supercharge Your Job Search?
                </h2>
                <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                  Upload your resume, get an AI-powered analysis, and start applying to matching jobs — all for free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="shadow-medium text-lg px-10 py-6">
                    <Link to="/auth">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg px-10 py-6 bg-transparent border-white/30 text-white hover:bg-white/10">
                    <Link to="/jobs">
                      Browse Jobs
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
