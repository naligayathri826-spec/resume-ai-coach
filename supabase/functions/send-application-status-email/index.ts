import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface StatusEmailRequest {
  candidateEmail: string;
  candidateName?: string;
  jobTitle: string;
  companyName: string;
  newStatus: string;
}

const statusConfig: Record<string, { label: string; color: string; emoji: string; message: string }> = {
  reviewing: { label: "Under Review", color: "#3b82f6", emoji: "🔍", message: "Your application is currently being reviewed by the hiring team." },
  shortlisted: { label: "Shortlisted", color: "#10b981", emoji: "⭐", message: "Congratulations! You've been shortlisted for the next stage." },
  interview: { label: "Interview Stage", color: "#8b5cf6", emoji: "🎤", message: "Great news! You've been selected for an interview. The recruiter will reach out with scheduling details." },
  rejected: { label: "Not Selected", color: "#ef4444", emoji: "📋", message: "Thank you for your interest. Unfortunately, the team has decided to move forward with other candidates at this time." },
  hired: { label: "Hired!", color: "#22c55e", emoji: "🎉", message: "Congratulations! You've been selected for the role!" },
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - no API key" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { candidateEmail, candidateName, jobTitle, companyName, newStatus }: StatusEmailRequest = await req.json();

    if (!candidateEmail) throw new Error("Candidate email is required");

    const config = statusConfig[newStatus] || { label: newStatus, color: "#6b7280", emoji: "📌", message: "Your application status has been updated." };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${config.emoji} Application Update</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">${jobTitle} at ${companyName}</p>
        </div>
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <p style="font-size: 16px;">Hi${candidateName ? ` ${candidateName}` : ""},</p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid ${config.color};">
            <p style="font-weight: 700; font-size: 18px; color: ${config.color}; margin: 0 0 8px 0;">${config.label}</p>
            <p style="margin: 0; color: #475569;">${config.message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">This email was sent by ResumeAI.</p>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ResumeAI <onboarding@resend.dev>",
        to: [candidateEmail],
        subject: `${config.emoji} Application Update: ${jobTitle} at ${companyName}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await response.json();
    if (!response.ok) throw new Error(emailResponse.message || "Failed to send email");

    console.log("Application status email sent:", emailResponse);
    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-application-status-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
