import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Search, Briefcase, MessageSquare, BarChart3, UserPlus, LogIn, Shield, Zap, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-image.jpg";
import featureAnalysis from "@/assets/feature-analysis.jpg";
import featureMatching from "@/assets/feature-matching.jpg";
import featureChatbot from "@/assets/feature-chatbot.jpg";
import featureReports from "@/assets/feature-reports.jpg";

const Index = () => {
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
      title: "Chatbot Resume Advisor",
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

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10 -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Analyze Your Resume with{" "}
                <span className="text-transparent bg-clip-text gradient-primary">
                  AI Precision
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Get instant feedback, skill analysis, and perfect job matches powered by
                advanced artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gradient-primary shadow-medium hover:shadow-large transition-smooth">
                  <Link to="/upload">
                    Upload Resume <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/chatbot">Try Chatbot</Link>
                </Button>
              </div>
            </div>
            <div className="animate-fade-in">
              <img
                src={heroImage}
                alt="AI Resume Analysis Dashboard"
                className="rounded-2xl shadow-large w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Your Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create the perfect resume and land your dream job
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="shadow-soft hover:shadow-medium transition-smooth border-border bg-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 relative">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="absolute -top-2 -left-2 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sign In Section */}
      <section className="py-16 md:py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Start Your Journey Today
              </h2>
              <p className="text-lg text-muted-foreground">
                Create a free account to unlock all features and start analyzing your resume
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="shadow-soft border-border bg-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-border bg-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Instant Access</h3>
                  <p className="text-sm text-muted-foreground">Get started in seconds, no waiting</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-border bg-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Save Progress</h3>
                  <p className="text-sm text-muted-foreground">Access your analyses anytime</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-large border-border bg-card animate-fade-in">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Already have an account?
                    </h3>
                    <p className="text-muted-foreground mb-4 md:mb-0">
                      Sign in to continue analyzing your resume
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" variant="outline" className="gap-2">
                      <Link to="/auth">
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild size="lg" className="gradient-primary shadow-medium gap-2">
                      <Link to="/auth">
                        <UserPlus className="h-5 w-5" />
                        Create Account
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="gradient-hero text-primary-foreground shadow-large animate-fade-in-up">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Hired Faster?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of job seekers who have improved their resumes and landed
                better jobs with our AI-powered platform.
              </p>
              <Button asChild size="lg" variant="secondary" className="shadow-medium">
                <Link to="/upload">
                  Upload Your Resume Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
