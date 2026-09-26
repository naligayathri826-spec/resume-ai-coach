import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only the scheduler may run this job: verify the shared secret stored server-side
    const provided = req.headers.get("x-cron-secret") ?? "";
    const { data: secretRow } = await supabase
      .from("internal_job_secrets")
      .select("value")
      .eq("name", "send-interview-reminders")
      .maybeSingle();
    const expected = secretRow?.value ?? "";
    let diff = provided.length ^ expected.length;
    for (let i = 0; i < Math.min(provided.length, expected.length); i++) {
      diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (!expected || diff !== 0) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - no API key" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourPlus5 = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFourPlus5 = new Date(twentyFourHoursFromNow.getTime() + 5 * 60 * 1000);

    // Find interviews in the 1-hour window
    const { data: oneHourInterviews } = await supabase
      .from("interviews")
      .select("*, candidates(candidate_name, candidate_email), hiring_jobs(job_title, company_name)")
      .eq("status", "scheduled")
      .gte("scheduled_at", oneHourFromNow.toISOString())
      .lt("scheduled_at", oneHourPlus5.toISOString());

    // Find interviews in the 24-hour window
    const { data: twentyFourHourInterviews } = await supabase
      .from("interviews")
      .select("*, candidates(candidate_name, candidate_email), hiring_jobs(job_title, company_name)")
      .eq("status", "scheduled")
      .gte("scheduled_at", twentyFourHoursFromNow.toISOString())
      .lt("scheduled_at", twentyFourPlus5.toISOString());

    const allInterviews = [
      ...(oneHourInterviews || []).map((i: any) => ({ ...i, reminderType: "1_hour" })),
      ...(twentyFourHourInterviews || []).map((i: any) => ({ ...i, reminderType: "24_hours" })),
    ];

    let sentCount = 0;

    for (const interview of allInterviews) {
      // Get recruiter email from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", interview.user_id)
        .single();

      if (!profile?.email) continue;

      const date = new Date(interview.scheduled_at);
      const formattedDate = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const esc = (s: unknown) => String(s ?? "").slice(0, 500)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      const rawCandidateName = String(interview.candidates?.candidate_name || "Unknown Candidate").replace(/[\r\n]+/g, " ").slice(0, 100);
      const candidateName = esc(rawCandidateName);
      const jobTitle = esc(interview.hiring_jobs?.job_title || "Open Position");
      const companyName = esc(interview.hiring_jobs?.company_name || "");
      interview.location = interview.location ? esc(interview.location) : null;
      interview.notes = interview.notes ? esc(interview.notes) : null;
      interview.duration_minutes = Number(interview.duration_minutes) || 60;
      const isOneHour = interview.reminderType === "1_hour";

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, ${isOneHour ? "#dc2626" : "#1e3a5f"} 0%, ${isOneHour ? "#ea580c" : "#3b82f6"} 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">
              ${isOneHour ? "⏰ Interview in 1 Hour!" : "📅 Interview Tomorrow"}
            </h1>
          </div>
          <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px;">You have an interview ${isOneHour ? "starting in 1 hour" : "scheduled for tomorrow"}:</p>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b;">Candidate</td><td style="padding: 6px 0; font-weight: 600;">${candidateName}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Position</td><td style="padding: 6px 0; font-weight: 600;">${jobTitle}${companyName ? ` at ${companyName}` : ""}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Date & Time</td><td style="padding: 6px 0; font-weight: 600;">${formattedDate} at ${formattedTime}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Duration</td><td style="padding: 6px 0; font-weight: 600;">${interview.duration_minutes} minutes</td></tr>
                ${interview.location ? `<tr><td style="padding: 6px 0; color: #64748b;">Location</td><td style="padding: 6px 0; font-weight: 600;">${interview.location}</td></tr>` : ""}
              </table>
            </div>
            ${interview.notes ? `<p style="color: #64748b; font-style: italic;">"${interview.notes}"</p>` : ""}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">ResumeAI Interview Reminder</p>
          </div>
        </body>
        </html>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ResumeAI <onboarding@resend.dev>",
          to: [profile.email],
          subject: isOneHour
            ? `⏰ Interview with ${rawCandidateName} starts in 1 hour!`
            : `📅 Reminder: Interview with ${rawCandidateName} tomorrow`,
          html: emailHtml,
        }),
      });

      if (res.ok) sentCount++;
    }

    console.log(`Sent ${sentCount} reminder emails`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: allInterviews.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-interview-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
