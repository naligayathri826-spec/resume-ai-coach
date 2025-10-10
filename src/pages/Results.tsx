import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, MessageSquare, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Results = () => {
  const skills = [
    { name: "React", level: 85, status: "strong" },
    { name: "TypeScript", level: 75, status: "strong" },
    { name: "Node.js", level: 60, status: "moderate" },
    { name: "Python", level: 40, status: "needs-improvement" },
    { name: "Machine Learning", level: 25, status: "needs-improvement" },
  ];

  const jobMatches = [
    { title: "Senior Frontend Developer", company: "Tech Corp", match: 92, salary: "$120k - $150k" },
    { title: "Full Stack Engineer", company: "StartupXYZ", match: 85, salary: "$110k - $140k" },
    { title: "React Developer", company: "Digital Agency", match: 78, salary: "$90k - $120k" },
  ];

  const improvements = [
    "Add Python and Machine Learning skills to increase job matches by 15%",
    "Include more quantifiable achievements in your experience section",
    "Add certifications to strengthen your technical profile",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Resume Analysis Results
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's what our AI found in your resume
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-soft animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">85%</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">12</div>
                <p className="text-sm text-muted-foreground">Skills Detected</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">47</div>
                <p className="text-sm text-muted-foreground">Job Matches</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Skills Overview */}
            <Card className="shadow-medium animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Skills Overview
                </CardTitle>
                <CardDescription>
                  Analysis of your technical and professional skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Job Matches */}
            <Card className="shadow-medium animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Top Job Matches
                </CardTitle>
                <CardDescription>
                  Jobs that match your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {jobMatches.map((job, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:shadow-soft transition-smooth">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge className="gradient-primary">{job.match}% Match</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.salary}</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Apply Now
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Improvement Tips */}
          <Card className="shadow-medium mt-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Resume Improvement Tips
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to enhance your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {improvements.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-foreground text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="gradient-primary flex-1 shadow-medium">
              <Download className="mr-2 h-5 w-5" />
              Download Report
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to="/chatbot">
                <MessageSquare className="mr-2 h-5 w-5" />
                Get AI Advice
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
