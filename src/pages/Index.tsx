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
      icon: Search,
      title: "AI Skill Analysis",
      description: "Advanced AI analyzes your resume to identify key skills, experience, and areas for improvement.",
      image: featureAnalysis,
    },
    {
      icon: Briefcase,
      title: "Smart Job Matching",
      description: "Get matched with jobs that perfectly align with your skills and experience.",
      image: featureMatching,
    },
    {
      icon: MessageSquare,
      title: "AI Resume Coach",
      description: "24/7 AI assistant to help you improve your resume and answer career questions.",
      image: featureChatbot,
    },
    {
      icon: BarChart3,
      title: "Visual Reports",
      description: "Beautiful, detailed analytics showing your resume's strengths and opportunities.",
      image: featureReports,
    },
  ];

  const stats = [
    { value: "50K+", label: "Resumes Analyzed" },
    { value: "95%", label: "User Satisfaction" },
    { value: "30%", label: "Interview Rate Increase" },
    { value: "24/7", label: "AI Support" },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Software Engineer",
      content: "This tool helped me land my dream job at a top tech company. The AI feedback was incredibly detailed and actionable.",
      avatar: "SM",
    },
    {
      name: "James K.",
      role: "Marketing Manager",
      content: "I was skeptical at first, but the resume analysis pointed out issues I never noticed. Got 3 interviews within a week!",
      avatar: "JK",
    },
    {
      name: "Emily R.",
      role: "Recent Graduate",
      content: "As a new grad, I had no idea how to write a professional resume. The AI coach guided me through every step.",
      avatar: "ER",
    },
  ];

  const howItWorks = [
    { step: 1, title: "Upload Resume", description: "Simply upload your resume in PDF or Word format" },
    { step: 2, title: "AI Analysis", description: "Our AI analyzes every section of your resume" },
    { step: 3, title: "Get Insights", description: "Receive detailed feedback and improvement suggestions" },
    { step: 4, title: "Apply & Succeed", description: "Use insights to create a winning resume" },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 gradient-hero opacity-5 -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Resume Analysis
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Transform Your Resume with{" "}
                <span className="text-transparent bg-clip-text gradient-primary">
                  AI Precision
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Get instant feedback, skill analysis, and perfect job matches powered by
                cutting-edge artificial intelligence. Stand out from the crowd.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gradient-primary shadow-large hover:shadow-medium transition-smooth text-lg px-8">
                  <Link to="/auth">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg">
                  <Link to="/chatbot">Try AI Coach</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Instant analysis
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 gradient-primary opacity-20 blur-2xl rounded-3xl" />
              <img
                src={heroImage}
                alt="AI Resume Analysis Dashboard"
                className="relative rounded-2xl shadow-large w-full border border-border"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-large border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Resume Score</p>
                    <p className="text-2xl font-bold text-green-500">92/100</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
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
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Your Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create the perfect resume and land your dream job
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
      <section className="py-20 bg-muted/30">
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
              Get your resume analyzed in just 4 simple steps
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
                <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
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
              Loved by Job Seekers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience
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
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
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

      {/* Trust Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Zap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instant Results</h3>
                <p className="text-sm text-muted-foreground">Get analysis in seconds</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Expert AI</h3>
                <p className="text-sm text-muted-foreground">Trained on millions of resumes</p>
              </div>
            </motion.div>
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
              <CardContent className="p-12 md:p-16 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Ready to Get Hired Faster?
                </h2>
                <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of job seekers who have improved their resumes and landed
                  better jobs with our AI-powered platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="shadow-medium text-lg px-8">
                    <Link to="/auth">
                      Start Free Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <p className="text-sm mt-6 opacity-80">
                  Free account • No credit card required • Cancel anytime
                </p>
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
