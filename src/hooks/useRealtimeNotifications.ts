import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/components/NotificationProvider";

/**
 * Subscribes to realtime events and pushes in-app notifications.
 * - Recruiters: notified when a new application is submitted to their jobs
 * - Recruiters: notified when interviews are upcoming (status changes)
 * - Candidates: notified when their application status changes
 */
export function useRealtimeNotifications(userId: string | undefined, userMode: string | null) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!userId) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (userMode === "hiring") {
      // Listen for new applications on recruiter's jobs
      const appChannel = supabase
        .channel("recruiter-new-apps")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "job_applications" },
          async (payload) => {
            // Check if this application is for one of the recruiter's jobs
            const { data: job } = await supabase
              .from("hiring_jobs")
              .select("job_title")
              .eq("id", payload.new.job_id)
              .eq("user_id", userId)
              .single();

            if (job) {
              addNotification({
                title: "New Application Received",
                message: `A candidate applied for ${job.job_title}`,
                type: "info",
              });
            }
          }
        )
        .subscribe();
      channels.push(appChannel);

      // Listen for interview updates
      const ivChannel = supabase
        .channel("recruiter-interviews")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "interviews" },
          (payload) => {
            if (payload.new.user_id === userId && payload.new.status === "completed") {
              addNotification({
                title: "Interview Completed",
                message: "An interview has been marked as completed. Review feedback.",
                type: "success",
              });
            }
          }
        )
        .subscribe();
      channels.push(ivChannel);
    } else {
      // Candidate: listen for application status changes
      const statusChannel = supabase
        .channel("candidate-app-status")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "job_applications" },
          async (payload) => {
            if (payload.new.user_id !== userId) return;
            const statusLabels: Record<string, string> = {
              reviewing: "Under Review",
              shortlisted: "Shortlisted",
              interview: "Interview Stage",
              rejected: "Not Selected",
              hired: "Hired",
            };
            const label = statusLabels[payload.new.status] || payload.new.status;

            const { data: job } = await supabase
              .from("hiring_jobs")
              .select("job_title, company_name")
              .eq("id", payload.new.job_id)
              .single();

            addNotification({
              title: "Application Update",
              message: `${job?.job_title || "Your application"} at ${job?.company_name || "a company"}: ${label}`,
              type: payload.new.status === "rejected" ? "warning" : "success",
            });
          }
        )
        .subscribe();
      channels.push(statusChannel);
    }

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [userId, userMode, addNotification]);
}
