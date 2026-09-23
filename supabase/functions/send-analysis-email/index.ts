import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisEmailRequest {
  email: string;
  userName?: string;
  resumeName: string;
  overallScore: number;
  fieldCategory: string;
  topStrengths: string[];
  analysisUrl: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Internal-only: must be called server-side with the service role key
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "Email notification skipped" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: Partial<AnalysisEmailRequest> = await req.json();
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
    const email = str(body.email, 320);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Valid email is required");
    const userName = escapeHtml(str(body.userName, 100));
    const resumeName = escapeHtml(str(body.resumeName, 200));
    const fieldCategory = escapeHtml(str(body.fieldCategory, 100));
    const scoreNum = Number(body.overallScore);
    const overallScore = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, Math.round(scoreNum))) : 0;
    const topStrengths = Array.isArray(body.topStrengths) ? body.topStrengths.slice(0, 3).map((s) => escapeHtml(str(s, 300))) : [];
    const rawUrl = str(body.analysisUrl, 500);
    const analysisUrl = /^https:\/\//.test(rawUrl) ? escapeHtml(rawUrl) : "#";

    const scoreColor = overallScore >= 80 ? "#22c55e" : overallScore >= 60 ? "#eab308" : "#ef4444";
    const strengthsList = topStrengths.map(s => `<li style="margin-bottom: 8px;">✓ ${s}</li>`).join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Resume Analysis Complete! 🎉</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Your ${resumeName} has been analyzed</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; margin-bottom: 24px;">Hi${userName ? ` ${userName}` : ""},</p>
          
          <p style="font-size: 16px; margin-bottom: 24px;">Great news! Your resume analysis is complete. Here's a quick summary:</p>
          
          <!-- Score Card -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Overall Score</p>
            <div style="font-size: 64px; font-weight: bold; color: ${scoreColor}; line-height: 1;">${overallScore}%</div>
            <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">Field: <strong>${fieldCategory}</strong></p>
          </div>
          
          <!-- Key Strengths -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; margin-bottom: 16px; color: #1e3a5f;">Key Strengths</h3>
            <ul style="margin: 0; padding-left: 0; list-style: none; color: #22c55e;">
              ${strengthsList}
            </ul>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${analysisUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Full Analysis</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
            Want to improve your score? Check out the detailed feedback and personalized suggestions in your analysis report.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This email was sent by ResumeAI. You received this because you submitted a resume for analysis.
          </p>
        </div>
      </body>
      </html>
    `;

    // Use Resend API directly via fetch
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ResumeAI <onboarding@resend.dev>",
        to: [email],
        subject: `🎯 Your Resume Analysis is Ready - Score: ${overallScore}%`,
        html: emailHtml,
      }),
    });

    const emailResponse = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Analysis notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-analysis-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
