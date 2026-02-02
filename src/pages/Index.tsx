import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Search,
  Briefcase,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Star,
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
import heroImage from "@/assets/hero-image.jpg";
import featureAnalysis from "@/assets/feature-analysis.jpg";
import featureMatching from "@/assets/feature-matching.jpg";
import featureChatbot from "@/assets/feature-chatbot.jpg";
import featureReports from "@/assets/feature-reports.jpg";

const Index = () => {
  useAuthGracePeriod();

  const features = [
    {
      icon: FileSearch,
      title: "AI Resume Screening",
      description: "Instantly analyze and score resumes with advanced AI that identifies top candidates in seconds.",
      image: featureAnalysis,
    },
    {
      icon: UserCheck,
      title: "Talent Matching",
      description: "Match candidates to roles with 95%+ accuracy using intelligent skill mapping.",
      image: featureMatching,
    },
    {
      icon: Bot,
      title: "AI Recruitment Assistant",
      description: "24/7 AI assistant handles candidate queries, interview scheduling, and follow-ups.",
      image: featureChatbot,
    },
    {
      icon: LineChart,
      title: "Analytics Dashboard",
      description: "Real-time insights into your hiring pipeline with predictive analytics.",
      image: featureReports,
    },
  ];

  const stats = [
    { value: "500K+", label: "Resumes Processed" },
    { value: "98%", label: "Accuracy Rate" },
    { value: "75%", label: "Time Saved" },
    { value: "10K+", label: "Companies Trust Us" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Talent, TechCorp",
      content: "ResumeAI reduced our time-to-hire by 60%. The AI screening is incredibly accurate and saves our team hours every day.",
      avatar: "SC",
      company: "TechCorp",
    },
    {
      name: "Michael Roberts",
      role: "Head of HR, FinanceHub",
      content: "We went from reviewing 500 resumes manually to having AI-curated shortlists in minutes. Game-changing technology.",
      avatar: "MR",
      company: "FinanceHub",
    },
    {
      name: "Emily Watson",
      role: "Talent Director, StartupXYZ",
      content: "The talent matching accuracy is phenomenal. We've made 3x more successful hires since implementing ResumeAI.",
      avatar: "EW",
      company: "StartupXYZ",
    },
  ];

  const howItWorks = [
    { step: 1, title: "Upload Resumes", description: "Bulk upload or integrate with your ATS for seamless resume collection", icon: Layers },
    { step: 2, title: "AI Analysis", description: "Our AI evaluates skills, experience, and cultural fit instantly", icon: Bot },
    { step: 3, title: "Smart Ranking", description: "Get ranked candidate lists with match scores and insights", icon: TrendingUp },
    { step: 4, title: "Hire Faster", description: "Make data-driven hiring decisions and onboard top talent", icon: Award },
  ];

  const enterpriseFeatures = [
    { icon: Building2, title: "Enterprise Ready", desc: "SOC 2 compliant, SSO, and custom integrations" },
    { icon: Globe, title: "Global Hiring", desc: "Multi-language support for international recruitment" },
    { icon: Shield, title: "Bias-Free Screening", desc: "AI trained to eliminate unconscious bias" },
    { icon: Zap, title: "Real-Time Sync", desc: "Instant updates across all connected platforms" },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Enterprise Focus */}
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
                AI-Powered HR Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                The Future of{" "}
                <span className="text-transparent bg-clip-text gradient-primary">
                  Talent Acquisition
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Replace manual HR processes with intelligent automation. Screen thousands of resumes in seconds, match candidates with precision, and hire the best talent faster than ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="gradient-primary shadow-large hover:shadow-medium transition-smooth text-lg px-8 py-6">
                  <Link to="/auth">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                  <Link to="/chatbot">Talk to AI Assistant</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Cancel anytime
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
              {/* Floating Cards */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-large border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Match Score</p>
                    <p className="text-2xl font-bold text-green-500">94%</p>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -top-4 -right-4 bg-card p-4 rounded-xl shadow-large border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">1,247 Resumes</p>
                    <p className="text-xs text-muted-foreground">Processed today</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Logos / Stats */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground mb-8">Trusted by leading companies worldwide</p>
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

      {/* Problem/Solution Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              The Problem
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Traditional Hiring is Broken
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              HR teams spend 23+ hours per week on manual resume screening. 75% of qualified candidates are missed due to keyword-based filtering. It's time for a smarter approach.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Clock, stat: "23 hrs/week", desc: "Spent on manual screening" },
              { icon: Users, stat: "75%", desc: "Qualified candidates missed" },
              { icon: TrendingUp, stat: "45 days", desc: "Average time-to-hire" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center p-8 shadow-soft border-destructive/20 bg-destructive/5">
                  <item.icon className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <p className="text-3xl font-bold text-destructive mb-2">{item.stat}</p>
                  <p className="text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              The Solution
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ResumeAI: Your AI-Powered HR Department
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Let AI handle the heavy lifting. Screen thousands of resumes instantly, identify top candidates with precision, and make data-driven hiring decisions.
            </p>
          </motion.div>
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
              Enterprise-Grade Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transform your hiring process
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
              From upload to hire in 4 simple steps
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

      {/* Enterprise Features */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {enterpriseFeatures.map((feature, index) => (
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

      {/* Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by HR Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how companies are transforming their hiring with ResumeAI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-8 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-border">
                      <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  Ready to Transform Your Hiring?
                </h2>
                <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                  Join thousands of companies using AI to hire smarter, faster, and more fairly.
                  Start your free trial today—no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="shadow-medium text-lg px-10 py-6">
                    <Link to="/auth">
                      Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg px-10 py-6 bg-transparent border-white/30 text-white hover:bg-white/10">
                    <Link to="/chatbot">
                      Schedule Demo
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
