import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "application/msword" || droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setFile(droppedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOC file.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a resume file first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate analysis
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Analysis complete!",
        description: "Your resume has been analyzed successfully.",
      });
      navigate("/results");
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Upload Your Resume
            </h1>
            <p className="text-lg text-muted-foreground">
              Get instant AI-powered analysis and feedback on your resume
            </p>
          </div>

          <Card className="shadow-medium animate-fade-in">
            <CardHeader>
              <CardTitle>Select Your Resume</CardTitle>
              <CardDescription>
                Upload a PDF or DOC file (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-smooth ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-16 w-16 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-1">
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setFile(null)}
                      disabled={isUploading}
                    >
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center">
                        <UploadIcon className="h-10 w-10 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">
                        Drag and drop your resume here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">or</p>
                      <label htmlFor="file-upload">
                        <Button variant="outline" asChild>
                          <span className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            Browse Files
                          </span>
                        </Button>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="mt-6 space-y-2 animate-fade-in">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Analyzing your resume...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {file && !isUploading && (
                <div className="mt-6 animate-fade-in">
                  <Button
                    onClick={handleAnalyze}
                    size="lg"
                    className="w-full gradient-primary shadow-medium hover:shadow-large transition-smooth"
                  >
                    Analyze Resume
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 grid md:grid-cols-3 gap-4 animate-fade-in-up">
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  📊 Detailed Analysis
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  🎯 Job Matching
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  💡 AI Suggestions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Upload;
