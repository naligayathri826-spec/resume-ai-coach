import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InterviewEmailRequest {
  recruiterEmail: string;
  recruiterName?: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: string;
  location?: string;
  notes?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - skipping email");
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - no API key" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const {
      recruiterEmail,
      recruiterName,
      candidateName,
      jobTitle,
      companyName,
      scheduledAt,
      durationMinutes,
      interviewType,
      location,
      notes,
    }: InterviewEmailRequest = await req.json();

    if (!recruiterEmail) {
      throw new Error("Recruiter email is required");
    }

    const date = new Date(scheduledAt);
    const formattedDate = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const typeLabel = interviewType === "video_call" ? "📹 Video Call" : interviewType === "phone" ? "📞 Phone Screen" : "🏢 In Person";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📅 Interview Scheduled</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">${jobTitle} at ${companyName}</p>
        </div>
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <p style="font-size: 16px;">Hi${recruiterName ? ` ${recruiterName}` : ""},</p>
          <p style="font-size: 16px;">An interview has been scheduled with the following details:</p>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 130px;">Candidate</td><td style="padding: 8px 0; font-weight: 600;">${candidateName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0; font-weight: 600;">${formattedDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0; font-weight: 600;">${formattedTime}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Duration</td><td style="padding: 8px 0; font-weight: 600;">${durationMinutes} minutes</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Type</td><td style="padding: 8px 0; font-weight: 600;">${typeLabel}</td></tr>
              ${location ? `<tr><td style="padding: 8px 0; color: #64748b;">Location</td><td style="padding: 8px 0; font-weight: 600;">${location}</td></tr>` : ""}
            </table>
          </div>
          
          ${notes ? `<div style="margin-bottom: 24px;"><h3 style="font-size: 16px; margin-bottom: 8px; color: #1e3a5f;">Notes</h3><p style="color: #64748b; font-style: italic;">"${notes}"</p></div>` : ""}
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">This email was sent by ResumeAI Interview Scheduler.</p>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ResumeAI <onboarding@resend.dev>",
        to: [recruiterEmail],
        subject: `📅 Interview Scheduled: ${candidateName} for ${jobTitle}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Interview notification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-interview-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
