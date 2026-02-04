import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, CheckCircle, Loader2, ArrowRight, Users } from "lucide-react";
import Footer from "@/components/Footer";
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import mammoth from 'mammoth/mammoth.browser';

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  content?: string;
  error?: string;
}

const CandidateUpload = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    if (!jobId) return;
    const { data, error } = await supabase
      .from("hiring_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Job not found",
        variant: "destructive",
      });
      navigate("/hiring/jobs");
      return;
    }
    setJob(data);
  };

  const extractText = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str ?? item.text ?? "");
        text += strings.join(" ") + "\n";
      }
      return text.replace(/\u0000/g, "").trim();
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.replace(/\u0000/g, "").trim();
    }
    return await file.text();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === "application/pdf" || 
           f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      file,
      status: "pending"
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processAndUpload = async () => {
    if (!jobId || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
      return;
    }

    let processed = 0;
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const uploadedFile = files[i];
      
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: "uploading" } : f
      ));

      try {
        const content = await extractText(uploadedFile.file);
        
        if (!content) {
          throw new Error("Could not extract text from file");
        }

        const { error } = await supabase.from("candidates").insert({
          job_id: jobId,
          user_id: user.id,
          resume_content: content,
          file_name: uploadedFile.file.name,
        });

        if (error) throw error;

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "success", content } : f
        ));
      } catch (error: any) {
        console.error("Error processing file:", error);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "error", error: error.message } : f
        ));
      }

      processed++;
      setProgress(Math.round((processed / total) * 100));
    }

    setIsProcessing(false);

    const successCount = files.filter(f => f.status === "success").length;
    if (successCount > 0) {
      toast({
        title: "Upload Complete!",
        description: `${successCount} resume(s) uploaded successfully.`,
      });
    }
  };

  const analyzeAllCandidates = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-candidates', {
        body: { jobId }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete!",
        description: "All candidates have been ranked.",
      });

      navigate(`/hiring/dashboard/${jobId}`);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze candidates",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const successCount = files.filter(f => f.status === "success").length;
  const allUploaded = files.length > 0 && files.every(f => f.status === "success" || f.status === "error");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge variant="secondary" className="mb-4">
              Step 2 of 3
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Upload Candidate Resumes
            </h1>
            {job && (
              <p className="text-muted-foreground">
                {job.job_title} at {job.company_name}
              </p>
            )}
          </motion.div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Resume Upload
              </CardTitle>
              <CardDescription>
                Upload multiple PDF or DOCX files. We'll extract and analyze each one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <p className="text-lg font-semibold mb-2">
                  Drag and drop resumes here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse files (PDF, DOCX)
                </p>
                <label htmlFor="multi-file-upload">
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      <FileText className="mr-2 w-4 h-4" />
                      Select Files
                    </span>
                  </Button>
                </label>
                <input
                  id="multi-file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  multiple
                  onChange={handleFileChange}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {files.length} file(s) selected
                    </h3>
                    {!isProcessing && !allUploaded && (
                      <Button onClick={() => setFiles([])}>Clear All</Button>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {files.map((uploadedFile, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">
                            {uploadedFile.file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadedFile.status === "pending" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {uploadedFile.status === "uploading" && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          )}
                          {uploadedFile.status === "success" && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {uploadedFile.status === "error" && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                          {uploadedFile.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-center text-muted-foreground">
                        Processing... {progress}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                {!allUploaded && files.length > 0 && (
                  <Button
                    className="flex-1 gradient-primary"
                    onClick={processAndUpload}
                    disabled={isProcessing || files.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Upload {files.length} Resume(s)
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}

                {allUploaded && successCount > 0 && (
                  <Button
                    className="flex-1 gradient-primary"
                    onClick={analyzeAllCandidates}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Analyzing Candidates...
                      </>
                    ) : (
                      <>
                        Analyze & Rank {successCount} Candidate(s)
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CandidateUpload;