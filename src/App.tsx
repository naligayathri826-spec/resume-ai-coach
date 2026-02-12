import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationProvider, NotificationBell } from "@/components/NotificationProvider";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import Chatbot from "./pages/Chatbot";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import ModeSelection from "./pages/ModeSelection";
import JobsList from "./pages/hiring/JobsList";
import JobIntake from "./pages/hiring/JobIntake";
import CandidateUpload from "./pages/hiring/CandidateUpload";
import RecruiterDashboard from "./pages/hiring/RecruiterDashboard";
import InterviewScheduling from "./pages/hiring/InterviewScheduling";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="resume-analyzer-theme">
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider defaultOpen>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2">
                      <NotificationBell />
                      <ThemeToggle />
                    </div>
                  </div>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/mode-selection" element={<ModeSelection />} />
                    <Route path="/hiring/jobs" element={<JobsList />} />
                    <Route path="/hiring/new" element={<JobIntake />} />
                    <Route path="/hiring/candidates/:jobId" element={<CandidateUpload />} />
                    <Route path="/hiring/dashboard/:jobId" element={<RecruiterDashboard />} />
                    <Route path="/hiring/interviews/:jobId" element={<InterviewScheduling />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
