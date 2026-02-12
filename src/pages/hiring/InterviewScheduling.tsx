import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, parseISO, setHours, setMinutes } from "date-fns";
import {
  CalendarDays, Clock, Video, Phone, MapPin, Plus, Trash2,
  ChevronLeft, User, Briefcase, CheckCircle, AlertCircle, Star, MessageSquare
} from "lucide-react";
import Footer from "@/components/Footer";

interface Interview {
  id: string;
  candidate_id: string;
  job_id: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: string;
  location: string | null;
  notes: string | null;
  status: string;
  feedback: string | null;
  rating: number | null;
  candidate_name?: string;
  candidate_email?: string;
}

interface Candidate {
  id: string;
  candidate_name: string | null;
  candidate_email: string | null;
  file_name: string;
  ai_score: number | null;
  fit_category: string | null;
}

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

const interviewTypes = [
  { value: "video_call", label: "Video Call", icon: Video },
  { value: "phone", label: "Phone Screen", icon: Phone },
  { value: "in_person", label: "In Person", icon: MapPin },
];

const InterviewScheduling = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState<Interview | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(3);

  // Form state
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedType, setSelectedType] = useState("video_call");
  const [duration, setDuration] = useState("60");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    if (!jobId) return;
    try {
      const [jobRes, candidatesRes, interviewsRes] = await Promise.all([
        supabase.from("hiring_jobs").select("*").eq("id", jobId).single(),
        supabase.from("candidates").select("id, candidate_name, candidate_email, file_name, ai_score, fit_category").eq("job_id", jobId),
        supabase.from("interviews").select("*").eq("job_id", jobId).order("scheduled_at", { ascending: true }),
      ]);

      if (jobRes.error) throw jobRes.error;
      setJob(jobRes.data);
      setCandidates((candidatesRes.data || []) as Candidate[]);

      const enriched = (interviewsRes.data || []).map((iv: any) => {
        const cand = candidatesRes.data?.find((c: any) => c.id === iv.candidate_id);
        return { ...iv, candidate_name: cand?.candidate_name, candidate_email: cand?.candidate_email };
      });
      setInterviews(enriched);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInterviewEmail = async (candidateName: string, scheduledAt: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email || !job) return;

      await supabase.functions.invoke("send-interview-email", {
        body: {
          recruiterEmail: user.email,
          candidateName: candidateName || "Unknown Candidate",
          jobTitle: job.job_title,
          companyName: job.company_name,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: parseInt(duration),
          interviewType: selectedType,
          location: location || undefined,
          notes: notes || undefined,
        },
      });
    } catch (err) {
      console.error("Failed to send interview email:", err);
    }
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedCandidate || !jobId) return;
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "You must be signed in", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const [hours, mins] = selectedTime.split(":").map(Number);
    const scheduledAt = setMinutes(setHours(selectedDate, hours), mins);

    const { error } = await supabase.from("interviews").insert({
      job_id: jobId,
      candidate_id: selectedCandidate,
      user_id: user.id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parseInt(duration),
      interview_type: selectedType,
      location: location || null,
      notes: notes || null,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to schedule interview", variant: "destructive" });
    } else {
      const cand = candidates.find((c) => c.id === selectedCandidate);
      toast({ title: "Interview Scheduled", description: `Interview set for ${format(scheduledAt, "PPP 'at' p")}` });
      
      // Send email notification
      sendInterviewEmail(cand?.candidate_name || cand?.file_name || "Unknown", scheduledAt);

      setDialogOpen(false);
      resetForm();
      fetchData();
    }
    setIsSaving(false);
  };

  const handleMarkCompleted = (interview: Interview) => {
    setFeedbackInterview(interview);
    setFeedbackText(interview.feedback || "");
    setFeedbackRating(interview.rating || 3);
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackInterview) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("interviews")
      .update({
        status: "completed",
        feedback: feedbackText || null,
        rating: feedbackRating,
      })
      .eq("id", feedbackInterview.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update interview", variant: "destructive" });
    } else {
      toast({ title: "Interview Completed", description: "Feedback saved successfully" });
      setFeedbackDialogOpen(false);
      setFeedbackInterview(null);
      fetchData();
    }
    setIsSaving(false);
  };

  const handleCancel = async (interviewId: string) => {
    const { error } = await supabase.from("interviews").update({ status: "cancelled" }).eq("id", interviewId);
    if (!error) {
      toast({ title: "Interview Cancelled" });
      fetchData();
    }
  };

  const handleDelete = async (interviewId: string) => {
    const { error } = await supabase.from("interviews").delete().eq("id", interviewId);
    if (!error) {
      toast({ title: "Interview Deleted" });
      fetchData();
    }
  };

  const resetForm = () => {
    setSelectedCandidate("");
    setSelectedTime("09:00");
    setSelectedType("video_call");
    setDuration("60");
    setLocation("");
    setNotes("");
  };

  const interviewsOnSelectedDate = interviews.filter(
    (iv) => selectedDate && isSameDay(parseISO(iv.scheduled_at), selectedDate)
  );

  const interviewDates = interviews
    .filter((iv) => iv.status !== "cancelled")
    .map((iv) => parseISO(iv.scheduled_at));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    const found = interviewTypes.find((t) => t.value === type);
    if (!found) return <Video className="w-4 h-4" />;
    const Icon = found.icon;
    return <Icon className="w-4 h-4" />;
  };

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${interactive ? "cursor-pointer" : ""} ${
            star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
          }`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => navigate(`/hiring/dashboard/${jobId}`)} className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <CalendarDays className="w-8 h-8 text-primary" />
                  Interview Scheduling
                </h1>
                {job && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {job.job_title} at {job.company_name}
                  </p>
                )}
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" /> Schedule Interview
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Schedule New Interview</DialogTitle>
                    <DialogDescription>Select a candidate, date, and time for the interview.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Candidate</Label>
                      <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                        <SelectTrigger><SelectValue placeholder="Select a candidate" /></SelectTrigger>
                        <SelectContent>
                          {candidates.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <span className="flex items-center gap-2">
                                {c.candidate_name || c.file_name}
                                {c.ai_score !== null && (
                                  <span className="text-xs text-muted-foreground">Score: {c.ai_score}</span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="rounded-md border mx-auto"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interview Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {interviewTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Location / Meeting Link</Label>
                      <Input placeholder="e.g. Zoom link or office address" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Interview focus areas, preparation notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSchedule} disabled={!selectedCandidate || !selectedDate || isSaving}>
                      {isSaving ? "Scheduling..." : "Schedule Interview"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Feedback Dialog */}
          <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Complete Interview & Add Feedback</DialogTitle>
                <DialogDescription>
                  Rate the candidate and add your interview notes for {feedbackInterview?.candidate_name || "this candidate"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  {renderStars(feedbackRating, true, setFeedbackRating)}
                  <p className="text-xs text-muted-foreground">
                    {feedbackRating === 1 ? "Poor" : feedbackRating === 2 ? "Below Average" : feedbackRating === 3 ? "Average" : feedbackRating === 4 ? "Good" : "Excellent"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea
                    placeholder="How did the interview go? Key takeaways, strengths, concerns..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitFeedback} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Mark as Completed"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{interviews.filter((i) => i.status === "scheduled").length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{interviews.filter((i) => i.status === "completed").length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-sm text-muted-foreground">Candidates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{interviewsOnSelectedDate.length}</p>
                <p className="text-sm text-muted-foreground">Selected Day</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar + Day view */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Calendar</CardTitle>
                <CardDescription>Select a date to view scheduled interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ hasInterview: interviewDates }}
                  modifiersClassNames={{ hasInterview: "bg-primary/20 font-bold" }}
                  className="rounded-md border pointer-events-auto"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                </CardTitle>
                <CardDescription>
                  {interviewsOnSelectedDate.length} interview{interviewsOnSelectedDate.length !== 1 ? "s" : ""} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {interviewsOnSelectedDate.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No interviews scheduled for this date</p>
                    <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Schedule One
                    </Button>
                  </div>
                ) : (
                  interviewsOnSelectedDate.map((iv) => (
                    <motion.div key={iv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      <Card className={`border-l-4 ${
                        iv.status === "cancelled" ? "border-l-muted opacity-60" :
                        iv.status === "completed" ? "border-l-green-500" : "border-l-primary"
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                <span className="font-medium">{iv.candidate_name || "Unknown Candidate"}</span>
                                {getStatusBadge(iv.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(parseISO(iv.scheduled_at), "h:mm a")} · {iv.duration_minutes} min
                                </span>
                                <span className="flex items-center gap-1">
                                  {getTypeIcon(iv.interview_type)}
                                  {interviewTypes.find((t) => t.value === iv.interview_type)?.label}
                                </span>
                              </div>
                              {iv.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {iv.location}
                                </p>
                              )}
                              {iv.notes && (
                                <p className="text-sm text-muted-foreground mt-1 italic">"{iv.notes}"</p>
                              )}
                              
                              {/* Feedback display for completed interviews */}
                              {iv.status === "completed" && (iv.feedback || iv.rating) && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Interview Feedback</span>
                                  </div>
                                  {iv.rating && renderStars(iv.rating)}
                                  {iv.feedback && (
                                    <p className="text-sm text-muted-foreground">{iv.feedback}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              {iv.status === "scheduled" && (
                                <>
                                  <Button variant="default" size="sm" onClick={() => handleMarkCompleted(iv)}>
                                    <CheckCircle className="w-4 h-4 mr-1" /> Complete
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleCancel(iv.id)}>
                                    Cancel
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(iv.id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {iv.status === "completed" && (
                                <Button variant="outline" size="sm" onClick={() => handleMarkCompleted(iv)}>
                                  Edit Feedback
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterviewScheduling;
